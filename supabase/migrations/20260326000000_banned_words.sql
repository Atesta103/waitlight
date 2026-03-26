
-- Banned words table for name filtering
CREATE TABLE public.banned_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL
);

ALTER TABLE public.banned_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read banned words"
  ON public.banned_words
  FOR SELECT
  USING (true);

CREATE POLICY "Merchants can insert banned words"
  ON public.banned_words
  FOR INSERT
  WITH CHECK (auth.uid() = merchant_id OR merchant_id IS NULL);

ALTER TABLE public.queue_items
  ADD COLUMN name_flagged BOOLEAN NOT NULL DEFAULT false;
