ALTER TABLE merchants ADD COLUMN business_type TEXT NOT NULL DEFAULT 'retail' CHECK (business_type IN ('food', 'healthcare', 'retail', 'public_service'));
ALTER TABLE queue_items ADD COLUMN entry_source TEXT NOT NULL DEFAULT 'qr' CHECK (entry_source IN ('qr','manual'));
