# Feature 03: Merchant Dashboard (Dashboard & Actions)

* **Type**: Core application (Core)
* **Dependencies**: [Feature 02: Configuration](./02_merchant_settings.md)

**Description**: The ultra-fast interface for the merchant (on tablet or phone) to add customers to their queue, view the waiting list, and call them.

## Integration sub-tasks

### Backend (Supabase)
- [ ] Create the `queue_items` table (`id`, `merchant_id`, `customer_name`, `status`, `joined_at`, `called_at`, `completed_at`).
- [ ] Set up secure Row Level Security (RLS) policies: merchant X only sees/modifies `queue_items` for `merchant_id = X`.
- [ ] Write the `addTicketAction` Server Action (Zod validation for customer name or simple number input).
- [ ] Write state change mutations (Server Actions): `callTicketAction` (`status = called`), `completeTicketAction` (`status = done`), `cancelTicketAction` (`status = cancelled`).
- [ ] Implement database indexes on `merchant_id` and `status` to optimize real-time queries.

### Frontend (Next.js)
- [ ] Implement the `/(dashboard)/queue` view serving as the main control center.
- [ ] Create the large, accessible "Add a customer" ticket addition button, optimized for touch targets.
- [ ] Integrate the `TicketCard` component displaying wait time, customer identifier, and primary action buttons ("Call" / "Finish").
- [ ] Bind the list (`QueueList`) with **TanStack Query** for initial data fetching and caching.
- [ ] Set up optimistic UI updates when a merchant clicks "Call" or "Complete" to avoid any perceived latency.

## Identified additional tasks

### Quality & robustness
- [ ] **Offline Resilience**: Add offline detection. Warn the merchant if the network drops (since waitlist sync will fail).
- [ ] **Data Pagination / cleanup**: Only fetch active tickets (`status IN ('waiting', 'called')`) initially to keep the dashboard snappy.
- [ ] **Error Boundaries**: Implement robust error handling around the queue list to prevent full app crashes if a single ticket data is malformed.

### UX & accessibility
- [ ] **Keyboard Shortcuts**: Allow adding a ticket quickly via physical keyboard (e.g., hitting `Enter` to focus the name input, `Cmd/Ctrl + Enter` to submit) for POS environments with keyboards.
- [ ] **High Contrast Modes**: Ensure the dashboard remains highly readable under direct sunlight, as food trucks often operate outdoors.
- [ ] **Visual Hierarchy**: Clearly differentiate "Waiting" tickets from "Called" tickets using distinct colors (e.g., gray/blue for waiting, pulsating green/yellow for called).

### Security
- [ ] **Action Validation**: Ensure all server actions rigorously check that the merchant performing the action actually owns the `queue_item` being modified.
- [ ] **Rate Limiting**: Add basic rate limiting to ticket creation to prevent accidental spam-clicking by staff during rushes.

## Architecture Notes
- The dashboard is the most critical interactive piece for the merchant. By relying on **TanStack Query + Optimistic Updates**, the interface will feel like a local native app regardless of network conditions.
- Real-time subscriptions should be used to keep multiple merchant devices (e.g., two tablets in the same shop) perfectly synchronized without manual refreshing.
