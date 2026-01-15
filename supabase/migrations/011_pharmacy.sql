-- Migration 011: Pharmacy Sponsorship Integration (Enhanced)
-- Pharmacy referral system for prescription revenue sharing

-- ============================================
-- PHARMACY SPONSORS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacy_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  neighborhood VARCHAR(100),
  zip_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  delivery_radius_km DECIMAL(6, 1) DEFAULT 5.0,
  offers_delivery BOOLEAN DEFAULT true,
  offers_pickup BOOLEAN DEFAULT true,
  delivery_time_hours INTEGER DEFAULT 2,
  minimum_order_cents INTEGER DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  doctory_discount_code VARCHAR(20),
  referral_fee_cents INTEGER DEFAULT 5000,
  commission_rate DECIMAL(5, 2) DEFAULT 5.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  priority INTEGER DEFAULT 0,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pharmacy_sponsors IS 'Pharmacy partner sponsors for prescription referral program';
COMMENT ON COLUMN pharmacy_sponsors.commission_rate IS 'Percentage commission on medication sales';
COMMENT ON COLUMN pharmacy_sponsors.referral_fee_cents IS 'Fixed fee per referral in cents (50 MXN = 5000)';
COMMENT ON COLUMN pharmacy_sponsors.status IS 'Application status: pending, approved, rejected, suspended';
COMMENT ON COLUMN pharmacy_sponsors.priority IS 'Display priority (higher = shown first)';

-- ============================================
-- PHARMACY OPERATING HOURS
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacy_operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacy_sponsors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_24_hours BOOLEAN DEFAULT false,
  is_closed BOOLEAN DEFAULT false,
  UNIQUE(pharmacy_id, day_of_week)
);

-- ============================================
-- PHARMACY MEDICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacy_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacy_sponsors(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  medication_code VARCHAR(100),
  generic_name VARCHAR(255),
  category VARCHAR(100),
  dosage_form VARCHAR(50),
  strength VARCHAR(50),
  presentation VARCHAR(100),
  brand_names TEXT[],
  price_cents INTEGER NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  requires_prescription BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pharmacy_id, medication_code)
);

-- ============================================
-- PHARMACY REFERRALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacy_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_sponsors(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  medications JSONB NOT NULL,
  medications_summary TEXT,
  estimated_total_cents INTEGER,
  discount_applied INTEGER DEFAULT 0,
  patient_location_lat DECIMAL(10, 8),
  patient_location_lng DECIMAL(11, 8),
  patient_city VARCHAR(100),
  patient_neighborhood VARCHAR(100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'contacted', 'scheduled', 'redeemed', 'expired', 'cancelled')),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  contacted_at TIMESTAMPTZ,
  scheduled_pickup_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  redemption_confirmed_by UUID REFERENCES profiles(id),
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  UNIQUE(pharmacy_id, prescription_id)
);

COMMENT ON TABLE pharmacy_referrals IS 'Pharmacy referral records tracking patient referrals';
COMMENT ON COLUMN pharmacy_referrals.referral_code IS 'Unique code shown at pharmacy for redemption';
COMMENT ON COLUMN pharmacy_referrals.status IS 'Referral lifecycle: pending, sent, viewed, contacted, scheduled, redeemed, expired, cancelled';

-- ============================================
-- PHARMACY COMMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacy_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES pharmacy_referrals(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_sponsors(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  medication_total_cents INTEGER,
  commission_rate DECIMAL(5, 2) NOT NULL,
  commission_amount_cents INTEGER NOT NULL,
  referral_fee_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  net_doctor_earnings_cents INTEGER NOT NULL,
  total_payout_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  payout_id UUID,
  paid_at TIMESTAMPTZ,
  period_start DATE,
  period_end DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pharmacy_commissions IS 'Commission tracking per referral for pharmacy partners';
COMMENT ON COLUMN pharmacy_commissions.total_payout_cents IS 'Total amount pharmacy pays to Doctory';
COMMENT ON COLUMN pharmacy_commissions.net_doctor_earnings_cents IS 'Amount doctor receives after platform fee';

-- ============================================
-- PHARMACY PAYOUTS TABLE (Monthly aggregation)
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacy_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_sponsors(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_referrals INTEGER NOT NULL,
  redeemed_referrals INTEGER NOT NULL,
  total_commission_cents INTEGER NOT NULL,
  total_fixed_fees_cents INTEGER NOT NULL,
  total_payout_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pharmacy_id, period_start, period_end)
);

COMMENT ON TABLE pharmacy_payouts IS 'Monthly payout aggregation for pharmacy partners';

-- ============================================
-- REFERRAL EVENTS (Analytics)
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacy_referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES pharmacy_referrals(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  referrer_url TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_pharmacy_sponsors_status ON pharmacy_sponsors(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_pharmacy_sponsors_location ON pharmacy_sponsors(city, state);
CREATE INDEX IF NOT EXISTS idx_pharmacy_sponsors_city ON pharmacy_sponsors(city, neighborhood);

CREATE INDEX IF NOT EXISTS idx_pharmacy_referrals_code ON pharmacy_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_pharmacy_referrals_pharmacy ON pharmacy_referrals(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_referrals_appointment ON pharmacy_referrals(appointment_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_referrals_patient ON pharmacy_referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_referrals_doctor ON pharmacy_referrals(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pharmacy_referrals_status ON pharmacy_referrals(status);
CREATE INDEX IF NOT EXISTS idx_pharmacy_referrals_expires ON pharmacy_referrals(expires_at)
  WHERE status IN ('pending', 'sent', 'viewed', 'contacted', 'scheduled');

CREATE INDEX IF NOT EXISTS idx_pharmacy_commissions_pharmacy ON pharmacy_commissions(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_commissions_referral ON pharmacy_commissions(referral_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_commissions_doctor ON pharmacy_commissions(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_pharmacy_commissions_status ON pharmacy_commissions(status);
CREATE INDEX IF NOT EXISTS idx_pharmacy_commissions_period ON pharmacy_commissions(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_pharmacy_payouts_pharmacy ON pharmacy_payouts(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_payouts_status ON pharmacy_payouts(status);
CREATE INDEX IF NOT EXISTS idx_pharmacy_payouts_period ON pharmacy_payouts(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_referral_events_referral ON pharmacy_referral_events(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_type ON pharmacy_referral_events(event_type);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE pharmacy_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_referral_events ENABLE ROW LEVEL SECURITY;

-- Public read for approved pharmacies
CREATE POLICY "Approved pharmacies can view their data"
  ON pharmacy_sponsors FOR SELECT
  USING (status = 'approved' AND id IN (
    SELECT p.id FROM profiles prof
    JOIN pharmacy_sponsors p ON p.contact_email = prof.email
    WHERE prof.id = auth.uid()
  ));

-- Admins can manage all
CREATE POLICY "Admins can manage pharmacy sponsors"
  ON pharmacy_sponsors FOR ALL
  USING ( EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage operating hours"
  ON pharmacy_operating_hours FOR ALL
  USING ( EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage medications"
  ON pharmacy_medications FOR ALL
  USING ( EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Referrals - patients can view their own
CREATE POLICY "Patients can view their referrals"
  ON pharmacy_referrals FOR SELECT
  USING (patient_id = auth.uid());

-- Doctors can view referrals for their appointments
CREATE POLICY "Doctors can view referrals for their patients"
  ON pharmacy_referrals FOR SELECT
  USING (doctor_id = auth.uid());

-- Doctors can create referrals
CREATE POLICY "Doctors can create referrals"
  ON pharmacy_referrals FOR INSERT
  WITH CHECK (doctor_id = auth.uid());

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON pharmacy_referrals FOR SELECT
  USING ( EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Pharmacies can view their referrals
CREATE POLICY "Pharmacies can view their referrals"
  ON pharmacy_referrals FOR SELECT
  USING (pharmacy_id IN (
    SELECT p.id FROM profiles prof
    JOIN pharmacy_sponsors p ON p.contact_email = prof.email
    WHERE prof.id = auth.uid()
  ));

-- Admins manage commissions
CREATE POLICY "Admins can manage commissions"
  ON pharmacy_commissions FOR ALL
  USING ( EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Doctors can view their commissions
CREATE POLICY "Doctors can view their commissions"
  ON pharmacy_commissions FOR SELECT
  USING (doctor_id = auth.uid());

-- Admins manage payouts
CREATE POLICY "Admins can manage payouts"
  ON pharmacy_payouts FOR ALL
  USING ( EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Pharmacies can view their commissions
CREATE POLICY "Pharmacies can view their commissions"
  ON pharmacy_commissions FOR SELECT
  USING (pharmacy_id IN (
    SELECT p.id FROM profiles prof
    JOIN pharmacy_sponsors p ON p.contact_email = prof.email
    WHERE prof.id = auth.uid()
  ));

-- Pharmacies can view their payouts
CREATE POLICY "Pharmacies can view their payouts"
  ON pharmacy_payouts FOR SELECT
  USING (pharmacy_id IN (
    SELECT p.id FROM profiles prof
    JOIN pharmacy_sponsors p ON p.contact_email = prof.email
    WHERE prof.id = auth.uid()
  ));

-- Public can view referral events
CREATE POLICY "Anyone can create referral events"
  ON pharmacy_referral_events FOR INSERT
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_pharmacy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pharmacy_sponsors_updated ON pharmacy_sponsors;
CREATE TRIGGER update_pharmacy_sponsors_updated
  BEFORE UPDATE ON pharmacy_sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_pharmacy_updated_at();

DROP TRIGGER IF EXISTS update_pharmacy_commissions_updated ON pharmacy_commissions;
CREATE TRIGGER update_pharmacy_commissions_updated
  BEFORE UPDATE ON pharmacy_commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_pharmacy_updated_at();

DROP TRIGGER IF EXISTS update_pharmacy_payouts_updated ON pharmacy_payouts;
CREATE TRIGGER update_pharmacy_payouts_updated
  BEFORE UPDATE ON pharmacy_payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_pharmacy_updated_at();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  code VARCHAR(20);
  attempts INTEGER := 0;
BEGIN
  LOOP
    code := 'REF' || upper(substring(md5(random()::text) from 1 for 8));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM pharmacy_referrals WHERE referral_code = code
    );
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Failed to generate unique referral code';
    END IF;
  END LOOP;
  NEW.referral_code := code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_referral_code ON pharmacy_referrals;
CREATE TRIGGER generate_referral_code
  BEFORE INSERT ON pharmacy_referrals
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- Function to mark expired referrals
CREATE OR REPLACE FUNCTION mark_expired_referrals()
RETURNS void AS $$
BEGIN
  UPDATE pharmacy_referrals
  SET status = 'expired'
  WHERE status IN ('pending', 'sent', 'viewed', 'contacted', 'scheduled')
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate doctor earnings
CREATE OR REPLACE FUNCTION calculate_doctor_earnings(
  p_referral_fee_cents INTEGER,
  p_commission_amount_cents INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_platform_fee_cents INTEGER;
  v_net_earnings INTEGER;
BEGIN
  v_platform_fee_cents := floor(p_referral_fee_cents * 0.20);
  v_net_earnings := (p_referral_fee_cents - v_platform_fee_cents) + p_commission_amount_cents;
  RETURN v_net_earnings;
END;
$$ LANGUAGE plpgsql;

-- Function to update referral status
CREATE OR REPLACE FUNCTION update_referral_status(
  p_referral_id UUID,
  p_new_status TEXT
) RETURNS void AS $$
BEGIN
  UPDATE pharmacy_referrals
  SET status = p_new_status,
      updated_at = NOW()
  WHERE id = p_referral_id;

  IF p_new_status = 'viewed' THEN
    UPDATE pharmacy_referrals
    SET viewed_at = NOW()
    WHERE id = p_referral_id;
  ELSIF p_new_status = 'contacted' THEN
    UPDATE pharmacy_referrals
    SET contacted_at = NOW()
    WHERE id = p_referral_id;
  ELSIF p_new_status = 'scheduled' THEN
    UPDATE pharmacy_referrals
    SET scheduled_pickup_at = NOW()
    WHERE id = p_referral_id;
  ELSIF p_new_status = 'redeemed' THEN
    UPDATE pharmacy_referrals
    SET redeemed_at = NOW()
    WHERE id = p_referral_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR DASHBOARDS
-- ============================================

CREATE OR REPLACE VIEW pharmacy_dashboard_stats AS
SELECT
  p.id,
  p.name,
  p.status,
  p.city,
  p.state,
  COUNT(DISTINCT r.id) as total_referrals,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'redeemed') as redeemed_referrals,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'sent') as pending_referrals,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'viewed') as viewed_referrals,
  COALESCE(SUM(c.total_payout_cents), 0) as total_revenue_cents,
  COALESCE(COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'redeemed'), 0) * 50.00 as estimated_monthly_revenue
FROM pharmacy_sponsors p
LEFT JOIN pharmacy_referrals r ON p.id = r.pharmacy_id
LEFT JOIN pharmacy_commissions c ON r.id = c.referral_id
GROUP BY p.id, p.name, p.status, p.city, p.state;

CREATE OR REPLACE VIEW doctor_pharmacy_earnings AS
SELECT
  d.id as doctor_id,
  p.full_name as doctor_name,
  COUNT(DISTINCT r.id) as total_referrals,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'redeemed') as redeemed_referrals,
  COALESCE(SUM(c.referral_fee_cents), 0) as total_referral_fees_cents,
  COALESCE(SUM(c.commission_amount_cents), 0) as total_commissions_cents,
  COALESCE(SUM(c.net_doctor_earnings_cents), 0) as total_earnings_cents,
  COALESCE(SUM(c.platform_fee_cents), 0) as total_platform_fees_cents
FROM doctors d
JOIN profiles p ON d.id = p.id
LEFT JOIN pharmacy_referrals r ON r.doctor_id = d.id
LEFT JOIN pharmacy_commissions c ON c.referral_id = r.id
GROUP BY d.id, p.full_name;

CREATE OR REPLACE VIEW pharmacy_referral_summary AS
SELECT
  r.id,
  r.referral_code,
  r.status,
  r.created_at,
  r.redeemed_at,
  ps.name as pharmacy_name,
  pr.medications_summary,
  r.estimated_total_cents,
  c.total_payout_cents,
  c.net_doctor_earnings_cents
FROM pharmacy_referrals r
JOIN pharmacy_sponsors ps ON r.pharmacy_id = ps.id
LEFT JOIN pharmacy_commissions c ON r.id = c.referral_id;

-- ============================================
-- SEED DATA: Sample Pharmacy Sponsors
-- ============================================

INSERT INTO pharmacy_sponsors (name, slug, contact_email, city, state, referral_fee_cents, commission_rate, status, priority)
VALUES
  ('Farmacia Guadalajara', 'farmacia-guadalajara', 'doctory@guadalajara.com', 'Mexico City', 'CDMX', 5000, 5.00, 'approved', 100),
  ('Farmacia del Ahorro', 'farmacia-ahorro', 'doctory@ahorro.com', 'Mexico City', 'CDMX', 5000, 5.00, 'approved', 90),
  ('Farmacia YZA', 'farmacia-yza', 'doctory@yza.com', 'Guadalajara', 'Jalisco', 5000, 4.50, 'approved', 80),
  ('Farmacia Benavides', 'farmacia-benavides', 'doctory@benavides.com', 'Monterrey', 'Nuevo Leon', 5000, 5.00, 'approved', 85),
  ('Farmacia San José', 'farmacia-san-jose', 'doctory@sanjose.com', 'Mexico City', 'CDMX', 5000, 3.00, 'approved', 70)
ON CONFLICT (slug) DO NOTHING;

-- Set operating hours for seeded pharmacies
DO $$
DECLARE
  pharmacy RECORD;
BEGIN
  FOR pharmacy IN SELECT id FROM pharmacy_sponsors WHERE slug IN ('farmacia-guadalajara', 'farmacia-ahorro', 'farmacia-yza', 'farmacia-benavides', 'farmacia-san-jose') LOOP
    INSERT INTO pharmacy_operating_hours (pharmacy_id, day_of_week, open_time, close_time)
    VALUES (pharmacy.id, 0, '09:00:00', '21:00:00')
    ON CONFLICT (pharmacy_id, day_of_week) DO NOTHING;
    
    FOR day_num IN 1..6 LOOP
      INSERT INTO pharmacy_operating_hours (pharmacy_id, day_of_week, open_time, close_time)
      VALUES (pharmacy.id, day_num, '07:00:00', '23:00:00')
      ON CONFLICT (pharmacy_id, day_of_week) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
