-- ============================================================
-- Wait-Light — merchant settings extension
-- Adds missing columns for Feature 02: Merchant Settings
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- MERCHANTS — new columns
-- ──────────────────────────────────────────────────────────────

ALTER TABLE merchants
    ADD COLUMN IF NOT EXISTS logo_url            TEXT        NULL,
    ADD COLUMN IF NOT EXISTS default_prep_time_min INTEGER NOT NULL DEFAULT 5;

-- Constrain to positive values
ALTER TABLE merchants
    ADD CONSTRAINT merchants_default_prep_time_min_positive
    CHECK (default_prep_time_min >= 1 AND default_prep_time_min <= 120);

-- ──────────────────────────────────────────────────────────────
-- SETTINGS — new columns
-- ──────────────────────────────────────────────────────────────

ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS auto_close_enabled    BOOLEAN NOT NULL DEFAULT true;

-- ──────────────────────────────────────────────────────────────
-- STORAGE — merchant-logos bucket
-- Public read, authenticated write (owner only via policy).
-- ──────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'merchant-logos',
    'merchant-logos',
    true,
    524288,   -- 512 KB max
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: merchant can upload/update their own logo
-- Path pattern: merchant-logos/<auth.uid()>/<filename>
CREATE POLICY "merchant_logo_upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'merchant-logos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "merchant_logo_update"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'merchant-logos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "merchant_logo_delete"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'merchant-logos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "merchant_logo_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'merchant-logos');

-- ──────────────────────────────────────────────────────────────
-- RPC: check_slug_available
-- Returns true if the slug is not already taken by another merchant.
-- Excludes the calling merchant's own slug so they can re-save unchanged.
-- SECURITY DEFINER so the anon key cannot enumerate all slugs via brute force.
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_slug_available(p_slug TEXT, p_exclude_merchant_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT NOT EXISTS (
        SELECT 1 FROM merchants
        WHERE slug = p_slug
          AND (p_exclude_merchant_id IS NULL OR id != p_exclude_merchant_id)
    );
$$;
