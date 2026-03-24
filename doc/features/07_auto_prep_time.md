# Feature 07: Automatic Preparation Time Adjustment

## 1. Metadata

- Feature: Auto Prep Time via IQR + EMA Algorithm
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 4
- Strategic priority: 3
- Time to code: 4
- Readiness score: 88/100
- Interest score: 75/100
- Source of truth:
  - Schema: `supabase/migrations/20260305000001_auto_prep_time.sql`
  - Route(s): `app/(dashboard)/dashboard/settings/`
  - UI entrypoint(s): `components/sections/SettingsPanel.tsx`

## 2. Problem and Outcome

### Problem

The merchant's manually set prep time (`default_prep_time_min`) drifts from reality over time — especially during rush hours when service slows. Customers receive inaccurate estimates, eroding trust.

### Target outcome

The system learns the merchant's actual service pace from historical data (last 50 completed tickets), applies IQR outlier filtering and EMA smoothing, and auto-updates the effective prep time every 30 minutes — transparently.

### Success metrics

- `calculated_avg_prep_time` accuracy within 15% of the true rolling average
- Algorithm dormant until ≥ 5 valid samples (prevents cold-start jumps)
- Merchants can reset to manual mode in 1 click

## 3. Scope

### In scope

- `calculate_avg_prep(p_merchant_id UUID)` SQL function (IQR + EMA)
- `pg_cron` job every 30 min (active merchants only)
- `merchants.calculated_avg_prep_time` + `avg_prep_computed_at` columns
- Settings UI showing auto vs manual badge, explainability block, reset button
- `resetAvgPrepTimeAction` Server Action

### Out of scope

- Per-item category prep time (one average per merchant)
- Machine learning models (IQR + EMA is sufficient)
- Manual trigger of recalculation from UI

## 4. User Stories

- As a merchant, I want the estimated time to adjust automatically during rush hours so that customers receive accurate predictions.
- As a merchant, I want to understand why the time changed so that I trust the system.
- As a merchant, I want to reset to manual mode so that I stay in control.

## 5. Functional Requirements

- [x] FR-1: `merchants.calculated_avg_prep_time` nullable column (NULL = manual mode)
- [x] FR-2: `merchants.avg_prep_computed_at` nullable column (last cron run timestamp)
- [x] FR-3: `calculate_avg_prep(p_merchant_id UUID)` — last 50 done tickets, IQR filter, EMA α=0.3, min 5 samples, clamped [1, 120]
- [x] FR-4: `recalculate-avg-prep` pg_cron — `*/30 * * * *`, `is_open = true` merchants only
- [x] FR-5: Settings panel `waittime` section — effective time, auto/manual badge, "last updated" timestamp
- [x] FR-6: `resetAvgPrepTimeAction` — sets both columns to NULL
- [ ] FR-7: Dedicated cron role with minimal privileges (beyond current `postgres`)

## 6. Data Contracts

### Existing tables/types

- `merchants`: `calculated_avg_prep_time INTEGER NULL`, `avg_prep_computed_at TIMESTAMPTZ NULL`
- `queue_items`: `status = 'done'`, `called_at`, `joined_at` (source for average)

### Schema changes (if any)

- [x] None (columns added in migration `20260305000001_auto_prep_time.sql`)

### Validation (Zod)

- Input schema(s): n/a (`resetAvgPrepTimeAction` has no input — auth only)
- Expected failure responses: `401`

## 7. API and Integration Contracts

### Route handlers

- n/a — Server Actions only

### External dependencies

- pg_cron (must be enabled in Supabase project settings)

## 8. UI and UX

- Entry points: Settings → Queue Configuration → Wait Time section
- Loading state: `useTransition` during reset action
- Empty state: "Temps manuel" badge when `calculated_avg_prep_time = NULL`
- Error state: Toast if `resetAvgPrepTimeAction` fails
- Accessibility notes: Explainability block uses plain language; reset dialog uses `Dialog` component with confirmation

## 9. Security and Privacy

- Secret/env requirements: none new
- Data retention and PII handling: n/a (aggregate only — no PII stored)
- Abuse/failure cases and mitigations: `calculate_avg_prep` is SECURITY DEFINER, PUBLIC execute revoked — only pg_cron (`postgres`) can call it

## 10. Observability

- Structured logs to emit: Cron run completion (merchant_id, new value, sample count), reset event
- Key counters/timers to track: Delta between `calculated_avg_prep_time` and `default_prep_time_min` per merchant
- Alert thresholds (if relevant): Cron failure rate > 5% → alert

## 11. Test Plan

### Unit

- IQR filter: spike at 200 min removed, clean values kept
- EMA: `0.3 × 10 + 0.7 × 8 = 8.6` (rounded)
- Minimum sample guard: 4 samples → no write; 5 samples → write

### Integration

- `calculate_avg_prep` called with < 5 tickets → `calculated_avg_prep_time` remains NULL
- `resetAvgPrepTimeAction` → both columns set to NULL

### Storybook (if UI)

- Story variant 1: Settings `WaitTime` card — manual mode (gray badge)
- Story variant 2: Settings `WaitTime` card — auto mode (green "Ajusté auto" badge, reset button)

### Manual QA

- Step 1: Complete 6+ tickets → verify cron (or manual invoke) updates `calculated_avg_prep_time`
- Step 2: Verify "Ajusté auto" badge appears in settings
- Step 3: Click "Réinitialiser" → verify manual mode restored

## 12. Implementation Plan

1. Milestone 1: Migration (new columns), `calculate_avg_prep` function, pg_cron job
2. Milestone 2: `getMerchantSettingsAction` updated, `resetAvgPrepTimeAction` added
3. Milestone 3: Settings panel `waittime` section UI with badge, explainability, reset button

## 13. Rollout and Backfill

- Feature flag needed: no
- Backfill required: no (NULL is the safe default)
- Rollback plan: Set `calculated_avg_prep_time = NULL` for all merchants; disable pg_cron job

## 14. Definition of Done

- [x] Implementation merged to main
- [x] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated
