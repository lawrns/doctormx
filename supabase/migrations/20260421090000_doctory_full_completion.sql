-- Production completion support: doctor subscriptions and listing state.

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS is_listed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS office_address TEXT,
  ADD COLUMN IF NOT EXISTS offers_video BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS offers_in_person BOOLEAN NOT NULL DEFAULT false;

UPDATE doctors
SET offers_video = COALESCE(video_enabled, offers_video, true),
    offers_in_person = COALESCE(offers_in_person, office_address IS NOT NULL, false);

ALTER TABLE doctor_subscriptions
  ADD COLUMN IF NOT EXISTS tier TEXT,
  ADD COLUMN IF NOT EXISTS billing_interval TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_recovery_url TEXT,
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_doctor_subscriptions_one_active_per_doctor
  ON doctor_subscriptions(doctor_id)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS doctor_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  cedula TEXT NOT NULL UNIQUE,
  sep_verified BOOLEAN NOT NULL DEFAULT false,
  verification_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE doctor_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own verification"
  ON doctor_verifications FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can upsert their own verification"
  ON doctor_verifications FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own verification"
  ON doctor_verifications FOR UPDATE
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage doctor verifications"
  ON doctor_verifications FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_doctor_verifications_doctor_id
  ON doctor_verifications(doctor_id);

CREATE INDEX IF NOT EXISTS idx_doctor_verifications_sep_verified
  ON doctor_verifications(sep_verified);
