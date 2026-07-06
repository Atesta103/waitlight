-- ============================================================
-- Wait-Light — Assisted QR mode
-- Adds a per-merchant default display mode (kiosk vs assisted),
-- tags each generated token with its source, and extends
-- queue_items.entry_source so assisted joins are distinguishable
-- from self-service kiosk joins.
-- ============================================================

-- qr_tokens.source: which display mode generated this token.
-- Read by joinQueueAction() after a successful validate_qr_token()
-- call to decide the entry_source — never trusted from a client
-- query param, since that would be trivially spoofable.
ALTER TABLE qr_tokens ADD COLUMN source TEXT NOT NULL DEFAULT 'kiosk'
    CHECK (source IN ('kiosk', 'assisted'));

COMMENT ON COLUMN qr_tokens.source IS
    'Display mode that generated this token: kiosk (public rotating '
    'screen) or assisted (single QR shown by staff to one customer). '
    'Read after validation to set queue_items.entry_source.';

-- settings.qr_mode: merchant's default QR display mode, set at
-- onboarding and editable from settings. Drives the initial mode
-- of /qr, /dashboard/qr-display and the dashboard queue section.
ALTER TABLE settings ADD COLUMN qr_mode TEXT NOT NULL DEFAULT 'kiosk'
    CHECK (qr_mode IN ('kiosk', 'assisted'));

COMMENT ON COLUMN settings.qr_mode IS
    'Default QR display mode for this merchant: kiosk (rotating QR on '
    'a public screen) or assisted (single-use QR shown by staff at '
    'intake). Chosen at onboarding, changeable in settings.';

-- Extend queue_items.entry_source to include 'assisted'.
ALTER TABLE queue_items DROP CONSTRAINT IF EXISTS queue_items_entry_source_check;
ALTER TABLE queue_items ADD CONSTRAINT queue_items_entry_source_check
    CHECK (entry_source IN ('qr', 'manual', 'assisted'));
