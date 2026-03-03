# Overview

## Goal

Wait-Light is a virtual queue SaaS application ("Scan & Go"). It allows retail customers to join a queue via a QR Code and track their progress in real-time on their smartphone, freeing them from physical waiting on site.

## Users / Roles

- **Merchant (Admin)**: Creates their business, manages the queue (calls the next customer, cancels, closes the queue), and accesses footfall statistics.

- **Customer**: Scans the QR Code, joins the queue with their first name/nickname, and receives a visual/audio notification when their turn approaches.

- **System**: Manages WebSockets for instantaneous updating of queue positions.

# Technical Stack

## Frontend

- **Framework: Next.js (App Router)**. Justification: SSR for the merchant dashboard and a PWA (Progressive Web App) version so customers don't have to install anything.

- **Real-time UI**: Framer Motion. Justification: For smooth transitions when customers "move up" in the queue (Frontend Requirement).

- **State Management**: TanStack Query (React Query). Justification: Perfect cache management and server synchronization.

## Backend

- **BaaS**: Supabase. Justification: Intensive use of Supabase Realtime (Postgres Changes) to avoid page refreshes.

- **Notifications**: Web Push API or Resend. Justification: Alert the customer even if their phone is locked or asleep.

- **Logic**: Edge Functions to validate inputs and handle the unique "ticket" logic.

## DevOps

- **Hosting**: Vercel for the frontend, Supabase for data.

- **Monitoring**: Sentry for production error tracking (Performance/Quality criteria).

- **Security**: Rate Limiting on ticket creation to prevent a prankster from filling the queue remotely (Security Severity).

## Mobile First Strategy (UX/UI)

- **Offline Resilience**: Graceful handling of connection loss (dead zones in stores) with automatic reconnection attempts (`supabase.channel().subscribe()` with exponential backoff) and immediate visual feedback ("Connection lost - Reconnecting..." banner).

- **Touch Targets**: All interactive elements will adhere to a minimum size of 44×44px to accommodate "thumb" touch usage.

- **Screen Wake Lock API**: Prevent the phone from going to sleep while the customer is in the active queue.
    - ⚠️ **Fallback**: Not supported on iOS < 16.4. Provide a transparent 1×1px video looping (`<video autoplay loop muted playsInline>`) as a widely used polyfill, with a UX warning if neither works.

- **Web Push Priority**: Prioritize native Web Push notifications over email (too slow) to alert the customer "It's your turn".
    - ⚠️ **iOS Limit**: Web Push is only supported on iOS Safari since iOS 16.4, and **only if the PWA is installed from the home screen** (not from the browser). Mandatory fallback: if `Notification.permission` is not granted or unsupported, the page stays open and uses `AudioContext` + `navigator.vibrate()` to alert locally.

- **PWA & Service Worker**: The application must be declared installable (full `manifest.json` file) and have a Service Worker to:
    1. Cache static assets (_Cache First_ strategy).
    2. Handle receiving Web Push notifications in the background.
    3. Display a dedicated offline page if initial navigation fails.
    - Use `next-pwa` or manual Workbox configuration (Next.js does not handle SW natively).

# Core Features

## Data Model (Supabase Postgres)

### Tables

| Table                | Key columns                                                                                                                                             | Description                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `merchants`          | `id` (PK), `name`, `slug` (Unique), `is_open` (Bool), `avg_wait_time` (calculated), `logo_url` (nullable), `default_prep_time_min` (default 5)          | Business info and queue state. `avg_wait_time` is updated by a **Postgres trigger** on every `called → done` transition, not manually. `logo_url` stores the public URL of the Supabase Storage object. `default_prep_time_min` is used for wait time estimation when no historical data is available. |
| `queue_items`        | `id` (PK, UUID v4), `merchant_id` (FK), `customer_name`, `status` (`waiting`/`called`/`done`/`cancelled`), `joined_at`, `called_at`, `done_at`          | The "tickets" in the queue. `done_at` is needed to calculate the actual service duration.                                                                                                                                                                                                              |
| `settings`           | `merchant_id` (FK), `max_capacity`, `welcome_message`, `qr_regenerated_at`, `notifications_enabled` (default true), `auto_close_enabled` (default true) | Custom configuration. `notifications_enabled` gates Web Push delivery. `auto_close_enabled` controls the 5-min auto-done trigger. `qr_regenerated_at` allows the merchant to regenerate their QR Code.                                                                                                 |
| `push_subscriptions` | `id` (PK), `queue_item_id` (FK), `endpoint`, `p256dh`, `auth`, `created_at`                                                                             | Web Push subscriptions associated with a ticket (not an account, as customers are anonymous).                                                                                                                                                                                                          |

> **Mandatory index (performance)**: position in the queue is calculated dynamically via a `COUNT(*)`. Without an index, every recalculation is a full scan on the entire table.
>
> ```sql
> CREATE INDEX idx_queue_items_merchant_status_joined
>   ON queue_items (merchant_id, status, joined_at);
> ```

### RLS

To ensure max security and prevent a customer from seeing who is in another business's queue:

- **`merchants` table**:
    - `SELECT`: Public (allows customers to see if the business is open and accepting people).
    - `UPDATE`: Only for the authenticated merchant (`auth.uid()`).

- **`queue_items` table**:
    - `INSERT`: Allowed for all (allows joining the queue). Protected upstream by the trigger below.
    - `SELECT`:
        1. The merchant sees all tickets for their establishment.
        2. The customer sees **only their own ticket** (via their `id` UUID stored in LocalStorage) AND the number of people ahead of them via a **secure RPC function** — names of other customers are never exposed.
    - `UPDATE`: Only the merchant to change status (`called`, `done`, `cancelled`).

- **`push_subscriptions` table**:
    - `INSERT`: Allowed for all (the customer registers their subscription when joining the queue).
    - `SELECT` / `DELETE`: Only via system Edge Functions (never exposed client-side).

### Postgres Trigger — Last line anti-spam defense

Rate Limiting on Edge Functions can be bypassed by hitting the Supabase REST API directly. This trigger is the final defense:

```sql
CREATE OR REPLACE FUNCTION check_queue_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_cap       INTEGER;
BEGIN
  SELECT max_capacity INTO max_cap
    FROM settings WHERE merchant_id = NEW.merchant_id;

  SELECT COUNT(*) INTO current_count
    FROM queue_items
    WHERE merchant_id = NEW.merchant_id AND status = 'waiting';

  IF current_count >= max_cap THEN
    RAISE EXCEPTION 'Queue is full';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_queue_capacity
  BEFORE INSERT ON queue_items
  FOR EACH ROW EXECUTE FUNCTION check_queue_capacity();
```

## Routes (Next.js App Router)

| Route                     | Role                                                                  | Render         | Auth required    |
| ------------------------- | --------------------------------------------------------------------- | -------------- | ---------------- |
| `/`                       | Public landing page (product presentation)                            | SSR            | No               |
| `/login`                  | Merchant authentication                                               | CSR            | No               |
| `/onboarding`             | Merchant account + `slug` creation                                    | CSR            | Yes (merchant)   |
| `/[slug]`                 | Public business page (QR landing: open/closed status, est. wait time) | SSR            | No               |
| `/[slug]/join`            | Queue joining form (first name + GDPR consent)                        | CSR            | No               |
| `/[slug]/wait/[ticketId]` | Real-time position tracking (customer)                                | CSR + Realtime | No (UUID in URL) |
| `/dashboard`              | Real-time merchant queue                                              | SSR + Realtime | Yes (merchant)   |
| `/dashboard/settings`     | Manage QR Code, max capacity, welcome message                         | SSR            | Yes (merchant)   |
| `/dashboard/stats`        | Footfall statistics                                                   | SSR            | Yes (merchant)   |

> **Security for `/dashboard/*` routes**: protected by a Next.js middleware verifying the Supabase session cookie. Any unauthenticated access attempt redirects to `/login`.

## Business Logic

### QR Code

- The URL encoded in the QR is `/[slug]/join`.
- The QR Code is **generated client-side** (`qrcode.react` lib) from the merchant's `slug`, without database storage (the slug is enough).
- The merchant can **regenerate their QR** from `/dashboard/settings`, which updates `settings.qr_regenerated_at`. Old `/join` links remain functional (same URL), but the action updates the printed visual.

> ⚠️ If the `slug` is compromised (spam), the merchant can **modify** it from settings, physically invalidating the old printed QR Code.

### Ticket Lifecycle

```
[Customer scans QR]
      ↓
  status: waiting        ← Ticket created (INSERT)
      ↓
  status: called         ← Merchant clicks "Call next" (UPDATE by merchant)
      ↓                       → Web Push notification sent to customer
  status: done           ← Merchant clicks "Finish" OR 5 min timeout (UPDATE)
                              → `done_at` filled → trigger recalculates `avg_wait_time`
      ↑ (alternative)
  status: cancelled      ← Merchant cancels OR customer leaves
```

**Rule for `called → done` timeout**: if the merchant does not click "Finish" within 5 minutes after calling, a scheduled Edge Function (`pg_cron` or Supabase Cron Job) automatically transitions the ticket to `done`. This prevents blocking the queue.

### Position Calculation

A customer's position is calculated via a **Postgres RPC function** (not exposed via direct SELECT):

```sql
CREATE OR REPLACE FUNCTION get_position(ticket_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM queue_items
  WHERE merchant_id = (SELECT merchant_id FROM queue_items WHERE id = ticket_id)
    AND status = 'waiting'
    AND joined_at < (SELECT joined_at FROM queue_items WHERE id = ticket_id);
$$ LANGUAGE sql SECURITY DEFINER;
```

### Slug Availability Check

Slug uniqueness is verified via a **Postgres RPC function** (`SECURITY DEFINER`) to prevent brute-force enumeration of existing slugs through the anon key:

```sql
CREATE OR REPLACE FUNCTION check_slug_available(p_slug TEXT, p_exclude_merchant_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM merchants
    WHERE slug = p_slug
      AND (p_exclude_merchant_id IS NULL OR id != p_exclude_merchant_id)
  );
$$;
```

The `p_exclude_merchant_id` parameter lets a merchant re-save their current slug without it being reported as taken.

## Error States

Every error case must have a dedicated page or component — no blank page or raw error exposed to the user:

| Scenario                            | Page / Behavior                                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Inexistent `slug`                   | Custom 404 page "This business does not exist."                                                      |
| Business closed (`is_open = false`) | `/[slug]` page displays "The queue is closed for today." with opening time if available.             |
| Queue full (`max_capacity` reached) | `/[slug]/join` page displays "The queue is full, please return later."                               |
| Invalid or expired `ticketId`       | `/[slug]/wait/[ticketId]` page displays "This ticket is no longer valid." with a link to join again. |
| Realtime connection loss            | Persistent banner + reconnection attempt every 5s (exponential backoff up to 30s).                   |
| Edge Function error (5xx)           | User-friendly error message + automatic Sentry log.                                                  |

## Statistics

The merchant dashboard exposes the following metrics (calculated from `queue_items`):

| Metric                           | Calculation                                                    |
| -------------------------------- | -------------------------------------------------------------- |
| Number of customers served today | `COUNT(*) WHERE status = 'done' AND DATE(done_at) = TODAY`     |
| Average wait time                | `AVG(called_at - joined_at) WHERE status IN ('called','done')` |
| Abandonment rate                 | `COUNT(cancelled) / COUNT(*) * 100`                            |
| Footfall by hour                 | `COUNT(*) GROUP BY EXTRACT(HOUR FROM joined_at)`               |
| Peak frequency                   | Hour with the highest number of `joined_at`                    |

> These metrics are calculated via **Postgres views** (or RPC functions) and cached on the Next.js side with `revalidate` to avoid overloading the database on every render.
