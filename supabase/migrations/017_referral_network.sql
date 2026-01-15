-- ================================================
-- DOCTOR REFERRAL NETWORK
-- Migration: 017_referral_network.sql
-- Purpose: Enable doctor-to-doctor referrals with fee sharing
-- ================================================

-- UP Migration

-- Referral status enum
DO $$ BEGIN
  CREATE TYPE referral_status AS ENUM (
    'pending',
    'accepted',
    'declined',
    'completed',
    'expired',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Referral urgency enum
DO $$ BEGIN
  CREATE TYPE referral_urgency AS ENUM (
    'routine',
    'urgent',
    'emergency'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Doctor referrals table
CREATE TABLE IF NOT EXISTS doctor_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  referring_doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
  receiving_doctor_id UUID REFERENCES doctors(user_id),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Referral details
  specialty_needed TEXT NOT NULL,
  urgency referral_urgency NOT NULL DEFAULT 'routine',
  status referral_status NOT NULL DEFAULT 'pending',
  
  -- Clinical info
  reason TEXT NOT NULL,
  clinical_notes TEXT,
  attachments JSONB DEFAULT '[]',
  
  -- Response
  response_notes TEXT,
  declined_reason TEXT,
  
  -- Outcome tracking
  appointment_id UUID,
  outcome_notes TEXT,
  outcome_rating INTEGER CHECK (outcome_rating >= 1 AND outcome_rating <= 5),
  
  -- Revenue share
  referral_fee_cents INTEGER DEFAULT 0,
  fee_paid BOOLEAN DEFAULT FALSE,
  fee_paid_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for doctor_referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referring ON doctor_referrals(referring_doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_receiving ON doctor_referrals(receiving_doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_patient ON doctor_referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON doctor_referrals(status) WHERE status IN ('pending', 'accepted');
CREATE INDEX IF NOT EXISTS idx_referrals_specialty ON doctor_referrals(specialty_needed, status);
CREATE INDEX IF NOT EXISTS idx_referrals_expires ON doctor_referrals(expires_at) WHERE status = 'pending';

-- Referral invitations (for matching specialists)
CREATE TABLE IF NOT EXISTS referral_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES doctor_referrals(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
  
  status TEXT NOT NULL DEFAULT 'pending', -- pending, viewed, accepted, declined
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(referral_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_invitations_doctor ON referral_invitations(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_referral_invitations_referral ON referral_invitations(referral_id);

-- Referral network stats (aggregated for performance)
CREATE TABLE IF NOT EXISTS referral_network_stats (
  doctor_id UUID PRIMARY KEY REFERENCES doctors(user_id) ON DELETE CASCADE,
  
  -- Outgoing referrals
  referrals_sent INTEGER DEFAULT 0,
  referrals_accepted INTEGER DEFAULT 0,
  referrals_completed INTEGER DEFAULT 0,
  
  -- Incoming referrals
  referrals_received INTEGER DEFAULT 0,
  referrals_fulfilled INTEGER DEFAULT 0,
  avg_response_hours NUMERIC(5,2),
  
  -- Revenue
  total_referral_fees_earned_cents INTEGER DEFAULT 0,
  total_referral_fees_paid_cents INTEGER DEFAULT 0,
  
  -- Network
  unique_referral_partners INTEGER DEFAULT 0,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_doctor_referrals_timestamp ON doctor_referrals;
CREATE TRIGGER update_doctor_referrals_timestamp
  BEFORE UPDATE ON doctor_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referrals_updated_at();

-- Function to update referral stats
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update referring doctor stats
  INSERT INTO referral_network_stats (doctor_id, referrals_sent)
  VALUES (NEW.referring_doctor_id, 1)
  ON CONFLICT (doctor_id) DO UPDATE SET
    referrals_sent = referral_network_stats.referrals_sent + 1,
    updated_at = NOW();
  
  -- If accepted, update receiving doctor stats
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    IF NEW.receiving_doctor_id IS NOT NULL THEN
      INSERT INTO referral_network_stats (doctor_id, referrals_received)
      VALUES (NEW.receiving_doctor_id, 1)
      ON CONFLICT (doctor_id) DO UPDATE SET
        referrals_received = referral_network_stats.referrals_received + 1,
        updated_at = NOW();
    END IF;
  END IF;
  
  -- If completed, update completion stats
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE referral_network_stats SET
      referrals_completed = referrals_completed + 1,
      updated_at = NOW()
    WHERE doctor_id = NEW.referring_doctor_id;
    
    IF NEW.receiving_doctor_id IS NOT NULL THEN
      UPDATE referral_network_stats SET
        referrals_fulfilled = referrals_fulfilled + 1,
        updated_at = NOW()
      WHERE doctor_id = NEW.receiving_doctor_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_referral_stats_trigger ON doctor_referrals;
CREATE TRIGGER update_referral_stats_trigger
  AFTER INSERT OR UPDATE ON doctor_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_stats();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE doctor_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_network_stats ENABLE ROW LEVEL SECURITY;

-- Referrals policies
CREATE POLICY "Doctors can view referrals they're involved in"
  ON doctor_referrals FOR SELECT
  USING (
    auth.uid() = referring_doctor_id 
    OR auth.uid() = receiving_doctor_id
    OR auth.uid() = patient_id
  );

CREATE POLICY "Doctors can create referrals"
  ON doctor_referrals FOR INSERT
  WITH CHECK (auth.uid() = referring_doctor_id);

CREATE POLICY "Involved doctors can update referrals"
  ON doctor_referrals FOR UPDATE
  USING (
    auth.uid() = referring_doctor_id 
    OR auth.uid() = receiving_doctor_id
  );

CREATE POLICY "Service role can manage referrals"
  ON doctor_referrals FOR ALL
  USING (auth.role() = 'service_role');

-- Invitations policies
CREATE POLICY "Invited doctors can view invitations"
  ON referral_invitations FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Invited doctors can update invitations"
  ON referral_invitations FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage invitations"
  ON referral_invitations FOR ALL
  USING (auth.role() = 'service_role');

-- Stats policies
CREATE POLICY "Doctors can view own stats"
  ON referral_network_stats FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage stats"
  ON referral_network_stats FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================
-- DOWN Migration (for rollback)
-- Run these commands to rollback:
--
-- DROP TABLE IF EXISTS referral_network_stats CASCADE;
-- DROP TABLE IF EXISTS referral_invitations CASCADE;
-- DROP TABLE IF EXISTS doctor_referrals CASCADE;
-- DROP FUNCTION IF EXISTS update_referrals_updated_at();
-- DROP FUNCTION IF EXISTS update_referral_stats();
-- DROP TYPE IF EXISTS referral_urgency;
-- DROP TYPE IF EXISTS referral_status;
-- ================================================
