-- ============================================================================
-- SECURITY AUDIT SCHEMA
-- DoctorMX Comprehensive Audit Logging System
-- ============================================================================

-- ============================================================================
-- MAIN AUDIT TABLES
-- ============================================================================

-- Audit log for all data modifications
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  request_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Security events audit
CREATE TABLE IF NOT EXISTS security_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Feature flag audit
CREATE TABLE IF NOT EXISTS feature_flag_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('checked', 'enabled', 'disabled', 'rollout_updated')),
  context_hash TEXT NOT NULL,
  result BOOLEAN NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Authentication audit
CREATE TABLE IF NOT EXISTS auth_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'login', 'logout', 'login_failed', 'password_change', 
    'password_reset_requested', 'password_reset_completed',
    'mfa_enabled', 'mfa_disabled', 'mfa_challenge',
    'session_created', 'session_revoked', 'suspicious_activity'
  )),
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  location_info JSONB,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data access audit (HIPAA compliance)
CREATE TABLE IF NOT EXISTS data_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  access_type TEXT NOT NULL CHECK (access_type IN ('read', 'write', 'delete', 'export')),
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  query_params JSONB,
  rows_accessed INTEGER,
  justification TEXT
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by, performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(performed_at DESC);

-- Security audit indexes
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON security_audit(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_severity ON security_audit(severity, created_at DESC) WHERE severity IN ('high', 'critical');
CREATE INDEX IF NOT EXISTS idx_security_audit_unacknowledged ON security_audit(created_at) WHERE acknowledged_at IS NULL;

-- Feature flag audit indexes
CREATE INDEX IF NOT EXISTS idx_feature_flag_audit_flag_key ON feature_flag_audit(flag_key, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flag_audit_user ON feature_flag_audit(user_id, timestamp DESC);

-- Auth audit indexes
CREATE INDEX IF NOT EXISTS idx_auth_audit_user ON auth_audit(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_event_type ON auth_audit(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_ip_address ON auth_audit(ip_address) WHERE ip_address IS NOT NULL;

-- Data access audit indexes
CREATE INDEX IF NOT EXISTS idx_data_access_audit_user ON data_access_audit(user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_access_audit_table ON data_access_audit(table_name, accessed_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_audit ENABLE ROW LEVEL SECURITY;

-- Service role policies (full access)
CREATE POLICY "Service role full access to audit_logs" ON audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access to security_audit" ON security_audit FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access to feature_flag_audit" ON feature_flag_audit FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access to auth_audit" ON auth_audit FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access to data_access_audit" ON data_access_audit FOR ALL TO service_role USING (true) WITH CHECK (true);

-- User self-access policies
CREATE POLICY "Users can view audit logs for their records" ON audit_logs FOR SELECT USING (performed_by = auth.uid());
CREATE POLICY "Users can view their own security events" ON security_audit FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view their own auth events" ON auth_audit FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view their own data access" ON data_access_audit FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Auto-audit function for table changes
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields TEXT[];
  old_data JSONB;
  new_data JSONB;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    SELECT ARRAY_AGG(key) INTO changed_fields
    FROM jsonb_each(old_data) AS old_row
    JOIN jsonb_each(new_data) AS new_row USING (key)
    WHERE old_row.value IS DISTINCT FROM new_row.value;
  END IF;

  INSERT INTO audit_logs (
    table_name, record_id, action, old_data, new_data, 
    changed_fields, performed_by, performed_at
  ) VALUES (
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    changed_fields, auth.uid(), NOW()
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security event logging function
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT, p_severity TEXT, p_description TEXT, p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE event_id UUID;
BEGIN
  INSERT INTO security_audit (event_type, severity, user_id, description, details, created_at)
  VALUES (p_event_type, p_severity, auth.uid(), p_description, p_details, NOW())
  RETURNING id INTO event_id;
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth event logging function
CREATE OR REPLACE FUNCTION log_auth_event(
  p_user_id UUID, p_event_type TEXT, p_success BOOLEAN,
  p_failure_reason TEXT DEFAULT NULL, p_ip_address INET DEFAULT NULL, p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE event_id UUID;
BEGIN
  INSERT INTO auth_audit (user_id, event_type, success, failure_reason, ip_address, user_agent, created_at)
  VALUES (p_user_id, p_event_type, p_success, p_failure_reason, p_ip_address, p_user_agent, NOW())
  RETURNING id INTO event_id;
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUDIT TRIGGERS FOR SENSITIVE TABLES
-- ============================================================================

-- Users table
DROP TRIGGER IF EXISTS audit_users ON auth.users;
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- User profiles
DROP TRIGGER IF EXISTS audit_user_profiles ON user_profiles;
CREATE TRIGGER audit_user_profiles AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Doctors
DROP TRIGGER IF EXISTS audit_doctors ON doctors;
CREATE TRIGGER audit_doctors AFTER INSERT OR UPDATE OR DELETE ON doctors
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Appointments
DROP TRIGGER IF EXISTS audit_appointments ON appointments;
CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Medical records
DROP TRIGGER IF EXISTS audit_medical_records ON medical_records;
CREATE TRIGGER audit_medical_records AFTER INSERT OR UPDATE OR DELETE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Prescriptions
DROP TRIGGER IF EXISTS audit_prescriptions ON prescriptions;
CREATE TRIGGER audit_prescriptions AFTER INSERT OR UPDATE OR DELETE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Payments
DROP TRIGGER IF EXISTS audit_payments ON payments;
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- ANALYSIS VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW recent_security_events AS
SELECT sa.*, u.email as user_email
FROM security_audit sa
LEFT JOIN auth.users u ON sa.user_id = u.id
WHERE sa.created_at > NOW() - INTERVAL '24 hours'
ORDER BY sa.created_at DESC;

CREATE OR REPLACE VIEW failed_login_attempts AS
SELECT aa.*, u.email as user_email
FROM auth_audit aa
LEFT JOIN auth.users u ON aa.user_id = u.id
WHERE aa.event_type = 'login_failed' AND aa.created_at > NOW() - INTERVAL '24 hours'
ORDER BY aa.created_at DESC;

CREATE OR REPLACE VIEW data_modification_summary AS
SELECT table_name, action, COUNT(*) as count, DATE_TRUNC('hour', performed_at) as hour
FROM audit_logs
WHERE performed_at > NOW() - INTERVAL '24 hours'
GROUP BY table_name, action, DATE_TRUNC('hour', performed_at)
ORDER BY hour DESC, table_name, action;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail of all data modifications';
COMMENT ON TABLE security_audit IS 'Security-related events and policy violations';
COMMENT ON TABLE feature_flag_audit IS 'Feature flag access and change audit trail';
COMMENT ON TABLE auth_audit IS 'Authentication and authorization event logging';
COMMENT ON TABLE data_access_audit IS 'Data access tracking for compliance';
