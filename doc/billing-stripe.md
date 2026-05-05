# Stripe Billing

> Part of the WaitLight engineering rules. See [`AGENTS.md`](../AGENTS.md) for the full context.

## Live Billing Model

WaitLight uses Stripe Billing with Checkout Sessions in `subscription` mode.

- Product: `prod_USYIrmmUBUZNb9` (`WaitLight Pro`)
- Price: `price_1TTdBpGXOpVdjY12j2I9RHxu`
- Amount: 29 EUR / month / establishment
- Trial: 14 days, card collected by Stripe Checkout

The dashboard paywall grants access only when the merchant has a Stripe subscription row with an active status, or when `merchants.bypass_paywall` is enabled by an allowed admin.

## Required Production Environment

Production billing must use live Stripe credentials:

| Variable | Requirement |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server-only `sk_live_...` key. The app rejects `sk_test_...` in production. |
| `STRIPE_PRICE_ID` | `price_1TTdBpGXOpVdjY12j2I9RHxu` unless the live product changes. |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from the live Stripe Dashboard webhook endpoint. |

The production webhook endpoint must target:

```text
https://waitlight.fr/api/webhooks/stripe
```

Subscribe the endpoint to at least:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Implementation Rules

- Create Checkout Sessions only through `createCheckoutSessionAction`.
- Keep `merchant_id` in both Checkout Session metadata and Subscription metadata.
- Store `stripe_price_id`, `trial_end`, `current_period_end`, and `cancel_at_period_end` from Stripe events.
- Never write subscription rows from the browser; writes use `adminSupabase` only in webhook/success server code.
- Never use Stripe test keys for production deployment.
