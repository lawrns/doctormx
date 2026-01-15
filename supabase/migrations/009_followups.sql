-- ================================================
-- MIGRATION 009: AUTOMATED FOLLOW-UP SYSTEM
-- ================================================
-- Track scheduled and sent follow-ups
-- Store patient responses
-- ================================================

-- ================================================
-- FOLLOW-UPS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  
  type TEXT NOT NULL CHECK (type IN (
    'follow_up_24h',
    'follow_up_7d',
    'medication_reminder',
    'prescription_refill',
    'chronic_care_check'
  )),
  
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'responded', 'cancelled')),
  
  response TEXT,
  response_action TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_followups_patient ON followups(patient_id);
CREATE INDEX idx_followups_doctor ON followups(doctor_id);
CREATE INDEX idx_followups_appointment ON followups(appointment_id);
CREATE INDEX idx_followups_prescription ON followups(prescription_id);
CREATE INDEX idx_followups_status ON followups(status);
CREATE INDEX idx_followups_scheduled ON followups(scheduled_at);

COMMENT ON TABLE followups IS 'Automated follow-up tracking for post-appointment care';
COMMENT ON COLUMN followups.type IS 'Type of follow-up: 24h check-in, 7d follow-up, medication reminder, etc.';
COMMENT ON COLUMN followups.response_action IS 'Action taken based on patient response: logged, alert_doctor, suggest_followup, etc.';

-- ================================================
-- FOLLOW-UP RESPONSES TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS followup_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  followup_id UUID NOT NULL REFERENCES followups(id) ON DELETE CASCADE,
  
  response TEXT NOT NULL,
  action_taken TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(followup_id)
);

CREATE INDEX idx_followup_responses_followup ON followup_responses(followup_id);
CREATE INDEX idx_followup_responses_created ON followup_responses(created_at DESC);

COMMENT ON TABLE followup_responses IS 'Patient responses to follow-up messages';

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own follow-ups"
  ON followups FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view follow-ups for their patients"
  ON followups FOR SELECT
  USING (
    doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid()) OR
    doctor_id IS NULL
  );

CREATE POLICY "System can create follow-ups"
  ON followups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can update follow-ups"
  ON followups FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Follow-up responses RLS
ALTER TABLE followup_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses for their follow-ups"
  ON followup_responses FOR SELECT
  USING (
    followup_id IN (SELECT id FROM followups WHERE patient_id = auth.uid()) OR
    followup_id IN (SELECT id FROM followups WHERE doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid()))
  );

CREATE POLICY "System can create responses"
  ON followup_responses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can update responses"
  ON followup_responses FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_followup_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_followups_updated_at
  BEFORE UPDATE ON followups
  FOR EACH ROW EXECUTE FUNCTION update_followup_updated_at();

-- ================================================
-- CRON JOB HELPERS (for Vercel Cron)
-- ================================================

-- Function to get pending follow-ups that are due
CREATE OR REPLACE FUNCTION get_due_followups()
RETURNS TABLE (
  id UUID,
  appointment_id UUID,
  patient_id UUID,
  doctor_id UUID,
  prescription_id UUID,
  type TEXT,
  scheduled_at TIMESTAMPTZ
) AS $
BEGIN
  RETURN QUERY
  SELECT f.id, f.appointment_id, f.patient_id, f.doctor_id, f.prescription_id, f.type, f.scheduled_at
  FROM followups f
  WHERE f.status = 'pending'
  AND f.scheduled_at <= NOW()
  ORDER BY f.scheduled_at ASC;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- MIGRATION COMPLETE
-- ================================================

COMMENT ON COLUMN followups.status IS 'Follow-up status: pending, sent, failed, responded, cancelled';
COMMENT ON COLUMN followup_responses.action_taken IS 'Action taken: logged, alert_doctor, suggest_followup, positive_outcome, etc.';
