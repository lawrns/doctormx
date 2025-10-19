-- SEP Verification System Migration
-- Add SEP verification tracking to doctors table

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS sep_verification_details JSONB;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS sep_verified_at TIMESTAMP;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS sep_verification_attempts INTEGER DEFAULT 0;

-- Create SEP verification cache table
CREATE TABLE IF NOT EXISTS sep_verification_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cedula_number VARCHAR(20) UNIQUE NOT NULL,
  verification_result JSONB NOT NULL,
  verified_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create SEP verification details table for audit trail
CREATE TABLE IF NOT EXISTS sep_verification_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(user_id),
  cedula_number VARCHAR(20) NOT NULL,
  verification_method VARCHAR(50), -- 'sep_database', 'alternative_service', 'manual'
  verification_result JSONB NOT NULL,
  verification_source VARCHAR(255), -- URL or service name
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctors_sep_verified_at ON doctors(sep_verified_at);
CREATE INDEX IF NOT EXISTS idx_doctors_sep_verification_attempts ON doctors(sep_verification_attempts);
CREATE INDEX IF NOT EXISTS idx_sep_verification_cache_cedula ON sep_verification_cache(cedula_number);
CREATE INDEX IF NOT EXISTS idx_sep_verification_cache_expires ON sep_verification_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_sep_verification_details_doctor_id ON sep_verification_details(doctor_id);
CREATE INDEX IF NOT EXISTS idx_sep_verification_details_cedula ON sep_verification_details(cedula_number);
CREATE INDEX IF NOT EXISTS idx_sep_verification_details_created_at ON sep_verification_details(created_at);

-- Enable Row Level Security
ALTER TABLE sep_verification_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE sep_verification_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sep_verification_cache
CREATE POLICY IF NOT EXISTS "System can manage verification cache" ON sep_verification_cache
  FOR ALL USING (true);

-- RLS Policies for sep_verification_details
CREATE POLICY IF NOT EXISTS "Doctors can view their own verification details" ON sep_verification_details
  FOR SELECT USING (
    doctor_id IN (
      SELECT user_id FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "System can insert verification details" ON sep_verification_details
  FOR INSERT WITH CHECK (true);

-- Add constraints
ALTER TABLE doctors ADD CONSTRAINT IF NOT EXISTS chk_sep_verification_attempts 
  CHECK (sep_verification_attempts >= 0);

-- Add comments for documentation
COMMENT ON COLUMN doctors.sep_verification_details IS 'JSON containing SEP verification result and details';
COMMENT ON COLUMN doctors.sep_verified_at IS 'Timestamp when SEP verification was completed';
COMMENT ON COLUMN doctors.sep_verification_attempts IS 'Number of SEP verification attempts made';

COMMENT ON TABLE sep_verification_cache IS 'Cache for SEP verification results to avoid repeated API calls';
COMMENT ON TABLE sep_verification_details IS 'Audit trail for all SEP verification attempts';

-- Create function to automatically clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_sep_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM sep_verification_cache 
  WHERE expires_at < NOW();
  
  -- Log the cleanup
  INSERT INTO sep_verification_details (
    cedula_number, 
    verification_method, 
    verification_result,
    verification_source
  ) VALUES (
    'SYSTEM', 
    'cache_cleanup', 
    '{"action": "cleanup", "timestamp": "' || NOW() || '"}'::jsonb,
    'system_cron'
  );
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean expired cache (requires pg_cron extension)
-- Note: This would need to be set up in Supabase dashboard or via SQL
-- SELECT cron.schedule('clean-sep-cache', '0 2 * * *', 'SELECT clean_expired_sep_cache();');