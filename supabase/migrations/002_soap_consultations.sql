-- ================================================
-- SOAP MULTI-AGENT CONSULTATION TABLES
-- Migration for multi-agent SOAP consultation system
-- ================================================

-- Create enum for consultation status
CREATE TYPE soap_consultation_status AS ENUM (
  'intake',
  'objective',
  'consulting',
  'consensus',
  'plan',
  'review',
  'complete',
  'escalated',
  'error',
  'archived'
);

-- Create enum for urgency levels
CREATE TYPE soap_urgency_level AS ENUM (
  'emergency',
  'urgent',
  'moderate',
  'routine',
  'self-care'
);

-- Create enum for specialist roles
CREATE TYPE soap_specialist_role AS ENUM (
  'general-practitioner',
  'dermatologist',
  'internist',
  'psychiatrist'
);

-- ================================================
-- SOAP CONSULTATIONS TABLE
-- Main consultation records
-- ================================================

CREATE TABLE soap_consultations (
  id TEXT PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Status tracking
  status soap_consultation_status NOT NULL DEFAULT 'intake',

  -- SOAP Data (JSONB for flexibility)
  subjective_data JSONB NOT NULL,
  objective_data JSONB DEFAULT '{}',

  -- Assessment results (includes specialists and consensus)
  assessment_data JSONB,

  -- Plan
  plan_data JSONB,

  -- Metadata
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0,
  total_latency_ms INTEGER NOT NULL DEFAULT 0,
  ai_model TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ================================================
-- SPECIALIST ASSESSMENTS TABLE
-- Individual specialist evaluations (for detailed tracking)
-- ================================================

CREATE TABLE soap_specialist_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id TEXT NOT NULL REFERENCES soap_consultations(id) ON DELETE CASCADE,
  specialist_role soap_specialist_role NOT NULL,

  -- Assessment data
  confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.5,
  relevance NUMERIC(3, 2) NOT NULL DEFAULT 0.5,
  clinical_impression TEXT NOT NULL,
  differential_diagnoses JSONB NOT NULL DEFAULT '[]',
  red_flags JSONB NOT NULL DEFAULT '[]',
  contributing_factors JSONB NOT NULL DEFAULT '[]',
  recommended_tests JSONB NOT NULL DEFAULT '[]',
  urgency_level soap_urgency_level NOT NULL DEFAULT 'moderate',
  should_refer BOOLEAN NOT NULL DEFAULT false,
  referral_reason TEXT,
  reasoning_notes TEXT,

  -- Metadata
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one assessment per specialist per consultation
  UNIQUE (consultation_id, specialist_role)
);

-- ================================================
-- INDEXES
-- ================================================

-- Consultations indexes
CREATE INDEX idx_soap_consultations_patient_id ON soap_consultations(patient_id);
CREATE INDEX idx_soap_consultations_status ON soap_consultations(status);
CREATE INDEX idx_soap_consultations_created_at ON soap_consultations(created_at DESC);

-- Specialist assessments indexes
CREATE INDEX idx_soap_specialist_assessments_consultation_id ON soap_specialist_assessments(consultation_id);
CREATE INDEX idx_soap_specialist_assessments_specialist_role ON soap_specialist_assessments(specialist_role);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE soap_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_specialist_assessments ENABLE ROW LEVEL SECURITY;

-- Consultations RLS
-- Patients can view their own consultations
CREATE POLICY "Patients can view their own consultations"
  ON soap_consultations FOR SELECT
  USING (
    patient_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')
    )
  );

-- Patients can create their own consultations
CREATE POLICY "Patients can create their own consultations"
  ON soap_consultations FOR INSERT
  WITH CHECK (
    patient_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')
    )
  );

-- Users can update their own consultations
CREATE POLICY "Users can update their own consultations"
  ON soap_consultations FOR UPDATE
  USING (
    patient_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')
    )
  );

-- Specialist assessments RLS
-- Only admins and doctors can view specialist assessments
CREATE POLICY "Doctors and admins can view specialist assessments"
  ON soap_specialist_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM soap_consultations WHERE id = consultation_id AND patient_id = auth.uid()
    )
  );

-- System can insert specialist assessments (via service role)
CREATE POLICY "Service role can insert specialist assessments"
  ON soap_specialist_assessments FOR INSERT
  WITH CHECK (true);

-- ================================================
-- FUNCTIONS
-- ================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_soap_consultation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
CREATE TRIGGER soap_consultations_updated_at
  BEFORE UPDATE ON soap_consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_soap_consultation_timestamp();

-- ================================================
-- VIEWS
-- ================================================

-- View for patient consultation summary
CREATE VIEW soap_consultation_summary AS
SELECT
  c.id,
  c.patient_id,
  c.status,
  c.created_at,
  c.completed_at,
  c.subjective_data->>'chiefComplaint' AS chief_complaint,
  c.assessment_data->'consensus'->>'urgencyLevel' AS urgency_level,
  c.assessment_data->'consensus'->>'primaryDiagnosis' AS primary_diagnosis,
  c.assessment_data->'consensus'->>'kendallW' AS specialist_agreement,
  c.total_cost_usd,
  c.total_latency_ms
FROM soap_consultations c
WHERE c.status NOT IN ('archived', 'error');

-- Grant access to the view
GRANT SELECT ON soap_consultation_summary TO authenticated;

-- ================================================
-- SAMPLE DATA (for development)
-- ================================================

-- This section is commented out for production
-- Uncomment for development testing

/*
INSERT INTO soap_consultations (
  id,
  patient_id,
  status,
  subjective_data,
  objective_data,
  created_at
) VALUES (
  'test-consultation-001',
  '00000000-0000-0000-0000-000000000000', -- Replace with valid patient ID
  'complete',
  '{
    "chiefComplaint": "Dolor de cabeza persistente",
    "symptomsDescription": "Dolor pulsatil en el lado derecho de la cabeza",
    "symptomDuration": "3 dias",
    "symptomSeverity": 7,
    "onsetType": "gradual",
    "associatedSymptoms": ["nausea", "sensibilidad a la luz"],
    "aggravatingFactors": ["estres", "luz brillante"],
    "relievingFactors": ["descanso", "oscuridad"],
    "previousTreatments": ["ibuprofeno"]
  }',
  '{
    "patientAge": 35,
    "patientGender": "female"
  }',
  NOW()
);
*/

COMMENT ON TABLE soap_consultations IS 'Multi-agent SOAP consultation records with AI-generated assessments and treatment plans';
COMMENT ON TABLE soap_specialist_assessments IS 'Individual specialist AI agent assessments for each consultation';
