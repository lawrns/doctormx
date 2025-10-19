-- Doctor ratings and reviews system migration

-- Create doctor_reviews table
CREATE TABLE IF NOT EXISTS doctor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consult_id UUID REFERENCES consults(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  response_time_rating INTEGER CHECK (response_time_rating >= 1 AND response_time_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  clarity_rating INTEGER CHECK (clarity_rating >= 1 AND clarity_rating <= 5),
  is_verified_patient BOOLEAN DEFAULT true,
  is_anonymous BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create doctor_stats table for aggregated statistics
CREATE TABLE IF NOT EXISTS doctor_stats (
  doctor_id UUID PRIMARY KEY REFERENCES doctors(user_id) ON DELETE CASCADE,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  five_star_count INTEGER DEFAULT 0,
  four_star_count INTEGER DEFAULT 0,
  three_star_count INTEGER DEFAULT 0,
  two_star_count INTEGER DEFAULT 0,
  one_star_count INTEGER DEFAULT 0,
  total_consultations INTEGER DEFAULT 0,
  response_time_avg_minutes INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS doctor_reviews_doctor_id_idx ON doctor_reviews(doctor_id);
CREATE INDEX IF NOT EXISTS doctor_reviews_patient_id_idx ON doctor_reviews(patient_id);
CREATE INDEX IF NOT EXISTS doctor_reviews_rating_idx ON doctor_reviews(rating);
CREATE INDEX IF NOT EXISTS doctor_reviews_status_idx ON doctor_reviews(status);
CREATE INDEX IF NOT EXISTS doctor_reviews_created_at_idx ON doctor_reviews(created_at);

-- Enable RLS
ALTER TABLE doctor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_stats ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DROP POLICY IF EXISTS "Users can view published reviews" ON doctor_reviews;
DROP POLICY IF EXISTS "Patients can create reviews for their consults" ON doctor_reviews;
DROP POLICY IF EXISTS "Doctors can view their own reviews" ON doctor_reviews;
DROP POLICY IF EXISTS "Service role can manage all reviews" ON doctor_reviews;

CREATE POLICY "Users can view published reviews" ON doctor_reviews
  FOR SELECT USING (status = 'published');

CREATE POLICY "Patients can create reviews for their consults" ON doctor_reviews
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their own reviews" ON doctor_reviews
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage all reviews" ON doctor_reviews
  FOR ALL USING (auth.role() = 'service_role');

-- Add RLS policies for doctor_stats
DROP POLICY IF EXISTS "Users can view doctor stats" ON doctor_stats;
DROP POLICY IF EXISTS "Doctors can view their own stats" ON doctor_stats;
DROP POLICY IF EXISTS "Service role can manage all stats" ON doctor_stats;

CREATE POLICY "Users can view doctor stats" ON doctor_stats
  FOR SELECT USING (true);

CREATE POLICY "Doctors can view their own stats" ON doctor_stats
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage all stats" ON doctor_stats
  FOR ALL USING (auth.role() = 'service_role');

-- Insert sample reviews for testing
INSERT INTO doctor_reviews (doctor_id, patient_id, rating, review_text, response_time_rating, professionalism_rating, clarity_rating) VALUES
('c3f138b8-d387-4398-b2bb-01a3f510463a', 'dc34779a-935b-40f2-a2b4-f05ed3be6de3', 5, 'Excelente atención, muy profesional y clara en sus explicaciones.', 5, 5, 5),
('a8140b0d-64a4-425e-88c8-1f17c9eff8d2', 'dc34779a-935b-40f2-a2b4-f05ed3be6de3', 4, 'Muy buena doctora, respondió rápido y fue muy útil.', 4, 5, 4),
('8118f3f6-c293-47e1-bf98-9b9e9ce6800b', 'dc34779a-935b-40f2-a2b4-f05ed3be6de3', 5, 'Dr. Silva es muy empático y profesional. Recomendado.', 5, 5, 5)
ON CONFLICT DO NOTHING;

-- Update doctor stats with sample data
INSERT INTO doctor_stats (doctor_id, total_reviews, average_rating, five_star_count, four_star_count, three_star_count, two_star_count, one_star_count, total_consultations, response_time_avg_minutes) VALUES
('c3f138b8-d387-4398-b2bb-01a3f510463a', 1, 5.00, 1, 0, 0, 0, 0, 1, 15),
('a8140b0d-64a4-425e-88c8-1f17c9eff8d2', 1, 4.00, 0, 1, 0, 0, 0, 1, 20),
('8118f3f6-c293-47e1-bf98-9b9e9ce6800b', 1, 5.00, 1, 0, 0, 0, 0, 1, 12)
ON CONFLICT (doctor_id) DO UPDATE SET
  total_reviews = EXCLUDED.total_reviews,
  average_rating = EXCLUDED.average_rating,
  five_star_count = EXCLUDED.five_star_count,
  four_star_count = EXCLUDED.four_star_count,
  three_star_count = EXCLUDED.three_star_count,
  two_star_count = EXCLUDED.two_star_count,
  one_star_count = EXCLUDED.one_star_count,
  total_consultations = EXCLUDED.total_consultations,
  response_time_avg_minutes = EXCLUDED.response_time_avg_minutes,
  updated_at = NOW();

