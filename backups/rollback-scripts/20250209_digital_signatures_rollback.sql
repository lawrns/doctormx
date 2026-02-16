-- ============================================================
-- ROLLBACK SCRIPT: 20250209_digital_signatures.sql
-- DoctorMX Database Migration Rollback
-- Digital Signature System
-- Generated: 2026-02-16T09:42:35-06:00
-- CRITICAL: This contains legally binding signature data
-- ============================================================

BEGIN;

-- Verify migration was applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'digital_certificates') THEN
        RAISE EXCEPTION 'Cannot rollback: digital_certificates table does not exist';
    END IF;
END $$;

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS digital_certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS digital_signatures DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS signature_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS nom004_compliance_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS certificate_validation_cache DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own certificates" ON digital_certificates;
DROP POLICY IF EXISTS "Users can insert their own certificates" ON digital_certificates;
DROP POLICY IF EXISTS "Admins can view all certificates" ON digital_certificates;
DROP POLICY IF EXISTS "Admins can manage all certificates" ON digital_certificates;
DROP POLICY IF EXISTS "Users can view signatures for their documents" ON digital_signatures;
DROP POLICY IF EXISTS "Doctors can create signatures" ON digital_signatures;
DROP POLICY IF EXISTS "Admins can view all signatures" ON digital_signatures;
DROP POLICY IF EXISTS "Admins can manage all signatures" ON digital_signatures;
DROP POLICY IF EXISTS "Users can view audit logs for their signatures" ON signature_audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON signature_audit_logs;
DROP POLICY IF EXISTS "System can insert signature audit logs" ON signature_audit_logs;
DROP POLICY IF EXISTS "Users can view compliance for their signatures" ON nom004_compliance_results;
DROP POLICY IF EXISTS "Admins can view all compliance results" ON nom004_compliance_results;
DROP POLICY IF EXISTS "Admins can manage validation cache" ON certificate_validation_cache;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_digital_certs_user_id;
DROP INDEX IF EXISTS idx_digital_certs_type;
DROP INDEX IF EXISTS idx_digital_certs_status;
DROP INDEX IF EXISTS idx_digital_certs_valid_until;
DROP INDEX IF EXISTS idx_digital_certs_certificate_number;
DROP INDEX IF EXISTS idx_digital_sigs_document_id;
DROP INDEX IF EXISTS idx_digital_sigs_document_type;
DROP INDEX IF EXISTS idx_digital_sigs_certificate_id;
DROP INDEX IF EXISTS idx_digital_sigs_signer_user_id;
DROP INDEX IF EXISTS idx_digital_sigs_verification_status;
DROP INDEX IF EXISTS idx_digital_sigs_signed_at;
DROP INDEX IF EXISTS idx_sig_audit_event_type;
DROP INDEX IF EXISTS idx_sig_audit_timestamp;
DROP INDEX IF EXISTS idx_sig_audit_user_id;
DROP INDEX IF EXISTS idx_sig_audit_signature_id;
DROP INDEX IF EXISTS idx_sig_audit_certificate_id;
DROP INDEX IF EXISTS idx_sig_audit_document_id;
DROP INDEX IF EXISTS idx_nom004_signature_id;
DROP INDEX IF EXISTS idx_nom004_document_id;
DROP INDEX IF EXISTS idx_nom004_status;
DROP INDEX IF EXISTS idx_nom004_checked_at;
DROP INDEX IF EXISTS idx_cert_cache_certificate_id;
DROP INDEX IF EXISTS idx_cert_cache_expires_at;
DROP INDEX IF EXISTS idx_digital_sigs_doc_version;
DROP INDEX IF EXISTS idx_sig_audit_doc_event;
DROP INDEX IF EXISTS idx_digital_certs_user_status;

-- ============================================================
-- DROP TABLES (dependency order)
-- ============================================================

DROP TABLE IF EXISTS nom004_compliance_results CASCADE;
DROP TABLE IF EXISTS signature_audit_logs CASCADE;
DROP TABLE IF EXISTS certificate_validation_cache CASCADE;
DROP TABLE IF EXISTS digital_signatures CASCADE;
DROP TABLE IF EXISTS digital_certificates CASCADE;

-- ============================================================
-- DROP TYPES
-- ============================================================

DROP TYPE IF EXISTS revocation_status CASCADE;
DROP TYPE IF EXISTS nom004_compliance_status CASCADE;
DROP TYPE IF EXISTS signature_audit_event_type CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS signature_document_type CASCADE;
DROP TYPE IF EXISTS signature_format CASCADE;
DROP TYPE IF EXISTS certificate_status CASCADE;
DROP TYPE IF EXISTS certificate_type CASCADE;

-- ============================================================
-- VERIFY ROLLBACK
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'digital_certificates') THEN
        RAISE EXCEPTION 'Rollback failed: digital_certificates table still exists';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'digital_signatures') THEN
        RAISE EXCEPTION 'Rollback failed: digital_signatures table still exists';
    END IF;
END $$;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 20250209_digital_signatures.sql';
    RAISE NOTICE 'WARNING: All digital signature data has been deleted';
END $$;
