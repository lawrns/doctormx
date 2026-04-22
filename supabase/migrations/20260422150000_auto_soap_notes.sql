-- ================================================
-- AutoSOAP: AI Clinical Scribing Tables
-- Phase 2 of Doctoralia gap closure
-- ================================================

-- Feature flags table (if not exists)
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 0,
  allowed_user_ids UUID[] DEFAULT NULL,
  allowed_subscription_tiers TEXT[] DEFAULT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinical SOAP notes for video consultations
CREATE TABLE IF NOT EXISTS soap_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'generating', 'pending_review', 'approved', 'rejected', 'archived')),

  -- Raw transcript / chat log
  transcript_raw TEXT,
  transcript_sources JSONB DEFAULT '[]', -- [{type: 'chat', content: '...', timestamp: '...'}, ...]

  -- SOAP sections
  soap_subjective TEXT,
  soap_objective TEXT,
  soap_assessment TEXT,
  soap_plan TEXT,

  -- Full structured JSON for flexibility
  soap_json JSONB,

  -- AI metadata
  ai_model TEXT,
  ai_confidence_score NUMERIC(3,2),
  ai_tokens_used INTEGER,
  ai_generated_at TIMESTAMPTZ,

  -- Doctor edits
  doctor_edits JSONB,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Patient-facing summary (what gets sent to patient)
  patient_summary TEXT,
  sent_to_patient_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_soap_notes_appointment ON soap_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_doctor ON soap_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_status ON soap_notes(status);
CREATE INDEX IF NOT EXISTS idx_soap_notes_created_at ON soap_notes(created_at DESC);

-- Row Level Security
ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;

-- Doctors can manage their own SOAP notes
CREATE POLICY "Doctors can manage their SOAP notes"
  ON soap_notes FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- Patients can view approved notes for their appointments
CREATE POLICY "Patients can view approved SOAP notes"
  ON soap_notes FOR SELECT
  USING (
    patient_id = auth.uid()
    AND status = 'approved'
  );

-- Admins can view all
CREATE POLICY "Admins can manage all SOAP notes"
  ON soap_notes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_soap_notes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS soap_notes_updated_at ON soap_notes;
CREATE TRIGGER soap_notes_updated_at
  BEFORE UPDATE ON soap_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_soap_notes_timestamp();

-- Seed default feature flags
INSERT INTO feature_flags (key, enabled, rollout_percentage, description)
VALUES
  ('ai_soap_notes_enabled', true, 100, 'Enable AI-generated SOAP notes from video consultation transcripts')
ON CONFLICT (key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Comments
COMMENT ON TABLE soap_notes IS 'AI-generated and doctor-reviewed SOAP notes for video consultations (AutoSOAP)';
