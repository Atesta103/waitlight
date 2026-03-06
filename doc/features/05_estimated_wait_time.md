# Feature 05: Estimated Wait Time Calculation

* **Type**: Highly useful evolution (Core/Evo)
* **Dependencies**: [Feature 04: Client Display](./04_client_display.md), [Feature 03: Dashboard](./03_merchant_dashboard.md)
* **Status**: ✅ Implemented (2026-03-06)

**Description**: Transform the raw position (e.g., "#3") into actionable information (e.g., "Wait time: ~8 min"). Customers perceive waiting to be shorter when an explicit duration is provided.

## Integration sub-tasks

### Backend (Supabase)
- [x] Effective prep time now sourced from `merchants.calculated_avg_prep_time` (Feature 07), with fallback to `default_prep_time_min`. No need for a separate RPC — reads are O(1) from the pre-computed column.
- [ ] *(Optional)* Improve `get_position` RPC to return `estimated_time` directly as a single round-trip optimization.

### Frontend (Next.js)
- [x] `WaitClient` calculates `effectivePrepTime = calculated_avg_prep_time ?? default_prep_time_min`, multiplies by position, passes `estimatedWaitMinutes` to `CustomerWaitView`.
- [x] `QueuePositionCard` renders the **Time Pill** with `Clock` icon (`~N min` text), humanized boundary (`"Moins d'une minute"` for < 1 min).
- [x] **Wall-clock ETA**: `EstimatedClockTime` sub-component computes `Date.now() + minutes × 60_000` and displays `"Votre tour vers HH:MM"` with `CalendarClock` icon (client-side only to avoid SSR mismatch).
- [x] **Advance badge**: `QueuePositionCard` detects forward movement and briefly shows `"↑ vous avancez !"` with a pop-in/out animation.
- [x] **Humanized language**: `< 1 min` → `"Moins d'une minute"`, `1 min` → `"~1 minute"`, `N min` → `"~N min"`.

## Identified additional tasks

### Quality & robustness
- [ ] **Client-side Countdown**: Locally count seconds between queue shifts (no backend polling needed). Currently only updates on Realtime events.
- [x] **Boundary at position 0**: Position 0 now shows a pulsing green `"D'un instant à l'autre…"` pill instead of hiding the time section.

### UX & accessibility
- [x] **Visual Thresholds**: `TimePill` component color-codes urgency — gray (> 5 min), orange (≤ 5 min), pulsing red (< 1 min). Position 0 shows dedicated pulsing green state.
- [ ] **Merchant ticket view**: Optionally show estimated time on each ticket card in `QueueList` to help staff prioritize.

### Security
- [x] **Server-fetched effective time**: `calculated_avg_prep_time` is computed server-side via `calculate_avg_prep()` and fetched from the DB — cannot be tampered with client-side.

## Architecture Notes
- The heavy averaging is pre-baked by the pg_cron job every 30 min (Feature 07). `WaitClient` reads a single integer column — O(1).
- `EstimatedClockTime` sets state only inside `useEffect` to prevent server/client hydration mismatches.
