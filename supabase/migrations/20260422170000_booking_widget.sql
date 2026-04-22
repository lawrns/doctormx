-- Phase 3.1: embeddable booking widget support.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_lower
  ON profiles (LOWER(email))
  WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS doctor_widget_configs (
  doctor_id UUID PRIMARY KEY REFERENCES doctors(id) ON DELETE CASCADE,
  primary_color TEXT NOT NULL DEFAULT '#1f48de',
  accent_color TEXT NOT NULL DEFAULT '#00a878',
  enabled_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_title TEXT,
  custom_message TEXT,
  allowed_origins JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  CHECK (jsonb_typeof(enabled_services) = 'array'),
  CHECK (jsonb_typeof(allowed_origins) = 'array')
);

CREATE TABLE IF NOT EXISTS widget_booking_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  origin TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('pending_payment', 'paid', 'expired', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_widget_booking_intents_appointment
  ON widget_booking_intents(appointment_id);

CREATE INDEX IF NOT EXISTS idx_widget_booking_intents_doctor
  ON widget_booking_intents(doctor_id, created_at DESC);

ALTER TABLE doctor_widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_booking_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own widget config"
  ON doctor_widget_configs FOR SELECT
  USING (
    auth.uid() = doctor_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Doctors can create own widget config"
  ON doctor_widget_configs FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own widget config"
  ON doctor_widget_configs FOR UPDATE
  USING (
    auth.uid() = doctor_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.uid() = doctor_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE OR REPLACE FUNCTION update_doctor_widget_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS doctor_widget_configs_updated_at ON doctor_widget_configs;
CREATE TRIGGER doctor_widget_configs_updated_at
  BEFORE UPDATE ON doctor_widget_configs
  FOR EACH ROW EXECUTE FUNCTION update_doctor_widget_configs_updated_at();

CREATE OR REPLACE FUNCTION update_widget_booking_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS widget_booking_intents_updated_at ON widget_booking_intents;
CREATE TRIGGER widget_booking_intents_updated_at
  BEFORE UPDATE ON widget_booking_intents
  FOR EACH ROW EXECUTE FUNCTION update_widget_booking_intents_updated_at();
