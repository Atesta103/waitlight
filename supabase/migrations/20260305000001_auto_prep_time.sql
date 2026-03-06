-- ============================================================
-- Wait-Light — Feature 07: Automatic Preparation Time
-- Adds:
--   • merchants.calculated_avg_prep_time — shadow column
--   • merchants.avg_prep_computed_at     — last cron run timestamp
--   • calculate_avg_prep(p_merchant_id)  — IQR + EMA algorithm
--   • pg_cron job every 30 minutes for open merchants
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- MERCHANTS — new columns
-- ──────────────────────────────────────────────────────────────

-- Shadow column: NULL = algorithm has not activated yet (< 5 valid tickets).
-- When set, WaitClient uses this value instead of default_prep_time_min.
ALTER TABLE merchants
    ADD COLUMN IF NOT EXISTS calculated_avg_prep_time INTEGER NULL
        CONSTRAINT merchants_calc_prep_positive
        CHECK (calculated_avg_prep_time IS NULL
            OR (calculated_avg_prep_time >= 1 AND calculated_avg_prep_time <= 120));

COMMENT ON COLUMN merchants.calculated_avg_prep_time IS
    'Auto-computed average preparation time in minutes. '
    'Computed by calculate_avg_prep() every 30 min. '
    'NULL = not enough data yet; falls back to default_prep_time_min.';

-- Timestamp of the last successful cron run for this merchant.
-- Displayed in the settings UI as "Dernière mise à jour: HH:MM".
ALTER TABLE merchants
    ADD COLUMN IF NOT EXISTS avg_prep_computed_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN merchants.avg_prep_computed_at IS
    'UTC timestamp of the last calculate_avg_prep() execution for this merchant.';

-- ──────────────────────────────────────────────────────────────
-- FUNCTION: calculate_avg_prep
--
-- Algorithm:
--   1. Take the last N_TICKETS completed tickets (called_at IS NOT NULL).
--   2. Compute elapsed = EXTRACT(EPOCH FROM (called_at - joined_at)) / 60.
--   3. Apply IQR filter: discard values outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR].
--   4. Require at least MIN_TICKETS valid samples after filtering.
--   5. Compute raw_avg from the filtered set.
--   6. Apply EMA: new = 0.3 × raw_avg + 0.7 × previous  (or raw_avg if NULL).
--   7. Clamp to [1, 120].
--   8. Write to calculated_avg_prep_time + avg_prep_computed_at.
--
-- Security: SECURITY DEFINER, called only by the cron job / SQL editor.
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_avg_prep(p_merchant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    -- Tunables
    N_TICKETS    CONSTANT INTEGER := 50;   -- ticket window
    MIN_TICKETS  CONSTANT INTEGER := 5;    -- minimum valid samples required
    EMA_ALPHA    CONSTANT NUMERIC := 0.3;  -- weight of new vs old value
    IQR_FACTOR   CONSTANT NUMERIC := 1.5;  -- standard Tukey fence multiplier

    -- Working variables
    v_previous       INTEGER;
    v_elapsed_values NUMERIC[];
    v_q1             NUMERIC;
    v_q3             NUMERIC;
    v_iqr            NUMERIC;
    v_lower_fence    NUMERIC;
    v_upper_fence    NUMERIC;
    v_filtered       NUMERIC[];
    v_raw_avg        NUMERIC;
    v_smoothed       NUMERIC;
    v_result         INTEGER;
BEGIN
    -- ── 0. Read current shadow value (for EMA) ───────────────────────────────
    SELECT calculated_avg_prep_time INTO v_previous
        FROM merchants WHERE id = p_merchant_id;

    -- ── 1. Collect last N_TICKETS elapsed times (minutes) ───────────────────
    SELECT ARRAY(
        SELECT EXTRACT(EPOCH FROM (called_at - joined_at)) / 60.0
        FROM   queue_items
        WHERE  merchant_id = p_merchant_id
          AND  status      = 'done'
          AND  called_at IS NOT NULL
          AND  called_at  > joined_at  -- sanity guard
        ORDER  BY done_at DESC
        LIMIT  N_TICKETS
    ) INTO v_elapsed_values;

    -- ── 2. Insufficient raw data — abort, leave column unchanged ────────────
    IF array_length(v_elapsed_values, 1) IS NULL
       OR array_length(v_elapsed_values, 1) < MIN_TICKETS THEN
        RETURN;
    END IF;

    -- ── 3. IQR outlier removal ───────────────────────────────────────────────
    -- Compute Q1 and Q3 using percentile_cont on the collected array.
    SELECT
        percentile_cont(0.25) WITHIN GROUP (ORDER BY v) ,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY v)
    INTO v_q1, v_q3
    FROM unnest(v_elapsed_values) AS t(v);

    v_iqr         := v_q3 - v_q1;
    v_lower_fence := v_q1 - IQR_FACTOR * v_iqr;
    v_upper_fence := v_q3 + IQR_FACTOR * v_iqr;

    -- Keep only values within the Tukey fences
    SELECT ARRAY(
        SELECT v FROM unnest(v_elapsed_values) AS t(v)
        WHERE v >= v_lower_fence AND v <= v_upper_fence
    ) INTO v_filtered;

    -- ── 4. Check minimum after filtering ───────────────────────────────────
    IF array_length(v_filtered, 1) IS NULL
       OR array_length(v_filtered, 1) < MIN_TICKETS THEN
        RETURN;
    END IF;

    -- ── 5. Compute raw average of filtered set ──────────────────────────────
    SELECT AVG(v) INTO v_raw_avg
    FROM unnest(v_filtered) AS t(v);

    -- ── 6. EMA smoothing ────────────────────────────────────────────────────
    IF v_previous IS NOT NULL THEN
        v_smoothed := EMA_ALPHA * v_raw_avg + (1.0 - EMA_ALPHA) * v_previous;
    ELSE
        v_smoothed := v_raw_avg;
    END IF;

    -- ── 7. Clamp and round to nearest integer ───────────────────────────────
    v_result := GREATEST(1, LEAST(120, ROUND(v_smoothed)::INTEGER));

    -- ── 8. Persist ───────────────────────────────────────────────────────────
    UPDATE merchants
        SET calculated_avg_prep_time = v_result,
            avg_prep_computed_at     = NOW()
        WHERE id = p_merchant_id;
END;
$$;

REVOKE ALL ON FUNCTION calculate_avg_prep(UUID) FROM PUBLIC;
-- Callable by the cron job and by authenticated merchants (for manual SQL testing)
GRANT EXECUTE ON FUNCTION calculate_avg_prep(UUID) TO postgres;

COMMENT ON FUNCTION calculate_avg_prep IS
    'Recomputes merchants.calculated_avg_prep_time using IQR outlier filtering '
    'and EMA smoothing (α=0.3) over the last 50 completed tickets. '
    'Requires ≥5 valid samples post-filter; no-ops otherwise. '
    'Called every 30 min by pg_cron for open merchants.';

-- ──────────────────────────────────────────────────────────────
-- CRON JOB: run calculate_avg_prep every 30 minutes
-- Only processes merchants whose queue is currently open to
-- avoid burning DB cycles overnight.
--
-- Requires pg_cron extension (same pattern as cleanup-qr-tokens).
-- The DO block skips gracefully if pg_cron is not enabled.
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        -- Remove any existing job with this name before re-registering
        IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'recalculate-avg-prep') THEN
            PERFORM cron.unschedule('recalculate-avg-prep');
        END IF;

        PERFORM cron.schedule(
            'recalculate-avg-prep',
            '*/30 * * * *',
            'SELECT calculate_avg_prep(id) FROM merchants WHERE is_open = true'
        );
        RAISE NOTICE 'pg_cron job "recalculate-avg-prep" registered (every 30 min).';
    ELSE
        RAISE NOTICE
            'pg_cron is not enabled. Enable it in the Supabase Dashboard '
            '(Database → Extensions → pg_cron) then run: '
            'SELECT cron.schedule(''recalculate-avg-prep'', ''*/30 * * * *'', '
            '''SELECT calculate_avg_prep(id) FROM merchants WHERE is_open = true'');';
    END IF;
END;
$$;
