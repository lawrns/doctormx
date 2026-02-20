-- ================================================
-- RLS POLICIES COMPLETION - DB-001
-- Add Missing Row Level Security Policies
-- Created: 2026-02-20
-- Tables: prescriptions, availability_rules, availability_exceptions
-- ================================================

-- ================================================
-- 1. PRESCRIPTIONS TABLE - COMPLETE RLS POLICIES
-- ================================================

-- Enable RLS (if not already enabled)
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Doctors can create prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Patients can view their prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors can update their prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors can delete their prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Service role can manage prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Admins can manage all prescriptions" ON prescriptions;

-- SELECT: Patients can view their own prescriptions
CREATE POLICY "Patients can view their prescriptions"
  ON prescriptions FOR SELECT
  USING (
    patient_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- SELECT: Doctors can view prescriptions for their patients
CREATE POLICY "Doctors can view their prescriptions"
  ON prescriptions FOR SELECT
  USING (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- INSERT: Doctors can create prescriptions for their appointments
CREATE POLICY "Doctors can create prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (
    doctor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM appointments 
      WHERE id = appointment_id 
      AND doctor_id = prescriptions.doctor_id
      AND patient_id = prescriptions.patient_id
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- UPDATE: Doctors can update their own prescriptions
CREATE POLICY "Doctors can update their prescriptions"
  ON prescriptions FOR UPDATE
  USING (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- DELETE: Only doctors who created the prescription or admins can delete
CREATE POLICY "Doctors can delete their prescriptions"
  ON prescriptions FOR DELETE
  USING (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Service role bypass for system operations
CREATE POLICY "Service role can manage prescriptions"
  ON prescriptions FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ================================================
-- 2. AVAILABILITY_RULES TABLE - COMPLETE RLS POLICIES
-- ================================================

-- Enable RLS (if not already enabled)
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Doctors can manage their availability" ON availability_rules;
DROP POLICY IF EXISTS "Everyone can view active availability" ON availability_rules;
DROP POLICY IF EXISTS "Service role can manage availability" ON availability_rules;
DROP POLICY IF EXISTS "Admins can manage all availability" ON availability_rules;

-- SELECT: Everyone can view active availability rules
CREATE POLICY "Everyone can view active availability"
  ON availability_rules FOR SELECT
  USING (
    active = true 
    OR doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- INSERT: Doctors can create their own availability rules
CREATE POLICY "Doctors can create availability rules"
  ON availability_rules FOR INSERT
  WITH CHECK (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- UPDATE: Doctors can update their own availability rules
CREATE POLICY "Doctors can update their availability rules"
  ON availability_rules FOR UPDATE
  USING (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- DELETE: Doctors can delete their own availability rules
CREATE POLICY "Doctors can delete their availability rules"
  ON availability_rules FOR DELETE
  USING (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Service role bypass for system operations
CREATE POLICY "Service role can manage availability"
  ON availability_rules FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ================================================
-- 3. AVAILABILITY_EXCEPTIONS TABLE - COMPLETE RLS POLICIES
-- ================================================

-- Enable RLS (if not already enabled)
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Doctors can manage their exceptions" ON availability_exceptions;
DROP POLICY IF EXISTS "Service role can manage exceptions" ON availability_exceptions;
DROP POLICY IF EXISTS "Admins can manage all exceptions" ON availability_exceptions;

-- SELECT: Doctors can view their own exceptions, others can see exceptions affecting availability
CREATE POLICY "Doctors can view their exceptions"
  ON availability_exceptions FOR SELECT
  USING (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- INSERT: Doctors can create their own availability exceptions
CREATE POLICY "Doctors can create exceptions"
  ON availability_exceptions FOR INSERT
  WITH CHECK (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- UPDATE: Doctors can update their own exceptions
CREATE POLICY "Doctors can update their exceptions"
  ON availability_exceptions FOR UPDATE
  USING (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- DELETE: Doctors can delete their own exceptions
CREATE POLICY "Doctors can delete their exceptions"
  ON availability_exceptions FOR DELETE
  USING (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Service role bypass for system operations
CREATE POLICY "Service role can manage exceptions"
  ON availability_exceptions FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ================================================
-- 4. OPTIMIZATION INDEXES FOR RLS QUERIES
-- ================================================

-- Index for prescription lookups by patient
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id 
ON prescriptions(patient_id);

-- Index for prescription lookups by doctor
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id 
ON prescriptions(doctor_id);

-- Index for prescription lookups by appointment
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id 
ON prescriptions(appointment_id);

-- Composite index for availability rules lookups
CREATE INDEX IF NOT EXISTS idx_availability_rules_doctor_active 
ON availability_rules(doctor_id, active);

-- Index for availability exceptions lookups
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_doctor_id 
ON availability_exceptions(doctor_id);

-- Index for availability exceptions by date range
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_date_range 
ON availability_exceptions(start_ts, end_ts);

-- ================================================
-- 5. VERIFICATION FUNCTION
-- ================================================

-- Function to verify RLS policies are in place
CREATE OR REPLACE FUNCTION verify_rls_policies_db001()
RETURNS TABLE (
  table_name TEXT,
  policy_name TEXT,
  operation TEXT,
  permissive TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg_policies.tablename::TEXT,
    pg_policies.policyname::TEXT,
    pg_policies.cmd::TEXT,
    pg_policies.permissive::TEXT
  FROM pg_policies
  WHERE pg_policies.schemaname = 'public'
    AND pg_policies.tablename IN ('prescriptions', 'availability_rules', 'availability_exceptions')
  ORDER BY pg_policies.tablename, pg_policies.cmd, pg_policies.policyname;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION verify_rls_policies_db001() IS 'Verifies RLS policies for prescriptions, availability_rules, and availability_exceptions tables (DB-001)';

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

/*
-- Run these to verify all policies are in place:

-- Check all policies for the three tables
SELECT * FROM verify_rls_policies_db001();

-- Check RLS status for all three tables
SELECT 
  tablename, 
  relrowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = c.relname) as policy_count
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
  AND t.tablename IN ('prescriptions', 'availability_rules', 'availability_exceptions')
ORDER BY tablename;

-- Check for missing policies by operation
SELECT 
  t.tablename,
  'SELECT' as operation,
  EXISTS (SELECT 1 FROM pg_policies WHERE tablename = t.tablename AND cmd = 'SELECT') as has_policy
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename IN ('prescriptions', 'availability_rules', 'availability_exceptions')
UNION ALL
SELECT 
  t.tablename,
  'INSERT' as operation,
  EXISTS (SELECT 1 FROM pg_policies WHERE tablename = t.tablename AND cmd = 'INSERT') as has_policy
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename IN ('prescriptions', 'availability_rules', 'availability_exceptions')
UNION ALL
SELECT 
  t.tablename,
  'UPDATE' as operation,
  EXISTS (SELECT 1 FROM pg_policies WHERE tablename = t.tablename AND cmd = 'UPDATE') as has_policy
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename IN ('prescriptions', 'availability_rules', 'availability_exceptions')
UNION ALL
SELECT 
  t.tablename,
  'DELETE' as operation,
  EXISTS (SELECT 1 FROM pg_policies WHERE tablename = t.tablename AND cmd = 'DELETE') as has_policy
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename IN ('prescriptions', 'availability_rules', 'availability_exceptions')
ORDER BY tablename, operation;

-- Check index coverage
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('prescriptions', 'availability_rules', 'availability_exceptions')
ORDER BY tablename, indexname;
*/
