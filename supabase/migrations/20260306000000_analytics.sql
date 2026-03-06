-- ─────────────────────────────────────────────────────────────────────────────
-- Feature 08: Flow Prediction & Analytics
-- Materialized view + RPC + pg_cron nightly refresh
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Materialized view: pre-aggregates historical queue_items by merchant,
--    day-of-week (0=Sunday…6=Saturday) and hour slot (0–23).
--    Heavy GROUP BY runs once per night; Next.js only reads ~20-50 rows per request.
CREATE MATERIALIZED VIEW IF NOT EXISTS merchant_analytics_view AS
SELECT
    merchant_id,
    EXTRACT(DOW  FROM joined_at AT TIME ZONE 'UTC')::int  AS day_of_week,
    EXTRACT(HOUR FROM joined_at AT TIME ZONE 'UTC')::int  AS hour,
    COUNT(*)::int                                          AS ticket_count,
    ROUND(
        AVG(
            EXTRACT(EPOCH FROM (done_at - joined_at)) / 60.0
        )::numeric,
        1
    )                                                      AS avg_wait_minutes
FROM queue_items
WHERE status = 'done'
GROUP BY merchant_id, day_of_week, hour;

-- Index for fast per-merchant lookups
CREATE UNIQUE INDEX IF NOT EXISTS merchant_analytics_view_idx
    ON merchant_analytics_view (merchant_id, day_of_week, hour);

-- ─── RPC ─────────────────────────────────────────────────────────────────────
-- 2. get_analytics: returns rows for the authenticated merchant only.
--    auth.uid() check enforces RLS — cross-tenant leakage is impossible.
CREATE OR REPLACE FUNCTION get_analytics(p_merchant_id uuid)
RETURNS TABLE (
    day_of_week      int,
    hour             int,
    ticket_count     int,
    avg_wait_minutes numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
    SELECT
        day_of_week,
        hour,
        ticket_count,
        avg_wait_minutes
    FROM merchant_analytics_view
    WHERE merchant_id = p_merchant_id
      AND merchant_id = auth.uid()
    ORDER BY day_of_week, hour;
$$;

-- ─── RPC (date-range aware) ───────────────────────────────────────────────────
-- 2b. get_analytics_range: same shape but queries queue_items directly so it
--     supports optional date filters. Used when the merchant selects a preset
--     date range (7 days, this month, etc.) from the frontend.
--     When p_start / p_end are NULL the full history is returned.
CREATE OR REPLACE FUNCTION get_analytics_range(
    p_merchant_id uuid,
    p_start       timestamptz DEFAULT NULL,
    p_end         timestamptz DEFAULT NULL
)
RETURNS TABLE (
    day_of_week      int,
    hour             int,
    ticket_count     int,
    avg_wait_minutes numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
    SELECT
        EXTRACT(DOW  FROM joined_at AT TIME ZONE 'UTC')::int  AS day_of_week,
        EXTRACT(HOUR FROM joined_at AT TIME ZONE 'UTC')::int  AS hour,
        COUNT(*)::int                                          AS ticket_count,
        ROUND(
            AVG(
                EXTRACT(EPOCH FROM (done_at - joined_at)) / 60.0
            )::numeric,
            1
        )                                                      AS avg_wait_minutes
    FROM queue_items
    WHERE merchant_id = p_merchant_id
      AND merchant_id = auth.uid()
      AND status = 'done'
      AND (p_start IS NULL OR joined_at >= p_start)
      AND (p_end   IS NULL OR joined_at <  p_end)
    GROUP BY day_of_week, hour
    ORDER BY day_of_week, hour;
$$;

-- ─── pg_cron ─────────────────────────────────────────────────────────────────
-- 3. Refresh materialized view concurrently every night at 02:00 UTC.
--    Requires the pg_cron extension to be enabled in the Supabase project.
SELECT cron.schedule(
    'refresh-merchant-analytics',
    '0 2 * * *',
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY merchant_analytics_view;$$
);
