-- Migration 027: MVP Audit Improvements
-- Implements: Image-in-chat, Doctor subscriptions, Enhanced consults

-- ============================================================================
-- 1. PLANS & SUBSCRIPTIONS (Doctor Monetization)
-- ============================================================================

CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_mxn NUMERIC(10,2) NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed doctor discovery plan
INSERT INTO plans (code, title, description, price_mxn, interval, features) VALUES
('DOC_DISCOVERY_M', 'Descubrimiento Mensual', 'Aparece en el directorio cuando los pacientes te buscan', 499.00, 'month', 
  '["Perfil visible en directorio", "Análisis básico", "Soporte por email", "Consultas ilimitadas", "15% comisión plataforma"]'::jsonb),
('DOC_PRO_M', 'Profesional Mensual', 'Plan profesional con herramientas avanzadas', 499.00, 'month',
  '["Perfil visible en directorio", "Análisis avanzado", "Soporte prioritario", "Consultas ilimitadas", "10% comisión plataforma", "Herramientas de marketing"]'::jsonb),
('DOC_PREMIUM_M', 'Premium Mensual', 'Plan premium con gerente dedicado', 799.00, 'month',
  '["Perfil visible en directorio", "Suite completa de análisis", "Gerente de cuenta dedicado", "Consultas ilimitadas", "8% comisión plataforma", "Impulso SEO y marketing", "Acceso anticipado"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_sub_id TEXT UNIQUE,
  provider_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_doctor_id ON subscriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub_id ON subscriptions(provider_sub_id);

-- Add subscription tracking to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'signup';

-- Function to check if doctor is listable
CREATE OR REPLACE FUNCTION is_doctor_listable(doctor_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM doctors d
    WHERE d.id = doctor_id_param
      AND d.verified = true
      AND d.license_status = 'verified'
      AND EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.doctor_id = d.id
          AND s.status = 'active'
          AND s.current_period_end > NOW()
      )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. CONSULTS & MESSAGES (Enhanced Chat with Images)
-- ============================================================================

CREATE TABLE IF NOT EXISTS consults (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  care_level TEXT CHECK (care_level IN ('ER', 'URGENT', 'PRIMARY', 'SELFCARE')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'active', 'resolved', 'abandoned', 'er_redirect')),
  severity INTEGER CHECK (severity BETWEEN 1 AND 10),
  chief_complaint TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_consults_user_id ON consults(user_id);
CREATE INDEX IF NOT EXISTS idx_consults_status ON consults(status);
CREATE INDEX IF NOT EXISTS idx_consults_care_level ON consults(care_level);
CREATE INDEX IF NOT EXISTS idx_consults_created_at ON consults(created_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  consult_id BIGINT NOT NULL REFERENCES consults(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_consult_id ON messages(consult_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE TABLE IF NOT EXISTS message_images (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'consult-images',
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  sha256 TEXT,
  vision_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_images_message_id ON message_images(message_id);
CREATE INDEX IF NOT EXISTS idx_message_images_sha256 ON message_images(sha256);

-- ============================================================================
-- 3. RED FLAGS & SAFETY
-- ============================================================================

CREATE TABLE IF NOT EXISTS red_flags_detected (
  id BIGSERIAL PRIMARY KEY,
  consult_id BIGINT NOT NULL REFERENCES consults(id) ON DELETE CASCADE,
  message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL,
  flag_text TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  action_taken TEXT,
  admin_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_red_flags_consult_id ON red_flags_detected(consult_id);
CREATE INDEX IF NOT EXISTS idx_red_flags_severity ON red_flags_detected(severity);
CREATE INDEX IF NOT EXISTS idx_red_flags_created_at ON red_flags_detected(created_at DESC);

-- ============================================================================
-- 4. PATIENT PAYMENTS & QUESTIONS
-- ============================================================================

-- Add tracking for free questions
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_questions_remaining INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_questions_purchased INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'active', 'past_due', 'canceled'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS patient_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'subscription', 'refund')),
  product_type TEXT CHECK (product_type IN ('single_consult', 'question_pack', 'monthly_unlimited', 'annual_unlimited')),
  amount_mxn NUMERIC(10,2) NOT NULL,
  questions_added INTEGER DEFAULT 0,
  provider TEXT DEFAULT 'stripe',
  provider_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_transactions_user_id ON patient_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_transactions_status ON patient_transactions(status);
CREATE INDEX IF NOT EXISTS idx_patient_transactions_created_at ON patient_transactions(created_at DESC);

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE consults ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_transactions ENABLE ROW LEVEL SECURITY;

-- Consults: Users can only see their own
CREATE POLICY consults_user_select ON consults
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY consults_user_insert ON consults
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY consults_user_update ON consults
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: Users can only see messages in their consults
CREATE POLICY messages_user_select ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM consults c
      WHERE c.id = messages.consult_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY messages_user_insert ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM consults c
      WHERE c.id = messages.consult_id
        AND c.user_id = auth.uid()
    )
  );

-- Message images: Users can only see images in their messages
CREATE POLICY message_images_user_select ON message_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN consults c ON c.id = m.consult_id
      WHERE m.id = message_images.message_id
        AND c.user_id = auth.uid()
    )
  );

-- Subscriptions: Doctors can see their own
CREATE POLICY subscriptions_doctor_select ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = subscriptions.doctor_id
        AND d.user_id = auth.uid()
    )
  );

-- Patient transactions: Users can see their own
CREATE POLICY patient_transactions_user_select ON patient_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to decrement free questions
CREATE OR REPLACE FUNCTION decrement_free_questions(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  remaining INTEGER;
BEGIN
  UPDATE users
  SET free_questions_remaining = GREATEST(0, free_questions_remaining - 1)
  WHERE id = user_id_param
  RETURNING free_questions_remaining INTO remaining;
  
  RETURN remaining;
END;
$$ LANGUAGE plpgsql;

-- Function to add questions to user balance
CREATE OR REPLACE FUNCTION add_questions_to_user(user_id_param UUID, questions_to_add INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE users
  SET 
    free_questions_remaining = free_questions_remaining + questions_to_add,
    total_questions_purchased = total_questions_purchased + questions_to_add
  WHERE id = user_id_param
  RETURNING free_questions_remaining INTO new_balance;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consults_updated_at BEFORE UPDATE ON consults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE plans IS 'Doctor subscription plans';
COMMENT ON TABLE subscriptions IS 'Active doctor subscriptions for directory visibility';
COMMENT ON TABLE consults IS 'Patient AI consultations with triage and care level';
COMMENT ON TABLE messages IS 'Messages within a consultation (user, assistant, system)';
COMMENT ON TABLE message_images IS 'Images uploaded during consultations for AI vision analysis';
COMMENT ON TABLE red_flags_detected IS 'Emergency red flags detected in patient messages';
COMMENT ON TABLE patient_transactions IS 'Patient purchases and subscription payments';
