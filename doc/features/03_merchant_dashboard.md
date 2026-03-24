# Feature 03: Merchant Dashboard & Queue Management

## 1. Metadata

- Feature: Merchant Dashboard & Real-time Queue Actions
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 5
- Strategic priority: 5
- Time to code: 4
- Readiness score: 85/100
- Interest score: 90/100
- Source of truth:
  - Schema: `supabase/migrations/20260302000000_initial_schema.sql`
  - Route(s): `app/(dashboard)/dashboard/`
  - UI entrypoint(s): `app/(dashboard)/dashboard/page.tsx`

## 2. Problem and Outcome

### Problem

Without a command center, merchants have no visibility into their live queue. They either shout to customers or walk around — both inefficient and unprofessional.

### Target outcome

A real-time dashboard where the merchant sees all active tickets, calls customers, marks them done, and opens/closes the queue — all from a single screen updated live via Supabase Realtime.

### Success metrics

- UI updates within 500ms of a Realtime event
- Optimistic updates on call/complete/cancel actions
- Merchant can process the full customer lifecycle in 3 taps

## 3. Scope

### In scope

- Live queue list (waiting + called tickets)
- Call, complete, cancel ticket actions (with optimistic UI)
- Queue open/close toggle
- Inline QR code panel (when queue is open)
- Audio chime on new ticket join
- Keyboard shortcut: Enter → call first waiting ticket

### Out of scope

- Manual ticket creation by the merchant (customers join via QR only)
- Bulk operations on multiple tickets
- Split-screen layout on large tablets (planned)

## 4. User Stories

- As a merchant, I want to see all waiting customers in real time so that I can serve them in order.
- As a merchant, I want to call the next customer with one tap so that the workflow is fast.
- As a merchant, I want audio notification when a new customer joins so that I don't miss anyone.

## 5. Functional Requirements

- [x] FR-1: SSR dashboard page pre-fetches active tickets (`waiting` + `called`)
- [x] FR-2: TanStack Query with `staleTime: 10_000` for client-side caching
- [x] FR-3: Realtime subscription updates the queue list on INSERT/UPDATE/DELETE
- [x] FR-4: `callTicketAction` → status = `called`; `completeTicketAction` → `done`; `cancelTicketAction` → `cancelled`
- [x] FR-5: Optimistic UI updates with rollback on error
- [x] FR-6: `toggleQueueOpenAction` — update `merchants.is_open`
- [x] FR-7: Live queue counter in `DashboardHeader` from Realtime INSERT events
- [x] FR-8: Audio chime (Web Audio API) on new ticket arrival
- [x] FR-9: `ConnectionStatus` component on Realtime CHANNEL_ERROR / TIMED_OUT
- [x] FR-10: Keyboard shortcut: `Enter` calls first waiting ticket
- [ ] FR-11: Error boundaries around queue list
- [ ] FR-12: High contrast mode for outdoor/sunlight readability
- [ ] FR-13: Split-screen layout (QR left, queue right) on large tablets

## 6. Data Contracts

### Existing tables/types

- `queue_items`: `id`, `merchant_id`, `customer_name`, `status`, `joined_at`, `called_at`, `done_at`
- `merchants`: `is_open`, `slug`, `name`

### Schema changes (if any)

- [x] None

### Validation (Zod)

- Input schema(s): `TicketActionSchema` (ticket_id UUID)
- Expected failure responses: `401`, `403` (wrong merchant), `404` (ticket not found)

## 7. API and Integration Contracts

### Route handlers

- No route handlers — all mutations via Server Actions in `lib/actions/queue.ts`

### External dependencies

- Supabase Realtime (channel: `queue:merchant_id=eq.{id}`)
- TanStack Query (`@tanstack/react-query`) for client cache

## 8. UI and UX

- Entry points: `/dashboard` (authenticated merchant)
- Loading state: `QueueList` skeleton (3 placeholder `TicketCard`s)
- Empty state: "Aucun client en attente" with QR display panel visible
- Error state: `ConnectionStatus` banner on Realtime degradation; toast on action failure
- Accessibility notes: `Enter` keyboard shortcut on queue list; ARIA live region on counter; no screen flash on optimistic update

## 9. Security and Privacy

- Secret/env requirements: none new
- Data retention and PII handling: `customer_name` cleared when ticket status reaches `done`/`cancelled` (future hygiene task)
- Abuse/failure cases and mitigations: All Server Actions verify `merchant_id = auth.uid()` + RLS double-guard; no manual ticket creation path

## 10. Observability

- Structured logs to emit: Ticket state transitions (called, done, cancelled), queue toggle
- Key counters/timers to track: Time from `joined_at` to `called_at` per merchant, Realtime event delivery latency
- Alert thresholds (if relevant): Realtime error rate > 2% → alert

## 11. Test Plan

### Unit

- `TicketActionSchema`: valid UUID, non-UUID input

### Integration

- `callTicketAction`: valid ticket → status = called; foreign merchant ticket → rejected
- `completeTicketAction`: valid called ticket → status = done

### Storybook (if UI)

- Story variant 1: `TicketCard` — waiting state
- Story variant 2: `TicketCard` — called state
- Story variant 3: `QueueList` — empty state
- Story variant 4: `DashboardHeader` — queue open, queue closed, with counter

### Manual QA

- Step 1: Join queue as customer → verify ticket appears instantly in dashboard
- Step 2: Click "Call" → verify customer wait screen shows "C'est votre tour 🎉"
- Step 3: Click "Complete" → ticket disappears from list

## 12. Implementation Plan

1. Milestone 1: `queue_items` table, RLS, Server Actions (call, complete, cancel, toggle)
2. Milestone 2: Dashboard SSR page, QueueList with TanStack Query + Realtime
3. Milestone 3: Optimistic UI, keyboard shortcut, audio chime, ConnectionStatus

## 13. Rollout and Backfill

- Feature flag needed: no
- Backfill required: no
- Rollback plan: Disable Realtime channel; fall back to polling (`refetchInterval: 5000`)

## 14. Definition of Done

- [x] Implementation merged to main
- [x] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated