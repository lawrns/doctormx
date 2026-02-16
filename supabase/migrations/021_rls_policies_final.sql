-- ================================================
-- RLS POLICIES FINAL - WEEK 1 FLOW A
-- Row Level Security Policy Enforcer for DoctorMX
-- Created: 2026-02-16
-- ================================================

-- ================================================
-- 1. PAYMENTS TABLE - MISSING INSERT POLICIES
-- ================================================

-- Service role can insert payments (for webhook processing)
CREATE POLICY IF NOT EXISTS "Service role can insert payments"
  ON payments FOR INSERT TO service_role WITH CHECK (true);

-- User can view own payments (enhanced version)
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = appointment_id 
      AND appointments.patient_id = auth.uid()
    )
  );

-- Doctors can view payments for their appointments
DROP POLICY IF EXISTS "Doctors can view payments for their appointments" ON payments;
CREATE POLICY "Doctors can view payments for their appointments"
  ON payments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = appointment_id 
      AND appointments.doctor_id = auth.uid()
    )
  );

-- Admins can manage all payments
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ================================================
-- 2. WHATSAPP_SESSIONS TABLE - MISSING INSERT POLICIES
-- ================================================

-- Service role can insert whatsapp sessions (for webhook processing)
DROP POLICY IF EXISTS "Service role can insert whatsapp sessions" ON whatsapp_sessions;
CREATE POLICY "Service role can insert whatsapp sessions"
  ON whatsapp_sessions FOR INSERT TO service_role WITH CHECK (true);

-- Service role can update whatsapp sessions
DROP POLICY IF EXISTS "Service role can update whatsapp sessions" ON whatsapp_sessions;
CREATE POLICY "Service role can update whatsapp sessions"
  ON whatsapp_sessions FOR UPDATE TO service_role USING (true);

-- Users can view their own whatsapp sessions
DROP POLICY IF EXISTS "Users can view their own whatsapp sessions" ON whatsapp_sessions;
CREATE POLICY "Users can view their own whatsapp sessions"
  ON whatsapp_sessions FOR SELECT USING (patient_id = auth.uid());

-- Doctors can view whatsapp sessions assigned to them
DROP POLICY IF EXISTS "Doctors can view assigned whatsapp sessions" ON whatsapp_sessions;
CREATE POLICY "Doctors can view assigned whatsapp sessions"
  ON whatsapp_sessions FOR SELECT USING (assigned_doctor_id = auth.uid());

-- Admins can manage all whatsapp sessions
DROP POLICY IF EXISTS "Admins can manage all whatsapp sessions" ON whatsapp_sessions;
CREATE POLICY "Admins can manage all whatsapp sessions"
  ON whatsapp_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ================================================
-- 3. WHATSAPP_MESSAGES TABLE - MISSING POLICIES
-- ================================================

-- Service role can insert messages (for webhook processing)
DROP POLICY IF EXISTS "Service role can insert whatsapp messages" ON whatsapp_messages;
CREATE POLICY "Service role can insert whatsapp messages"
  ON whatsapp_messages FOR INSERT TO service_role WITH CHECK (true);

-- Users can view messages from their sessions
DROP POLICY IF EXISTS "Users can view their whatsapp messages" ON whatsapp_messages;
CREATE POLICY "Users can view their whatsapp messages"
  ON whatsapp_messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM whatsapp_sessions 
      WHERE whatsapp_sessions.id = session_id 
      AND whatsapp_sessions.patient_id = auth.uid()
    )
  );

-- Doctors can view messages from sessions assigned to them
DROP POLICY IF EXISTS "Doctors can view assigned whatsapp messages" ON whatsapp_messages;
CREATE POLICY "Doctors can view assigned whatsapp messages"
  ON whatsapp_messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM whatsapp_sessions 
      WHERE whatsapp_sessions.id = session_id 
      AND whatsapp_sessions.assigned_doctor_id = auth.uid()
    )
  );

-- ================================================
-- 4. DOCTOR_SUBSCRIPTIONS TABLE - MISSING INSERT POLICY
-- ================================================

-- Service role can insert subscriptions (for billing webhooks)
DROP POLICY IF EXISTS "Service role can insert subscriptions" ON doctor_subscriptions;
CREATE POLICY "Service role can insert subscriptions"
  ON doctor_subscriptions FOR INSERT TO service_role WITH CHECK (true);

-- Service role can update subscriptions
DROP POLICY IF EXISTS "Service role can update subscriptions" ON doctor_subscriptions;
CREATE POLICY "Service role can update subscriptions"
  ON doctor_subscriptions FOR UPDATE TO service_role USING (true);

-- ================================================
-- 5. CHAT_MESSAGE_RECEIPTS TABLE - MISSING INSERT POLICY
-- ================================================

-- Users can create receipts for their own reads
DROP POLICY IF EXISTS "Users can create message receipts" ON chat_message_receipts;
CREATE POLICY "Users can create message receipts"
  ON chat_message_receipts FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view receipts for messages they sent or received
DROP POLICY IF EXISTS "Users can view message receipts" ON chat_message_receipts;
CREATE POLICY "Users can view message receipts"
  ON chat_message_receipts FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chat_conversations cc ON cm.conversation_id = cc.id
      WHERE cm.id = message_id
      AND (cc.patient_id = auth.uid() OR cc.doctor_id = auth.uid())
    )
  );

-- ================================================
-- 6. CHAT_USER_PRESENCE TABLE - MISSING INSERT POLICY
-- ================================================

-- Users can insert their own presence
DROP POLICY IF EXISTS "Users can insert own presence" ON chat_user_presence;
CREATE POLICY "Users can insert own presence"
  ON chat_user_presence FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own presence
DROP POLICY IF EXISTS "Users can update own presence" ON chat_user_presence;
CREATE POLICY "Users can update own presence"
  ON chat_user_presence FOR UPDATE USING (user_id = auth.uid());

-- Users can view presence in their conversations
DROP POLICY IF EXISTS "Users can view conversation presence" ON chat_user_presence;
CREATE POLICY "Users can view conversation presence"
  ON chat_user_presence FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chat_conversations cc
      WHERE cc.id = conversation_id
      AND (cc.patient_id = auth.uid() OR cc.doctor_id = auth.uid())
    )
  );

-- ================================================
-- 7. FOLLOWUP_RESPONSES TABLE - MISSING INSERT POLICY
-- ================================================

-- Users can create responses for their followups
DROP POLICY IF EXISTS "Users can create followup responses" ON followup_responses;
CREATE POLICY "Users can create followup responses"
  ON followup_responses FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM followups f
      WHERE f.id = followup_id
      AND f.patient_id = auth.uid()
    )
  );

-- Users can view responses for their followups
DROP POLICY IF EXISTS "Users can view followup responses" ON followup_responses;
CREATE POLICY "Users can view followup responses"
  ON followup_responses FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM followups f
      WHERE f.id = followup_id
      AND (f.patient_id = auth.uid() OR f.doctor_id = auth.uid())
    )
  );

-- Doctors can create responses for their patient followups
DROP POLICY IF EXISTS "Doctors can create followup responses" ON followup_responses;
CREATE POLICY "Doctors can create followup responses"
  ON followup_responses FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM followups f
      WHERE f.id = followup_id
      AND f.doctor_id = auth.uid()
    )
  );

-- ================================================
-- 8. APPOINTMENT_AUDIT_LOG TABLE - INSERT POLICY
-- ================================================

-- Only system/service role can insert audit logs
DROP POLICY IF EXISTS "Service role can insert appointment audit logs" ON appointment_audit_log;
CREATE POLICY "Service role can insert appointment audit logs"
  ON appointment_audit_log FOR INSERT TO service_role WITH CHECK (true);

-- ================================================
-- 9. SECURITY_EVENTS TABLE - ENHANCED POLICIES
-- ================================================

-- Service role can update security events (for processing)
DROP POLICY IF EXISTS "Service role can update security events" ON security_events;
CREATE POLICY "Service role can update security events"
  ON security_events FOR UPDATE TO service_role USING (true);

-- ================================================
-- 10. VERIFY ALL TABLES HAVE RLS ENABLED
-- ================================================

DO $$
DECLARE
  v_table RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_table IN
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'doctors', 'specialties', 'doctor_specialties',
        'doctor_subscriptions', 'appointments', 'payments', 'prescriptions',
        'follow_up_schedules', 'availability_rules', 'availability_exceptions',
        'whatsapp_sessions', 'whatsapp_messages', 'chat_conversations',
        'chat_messages', 'chat_message_receipts', 'chat_user_presence',
        'followups', 'followup_responses', 'security_events', 'web_vitals_metrics',
        'audit_logs', 'consent_versions', 'user_consent_records',
        'guardian_consent_records', 'consent_history', 'consent_requests',
        'consent_audit_logs', 'digital_certificates', 'digital_signatures',
        'signature_audit_logs', 'nom004_compliance_results',
        'certificate_validation_cache', 'arco_requests', 'arco_request_history',
        'arco_attachments', 'arco_communications', 'data_amendments',
        'data_deletions', 'privacy_preferences', 'appointment_audit_log'
      )
  LOOP
    -- Check if RLS is enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_class 
      WHERE relname = v_table.tablename
      AND relrowsecurity = true
    ) THEN
      RAISE NOTICE 'WARNING: RLS not enabled on table %', v_table.tablename;
      v_count := v_count + 1;
    ELSE
      RAISE NOTICE 'OK: RLS enabled on table %', v_table.tablename;
    END IF;
  END LOOP;
  
  IF v_count = 0 THEN
    RAISE NOTICE 'SUCCESS: All tables have RLS enabled';
  ELSE
    RAISE NOTICE 'WARNING: % tables missing RLS', v_count;
  END IF;
END $$;

-- ================================================
-- 11. RLS VERIFICATION FUNCTION
-- ================================================

CREATE OR REPLACE FUNCTION verify_rls_coverage()
RETURNS TABLE (
  table_name TEXT,
  has_rls BOOLEAN,
  policy_count INTEGER,
  missing_insert_policy BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::TEXT,
    EXISTS (SELECT 1 FROM pg_class WHERE relname = t.tablename AND relrowsecurity = true) as has_rls,
    COALESCE((SELECT COUNT(*)::INTEGER FROM pg_policies WHERE tablename = t.tablename), 0) as policy_count,
    NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = t.tablename AND cmd = 'INSERT'
    ) as missing_insert_policy
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND t.tablename IN (
      'profiles', 'doctors', 'doctor_specialties', 'doctor_subscriptions',
      'appointments', 'payments', 'prescriptions', 'follow_up_schedules',
      'availability_rules', 'availability_exceptions', 'whatsapp_sessions',
      'whatsapp_messages', 'chat_conversations', 'chat_messages',
      'chat_message_receipts', 'chat_user_presence', 'followups',
      'followup_responses', 'security_events', 'appointment_audit_log'
    )
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION verify_rls_coverage() IS 'Verifies RLS coverage for all core tables. Returns table name, RLS status, policy count, and whether INSERT policy is missing.';

-- ================================================
-- VERIFICATION QUERIES
-- Run these to verify all policies are in place:
-- ================================================

/*
-- Check all policies
SELECT 
  tablename, policyname, permissive, roles::text, cmd, LEFT(qual::text, 60) as condition
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check RLS status for all tables
SELECT 
  tablename, relrowsecurity as rls_enabled
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'profiles', 'doctors', 'doctor_specialties',
    'appointments', 'payments', 'prescriptions'
  )
ORDER BY tablename;

-- Check for tables missing INSERT policies
SELECT 
  t.tablename,
  NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = t.tablename AND cmd = 'INSERT'
  ) as missing_insert_policy
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'profiles', 'doctors', 'appointments', 'payments',
    'whatsapp_sessions', 'chat_messages'
  );

-- Run verification function
SELECT * FROM verify_rls_coverage();
*/
