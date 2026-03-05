# Feature 07: Automatic Preparation Time Adjustment

* **Type**: Advanced evolution (Evolution)
* **Dependencies**: [Feature 05: Wait Time Estimation](./05_estimated_wait_time.md)
* **Status**: ✅ Implemented (2026-03-05)

**Description**: The app subtly learns the actual pace of the merchant and transparently modifies the estimated time value based on reality, preventing false promises during overwhelming rush hours.

## Integration sub-tasks

### Backend (Supabase)

- [x] **Migration `20260305000001_auto_prep_time.sql`** — adds:
  - `merchants.calculated_avg_prep_time INTEGER NULL` — shadow column; NULL = algorithm not yet activated (< 5 valid samples). Falls back to `default_prep_time_min`.
  - `merchants.avg_prep_computed_at TIMESTAMPTZ NULL` — UTC timestamp of the last successful cron run.
- [x] **`calculate_avg_prep(p_merchant_id UUID)`** SQL function (SECURITY DEFINER):
  - Collects the last 50 completed tickets (`status = 'done'`, `called_at IS NOT NULL`).
  - Computes elapsed = `EXTRACT(EPOCH FROM (called_at - joined_at)) / 60` (minutes).
  - Applies **IQR outlier filter** (Tukey fences ×1.5) to remove extreme values.
  - Requires ≥ 5 valid samples post-filter before writing (prevents jumpy values on new accounts).
  - Applies **EMA smoothing**: `new = 0.3 × raw_avg + 0.7 × previous` (or raw_avg if NULL).
  - Clamps result to `[1, 120]` (same bounds as `default_prep_time_min`).
  - Updates `calculated_avg_prep_time` + `avg_prep_computed_at`.
- [x] **pg_cron job `recalculate-avg-prep`** — `*/30 * * * *` — runs only for merchants where `is_open = true`.

### Frontend (Next.js)

- [x] `app/[slug]/wait/[ticketId]/page.tsx` — queries `calculated_avg_prep_time` from `merchants`.
- [x] `WaitClient.tsx` — `effectivePrepTime = calculated_avg_prep_time ?? default_prep_time_min` used in `estimatedWaitMinutes` calculation.
- [x] `getMerchantSettingsAction` — returns `calculated_avg_prep_time` and `avg_prep_computed_at`.
- [x] `resetAvgPrepTimeAction` — new Server Action: sets both columns to NULL (returns merchant to manual mode).
- [x] **Settings panel `waittime` section** (live card):
  - Effective time displayed prominently (calculated or manual).
  - Badge: `"Ajusté auto"` (green, Sparkles icon) when algorithm is active; `"Temps manuel"` (gray) otherwise.
  - Explainability note: explains IQR, EMA, 30-min cadence, 5-ticket minimum.
  - "Dernière mise à jour: HH:MM" timestamp row.
  - **"Réinitialiser"** button (visible only when auto-mode active) with confirmation dialog.

## Identified additional tasks

### Quality & robustness
- [x] **Outlier Removal**: IQR-based filter (Tukey ×1.5) prevents stale "forgot to click done" tickets from skewing the average.
- [x] **Smooth Transitioning**: EMA (α=0.3) applied to prevent the estimate from jumping on a single rush hour.
- [x] **Minimum sample guard**: Algorithm stays dormant until ≥ 5 valid filtered samples exist.

### UX & accessibility
- [x] **Explainability**: Settings UI explains *why* the time is currently adjusted with a plain-language info block.
- [x] **Manual Override**: "Réinitialiser" kill-switch returns merchant to manual mode immediately.

### Security
- [x] **Execution Limits**: `calculate_avg_prep` is SECURITY DEFINER; PUBLIC execute privilege revoked; only `postgres` (cron) can call it.
- [ ] **Restricted cron role**: Further hardening — create a dedicated limited-privilege role for the cron job (beyond current `postgres`).

## Architecture Notes
- **O(1) reads**: The heavy average computation is pre-baked by the cron job. `WaitClient` simply reads the pre-computed integer column.
- **Graceful degradation**: `calculated_avg_prep_time = NULL` means the algorithm hasn't seen enough data. The client transparently falls back to `default_prep_time_min` without any UI change for the customer.
- **EMA α=0.3**: Weights new data at 30% and history at 70% — conservative enough to smooth rush-hour spikes without being too slow to adapt to a genuinely faster/slower service day.
