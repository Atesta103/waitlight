-- ============================================================
-- Wait-Light — Ticket recovery code
-- Adds a short, human-friendly code to each queue item so a
-- customer who lost their tracking link can retrieve it from
-- /{slug}/retrouver by entering their first name + this code.
-- Security relies on first-name + code + rate-limiting, not on
-- the code alone (it is short and shown to the customer).
-- ============================================================

ALTER TABLE queue_items ADD COLUMN recovery_code TEXT;

COMMENT ON COLUMN queue_items.recovery_code IS
    'Short human-friendly code (e.g. 4 chars, no ambiguous glyphs) shown '
    'to the customer at join. Combined with the first name on '
    '/{slug}/retrouver to recover the tracking link. Unique among a '
    'merchant''s active tickets, not globally.';

-- Speeds up recovery lookups (merchant_id + recovery_code among active tickets).
CREATE INDEX IF NOT EXISTS queue_items_recovery_lookup_idx
    ON queue_items (merchant_id, recovery_code)
    WHERE recovery_code IS NOT NULL;
