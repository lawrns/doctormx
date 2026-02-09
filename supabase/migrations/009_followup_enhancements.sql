-- Migration: Follow-up Enhancements
-- Created: 2026-02-09
-- Description: Adds notification preferences, retry logic, and audit trail for follow-ups

-- 1. Add notification preferences to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"followups": true, "reminders": true, "marketing": false}'::jsonb,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_out BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sms_opt_out BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_opt_out BOOLEAN DEFAULT FALSE;

-- 2. Add retry tracking to followups table
ALTER TABLE followups
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS error_code TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Create followup audit table
CREATE TABLE IF NOT EXISTS followup_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  followup_id UUID NOT NULL REFERENCES followups(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'scheduled', 'sent', 'failed', 'retrying', 'responded', 'cancelled', 'opted_out')),
  previous_status TEXT,
  new_status TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- 4. Create followup opt-outs table
CREATE TABLE IF NOT EXISTS followup_opt_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opt_out_type TEXT NOT NULL CHECK (opt_out_type IN ('all', 'followups', 'reminders', 'promotional')),
  reason TEXT,
  opted_out_at TIMESTAMPTZ DEFAULT NOW(),
  opted_out_via TEXT CHECK (opted_out_via IN ('whatsapp', 'sms', 'email', 'web', 'support')),
  UNIQUE(patient_id, opt_out_type)
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_followups_retry ON followups(next_retry_at) WHERE next_retry_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_followups_status_retry ON followups(status, retry_count);
CREATE INDEX IF NOT EXISTS idx_followup_audit_followup ON followup_audit(followup_id);
CREATE INDEX IF NOT EXISTS idx_followup_audit_created ON followup_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_followup_opt_outs_patient ON followup_opt_outs(patient_id);

-- 6. Enable RLS
ALTER TABLE followup_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_opt_outs ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
CREATE POLICY "Users can view own followup audit" ON followup_audit
  FOR SELECT USING (
    followup_id IN (SELECT id FROM followups WHERE patient_id = auth.uid())
    OR followup_id IN (SELECT id FROM followups WHERE doctor_id = auth.uid())
  );

CREATE POLICY "Service role can insert audit" ON followup_audit
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Patients can view own opt-outs" ON followup_opt_outs
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can manage own opt-outs" ON followup_opt_outs
  FOR INSERT WITH CHECK (patient_id = auth.uid())
  FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Service role can manage opt-outs" ON followup_opt_outs
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 8. Function to log followup events
CREATE OR REPLACE FUNCTION log_followup_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO followup_audit (followup_id, event_type, previous_status, new_status, error_message, metadata)
  VALUES (
    NEW.id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN NEW.status != OLD.status THEN 'status_changed'
      WHEN NEW.retry_count > OLD.retry_count THEN 'retrying'
      ELSE 'updated'
    END,
    OLD.status,
    NEW.status,
    NEW.error_message,
    jsonb_build_object(
      'retry_count', NEW.retry_count,
      'last_retry_at', NEW.last_retry_at,
      'next_retry_at', NEW.next_retry_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger to auto-log followup events
DROP TRIGGER IF EXISTS trigger_log_followup_event ON followups;
CREATE TRIGGER trigger_log_followup_event
  AFTER INSERT OR UPDATE ON followups
  FOR EACH ROW
  EXECUTE FUNCTION log_followup_event();

-- 10. Function to check if patient has opted out
CREATE OR REPLACE FUNCTION check_patient_opt_out(patient_uuid UUID, followup_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_opt_out BOOLEAN;
BEGIN
  -- Check for global opt-out
  SELECT EXISTS(
    SELECT 1 FROM followup_opt_outs
    WHERE patient_id = patient_uuid AND opt_out_type = 'all'
  ) INTO has_opt_out;

  IF has_opt_out THEN
    RETURN TRUE;
  END IF;

  -- Check for specific type opt-out
  SELECT EXISTS(
    SELECT 1 FROM followup_opt_outs
    WHERE patient_id = patient_uuid AND opt_out_type = followup_type
  ) INTO has_opt_out;

  RETURN has_opt_out;
END;
$$ LANGUAGE plpgsql;

-- 11. Update get_pending_followUps query to exclude opted out patients
-- This is handled in the application layer, but we can add a view for convenience
CREATE OR REPLACE VIEW v_pending_followups AS
SELECT f.*
FROM followups f
WHERE f.status = 'pending'
  AND f.scheduled_at <= NOW()
  AND NOT EXISTS (
    SELECT 1 FROM followup_opt_outs oo
    WHERE oo.patient_id = f.patient_id
    AND (oo.opt_out_type = 'all' OR oo.opt_out_type = 'followups')
  )
ORDER BY f.scheduled_at ASC;

-- 12. Add helpful comments
COMMENT ON TABLE profiles.notification_preferences IS 'JSONB object with keys: followups, reminders, marketing';
COMMENT ON TABLE followup_audit IS 'Audit trail for all follow-up events';
COMMENT ON TABLE followup_opt_outs IS 'Patient opt-out preferences for different notification types';
COMMENT ON COLUMN followups.retry_count IS 'Number of retry attempts for failed follow-ups';
COMMENT ON COLUMN followups.next_retry_at IS 'Scheduled time for next retry attempt';
COMMENT ON FUNCTION check_patient_opt_out IS 'Returns TRUE if patient has opted out of follow-ups';
