# Overview

## Goal

Wait-Light is a virtual queue SaaS application designed for quick-service merchants such as bakeries, food trucks, and fast-food restaurants.
The workflow is simple and frictionless: the merchant takes the customer's order as usual, then shows a QR code to the customer on their device. The customer scans it to join the virtual queue and tracks their wait status in real-time via a simple web URL on their smartphone, freeing them from the frustration of waiting physically at the counter.

## Users / Roles

- **Merchant (Admin)**: Uses a desktop, tablet, or smartphone device to show the QR Code to the customer. They manage the queue (add/call the next customer, finish, cancel order), configure their settings, and access footfall statistics. The merchant interface must be extremely responsive to adapt to portable point-of-sale devices.

- **Customer**: Uses their smartphone (strictly mobile-first experience) to scan the QR Code shown by the merchant. They join the queue (e.g., entering their first name) without downloading any app, and receive visual/audio notifications when their turn approaches.

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

## UX/UI & Device Strategy

- **Customer (Mobile-First)**: The customer interface is explicitly designed for smartphones. It requires zero installation and must look and feel premium and native.
- **Merchant (Ultra-Responsive)**: While the merchant dashboard is fully functional on desktop, it is heavily optimized for tablets and smartphones. Merchants will physically manipulate these devices during the rush to show the QR code to customers and manage tickets.
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
| `qr_tokens`          | `id` (PK, UUID), `merchant_id` (FK), `nonce` (Unique), `used` (Bool, default false), `created_at`, `expires_at` (default NOW() + 30s)                    | Short-lived, single-use cryptographic tokens embedded in the rotating QR code. Each token is valid for 30 seconds and can only be used once. A cron job purges expired tokens every 5 minutes.                                                                                                         |

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

- **`qr_tokens` table**:
    - `INSERT`: Merchant only (`auth.uid() = merchant_id`) — tokens are generated by the merchant's QR Display page.
    - `SELECT`: Public (anon) for token validation — needed so the join page can check if a token is valid.
    - `UPDATE` (mark `used`): Only via `SECURITY DEFINER` RPC `validate_qr_token(nonce, slug)` — prevents client-side tampering.
    - `DELETE`: System only (Supabase Cron Job cleanup of expired tokens).

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
| `/[slug]`                 | Public business landing page (open/closed status, est. wait time)     | SSR            | No               |
| `/[slug]/join`            | Queue joining form — **requires valid QR token** in URL params        | CSR            | No (token-gated) |
| `/[slug]/wait/[ticketId]` | Real-time position tracking (customer)                                | CSR + Realtime | No (UUID in URL) |
| `/dashboard`              | Real-time merchant queue                                              | SSR + Realtime | Yes (merchant)   |
| `/dashboard/qr-display`   | Fullscreen rotating QR code for customer-facing tablet/kiosk          | CSR            | Yes (merchant)   |
| `/dashboard/settings`     | Max capacity, welcome message, slug management                        | SSR            | Yes (merchant)   |
| `/dashboard/stats`        | Footfall statistics                                                   | SSR            | Yes (merchant)   |

> **Security for `/dashboard/*` routes**: protected by a Next.js middleware verifying the Supabase session cookie. Any unauthenticated access attempt redirects to `/login`.

## Business Logic

### Secure Rotating QR Code

The QR code is the **only way for customers to join the queue**. It is displayed on the merchant's screen and rotates every 15 seconds with a cryptographic one-time token to enforce physical presence.

**How it works:**

1. The merchant opens `/(dashboard)/qr-display` on a tablet or phone facing the customer line.
2. Every **15 seconds**, a Server Action generates a new `qr_token` (cryptographic nonce via `crypto.randomUUID()` + HMAC-SHA256 with `QR_TOKEN_SECRET`).
3. The QR code encodes: `/[slug]/join?token=<nonce>` — the token changes with each rotation.
4. When a customer scans, the `/[slug]/join` page calls the `validate_qr_token` RPC:
   - Checks the token exists for the correct merchant, is not expired (30s TTL), and has not been used.
   - Atomically marks the token as `used = true` (single-use).
   - If invalid → shows _"QR code expired — please scan the current code on the merchant's screen."_
   - If valid → renders the join form.
5. A Supabase Cron Job purges expired tokens every 5 minutes.

**Anti-fraud guarantees:**

| Fraud vector | Mitigation |
| --- | --- |
| Screenshot sharing via messaging | Token expires in 30s — too slow to share |
| Scanning from behind / distance | Code rotates every 15s + single-use — only one person per scan frame |
| Bot / automated queue stuffing | Token required + IP rate limiting (5 joins/IP/min) |
| Token replay (reuse) | Single-use flag (`used = true`) set atomically on first validation |
| Token brute-force | High-entropy nonce (UUID + HMAC) — computationally infeasible |
| Slug compromise (spam) | Merchant can change slug from settings, invalidating all old links |

**Static flyer option:** The merchant can still print a static QR code pointing to `/[slug]` (the landing page, not `/join`) for marketing purposes. This page shows business info and wait estimates but does **not** allow direct queue joining — the customer must scan the live rotating code at the counter.

> ⚠️ `QR_TOKEN_SECRET` is a **server-only** environment variable. It must never be exposed client-side or prefixed with `NEXT_PUBLIC_`.

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
| Invalid / expired QR token          | `/[slug]/join` page displays "This QR code has expired. Please scan the current code at the counter." |
| No token in URL                     | `/[slug]/join` page displays "Please scan the QR code at the merchant's counter to join the queue."  |
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
