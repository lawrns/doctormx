-- ================================================
-- UNIFIED CARE CASE MODEL
-- Migration: Introduces care_cases as the single thread linking
-- all patient interactions (WhatsApp triage, web pre-consulta,
-- appointments, follow-ups) into one continuous care journey.
-- ================================================

-- ================================================
-- 1. care_cases
-- ================================================

CREATE TABLE care_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  phone_number TEXT,                          -- anonymous WhatsApp users
  channel TEXT NOT NULL,                      -- 'whatsapp' | 'web' | 'voice'
  status TEXT NOT NULL DEFAULT 'open',        -- 'open' | 'triaged' | 'routed' | 'in_care' | 'closed' | 'escalated'

  -- Triage summary (structured columns, not a JSONB blob)
  chief_complaint TEXT,
  symptoms TEXT[],
  urgency TEXT,                               -- 'low' | 'medium' | 'high' | 'emergency'
  specialty TEXT,                             -- canonical slug e.g. 'cardiologia'
  specialty_confidence NUMERIC(4,3),          -- 0.000 – 1.000
  red_flags TEXT[],
  recommended_action TEXT,                    -- 'book-appointment' | 'seek-emergency' | 'self-care'

  -- Routing decision
  routed_to TEXT,                             -- 'self-care' | 'emergency' | 'doctor' | 'pharmacy' | 'lab'
  assigned_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- ================================================
-- 2. care_case_events (append-only audit trail)
-- ================================================

CREATE TABLE care_case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_case_id UUID NOT NULL REFERENCES care_cases(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,                   -- 'created' | 'message' | 'triage_completed' | 'routed' | 'doctor_assigned' | 'appointment_booked' | 'appointment_completed' | 'follow_up_sent' | 'closed' | 'escalated'
  actor_type TEXT,                            -- 'patient' | 'ai' | 'doctor' | 'system'
  actor_id UUID,
  payload JSONB,                              -- event-specific data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- 3. ai_audit_logs (referenced in code but missing from schema)
-- ================================================

CREATE TABLE ai_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_type TEXT,
  input JSONB,
  output JSONB,
  model TEXT,
  tokens INTEGER,
  cost NUMERIC(10,6),
  latency_ms INTEGER,
  status TEXT NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- 4. Add care_case_id FK to existing session tables
-- ================================================

ALTER TABLE soap_consultations
  ADD COLUMN IF NOT EXISTS care_case_id UUID REFERENCES care_cases(id) ON DELETE SET NULL;

ALTER TABLE whatsapp_sessions
  ADD COLUMN IF NOT EXISTS care_case_id UUID REFERENCES care_cases(id) ON DELETE SET NULL;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS care_case_id UUID REFERENCES care_cases(id) ON DELETE SET NULL;

ALTER TABLE followups
  ADD COLUMN IF NOT EXISTS care_case_id UUID REFERENCES care_cases(id) ON DELETE SET NULL;

-- ================================================
-- 5. Indexes
-- ================================================

CREATE INDEX idx_care_cases_patient_id ON care_cases(patient_id);
CREATE INDEX idx_care_cases_phone_number ON care_cases(phone_number);
CREATE INDEX idx_care_cases_status ON care_cases(status);
CREATE INDEX idx_care_cases_channel ON care_cases(channel);

CREATE INDEX idx_care_case_events_care_case_id ON care_case_events(care_case_id);
CREATE INDEX idx_care_case_events_event_type ON care_case_events(event_type);

CREATE INDEX idx_ai_audit_logs_user_id ON ai_audit_logs(user_id);
CREATE INDEX idx_ai_audit_logs_operation ON ai_audit_logs(operation);
CREATE INDEX idx_ai_audit_logs_created_at ON ai_audit_logs(created_at);

-- FK indexes on altered tables
CREATE INDEX IF NOT EXISTS idx_soap_consultations_care_case ON soap_consultations(care_case_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_care_case ON whatsapp_sessions(care_case_id);
CREATE INDEX IF NOT EXISTS idx_appointments_care_case ON appointments(care_case_id);
CREATE INDEX IF NOT EXISTS idx_followups_care_case ON followups(care_case_id);

-- ================================================
-- 6. Row Level Security
-- ================================================

ALTER TABLE care_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- Patients see their own care cases
CREATE POLICY "patients_own_care_cases" ON care_cases
  FOR SELECT
  USING (patient_id = auth.uid());

-- Doctors see care cases assigned to them
CREATE POLICY "doctors_assigned_care_cases" ON care_cases
  FOR SELECT
  USING (assigned_doctor_id = auth.uid());

-- Admins see all care cases
CREATE POLICY "admins_all_care_cases" ON care_cases
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Service role full access on care_cases
CREATE POLICY "service_role_care_cases" ON care_cases
  FOR ALL
  USING (auth.role() = 'service_role');

-- Events: follow care_case visibility
CREATE POLICY "care_case_events_patient" ON care_case_events
  FOR SELECT
  USING (care_case_id IN (
    SELECT id FROM care_cases WHERE patient_id = auth.uid()
  ));

CREATE POLICY "care_case_events_doctor" ON care_case_events
  FOR SELECT
  USING (care_case_id IN (
    SELECT id FROM care_cases WHERE assigned_doctor_id = auth.uid()
  ));

CREATE POLICY "care_case_events_admin" ON care_case_events
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "service_role_care_case_events" ON care_case_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- Audit logs: service role only
CREATE POLICY "service_role_ai_audit_logs" ON ai_audit_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================
-- 7. updated_at trigger for care_cases
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_care_cases_updated_at
  BEFORE UPDATE ON care_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
