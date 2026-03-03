-- ============================================================
-- Wait-Light — slug change rate-limit column
-- Adds `slug_last_changed_at` to merchants so the Server Action
-- can enforce a cooldown between slug changes and prevent
-- rapid slug enumeration attacks.
-- ============================================================

ALTER TABLE merchants
    ADD COLUMN IF NOT EXISTS slug_last_changed_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN merchants.slug_last_changed_at IS
    'Timestamp of the last slug change. Used server-side to enforce a 1-hour cooldown between changes.';
