-- ============================================================
-- Wait-Light — Phase 2 settings extensions
-- Adds: per-merchant banned_words uniqueness, thank_you_message,
--        background_url, schedule, notification preferences,
--        merchant-backgrounds storage bucket
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- BANNED_WORDS — fix unique constraint to be per-merchant
-- Currently word is globally unique; we need per-merchant uniqueness.
-- ──────────────────────────────────────────────────────────────

-- Drop the old global unique constraint on word
ALTER TABLE public.banned_words DROP CONSTRAINT IF EXISTS banned_words_word_key;

-- Add merchant_id to banned_words
ALTER TABLE public.banned_words
    ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE;

-- Add per-merchant unique constraint (word + merchant_id)
ALTER TABLE public.banned_words
    ADD CONSTRAINT banned_words_word_merchant_unique UNIQUE (word, merchant_id);

-- Allow merchants to update their own banned words
CREATE POLICY "Merchants can update banned words"
    ON public.banned_words FOR UPDATE
    USING (auth.uid() = merchant_id);

-- Allow merchants to delete their own banned words
CREATE POLICY "Merchants can delete banned words"
    ON public.banned_words FOR DELETE
    USING (auth.uid() = merchant_id);

-- ──────────────────────────────────────────────────────────────
-- SETTINGS — new columns
-- ──────────────────────────────────────────────────────────────

-- Custom "thank you" message displayed when a customer's ticket is completed
ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS thank_you_message TEXT NULL;

-- Merchant schedule: per-day-of-week open/close hours + exception dates
-- Schema: {
--   "weekly": { "0": {"open":"09:00","close":"18:00"}, "1": {...}, ..., "6": null },
--   "exceptions": [{"date":"2026-12-25","closed":true}, {"date":"2026-12-31","open":"10:00","close":"14:00"}]
-- }
ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS schedule JSONB NULL;

-- Notification channel preferences (what channels the merchant enables for client alerts)
ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS notification_channels JSONB NOT NULL DEFAULT '{"sound":true,"vibrate":true,"toast":true,"push":true}';

-- Sound preset name for client notifications
ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS notification_sound TEXT NOT NULL DEFAULT 'arpeggio';

-- "Approaching turn" notification: position-based
ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS approaching_position_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS approaching_position_threshold INTEGER NOT NULL DEFAULT 3;

-- "Approaching turn" notification: time-based
ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS approaching_time_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS approaching_time_threshold_min INTEGER NOT NULL DEFAULT 5;

-- ──────────────────────────────────────────────────────────────
-- MERCHANTS — background image URL
-- ──────────────────────────────────────────────────────────────

ALTER TABLE merchants
    ADD COLUMN IF NOT EXISTS background_url TEXT NULL;

-- ──────────────────────────────────────────────────────────────
-- STORAGE — merchant-backgrounds bucket
-- Public read, authenticated write (owner only via policy).
-- ──────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'merchant-backgrounds',
    'merchant-backgrounds',
    true,
    2097152,   -- 2 MB max
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for merchant-backgrounds (same pattern as merchant-logos)
CREATE POLICY "merchant_bg_upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'merchant-backgrounds'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "merchant_bg_update"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'merchant-backgrounds'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "merchant_bg_delete"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'merchant-backgrounds'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "merchant_bg_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'merchant-backgrounds');
