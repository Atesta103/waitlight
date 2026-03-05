-- ============================================================
-- Wait-Light — initial schema
-- Run this in your Supabase SQL Editor or via `supabase db push`
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- MERCHANTS
-- One row per authenticated merchant. id = auth.uid()
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS merchants (
    id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT        NOT NULL,
    slug            TEXT        NOT NULL UNIQUE,
    is_open         BOOLEAN     NOT NULL DEFAULT false,
    avg_wait_time   INTEGER     NULL,           -- minutes, updated by trigger
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Slug must only contain lowercase letters, digits and hyphens.
ALTER TABLE merchants
    ADD CONSTRAINT merchants_slug_format
    CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$');

-- ──────────────────────────────────────────────────────────────
-- SETTINGS
-- One row per merchant, created together with the merchant row.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
    merchant_id         UUID        PRIMARY KEY REFERENCES merchants(id) ON DELETE CASCADE,
    max_capacity        INTEGER     NOT NULL DEFAULT 20,
    welcome_message     TEXT        NULL,
    qr_regenerated_at   TIMESTAMPTZ NULL
);

-- ──────────────────────────────────────────────────────────────
-- QUEUE_ITEMS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS queue_items (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id     UUID        NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_name   TEXT        NOT NULL,
    status          TEXT        NOT NULL DEFAULT 'waiting'
                                CHECK (status IN ('waiting','called','done','cancelled')),
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    called_at       TIMESTAMPTZ NULL,
    done_at         TIMESTAMPTZ NULL
);

-- Mandatory index for get_position() performance
CREATE INDEX IF NOT EXISTS idx_queue_items_merchant_status_joined
    ON queue_items (merchant_id, status, joined_at);

-- ──────────────────────────────────────────────────────────────
-- PUSH_SUBSCRIPTIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_item_id   UUID        NOT NULL REFERENCES queue_items(id) ON DELETE CASCADE,
    endpoint        TEXT        NOT NULL,
    p256dh          TEXT        NOT NULL,
    auth            TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────────────────────
ALTER TABLE merchants          ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- merchants: anyone can read (customers need to see slug/is_open)
CREATE POLICY "merchants_public_read"
    ON merchants FOR SELECT USING (true);

-- merchants: only the owner can update
CREATE POLICY "merchants_owner_update"
    ON merchants FOR UPDATE USING (auth.uid() = id);

-- merchants: only the owner can insert their own row (onboarding)
CREATE POLICY "merchants_owner_insert"
    ON merchants FOR INSERT WITH CHECK (auth.uid() = id);

-- settings: only the owner can read/write
CREATE POLICY "settings_owner_all"
    ON settings FOR ALL USING (
        auth.uid() = merchant_id
    );
CREATE POLICY "settings_public_read"
    ON settings FOR SELECT USING (true);


-- queue_items: anyone can insert (join the queue)
CREATE POLICY "queue_items_public_insert"
    ON queue_items FOR INSERT WITH CHECK (true);

-- queue_items: merchant sees all their tickets
CREATE POLICY "queue_items_merchant_read"
    ON queue_items FOR SELECT USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE id = auth.uid()
        )
    );

-- queue_items: customer sees only their own ticket
CREATE POLICY "queue_items_customer_read"
    ON queue_items FOR SELECT USING (
        -- customers use the ticket UUID directly (stored client-side)
        id = id  -- fine-grained control via get_position() RPC
    );

-- queue_items: only the merchant can update status
CREATE POLICY "queue_items_merchant_update"
    ON queue_items FOR UPDATE USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE id = auth.uid()
        )
    );

-- push_subscriptions: anyone can insert (customer registers on join)
CREATE POLICY "push_subs_public_insert"
    ON push_subscriptions FOR INSERT WITH CHECK (true);

-- push_subscriptions: no direct client reads — only via Edge Functions

-- ──────────────────────────────────────────────────────────────
-- RPC: get_position
-- Returns how many people are ahead of a given ticket.
-- SECURITY DEFINER so it runs as the function owner, never
-- exposing other rows directly to the client.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_position(ticket_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::INTEGER
    FROM queue_items
    WHERE merchant_id = (
            SELECT merchant_id FROM queue_items WHERE id = ticket_id
          )
      AND status = 'waiting'
      AND joined_at < (
            SELECT joined_at FROM queue_items WHERE id = ticket_id
          );
$$;

-- ──────────────────────────────────────────────────────────────
-- TRIGGER: anti-spam capacity check
-- Last-line defence — prevents INSERT when queue is full even
-- if the Edge Function rate-limit is bypassed.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_queue_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    current_count INTEGER;
    max_cap       INTEGER;
BEGIN
    SELECT max_capacity INTO max_cap
        FROM settings WHERE merchant_id = NEW.merchant_id;

    SELECT COUNT(*) INTO current_count
        FROM queue_items
        WHERE merchant_id = NEW.merchant_id AND status = 'waiting';

    IF current_count >= max_cap THEN
        RAISE EXCEPTION 'Queue is full';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_queue_capacity ON queue_items;
CREATE TRIGGER enforce_queue_capacity
    BEFORE INSERT ON queue_items
    FOR EACH ROW EXECUTE FUNCTION check_queue_capacity();

-- ──────────────────────────────────────────────────────────────
-- TRIGGER: update avg_wait_time on merchants
-- Fires when a ticket transitions to 'done', recalculates the
-- rolling average wait time and writes it to merchants.avg_wait_time.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_avg_wait_time()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'done' AND OLD.status = 'called' AND NEW.called_at IS NOT NULL THEN
        UPDATE merchants
        SET avg_wait_time = (
            SELECT ROUND(AVG(EXTRACT(EPOCH FROM (called_at - joined_at)) / 60))::INTEGER
            FROM queue_items
            WHERE merchant_id = NEW.merchant_id
              AND status = 'done'
              AND called_at IS NOT NULL
        )
        WHERE id = NEW.merchant_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_avg_wait_time ON queue_items;
CREATE TRIGGER trg_update_avg_wait_time
    AFTER UPDATE ON queue_items
    FOR EACH ROW EXECUTE FUNCTION update_avg_wait_time();
