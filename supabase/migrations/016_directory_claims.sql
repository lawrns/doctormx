-- ================================================
-- DIRECTORY CLAIM SYSTEM
-- Migration: 016_directory_claims.sql
-- Purpose: Enable unclaimed profile claiming and verification
-- ================================================

-- UP Migration

-- Claim status enum
DO $$ BEGIN
  CREATE TYPE profile_claim_status AS ENUM (
    'unclaimed',
    'claim_pending',
    'verification_required',
    'claimed',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add claim-related columns to doctors table if not exists
DO $$ BEGIN
  ALTER TABLE doctors ADD COLUMN IF NOT EXISTS claim_status profile_claim_status DEFAULT 'claimed';
  ALTER TABLE doctors ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES users(id);
  ALTER TABLE doctors ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
  ALTER TABLE doctors ADD COLUMN IF NOT EXISTS profile_source TEXT DEFAULT 'self_registered';
  ALTER TABLE doctors ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0;
  ALTER TABLE doctors ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Profile claims table (tracks claim attempts)
CREATE TABLE IF NOT EXISTS profile_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_profile_id UUID NOT NULL, -- References the unclaimed doctor profile
  claimant_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Claim status
  status profile_claim_status NOT NULL DEFAULT 'claim_pending',
  
  -- Verification data
  cedula_profesional TEXT,
  cedula_verified BOOLEAN DEFAULT FALSE,
  verification_method TEXT, -- 'cedula', 'conacem', 'manual'
  verification_notes TEXT,
  
  -- Documents uploaded for verification
  id_document_path TEXT,
  cedula_document_path TEXT,
  selfie_path TEXT,
  
  -- Admin review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes for profile_claims
CREATE INDEX IF NOT EXISTS idx_profile_claims_doctor ON profile_claims(doctor_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_claims_claimant ON profile_claims(claimant_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_claims_status ON profile_claims(status) WHERE status IN ('claim_pending', 'verification_required');
CREATE INDEX IF NOT EXISTS idx_profile_claims_expires ON profile_claims(expires_at) WHERE status = 'claim_pending';

-- Unclaimed doctor profiles (imported from public registries)
CREATE TABLE IF NOT EXISTS unclaimed_doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info from public data
  full_name TEXT NOT NULL,
  cedula_profesional TEXT,
  specialty TEXT,
  city TEXT,
  state TEXT,
  
  -- Source tracking
  data_source TEXT NOT NULL, -- 'conacem', 'sep', 'hospital_directory', 'manual'
  source_url TEXT,
  source_id TEXT, -- ID from the source system
  
  -- Matching
  matched_doctor_id UUID REFERENCES doctors(user_id),
  match_confidence NUMERIC(3, 2), -- 0.00 to 1.00
  
  -- Status
  claim_status profile_claim_status NOT NULL DEFAULT 'unclaimed',
  claim_id UUID REFERENCES profile_claims(id),
  
  -- SEO/visibility
  slug TEXT UNIQUE,
  page_views INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for unclaimed profiles
CREATE INDEX IF NOT EXISTS idx_unclaimed_profiles_cedula ON unclaimed_doctor_profiles(cedula_profesional);
CREATE INDEX IF NOT EXISTS idx_unclaimed_profiles_name ON unclaimed_doctor_profiles USING gin(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_unclaimed_profiles_specialty ON unclaimed_doctor_profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_unclaimed_profiles_city ON unclaimed_doctor_profiles(city, state);
CREATE INDEX IF NOT EXISTS idx_unclaimed_profiles_status ON unclaimed_doctor_profiles(claim_status);
CREATE INDEX IF NOT EXISTS idx_unclaimed_profiles_slug ON unclaimed_doctor_profiles(slug);

-- Function to generate slug
CREATE OR REPLACE FUNCTION generate_doctor_slug(name TEXT, specialty TEXT, city TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from name
  base_slug := lower(regexp_replace(
    regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  ));
  
  -- Add specialty and city if available
  IF specialty IS NOT NULL THEN
    base_slug := base_slug || '-' || lower(regexp_replace(specialty, '\s+', '-', 'g'));
  END IF;
  
  IF city IS NOT NULL THEN
    base_slug := base_slug || '-' || lower(regexp_replace(city, '\s+', '-', 'g'));
  END IF;
  
  -- Ensure uniqueness
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM unclaimed_doctor_profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
CREATE OR REPLACE FUNCTION set_unclaimed_profile_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_doctor_slug(NEW.full_name, NEW.specialty, NEW.city);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_unclaimed_profile_slug_trigger ON unclaimed_doctor_profiles;
CREATE TRIGGER set_unclaimed_profile_slug_trigger
  BEFORE INSERT ON unclaimed_doctor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_unclaimed_profile_slug();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_profile_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profile_claims_timestamp ON profile_claims;
CREATE TRIGGER update_profile_claims_timestamp
  BEFORE UPDATE ON profile_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_claims_updated_at();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE profile_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE unclaimed_doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Profile claims policies
CREATE POLICY "Users can view own claims"
  ON profile_claims FOR SELECT
  USING (auth.uid() = claimant_user_id);

CREATE POLICY "Users can create claims"
  ON profile_claims FOR INSERT
  WITH CHECK (auth.uid() = claimant_user_id);

CREATE POLICY "Users can update own pending claims"
  ON profile_claims FOR UPDATE
  USING (auth.uid() = claimant_user_id AND status IN ('claim_pending', 'verification_required'));

CREATE POLICY "Admins can manage all claims"
  ON profile_claims FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role can manage claims"
  ON profile_claims FOR ALL
  USING (auth.role() = 'service_role');

-- Unclaimed profiles policies (public read for directory)
CREATE POLICY "Anyone can view unclaimed profiles"
  ON unclaimed_doctor_profiles FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage unclaimed profiles"
  ON unclaimed_doctor_profiles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage unclaimed profiles"
  ON unclaimed_doctor_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ================================================
-- DOWN Migration (for rollback)
-- Run these commands to rollback:
--
-- DROP TABLE IF EXISTS unclaimed_doctor_profiles CASCADE;
-- DROP TABLE IF EXISTS profile_claims CASCADE;
-- DROP FUNCTION IF EXISTS generate_doctor_slug(TEXT, TEXT, TEXT);
-- DROP FUNCTION IF EXISTS set_unclaimed_profile_slug();
-- DROP FUNCTION IF EXISTS update_profile_claims_updated_at();
-- ALTER TABLE doctors DROP COLUMN IF EXISTS claim_status;
-- ALTER TABLE doctors DROP COLUMN IF EXISTS claimed_by;
-- ALTER TABLE doctors DROP COLUMN IF EXISTS claimed_at;
-- ALTER TABLE doctors DROP COLUMN IF EXISTS profile_source;
-- ALTER TABLE doctors DROP COLUMN IF EXISTS profile_completeness;
-- ALTER TABLE doctors DROP COLUMN IF EXISTS last_active_at;
-- DROP TYPE IF EXISTS profile_claim_status;
-- ================================================
