# Feature 08: Flow Prediction & Analytics Dashboard

## 1. Metadata

- Feature: Analytics Dashboard & Rush Prediction
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 4
- Strategic priority: 3
- Time to code: 4
- Readiness score: 95/100
- Interest score: 80/100
- Source of truth:
  - Schema: `supabase/migrations/20260306000000_analytics.sql`
  - Route(s): `app/(dashboard)/analytics/`
  - UI entrypoint(s): `app/(dashboard)/analytics/page.tsx`

## 2. Problem and Outcome

### Problem

Merchants operate reactively — they only notice the rush when it's already overwhelming them. Without historical data, they cannot staff appropriately, pre-prepare orders, or plan their week.

### Target outcome

A visual analytics dashboard showing weekly rush patterns (heatmap), day-level bar charts, and date-range filtered history — so merchants can anticipate their busiest periods and staff accordingly.

### Success metrics

- Dashboard loads in < 1s (materialized view pre-computed)
- Heatmap correctly identifies top 3 rush windows for any merchant with > 2 weeks of data
- CSV export works offline (client-side blob)

## 3. Scope

### In scope

- `merchant_analytics_view` materialized view (hourly aggregation by day of week)
- `get_analytics` + `get_analytics_range` RPCs
- Heatmap component (CSS grid, 7 days × 24 hours)
- Rush Curve bar chart (Recharts)
- Date range presets (7 days, this month, 3 months, all)
- CSV export (client-side)
- Materialized view refresh via pg_cron (nightly 2 AM)

### Out of scope

- Real-time analytics (materialized view refreshed nightly)
- Predictive staffing recommendations
- Cross-merchant benchmarking

## 4. User Stories

- As a merchant, I want to see my busiest hours of the week so that I can prepare staff and stock ahead of time.
- As a merchant, I want to filter by date range so that I can compare specific periods.
- As a merchant, I want to export my data as CSV so that I can use it in my own spreadsheets.

## 5. Functional Requirements

- [x] FR-1: `merchant_analytics_view` — aggregates `queue_items` by `merchant_id`, day of week, hour
- [x] FR-2: Nightly pg_cron refresh (`0 2 * * *`) — `REFRESH MATERIALIZED VIEW CONCURRENTLY`
- [x] FR-3: `get_analytics(p_merchant_id UUID)` RPC — full history
- [x] FR-4: `get_analytics_range(p_merchant_id UUID, p_from, p_to)` RPC — date-filtered
- [x] FR-5: `AnalyticsDashboard` — Heatmap (CSS grid) + RushCurve (Recharts BarChart)
- [x] FR-6: Date range presets (7 jours / Ce mois / 3 mois / Tout l'historique)
- [x] FR-7: Client-side CSV export (blob download)
- [x] FR-8: Empty state when no data (`EmptyState` component with "Not enough data yet" message)
- [x] FR-9: All 24 hours always rendered (missing slots filled with `ticket_count: 0`)
- [x] FR-10: `aria-labelledby` on chart sections, `<table className="sr-only">` behind charts

## 6. Data Contracts

### Existing tables/types

- `queue_items`: `merchant_id`, `joined_at`, `called_at`, `status`
- `merchant_analytics_view`: `merchant_id`, `day_of_week`, `hour`, `ticket_count`, `avg_wait_minutes`

### Schema changes (if any)

- [x] None (view + RPCs created in migration `20260306000000_analytics.sql`)

### Validation (Zod)

- Input schema(s): `AnalyticsRangeSchema` (from/to dates)
- Expected failure responses: `401`, `400` (invalid date range)

## 7. API and Integration Contracts

### Route handlers

- n/a — Server Actions + RPCs only

### External dependencies

- `recharts` (BarChart, Tooltip)
- pg_cron (view refresh)

## 8. UI and UX

- Entry points: Dashboard sidebar → Analytics
- Loading state: Chart skeleton (gray rectangle placeholders)
- Empty state: `EmptyState` component — "Vos données apparaîtront après votre premier service."
- Error state: Toast on RPC failure; charts not rendered
- Accessibility notes: Screen-reader hidden `<table>` behind each chart; `aria-pressed` on range buttons; `aria-labelledby` on sections

## 9. Security and Privacy

- Secret/env requirements: none new
- Data retention and PII handling: Analytics are aggregated — no customer name, no individual ticket data exposed in analytics view
- Abuse/failure cases and mitigations: Both RPCs use `SECURITY INVOKER` + `AND merchant_id = auth.uid()` — cross-tenant leakage impossible

## 10. Observability

- Structured logs to emit: Analytics page load, CSV export triggered, date range selected
- Key counters/timers to track: Analytics query latency, view refresh duration
- Alert thresholds (if relevant): View refresh failure → alert

## 11. Test Plan

### Unit

- Date range preset logic: "7 jours" → correct `from/to` values

### Integration

- `get_analytics_range` RPC: valid merchant + date range → returns correct rows; foreign merchant → empty

### Storybook (if UI)

- Story variant 1: `AnalyticsDashboard` — with data (heatmap + rush curve)
- Story variant 2: `AnalyticsDashboard` — empty state

### Manual QA

- Step 1: Complete 10+ tickets over 2 days → open analytics → verify heatmap shows correct peaks
- Step 2: Change date range preset → verify chart updates
- Step 3: Export CSV → verify column structure and data accuracy

## 12. Implementation Plan

1. Milestone 1: `merchant_analytics_view`, `get_analytics` + `get_analytics_range` RPCs, pg_cron refresh
2. Milestone 2: `AnalyticsDashboard` section (Heatmap + RushCurve), date range presets
3. Milestone 3: CSV export, empty state, accessibility (`<table sr-only>`)

## 13. Rollout and Backfill

- Feature flag needed: no
- Backfill required: yes — run `REFRESH MATERIALIZED VIEW CONCURRENTLY merchant_analytics_view` once on first deployment
- Rollback plan: Hide analytics nav link; materialized view has no effect on existing features

## 14. Definition of Done

- [x] Implementation merged to main
- [x] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated
