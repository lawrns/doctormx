-- ================================================
-- REFERRAL PROGRAM - Viral Growth Tables
-- Track referrals, rewards, and conversions
-- ================================================

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(doctor_id)
);

-- Referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    referred_doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL REFERENCES referral_codes(code),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending', -- pending, converted, expired
    
    -- Conversion details
    converted_at TIMESTAMPTZ,
    subscription_tier TEXT,
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent duplicate referrals
    UNIQUE(referred_doctor_id)
);

-- Referral rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
    
    -- Reward details
    reward_type TEXT NOT NULL, -- free_month, credit, upgrade
    reward_value INTEGER NOT NULL,
    description TEXT NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- pending, applied, expired
    applied_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_doctor_id ON referral_codes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_doctor_id ON referral_rewards(doctor_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);

-- Enable RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view their own referral code"
    ON referral_codes FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage referral codes"
    ON referral_codes FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Referrers can view their referrals"
    ON referrals FOR SELECT
    USING (auth.uid() = referrer_doctor_id);

CREATE POLICY "Service role can manage referrals"
    ON referrals FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Doctors can view their rewards"
    ON referral_rewards FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage rewards"
    ON referral_rewards FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to auto-generate referral code on doctor approval
CREATE OR REPLACE FUNCTION create_referral_code_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO referral_codes (code, doctor_id)
        VALUES (
            'DOC' || UPPER(SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 6)) || 
            UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 3)),
            NEW.id
        )
        ON CONFLICT (doctor_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create referral code
DROP TRIGGER IF EXISTS trigger_create_referral_code ON doctors;
CREATE TRIGGER trigger_create_referral_code
    AFTER UPDATE ON doctors
    FOR EACH ROW
    WHEN (NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved')
    EXECUTE FUNCTION create_referral_code_on_approval();

-- Grant permissions
GRANT ALL ON referral_codes TO service_role;
GRANT ALL ON referrals TO service_role;
GRANT ALL ON referral_rewards TO service_role;

-- Comments
COMMENT ON TABLE referral_codes IS 'Unique referral codes for each doctor';
COMMENT ON TABLE referrals IS 'Tracks doctor-to-doctor referrals';
COMMENT ON TABLE referral_rewards IS 'Rewards earned through referrals';
