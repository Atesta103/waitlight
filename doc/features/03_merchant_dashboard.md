# Feature 03: Merchant Dashboard (Dashboard & Actions)

* **Type**: Core application (Core)
* **Dependencies**: [Feature 02: Configuration](./02_merchant_settings.md)

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
- [ ] Create the `queue_items` table (`id`, `merchant_id`, `customer_name`, `status`, `joined_at`, `called_at`, `completed_at`).
- [ ] Set up secure Row Level Security (RLS) policies: merchant X only sees/modifies `queue_items` for `merchant_id = X`.
- [ ] Write state change mutations (Server Actions): `callTicketAction` (`status = called`), `completeTicketAction` (`status = done`), `cancelTicketAction` (`status = cancelled`).
- [ ] Implement database indexes on `merchant_id` and `status` to optimize real-time queries.

### Frontend (Next.js)
- [ ] Implement the `/(dashboard)/queue` view serving as the main control center.
- [ ] Integrate the `TicketCard` component displaying wait time, customer identifier, and primary action buttons ("Call" / "Finish").
- [ ] Bind the list (`QueueList`) with **TanStack Query** for initial data fetching and caching.
- [ ] Set up optimistic UI updates when a merchant clicks "Call" or "Complete" to avoid any perceived latency.
- [ ] Add a prominent **"Show QR Code"** button in the dashboard header that opens or navigates to the `/(dashboard)/qr-display` fullscreen view.
- [ ] Display a **live queue counter** ("X people waiting") that updates in real time as customers scan and join.

## Identified additional tasks

### Quality & robustness
- [ ] **Offline Resilience**: Add offline detection. Warn the merchant if the network drops (since waitlist sync and QR token generation will fail).
- [ ] **Data Pagination / cleanup**: Only fetch active tickets (`status IN ('waiting', 'called')`) initially to keep the dashboard snappy.
- [ ] **Error Boundaries**: Implement robust error handling around the queue list to prevent full app crashes if a single ticket data is malformed.
- [ ] **New ticket notification**: Play a subtle audio chime or visual pulse when a new customer successfully joins via QR scan, so the merchant notices without constantly watching the screen.

### UX & accessibility
- [ ] **Keyboard Shortcuts**: Allow quick actions via physical keyboard (e.g., `Enter` to call next, `Escape` to cancel) for POS environments with keyboards.
- [ ] **High Contrast Modes**: Ensure the dashboard remains highly readable under direct sunlight, as food trucks often operate outdoors.
- [ ] **Visual Hierarchy**: Clearly differentiate "Waiting" tickets from "Called" tickets using distinct colors (e.g., gray/blue for waiting, pulsating green/yellow for called).
- [ ] **Split-screen layout**: On larger tablets, consider a split view: QR code on one side, queue list on the other, so the merchant can display the QR and manage the queue on a single device.

### Security
- [ ] **Action Validation**: Ensure all server actions rigorously check that the merchant performing the action actually owns the `queue_item` being modified.
- [ ] **No manual add**: The merchant cannot manually add tickets to the queue. All tickets are created by customers scanning the rotating QR code. This ensures physical presence and prevents ghost entries.
- [ ] **QR token dependency**: Queue joining is gated by a valid, non-expired QR token. See [Feature 06](./06_dynamic_qr_code.md) for token security details.

## Architecture Notes
- The dashboard is the most critical interactive piece for the merchant. By relying on **TanStack Query + Optimistic Updates**, the interface will feel like a local native app regardless of network conditions.
- Real-time subscriptions should be used to keep multiple merchant devices (e.g., two tablets in the same shop) perfectly synchronized without manual refreshing.
- The **QR Display** is a dedicated sub-route (`/(dashboard)/qr-display`) designed for kiosk-mode tablet display. It can also be opened as a split view alongside the queue list on larger screens.
- Since the merchant no longer manually adds customers, the `addTicketAction` Server Action is removed. Ticket creation is handled by the customer-facing join flow, validated by the QR token system.
