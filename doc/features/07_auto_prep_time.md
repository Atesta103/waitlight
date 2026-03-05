# Feature 07: Automatic Preparation Time Adjustment (Machine Learning/Analytics)

* **Type**: Advanced evolution (Evolution)
* **Dependencies**: [Feature 05: Wait Time Estimation](./05_estimated_wait_time.md)

**Description**: The app subtly learns the actual pace of the merchant and transparently modifies the estimated time value based on reality, preventing false promises during overwhelming rush hours.

## Integration sub-tasks

### Backend (Supabase)
- [ ] Write a SQL function `calculate_avg_prep` that averages the time span between `joined_at` and `done_at` (or `called_at`) over the current rolling operational period.
- [ ] Configure **pg_cron** (via Supabase database settings) or a scheduled **Supabase Edge Function**.
- [ ] Set up the cron job to trigger calculation regularly (e.g., nightly, or every hour).
- [ ] If the calculated delta against `default_prep_time_min` is statistically significant (e.g., consistently 30%+ slower), write the new value into a shadow `calculated_avg_prep_time` column.

### Frontend (Next.js)
- [ ] Transition the client display (from Feature 05) to pull `calculated_avg_prep_time` preferentially, falling back to `default_prep_time_min` if null.
- [ ] In the merchant Dashboard (Settings), visually indicate "Time currently being adjusted automatically by AI Assistant" with a small informative sparkline or gauge.

## Identified additional tasks

### Quality & robustness
- [ ] **Outlier Removal**: The algorithm must strictly filter out tickets that span extreme times (e.g., ticket completed 4 hours later because the merchant forgot to click "done"). A simple interquartile range (IQR) check for time elapsed prevents skewed math.
- [ ] **Smooth Transitioning**: Values shouldn't jump drastically. Apply an Exponential Moving Average (EMA) to smooth out fluctuations.

### UX & accessibility
- [ ] **Explainability Badges**: In the merchant settings, add a tooltip (Popover) explaining *why* the time is currently adjusted. Example: "Based on the last 50 orders today, average time is up to 12 minutes."
- [ ] **Manual Override**: Always give the merchant a "Reset / Force Manual Mode" kill switch if they dislike the algorithm stepping in.

### Security
- [ ] **Execution Limits**: Ensure `pg_cron` runs under a restricted database role that only has `SELECT` access to `queue_items` and `UPDATE` on the specific shadow column, mitigating risk if the cron extension is misconfigured.

## Architecture Notes
- This feature moves logic from raw queries to asynchronous background workers. Because running heavy averages on `queue_items` per customer request will bottleneck PostgreSQL, the calculation is pre-baked periodically. Thus, reads remain O(1) instantaneous lookups on a single integer column.
