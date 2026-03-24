-- Add bypass_paywall flag to allow special users to skip the Stripe subscription check
ALTER TABLE public.merchants ADD COLUMN bypass_paywall BOOLEAN NOT NULL DEFAULT FALSE;
