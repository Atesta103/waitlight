# Feature 08: Flow Prediction & Statistics (Analytics)

* **Type**: Retention Evolution (Evolution)
* **Dependencies**: [Feature 03: Dashboard](./03_merchant_dashboard.md)

**Description**: An analytical summary to help the merchant anticipate the rush (stock, staff). For example, visualizing that Tuesdays at 12:30 PM is consistently the busiest period.

## Integration sub-tasks

### Backend (Supabase)
- [ ] Create a SQL materialized view (`merchant_analytics_view`) that aggregates the historical volume of `queue_items` by day of the week and time slot (avoiding slowing down the DB with large real-time `GROUP BY`s).
- [ ] Expose a secure Postgres RPC function or Server route `/api/analytics` that filters this view by `merchant_id`.
- [ ] Configure `pg_cron` to refresh the materialized view concurrently every night at 2:00 AM.

### Frontend (Next.js)
- [ ] Create a new `/(dashboard)/analytics` page with a clean, unified dashboard layout.
- [ ] Install a visualization library optimized for React (e.g., `Tremor`, `Recharts`, or `Chart.js`).
- [ ] Create a "Heatmap" component or "Rush Curve" with the data returned by the DB.
- [ ] Implement a Date Range picker (e.g., "Last 7 days", "This Month") using a library like `react-day-picker`.
- [ ] Provide an "Export to CSV" utility button.

## Identified additional tasks

### Quality & robustness
- [ ] **Empty States**: If a merchant just signed up, the charts must gracefully show an empty state illustration (e.g., "Not enough data yet. Check back after your first service!") rather than crashing or showing a blank grid.
- [ ] **Data Sparsity Smoothing**: If there are gaps in hours (e.g., no sales from 14:00 to 15:00), the line chart should interpolate linearly or plot 0 gracefully rather than breaking the sequence.

### UX & accessibility
- [ ] **Chart Tooltips**: Charts must be interactive. Hovering over a bar should display specific metrics (e.g., "Tuesday 12:00 - 45 tickets, avg wait: 8 mins").
- [ ] **Accessibility (A11y)**: Provide a visually hidden HTML `<table>` rendering the same data behind the canvas/SVG chart so screen readers can parse the analytics.

### Security
- [ ] **RLS on Analytics**: Ensure the RPC strictly enforces `merchant_id = auth.uid()` when querying the materialized view so cross-tenant data leakage is impossible.

## Architecture Notes
- Heavy aggregations belong in PostgreSQL, not in Node.js memory. The materialized view architecture means the Next.js frontend only ever receives ~20-50 pre-computed rows per request, keeping the dashboard lightning-fast.
