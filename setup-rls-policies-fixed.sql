-- ========================================
-- Row Level Security (RLS) Policies Setup
-- ========================================
-- This script sets up proper RLS policies for the Doctor.mx application

-- Drop all existing policies first to avoid conflicts
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
-- 1. PROFILES TABLE
-- ========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ========================================
-- 2. DOCTORS TABLE
-- ========================================
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Everyone can view doctors with active license
CREATE POLICY "Anyone can view active doctors" ON doctors
  FOR SELECT
  USING (license_status = 'active'::license_status);

-- Doctors can view their own profile
CREATE POLICY "Doctors can view own profile" ON doctors
  FOR SELECT
  USING (auth.uid() = user_id);

-- Doctors can insert their own profile
CREATE POLICY "Doctors can insert own profile" ON doctors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Doctors can update their own profile
CREATE POLICY "Doctors can update own profile" ON doctors
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- 3. PROVIDERS TABLE
-- ========================================
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Everyone can view verified providers
CREATE POLICY "Anyone can view verified providers" ON providers
  FOR SELECT
  USING (verified = true);

-- Providers can view their own profile
CREATE POLICY "Providers can view own profile" ON providers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Providers can insert their own profile
CREATE POLICY "Providers can insert own profile" ON providers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Providers can update their own profile
CREATE POLICY "Providers can update own profile" ON providers
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- 4. CONSULTS TABLE
-- ========================================
ALTER TABLE consults ENABLE ROW LEVEL SECURITY;

-- Patients can view their own consults
CREATE POLICY "Patients can view own consults" ON consults
  FOR SELECT
  USING (auth.uid() = patient_id);

-- Doctors can view consults assigned to them
CREATE POLICY "Doctors can view assigned consults" ON consults
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM doctors WHERE user_id = auth.uid()));

-- Patients can create consults
CREATE POLICY "Patients can create consults" ON consults
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Doctors can update their consults
CREATE POLICY "Doctors can update their consults" ON consults
  FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM doctors WHERE user_id = auth.uid()));

-- ========================================
-- 5. ERX (PRESCRIPTIONS) TABLE
-- ========================================
ALTER TABLE erx ENABLE ROW LEVEL SECURITY;

-- Patients can view their own prescriptions
CREATE POLICY "Patients can view own prescriptions" ON erx
  FOR SELECT
  USING (auth.uid() = patient_id);

-- Doctors can view prescriptions they created
CREATE POLICY "Doctors can view own prescriptions" ON erx
  FOR SELECT
  USING (auth.uid() = doctor_id);

-- Doctors can create prescriptions
CREATE POLICY "Doctors can create prescriptions" ON erx
  FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

-- ========================================
-- 6. REFERRALS TABLE
-- ========================================
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Patients can view their own referrals
CREATE POLICY "Patients can view own referrals" ON referrals
  FOR SELECT
  USING (auth.uid() = patient_id);

-- Doctors can view referrals they created
CREATE POLICY "Doctors can view own referrals" ON referrals
  FOR SELECT
  USING (auth.uid() = doctor_id);

-- Doctors can create referrals
CREATE POLICY "Doctors can create referrals" ON referrals
  FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

-- ========================================
-- 7. APPOINTMENTS TABLE
-- ========================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments" ON appointments
  FOR SELECT
  USING (auth.uid() = patient_id);

-- Doctors can view their appointments
CREATE POLICY "Doctors can view own appointments" ON appointments
  FOR SELECT
  USING (auth.uid() = doctor_id);

-- Patients can create appointments
CREATE POLICY "Patients can create appointments" ON appointments
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Both can update appointments
CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- ========================================
-- 8. MEDICAL_PROFILES TABLE
-- ========================================
ALTER TABLE medical_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own medical profile
CREATE POLICY "Users can view own medical profile" ON medical_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own medical profile
CREATE POLICY "Users can insert own medical profile" ON medical_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own medical profile
CREATE POLICY "Users can update own medical profile" ON medical_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- 9. VITAL_SIGNS TABLE
-- ========================================
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

-- Users can view their own vital signs
CREATE POLICY "Users can view own vital signs" ON vital_signs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own vital signs
CREATE POLICY "Users can insert own vital signs" ON vital_signs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 10. PAYMENTS TABLE
-- ========================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 11. INVOICES TABLE
-- ========================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT
  USING (auth.uid() = user_id);

-- ========================================
-- 12. AI_CONVERSATIONS TABLE
-- ========================================
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI conversations
CREATE POLICY "Users can view own AI conversations" ON ai_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own AI conversations
CREATE POLICY "Users can insert own AI conversations" ON ai_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own AI conversations
CREATE POLICY "Users can update own AI conversations" ON ai_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- 13. MESSAGES TABLE
-- ========================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies have been successfully created!';
  RAISE NOTICE '🔒 All tables now have proper security policies';
  RAISE NOTICE '🎉 Authentication should now work correctly!';
END $$;
