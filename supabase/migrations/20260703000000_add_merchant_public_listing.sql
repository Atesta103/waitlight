-- ============================================================
-- Wait-Light — Public directory opt-in
-- Adds an opt-in flag so a merchant chooses whether to appear in
-- the public directory used by the global /retrouver search (and,
-- later, a discovery map). Defaults to false so no merchant is
-- listed without explicit consent.
-- ============================================================

ALTER TABLE merchants ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN merchants.is_public IS
    'Opt-in: when true, the merchant is discoverable by name in the public '
    '/retrouver search (and future discovery map). Defaults to false.';

-- Speeds up name search over publicly listed merchants.
CREATE INDEX IF NOT EXISTS merchants_public_name_idx
    ON merchants (name)
    WHERE is_public = true;
