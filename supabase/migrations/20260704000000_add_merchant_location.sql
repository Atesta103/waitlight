-- ============================================================
-- Wait-Light — Merchant location for the discovery map
-- Adds an optional physical address + geocoded coordinates so a
-- merchant who opted into the public directory (is_public) can
-- also appear on the customer-facing discovery map at /carte.
-- A merchant without coordinates stays findable by name on
-- /retrouver but never appears on the map.
-- ============================================================

ALTER TABLE merchants ADD COLUMN address TEXT;
ALTER TABLE merchants ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE merchants ADD COLUMN longitude DOUBLE PRECISION;

COMMENT ON COLUMN merchants.address IS
    'Optional physical address, geocoded via api-adresse.data.gouv.fr. '
    'Only used to place the merchant on the public discovery map.';
COMMENT ON COLUMN merchants.latitude IS
    'Geocoded latitude. NULL means the merchant never appears on the map, '
    'regardless of is_public.';
COMMENT ON COLUMN merchants.longitude IS
    'Geocoded longitude. See latitude.';

-- Composite index used as a bounding-box pre-filter in nearby_public_merchants()
-- before the Haversine distance is computed — not a true radial index (no
-- PostGIS here), but enough to avoid a full scan at this scale.
CREATE INDEX IF NOT EXISTS merchants_public_geo_idx
    ON merchants (latitude, longitude)
    WHERE is_public = true AND latitude IS NOT NULL;

-- ──────────────────────────────────────────────────────────────
-- RPC: nearby_public_merchants
-- Returns publicly-listed, geocoded merchants within p_radius_km
-- of (p_lat, p_lng), nearest first. Bounding-box pre-filter keeps
-- the Haversine calculation off rows that can't possibly be in
-- range. SECURITY DEFINER so only the intended columns are ever
-- exposed, regardless of future RLS changes on merchants.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION nearby_public_merchants(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION DEFAULT 15,
    p_limit INTEGER DEFAULT 30
)
RETURNS TABLE (
    slug TEXT,
    name TEXT,
    business_type TEXT,
    logo_url TEXT,
    is_open BOOLEAN,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance_km DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    WITH bounded AS (
        SELECT
            m.slug, m.name, m.business_type, m.logo_url, m.is_open,
            m.address, m.latitude, m.longitude
        FROM merchants m
        WHERE m.is_public = true
          AND m.latitude IS NOT NULL
          AND m.longitude IS NOT NULL
          -- Bounding-box pre-filter (1 degree latitude ≈ 111km).
          AND m.latitude BETWEEN p_lat - (p_radius_km / 111.0) AND p_lat + (p_radius_km / 111.0)
          AND m.longitude BETWEEN p_lng - (p_radius_km / (111.0 * COS(RADIANS(p_lat)))) AND p_lng + (p_radius_km / (111.0 * COS(RADIANS(p_lat))))
    ),
    with_distance AS (
        SELECT
            *,
            6371 * ACOS(
                LEAST(1.0, GREATEST(-1.0,
                    COS(RADIANS(p_lat)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(p_lng))
                    + SIN(RADIANS(p_lat)) * SIN(RADIANS(latitude))
                ))
            ) AS distance_km
        FROM bounded
    )
    SELECT slug, name, business_type, logo_url, is_open, address, latitude, longitude, distance_km
    FROM with_distance
    WHERE distance_km <= p_radius_km
    ORDER BY distance_km ASC
    LIMIT p_limit;
$$;
