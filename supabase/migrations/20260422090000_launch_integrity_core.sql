-- Launch integrity core: payment binding, booking holds, webhook idempotency.

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS provider_ref TEXT,
  ADD COLUMN IF NOT EXISTS fee_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_cents INTEGER,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ;

UPDATE payments
SET provider_ref = COALESCE(provider_ref, stripe_payment_intent_id),
    net_cents = COALESCE(net_cents, amount_cents)
WHERE provider_ref IS NULL
   OR net_cents IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_ref_unique
  ON payments(provider, provider_ref)
  WHERE provider_ref IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_doctor_start_active
  ON appointments(doctor_id, start_ts)
  WHERE status IN ('pending_payment', 'confirmed');

CREATE TABLE IF NOT EXISTS appointment_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_ts > start_ts),
  CHECK (expires_at > created_at),
  CHECK (status IN ('active', 'converted', 'expired', 'released'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointment_holds_doctor_start_active
  ON appointment_holds(doctor_id, start_ts)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_appointment_holds_expires
  ON appointment_holds(expires_at)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  payload_hash TEXT,
  error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, event_id),
  CHECK (status IN ('processing', 'processed', 'failed'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_messages_message_id_unique
  ON whatsapp_messages(whatsapp_message_id)
  WHERE whatsapp_message_id IS NOT NULL;
