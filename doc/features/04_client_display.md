# Feature 04: Customer Wait Screen (Client Display)

## 1. Metadata

- Feature: Customer Real-time Wait View
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 5
- Strategic priority: 5
- Time to code: 3
- Readiness score: 85/100
- Interest score: 88/100
- Source of truth:
  - Schema: `supabase/migrations/20260302000000_initial_schema.sql`
  - Route(s): `app/[slug]/wait/[ticketId]/`
  - UI entrypoint(s): `app/[slug]/wait/[ticketId]/page.tsx`

## 2. Problem and Outcome

### Problem

After joining the queue, customers have no visibility into their wait. They must either stay near the counter or constantly check back — defeating the purpose of a virtual queue.

### Target outcome

A mobile-first, real-time wait screen displaying the customer's queue position, estimated time, and a "It's your turn!" celebration overlay — updated live via Supabase Realtime without any app download.

### Success metrics

- Position refresh latency < 500ms after a Realtime event
- Page loads from cold start in < 2 seconds on a mid-range phone
- No customer PII exposed on the wait screen

## 3. Scope

### In scope

- Real-time position display, estimated wait time
- "It's your turn 🎉" overlay when status = `called`
- Dynamic page title (position number + turn notification)
- localStorage cleanup on `done`/`cancelled`
- Background tab sync via `visibilitychange`
- `ConnectionStatus` on WebSocket degradation

### Out of scope

- Audio/vibration alerts (planned)
- Screen Wake Lock (planned)
- Customer account or saved preferences

## 4. User Stories

- As a customer, I want to see my real-time position so that I know when to return to the counter.
- As a customer, I want a visible notification when it's my turn so that I don't miss being called.
- As a customer, I want the page to update even if I left the tab so that I don't miss my spot.

## 5. Functional Requirements

- [x] FR-1: `/[slug]/wait/[ticketId]` SSR page — fetches merchant data server-side
- [x] FR-2: `WaitClient` — fetches ticket data + position on mount via `get_position` RPC
- [x] FR-3: Realtime channel `queue:merchant_id=eq.{id}` — refetches on any `queue_items` change
- [x] FR-4: `visibilitychange` listener — refetch on tab return
- [x] FR-5: "It's your turn 🎉" overlay on `status = 'called'`
- [x] FR-6: Dynamic `document.title` with position + turn notification
- [x] FR-7: `localStorage` cleanup on `done`/`cancelled`
- [x] FR-8: `ConnectionStatus` on CHANNEL_ERROR / TIMED_OUT
- [ ] FR-9: `navigator.wakeLock` to prevent screen sleep
- [ ] FR-10: `navigator.vibrate()` + audio chime on "your turn"

## 6. Data Contracts

### Existing tables/types

- `queue_items`: `id`, `merchant_id`, `customer_name`, `status`, `joined_at`
- `merchants`: `name`, `default_prep_time_min`, `calculated_avg_prep_time`

### Schema changes (if any)

- [x] None (uses `get_position` RPC from initial migration)

### Validation (Zod)

- Input schema(s): n/a (read-only page)
- Expected failure responses: `404` (invalid ticket ID)

## 7. API and Integration Contracts

### Route handlers

- n/a (SSR page + Realtime only)

### External dependencies

- `get_position(ticket_id UUID)` RPC — SECURITY DEFINER, returns customer's rank
- Supabase Realtime (channel per merchant)

## 8. UI and UX

- Entry points: Customer redirected here after submitting join form at `/[slug]/join`
- Loading state: Spinner while `WaitClient` fetches position on mount
- Empty state: n/a (always has a ticket)
- Error state: `ConnectionStatus` on Realtime error; toast if `get_position` fails
- Accessibility notes: `aria-live="polite"` on position card; page title dynamically updated for screen readers

## 9. Security and Privacy

- Secret/env requirements: none
- Data retention and PII handling: Only the customer's own `customer_name` shown; `get_position` RPC never exposes other customers
- Abuse/failure cases and mitigations: Ticket ID is UUIDv4 (unguessable); RPC is SECURITY DEFINER (no RLS bypass possible)

## 10. Observability

- Structured logs to emit: Ticket viewed, position fetched, turn notification received
- Key counters/timers to track: Avg time customer spends on wait page, Realtime event delivery latency
- Alert thresholds (if relevant): Realtime error rate > 2% → alert

## 11. Test Plan

### Unit

- Position calculation: `position × effectivePrepTime` (various inputs including 0)

### Integration

- `get_position` RPC: valid ticket → returns rank; unknown ticket_id → 0

### Storybook (if UI)

- Story variant 1: `QueuePositionCard` — position 3, ~12 min
- Story variant 2: `QueuePositionCard` — position 0, "D'un instant à l'autre…"
- Story variant 3: `CustomerWaitView` — "It's your turn" overlay

### Manual QA

- Step 1: Customer joins → wait page shows correct position
- Step 2: Merchant calls previous ticket → position decreases in real time
- Step 3: Merchant calls this ticket → "It's your turn 🎉" overlay appears

## 12. Implementation Plan

1. Milestone 1: `get_position` RPC, `push_subscriptions` table (future notifications)
2. Milestone 2: `/[slug]/wait/[ticketId]` SSR page + `WaitClient` + Realtime subscription
3. Milestone 3: `CustomerWaitView` section, localStorage cleanup, dynamic title, ConnectionStatus

## 13. Rollout and Backfill

- Feature flag needed: no
- Backfill required: no
- Rollback plan: Fall back to `SELECT COUNT(*)` client-side if `get_position` RPC fails

## 14. Definition of Done

- [x] Implementation merged to main
- [x] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated
