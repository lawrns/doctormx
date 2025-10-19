-- Doctor subscription system migration

-- Add subscription tracking columns to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS failed_payment_count INTEGER DEFAULT 0;

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS doctor_subscription_events_doctor_id_idx ON doctor_subscription_events(doctor_id);
CREATE INDEX IF NOT EXISTS doctor_subscription_events_event_type_idx ON doctor_subscription_events(event_type);
CREATE INDEX IF NOT EXISTS doctor_subscription_events_created_at_idx ON doctor_subscription_events(created_at);

-- Enable RLS
ALTER TABLE doctor_subscription_events ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DROP POLICY IF EXISTS "Doctors can view their own subscription events" ON doctor_subscription_events;
DROP POLICY IF EXISTS "Service role can manage all subscription events" ON doctor_subscription_events;

CREATE POLICY "Doctors can view their own subscription events" ON doctor_subscription_events
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage all subscription events" ON doctor_subscription_events
  FOR ALL USING (auth.role() = 'service_role');

-- Create doctor_subscriptions table for detailed subscription management
CREATE TABLE IF NOT EXISTS doctor_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255),
  conekta_subscription_id VARCHAR(255),
  plan_id VARCHAR(100) DEFAULT 'professional',
  plan_name VARCHAR(100) DEFAULT 'Professional',
  status VARCHAR(50) DEFAULT 'inactive',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  amount INTEGER DEFAULT 49900, -- $499 MXN in cents
  currency VARCHAR(3) DEFAULT 'MXN',
  payment_method VARCHAR(50),
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS doctor_subscriptions_doctor_id_idx ON doctor_subscriptions(doctor_id);
CREATE INDEX IF NOT EXISTS doctor_subscriptions_status_idx ON doctor_subscriptions(status);
CREATE INDEX IF NOT EXISTS doctor_subscriptions_stripe_id_idx ON doctor_subscriptions(stripe_subscription_id);

-- Enable RLS
ALTER TABLE doctor_subscriptions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DROP POLICY IF EXISTS "Doctors can view their own subscription" ON doctor_subscriptions;
DROP POLICY IF EXISTS "Doctors can update their own subscription" ON doctor_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON doctor_subscriptions;

CREATE POLICY "Doctors can view their own subscription" ON doctor_subscriptions
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own subscription" ON doctor_subscriptions
  FOR UPDATE USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage all subscriptions" ON doctor_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

