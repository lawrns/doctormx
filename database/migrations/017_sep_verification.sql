-- SEP verification system migration

-- Create SEP verification details table
CREATE TABLE IF NOT EXISTS sep_verification_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cedula VARCHAR(20) NOT NULL UNIQUE,
  doctor_name VARCHAR(255),
  specialty VARCHAR(100),
  issue_date DATE,
  status VARCHAR(50),
  verification_method VARCHAR(50) DEFAULT 'automated',
  verified_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create SEP verification cache table
CREATE TABLE IF NOT EXISTS sep_verification_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cedula VARCHAR(20) NOT NULL UNIQUE,
  verification_result JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS sep_verification_details_cedula_idx ON sep_verification_details(cedula);
CREATE INDEX IF NOT EXISTS sep_verification_details_status_idx ON sep_verification_details(status);
CREATE INDEX IF NOT EXISTS sep_verification_cache_cedula_idx ON sep_verification_cache(cedula);
CREATE INDEX IF NOT EXISTS sep_verification_cache_expires_at_idx ON sep_verification_cache(expires_at);

-- Enable RLS
ALTER TABLE sep_verification_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE sep_verification_cache ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DROP POLICY IF EXISTS "Service role can manage SEP verification" ON sep_verification_details;
DROP POLICY IF EXISTS "Service role can manage SEP cache" ON sep_verification_cache;

CREATE POLICY "Service role can manage SEP verification" ON sep_verification_details
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage SEP cache" ON sep_verification_cache
  FOR ALL USING (auth.role() = 'service_role');

-- Insert sample verification data for testing
INSERT INTO sep_verification_details (cedula, doctor_name, specialty, issue_date, status, metadata) VALUES
('87654321', 'Dra. Ana López', 'Dermatología', '2020-05-15', 'verified', '{"source": "sep_database", "verified_by": "automated"}'),
('22222222', 'Dra. Patricia Ruiz', 'Pediatría', '2019-08-20', 'verified', '{"source": "sep_database", "verified_by": "automated"}'),
('33333333', 'Dr. Roberto Silva', 'Psicología', '2021-03-10', 'verified', '{"source": "sep_database", "verified_by": "automated"}')
ON CONFLICT (cedula) DO NOTHING;

