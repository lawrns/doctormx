-- ================================================
-- Noa Notes + Expert Q&A hardening
-- ================================================

ALTER TABLE soap_notes
  ADD COLUMN IF NOT EXISTS consultation_id UUID,
  ADD COLUMN IF NOT EXISTS audio_file_path TEXT,
  ADD COLUMN IF NOT EXISTS audio_duration_seconds INTEGER;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage
    WHERE table_name = 'soap_notes'
      AND constraint_name = 'soap_notes_status_check'
  ) THEN
    ALTER TABLE soap_notes DROP CONSTRAINT soap_notes_status_check;
  END IF;
END $$;

ALTER TABLE soap_notes
  ADD CONSTRAINT soap_notes_status_check
  CHECK (status IN ('draft', 'transcribing', 'generating', 'pending_review', 'approved', 'rejected', 'archived'));

CREATE TABLE IF NOT EXISTS consultation_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  storage_path TEXT,
  segments JSONB DEFAULT '[]'::jsonb,
  summary JSONB,
  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_transcripts_appointment
  ON consultation_transcripts(appointment_id);
CREATE INDEX IF NOT EXISTS idx_consultation_transcripts_doctor
  ON consultation_transcripts(doctor_id);

ALTER TABLE consultation_transcripts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consultation_transcripts'
      AND policyname = 'Doctors can manage their consultation transcripts'
  ) THEN
    CREATE POLICY "Doctors can manage their consultation transcripts"
      ON consultation_transcripts FOR ALL
      USING (doctor_id = auth.uid())
      WITH CHECK (doctor_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consultation_transcripts'
      AND policyname = 'Admins can manage consultation transcripts'
  ) THEN
    CREATE POLICY "Admins can manage consultation transcripts"
      ON consultation_transcripts FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION increment_expert_question_views(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE expert_questions
  SET view_count = view_count + 1
  WHERE id = question_id
    AND status IN ('approved', 'answered', 'closed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Public can view answers" ON expert_answers;
CREATE POLICY "Public can view answers on public questions"
  ON expert_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM expert_questions
      WHERE expert_questions.id = expert_answers.question_id
        AND expert_questions.status IN ('approved', 'answered', 'closed')
    )
  );

COMMENT ON TABLE consultation_transcripts IS 'Private appointment transcript artifacts used to generate doctor-reviewed SOAP notes.';
