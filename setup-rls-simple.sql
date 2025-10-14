-- ========================================
-- Simple RLS Policies Setup for Doctor.mx
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
-- PROFILES: Users can manage their own profile
-- ========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ========================================
-- DOCTORS: Public read for verified, own read/write
-- ========================================
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors_select_verified" ON doctors FOR SELECT USING (license_status = 'verified'::dm_license_status);
CREATE POLICY "doctors_select_own" ON doctors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "doctors_insert_own" ON doctors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "doctors_update_own" ON doctors FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- PROVIDERS: Public read for verified, own read/write
-- ========================================
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_select_verified" ON providers FOR SELECT USING (verified = true);
CREATE POLICY "providers_select_own" ON providers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "providers_insert_own" ON providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "providers_update_own" ON providers FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- CONSULTS: Patients and assigned doctors
-- ========================================
ALTER TABLE consults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consults_select_patient" ON consults FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "consults_select_doctor" ON consults FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "consults_insert_patient" ON consults FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "consults_update_doctor" ON consults FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "consults_update_patient" ON consults FOR UPDATE USING (auth.uid() = patient_id);

-- ========================================
-- ERX (Prescriptions): Patients and doctors
-- ========================================
ALTER TABLE erx ENABLE ROW LEVEL SECURITY;

CREATE POLICY "erx_select_patient" ON erx FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "erx_select_doctor" ON erx FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "erx_insert_doctor" ON erx FOR INSERT WITH CHECK (auth.uid() = doctor_id);

-- ========================================
-- REFERRALS: Patients and doctors
-- ========================================
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_select_patient" ON referrals FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "referrals_select_doctor" ON referrals FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "referrals_insert_doctor" ON referrals FOR INSERT WITH CHECK (auth.uid() = doctor_id);

-- ========================================
-- APPOINTMENTS: Patients and doctors
-- ========================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select_patient" ON appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "appointments_select_doctor" ON appointments FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "appointments_insert_patient" ON appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "appointments_update_both" ON appointments FOR UPDATE USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- ========================================
-- MEDICAL_PROFILES: Own data only
-- ========================================
ALTER TABLE medical_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medical_profiles_all_own" ON medical_profiles FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- VITAL_SIGNS: Own data only
-- ========================================
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vital_signs_all_own" ON vital_signs FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- PAYMENTS: Own data only
-- ========================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_all_own" ON payments FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- INVOICES: Own data only
-- ========================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_own" ON invoices FOR SELECT USING (auth.uid() = user_id);

-- ========================================
-- AI_CONVERSATIONS: Own data only
-- ========================================
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_conversations_all_own" ON ai_conversations FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- MESSAGES: Sender and receiver
-- ========================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_involved" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_insert_sender" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

SELECT '✅ RLS policies created successfully!' as status;
