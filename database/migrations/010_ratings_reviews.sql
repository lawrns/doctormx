-- Doctor Ratings and Reviews System Migration
-- Create comprehensive rating and review system for doctors

-- Doctor reviews table
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
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'flagged')),
  moderation_notes TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctor statistics table for aggregated data
CREATE TABLE IF NOT EXISTS doctor_stats (
  doctor_id UUID PRIMARY KEY REFERENCES doctors(user_id) ON DELETE CASCADE,
  total_reviews INTEGER DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  five_star_count INTEGER DEFAULT 0,
  four_star_count INTEGER DEFAULT 0,
  three_star_count INTEGER DEFAULT 0,
  two_star_count INTEGER DEFAULT 0,
  one_star_count INTEGER DEFAULT 0,
  total_consultations INTEGER DEFAULT 0,
  response_time_avg_minutes INTEGER DEFAULT 0,
  professionalism_avg DECIMAL(3,2) DEFAULT 0.00,
  clarity_avg DECIMAL(3,2) DEFAULT 0.00,
  response_time_avg DECIMAL(3,2) DEFAULT 0.00,
  last_review_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Review helpfulness votes
CREATE TABLE IF NOT EXISTS review_helpfulness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES doctor_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Review flags for moderation
CREATE TABLE IF NOT EXISTS review_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES doctor_reviews(id) ON DELETE CASCADE,
  flagged_by UUID REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Doctor response to reviews
CREATE TABLE IF NOT EXISTS doctor_review_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES doctor_reviews(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_doctor_id ON doctor_reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_patient_id ON doctor_reviews(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_rating ON doctor_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_status ON doctor_reviews(status);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_created_at ON doctor_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_consult_id ON doctor_reviews(consult_id);

CREATE INDEX IF NOT EXISTS idx_doctor_stats_doctor_id ON doctor_stats(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_stats_average_rating ON doctor_stats(average_rating);
CREATE INDEX IF NOT EXISTS idx_doctor_stats_total_reviews ON doctor_stats(total_reviews);

CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review_id ON review_helpfulness(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_user_id ON review_helpfulness(user_id);

CREATE INDEX IF NOT EXISTS idx_review_flags_review_id ON review_flags(review_id);
CREATE INDEX IF NOT EXISTS idx_review_flags_status ON review_flags(status);

CREATE INDEX IF NOT EXISTS idx_doctor_review_responses_review_id ON doctor_review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_doctor_review_responses_doctor_id ON doctor_review_responses(doctor_id);

-- Enable Row Level Security
ALTER TABLE doctor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_review_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctor_reviews
CREATE POLICY IF NOT EXISTS "Anyone can view published reviews" ON doctor_reviews
  FOR SELECT USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Patients can create reviews for their consults" ON doctor_reviews
  FOR INSERT WITH CHECK (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM consults 
      WHERE id = consult_id 
      AND patient_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Patients can update their own reviews" ON doctor_reviews
  FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY IF NOT EXISTS "System can manage all reviews" ON doctor_reviews
  FOR ALL USING (true);

-- RLS Policies for doctor_stats
CREATE POLICY IF NOT EXISTS "Anyone can view doctor stats" ON doctor_stats
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "System can manage doctor stats" ON doctor_stats
  FOR ALL USING (true);

-- RLS Policies for review_helpfulness
CREATE POLICY IF NOT EXISTS "Anyone can view helpfulness votes" ON review_helpfulness
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can vote on reviews" ON review_helpfulness
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update their own votes" ON review_helpfulness
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for review_flags
CREATE POLICY IF NOT EXISTS "Anyone can view review flags" ON review_flags
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can flag reviews" ON review_flags
  FOR INSERT WITH CHECK (flagged_by = auth.uid());

-- RLS Policies for doctor_review_responses
CREATE POLICY IF NOT EXISTS "Anyone can view published responses" ON doctor_review_responses
  FOR SELECT USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Doctors can respond to reviews" ON doctor_review_responses
  FOR INSERT WITH CHECK (
    doctor_id IN (
      SELECT user_id FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Doctors can update their responses" ON doctor_review_responses
  FOR UPDATE USING (
    doctor_id IN (
      SELECT user_id FROM doctors WHERE user_id = auth.uid()
    )
  );

-- Add constraints
ALTER TABLE doctor_reviews ADD CONSTRAINT IF NOT EXISTS chk_review_text_length 
  CHECK (LENGTH(review_text) <= 2000);

ALTER TABLE doctor_review_responses ADD CONSTRAINT IF NOT EXISTS chk_response_text_length 
  CHECK (LENGTH(response_text) <= 1000);

-- Create function to update doctor stats when a review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_doctor_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update stats for the doctor
    INSERT INTO doctor_stats (
      doctor_id,
      total_reviews,
      total_ratings,
      average_rating,
      five_star_count,
      four_star_count,
      three_star_count,
      two_star_count,
      one_star_count,
      professionalism_avg,
      clarity_avg,
      response_time_avg,
      last_review_at,
      updated_at
    )
    SELECT 
      NEW.doctor_id,
      COUNT(*) as total_reviews,
      COUNT(*) as total_ratings,
      ROUND(AVG(rating), 2) as average_rating,
      COUNT(*) FILTER (WHERE rating = 5) as five_star_count,
      COUNT(*) FILTER (WHERE rating = 4) as four_star_count,
      COUNT(*) FILTER (WHERE rating = 3) as three_star_count,
      COUNT(*) FILTER (WHERE rating = 2) as two_star_count,
      COUNT(*) FILTER (WHERE rating = 1) as one_star_count,
      ROUND(AVG(professionalism_rating), 2) as professionalism_avg,
      ROUND(AVG(clarity_rating), 2) as clarity_avg,
      ROUND(AVG(response_time_rating), 2) as response_time_avg,
      MAX(created_at) as last_review_at,
      NOW() as updated_at
    FROM doctor_reviews 
    WHERE doctor_id = NEW.doctor_id AND status = 'published'
    ON CONFLICT (doctor_id) DO UPDATE SET
      total_reviews = EXCLUDED.total_reviews,
      total_ratings = EXCLUDED.total_ratings,
      average_rating = EXCLUDED.average_rating,
      five_star_count = EXCLUDED.five_star_count,
      four_star_count = EXCLUDED.four_star_count,
      three_star_count = EXCLUDED.three_star_count,
      two_star_count = EXCLUDED.two_star_count,
      one_star_count = EXCLUDED.one_star_count,
      professionalism_avg = EXCLUDED.professionalism_avg,
      clarity_avg = EXCLUDED.clarity_avg,
      response_time_avg = EXCLUDED.response_time_avg,
      last_review_at = EXCLUDED.last_review_at,
      updated_at = EXCLUDED.updated_at;
  END IF;

  IF TG_OP = 'DELETE' THEN
    -- Update stats for the doctor after deletion
    INSERT INTO doctor_stats (
      doctor_id,
      total_reviews,
      total_ratings,
      average_rating,
      five_star_count,
      four_star_count,
      three_star_count,
      two_star_count,
      one_star_count,
      professionalism_avg,
      clarity_avg,
      response_time_avg,
      last_review_at,
      updated_at
    )
    SELECT 
      OLD.doctor_id,
      COUNT(*) as total_reviews,
      COUNT(*) as total_ratings,
      ROUND(AVG(rating), 2) as average_rating,
      COUNT(*) FILTER (WHERE rating = 5) as five_star_count,
      COUNT(*) FILTER (WHERE rating = 4) as four_star_count,
      COUNT(*) FILTER (WHERE rating = 3) as three_star_count,
      COUNT(*) FILTER (WHERE rating = 2) as two_star_count,
      COUNT(*) FILTER (WHERE rating = 1) as one_star_count,
      ROUND(AVG(professionalism_rating), 2) as professionalism_avg,
      ROUND(AVG(clarity_rating), 2) as clarity_avg,
      ROUND(AVG(response_time_rating), 2) as response_time_avg,
      MAX(created_at) as last_review_at,
      NOW() as updated_at
    FROM doctor_reviews 
    WHERE doctor_id = OLD.doctor_id AND status = 'published'
    ON CONFLICT (doctor_id) DO UPDATE SET
      total_reviews = EXCLUDED.total_reviews,
      total_ratings = EXCLUDED.total_ratings,
      average_rating = EXCLUDED.average_rating,
      five_star_count = EXCLUDED.five_star_count,
      four_star_count = EXCLUDED.four_star_count,
      three_star_count = EXCLUDED.three_star_count,
      two_star_count = EXCLUDED.two_star_count,
      one_star_count = EXCLUDED.one_star_count,
      professionalism_avg = EXCLUDED.professionalism_avg,
      clarity_avg = EXCLUDED.clarity_avg,
      response_time_avg = EXCLUDED.response_time_avg,
      last_review_at = EXCLUDED.last_review_at,
      updated_at = EXCLUDED.updated_at;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update doctor stats
CREATE TRIGGER trigger_update_doctor_stats
  AFTER INSERT OR UPDATE OR DELETE ON doctor_reviews
  FOR EACH ROW EXECUTE FUNCTION update_doctor_stats();

-- Add comments for documentation
COMMENT ON TABLE doctor_reviews IS 'Patient reviews and ratings for doctors';
COMMENT ON TABLE doctor_stats IS 'Aggregated statistics for doctors based on reviews';
COMMENT ON TABLE review_helpfulness IS 'Votes on review helpfulness by users';
COMMENT ON TABLE review_flags IS 'Flags for inappropriate reviews';
COMMENT ON TABLE doctor_review_responses IS 'Doctor responses to patient reviews';

COMMENT ON COLUMN doctor_reviews.rating IS 'Overall rating from 1-5 stars';
COMMENT ON COLUMN doctor_reviews.response_time_rating IS 'Rating for response time (1-5)';
COMMENT ON COLUMN doctor_reviews.professionalism_rating IS 'Rating for professionalism (1-5)';
COMMENT ON COLUMN doctor_reviews.clarity_rating IS 'Rating for communication clarity (1-5)';
COMMENT ON COLUMN doctor_reviews.is_verified_patient IS 'Whether the reviewer is a verified patient';
COMMENT ON COLUMN doctor_reviews.is_anonymous IS 'Whether the review is anonymous';
