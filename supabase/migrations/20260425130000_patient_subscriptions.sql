-- Migration: Patient Subscription System
-- Patients can subscribe to monthly plans for bundled consultations

CREATE TABLE IF NOT EXISTS patient_subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  interval TEXT NOT NULL DEFAULT 'month' CHECK (interval IN ('month', 'year')),
  consultations_per_month INTEGER,
  features JSONB DEFAULT '[]',
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  plan_id TEXT NOT NULL REFERENCES patient_subscription_plans(id),
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'expired')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  consultations_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(patient_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_subscriptions_patient ON patient_subscriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_subscriptions_status ON patient_subscriptions(status);

-- Seed patient subscription plans
INSERT INTO patient_subscription_plans (id, name, description, price_cents, interval, consultations_per_month, features) VALUES
  ('cuidado-continuo', 'Cuidado Continuo', 'Hasta 4 consultas al mes con medicos verificados', 29900, 'month', 4, '["4 consultas al mes", "Historial medico digital", "Recetas electronicas", "Chat con Dr. Simeon"]'),
  ('familia', 'Familia', 'Perfiles familiares + consultas + segunda opinion', 59900, 'month', 8, '["8 consultas al mes (compartidas)", "Hasta 5 perfiles familiares", "Segunda opinion incluida", "Historial medico digital", "Recetas electronicas", "Chat con Dr. Simeon prioritario"]')
ON CONFLICT (id) DO NOTHING;

-- RLS for patient subscription tables
ALTER TABLE patient_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active plans"
  ON patient_subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Patients can view their own subscription"
  ON patient_subscriptions FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Service role can manage all subscriptions"
  ON patient_subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);
