-- Migration: Patient Referral Loop
-- Description: Viral patient→friend referral system with credits and free AI consult rewards.
-- Note: This is distinct from doctor_referrals (clinical specialist handoffs).

-- 1) Extend profiles with referral fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT,
  ADD COLUMN IF NOT EXISTS referral_credits_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_ai_consults_remaining INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_code ON profiles(referred_by_code) WHERE referred_by_code IS NOT NULL;

COMMENT ON COLUMN profiles.referral_code IS '6-char unique code the user shares to refer others.';
COMMENT ON COLUMN profiles.referred_by_code IS 'Referral code the user was referred with at signup. Immutable after first redemption.';
COMMENT ON COLUMN profiles.referral_credits_cents IS 'MXN credits earned from successful referrals (applied at checkout).';
COMMENT ON COLUMN profiles.free_ai_consults_remaining IS 'Free AI consults available to this user from referral rewards and signup bonus.';

-- 2) Referral events table — one row per redemption event
CREATE TABLE IF NOT EXISTS patient_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code_used TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'redeemed', 'rewarded', 'revoked')),
  rewards_granted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT patient_referrals_no_self CHECK (referrer_id <> referee_id),
  CONSTRAINT patient_referrals_unique_referee UNIQUE (referee_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_referrals_referrer ON patient_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_patient_referrals_code ON patient_referrals(code_used);
CREATE INDEX IF NOT EXISTS idx_patient_referrals_created_at ON patient_referrals(created_at DESC);

COMMENT ON TABLE patient_referrals IS 'Viral patient-to-friend referral events. Enforces one referee per account.';

-- 3) Monthly cap tracking: limit abuse via a per-referrer monthly count
CREATE OR REPLACE VIEW patient_referrals_monthly_counts AS
SELECT
  referrer_id,
  DATE_TRUNC('month', created_at) AS month_start,
  COUNT(*) FILTER (WHERE status IN ('redeemed', 'rewarded')) AS redemption_count
FROM patient_referrals
GROUP BY referrer_id, DATE_TRUNC('month', created_at);

GRANT SELECT ON patient_referrals_monthly_counts TO authenticated, service_role;

-- 4) RLS policies
ALTER TABLE patient_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_referrals_select_own" ON patient_referrals;
CREATE POLICY "patient_referrals_select_own"
  ON patient_referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Only service role inserts (API enforces rules). No direct writes from clients.
DROP POLICY IF EXISTS "patient_referrals_service_write" ON patient_referrals;
CREATE POLICY "patient_referrals_service_write"
  ON patient_referrals FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 5) Helper: generate a unique 6-char alphanumeric referral code (no ambiguous chars)
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- excludes 0/O/1/I/L to reduce typos
  attempt INTEGER := 0;
  code TEXT;
BEGIN
  LOOP
    attempt := attempt + 1;
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;

    IF NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = code) THEN
      RETURN code;
    END IF;

    IF attempt > 20 THEN
      RAISE EXCEPTION 'Could not generate unique referral code after 20 attempts';
    END IF;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION generate_referral_code() IS 'Generates a unique 6-char alphanumeric referral code, excluding ambiguous characters.';

-- 6) Trigger: auto-issue a referral code on profile creation if missing
CREATE OR REPLACE FUNCTION ensure_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_ensure_referral_code ON profiles;
CREATE TRIGGER trigger_ensure_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_referral_code();

-- 7) Backfill existing profiles with referral codes
UPDATE profiles SET referral_code = generate_referral_code() WHERE referral_code IS NULL;
