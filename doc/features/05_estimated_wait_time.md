# Feature 05: Estimated Wait Time Calculation

## 1. Metadata

- Feature: Estimated Wait Time Display
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 4
- Strategic priority: 4
- Time to code: 2
- Readiness score: 80/100
- Interest score: 80/100
- Source of truth:
  - Schema: `supabase/migrations/20260305000001_auto_prep_time.sql`
  - Route(s): `app/[slug]/wait/[ticketId]/`
  - UI entrypoint(s): `app/[slug]/wait/[ticketId]/WaitClient.tsx`

## 2. Problem and Outcome

### Problem

Showing only "Position #3" gives no actionable info. Customers still feel uncertain — "is 3 people 5 minutes or 45 minutes?" — leading to unnecessary anxiety and early returns to the counter.

### Target outcome

Transform the raw position into a human-readable estimated wait time (e.g., "~8 min") with a wall-clock ETA ("Your turn around 14:35"). Customers can go sit down with confidence.

### Success metrics

- Wait estimate accuracy within 20% of actual time (measured post-launch)
- Color-coded urgency visual: correct color at < 1 min, ≤ 5 min, > 5 min
- ETA display with no SSR mismatch warnings

## 3. Scope

### In scope

- `position × effectivePrepTime` calculation (using `calculated_avg_prep_time` or fallback)
- Wall-clock ETA (`Date.now() + estimatedWaitMs`)
- Humanized language ("Moins d'une minute", "~N min")
- Color-coded `TimePill` (gray/orange/red/green)
- "You're moving up!" advance badge animation

### Out of scope

- Server-side ETA calculation (client-side only to avoid SSR mismatch)
- Per-ticket ETA on merchant dashboard (planned)
- Client-side countdown timer between Realtime events (planned)

## 4. User Stories

- As a customer, I want to see an estimated wait time so that I can decide whether to sit or stay nearby.
- As a customer, I want a wall-clock ETA so that I can plan the rest of my time.
- As a customer, I want a visual urgency signal so that I know when to head back to the counter.

## 5. Functional Requirements

- [x] FR-1: `effectivePrepTime = calculated_avg_prep_time ?? default_prep_time_min`
- [x] FR-2: `estimatedWaitMinutes = position × effectivePrepTime`
- [x] FR-3: `TimePill` color-codes urgency (gray > 5 min, orange ≤ 5 min, red < 1 min, green = 0, pulsing)
- [x] FR-4: `EstimatedClockTime` displays `"Votre tour vers HH:MM"` — client-side only (no SSR)
- [x] FR-5: Humanized boundary: < 1 min → "Moins d'une minute", 1 min → "~1 minute"
- [x] FR-6: "↑ vous avancez !" advance badge on forward position movement
- [ ] FR-7: Client-side countdown between Realtime events (no polling)
- [ ] FR-8: Estimated time shown per ticket on merchant `QueueList`

## 6. Data Contracts

### Existing tables/types

- `merchants`: `calculated_avg_prep_time` (nullable), `default_prep_time_min`

### Schema changes (if any)

- [x] None (column added in Feature 07 migration)

### Validation (Zod)

- Input schema(s): n/a (computed client-side)
- Expected failure responses: n/a

## 7. API and Integration Contracts

### Route handlers

- n/a

### External dependencies

- `merchants.calculated_avg_prep_time` pre-computed by Feature 07 pg_cron job

## 8. UI and UX

- Entry points: `CustomerWaitView` (embedded in wait page)
- Loading state: `TimePill` hidden until position is fetched
- Empty state: Position 0 → pulsing green "D'un instant à l'autre…" state
- Error state: n/a (purely derived from position)
- Accessibility notes: `EstimatedClockTime` uses `useEffect` only — avoids SSR hydration warning; `aria-label` on `TimePill`

## 9. Security and Privacy

- Secret/env requirements: none
- Data retention and PII handling: n/a (computed from position, no stored PII)
- Abuse/failure cases and mitigations: `effectivePrepTime` sourced from DB (server-computed) — cannot be tampered with client-side

## 10. Observability

- Structured logs to emit: n/a (purely UI computation)
- Key counters/timers to track: Actual vs estimated wait time delta (requires post-call analytics join)
- Alert thresholds (if relevant): n/a

## 11. Test Plan

### Unit

- `estimatedWaitMinutes`: position=0 → 0, position=3 × prepTime=5 → 15
- `TimePill` color logic: > 5 → gray, ≤ 5 → orange, 0 → green

### Integration

- n/a (purely UI)

### Storybook (if UI)

- Story variant 1: `TimePill` — > 5 min (gray)
- Story variant 2: `TimePill` — ≤ 5 min (orange)
- Story variant 3: `TimePill` — < 1 min (red pulsing)
- Story variant 4: `TimePill` — position 0 (green pulsing)
- Story variant 5: `EstimatedClockTime` — 14:35 ETA

### Manual QA

- Step 1: Join queue as 3rd customer → verify "~10 min" shown (default prep = 5)
- Step 2: Merchant calls 1st ticket → position drops → advance badge appears
- Step 3: Verify ETA text never causes hydration warning in console

## 12. Implementation Plan

1. Milestone 1: `effectivePrepTime` logic in `WaitClient`
2. Milestone 2: `TimePill`, `EstimatedClockTime`, advance badge in `QueuePositionCard`
3. Milestone 3: Humanized boundaries, color thresholds, accessibility

## 13. Rollout and Backfill

- Feature flag needed: no
- Backfill required: no
- Rollback plan: Hide `TimePill` — fallback to raw position only

## 14. Definition of Done

- [x] Implementation merged to main
- [x] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated
