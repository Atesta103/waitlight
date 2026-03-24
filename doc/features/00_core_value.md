w# Feature 00: Core Value — Wait-Light

## 1. Metadata

- Feature: Core Value & Product Vision
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 5
- Strategic priority: 5
- Time to code: 1
- Readiness score: 100/100
- Interest score: 100/100
- Source of truth:
  - Schema: `supabase/migrations/`
  - Route(s): `app/[slug]/`, `app/(dashboard)/`
  - UI entrypoint(s): `app/page.tsx`

## 2. Problem and Outcome

### Problem

In food trucks, bakeries, and fast-food restaurants without kiosks, customers order at the counter and wait standing in a noisy, disorganized line. The merchant must physically shout order numbers — stressful, inefficient, and embarrassing.

### Target outcome

A frictionless virtual queue: customers scan a QR code, sit anywhere, and are notified when it's their turn. The merchant never shouts again. Queue order is maintained digitally, in real time.

### Success metrics

- Merchant handles 100% of queue management from a single screen
- Customer joins queue in < 15 seconds (no app download, no registration)
- Fraud attempts blocked by rotating QR token with 30s TTL

## 3. Scope

### In scope

- QR-based queue join (no account needed for customers)
- Real-time position tracking on customer phone
- Merchant dashboard to call / complete / cancel tickets
- Rotating cryptographic QR to prevent remote fraud

### Out of scope

- Online food ordering / payment
- Long-term table reservations
- Customer accounts or loyalty programs

## 4. User Stories

- As a merchant, I want to manage my queue from a tablet so that I can serve customers quickly without shouting.
- As a customer, I want to join the queue by scanning a QR code so that I can wait anywhere without standing in line.
- As a customer, I want to see my real-time position so that I know when to come back.

## 5. Functional Requirements

- [x] FR-1: Customer can join queue by scanning a QR code (no app required)
- [x] FR-2: Merchant can view, call, and complete tickets in real time
- [x] FR-3: Queue position updates in real time via Supabase Realtime
- [x] FR-4: QR code rotates every 15 seconds with a cryptographic token
- [x] FR-5: No customer PII is durably stored after the session ends

## 6. Data Contracts

### Existing tables/types

- `merchants`: one row per merchant; stores identity, slug, queue config
- `queue_items`: one row per ticket; stores customer name, status, join/call/done timestamps
- `qr_tokens`: short-lived tokens for QR validation

### Schema changes (if any)

- [x] None (all tables exist in initial migration)

### Validation (Zod)

- Input schema(s): `JoinQueueSchema` (customer name)
- Expected failure responses: `400`, `403`, `409`

## 7. API and Integration Contracts

### Route handlers

- `POST /api/webhooks/stripe`: Stripe billing events
- `GET /[slug]/join`: Customer join page (token validation)
- `GET /[slug]/wait/[ticketId]`: Customer wait page

### External dependencies

- Supabase Realtime for live updates
- Stripe for billing

## 8. UI and UX

- Entry points: Customer scans QR → `/[slug]/join?t=<token>`, Merchant opens `/dashboard`
- Loading state: Spinner on ticket fetch, skeleton on dashboard load
- Empty state: "Aucun client en attente" with QR code visible
- Error state: Toast for action failures, full-page error boundary
- Accessibility notes: All interactive elements keyboard-navigable; ARIA labels on live regions

## 9. Security and Privacy

- Secret/env requirements: `QR_TOKEN_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`
- Data retention and PII handling: Customer name stored only for the session duration; no email, phone, or account
- Abuse/failure cases and mitigations: QR token single-use + 30s TTL; rate limit on `generateQrTokenAction` (10/min)

## 10. Observability

- Structured logs to emit: Ticket join, ticket call, token invalidation
- Key counters/timers to track: Tickets created per merchant per hour, avg time from join to call
- Alert thresholds (if relevant): Realtime channel error rate > 5% → alert

## 11. Test Plan

### Unit

- `JoinQueueSchema`: valid name, empty name, name > 50 chars

### Integration

- `joinQueueAction`: valid token → ticket created; expired token → 403

### Storybook (if UI)

- Story variant 1: `QRCodeDisplay` default (active countdown)
- Story variant 2: `TicketCard` — waiting state, called state, cancelled state

### Manual QA

- Step 1: Open `/qr?slug=...` on tablet
- Step 2: Scan QR on phone → fill name → submit
- Step 3: Verify ticket appears instantly in dashboard via Realtime

## 12. Implementation Plan

1. Milestone 1: Database schema, RLS, Supabase Auth
2. Milestone 2: QR token system, join flow, dashboard
3. Milestone 3: Customer wait page, Realtime sync, billing gate

## 13. Rollout and Backfill

- Feature flag needed: no
- Backfill required: no
- Rollback plan: Revert migration; disable Realtime channel; redirect `/[slug]` to maintenance page

## 14. Definition of Done

- [x] Implementation merged to main
- [x] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated
