-- Churn Prevention System
-- Track retention events, re-engagement actions, and churn risk

CREATE TABLE IF NOT EXISTS retention_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'at_risk_identified', 'reengagement_sent', 'reengaged', 'churned', 'saved'
  risk_level TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retention_events_doctor ON retention_events(doctor_id);
CREATE INDEX IF NOT EXISTS idx_retention_events_created ON retention_events(created_at);
CREATE INDEX IF NOT EXISTS idx_retention_events_type ON retention_events(event_type);

-- Add is_listed column to doctors if not exists (for discovery filtering)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doctors' AND column_name = 'is_listed'
  ) THEN
    ALTER TABLE doctors ADD COLUMN is_listed BOOLEAN DEFAULT false;
    UPDATE doctors SET is_listed = true WHERE status = 'approved';
    CREATE INDEX idx_doctors_is_listed ON doctors(is_listed) WHERE is_listed = true;
  END IF;
END $$;
