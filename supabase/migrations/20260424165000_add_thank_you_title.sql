-- Add a custom title for the completed-ticket banner shown to clients.
ALTER TABLE public.settings
    ADD COLUMN IF NOT EXISTS thank_you_title TEXT NULL;