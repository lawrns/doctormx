-- ================================================
-- AI SOAP NOTES
-- Migration: 018_soap_notes.sql
-- Purpose: Enable AI-generated SOAP notes from voice transcriptions
-- ================================================

-- UP Migration

-- SOAP note status enum
DO $$ BEGIN
  CREATE TYPE soap_note_status AS ENUM (
    'transcribing',
    'generating',
    'pending_review',
    'approved',
    'rejected',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- SOAP notes table
CREATE TABLE IF NOT EXISTS soap_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to consultation
  consultation_id UUID,
  appointment_id UUID,
  doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id),
  
  -- Status
  status soap_note_status NOT NULL DEFAULT 'transcribing',
  
  -- Audio/Transcript
  audio_file_path TEXT,
  audio_duration_seconds INTEGER,
  transcript_raw TEXT,
  transcript_language TEXT DEFAULT 'es',
  
  -- AI Generated SOAP
  soap_subjective TEXT,
  soap_objective TEXT,
  soap_assessment TEXT,
  soap_plan TEXT,
  
  -- Full structured note
  soap_json JSONB,
  
  -- AI metadata
  ai_model TEXT,
  ai_confidence_score NUMERIC(3, 2),
  ai_generated_at TIMESTAMPTZ,
  ai_tokens_used INTEGER,
  ai_cost_cents INTEGER,
  
  -- Doctor review
  doctor_edits JSONB,
  doctor_notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_soap_notes_doctor ON soap_notes(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_soap_notes_consultation ON soap_notes(consultation_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_appointment ON soap_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_status ON soap_notes(status) WHERE status IN ('pending_review', 'transcribing', 'generating');
CREATE INDEX IF NOT EXISTS idx_soap_notes_patient ON soap_notes(patient_id);

-- SOAP note templates (for fine-tuning)
CREATE TABLE IF NOT EXISTS soap_note_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  specialty TEXT,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template structure
  template_json JSONB NOT NULL,
  example_output TEXT,
  
  -- Usage
  use_count INTEGER DEFAULT 0,
  
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soap_templates_doctor ON soap_note_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_soap_templates_specialty ON soap_note_templates(specialty) WHERE is_public = TRUE;

-- SOAP note audit (for compliance)
CREATE TABLE IF NOT EXISTS soap_note_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  soap_note_id UUID NOT NULL REFERENCES soap_notes(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'generated', 'edited', 'approved', 'rejected', 'exported'
  actor_id UUID REFERENCES users(id),
  changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soap_audit_note ON soap_note_audit(soap_note_id, created_at DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_soap_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_soap_notes_timestamp ON soap_notes;
CREATE TRIGGER update_soap_notes_timestamp
  BEFORE UPDATE ON soap_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_soap_notes_updated_at();

-- Audit trigger
CREATE OR REPLACE FUNCTION log_soap_note_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO soap_note_audit (soap_note_id, action, actor_id, changes)
    VALUES (NEW.id, 'created', auth.uid(), jsonb_build_object('status', NEW.status));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO soap_note_audit (soap_note_id, action, actor_id, changes)
      VALUES (
        NEW.id,
        CASE 
          WHEN NEW.status = 'approved' THEN 'approved'
          WHEN NEW.status = 'rejected' THEN 'rejected'
          ELSE 'status_changed'
        END,
        auth.uid(),
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_soap_note_changes_trigger ON soap_notes;
CREATE TRIGGER log_soap_note_changes_trigger
  AFTER INSERT OR UPDATE ON soap_notes
  FOR EACH ROW
  EXECUTE FUNCTION log_soap_note_changes();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_note_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_note_audit ENABLE ROW LEVEL SECURITY;

-- SOAP notes policies
CREATE POLICY "Doctors can view own notes"
  ON soap_notes FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create notes"
  ON soap_notes FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own notes"
  ON soap_notes FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage notes"
  ON soap_notes FOR ALL
  USING (auth.role() = 'service_role');

-- Templates policies
CREATE POLICY "Doctors can view own and public templates"
  ON soap_note_templates FOR SELECT
  USING (auth.uid() = doctor_id OR is_public = TRUE);

CREATE POLICY "Doctors can manage own templates"
  ON soap_note_templates FOR ALL
  USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage templates"
  ON soap_note_templates FOR ALL
  USING (auth.role() = 'service_role');

-- Audit policies (read-only for doctors)
CREATE POLICY "Doctors can view own note audits"
  ON soap_note_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM soap_notes
      WHERE soap_notes.id = soap_note_id
      AND soap_notes.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage audits"
  ON soap_note_audit FOR ALL
  USING (auth.role() = 'service_role');

-- Insert default templates
INSERT INTO soap_note_templates (specialty, name, description, template_json, is_public, is_default)
VALUES
  ('Medicina General', 'Consulta General', 'Plantilla estándar para consulta general', 
   '{"sections": ["subjective", "objective", "assessment", "plan"], "fields": {"subjective": ["chief_complaint", "history", "symptoms"], "objective": ["vitals", "physical_exam"], "assessment": ["diagnosis", "differential"], "plan": ["treatment", "medications", "followup"]}}',
   TRUE, TRUE),
  ('Pediatría', 'Consulta Pediátrica', 'Plantilla para consulta pediátrica',
   '{"sections": ["subjective", "objective", "assessment", "plan"], "fields": {"subjective": ["chief_complaint", "developmental_history", "vaccines"], "objective": ["growth_metrics", "physical_exam"], "assessment": ["diagnosis"], "plan": ["treatment", "vaccines_due", "followup"]}}',
   TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- ================================================
-- DOWN Migration (for rollback)
-- Run these commands to rollback:
--
-- DROP TABLE IF EXISTS soap_note_audit CASCADE;
-- DROP TABLE IF EXISTS soap_note_templates CASCADE;
-- DROP TABLE IF EXISTS soap_notes CASCADE;
-- DROP FUNCTION IF EXISTS update_soap_notes_updated_at();
-- DROP FUNCTION IF EXISTS log_soap_note_changes();
-- DROP TYPE IF EXISTS soap_note_status;
-- ================================================
