-- Trust badges and compliance certifications migration

-- Create doctor_badges table
CREATE TABLE IF NOT EXISTS doctor_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  badge_type VARCHAR(100) NOT NULL,
  badge_level VARCHAR(50),
  earned_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS doctor_badges_doctor_id_idx ON doctor_badges(doctor_id);
CREATE INDEX IF NOT EXISTS doctor_badges_badge_type_idx ON doctor_badges(badge_type);
CREATE INDEX IF NOT EXISTS doctor_badges_is_active_idx ON doctor_badges(is_active);

-- Enable RLS
ALTER TABLE doctor_badges ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DROP POLICY IF EXISTS "Users can view active badges" ON doctor_badges;
DROP POLICY IF EXISTS "Doctors can view their own badges" ON doctor_badges;
DROP POLICY IF EXISTS "Service role can manage all badges" ON doctor_badges;

CREATE POLICY "Users can view active badges" ON doctor_badges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Doctors can view their own badges" ON doctor_badges
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage all badges" ON doctor_badges
  FOR ALL USING (auth.role() = 'service_role');

-- Insert sample trust badges for testing
INSERT INTO doctor_badges (doctor_id, badge_type, badge_level, metadata) VALUES
('c3f138b8-d387-4398-b2bb-01a3f510463a', 'sep_verified', 'verified', '{"verified_by": "automated_sep", "verification_date": "2025-10-19"}'),
('c3f138b8-d387-4398-b2bb-01a3f510463a', 'active_subscription', 'professional', '{"plan": "professional", "amount": 49900, "currency": "MXN"}'),
('c3f138b8-d387-4398-b2bb-01a3f510463a', 'top_rated', 'gold', '{"rating": 4.5, "reviews": 25}'),
('c3f138b8-d387-4398-b2bb-01a3f510463a', 'fast_responder', 'silver', '{"avg_response_time": 15}'),
('a8140b0d-64a4-425e-88c8-1f17c9eff8d2', 'sep_verified', 'verified', '{"verified_by": "automated_sep", "verification_date": "2025-10-19"}'),
('a8140b0d-64a4-425e-88c8-1f17c9eff8d2', 'active_subscription', 'professional', '{"plan": "professional", "amount": 49900, "currency": "MXN"}'),
('8118f3f6-c293-47e1-bf98-9b9e9ce6800b', 'sep_verified', 'verified', '{"verified_by": "automated_sep", "verification_date": "2025-10-19"}'),
('8118f3f6-c293-47e1-bf98-9b9e9ce6800b', 'active_subscription', 'professional', '{"plan": "professional", "amount": 49900, "currency": "MXN"}')
ON CONFLICT DO NOTHING;

