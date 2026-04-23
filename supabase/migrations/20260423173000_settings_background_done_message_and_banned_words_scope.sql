-- Add queue customization fields
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS done_message TEXT NULL,
  ADD COLUMN IF NOT EXISTS wait_background_url TEXT NULL;

-- Banned words must be merchant-scoped (not global)
ALTER TABLE public.banned_words
  DROP CONSTRAINT IF EXISTS banned_words_word_key;

DROP INDEX IF EXISTS banned_words_merchant_word_unique_idx;
CREATE UNIQUE INDEX IF NOT EXISTS banned_words_merchant_word_unique_idx
  ON public.banned_words (merchant_id, lower(word));

-- Ensure only merchant-owned insertions are accepted
DROP POLICY IF EXISTS "Merchants can insert banned words" ON public.banned_words;
CREATE POLICY "Merchants can insert banned words"
  ON public.banned_words
  FOR INSERT
  WITH CHECK (auth.uid() = merchant_id);

-- Allow merchant to remove their own banned words from Settings UI
CREATE POLICY "Merchants can delete own banned words"
  ON public.banned_words
  FOR DELETE
  USING (auth.uid() = merchant_id);
