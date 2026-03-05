# Feature 04: Visual Wait Queue (Client Display)

* **Type**: Core application (Core)
* **Dependencies**: [Feature 03: Dashboard](./03_merchant_dashboard.md)

**Description**: The screen the customer watches on their phone ("Your position is: #3"). It shows the animated rank in real time without requiring any app download.

## Integration sub-tasks

### Backend (Supabase)
- [ ] Enable **Supabase Realtime** on the `queue_items` table for `UPDATE` events.
- [ ] Write a PostgreSQL RPC function `get_position(ticket_id)` or `get_queue_state(merchant_id)` that returns the customer's current rank without exposing the PII or full list of other customers.
- [ ] Ensure public read access (via RLS or RPC) only exposes aggregrate counts or specifically targeted ticket statuses, protecting the overall queue data.

### Frontend (Next.js)
- [ ] Create the public page `/[slug]/ticket/[ticket_id]` (server-side fetching via Initial Server Component).
- [ ] Client-side, subscribe to the Realtime `channel` filtered by the shop's `merchant_id` to listen for queue progression.
- [ ] Integrate the `QueuePositionCard` (the odometer) using Framer Motion for smooth, physical-feeling number transitions.
- [ ] Upon receiving a Realtime event, trigger an optimistic calculation or refetch via TanStack Query to update the customer's rank.
- [ ] Display a prominent "It's your turn 🎉" overlay/modal when the status changes to `called`.

## Identified additional tasks

### Quality & robustness
- [ ] **Connection Lost Handling**: Display a subtle "Reconnecting..." indicator if the WebSocket connection drops, automatically attempting to re-establish.
- [ ] **Background Tab Sync**: Ensure that if the user minimizes the browser and reopens it 10 minutes later, the app immediately fetches the latest state rather than relying solely on missed WebSocket events.

### UX & accessibility
- [ ] **Screen Wake Lock**: Integrate the `navigator.wakeLock` API to prevent the user's phone screen from turning off while they actively watch their queue position.
- [ ] **Audio/Vibration Alerts**: Implement `navigator.vibrate([200, 100, 200])` and optionally a short, pleasant chime (`Audio` API) when the "It's your turn" notification hits, ensuring they notice it even if looking away.
- [ ] **Dynamic Title**: Update the HTML `<title>` dynamically (e.g., `(2) Wait-Light` or `🎉 IT'S YOUR TURN!`) so it's visible even if the user is in another browser tab.

### Security
- [ ] **Anonymous Security**: The ticket ID (`ticket_id`) must be a strong UUIDv4 so it is unguessable. Customers cannot iterate over integer IDs to peek at other people's tickets.
- [ ] **Read-Only Client**: The client display application must strictly have zero capability to mutate any data.

## Architecture Notes
- The customer view is **mobile-first** and must be aggressively optimized for low-end smartphone performance.
- We use **Framer Motion** for the numerical updates. When position drops from 4 to 3, the number should slide down, creating a tactile and premium feel that contrasts with the typical static web page.
