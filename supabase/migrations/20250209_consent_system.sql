-- ================================================
-- Patient Consent Management System Migration
-- Implements comprehensive consent management for LFPDPPP compliance
-- Sistema de Gestión de Consentimiento de Pacientes
--
-- Features:
-- - Dynamic consent (ability to withdraw)
-- - Consent history tracking
-- - Consent versioning
-- - Age-specific consent (minors need guardian)
-- - Consent audit trail
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================
-- ENUMS
-- ================================================

-- Consent types
CREATE TYPE consent_type AS ENUM (
  'medical_treatment',     -- Consent for medical treatment
  'data_processing',       -- Consent for processing personal data
  'telemedicine',          -- Consent for telemedicine services
  'recording',             -- Consent for recording consultations
  'ai_analysis',           -- Consent for AI consultation analysis
  'data_sharing',          -- Consent for sharing with third parties
  'research',              -- Consent for research purposes
  'marketing',             -- Consent for marketing communications
  'emergency_contact',     -- Consent to contact emergency services
  'prescription_forwarding' -- Consent to forward prescriptions to pharmacies
);

-- Consent status
CREATE TYPE consent_status AS ENUM (
  'granted',     -- Consent is active
  'withdrawn',   -- Consent withdrawn by user
  'expired',     -- Consent has expired
  'revoked'      -- Consent revoked by admin
);

-- Consent delivery methods
CREATE TYPE consent_delivery_method AS ENUM (
  'electronic_signature', -- Signed electronically
  'click_wrap',           -- Clicked "I agree"
  'browse_wrap',          -- Implied by use
  'paper_form',           -- Physical paper form
  'verbal',               -- Verbal consent (recorded)
  'implied'               -- Implied consent
);

-- Consent category
CREATE TYPE consent_category AS ENUM (
  'essential',    -- Required for service delivery
  'functional',   -- Required for specific functionality
  'analytical',   -- For analytics and improvement
  'marketing',    -- For marketing purposes
  'legal'         -- Required by law
);

-- Age verification status
CREATE TYPE age_verification_status AS ENUM (
  'verified_adult',      -- User is verified adult
  'verified_minor',      -- User is verified minor
  'unverified',          -- Age not verified
  'guardian_required'    -- Guardian consent required
);

-- Guardian relationship types
CREATE TYPE guardian_relationship AS ENUM (
  'parent',
  'legal_guardian',
  'foster_parent',
  'grandparent',
  'other'
);

-- Consent request status
CREATE TYPE consent_request_status AS ENUM (
  'pending',      -- Request created, awaiting response
  'delivered',    -- Request delivered to user
  'viewed',       -- User viewed the request
  'granted',      -- User granted consent
  'declined',     -- User declined consent
  'expired'       -- Request expired
);

-- Consent history action types
CREATE TYPE consent_history_action AS ENUM (
  'granted',
  'withdrawn',
  'modified',
  'expired',
  'revoked'
);

-- Consent audit event types
CREATE TYPE consent_audit_event_type AS ENUM (
  'consent_granted',
  'consent_withdrawn',
  'consent_expired',
  'consent_revoked',
  'consent_modified',
  'consent_requested',
  'consent_viewed',
  'consent_declined',
  'version_updated',
  'guardian_consent_added',
  'guardian_consent_removed',
  'bulk_consent_operation',
  'consent_export',
  'consent_import'
);

-- ================================================
-- CORE TABLES
-- ================================================

-- Consent Versions table
-- Stores different versions of consent documents
CREATE TABLE consent_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_type consent_type NOT NULL,
  version TEXT NOT NULL, -- Semantic version (e.g., "1.0.0")

  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  legal_text TEXT NOT NULL,
  privacy_policy_reference TEXT NOT NULL DEFAULT '',
  terms_of_service_reference TEXT NOT NULL DEFAULT '',

  -- Version control
  effective_date TIMESTAMPTZ NOT NULL,
  deprecated_date TIMESTAMPTZ,

  -- Requirements
  required_for_new_users BOOLEAN NOT NULL DEFAULT true,
  requires_re_consent BOOLEAN NOT NULL DEFAULT false,

  -- Classification
  category consent_category NOT NULL,

  -- Data handling
  data_retention_period TEXT, -- e.g., "5 years", "90 days", "until withdrawal"

  -- Third-party sharing
  third_party_sharing TEXT[], -- List of third parties data may be shared with

  -- Age restrictions
  age_restriction JSONB, -- { min_age: 18, requires_guardian: true, guardian_consent_required: true }

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  UNIQUE(consent_type, version)
);

-- User Consent Records table
-- Tracks consent granted by users
CREATE TABLE user_consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type consent_type NOT NULL,
  consent_version_id UUID NOT NULL REFERENCES consent_versions(id),
  status consent_status NOT NULL DEFAULT 'granted',

  -- Consent details
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_from TEXT, -- IP address, device ID, etc.
  delivery_method consent_delivery_method NOT NULL DEFAULT 'click_wrap',

  -- Age verification
  age_verification age_verification_status NOT NULL DEFAULT 'unverified',
  date_of_birth DATE,

  -- Guardian information (for minors)
  guardian_consent_record_id UUID REFERENCES guardian_consent_records(id),
  guardian_relationship guardian_relationship,
  guardian_name TEXT,
  guardian_contact TEXT,

  -- Withdrawal/revocation
  withdrawn_at TIMESTAMPTZ,
  withdrawn_by TEXT, -- 'user' | 'guardian' | 'admin'
  withdrawal_reason TEXT,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Guardian Consent Records table
-- For minors or incapacitated adults who need guardian consent
CREATE TABLE guardian_consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- The minor/incapacitated person
  guardian_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- If guardian has their own account
  guardian_name TEXT NOT NULL,
  guardian_relationship guardian_relationship NOT NULL,
  guardian_contact TEXT NOT NULL,
  guardian_identification TEXT, -- Official ID verification

  -- Verification
  verification_method TEXT NOT NULL, -- 'in_person', 'video_call', 'document_upload'
  verified_by UUID REFERENCES profiles(id), -- Staff member who verified
  verified_at TIMESTAMPTZ,
  verification_documents TEXT[], -- URLs to uploaded documents

  -- Consent scope
  consent_scope consent_type[] NOT NULL DEFAULT ARRAY[]::consent_type[], -- What consents the guardian can grant
  limitations TEXT[], -- Any limitations on guardian's authority

  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'inactive' | 'revoked' | 'expired'
  effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiration_date TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Consent History table
-- Tracks all changes to consent records for audit purposes
CREATE TABLE consent_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_record_id UUID NOT NULL REFERENCES user_consent_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Change details
  action consent_history_action NOT NULL,
  old_status consent_status,
  new_status consent_status NOT NULL,

  -- Version tracking
  old_consent_version_id UUID REFERENCES consent_versions(id),
  new_consent_version_id UUID REFERENCES consent_versions(id),

  -- Context
  changed_by UUID NOT NULL REFERENCES profiles(id),
  changed_by_role TEXT NOT NULL, -- 'user' | 'guardian' | 'admin' | 'system'
  change_reason TEXT,

  -- Technical details
  ip_address INET,
  user_agent TEXT,
  session_id UUID,

  -- Snapshot
  previous_state JSONB,
  new_state JSONB NOT NULL,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Consent Requests table
-- Pending consent requests for users
CREATE TABLE consent_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type consent_type NOT NULL,
  required_version_id UUID NOT NULL REFERENCES consent_versions(id),

  -- Request details
  request_reason TEXT NOT NULL, -- 'new_consent' | 'version_update' | 're_consent_required' | 'age_verification'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low' | 'normal' | 'high' | 'urgent'
  requested_for consent_type[] NOT NULL DEFAULT ARRAY[]::consent_type[],

  -- Delivery
  delivery_method TEXT NOT NULL DEFAULT 'in_app', -- 'in_app' | 'email' | 'sms' | 'push_notification'
  sent_at TIMESTAMPTZ,
  reminder_count INTEGER NOT NULL DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,

  -- Status
  status consent_request_status NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  response JSONB,

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Consent Audit Logs table
-- Comprehensive audit trail for all consent-related events
CREATE TABLE consent_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type consent_audit_event_type NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Event details
  consent_type consent_type,
  consent_record_id UUID REFERENCES user_consent_records(id) ON DELETE SET NULL,
  consent_request_id UUID REFERENCES consent_requests(id) ON DELETE SET NULL,

  -- Action details
  action TEXT NOT NULL,
  action_result TEXT NOT NULL, -- 'success' | 'failure' | 'partial'
  error_message TEXT,

  -- Actor information
  actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL,
  actor_ip_address INET,
  actor_user_agent TEXT,

  -- Context
  session_id UUID,
  request_id UUID,
  correlation_id TEXT,

  -- Data snapshot
  before_state JSONB,
  after_state JSONB,
  data_changes JSONB, -- { field_name: { old: value, new: value } }

  -- Timestamps
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================

-- Consent Versions indexes
CREATE INDEX idx_consent_versions_type ON consent_versions(consent_type);
CREATE INDEX idx_consent_versions_effective_date ON consent_versions(effective_date);
CREATE INDEX idx_consent_versions_deprecated_date ON consent_versions(deprecated_date);
CREATE INDEX idx_consent_versions_active ON consent_versions(deprecated_date) WHERE deprecated_date IS NULL;

-- User Consent Records indexes
CREATE INDEX idx_user_consent_user_id ON user_consent_records(user_id);
CREATE INDEX idx_user_consent_type ON user_consent_records(consent_type);
CREATE INDEX idx_user_consent_status ON user_consent_records(status);
CREATE INDEX idx_user_consent_version_id ON user_consent_records(consent_version_id);
CREATE INDEX idx_user_consent_expires_at ON user_consent_records(expires_at);
CREATE INDEX idx_user_consent_granted_at ON user_consent_records(granted_at);

-- Guardian Consent Records indexes
CREATE INDEX idx_guardian_consent_user_id ON guardian_consent_records(user_id);
CREATE INDEX idx_guardian_consent_guardian_user_id ON guardian_consent_records(guardian_user_id);
CREATE INDEX idx_guardian_consent_status ON guardian_consent_records(status);

-- Consent History indexes
CREATE INDEX idx_consent_history_record_id ON consent_history(consent_record_id);
CREATE INDEX idx_consent_history_user_id ON consent_history(user_id);
CREATE INDEX idx_consent_history_action ON consent_history(action);
CREATE INDEX idx_consent_history_created_at ON consent_history(created_at);

-- Consent Requests indexes
CREATE INDEX idx_consent_requests_user_id ON consent_requests(user_id);
CREATE INDEX idx_consent_requests_status ON consent_requests(status);
CREATE INDEX idx_consent_requests_type ON consent_requests(consent_type);
CREATE INDEX idx_consent_requests_expires_at ON consent_requests(expires_at);
CREATE INDEX idx_consent_requests_created_at ON consent_requests(created_at);

-- Consent Audit Logs indexes
CREATE INDEX idx_consent_audit_user_id ON consent_audit_logs(user_id);
CREATE INDEX idx_consent_audit_event_type ON consent_audit_logs(event_type);
CREATE INDEX idx_consent_audit_occurred_at ON consent_audit_logs(occurred_at);
CREATE INDEX idx_consent_audit_correlation_id ON consent_audit_logs(correlation_id);
CREATE INDEX idx_consent_audit_consent_type ON consent_audit_logs(consent_type);

-- Composite indexes for common queries
CREATE INDEX idx_user_consent_user_type_status ON user_consent_records(user_id, consent_type, status);
CREATE INDEX idx_consent_history_user_action_date ON consent_history(user_id, action, created_at);

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if consent is expired
CREATE OR REPLACE FUNCTION is_consent_expired(consent_record_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  expires_at TIMESTAMPTZ;
BEGIN
  SELECT expires_at INTO expires_at
  FROM user_consent_records
  WHERE id = consent_record_id;

  IF expires_at IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active consents
CREATE OR REPLACE FUNCTION get_user_active_consents(user_id_param UUID)
RETURNS TABLE(
  consent_type consent_type,
  version TEXT,
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ucr.consent_type,
    cv.version,
    ucr.granted_at,
    ucr.expires_at
  FROM user_consent_records ucr
  JOIN consent_versions cv ON ucr.consent_version_id = cv.id
  WHERE ucr.user_id = user_id_param
    AND ucr.status = 'granted'
    AND (ucr.expires_at IS NULL OR ucr.expires_at > NOW())
  ORDER BY ucr.granted_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user needs to re-consent
CREATE OR REPLACE FUNCTION needs_re_consent(user_id_param UUID, consent_type_param consent_type)
RETURNS BOOLEAN AS $$
DECLARE
  latest_version_id UUID;
  user_version_id UUID;
  requires_re_consent BOOLEAN;
BEGIN
  -- Get latest version for this consent type
  SELECT id INTO latest_version_id
  FROM consent_versions
  WHERE consent_type = consent_type_param
    AND effective_date <= NOW()
    AND (deprecated_date IS NULL OR deprecated_date > NOW())
  ORDER BY effective_date DESC, created_at DESC
  LIMIT 1;

  -- If no version exists, no need to re-consent
  IF latest_version_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get user's current consent version
  SELECT consent_version_id INTO user_version_id
  FROM user_consent_records
  WHERE user_id = user_id_param
    AND consent_type = consent_type_param
    AND status = 'granted'
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY granted_at DESC
  LIMIT 1;

  -- If no consent exists, need to consent (not re-consent)
  IF user_version_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if versions match
  IF user_version_id = latest_version_id THEN
    RETURN FALSE;
  END IF;

  -- Check if re-consent is required
  SELECT requires_re_consent INTO requires_re_consent
  FROM consent_versions
  WHERE id = latest_version_id;

  RETURN COALESCE(requires_re_consent, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to automatically expire consents
CREATE OR REPLACE FUNCTION expire_old_consents()
RETURNS void AS $$
BEGIN
  UPDATE user_consent_records
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'granted'
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS
-- ================================================

-- Auto-update updated_at on consent versions
CREATE TRIGGER trigger_update_consent_versions_updated_at
  BEFORE UPDATE ON consent_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_updated_at();

-- Auto-update updated_at on user consent records
CREATE TRIGGER trigger_update_user_consent_updated_at
  BEFORE UPDATE ON user_consent_records
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_updated_at();

-- Auto-update updated_at on guardian consent records
CREATE TRIGGER trigger_update_guardian_consent_updated_at
  BEFORE UPDATE ON guardian_consent_records
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_updated_at();

-- Create history entry when consent record is created
CREATE TRIGGER trigger_consent_history_insert
  AFTER INSERT ON user_consent_records
  FOR EACH ROW
  EXECUTE FUNCTION create_consent_history_on_insert();

-- Create history entry when consent record is updated
CREATE TRIGGER trigger_consent_history_update
  AFTER UPDATE ON user_consent_records
  FOR EACH ROW
  EXECUTE FUNCTION create_consent_history_on_update();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

-- Enable RLS on all consent tables
ALTER TABLE consent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_audit_logs ENABLE ROW LEVEL SECURITY;

-- Consent Versions RLS
-- Everyone can read active versions
CREATE POLICY "Anyone can read active consent versions"
  ON consent_versions FOR SELECT
  USING (deprecated_date IS NULL AND effective_date <= NOW());

-- Admins can manage consent versions
CREATE POLICY "Admins can manage consent versions"
  ON consent_versions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- User Consent Records RLS
-- Users can read their own consent records
CREATE POLICY "Users can read own consent records"
  ON user_consent_records FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own consent records
CREATE POLICY "Users can insert own consent records"
  ON user_consent_records FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own consent records (for withdrawal)
CREATE POLICY "Users can update own consent records"
  ON user_consent_records FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can manage all consent records
CREATE POLICY "Admins can manage all consent records"
  ON user_consent_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Guardian Consent Records RLS
-- Users can read their own guardian records
CREATE POLICY "Users can read own guardian records"
  ON guardian_consent_records FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage all guardian records
CREATE POLICY "Admins can manage all guardian records"
  ON guardian_consent_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Consent History RLS
-- Users can read history for their own consents
CREATE POLICY "Users can read own consent history"
  ON consent_history FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all consent history
CREATE POLICY "Admins can read all consent history"
  ON consent_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Consent Requests RLS
-- Users can read their own consent requests
CREATE POLICY "Users can read own consent requests"
  ON consent_requests FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own consent requests
CREATE POLICY "Users can update own consent requests"
  ON consent_requests FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can manage all consent requests
CREATE POLICY "Admins can manage all consent requests"
  ON consent_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Consent Audit Logs RLS
-- Users can read their own audit logs
CREATE POLICY "Users can read own consent audit logs"
  ON consent_audit_logs FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all audit logs
CREATE POLICY "Admins can read all consent audit logs"
  ON consent_audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Only system can insert audit logs
CREATE POLICY "System can insert consent audit logs"
  ON consent_audit_logs FOR INSERT
  WITH CHECK (true);

-- ================================================
-- VIEWS
-- ================================================

-- User Consent Summary View
CREATE OR REPLACE VIEW user_consent_summary AS
SELECT
  u.id as user_id,
  COUNT(ucr.id) as total_consents,
  COUNT(ucr.id) FILTER (WHERE ucr.status = 'granted' AND (ucr.expires_at IS NULL OR ucr.expires_at > NOW())) as active_consents,
  COUNT(ucr.id) FILTER (WHERE ucr.status = 'withdrawn') as withdrawn_consents,
  COUNT(ucr.id) FILTER (WHERE ucr.status = 'expired' OR (ucr.expires_at IS NOT NULL AND ucr.expires_at <= NOW())) as expired_consents,
  COUNT(cr.id) FILTER (WHERE cr.status IN ('pending', 'delivered', 'viewed')) as pending_consents
FROM profiles u
LEFT JOIN user_consent_records ucr ON u.id = ucr.user_id
LEFT JOIN consent_requests cr ON u.id = cr.user_id
GROUP BY u.id;

-- Active Consent Versions View
CREATE OR REPLACE VIEW active_consent_versions AS
SELECT
  cv.id,
  cv.consent_type,
  cv.version,
  cv.title,
  cv.description,
  cv.category,
  cv.effective_date,
  cv.required_for_new_users,
  cv.requires_re_consent,
  COUNT(ucr.id) as users_with_consent,
  COUNT(ucr.id) FILTER (WHERE ucr.status = 'granted' AND (ucr.expires_at IS NULL OR ucr.expires_at > NOW())) as active_users
FROM consent_versions cv
LEFT JOIN user_consent_records ucr ON cv.id = ucr.consent_version_id
WHERE cv.deprecated_date IS NULL
  AND cv.effective_date <= NOW()
GROUP BY cv.id
ORDER BY cv.consent_type, cv.effective_date DESC;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE consent_versions IS 'Versiones de documentos de consentimiento con control de versiones semántico';
COMMENT ON TABLE user_consent_records IS 'Registros de consentimiento otorgados por usuarios';
COMMENT ON TABLE guardian_consent_records IS 'Registros de consentimiento de tutores para menores o adultos incapacitados';
COMMENT ON TABLE consent_history IS 'Historial de cambios en registros de consentimiento para auditoría';
COMMENT ON TABLE consent_requests IS 'Solicitudes de consentimiento pendientes para usuarios';
COMMENT ON TABLE consent_audit_logs IS 'Registro completo de auditoría para eventos relacionados con consentimiento';

COMMENT ON COLUMN user_consent_records.age_verification IS 'Estado de verificación de edad - determina si se requiere consentimiento de tutor';
COMMENT ON COLUMN user_consent_records.guardian_consent_record_id IS 'Referencia al registro de consentimiento del tutor (para menores)';
COMMENT ON COLUMN consent_versions.requires_re_consent IS 'Si es verdadero, los usuarios deben otorgar nuevo consentimiento para esta versión';
COMMENT ON COLUMN consent_versions.data_retention_period IS 'Período de retención de datos (ej: "5 años", "90 días")';

-- ================================================
-- INITIAL DATA
-- ================================================

-- Insert initial consent versions
INSERT INTO consent_versions (consent_type, version, title, description, legal_text, category, effective_date, required_for_new_users, created_by) VALUES
  ('medical_treatment', '1.0.0', 'Consentimiento para Tratamiento Médico',
   'Autorizo al personal médico de Doctor.mx para proporcionar servicios de tratamiento médico de acuerdo con mis necesidades de salud.',
   'Por medio de la presente, autorizo a los profesionales de la salud licenciados de Doctor.mx a proporcionar servicios médicos, incluyendo diagnóstico, tratamiento y procedimientos médicos necesarios.',
   'essential', NOW(), true, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),

  ('data_processing', '1.0.0', 'Consentimiento de Procesamiento de Datos',
   'Entiendo y acepto que mis datos personales serán procesados de acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).',
   'Doctor.mx procesará sus datos personales de conformidad con la LFPDPPP. Sus datos serán utilizados para proporcionar servicios médicos, mejorar la calidad del servicio y cumplir con obligaciones legales.',
   'legal', NOW(), true, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),

  ('telemedicine', '1.0.0', 'Consentimiento de Telemedicina',
   'Acepto recibir servicios médicos a través de telemedicina, entiendo sus riesgos y beneficios.',
   'Por medio de la presente, consiento recibir servicios médicos a través de plataformas de telemedicina. Entiendo que la telemedicina tiene limitaciones y que en caso de emergencia debo contactar los servicios de emergencia.',
   'functional', NOW(), true, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),

  ('emergency_contact', '1.0.0', 'Consentimiento de Contacto de Emergencia',
   'Autorizo a Doctor.mx a contactar servicios de emergencia si es necesario durante mi consulta.',
   'En caso de que el profesional médico determine que existe un riesgo inminente para mi salud o vida, autorizo a Doctor.mx a contactar los servicios de emergencia correspondientes.',
   'essential', NOW(), true, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))

ON CONFLICT (consent_type, version) DO NOTHING;

-- ================================================
-- END OF MIGRATION
-- ================================================
