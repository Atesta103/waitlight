# Feature 13: Billing & Stripe (Subscription Paywall)

## 1. Metadata

- Feature: Stripe Subscription Paywall & Admin Billing
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 5
- Strategic priority: 5
- Time to code: 5
- Readiness score: 80/100
- Interest score: 95/100
- Source of truth:
  - Schema: `supabase/migrations/20260306000001_billing.sql`
  - Route(s): `app/subscribe/`, `app/billing-success/`, `app/api/webhooks/stripe/`, `app/admin/`
  - UI entrypoint(s): `app/subscribe/SubscribeClient.tsx`

## 2. Problem and Outcome

### Problem

Without a payment gate, the SaaS would be free forever. There is no mechanism to differentiate free vs paid access, block lapsed subscriptions, or track MRR.

### Target outcome

Every merchant must hold an active Stripe subscription to access the dashboard. Subscription state is managed via webhooks, stored in a `subscriptions` table, and enforced server-side in the dashboard layout. The admin page provides full billing oversight.

### Success metrics

- Dashboard access blocked within 1 request of subscription lapse (webhook → DB → layout check)
- Zero subscription rows writable by authenticated merchants (service_role only)
- `/billing-success` upserts subscription before Stripe webhook arrives (race condition handled)

## 3. Scope

### In scope

- `subscriptions` table (service_role write-only RLS)
- Stripe Checkout (14-day trial, card required)
- Stripe Billing Portal (self-service card update, cancellation)
- Webhook handler for 5 key events
- `/subscribe` page (pricing, error banners, portal button)
- `/billing-success` page (upserts subscription, redirects to dashboard)
- `/admin` page (ADMIN_EMAILS guard, 3-tab billing overview)
- Dashboard layout subscription gate (server-side, single authoritative check)

### Out of scope

- Usage-based billing
- Multiple subscription tiers
- Invoice PDF generation (handled by Stripe Billing Portal)

## 4. User Stories

- As a merchant, I want a 14-day free trial so that I can test the product before committing.
- As a merchant, I want to manage my subscription from the settings so that I can update my card or cancel.
- As the Wait-Light team, I want an admin dashboard so that I can monitor all clients and payments.

## 5. Functional Requirements

- [x] FR-1: `subscriptions` table — `merchant_id`, `stripe_customer_id`, `stripe_subscription_id`, `status`, `trial_end`, `current_period_end`
- [x] FR-2: RLS: merchant can SELECT own row only; no INSERT/UPDATE/DELETE for authenticated role
- [x] FR-3: `createCheckoutSessionAction` — creates Stripe customer + Checkout Session (14-day trial, STRIPE_PRICE_ID)
- [x] FR-4: `createPortalSessionAction` — creates Stripe Billing Portal session
- [x] FR-5: `POST /api/webhooks/stripe` — HMAC verified, handles 5 events, idempotent upserts
- [x] FR-6: `/billing-success` page — upserts subscription via `adminSupabase` (handles webhook race)
- [x] FR-7: Dashboard layout subscription gate — `status IN ('active', 'trialing')` → allow; else redirect `/subscribe`
- [x] FR-8: `/subscribe` page — pricing card, trial CTA, error banners (cancelled/failed/past_due), portal button
- [x] FR-9: `/admin` page — ADMIN_EMAILS server-side guard, 3 tabs: Clients / Paiements / Factures
- [ ] FR-10: Create `subscriptions` table migration (not yet applied in Supabase)
- [ ] FR-11: Add `subscriptions` type to `types/database.ts` after migration applied

## 6. Data Contracts

### Existing tables/types

- `subscriptions`: `id`, `merchant_id`, `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`, `status`, `trial_end`, `current_period_end`, `cancel_at_period_end`

### Schema changes (if any)

- [ ] Migration `20260306000001_billing.sql` — `subscriptions` table, RLS, `moddatetime` trigger

### Validation (Zod)

- Input schema(s): n/a for public-facing (webhook uses Stripe SDK signature verification instead)
- Expected failure responses: `400` (bad webhook signature), `200` (all valid webhook events — respond fast)

## 7. API and Integration Contracts

### Route handlers

- `POST /api/webhooks/stripe`: HMAC verified → dispatch on event type → upsert via adminSupabase → 200

For each route:

- Auth requirements: No session auth — Stripe HMAC-SHA256 signature required
- Input shape: Raw Stripe event body + `stripe-signature` header
- Output shape: `200 null` always (Stripe relays are idempotent)
- Error states: `400` on signature mismatch
- Idempotency expectations: All upserts use `onConflict: "merchant_id"` — safe to replay

### External dependencies

- Stripe Dashboard (product, price, webhook endpoint, signing secret)
- `stripe` npm package (`apiVersion: "2025-01-27.acacia"`)

## 8. UI and UX

- Entry points: After onboarding → `/subscribe`; settings → "Gérer l'abonnement" button
- Loading state: CTA button in loading state during `createCheckoutSessionAction`; redirect to Stripe-hosted Checkout
- Empty state: n/a
- Error state: Banners for cancelled (`?error=cancelled`), payment failed (`?error=payment_failed`), past_due status
- Accessibility notes: Stripe Checkout is Stripe-hosted (Stripe's own a11y responsibility); ARIA roles on status banners

## 9. Security and Privacy

- Secret/env requirements: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`
- Data retention and PII handling: No card data stored by Wait-Light (Stripe manages all PII); `stripe_customer_id` stored as reference only
- Abuse/failure cases and mitigations: Webhook signature verification blocks forged events; `adminSupabase` never imported in client files; ADMIN_EMAILS gate is server-side only

## 10. Observability

- Structured logs to emit: Checkout session created, webhook received (event type, merchant_id), subscription status change
- Key counters/timers to track: MRR, trial-to-paid conversion rate, churn rate, webhook delivery failure count
- Alert thresholds (if relevant): Webhook delivery failure > 3 → alert; payment_failed events > 5/day → alert

## 11. Test Plan

### Unit

- `ACTIVE_STATUSES` type guard: `'active'` → true, `'past_due'` → false

### Integration

- Webhook handler: `checkout.session.completed` → subscription row upserted; invalid signature → 400
- Dashboard layout gate: `status = 'past_due'` → redirect to `/subscribe`

### Storybook (if UI)

- Story variant 1: `SubscribeClient` — default (trial CTA)
- Story variant 2: `SubscribeClient` — `?error=payment_failed` (error banner)
- Story variant 3: `SubscribeClient` — `status = 'past_due'` (portal button)
- Story variant 4: `AdminDashboard` — Clients tab with mock data

### Manual QA

- Step 1: Complete onboarding → land on `/subscribe` → start trial → verify `subscriptions` row created
- Step 2: Use Stripe test card decline → verify error banner on `/subscribe`
- Step 3: Open admin at `/admin` with admin email → verify 3 tabs show correct data

## 12. Implementation Plan

1. Milestone 1: Stripe setup (product, price, webhook), `subscriptions` migration, `lib/stripe.ts`, `lib/supabase/admin.ts`
2. Milestone 2: Server Actions (checkout, portal, getSubscription), webhook route handler, `/billing-success`
3. Milestone 3: Dashboard layout gate, `/subscribe` page + banners, `/admin` page

## 13. Rollout and Backfill

- Feature flag needed: no (can temporarily skip gate in layout for dev)
- Backfill required: yes — existing merchants in dev/staging need a `subscriptions` row with `status = 'active'`
- Rollback plan: Comment out subscription gate in layout.tsx; existing merchants retain access

## 14. Definition of Done

- [x] Implementation merged to main
- [ ] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID, ADMIN_EMAILS)
- [ ] Dashboard/Storybook layout and behavior visually validated
