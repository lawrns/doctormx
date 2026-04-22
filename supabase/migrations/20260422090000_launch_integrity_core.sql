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

-- Some early remote databases have migration 004 recorded but are missing the
-- WhatsApp tables. Recreate the 004 shape before adding launch idempotency.
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL,
  patient_id UUID REFERENCES profiles(id),
  assigned_doctor_id UUID REFERENCES doctors(id),
  state TEXT NOT NULL DEFAULT 'triage',
  triage_summary JSONB,
  handoff_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES whatsapp_sessions(id),
  body TEXT NOT NULL,
  direction TEXT NOT NULL,
  sender_type TEXT NOT NULL,
  sender_id UUID,
  media_url TEXT,
  media_type TEXT,
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE whatsapp_sessions
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS assigned_doctor_id UUID REFERENCES doctors(id),
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'triage',
  ADD COLUMN IF NOT EXISTS triage_summary JSONB,
  ADD COLUMN IF NOT EXISTS handoff_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE whatsapp_messages
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES whatsapp_sessions(id),
  ADD COLUMN IF NOT EXISTS body TEXT,
  ADD COLUMN IF NOT EXISTS direction TEXT,
  ADD COLUMN IF NOT EXISTS sender_type TEXT,
  ADD COLUMN IF NOT EXISTS sender_id UUID,
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone
  ON whatsapp_sessions(phone_number);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session
  ON whatsapp_messages(session_id);

ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_messages_message_id_unique
  ON whatsapp_messages(whatsapp_message_id)
  WHERE whatsapp_message_id IS NOT NULL;
