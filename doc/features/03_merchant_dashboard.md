# Feature 03: Merchant Dashboard (Dashboard & Actions)

* **Type**: Core application (Core)
* **Dependencies**: [Feature 02: Configuration](./02_merchant_settings.md)
* **Status**: ✅ Implemented (2026-03-05)

**Description**: The ultra-fast interface for the merchant (on tablet or phone) to manage their queue in real time. Customers join the queue by **scanning a secure rotating QR code** displayed on the merchant's screen — the merchant no longer manually adds customers. The dashboard focuses on viewing the waiting list, calling customers, and managing the queue state.

## How customers join (QR-based flow)

The merchant does **not** manually add customers to the queue. Instead:

1. The merchant opens the **QR Display** screen (`/(dashboard)/qr-display`) on a tablet or phone facing the customer line.
2. The QR code rotates every **15 seconds** with a cryptographic one-time token, ensuring only the person physically present can scan it.
3. The customer scans → enters their name → joins the queue automatically.
4. The new ticket appears instantly in the merchant's dashboard via Realtime.

See [Feature 06: Secure Rotating QR Code](./06_dynamic_qr_code.md) for full QR implementation details.

## Integration sub-tasks

### Backend (Supabase)
- [x] Create the `queue_items` table (`id`, `merchant_id`, `customer_name`, `status`, `joined_at`, `called_at`, `done_at`) — migration `20260302000000_initial_schema.sql`.
- [x] Set up secure Row Level Security (RLS) policies: merchant X only sees/modifies `queue_items` for `merchant_id = X`.
- [x] Write state change mutations (Server Actions): `callTicketAction` (`status → called`), `completeTicketAction` (`status → done`), `cancelTicketAction` (`status → cancelled`) in `lib/actions/queue.ts`.
- [x] Implement database indexes on `merchant_id` and `status` to optimize real-time queries.
- [x] Setup Supabase Realtime to push updates to the frontend.
- [x] `joinQueueAction` in `lib/actions/queue.ts` — validates QR token, checks capacity, inserts anonymous ticket (no auth required for customers).
- [x] `toggleQueueOpenAction` — updates `merchants.is_open` to open/close the queue.
- [x] `getQueueAction` — fetches active tickets (`waiting` + `called`) filtered by `merchant_id`, ordered by `joined_at ASC`.

### Frontend (Next.js)
- [x] Implement the `/(dashboard)/dashboard` view serving as the main control center — SSR Server Component (`page.tsx`) + `QueueSection` client orchestrator.
- [x] Integrate the `TicketCard` component displaying wait time, customer identifier, and primary action buttons ("Call" / "Finish" / "Cancel").
- [x] Bind the list (`QueueList`) with **TanStack Query** for initial data fetching and caching (`staleTime: 10_000`).
- [x] Set up optimistic UI updates when a merchant clicks "Call", "Complete", or "Cancel" — full rollback on error.
- [x] Add a prominent **"Fullscreen QR"** button in the dashboard that opens `/qr?slug=…` in a new tab.
- [x] Display a **live queue counter** ("X people waiting") in `DashboardHeader` that updates via Realtime.
- [x] Queue open/closed state controlled via `DashboardHeader` toggle with optimistic update.
- [x] When the queue is open: two-column layout (queue list left | QR code panel right).

## Identified additional tasks

### Quality & robustness
- [x] **Offline Resilience**: `ConnectionStatus` component shown when Realtime channel enters `CHANNEL_ERROR` / `TIMED_OUT` / `CLOSED` state.
- [x] **Data Pagination / cleanup**: Only active tickets (`status IN ('waiting', 'called')`) are fetched.
- [ ] **Error Boundaries**: Implement robust error boundaries around the queue list.
- [x] **New ticket notification**: Audio chime (Web Audio API, oscillator 880 Hz → 440 Hz) plays when a new customer joins via Realtime INSERT event.

### UX & accessibility
- [x] **Keyboard Shortcuts**: `Enter` (outside input/textarea) calls the first waiting ticket (`QueueList` keydown listener).
- [ ] **High Contrast Modes**: Ensure dashboard remains highly readable under direct sunlight.
- [x] **Visual Hierarchy**: "Waiting" tickets vs "Called" tickets use distinct card styles; called tickets appear first in the list.
- [ ] **Split-screen layout**: On larger tablets, consider a split view with QR on one side and queue list on the other.

### Security
- [x] **Action Validation**: All server actions verify `merchant_id = auth.uid()` before mutating + RLS double-guard in DB.
- [x] **No manual add**: The merchant cannot manually add tickets — all tickets are created by customers scanning the rotating QR code.
- [x] **QR token dependency**: Queue joining is gated by a valid, non-expired QR token. See [Feature 06](./06_dynamic_qr_code.md).

## Architecture Notes
- The dashboard is the most critical interactive piece for the merchant. By relying on **TanStack Query + Optimistic Updates** (`@tanstack/react-query`), the interface feels like a native local app regardless of network conditions.
- Real-time subscriptions (`QueueList` subscribes on mount, unsubscribes on unmount) keep multiple merchant devices perfectly synchronized without manual refreshing.
- The **QR Display** is available inline on the dashboard (right column) and as a dedicated fullscreen tab (`/qr?slug=…`).
- Since the merchant no longer manually adds customers, there is no `addTicketAction` — ticket creation is handled entirely by the customer-facing `joinQueueAction`, validated by the QR token system.