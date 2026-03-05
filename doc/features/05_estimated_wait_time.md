# Feature 05: Estimated Wait Time Calculation

* **Type**: Highly useful evolution (Core/Evo)
* **Dependencies**: [Feature 04: Client Display](./04_client_display.md), [Feature 03: Dashboard](./03_merchant_dashboard.md)
* **Status**: 🟡 Partially implemented — basic client-side estimate done (2026-03-05)

**Description**: Transform the raw position (e.g., "#3") into actionable information (e.g., "Wait time: ~8 min"). Customers perceive waiting to be shorter when an explicit duration is provided.

## Integration sub-tasks

### Backend (Supabase)
- [ ] Improve the `get_position` RPC function to also calculate and expose `estimated_time`.
- [ ] Implement DB algorithmic calculation: Multiply the person's rank by the configured `default_prep_time_min` value of the business.
- [ ] Add jitter or rounding to avoid false precision (e.g., returning "8-10 mins" instead of "8 minutes and 32 seconds").

### Frontend (Next.js)
- [x] Basic wait time estimate: `WaitClient` calculates `position × merchant.default_prep_time_min` client-side and passes it to `CustomerWaitView` as `estimatedWaitMinutes`.
- [x] `WaitTimeEstimate` component renders the estimated time in the customer view.
- [ ] Update the `QueuePositionCard` to add a prominent "Time Pill" component with a Clock icon.
- [ ] The Time Pill must display the remaining time relative to "Now" and the local time of completion (e.g., "Ready around 12:45 PM").
- [ ] On the merchant `TicketCard` side, optionally display this theoretical time to help staff prioritize.

## Identified additional tasks

### Quality & robustness
- [ ] **Client-side Smoothing**: Locally count down seconds between queue shifts without constant backend polling.
- [ ] **Boundary Handling**: If position hits 0 but ticket is not yet `called`, show "Any moment now..." instead of "0 min".

### UX & accessibility
- [ ] **Visual Thresholds**: Color code the Time Pill — Green (>10 min), Orange (<5 min), pulsating Red (<1 min).
- [ ] **Clear Language**: Use humanized string formatting for times (`"in a few moments"` vs `"in 0 minutes"`).

### Security
- [ ] **Server Truth**: Definitive calculation should happen on the backend (RPC) so the display cannot be manipulated client-side.

## Architecture Notes
- Current implementation: estimate is computed purely client-side from `position × default_prep_time_min`. This is good enough for MVP but relies on the client not tampering with `default_prep_time_min` (which is fetched server-side, so manipulation is server-validated).
- Future: piggyback estimated time onto the `get_position` RPC response to keep a single network round-trip per queue update.
