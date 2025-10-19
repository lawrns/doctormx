-- Ratings and Reviews System Migration
-- Create tables for doctor ratings and reviews

-- Doctor reviews table
CREATE TABLE doctor_reviews (
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
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'flagged')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctor statistics table (aggregated data)
CREATE TABLE doctor_stats (
  doctor_id UUID PRIMARY KEY REFERENCES doctors(user_id) ON DELETE CASCADE,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  five_star_count INTEGER DEFAULT 0,
  four_star_count INTEGER DEFAULT 0,
  three_star_count INTEGER DEFAULT 0,
  two_star_count INTEGER DEFAULT 0,
  one_star_count INTEGER DEFAULT 0,
  total_consultations INTEGER DEFAULT 0,
  response_time_avg_minutes INTEGER DEFAULT 0,
  professionalism_avg DECIMAL(3,2) DEFAULT 0,
  clarity_avg DECIMAL(3,2) DEFAULT 0,
  response_time_avg DECIMAL(3,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Review moderation table
CREATE TABLE review_moderation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES doctor_reviews(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL CHECK (action IN ('approve', 'reject', 'hide', 'flag')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Review flags table (for reporting inappropriate reviews)
CREATE TABLE review_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES doctor_reviews(id) ON DELETE CASCADE,
  flagged_by UUID REFERENCES users(id),
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_doctor_reviews_doctor_id ON doctor_reviews(doctor_id);
CREATE INDEX idx_doctor_reviews_patient_id ON doctor_reviews(patient_id);
CREATE INDEX idx_doctor_reviews_consult_id ON doctor_reviews(consult_id);
CREATE INDEX idx_doctor_reviews_rating ON doctor_reviews(rating);
CREATE INDEX idx_doctor_reviews_status ON doctor_reviews(status);
CREATE INDEX idx_doctor_reviews_created_at ON doctor_reviews(created_at);
CREATE INDEX idx_doctor_stats_doctor_id ON doctor_stats(doctor_id);
CREATE INDEX idx_doctor_stats_average_rating ON doctor_stats(average_rating);
CREATE INDEX idx_review_moderation_review_id ON review_moderation(review_id);
CREATE INDEX idx_review_flags_review_id ON review_flags(review_id);
CREATE INDEX idx_review_flags_status ON review_flags(status);

-- Add RLS policies
ALTER TABLE doctor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;

-- Patients can view all published reviews
CREATE POLICY "Patients can view published reviews" ON doctor_reviews
  FOR SELECT USING (status = 'published');

-- Patients can create reviews for their own consultations
CREATE POLICY "Patients can create reviews for own consults" ON doctor_reviews
  FOR INSERT WITH CHECK (
    patient_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM consults 
      WHERE id = consult_id 
      AND patient_id = auth.uid()
    )
  );

-- Patients can update their own reviews
CREATE POLICY "Patients can update own reviews" ON doctor_reviews
  FOR UPDATE USING (patient_id = auth.uid());

-- Doctors can view their own reviews
CREATE POLICY "Doctors can view own reviews" ON doctor_reviews
  FOR SELECT USING (doctor_id = auth.uid());

-- All authenticated users can view doctor stats
CREATE POLICY "Authenticated users can view doctor stats" ON doctor_stats
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can update doctor stats
CREATE POLICY "Service role can update doctor stats" ON doctor_stats
  FOR ALL USING (auth.role() = 'service_role');

-- Only moderators can access review moderation
CREATE POLICY "Moderators can access review moderation" ON review_moderation
  FOR ALL USING (auth.role() = 'service_role');

-- Users can flag reviews
CREATE POLICY "Users can flag reviews" ON review_flags
  FOR INSERT WITH CHECK (flagged_by = auth.uid());

-- Only moderators can view and resolve flags
CREATE POLICY "Moderators can view and resolve flags" ON review_flags
  FOR ALL USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE doctor_reviews IS 'Patient reviews and ratings for doctors';
COMMENT ON TABLE doctor_stats IS 'Aggregated statistics for doctors (ratings, response times, etc.)';
COMMENT ON TABLE review_moderation IS 'Moderation actions on reviews';
COMMENT ON TABLE review_flags IS 'Flags/reports on inappropriate reviews';
COMMENT ON COLUMN doctor_reviews.rating IS 'Overall rating from 1-5 stars';
COMMENT ON COLUMN doctor_reviews.response_time_rating IS 'Rating for response time (1-5)';
COMMENT ON COLUMN doctor_reviews.professionalism_rating IS 'Rating for professionalism (1-5)';
COMMENT ON COLUMN doctor_reviews.clarity_rating IS 'Rating for communication clarity (1-5)';
COMMENT ON COLUMN doctor_stats.average_rating IS 'Average of all ratings (0-5)';
COMMENT ON COLUMN doctor_stats.response_time_avg_minutes IS 'Average response time in minutes';

-- Create function to update doctor stats when a review is added/updated
CREATE OR REPLACE FUNCTION update_doctor_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert doctor stats
  INSERT INTO doctor_stats (doctor_id)
  VALUES (NEW.doctor_id)
  ON CONFLICT (doctor_id) DO NOTHING;

  -- Recalculate stats
  UPDATE doctor_stats
  SET
    total_reviews = (
      SELECT COUNT(*) 
      FROM doctor_reviews 
      WHERE doctor_id = NEW.doctor_id 
      AND status = 'published'
    ),
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM doctor_reviews 
      WHERE doctor_id = NEW.doctor_id 
      AND status = 'published'
    ),
    five_star_count = (
      SELECT COUNT(*) 
      FROM doctor_reviews 
      WHERE doctor_id = NEW.doctor_id 
      AND rating = 5 
      AND status = 'published'
    ),
    four_star_count = (
      SELECT COUNT(*) 
      FROM doctor_reviews 
      WHERE doctor_id = NEW.doctor_id 
      AND rating = 4 
      AND status = 'published'
    ),
    three_star_count = (
      SELECT COUNT(*) 
      FROM doctor_reviews 
      WHERE doctor_id = NEW.doctor_id 
      AND rating = 3 
      AND status = 'published'
    ),
    two_star_count = (
      SELECT COUNT(*) 
      FROM doctor_reviews 
      WHERE doctor_id = NEW.doctor_id 
      AND rating = 2 
      AND status = 'published'
    ),
    one_star_count = (
      SELECT COUNT(*) 
      FROM doctor_reviews 
      WHERE doctor_id = NEW.doctor_id 
      AND rating = 1 
      AND status = 'published'
    ),
    professionalism_avg = (
      SELECT COALESCE(AVG(professionalism_rating), 0)
      FROM doctor_reviews 
      WHERE doctor_id = NEW.doctor_id 
      AND status = 'published'
      AND professionalism_rating IS NOT NULL
    ),
    clarity_avg = (
      SELECT COALESCE(AVG(clarity_rating), 0)
      FROM doctor_reviews 
      WHERE doctor_id = NEW.doctor_id 
      AND status = 'published'
      AND clarity_rating IS NOT NULL
    ),
    response_time_avg = (
      SELECT COALESCE(AVG(response_time_rating), 0)
      FROM doctor_reviews 
      WHERE doctor_id = NEW.doctor_id 
      AND status = 'published'
      AND response_time_rating IS NOT NULL
    ),
    updated_at = NOW()
  WHERE doctor_id = NEW.doctor_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update doctor stats
CREATE TRIGGER doctor_reviews_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON doctor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_stats();

-- Create function to update doctor stats when consultation count changes
CREATE OR REPLACE FUNCTION update_consultation_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update consultation count for the doctor
  UPDATE doctor_stats
  SET
    total_consultations = (
      SELECT COUNT(*) 
      FROM consults 
      WHERE doctor_id = NEW.doctor_id
    ),
    updated_at = NOW()
  WHERE doctor_id = NEW.doctor_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update consultation count
CREATE TRIGGER consults_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON consults
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_count();

-- Insert sample reviews for testing
INSERT INTO doctor_reviews (
  doctor_id,
  patient_id,
  consult_id,
  rating,
  review_text,
  response_time_rating,
  professionalism_rating,
  clarity_rating,
  is_verified_patient,
  status
) VALUES (
  (SELECT user_id FROM doctors LIMIT 1),
  (SELECT id FROM users WHERE role = 'patient' LIMIT 1),
  (SELECT id FROM consults LIMIT 1),
  5,
  'Excelente atención médica. El doctor fue muy profesional y respondió rápidamente a mis preguntas.',
  5,
  5,
  5,
  true,
  'published'
), (
  (SELECT user_id FROM doctors LIMIT 1),
  (SELECT id FROM users WHERE role = 'patient' LIMIT 1),
  (SELECT id FROM consults LIMIT 1),
  4,
  'Muy buena consulta. El doctor fue claro en sus explicaciones y me ayudó mucho.',
  4,
  4,
  5,
  true,
  'published'
), (
  (SELECT user_id FROM doctors LIMIT 1),
  (SELECT id FROM users WHERE role = 'patient' LIMIT 1),
  (SELECT id FROM consults LIMIT 1),
  5,
  'Recomiendo totalmente a este doctor. Muy profesional y empático.',
  5,
  5,
  4,
  true,
  'published'
);

