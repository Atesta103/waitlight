# Feature 05: Estimated Wait Time Calculation

* **Type**: Highly useful evolution (Core/Evo)
* **Dependencies**: [Feature 04: Client Display](./04_client_display.md), [Feature 03: Dashboard](./03_merchant_dashboard.md)

**Description**: Transform the raw position (e.g., "#3") into actionable information (e.g., "Wait time: ~8 min"). Customers perceive waiting to be shorter when an explicit duration is provided.

## Integration sub-tasks

### Backend (Supabase)
- [ ] Improve the `get_position` RPC function to also calculate and expose `estimated_time`. 
- [ ] Implement DB algorithmic calculation: Multiply the person's rank by the configured `default_prep_time_min` value of the business.
- [ ] Add jitter or rounding to avoid false precision (e.g., returning "8-10 mins" instead of "8 minutes and 32 seconds").

### Frontend (Next.js)
- [ ] Update the `QueuePositionCard` interface (Client) to add a clear, prominent "Time Pill" component with a Clock icon.
- [ ] The Time Pill must display the remaining time relative to "Now" and the approximate exact local time of completion (e.g., "Ready around 12:45 PM").
- [ ] On the merchant `TicketCard` side, optionally display this theoretical time to help staff prioritize.

## Identified additional tasks

### Quality & robustness
- [ ] **Client-side Smoothing**: If the server says "8 minutes", the client should visually count down seconds locally without needing constant backend polling, resetting only when a queue shift occurs.
- [ ] **Boundary Handling**: If position hits 0 but the ticket is not explicitly marked 'called' by the merchant yet, transition the UI gracefully to "Any moment now..." instead of "-1 minutes".

### UX & accessibility
- [ ] **Visual Thresholds**: Color code the Time Pill. For example, Green if > 10m (relax), Orange if < 5m (head back to the truck), pulsating Red if < 1m (get ready).
- [ ] **Clear Language**: Use humanized `next-intl` string formatting for times rather than pure math (`"in a few moments"` vs `"in 0 minutes"`).

### Security
- [ ] **Server Truth**: The definitive calculation must happen strictly isolated on the backend (RPC/Edge Function) so users cannot tampered with the "Time" display maliciously on their end.

## Architecture Notes
- This feature relies deeply on the settings defined by the merchant (`default_prep_time_min`). Since queue updates happen over WebSocket, the estimated time should piggyback onto the rank update payload instead of requiring a separate network request.
