-- Migration: Referral System
-- Description: Create tables for doctor referral system

-- Create referral_requests table
CREATE TABLE IF NOT EXISTS referral_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('emergency', 'urgent', 'routine')),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create referral_responses table
CREATE TABLE IF NOT EXISTS referral_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES referral_requests(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  response_type VARCHAR(20) NOT NULL CHECK (response_type IN ('accept', 'decline', 'counter_offer')),
  message TEXT,
  proposed_fee DECIMAL(10,2),
  proposed_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create referral_feedback table
CREATE TABLE IF NOT EXISTS referral_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES referral_requests(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_requests_patient_id ON referral_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_doctor_id ON referral_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_status ON referral_requests(status);
CREATE INDEX IF NOT EXISTS idx_referral_requests_urgency ON referral_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_referral_requests_created_at ON referral_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_referral_responses_referral_id ON referral_responses(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_responses_doctor_id ON referral_responses(doctor_id);

CREATE INDEX IF NOT EXISTS idx_referral_feedback_referral_id ON referral_feedback(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_feedback_patient_id ON referral_feedback(patient_id);
CREATE INDEX IF NOT EXISTS idx_referral_feedback_doctor_id ON referral_feedback(doctor_id);

-- Enable RLS
ALTER TABLE referral_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_requests
CREATE POLICY "Users can view their own referral requests" ON referral_requests
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view referral requests assigned to them" ON referral_requests
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Users can create referral requests" ON referral_requests
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can update referral requests assigned to them" ON referral_requests
  FOR UPDATE USING (auth.uid() = doctor_id);

-- RLS Policies for referral_responses
CREATE POLICY "Users can view responses to their referral requests" ON referral_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM referral_requests 
      WHERE referral_requests.id = referral_responses.referral_id 
      AND referral_requests.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view their own responses" ON referral_responses
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create responses to referral requests" ON referral_responses
  FOR INSERT WITH CHECK (
    auth.uid() = doctor_id AND
    EXISTS (
      SELECT 1 FROM referral_requests 
      WHERE referral_requests.id = referral_responses.referral_id 
      AND referral_requests.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update their own responses" ON referral_responses
  FOR UPDATE USING (auth.uid() = doctor_id);

-- RLS Policies for referral_feedback
CREATE POLICY "Users can view feedback for their referrals" ON referral_feedback
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view feedback about them" ON referral_feedback
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Users can create feedback for completed referrals" ON referral_feedback
  FOR INSERT WITH CHECK (
    auth.uid() = patient_id AND
    EXISTS (
      SELECT 1 FROM referral_requests 
      WHERE referral_requests.id = referral_feedback.referral_id 
      AND referral_requests.patient_id = auth.uid()
      AND referral_requests.status = 'completed'
    )
  );

-- Add referral statistics to doctor_stats table
ALTER TABLE doctor_stats ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE doctor_stats ADD COLUMN IF NOT EXISTS accepted_referrals INTEGER DEFAULT 0;
ALTER TABLE doctor_stats ADD COLUMN IF NOT EXISTS referral_acceptance_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE doctor_stats ADD COLUMN IF NOT EXISTS average_referral_rating DECIMAL(3,2) DEFAULT 0;

-- Create function to update referral statistics
CREATE OR REPLACE FUNCTION update_doctor_referral_stats(doctor_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE doctor_stats 
  SET 
    total_referrals = (
      SELECT COUNT(*) FROM referral_requests 
      WHERE doctor_id = doctor_uuid
    ),
    accepted_referrals = (
      SELECT COUNT(*) FROM referral_requests 
      WHERE doctor_id = doctor_uuid AND status = 'accepted'
    ),
    referral_acceptance_rate = CASE 
      WHEN (
        SELECT COUNT(*) FROM referral_requests 
        WHERE doctor_id = doctor_uuid
      ) > 0 THEN (
        SELECT (COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM referral_requests 
          WHERE doctor_id = doctor_uuid
        ))::DECIMAL(5,2)
        FROM referral_requests 
        WHERE doctor_id = doctor_uuid AND status = 'accepted'
      )
      ELSE 0
    END,
    average_referral_rating = (
      SELECT AVG(rating)::DECIMAL(3,2) 
      FROM referral_feedback 
      WHERE doctor_id = doctor_uuid AND rating IS NOT NULL
    ),
    updated_at = NOW()
  WHERE doctor_id = doctor_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update referral statistics
CREATE OR REPLACE FUNCTION trigger_update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats for the doctor involved
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_doctor_referral_stats(NEW.doctor_id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM update_doctor_referral_stats(OLD.doctor_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_referral_stats_on_referral_change ON referral_requests;
CREATE TRIGGER update_referral_stats_on_referral_change
  AFTER INSERT OR UPDATE OR DELETE ON referral_requests
  FOR EACH ROW EXECUTE FUNCTION trigger_update_referral_stats();

DROP TRIGGER IF EXISTS update_referral_stats_on_feedback_change ON referral_feedback;
CREATE TRIGGER update_referral_stats_on_feedback_change
  AFTER INSERT OR UPDATE OR DELETE ON referral_feedback
  FOR EACH ROW EXECUTE FUNCTION trigger_update_referral_stats();

-- Insert sample data for testing
INSERT INTO referral_requests (patient_id, doctor_id, symptoms, urgency, message, status) VALUES
  (
    (SELECT id FROM users LIMIT 1),
    (SELECT user_id FROM doctors LIMIT 1),
    'Dolor de cabeza persistente con náuseas',
    'urgent',
    'El dolor empeora con la luz y el movimiento',
    'pending'
  ),
  (
    (SELECT id FROM users LIMIT 1),
    (SELECT user_id FROM doctors OFFSET 1 LIMIT 1),
    'Fiebre alta y dolor de garganta',
    'routine',
    'Síntomas desde hace 3 días',
    'accepted'
  );

-- Update doctor stats for existing doctors
DO $$
DECLARE
  doctor_record RECORD;
BEGIN
  FOR doctor_record IN SELECT user_id FROM doctors LOOP
    PERFORM update_doctor_referral_stats(doctor_record.user_id);
  END LOOP;
END $$;
