-- ========================================
-- Minimal Working RLS Policies for Doctor.mx
-- ========================================

-- Drop all existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname
              FROM pg_policies
              WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ========================================
-- PROFILES
-- ========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- ========================================
-- DOCTORS
-- ========================================
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctors_public_verified" ON doctors FOR SELECT USING (license_status = 'verified'::dm_license_status);
CREATE POLICY "doctors_own" ON doctors FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- PROVIDERS
-- ========================================
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "providers_public_verified" ON providers FOR SELECT USING (verified = true);
CREATE POLICY "providers_own" ON providers FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- CONSULTS
-- ========================================
ALTER TABLE consults ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consults_patient" ON consults FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "consults_doctor" ON consults FOR ALL USING (auth.uid() = doctor_id);

-- ========================================
-- ERX (Prescriptions)
-- ========================================
ALTER TABLE erx ENABLE ROW LEVEL SECURITY;
CREATE POLICY "erx_patient" ON erx FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "erx_doctor" ON erx FOR ALL USING (auth.uid() = doctor_id);

-- ========================================
-- REFERRALS
-- ========================================
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals_patient" ON referrals FOR ALL USING (auth.uid() = patient_id);

-- ========================================
-- APPOINTMENTS
-- ========================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments_patient" ON appointments FOR ALL USING (auth.uid() = patient_id);

SELECT '✅ Minimal RLS policies created successfully!' as status;
