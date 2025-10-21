-- Migration: Complete Doctor Profile Fields
-- Add missing fields to doctors table for comprehensive profiles

-- Add missing fields to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS education JSONB,
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS location JSONB,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Update existing doctors with default values
UPDATE doctors 
SET 
  education = '[]'::jsonb,
  certifications = '{}',
  experience_years = 5,
  languages = '{"Español"}',
  graduation_year = 2010,
  location = '{"city": "Ciudad de México", "state": "CDMX", "country": "México"}',
  total_reviews = 0
WHERE education IS NULL;

-- Create index on location for faster queries
CREATE INDEX IF NOT EXISTS idx_doctors_location ON doctors USING GIN (location);

-- Create index on languages for filtering
CREATE INDEX IF NOT EXISTS idx_doctors_languages ON doctors USING GIN (languages);

-- Create index on certifications for filtering
CREATE INDEX IF NOT EXISTS idx_doctors_certifications ON doctors USING GIN (certifications);

-- Create index on experience_years for sorting
CREATE INDEX IF NOT EXISTS idx_doctors_experience_years ON doctors (experience_years);

-- Create index on graduation_year for sorting
CREATE INDEX IF NOT EXISTS idx_doctors_graduation_year ON doctors (graduation_year);

-- Create index on total_reviews for sorting
CREATE INDEX IF NOT EXISTS idx_doctors_total_reviews ON doctors (total_reviews);

-- Add comments for documentation
COMMENT ON COLUMN doctors.education IS 'JSON array of education history: [{"institution": "UNAM", "degree": "MD", "year": 2010}]';
COMMENT ON COLUMN doctors.certifications IS 'Array of medical certifications and specializations';
COMMENT ON COLUMN doctors.experience_years IS 'Years of medical practice experience';
COMMENT ON COLUMN doctors.languages IS 'Array of languages spoken by the doctor';
COMMENT ON COLUMN doctors.graduation_year IS 'Year of medical school graduation';
COMMENT ON COLUMN doctors.location IS 'JSON object with city, state, country information';
COMMENT ON COLUMN doctors.total_reviews IS 'Total number of reviews received';
