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
  → Access the QR Display screen (rotating secure QR code)
  → Button "Open the queue" (UPDATE merchants SET is_open = true)
  → QR code starts rotating every 15s — customers can scan to join
```

**Points of attention:**

- The slug must be validated with Zod (lowercase, alphanumeric, dashes only, 3-50 chars).
- If the slug is already taken, display an inline error message — no toast.
- The onboarding step is only presented once (direct redirection to `/dashboard` if `merchant` already exists for `auth.uid()`).

---

## Flow 2 — Customer Joins the Queue (via Secure Rotating QR Code)

```
[Customer scans rotating QR Code on merchant's screen]
    ↓
  QR encodes: /[slug]/join?token=<one-time-nonce>
    ↓
[/[slug]/join?token=abc123]  →  CSR Page
  ├─ If no token param → "Please scan the QR code at the counter" message
  ├─ Call validate_qr_token(nonce, slug) RPC (SECURITY DEFINER)
  │   ├─ If token invalid/expired/already used → "QR code expired" page
  │   │     + Message: "Please scan the current code on the merchant's screen"
  │   └─ If token valid → Token marked as used (single-use), proceed ↓
  ├─ If business does not exist → Custom 404
  ├─ If is_open = false → "Queue closed" Page
  ├─ If queue full (count >= max_capacity) → "Queue full" Page
  └─ Else → Display join form
    ↓
[Join Form]
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
- **Token validation is the first step** — the join form is never shown if the token is invalid. This prevents anyone without physical access to the merchant's screen from joining.
- **Single-use tokens**: Each QR code token can only be used by one person. If two people scan the same frame, only the first to load the page successfully joins; the second sees an "expired" message and must scan the next rotation.
- **No direct `/[slug]/join` access**: Without a valid token, the join page only shows an instruction to scan the QR code. There is no manual URL-based joining.

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

## Flow 4 — Merchant Dashboard (Real-time + Rotating QR Display)

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
  │  Button "Show QR Code" → Opens QR Display view         │
  └───────────────────────────────────────────────────────┘
    ↓
  Click "Show QR Code"
    → Navigate to /(dashboard)/qr-display (fullscreen kiosk view)
    ↓
  ┌─ QR Display ──────────────────────────────────────────┐
  │  Rotating QR code (new token every 15 seconds)         │
  │  Countdown ring showing time until next rotation        │
  │  Merchant name + "Scan to join the queue!" subtitle     │
  │  Fullscreen toggle for kiosk/tablet mode                │
  │  WakeLock active (screen never sleeps)                  │
  └───────────────────────────────────────────────────────┘
    ↓
  [Customer scans QR]  →  See Flow 2 for token validation + join
    ↓
  New ticket appears in dashboard via Realtime (audio chime)
    ↓
  Click "Call next"
    → UPDATE queue_items SET status = 'called' WHERE id = [first ticket]
    → Edge Function sends Web Push notification to concerned customer
```

**Points of attention:**

- The merchant can only call **one customer at a time**: the "Call" button is disabled if a ticket already exists with `status = 'called'`.
- Closing the queue (`is_open = false`) does not cancel existing tickets — it only prevents new INSERTs. The QR display should show a "Queue closed" overlay when `is_open = false`.
- Dashboard data is protected by RLS: the merchant sees **only** tickets for their `merchant_id`.
- **Customers join exclusively via QR scan** — there is no manual "Add customer" button. This ensures every person in the queue was physically present at the merchant's location.
- The **QR Display** can run on a separate device (e.g., a customer-facing tablet) while the merchant manages the queue on their own phone/tablet.
- If the merchant's device goes offline, QR token generation pauses and a warning banner is shown. The QR display remains on the last valid code until connectivity is restored.
