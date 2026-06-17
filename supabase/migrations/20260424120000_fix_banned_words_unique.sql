-- Drop the global unique constraint on word
ALTER TABLE public.banned_words DROP CONSTRAINT IF EXISTS banned_words_word_key;

-- Add a unique constraint per merchant
ALTER TABLE public.banned_words ADD CONSTRAINT banned_words_merchant_id_word_key UNIQUE (merchant_id, word);

-- Add DELETE policy for merchants to delete their own banned words
CREATE POLICY "Merchants can delete their own banned words"
  ON public.banned_words
  FOR DELETE
  USING (auth.uid() = merchant_id);
