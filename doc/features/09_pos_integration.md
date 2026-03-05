# Feature 09: POS Integration (Point Of Sale)

* **Type**: The "Killer Feature" (High-value Evolution)
* **Dependencies**: [Feature 03: Dashboard](./03_merchant_dashboard.md)

**Description**: Put an end to double data entry for the merchant. The POS system (Square, SumUp, Lightspeed) pushes the validated order directly into the Waitlight queue without the staff having to tap the tablet.

## Integration sub-tasks

### Backend (Supabase)
- [ ] Create a public API system route (Next.js Route Handler: `/api/webhooks/pos`).
- [ ] Define the canonical Waitlight webhook payload type.
- [ ] Set up a merchant specific API Secret Key stored securely in Supabase `settings`.
- [ ] Interpret the incoming standard POS payload into a `queue_items` insertion.
- [ ] (Bonus) Map complex order payloads (burgers, fries, modifications) into a JSONB `metadata` column in `queue_items`.

### Frontend (Next.js)
- [ ] In the `/(dashboard)/settings` screen, add an "API Integrations / Webhooks" configuration block.
- [ ] Provide a "Generate my Secret Key" button that rotates the merchant's API token.
- [ ] Dashboard Update: Modify the `TicketCard` component to display the order metadata if it exists (e.g., a tiny collapsible list showing "2x Burger, 1x Coke").

## Identified additional tasks

### Quality & robustness
- [ ] **Idempotency**: Implement Idempotency Keys based on the POS Order ID. If a POS system retries a webhook due to a timeout, Waitlight must not create two identical tickets.
- [ ] **Webhook Validation**: Validate all incoming payloads with extremely strict Zod schemas, returning a crisp `400 Bad Request` logging the error if the structure is invalid.

### UX & accessibility
- [ ] **Dry-Run Tools**: Build a "Test Webhook" button in the Settings view that fires a fake payload at the merchant's endpoint so they can see a test ticket instantly appear in their dashboard without placing a real order.
- [ ] **Auto-Dismiss Configuration**: Add a setting: "Auto-complete tickets from POS when finished on POS side?" for systems that send an 'order ready' event.

### Security
- [ ] **HMAC Verification**: Require incoming POS webhooks to be signed via `HMAC-SHA256` using the merchant's generated Secret Key. The endpoint rejects any header signature mismatch instantly.
- [ ] **Token Rotation**: Allow merchants to violently nullify/rotate their secret key if they suspect it leaked.

## Architecture Notes
- The webhook endpoint must be optimized for < 100ms response times. Processing the payload, asserting idempotency, inserting into Supabase, and triggering Realtime must be fully asynchronous or fire-and-forget where possible, returning a `202 Accepted` back to the POS quickly.
