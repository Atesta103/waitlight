# User Flows — Wait-Light

This document describes the 3 critical flows of the application. They must be validated before any development to ensure that routes, data models, and components are well-aligned.

---

## Flow 1 — Merchant Onboarding

```
[Page /]  →  Click "Create my business"
    ↓
[/login]  →  Email/password signup (Supabase Auth)
    ↓
[/onboarding]
  1. Enter business name
  2. Choose a unique slug (e.g., "baker-martin")
     → Real-time availability check (Supabase RPC)
  3. Configure max capacity and welcome message
    ↓
  INSERT INTO merchants + INSERT INTO settings
    ↓
[/dashboard]  ←  Automatic redirection
  → Display generated QR Code from slug
  → Button "Download QR Code" (PNG)
  → Button "Open the queue" (UPDATE merchants SET is_open = true)
```

**Points of attention:**

- The slug must be validated with Zod (lowercase, alphanumeric, dashes only, 3-50 chars).
- If the slug is already taken, display an inline error message — no toast.
- The onboarding step is only presented once (direct redirection to `/dashboard` if `merchant` already exists for `auth.uid()`).

---

## Flow 2 — Customer Joins the Queue

```
[Customer scans QR Code]
    ↓
[/[slug]]  →  SSR Page
  ├─ If business does not exist → Custom 404
  ├─ If is_open = false → "Queue closed" Page
  ├─ If queue full (count >= max_capacity) → "Queue full" Page
  └─ Else → Display estimated wait time + "Join" button
    ↓
[/[slug]/join]  →  CSR Form
  1. Enter first name (or nickname)
  2. GDPR consent (mandatory checkbox)
  3. (Optional) Request permission for Web Push notifications
    ↓
  Server-side Zod validation (Edge Function)
    ↓
  INSERT INTO queue_items (status: 'waiting')
    ↓
  If Push permission granted → INSERT INTO push_subscriptions
    ↓
  Ticket UUID stored in localStorage (key: waitlight_ticket_{slug})
    ↓
[/[slug]/wait/[ticketId]]  →  Automatic redirection
```

**Points of attention:**

- If the user already has a valid ticket (`waiting` or `called`) in localStorage for this slug, redirect directly to `/wait/[ticketId]` without going through the form again.
- Web Push permission is requested **after** enrollment (recommended UX pattern: never ask for permission on initial load).
- The form must be submitted via an Edge Function, not directly via the Supabase client, to allow for IP rate limiting.

---

## Flow 3 — Customer Tracks Position & Is Called

```
[/[slug]/wait/[ticketId]]  →  CSR Page + Realtime
    ↓
  Initial load (TanStack Query):
    - GET ticket (RLS: only their own)
    - GET position (RPC get_position)
    ↓
  Realtime Subscription:
    supabase.channel(`queue:merchant_id=eq.${merchantId}`)
    → On every change → invalidateQueries(['queue', ticketId])
    ↓
  ┌─ Real-time display ───────────────────────────────────┐
  │  "You are in position X"                               │
  │  "Estimated wait time: ~Y minutes"                     │
  │  Framer Motion animation when transitioning X → X-1    │
  │  Active Screen Wake Lock (+ 1x1px video fallback)      │
  └───────────────────────────────────────────────────────┘
    ↓
  [Merchant clicks "Call next" in /dashboard]
    ↓
  UPDATE queue_items SET status = 'called', called_at = NOW()
    ↓  (triggers Realtime)
  ┌─ Client side ──────────────────────────────────────────┐
  │  Web Push notification (if granted)                    │
  │  OR AudioContext beep + navigator.vibrate([200,100])   │
  │  Display: "IT'S YOUR TURN! Please proceed."            │
  │  Framer Motion entry animation (scale + color)         │
  └───────────────────────────────────────────────────────┘
    ↓
  [Merchant clicks "Finish" OR 5 min timeout]
    ↓
  UPDATE queue_items SET status = 'done', done_at = NOW()
    ↓
  Trigger recalculates avg_wait_time in merchants
    ↓
  Customer page → Display: "Thank you! Have a great day." → localStorage cleanup
```

**Loss of connection handling:**

```
Connection lost
    ↓
Banner: "Connection lost — Reconnecting..."
    ↓
Retry every 5s (backoff × 2, max 30s)
    ↓
Successful reconnection → Forced data refresh (invalidateQueries)
                        → Banner disappears
```

---

## Flow 4 — Merchant Dashboard (Real-time)

```
[/dashboard]  →  Initial SSR (list of current tickets)
    ↓
  Realtime Subscription on their own queue (filtered merchant_id)
    ↓
  ┌─ Display ─────────────────────────────────────────────┐
  │  Ordered list of 'waiting' tickets                     │
  │  Button "Call [Name]" → UPDATE status = 'called'       │
  │  Button "Cancel" → UPDATE status = 'cancelled'         │
  │  Toggle "Open/Close queue" → UPDATE is_open            │
  │  Real-time counter: X people waiting                   │
  └───────────────────────────────────────────────────────┘
    ↓
  Click "Call next"
    → UPDATE queue_items SET status = 'called' WHERE id = [first ticket]
    → Edge Function sends Web Push notification to concerned customer
```

**Points of attention:**

- The merchant can only call **one customer at a time**: the "Call" button is disabled if a ticket already exists with `status = 'called'`.
- Closing the queue (`is_open = false`) does not cancel existing tickets — it only prevents new INSERTs.
- Dashboard data is protected by RLS: the merchant sees **only** tickets for their `merchant_id`.
