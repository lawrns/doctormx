-- Doctor subscription system migration
-- Add subscription tracking columns to doctors table

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS failed_payment_count INTEGER DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50);

-- Create doctor_subscription_events table for audit trail
CREATE TABLE IF NOT EXISTS doctor_subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(user_id),
  event_type VARCHAR(100) NOT NULL,
  subscription_id VARCHAR(255),
  amount INTEGER,
  currency VARCHAR(3),
  status VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create doctor_subscriptions table for subscription management
CREATE TABLE IF NOT EXISTS doctor_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(user_id),
  subscription_id VARCHAR(255) UNIQUE NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctors_subscription_status ON doctors(subscription_status);
CREATE INDEX IF NOT EXISTS idx_doctors_subscription_id ON doctors(subscription_id);
CREATE INDEX IF NOT EXISTS idx_doctor_subscription_events_doctor_id ON doctor_subscription_events(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_subscription_events_created_at ON doctor_subscription_events(created_at);
CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_doctor_id ON doctor_subscriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_status ON doctor_subscriptions(status);

-- Enable Row Level Security
ALTER TABLE doctor_subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctor_subscription_events
CREATE POLICY IF NOT EXISTS "Doctors can view their own subscription events" ON doctor_subscription_events
  FOR SELECT USING (
    doctor_id IN (
      SELECT user_id FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "System can insert subscription events" ON doctor_subscription_events
  FOR INSERT WITH CHECK (true);

-- RLS Policies for doctor_subscriptions
CREATE POLICY IF NOT EXISTS "Doctors can view their own subscriptions" ON doctor_subscriptions
  FOR SELECT USING (
    doctor_id IN (
      SELECT user_id FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "System can manage subscriptions" ON doctor_subscriptions
  FOR ALL USING (true);

-- Add constraints
ALTER TABLE doctors ADD CONSTRAINT IF NOT EXISTS chk_subscription_status 
  CHECK (subscription_status IN ('inactive', 'active', 'payment_failed', 'suspended', 'canceling', 'canceled'));

ALTER TABLE doctors ADD CONSTRAINT IF NOT EXISTS chk_payment_provider 
  CHECK (payment_provider IN ('stripe', 'conekta', 'oxxo', 'spei'));

ALTER TABLE doctors ADD CONSTRAINT IF NOT EXISTS chk_subscription_plan 
  CHECK (subscription_plan IN ('monthly', 'yearly'));

-- Add comments for documentation
COMMENT ON COLUMN doctors.subscription_status IS 'Current subscription status: inactive, active, payment_failed, suspended, canceling, canceled';
COMMENT ON COLUMN doctors.subscription_id IS 'Stripe subscription ID for tracking';
COMMENT ON COLUMN doctors.payment_provider IS 'Payment provider used: stripe, conekta, oxxo, spei';
COMMENT ON COLUMN doctors.failed_payment_count IS 'Number of consecutive failed payments';
COMMENT ON COLUMN doctors.subscription_plan IS 'Subscription plan type: monthly or yearly';

COMMENT ON TABLE doctor_subscription_events IS 'Audit trail for all subscription-related events';
COMMENT ON TABLE doctor_subscriptions IS 'Detailed subscription management data';