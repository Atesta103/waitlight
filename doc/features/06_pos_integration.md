# Feature 09: POS Integration (Point of Sale)

## 1. Metadata

- Feature: POS Webhook Integration
- Owner: Founding Team
- Status: `postponed`
- Last updated: 2026-03-24
- Related issue/epic: TBD
- Value to user: 5
- Strategic priority: 1
- Time to code: 4
- Readiness score: 20/100
- Interest score: 35/100
- Source of truth:
  - Schema: `supabase/migrations/` (not yet created)
  - Route(s): `app/api/webhooks/pos/` (not yet created)
  - UI entrypoint(s): `app/(dashboard)/dashboard/settings/` (not yet modified)

## 2. Problem and Outcome

### Problem

Merchants using a POS system (Square, SumUp, Lightspeed) must manually tap the tablet to add each new order to the queue — double entry, delay, and human error risk. Under rush-hour conditions this becomes a serious bottleneck.

### Target outcome

The POS system pushes a validated order directly into the Waitlight queue via a signed webhook. The merchant's staff never touches the tablet for queue management — the system is fully automated.

### Success metrics

- Webhook processed in < 100ms (responds `202 Accepted` before DB write completes)
- Zero duplicate tickets from POS retries (idempotency via POS order ID)
- Webhook signature verification rejection rate: 100% for unsigned/tampered requests

## 3. Scope

### In scope

- POST `/api/webhooks/pos` — HMAC-signed webhook receiver
- Canonical Waitlight webhook payload schema (Zod)
- Merchant API secret key (generated, stored in `settings`, rotatable)
- Settings UI: "API Integrations" block with key generator and copy
- Idempotency via POS Order ID (prevent duplicate tickets on retry)

### Out of scope

- POS-specific adapters for Square/SumUp/Lightspeed SDKs (webhook is the integration layer)
- Order metadata display on ticket card (planned bonus)
- Auto-complete from POS "order ready" event (planned)

## 4. User Stories

- As a merchant, I want my POS to automatically create queue tickets so that I never do double data entry.
- As a merchant, I want to generate a secret key so that I can configure my POS integration securely.
- As a merchant, I want my secret key rotatable so that I can recover if it leaks.

## 5. Functional Requirements

- [ ] FR-1: `POST /api/webhooks/pos` — validates HMAC-SHA256 signature from `X-Waitlight-Signature` header
- [ ] FR-2: Zod schema for canonical Waitlight webhook payload (order_id, customer_name, items?)
- [ ] FR-3: Idempotency: check `queue_items.pos_order_id` before insert; return `200` if already exists
- [ ] FR-4: Merchant API secret key stored encrypted in `settings.pos_api_secret`
- [ ] FR-5: `generatePosApiKeyAction` Server Action — generates, hashes, and saves key
- [ ] FR-6: Settings UI: "API Integrations" block — generate key, copy, rotate, webhook docs
- [ ] FR-7: "Test Webhook" button — fires a fake payload to the merchant's endpoint
- [ ] FR-8: Optional: `queue_items.pos_metadata JSONB` for order items display

## 6. Data Contracts

### Existing tables/types

- `settings`: add `pos_api_secret TEXT NULL` (hashed), `pos_order_id TEXT NULL` on `queue_items`

### Schema changes (if any)

- [ ] Add `pos_api_secret` to `settings` table
- [ ] Add `pos_order_id` (UNIQUE per merchant) to `queue_items` for idempotency
- [ ] Optional: `pos_metadata JSONB` on `queue_items`

### Validation (Zod)

- Input schema(s): `PosWebhookPayloadSchema` (order_id, customer_name)
- Expected failure responses: `400` (invalid payload), `401` (missing/invalid HMAC signature), `409` (duplicate order_id), `429` (rate limit)

## 7. API and Integration Contracts

### Route handlers

- `POST /api/webhooks/pos`: HMAC verification → Zod validation → idempotency check → insert ticket → 202

For each route, define:

- Auth requirements: No session auth — HMAC-SHA256 signature required (`X-Waitlight-Signature` header)
- Input shape: JSON body `{ order_id, customer_name, slug }`
- Output shape: `202 Accepted` (always respond quickly)
- Error states: `400` bad payload, `401` bad signature, `409` duplicate
- Idempotency expectations: Safe to retry — duplicate order_id returns `200` without inserting

### External dependencies

- POS systems (Square, SumUp, Lightspeed) — external webhooks
- Merchant API secret stored in Supabase `settings`

## 8. UI and UX

- Entry points: Settings → API Integrations section
- Loading state: Key generation button in loading state during `generatePosApiKeyAction`
- Empty state: "No API key configured — generate one below"
- Error state: Toast on generation failure
- Accessibility notes: Generated key shown in a masked input with copy button; rotate confirms via `Dialog`

## 9. Security and Privacy

- Secret/env requirements: no new env vars (merchant key stored in DB hashed)
- Data retention and PII handling: `customer_name` from POS treated same as manually entered name
- Abuse/failure cases and mitigations: HMAC-SHA256 prevents forged webhooks; rate limit on `/api/webhooks/pos`; key hashed at rest (reveal once on generation); `FOR UPDATE SKIP LOCKED` for idempotency

## 10. Observability

- Structured logs to emit: Webhook received (merchant slug, order_id), signature failure, duplicate order
- Key counters/timers to track: Webhook processing latency, failure rate by merchant
- Alert thresholds (if relevant): Signature failure rate > 20% → alert (POS misconfiguration)

## 11. Test Plan

### Unit

- `PosWebhookPayloadSchema`: valid, missing order_id, customer_name > 100 chars

### Integration

- `POST /api/webhooks/pos`: valid HMAC → 202; invalid HMAC → 401; duplicate order_id → 200 (no new ticket)

### Storybook (if UI)

- Story variant 1: API Integrations settings section — no key configured
- Story variant 2: API Integrations settings section — key configured (masked)

### Manual QA

- Step 1: Generate key in settings → use in test curl request → verify ticket appears
- Step 2: Replay same request → verify no duplicate ticket
- Step 3: Tamper with signature → verify 401

## 12. Implementation Plan

1. Milestone 1: DB migrations (pos_api_secret, pos_order_id), `generatePosApiKeyAction`
2. Milestone 2: `POST /api/webhooks/pos` Route Handler (HMAC + Zod + idempotency)
3. Milestone 3: Settings UI block, test webhook button

## 13. Rollout and Backfill

- Feature flag needed: yes — `ENABLE_POS_WEBHOOK=true` env var
- Backfill required: no
- Rollback plan: Disable route handler; no impact on existing features

## 14. Definition of Done

- [ ] Implementation merged to main
- [ ] Relevant unit and integration tests added and passing
- [ ] End-user or internal documentation updated
- [ ] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated
