-- ================================================
-- Consent System Fixes and Audit Integration
--
-- This migration:
-- 1. Adds missing trigger functions for consent history
-- 2. Creates the unified audit_logs table
-- 3. Integrates consent system with unified audit
-- ================================================

-- ================================================
-- CREATE UNIFIED AUDIT LOGS TABLE
-- ================================================

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event classification
  category TEXT NOT NULL CHECK (category IN (
    'auth', 'data_access', 'data_modification', 'data_deletion',
    'signature', 'certificate', 'consent', 'arco', 'security',
    'system', 'compliance'
  )),
  event_type TEXT NOT NULL,

  -- When the event occurred
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Actor information
  actor JSONB NOT NULL, -- {user_id, role, user_name, type}

  -- Resource information
  resource JSONB NOT NULL, -- {type, id, name, parent}

  -- Event outcome
  outcome JSONB NOT NULL, -- {status, status_code, error_message, error_code, details}

  -- Technical details
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  request_id UUID,

  -- Additional event-specific data
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_occurred_at ON audit_logs(occurred_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs((actor->>'user_id'));
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs((resource->>'id'));

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs"
  ON audit_logs FOR SELECT
  USING ((actor->>'user_id')::uuid = auth.uid());

-- Admins can read all audit logs
CREATE POLICY "Admins can read all audit logs"
  ON audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- System/service role can insert audit logs
CREATE POLICY "Service can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE audit_logs IS 'Unified audit log table for all system events including consent';
COMMENT ON COLUMN audit_logs.category IS 'Event category: auth, data_access, data_modification, data_deletion, signature, certificate, consent, arco, security, system, compliance';
COMMENT ON COLUMN audit_logs.actor IS 'Actor information: {user_id, role, user_name, type}';
COMMENT ON COLUMN audit_logs.resource IS 'Resource information: {type, id, name, parent}';
COMMENT ON COLUMN audit_logs.outcome IS 'Event outcome: {status, status_code, error_message, error_code, details}';

-- ================================================
-- CONSENT HISTORY TRIGGER FUNCTIONS
-- ================================================

-- Function to create consent history entry on insert
CREATE OR REPLACE FUNCTION create_consent_history_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  consent_version RECORD;
BEGIN
  -- Get the consent version
  SELECT * INTO consent_version FROM consent_versions WHERE id = NEW.consent_version_id;

  -- Create history entry
  INSERT INTO consent_history (
    consent_record_id,
    user_id,
    action,
    old_status,
    new_status,
    old_consent_version_id,
    new_consent_version_id,
    changed_by,
    changed_by_role,
    change_reason,
    ip_address,
    user_agent,
    session_id,
    previous_state,
    new_state,
    created_at
  ) VALUES (
    NEW.id,
    NEW.user_id,
    'granted',
    NULL,
    NEW.status,
    NULL,
    NEW.consent_version_id,
    NEW.user_id,
    'user',
    'Consentimiento otorgado',
    NULL,
    NULL,
    NULL,
    NULL,
    jsonb_build_object(
      'status', NEW.status,
      'granted_at', NEW.granted_at,
      'delivery_method', NEW.delivery_method,
      'consent_type', consent_version.consent_type,
      'consent_version', consent_version.version
    ),
    NOW()
  );

  -- Also create unified audit log entry
  INSERT INTO audit_logs (
    category,
    event_type,
    occurred_at,
    actor,
    resource,
    outcome,
    metadata,
    created_at
  ) VALUES (
    'consent',
    'consent.granted',
    NOW(),
    jsonb_build_object(
      'user_id', NEW.user_id,
      'role', 'user',
      'user_name', NULL,
      'type', 'user'
    ),
    jsonb_build_object(
      'type', 'consent',
      'id', NEW.id,
      'name', consent_version.consent_type
    ),
    jsonb_build_object(
      'status', 'success'
    ),
    jsonb_build_object(
      'consent_type', consent_version.consent_type,
      'consent_record_id', NEW.id,
      'after_state', jsonb_build_object(
        'status', NEW.status,
        'granted_at', NEW.granted_at,
        'delivery_method', NEW.delivery_method,
        'consent_type', consent_version.consent_type,
        'consent_version_id', NEW.consent_version_id
      )
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create consent history entry on update
CREATE OR REPLACE FUNCTION create_consent_history_on_update()
RETURNS TRIGGER AS $$
DECLARE
  consent_version RECORD;
  old_consent_version RECORD;
BEGIN
  -- Get the consent version
  SELECT * INTO consent_version FROM consent_versions WHERE id = NEW.consent_version_id;
  SELECT * INTO old_consent_version FROM consent_versions WHERE id = OLD.consent_version_id;

  -- Only create history if status changed or version changed
  IF (OLD.status != NEW.status) OR (OLD.consent_version_id != NEW.consent_version_id) THEN
    INSERT INTO consent_history (
      consent_record_id,
      user_id,
      action,
      old_status,
      new_status,
      old_consent_version_id,
      new_consent_version_id,
      changed_by,
      changed_by_role,
      change_reason,
      ip_address,
      user_agent,
      session_id,
      previous_state,
      new_state,
      created_at
    ) VALUES (
      NEW.id,
      NEW.user_id,
      CASE
        WHEN NEW.status = 'withdrawn' THEN 'withdrawn'
        WHEN NEW.status = 'expired' THEN 'expired'
        ELSE 'modified'
      END,
      OLD.status,
      NEW.status,
      OLD.consent_version_id,
      NEW.consent_version_id,
      NEW.user_id,
      'user',
      CASE
        WHEN NEW.status = 'withdrawn' THEN COALESCE(NEW.withdrawal_reason, 'Usuario retiró consentimiento')
        WHEN NEW.status = 'expired' THEN 'Consentimiento expirado'
        ELSE 'Consentimiento modificado'
      END,
      NULL,
      NULL,
      NULL,
      jsonb_build_object(
        'status', OLD.status,
        'consent_version_id', OLD.consent_version_id,
        'version', old_consent_version.version
      ),
      jsonb_build_object(
        'status', NEW.status,
        'consent_version_id', NEW.consent_version_id,
        'version', consent_version.version,
        'updated_at', NEW.updated_at
      ),
      NOW()
    );

    -- Also create unified audit log entry
    INSERT INTO audit_logs (
      category,
      event_type,
      occurred_at,
      actor,
      resource,
      outcome,
      metadata,
      created_at
    ) VALUES (
      'consent',
      CASE
        WHEN NEW.status = 'withdrawn' THEN 'consent.withdrawn'
        WHEN NEW.status = 'expired' THEN 'consent.updated'
        ELSE 'consent.updated'
      END,
      NOW(),
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', 'user',
        'user_name', NULL,
        'type', 'user'
      ),
      jsonb_build_object(
        'type', 'consent',
        'id', NEW.id,
        'name', consent_version.consent_type
      ),
      jsonb_build_object(
        'status', 'success'
      ),
      jsonb_build_object(
        'consent_type', consent_version.consent_type,
        'consent_record_id', NEW.id,
        'before_state', jsonb_build_object(
          'status', OLD.status,
          'consent_version_id', OLD.consent_version_id
        ),
        'after_state', jsonb_build_object(
          'status', NEW.status,
          'consent_version_id', NEW.consent_version_id
        )
      ),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- UPDATE EXISTING TRIGGERS
-- ================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_consent_history_insert ON user_consent_records;
DROP TRIGGER IF EXISTS trigger_consent_history_update ON user_consent_records;

-- Create new triggers with the fixed functions
CREATE TRIGGER trigger_consent_history_insert
  AFTER INSERT ON user_consent_records
  FOR EACH ROW
  EXECUTE FUNCTION create_consent_history_on_insert();

CREATE TRIGGER trigger_consent_history_update
  AFTER UPDATE ON user_consent_records
  FOR EACH ROW
  EXECUTE FUNCTION create_consent_history_on_update();

-- ================================================
-- CONSENT COMPLIANCE FUNCTIONS
-- ================================================

-- Function to check if consent history needs cleanup (5-year retention)
CREATE OR REPLACE FUNCTION cleanup_old_consent_history()
RETURNS void AS $$
BEGIN
  -- Delete consent history entries older than 5 years
  -- This implements LFPDPPP 5-year retention requirement
  DELETE FROM consent_history
  WHERE created_at < NOW() - INTERVAL '5 years';
END;
$$ LANGUAGE plpgsql;

-- Function to get consent compliance status for a user
CREATE OR REPLACE FUNCTION get_user_consent_compliance_status(user_id_param UUID)
RETURNS TABLE(
  consent_type TEXT,
  has_consent BOOLEAN,
  consent_version TEXT,
  granted_at TIMESTAMPTZ,
  is_valid BOOLEAN,
  needs_update BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cv.consent_type::text,
    COALESCE(ucr.id IS NOT NULL, FALSE) as has_consent,
    cv.version::text,
    ucr.granted_at,
    COALESCE(
      (ucr.status = 'granted') AND
      (ucr.expires_at IS NULL OR ucr.expires_at > NOW()),
      FALSE
    ) as is_valid,
    COALESCE(
      (ucr.id IS NULL) OR
      (ucr.consent_version_id != cv.id) OR
      (ucr.status != 'granted'),
      FALSE
    ) as needs_update
  FROM consent_versions cv
  LEFT JOIN user_consent_records ucr ON ucr.consent_version_id = cv.id
    AND ucr.user_id = user_id_param
    AND ucr.status = 'granted'
  WHERE cv.deprecated_date IS NULL
    AND cv.effective_date <= NOW()
  ORDER BY cv.consent_type;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- VIEWS FOR COMPLIANCE REPORTING
-- ================================================

-- Create view for consent compliance summary
CREATE OR REPLACE VIEW consent_compliance_summary AS
SELECT
  p.id as user_id,
  COUNT(DISTINCT ucr.id) as total_consents,
  COUNT(DISTINCT ucr.id) FILTER (
    WHERE ucr.status = 'granted'
    AND (ucr.expires_at IS NULL OR ucr.expires_at > NOW())
  ) as active_consents,
  COUNT(DISTINCT ucr.id) FILTER (WHERE ucr.status = 'withdrawn') as withdrawn_consents,
  COUNT(DISTINCT ucr.id) FILTER (WHERE ucr.status = 'expired') as expired_consents,
  MAX(ucr.granted_at) as last_consent_update,
  COUNT(DISTINCT cr.id) FILTER (
    WHERE cr.status IN ('pending', 'delivered', 'viewed')
    AND cr.expires_at > NOW()
  ) as pending_requests
FROM profiles p
LEFT JOIN user_consent_records ucr ON ucr.user_id = p.id
LEFT JOIN consent_requests cr ON cr.user_id = p.id
GROUP BY p.id;

COMMENT ON VIEW consent_compliance_summary IS 'Summary view for user consent compliance status';

-- ================================================
-- END OF MIGRATION
-- ================================================
