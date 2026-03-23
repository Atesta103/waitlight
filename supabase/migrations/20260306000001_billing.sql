-- Feature 13: Billing & Stripe
-- Creates the subscriptions table with RLS (read own only, service_role writes only).

-- moddatetime extension for auto-updating updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

CREATE TABLE public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id             UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  stripe_customer_id      TEXT NOT NULL,
  stripe_subscription_id  TEXT,
  stripe_price_id         TEXT,
  status                  TEXT NOT NULL DEFAULT 'incomplete',
  -- Possible statuses: active | trialing | past_due | canceled | incomplete | incomplete_expired | unpaid
  trial_end               TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one subscription row per merchant
CREATE UNIQUE INDEX subscriptions_merchant_id_key ON public.subscriptions(merchant_id);
CREATE INDEX subscriptions_stripe_customer_id_idx ON public.subscriptions(stripe_customer_id);
CREATE INDEX subscriptions_stripe_subscription_id_idx ON public.subscriptions(stripe_subscription_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Merchant can only SELECT their own row
CREATE POLICY "merchant_read_own_subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = merchant_id);

-- No INSERT / UPDATE / DELETE policy for anon or authenticated roles.
-- All writes go through the service_role admin client (webhook + billing-success route).
