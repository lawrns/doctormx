-- Migration 010: Enhanced Medical Image Analysis
-- Adds doctor review fields, enhanced AI analysis fields, and additional indexes

-- ============================================
-- ENHANCED COLUMNS FOR MEDICAL IMAGE ANALYSES
-- ============================================

-- Add patient context and notes
ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS patient_notes TEXT;
ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS patient_context JSONB;

-- Add enhanced AI analysis fields
ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS possible_conditions JSONB;
-- Format: [{"condition": "Nombre", "probability": "alto|medio|bajo"}]

ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS follow_up_needed BOOLEAN DEFAULT false;
ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;

-- Add doctor review fields
ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES profiles(id);
ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS doctor_notes TEXT;
ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS doctor_action TEXT
  CHECK (doctor_action IN ('approved', 'rejected', 'modified'));

ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Add status field for workflow
ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'
  CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'reviewed'));

-- Add cost tracking
ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS cost_cents INTEGER DEFAULT 500;

-- Update updated_at
ALTER TABLE medical_image_analyses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ============================================
-- ADDITIONAL INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_medical_images_status ON medical_image_analyses(status);
CREATE INDEX IF NOT EXISTS idx_medical_images_doctor ON medical_image_analyses(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_images_reviewed ON medical_image_analyses(reviewed_at DESC)
  WHERE reviewed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_medical_images_created_status ON medical_image_analyses(created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_medical_images_type ON medical_image_analyses(image_type);

-- Index for doctor dashboard - pending reviews
CREATE INDEX IF NOT EXISTS idx_medical_images_pending_review ON medical_image_analyses(created_at DESC)
  WHERE status = 'completed';

-- ============================================
-- RLS POLICIES FOR DOCTORS
-- ============================================

-- Doctors can view image analyses of their patients (those with appointments)
ALTER TABLE medical_image_analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Patients can view their image analyses" ON medical_image_analyses;

-- Patients can view their own analyses
CREATE POLICY "Patients can view their image analyses"
  ON medical_image_analyses FOR SELECT
  USING (patient_id = auth.uid());

-- Doctors can view analyses of patients they've had appointments with
CREATE POLICY "Doctors can view patient analyses"
  ON medical_image_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = auth.uid()
      AND appointments.patient_id = medical_image_analyses.patient_id
    )
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctors can update (review) completed analyses
CREATE POLICY "Doctors can review analyses"
  ON medical_image_analyses FOR UPDATE
  USING (
    status = 'completed'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')
    )
  )
  WITH CHECK (
    doctor_id IS NOT NULL
    AND doctor_action IS NOT NULL
    AND status = 'reviewed'
  );

-- ============================================
-- STORAGE BUCKET SETUP (run in Supabase dashboard)
-- ============================================

-- Create storage bucket for medical images
-- Run: insert into storage.buckets (id, name, public) values ('medical-images', 'medical-images', true);

-- Storage policies
-- create policy "Users can upload their own medical images"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'medical-images'
--     and auth.uid() = owner
--   );

-- create policy "Users can view their own medical images"
--   on storage.objects for select
--   using (
--     bucket_id = 'medical-images'
--     and auth.uid() = owner
--   );

-- ============================================
-- FUNCTION TO UPDATE UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_medical_image_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS update_medical_image_analyses_updated_at ON medical_image_analyses;
CREATE TRIGGER update_medical_image_analyses_updated_at
  BEFORE UPDATE ON medical_image_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_image_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE medical_image_analyses IS 'Medical image analysis results with AI findings and doctor reviews';
COMMENT ON COLUMN medical_image_analyses.patient_notes IS 'Optional notes from the patient about the image';
COMMENT ON COLUMN medical_image_analyses.possible_conditions IS 'JSON array of possible conditions with probabilities';
COMMENT ON COLUMN medical_image_analyses.doctor_id IS 'ID of the doctor who reviewed the analysis';
COMMENT ON COLUMN medical_image_analyses.doctor_notes IS 'Doctor''s notes after reviewing the analysis';
COMMENT ON COLUMN medical_image_analyses.doctor_action IS 'Action taken: approved, rejected, or modified';
COMMENT ON COLUMN medical_image_analyses.status IS 'Workflow status: pending, processing, completed, failed, reviewed';
COMMENT ON COLUMN medical_image_analyses.cost_cents IS 'Cost of the analysis in cents (5 MXN = 500)';
