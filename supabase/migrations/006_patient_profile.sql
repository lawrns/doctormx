-- ================================================
-- MIGRATION 006: PATIENT PROFILE MANAGEMENT
-- ================================================
-- Adds patient profile fields and medical history table
-- ================================================

-- ================================================
-- PATIENT PROFILE COLUMNS
-- ================================================

-- Add patient-specific fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Insurance information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_provider TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_group_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_coverage_type TEXT;

-- Emergency contact
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

-- Notification preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_email BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_sms BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_whatsapp BOOLEAN DEFAULT true;

-- ================================================
-- MEDICAL HISTORY TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS patient_medical_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Allergies (array of text)
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Current medications (array of text with optional dosage)
  current_medications JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ name: string, dosage: string, frequency: string }]

  -- Chronic conditions (array of text)
  chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Past surgeries (JSONB array)
  past_surgeries JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ procedure: string, year: number, notes: string }]

  -- Family medical history (JSONB)
  family_history JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ condition: string, relationship: string, notes: string }]

  -- Additional medical notes
  medical_notes TEXT,

  -- Blood type (optional)
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null)),

  -- Height and weight (for BMI calculation)
  height_cm DECIMAL(5, 2),
  weight_kg DECIMAL(5, 2),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_medical_history_patient ON patient_medical_history(patient_id);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE patient_medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own medical history"
  ON patient_medical_history FOR SELECT
  USING (patient_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Patients can update their own medical history"
  ON patient_medical_history FOR UPDATE
  USING (patient_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Patients can insert their own medical history"
  ON patient_medical_history FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Update updated_at trigger for medical_history
CREATE TRIGGER update_patient_medical_history_updated_at BEFORE UPDATE ON patient_medical_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE patient_medical_history IS 'Patient medical history including allergies, medications, conditions, and family history';
COMMENT ON COLUMN patient_medical_history.allergies IS 'List of patient allergies';
COMMENT ON COLUMN patient_medical_history.current_medications IS 'Current medications with dosage and frequency';
COMMENT ON COLUMN patient_medical_history.chronic_conditions IS 'List of chronic conditions';
COMMENT ON COLUMN patient_medical_history.past_surgeries IS 'Surgical history with procedure and year';
COMMENT ON COLUMN patient_medical_history.family_history IS 'Family medical history by condition and relationship';

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
