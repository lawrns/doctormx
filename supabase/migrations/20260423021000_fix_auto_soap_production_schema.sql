-- ================================================
-- AutoSOAP production schema reconciliation
-- ================================================
-- Production already had an older feature_flags table using
-- name/is_active. Add the newer columns expected by the feature flag
-- service without dropping existing data, then create soap_notes.

ALTER TABLE feature_flags
  ADD COLUMN IF NOT EXISTS key TEXT,
  ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS rollout_percentage INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS allowed_user_ids UUID[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS allowed_subscription_tiers TEXT[] DEFAULT NULL;

UPDATE feature_flags
SET
  key = COALESCE(key, name),
  enabled = COALESCE(enabled, is_active, false),
  rollout_percentage = COALESCE(rollout_percentage, CASE WHEN is_active THEN 100 ELSE 0 END, 0)
WHERE key IS NULL
   OR enabled IS NULL
   OR rollout_percentage IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS feature_flags_key_key ON feature_flags(key);

INSERT INTO feature_flags (
  name,
  is_active,
  key,
  enabled,
  rollout_percentage,
  description
)
VALUES (
  'ai_soap_notes_enabled',
  true,
  'ai_soap_notes_enabled',
  true,
  100,
  'Enable AI-generated SOAP notes from video consultation transcripts'
)
ON CONFLICT (key) DO UPDATE SET
  name = COALESCE(feature_flags.name, EXCLUDED.name),
  is_active = EXCLUDED.is_active,
  enabled = EXCLUDED.enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  description = EXCLUDED.description,
  updated_at = NOW();

CREATE TABLE IF NOT EXISTS soap_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'generating', 'pending_review', 'approved', 'rejected', 'archived')),

  transcript_raw TEXT,
  transcript_sources JSONB DEFAULT '[]'::jsonb,

  soap_subjective TEXT,
  soap_objective TEXT,
  soap_assessment TEXT,
  soap_plan TEXT,
  soap_json JSONB,

  ai_model TEXT,
  ai_confidence_score NUMERIC(3,2),
  ai_tokens_used INTEGER,
  ai_generated_at TIMESTAMPTZ,

  doctor_edits JSONB,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  patient_summary TEXT,
  sent_to_patient_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soap_notes_appointment ON soap_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_doctor ON soap_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_status ON soap_notes(status);
CREATE INDEX IF NOT EXISTS idx_soap_notes_created_at ON soap_notes(created_at DESC);

ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'soap_notes'
      AND policyname = 'Doctors can manage their SOAP notes'
  ) THEN
    CREATE POLICY "Doctors can manage their SOAP notes"
      ON soap_notes FOR ALL
      USING (doctor_id = auth.uid())
      WITH CHECK (doctor_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'soap_notes'
      AND policyname = 'Patients can view approved SOAP notes'
  ) THEN
    CREATE POLICY "Patients can view approved SOAP notes"
      ON soap_notes FOR SELECT
      USING (
        patient_id = auth.uid()
        AND status = 'approved'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'soap_notes'
      AND policyname = 'Admins can manage all SOAP notes'
  ) THEN
    CREATE POLICY "Admins can manage all SOAP notes"
      ON soap_notes FOR ALL
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

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

COMMENT ON TABLE soap_notes IS 'AI-generated and doctor-reviewed SOAP notes for video consultations (AutoSOAP)';
