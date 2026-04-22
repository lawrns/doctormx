-- Production completion support: doctor subscriptions and listing state.

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS is_listed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS office_address TEXT;

ALTER TABLE doctor_subscriptions
  ADD COLUMN IF NOT EXISTS tier TEXT,
  ADD COLUMN IF NOT EXISTS billing_interval TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE doctor_subscriptions
SET tier = COALESCE(tier, plan_id)
WHERE tier IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_stripe_customer_id
  ON doctors(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_doctors_is_listed
  ON doctors(is_listed)
  WHERE is_listed = true;

CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_tier
  ON doctor_subscriptions(tier);

CREATE UNIQUE INDEX IF NOT EXISTS idx_doctor_subscriptions_stripe_subscription_id_unique
  ON doctor_subscriptions(stripe_subscription_id);
