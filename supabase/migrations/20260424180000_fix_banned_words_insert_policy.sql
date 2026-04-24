-- Fix banned_words INSERT policy.
--
-- Problem: the original INSERT policy from 20260326000000_banned_words.sql uses:
--   WITH CHECK (auth.uid() = merchant_id OR merchant_id IS NULL)
--
-- After the phase2 migration altered the column, authenticated merchants were
-- being rejected with error code 42501 (RLS policy violation).
--
-- Fix: drop the old INSERT policy and create a clean one that only allows
-- authenticated merchants to insert rows for themselves.

-- Remove old conflicting INSERT policy (created in initial migration)
DROP POLICY IF EXISTS "Merchants can insert banned words" ON public.banned_words;

-- New INSERT policy: merchant must be authenticated and must own the row
CREATE POLICY "Merchants can insert their own banned words"
    ON public.banned_words
    FOR INSERT
    WITH CHECK (auth.uid() = merchant_id);
