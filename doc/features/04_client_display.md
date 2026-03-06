# Feature 04: Visual Wait Queue (Client Display)

* **Type**: Core application (Core)
* **Dependencies**: [Feature 03: Dashboard](./03_merchant_dashboard.md)
* **Status**: ✅ Implemented (2026-03-05)

**Description**: The screen the customer watches on their phone ("Your position is: #3"). It shows the animated rank in real time without requiring any app download.

## Integration sub-tasks

### Backend (Supabase)
- [x] Enable **Supabase Realtime** on the `queue_items` table for all events (`*`).
- [x] `get_position(ticket_id UUID)` SECURITY DEFINER RPC — returns the customer's current rank (number of people ahead in `waiting` status). Does not expose other customers' data.
- [x] Public read access on `queue_items` for the customer's own ticket via the `get_position` RPC (SECURITY DEFINER bypasses RLS).
- [x] `push_subscriptions` table for Web Push notifications (future use) — `queue_item_id` FK, `endpoint`, `p256dh`, `auth` columns.

### Frontend (Next.js)
- [x] Public page `/[slug]/wait/[ticketId]` — SSR Server Component (`page.tsx`) fetches merchant data, renders `WaitClient`.
- [x] `WaitClient` client component:
  - Initial fetch of ticket data + position on mount (calls `get_position` RPC via Supabase browser client).
  - Subscribes to Realtime channel `queue:merchant_id=eq.{merchant.id}` for any `queue_items` change → refetches ticket + position.
  - Handles tab visibility: `visibilitychange` listener refetches on returning to foreground (handles missed WebSocket events).
  - Estimated wait time calculated client-side: `position × merchant.default_prep_time_min`.
- [x] `CustomerWaitView` section component — renders the `QueuePositionCard`, `WaitTimeEstimate`, and status overlays.
- [x] `ConnectionStatus` component shown on degraded WebSocket state.
- [x] "It's your turn 🎉" overlay — when `status === 'called'`, the view transitions and displays the celebratory state.
- [x] Dynamic page title: `(N) En attente — Wait-Light` while waiting, `C'est votre tour ! — Wait-Light` when called.

## Identified additional tasks

### Quality & robustness
- [x] **Connection Lost Handling**: `ConnectionStatus` component displayed on `CHANNEL_ERROR` / `TIMED_OUT` Realtime states.
- [x] **Background Tab Sync**: `visibilitychange` listener immediately refetches ticket + position when the user minimizes and reopens the browser tab.
- [x] **localStorage cleanup**: Ticket reference stored in `localStorage` (`waitlight_ticket_{slug}`) is removed when the ticket reaches `done` or `cancelled` state.

### UX & accessibility
- [ ] **Screen Wake Lock**: Integrate `navigator.wakeLock` API to prevent the phone screen from sleeping.
- [ ] **Audio/Vibration Alerts**: `navigator.vibrate()` + optional chime when "It's your turn" fires.
- [x] **Dynamic Title**: `document.title` updated dynamically with position number and turn notification.

### Security
- [x] **Anonymous Security**: Ticket ID is a UUIDv4 — unguessable, preventing customers from iterating over tickets of others.
- [x] **Read-Only Client**: `WaitClient` only reads data; all mutations are through merchant-authenticated Server Actions.
- [x] `get_position` RPC is SECURITY DEFINER — never exposes other customers' names or full queue data.

## Architecture Notes
- The customer view is **mobile-first** and optimized for low-end smartphone performance.
- No TanStack Query on the customer side — simple `useState` + Supabase browser client with Realtime subscription keeps the bundle minimal.
- Estimated wait time (`position × default_prep_time_min`) is calculated **client-side** from the server-fetched prep time. No separate polling required.
- The join flow: customer scans QR → `/[slug]/join?t={token}` → `joinQueueAction` validates token + inserts ticket → redirect to `/[slug]/wait/{ticketId}`.
