-- ================================================
-- Digital Signature System Migration
-- Implements NOM-004-SSA3-2012 compliant digital signatures for medical records
-- Sistema de Firma Digital - Cumplimiento NOM-004-SSA3-2012
--
-- Features:
-- - Certificate storage and validation
-- - Digital signature creation and verification
-- - SAT e.firma integration support
-- - Audit trail for all signature operations
-- - Timestamp authority integration
-- - NOM-004 compliance tracking
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUMS
-- ================================================

-- Certificate types
CREATE TYPE certificate_type AS ENUM (
  'e_firma',      -- SAT e.firma (Firma Electrónica Avanzada)
  'commercial',   -- Commercial certificate authority
  'internal'      -- Internal/testing certificate
);

-- Certificate status
CREATE TYPE certificate_status AS ENUM (
  'active',       -- Certificate is valid and active
  'revoked',      -- Certificate has been revoked
  'expired',      -- Certificate has passed expiration date
  'pending'       -- Certificate validation is pending
);

-- Signature formats
CREATE TYPE signature_format AS ENUM (
  'CADES_B',      -- CMS Advanced Electronic Signature - Basic
  'CADES_T',      -- CMS Advanced Electronic Signature - Timestamped
  'XADES',        -- XML Advanced Electronic Signature
  'PADES'         -- PDF Advanced Electronic Signature
);

-- Document types that can be signed
CREATE TYPE signature_document_type AS ENUM (
  'soap_consultation',    -- SOAP consultation note
  'prescription',         -- Medical prescription
  'medical_certificate',  -- Medical certificate (sick leave, etc.)
  'medical_order',        -- Medical order
  'clinical_note'         -- Clinical note
);

-- Signature verification status
CREATE TYPE verification_status AS ENUM (
  'pending',      -- Verification pending
  'valid',        -- Signature is valid
  'invalid',      -- Signature is invalid
  'tampered',     -- Document has been tampered with
  'revoked',      -- Certificate has been revoked
  'expired'       -- Certificate has expired
);

-- Audit event types for signature operations
CREATE TYPE signature_audit_event_type AS ENUM (
  'create',                 -- Document created
  'sign',                   -- Document signed
  'verify',                 -- Signature verified
  'amend',                  -- Document amended
  'access',                 -- Document accessed
  'certificate_upload',     -- Certificate uploaded
  'certificate_validate',   -- Certificate validated
  'certificate_expire',     -- Certificate expired
  'certificate_revoke',     -- Certificate revoked
  'compliance_check',       -- Compliance check
  'compliance_fail',        -- Compliance failed
  'compliance_pass'         -- Compliance passed
);

-- NOM-004 compliance status
CREATE TYPE nom004_compliance_status AS ENUM (
  'compliant',            -- Fully compliant
  'mostly_compliant',     -- Mostly compliant with minor issues
  'partially_compliant',  -- Partially compliant with significant issues
  'non_compliant'         -- Not compliant
);

-- Revocation status
CREATE TYPE revocation_status AS ENUM (
  'good',         -- Certificate is not revoked
  'revoked',      -- Certificate is revoked
  'unknown'       -- Unable to determine revocation status
);

-- ================================================
-- CORE TABLES
-- ================================================

-- Digital Certificates table
-- Stores X.509 certificates for digital signatures
CREATE TABLE digital_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,

  -- Certificate details
  certificate_type certificate_type NOT NULL,
  certificate_number TEXT NOT NULL, -- e.g., RFC for e.firma
  issuer_dn TEXT NOT NULL,          -- Distinguished Name of issuer
  subject_dn TEXT NOT NULL,         -- Distinguished Name of subject
  serial_number TEXT NOT NULL,

  -- Validity period
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,

  -- Keys
  public_key TEXT NOT NULL,         -- PEM format
  certificate_pem TEXT,             -- Full certificate in PEM (optional, stored with consent)

  -- Status
  status certificate_status NOT NULL DEFAULT 'pending',

  -- Revocation
  revocation_reason TEXT,
  revoked_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT valid_certificate_dates CHECK (valid_until > valid_from),
  CONSTRAINT certificate_number_unique_per_user UNIQUE (user_id, certificate_number)
);

-- Digital Signatures table
-- Stores digital signatures for medical documents
CREATE TABLE digital_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Document reference
  document_type signature_document_type NOT NULL,
  document_id UUID NOT NULL,
  document_version INTEGER NOT NULL DEFAULT 1,

  -- Certificate reference
  certificate_id UUID NOT NULL REFERENCES digital_certificates(id) ON DELETE RESTRICT,

  -- Signer information
  signer_user_id UUID NOT NULL REFERENCES profiles(id),
  signer_name TEXT NOT NULL,
  signer_role TEXT NOT NULL, -- 'doctor' | 'admin'

  -- Signature data
  signature_value TEXT NOT NULL,          -- Base64 encoded
  signature_algorithm TEXT NOT NULL,      -- e.g., RSA-SHA256
  signature_format signature_format NOT NULL,

  -- Timestamp
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  timestamp_token TEXT,                   -- RFC 3161 timestamp token

  -- Verification
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verification_details JSONB,

  -- Security
  signing_digest TEXT,                    -- Hash of signed data
  ip_address INET,
  user_agent TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Prevent duplicate signatures for same document/version
  CONSTRAINT unique_signature_per_document_version UNIQUE (document_id, document_version)
);

-- Signature Audit Logs table
-- Tracks all signature-related events for compliance
CREATE TABLE signature_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event details
  event_type signature_audit_event_type NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Document reference (if applicable)
  document_type signature_document_type,
  document_id UUID,
  document_version INTEGER,

  -- Signature reference (if applicable)
  signature_id UUID REFERENCES digital_signatures(id) ON DELETE SET NULL,

  -- Certificate reference (if applicable)
  certificate_id UUID REFERENCES digital_certificates(id) ON DELETE SET NULL,

  -- User context
  user_id UUID REFERENCES profiles(id),
  user_role TEXT,
  user_name TEXT,

  -- Event data
  event_data JSONB,

  -- Technical details
  ip_address INET,
  user_agent TEXT,

  -- Compliance
  nom004_compliant BOOLEAN,
  compliance_notes TEXT,

  -- Result
  success BOOLEAN NOT NULL,
  error_message TEXT
);

-- NOM-004 Compliance Results table
-- Stores compliance check results for signatures
CREATE TABLE nom004_compliance_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Overall status
  status nom004_compliance_status NOT NULL,
  score NUMERIC(5, 2) NOT NULL CHECK (score BETWEEN 0 AND 100),

  -- Reference
  signature_id UUID REFERENCES digital_signatures(id) ON DELETE SET NULL,
  document_id UUID,
  document_type signature_document_type,

  -- Individual checks
  checks JSONB NOT NULL, -- Array of compliance check objects

  -- Recommendations
  recommendations TEXT[],

  -- Audit
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_by UUID REFERENCES profiles(id)
);

-- Certificate Validation Cache table
-- Caches validation results to improve performance
CREATE TABLE certificate_validation_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID NOT NULL REFERENCES digital_certificates(id) ON DELETE CASCADE,

  -- Validation result
  is_valid BOOLEAN NOT NULL,
  errors TEXT[],
  warnings TEXT[],

  -- Chain validation
  chain JSONB, -- Certificate chain information

  -- Revocation status
  revocation_status revocation_status NOT NULL,
  revocation_checked_at TIMESTAMPTZ,

  -- Cache control
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  -- Metadata
  validation_metadata JSONB DEFAULT '{}'::jsonb
);

-- ================================================
-- INDEXES
-- ================================================

-- Digital Certificates indexes
CREATE INDEX idx_digital_certs_user_id ON digital_certificates(user_id);
CREATE INDEX idx_digital_certs_type ON digital_certificates(certificate_type);
CREATE INDEX idx_digital_certs_status ON digital_certificates(status);
CREATE INDEX idx_digital_certs_valid_until ON digital_certificates(valid_until);
CREATE INDEX idx_digital_certs_certificate_number ON digital_certificates(certificate_number);

-- Digital Signatures indexes
CREATE INDEX idx_digital_sigs_document_id ON digital_signatures(document_id);
CREATE INDEX idx_digital_sigs_document_type ON digital_signatures(document_type);
CREATE INDEX idx_digital_sigs_certificate_id ON digital_signatures(certificate_id);
CREATE INDEX idx_digital_sigs_signer_user_id ON digital_signatures(signer_user_id);
CREATE INDEX idx_digital_sigs_verification_status ON digital_signatures(verification_status);
CREATE INDEX idx_digital_sigs_signed_at ON digital_signatures(signed_at);

-- Signature Audit Logs indexes
CREATE INDEX idx_sig_audit_event_type ON signature_audit_logs(event_type);
CREATE INDEX idx_sig_audit_timestamp ON signature_audit_logs(event_timestamp);
CREATE INDEX idx_sig_audit_user_id ON signature_audit_logs(user_id);
CREATE INDEX idx_sig_audit_signature_id ON signature_audit_logs(signature_id);
CREATE INDEX idx_sig_audit_certificate_id ON signature_audit_logs(certificate_id);
CREATE INDEX idx_sig_audit_document_id ON signature_audit_logs(document_id);

-- NOM-004 Compliance Results indexes
CREATE INDEX idx_nom004_signature_id ON nom004_compliance_results(signature_id);
CREATE INDEX idx_nom004_document_id ON nom004_compliance_results(document_id);
CREATE INDEX idx_nom004_status ON nom004_compliance_results(status);
CREATE INDEX idx_nom004_checked_at ON nom004_compliance_results(checked_at);

-- Certificate Validation Cache indexes
CREATE INDEX idx_cert_cache_certificate_id ON certificate_validation_cache(certificate_id);
CREATE INDEX idx_cert_cache_expires_at ON certificate_validation_cache(expires_at);

-- Composite indexes for common queries
CREATE INDEX idx_digital_sigs_doc_version ON digital_signatures(document_id, document_version);
CREATE INDEX idx_sig_audit_doc_event ON signature_audit_logs(document_id, event_type);
CREATE INDEX idx_digital_certs_user_status ON digital_certificates(user_id, status);

-- ================================================
-- FUNCTIONS
// ================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_digital_signature_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if certificate is expired
CREATE OR REPLACE FUNCTION is_certificate_expired(certificate_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  valid_until TIMESTAMPTZ;
  cert_status certificate_status;
BEGIN
  SELECT valid_until, status INTO valid_until, cert_status
  FROM digital_certificates
  WHERE id = certificate_id;

  RETURN cert_status = 'expired' OR (valid_until IS NOT NULL AND valid_until < NOW());
END;
$$ LANGUAGE plpgsql;

-- Function to get active certificates for user
CREATE OR REPLACE FUNCTION get_user_active_certificates(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  certificate_type certificate_type,
  certificate_number TEXT,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  status certificate_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.certificate_type,
    dc.certificate_number,
    dc.valid_from,
    dc.valid_until,
    dc.status
  FROM digital_certificates dc
  WHERE dc.user_id = user_id_param
    AND dc.status = 'active'
    AND dc.valid_until > NOW()
  ORDER BY dc.valid_until DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-expire certificates
CREATE OR REPLACE FUNCTION expire_old_certificates()
RETURNS void AS $$
BEGIN
  UPDATE digital_certificates
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND valid_until <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to create signature audit log entry
CREATE OR REPLACE FUNCTION log_signature_audit_event(
  p_event_type signature_audit_event_type,
  p_user_id UUID,
  p_document_id UUID DEFAULT NULL,
  p_document_type signature_document_type DEFAULT NULL,
  p_signature_id UUID DEFAULT NULL,
  p_certificate_id UUID DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_user_name TEXT;
  v_user_role TEXT;
BEGIN
  -- Get user details
  SELECT full_name, role INTO v_user_name, v_user_role
  FROM profiles
  WHERE id = p_user_id;

  -- Create audit log entry
  INSERT INTO signature_audit_logs (
    event_type,
    user_id,
    user_role,
    user_name,
    document_id,
    document_type,
    signature_id,
    certificate_id,
    success,
    error_message,
    event_data
  )
  VALUES (
    p_event_type,
    p_user_id,
    v_user_role,
    v_user_name,
    p_document_id,
    p_document_type,
    p_signature_id,
    p_certificate_id,
    p_success,
    p_error_message,
    p_event_data
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- Function to verify signature integrity
CREATE OR REPLACE FUNCTION verify_signature_integrity(signature_id UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  verification_details JSONB
) AS $$
DECLARE
  v_signature digital_signatures;
  v_certificate digital_certificates;
  v_is_valid BOOLEAN := true;
  v_details JSONB := '{}'::jsonb;
  v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get signature and certificate
  SELECT * INTO v_signature
  FROM digital_signatures
  WHERE id = signature_id;

  IF NOT FOUND THEN
    v_errors := array_append(v_errors, 'Signature not found');
    v_is_valid := false;
  END IF;

  SELECT * INTO v_certificate
  FROM digital_certificates
  WHERE id = v_signature.certificate_id;

  IF NOT FOUND THEN
    v_errors := array_append(v_errors, 'Certificate not found');
    v_is_valid := false;
  END IF;

  -- Check certificate validity
  IF v_certificate.status != 'active' THEN
    v_errors := array_append(v_errors, 'Certificate is not active');
    v_is_valid := false;
  END IF;

  IF v_certificate.valid_until < NOW() THEN
    v_errors := array_append(v_errors, 'Certificate has expired');
    v_is_valid := false;
  END IF;

  -- Build verification details
  v_details := jsonb_build_object(
    'signatureValid', v_is_valid,
    'certificateValid', (v_certificate.status = 'active'),
    'certificateExpiresAt', v_certificate.valid_until,
    'errors', v_errors,
    'verifiedAt', NOW()
  );

  -- Update signature verification status
  UPDATE digital_signatures
  SET verification_status = CASE
    WHEN v_is_valid THEN 'valid'
    ELSE 'invalid'
  END,
  verification_details = v_details
  WHERE id = signature_id;

  RETURN QUERY SELECT v_is_valid, v_details;
END;
$$ LANGUAGE plpgsql;

-- Function to check NOM-004 compliance
CREATE OR REPLACE FUNCTION check_nom004_compliance(signature_id UUID)
RETURNS nom004_compliance_status AS $$
DECLARE
  v_signature digital_signatures;
  v_certificate digital_certificates;
  v_compliance_status nom004_compliance_status := 'compliant';
  v_score NUMERIC := 100.0;
  v_checks JSONB := '[]'::jsonb;
BEGIN
  -- Get signature and certificate
  SELECT * INTO v_signature, v_certificate
  FROM digital_signatures ds
  JOIN digital_certificates dc ON ds.certificate_id = dc.id
  WHERE ds.id = signature_id;

  IF NOT FOUND THEN
    RETURN 'non_compliant';
  END IF;

  -- Check 1: Certificate must be active
  IF v_certificate.status != 'active' THEN
    v_compliance_status := 'non_compliant';
    v_score := v_score - 30;
    v_checks := v_checks || jsonb_build_object(
      'name', 'Certificate Active',
      'passed', false,
      'description', 'Certificate must be active'
    );
  ELSE
    v_checks := v_checks || jsonb_build_object(
      'name', 'Certificate Active',
      'passed', true,
      'description', 'Certificate is active'
    );
  END IF;

  -- Check 2: Certificate must not be expired
  IF v_certificate.valid_until < NOW() THEN
    v_compliance_status := 'non_compliant';
    v_score := v_score - 30;
    v_checks := v_checks || jsonb_build_object(
      'name', 'Certificate Not Expired',
      'passed', false,
      'description', 'Certificate must not be expired'
    );
  ELSE
    v_checks := v_checks || jsonb_build_object(
      'name', 'Certificate Not Expired',
      'passed', true,
      'description', 'Certificate is not expired'
    );
  END IF;

  -- Check 3: Signature must have timestamp
  IF v_signature.timestamp_token IS NULL THEN
    v_compliance_status := 'mostly_compliant';
    v_score := v_score - 20;
    v_checks := v_checks || jsonb_build_object(
      'name', 'Timestamp Present',
      'passed', false,
      'description', 'Signature should have RFC 3161 timestamp'
    );
  ELSE
    v_checks := v_checks || jsonb_build_object(
      'name', 'Timestamp Present',
      'passed', true,
      'description', 'Signature has timestamp'
    );
  END IF;

  -- Check 4: Certificate type must be appropriate
  IF v_signature.document_type = 'medical_certificate' AND v_certificate.certificate_type != 'e_firma' THEN
    v_compliance_status := 'mostly_compliant';
    v_score := v_score - 20;
    v_checks := v_checks || jsonb_build_object(
      'name', 'Appropriate Certificate Type',
      'passed', false,
      'description', 'Medical certificates require e.firma'
    );
  ELSE
    v_checks := v_checks || jsonb_build_object(
      'name', 'Appropriate Certificate Type',
      'passed', true,
      'description', 'Certificate type is appropriate'
    );
  END IF;

  -- Determine final status based on score
  IF v_score >= 90 THEN
    v_compliance_status := 'compliant';
  ELSIF v_score >= 70 THEN
    v_compliance_status := 'mostly_compliant';
  ELSIF v_score >= 50 THEN
    v_compliance_status := 'partially_compliant';
  ELSE
    v_compliance_status := 'non_compliant';
  END IF;

  -- Store compliance result
  INSERT INTO nom004_compliance_results (
    status,
    score,
    checks,
    signature_id,
    document_id,
    document_type
  ) VALUES (
    v_compliance_status,
    v_score,
    v_checks,
    signature_id,
    v_signature.document_id,
    v_signature.document_type
  );

  RETURN v_compliance_status;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS
-- ================================================

-- Auto-update updated_at on digital certificates
CREATE TRIGGER trigger_update_digital_certs_updated_at
  BEFORE UPDATE ON digital_certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_digital_signature_updated_at();

-- Create audit log on certificate insert
CREATE TRIGGER trigger_audit_cert_insert
  AFTER INSERT ON digital_certificates
  FOR EACH ROW
  EXECUTE FUNCTION log_signature_audit_event(
    'certificate_upload',
    NEW.user_id,
    NULL,
    NULL,
    NULL,
    NEW.id,
    true,
    NULL,
    jsonb_build_object('certificate_type', NEW.certificate_type)
  );

-- Create audit log on signature insert
CREATE TRIGGER trigger_audit_signature_insert
  AFTER INSERT ON digital_signatures
  FOR EACH ROW
  EXECUTE FUNCTION log_signature_audit_event(
    'sign',
    NEW.signer_user_id,
    NEW.document_id,
    NEW.document_type,
    NEW.id,
    NEW.certificate_id,
    true,
    NULL,
    jsonb_build_object('signature_format', NEW.signature_format)
  );

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

-- Enable RLS on all digital signature tables
ALTER TABLE digital_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nom004_compliance_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_validation_cache ENABLE ROW LEVEL SECURITY;

-- Digital Certificates RLS
CREATE POLICY "Users can view their own certificates"
  ON digital_certificates FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own certificates"
  ON digital_certificates FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all certificates"
  ON digital_certificates FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all certificates"
  ON digital_certificates FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Digital Signatures RLS
CREATE POLICY "Users can view signatures for their documents"
  ON digital_signatures FOR SELECT
  USING (EXISTS (
    -- User can see signatures if they are the signer or if the document belongs to them
    SELECT 1 FROM profiles p
    WHERE (p.id = signer_user_id AND p.id = auth.uid())
       OR EXISTS (
         -- Check if document belongs to user (simplified check)
         SELECT 1 FROM appointments a WHERE a.id = document_id AND a.patient_id = auth.uid()
         LIMIT 1
       )
  ));

CREATE POLICY "Doctors can create signatures"
  ON digital_signatures FOR INSERT
  WITH CHECK (signer_user_id = auth.uid());

CREATE POLICY "Admins can view all signatures"
  ON digital_signatures FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all signatures"
  ON digital_signatures FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Signature Audit Logs RLS
CREATE POLICY "Users can view audit logs for their signatures"
  ON signature_audit_logs FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM digital_signatures ds
      JOIN appointments a ON a.id = ds.document_id
      WHERE ds.id = signature_id AND a.patient_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all audit logs"
  ON signature_audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Only system can insert audit logs
CREATE POLICY "System can insert signature audit logs"
  ON signature_audit_logs FOR INSERT
  WITH CHECK (true);

-- NOM-004 Compliance Results RLS
CREATE POLICY "Users can view compliance for their signatures"
  ON nom004_compliance_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM digital_signatures ds
    JOIN appointments a ON a.id = ds.document_id
    WHERE ds.id = signature_id AND a.patient_id = auth.uid()
  ));

CREATE POLICY "Admins can view all compliance results"
  ON nom004_compliance_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Certificate Validation Cache RLS
CREATE POLICY "Admins can manage validation cache"
  ON certificate_validation_cache FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ================================================
-- VIEWS
-- ================================================

-- Active Certificates View
CREATE OR REPLACE VIEW active_certificates_view AS
SELECT
  dc.id,
  dc.user_id,
  p.full_name as user_name,
  p.email as user_email,
  dc.certificate_type,
  dc.certificate_number,
  dc.issuer_dn,
  dc.subject_dn,
  dc.valid_from,
  dc.valid_until,
  dc.status,
  EXTRACT(DAY FROM (dc.valid_until - NOW())) as days_until_expiration
FROM digital_certificates dc
JOIN profiles p ON dc.user_id = p.id
WHERE dc.status = 'active'
  AND dc.valid_until > NOW()
ORDER BY dc.valid_until ASC;

-- Signature Compliance Dashboard View
CREATE OR REPLACE VIEW signature_compliance_dashboard AS
SELECT
  DATE_TRUNC('day', ds.signed_at) as date,
  ds.document_type,
  COUNT(*) as total_signatures,
  COUNT(*) FILTER (WHERE ds.verification_status = 'valid') as valid_signatures,
  COUNT(*) FILTER (WHERE ncr.status = 'compliant') as nom004_compliant,
  COUNT(*) FILTER (WHERE dc.certificate_type = 'e_firma') as using_efirma,
  ROUND(AVG(ncr.score), 2) as avg_compliance_score
FROM digital_signatures ds
LEFT JOIN nom004_compliance_results ncr ON ncr.signature_id = ds.id
LEFT JOIN digital_certificates dc ON dc.certificate_id = dc.id
WHERE ds.signed_at >= NOW() - INTERVAL '30 days'
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE digital_certificates IS 'Almacena certificados X.509 para firmas digitales NOM-004';
COMMENT ON TABLE digital_signatures IS 'Almacena firmas digitales para documentos médicos';
COMMENT ON TABLE signature_audit_logs IS 'Auditoría completa de operaciones de firma digital';
COMMENT ON TABLE nom004_compliance_results IS 'Resultados de verificación de cumplimiento NOM-004';
COMMENT ON TABLE certificate_validation_cache IS 'Caché de resultados de validación de certificados';

COMMENT ON COLUMN digital_certificates.certificate_type IS 'Tipo: e_firma (SAT), commercial, o internal';
COMMENT ON COLUMN digital_certificates.certificate_pem IS 'Certificado completo en formato PEM (almacenado con consentimiento)';
COMMENT ON COLUMN digital_signatures.timestamp_token IS 'Token de timestamp RFC 3161';
COMMENT ON COLUMN digital_signatures.verification_status IS 'Estado de verificación: pending, valid, invalid, tampered, revoked, expired';
COMMENT ON COLUMN nom004_compliance_results.status IS 'Estado de cumplimiento NOM-004: compliant, mostly_compliant, partially_compliant, non_compliant';

-- ================================================
-- END OF MIGRATION
-- ================================================
