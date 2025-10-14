-- Doctor.mx Database Schema v1.0
-- Complete schema for WhatsApp-first telemedicine platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin', 'pharmacy');
CREATE TYPE license_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE consult_status AS ENUM ('triage', 'assigned', 'active', 'resolved', 'er_redirect', 'cancelled');
CREATE TYPE consult_channel AS ENUM ('whatsapp', 'web', 'video');
CREATE TYPE payment_provider AS ENUM ('stripe', 'conekta', 'openpay');
CREATE TYPE payment_method AS ENUM ('card', 'spei', 'oxxo', 'codi');
CREATE TYPE payment_status AS ENUM ('requires_action', 'succeeded', 'refunded', 'failed');
CREATE TYPE erx_status AS ENUM ('issued', 'routed', 'filled', 'cancelled');
CREATE TYPE pharmacy_fill_status AS ENUM ('received', 'ready', 'delivered');
CREATE TYPE referral_source AS ENUM ('whatsapp', 'qr', 'doctor', 'employer', 'university');
CREATE TYPE credit_reason AS ENUM ('referral_earned', 'referral_spent', 'promo', 'refund');

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table (patients, doctors, admin, pharmacy staff)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL DEFAULT 'patient',
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  name TEXT,
  whatsapp_optin BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctors table (extended profile for medical professionals)
CREATE TABLE doctors (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  cedula TEXT UNIQUE NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  license_status license_status NOT NULL DEFAULT 'pending',
  kpis JSONB DEFAULT '{}',
  payout_account JSONB,
  calendar JSONB,
  bio TEXT,
  avg_response_sec INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 5.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_specialties ON doctors USING GIN (specialties);
CREATE INDEX idx_doctors_license_status ON doctors(license_status);

-- Pharmacies table
CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  store_id TEXT UNIQUE NOT NULL,
  address TEXT,
  qr_code TEXT UNIQUE,
  contact_phone TEXT,
  revshare_percent NUMERIC(4,2) DEFAULT 10.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pharmacies_store_id ON pharmacies(store_id);
CREATE INDEX idx_pharmacies_qr_code ON pharmacies(qr_code);

-- Referrals table (track attribution and viral growth)
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source referral_source NOT NULL,
  source_id TEXT,
  ref_code TEXT UNIQUE,
  patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  attribution JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_source ON referrals(source, source_id);
CREATE INDEX idx_referrals_ref_code ON referrals(ref_code);
CREATE INDEX idx_referrals_patient_id ON referrals(patient_id);

-- Consults table (core medical consultations)
CREATE TABLE consults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE SET NULL,
  channel consult_channel NOT NULL DEFAULT 'whatsapp',
  status consult_status NOT NULL DEFAULT 'triage',
  price_mxn INTEGER NOT NULL DEFAULT 79,
  paid BOOLEAN DEFAULT false,
  specialty TEXT,
  red_flags TEXT[] DEFAULT '{}',
  triage JSONB,
  notes JSONB,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consults_status ON consults(status);
CREATE INDEX idx_consults_patient_id ON consults(patient_id);
CREATE INDEX idx_consults_doctor_id ON consults(doctor_id);
CREATE INDEX idx_consults_red_flags ON consults USING GIN (red_flags);
CREATE INDEX idx_consults_created_at ON consults(created_at DESC);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consult_id UUID NOT NULL REFERENCES consults(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL,
  method payment_method NOT NULL,
  amount_mxn INTEGER NOT NULL,
  fee_split JSONB,
  status payment_status NOT NULL DEFAULT 'requires_action',
  cfdi JSONB,
  provider_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_consult_id ON payments(consult_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_payment_id ON payments(provider_payment_id);

-- E-Prescriptions table
CREATE TABLE erx (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consult_id UUID NOT NULL REFERENCES consults(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  controlled BOOLEAN DEFAULT false,
  status erx_status NOT NULL DEFAULT 'issued',
  pdf_url TEXT,
  xml_url TEXT,
  qr_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_erx_status ON erx(status);
CREATE INDEX idx_erx_qr_token ON erx(qr_token);
CREATE INDEX idx_erx_consult_id ON erx(consult_id);
CREATE INDEX idx_erx_patient_id ON erx(patient_id);

-- Pharmacy fills table (track prescription fulfillment)
CREATE TABLE pharmacy_fills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  erx_id UUID NOT NULL REFERENCES erx(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  status pharmacy_fill_status NOT NULL DEFAULT 'received',
  prices JSONB,
  delivery_eta_minutes INTEGER,
  events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pharmacy_fills_erx_id ON pharmacy_fills(erx_id);
CREATE INDEX idx_pharmacy_fills_pharmacy_id ON pharmacy_fills(pharmacy_id);
CREATE INDEX idx_pharmacy_fills_status ON pharmacy_fills(status);

-- Credits ledger (referral rewards, promos, refunds)
CREATE TABLE credits_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta_mxn INTEGER NOT NULL,
  reason credit_reason NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credits_ledger_user_id ON credits_ledger(user_id);
CREATE INDEX idx_credits_ledger_created_at ON credits_ledger(created_at DESC);

-- Audit trail (compliance and security)
CREATE TABLE audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  diff JSONB,
  ip TEXT,
  ua TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_trail_entity ON audit_trail(entity, entity_id);
CREATE INDEX idx_audit_trail_actor_user_id ON audit_trail(actor_user_id);
CREATE INDEX idx_audit_trail_created_at ON audit_trail(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER set_timestamp_users
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_doctors
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_pharmacies
  BEFORE UPDATE ON pharmacies
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_consults
  BEFORE UPDATE ON consults
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_erx
  BEFORE UPDATE ON erx
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_pharmacy_fills
  BEFORE UPDATE ON pharmacy_fills
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Active consultations with doctor and patient info
CREATE VIEW active_consults_view AS
SELECT
  c.*,
  p.name as patient_name,
  p.phone as patient_phone,
  d.name as doctor_name,
  doc.specialties as doctor_specialties,
  doc.rating_avg as doctor_rating
FROM consults c
JOIN users p ON c.patient_id = p.id
LEFT JOIN doctors doc ON c.doctor_id = doc.user_id
LEFT JOIN users d ON doc.user_id = d.id
WHERE c.status IN ('triage', 'assigned', 'active');

-- User credits balance
CREATE VIEW user_credits_balance AS
SELECT
  user_id,
  SUM(delta_mxn) as balance_mxn,
  COUNT(*) as transaction_count,
  MAX(created_at) as last_transaction_at
FROM credits_ledger
GROUP BY user_id;

-- Pharmacy performance metrics
CREATE VIEW pharmacy_metrics AS
SELECT
  ph.id,
  ph.name,
  ph.store_id,
  COUNT(DISTINCT pf.id) as total_fills,
  COUNT(DISTINCT CASE WHEN pf.status = 'delivered' THEN pf.id END) as delivered_fills,
  AVG(pf.delivery_eta_minutes) as avg_delivery_minutes,
  MAX(pf.created_at) as last_fill_at
FROM pharmacies ph
LEFT JOIN pharmacy_fills pf ON ph.id = pf.pharmacy_id
GROUP BY ph.id, ph.name, ph.store_id;

-- Doctor performance metrics
CREATE VIEW doctor_metrics AS
SELECT
  d.user_id,
  u.name,
  d.specialties,
  d.rating_avg,
  d.avg_response_sec,
  COUNT(DISTINCT c.id) as total_consults,
  COUNT(DISTINCT CASE WHEN c.status = 'resolved' THEN c.id END) as resolved_consults,
  COUNT(DISTINCT e.id) as total_prescriptions
FROM doctors d
JOIN users u ON d.user_id = u.id
LEFT JOIN consults c ON d.user_id = c.doctor_id
LEFT JOIN erx e ON d.user_id = e.doctor_id
GROUP BY d.user_id, u.name, d.specialties, d.rating_avg, d.avg_response_sec;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert seed specialties (can be used for tagging)
INSERT INTO pharmacies (name, store_id, qr_code, address, contact_phone) VALUES
  ('Farmacia Piloto Centro', 'PILOTO-001', 'QR-PILOTO-001', 'Av. Centro 123, Ciudad de México', '+52-555-0001'),
  ('Farmacia Piloto Norte', 'PILOTO-002', 'QR-PILOTO-002', 'Av. Norte 456, Ciudad de México', '+52-555-0002')
ON CONFLICT (store_id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE consults ENABLE ROW LEVEL SECURITY;
ALTER TABLE erx ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits_ledger ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Doctors can view their assigned consults
CREATE POLICY "Doctors can view assigned consults" ON consults
  FOR SELECT USING (
    doctor_id = auth.uid() OR
    patient_id = auth.uid()
  );

-- Patients can view their own consults
CREATE POLICY "Patients can view own consults" ON consults
  FOR SELECT USING (patient_id = auth.uid());

-- Admin has full access (role check needed)
CREATE POLICY "Admin full access users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'Core users table for patients, doctors, pharmacy staff, and admins';
COMMENT ON TABLE doctors IS 'Extended profile for medical professionals with verification status';
COMMENT ON TABLE consults IS 'Medical consultations - core business entity';
COMMENT ON TABLE erx IS 'Electronic prescriptions with QR codes for pharmacy pickup';
COMMENT ON TABLE pharmacy_fills IS 'Tracks prescription fulfillment at pharmacy partners';
COMMENT ON TABLE credits_ledger IS 'Immutable ledger for referral rewards and promotional credits';
COMMENT ON TABLE audit_trail IS 'Compliance audit log for all sensitive operations';

COMMENT ON COLUMN doctors.cedula IS 'Professional medical license number (Cédula Profesional)';
COMMENT ON COLUMN doctors.kpis IS 'JSON object storing performance metrics: {response_time_avg, satisfaction_score, consults_completed}';
COMMENT ON COLUMN consults.red_flags IS 'Array of emergency indicators detected during triage';
COMMENT ON COLUMN consults.triage IS 'JSON object storing initial triage data and symptoms';
COMMENT ON COLUMN erx.qr_token IS 'Unique token for pharmacy to claim prescription via QR scan';
COMMENT ON COLUMN payments.cfdi IS 'JSON object containing CFDI (Comprobante Fiscal Digital) data for Mexican tax compliance';
