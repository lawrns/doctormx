-- =====================================================
-- DOCTORY DATABASE FIX - Telemedicine Platform
-- Run this to fix schema issues and add missing tables
-- =====================================================

-- 1. Create missing tables for telemedicine features

-- Patient Medical History
CREATE TABLE IF NOT EXISTS patient_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    allergies TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    chronic_conditions TEXT[] DEFAULT '{}',
    past_surgeries TEXT[] DEFAULT '{}',
    family_history TEXT[] DEFAULT '{}',
    blood_type TEXT,
    height_cm INTEGER,
    weight_kg NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    channel TEXT NOT NULL,
    subject TEXT,
    content TEXT,
    status TEXT DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Premium Feature Usage Tracking
CREATE TABLE IF NOT EXISTS premium_feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    feature_type TEXT NOT NULL,
    feature_id TEXT,
    usage_count INTEGER DEFAULT 0,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    bundle_id UUID,
    bundle_remaining INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, feature_type, period_start)
);

-- Premium Purchases
CREATE TABLE IF NOT EXISTS premium_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    feature_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price_cents INTEGER NOT NULL,
    total_price_cents INTEGER NOT NULL,
    stripe_payment_id TEXT,
    status TEXT DEFAULT 'pending',
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Premium Billing Records
CREATE TABLE IF NOT EXISTS premium_billing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    billing_type TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    stripe_invoice_id TEXT,
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-up Responses
CREATE TABLE IF NOT EXISTS followup_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    followup_id UUID NOT NULL REFERENCES follow_up_schedules(id) ON DELETE CASCADE,
    response_text TEXT,
    response_choice TEXT,
    sentiment TEXT,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pharmacy Referrals
CREATE TABLE IF NOT EXISTS pharmacy_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pharmacy_id UUID NOT NULL REFERENCES pharmacy_sponsors(id) ON DELETE CASCADE,
    prescription_id UUID,
    referral_code TEXT UNIQUE,
    status TEXT DEFAULT 'pending',
    converted_at TIMESTAMPTZ,
    commission_amount_cents INTEGER,
    paid_to_doctor BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pharmacy Commissions
CREATE TABLE IF NOT EXISTS pharmacy_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES pharmacy_referrals(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    commission_rate NUMERIC(3,2),
    status TEXT DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    stripe_transfer_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor Subscription Usage Tracking (for our tier system)
CREATE TABLE IF NOT EXISTS doctor_subscription_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    whatsapp_messages_used INTEGER DEFAULT 0,
    ai_copilot_used INTEGER DEFAULT 0,
    image_analysis_used INTEGER DEFAULT 0,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(doctor_id, period_start)
);

-- Chat Conversations (for direct messaging)
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add missing columns to existing tables

-- Add medical history columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_medications TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS chronic_conditions TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_provider TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;

-- Add subscription columns to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'starter';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_plan_id TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS whatsapp_messages_used INTEGER DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS whatsapp_messages_limit INTEGER DEFAULT 30;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS ai_copilot_used INTEGER DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS ai_copilot_limit INTEGER DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS image_analysis_used INTEGER DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS image_analysis_limit INTEGER DEFAULT 0;

-- Add premium columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_features JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_expiry TIMESTAMPTZ;

-- 3. Update profile roles to use 'doctor' instead of 'provider'
UPDATE profiles SET role = 'doctor' WHERE role = 'provider';

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_medical_history_patient ON patient_medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_premium_feature_usage_user ON premium_feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_referrals_patient ON pharmacy_referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_referrals_pharmacy ON pharmacy_referrals(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_patient ON chat_conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_doctor ON chat_conversations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_subscription_usage_doctor ON doctor_subscription_usage(doctor_id);

-- 5. Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers for new tables
DROP TRIGGER IF EXISTS update_patient_medical_history_updated_at ON patient_medical_history;
CREATE TRIGGER update_patient_medical_history_updated_at
    BEFORE UPDATE ON patient_medical_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_logs_updated_at ON notification_logs;
CREATE TRIGGER update_notification_logs_updated_at
    BEFORE UPDATE ON notification_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_premium_feature_usage_updated_at ON premium_feature_usage;
CREATE TRIGGER update_premium_feature_usage_updated_at
    BEFORE UPDATE ON premium_feature_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_premium_purchases_updated_at ON premium_purchases;
CREATE TRIGGER update_premium_purchases_updated_at
    BEFORE UPDATE ON premium_purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pharmacy_referrals_updated_at ON pharmacy_referrals;
CREATE TRIGGER update_pharmacy_referrals_updated_at
    BEFORE UPDATE ON pharmacy_referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctor_subscription_usage_updated_at ON doctor_subscription_usage;
CREATE TRIGGER update_doctor_subscription_usage_updated_at
    BEFORE UPDATE ON doctor_subscription_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Add RLS policies for new tables

-- Patient Medical History
ALTER TABLE patient_medical_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own medical history" ON patient_medical_history
    FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Patients can update own medical history" ON patient_medical_history
    FOR UPDATE USING (patient_id = auth.uid());

-- Notification Logs
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notification_logs
    FOR SELECT USING (user_id = auth.uid());

-- Premium Feature Usage
ALTER TABLE premium_feature_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own premium usage" ON premium_feature_usage
    FOR SELECT USING (user_id = auth.uid());

-- Premium Purchases
ALTER TABLE premium_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON premium_purchases
    FOR SELECT USING (user_id = auth.uid());

-- Follow-up Responses
ALTER TABLE followup_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own followup responses" ON followup_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM follow_up_schedules f
            WHERE f.id = followup_id AND f.patient_id = auth.uid()
        )
    );

-- Pharmacy Referrals
ALTER TABLE pharmacy_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own referrals" ON pharmacy_referrals
    FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Doctors can view own referrals" ON pharmacy_referrals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = patient_id AND p.role = 'doctor'
        )
    );

-- Pharmacy Commissions
ALTER TABLE pharmacy_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors can view own commissions" ON pharmacy_commissions
    FOR SELECT USING (doctor_id = auth.uid());

-- Chat Conversations
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON chat_conversations
    FOR SELECT USING (patient_id = auth.uid() OR doctor_id = auth.uid());
CREATE POLICY "Users can update own conversations" ON chat_conversations
    FOR UPDATE USING (patient_id = auth.uid() OR doctor_id = auth.uid());

-- Doctor Subscription Usage
ALTER TABLE doctor_subscription_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors can view own usage" ON doctor_subscription_usage
    FOR SELECT USING (doctor_id = auth.uid());

-- 8. Create doctor subscription tier enum/type
DO $$ BEGIN
    CREATE TYPE doctor_subscription_tier AS ENUM ('starter', 'pro', 'elite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. Update subscription_plans with doctor-specific plans
INSERT INTO subscription_plans (id, name, description, price, currency, interval, features, limits, popular, color, icon)
VALUES 
    ('starter', 'Starter', 'Para doctores que inician', 499.00, 'MXN', 'monthly',
     ARRAY['30 pacientes WhatsApp/mes', 'Perfil básico', 'Búsqueda estándar'],
     '{"whatsapp_limit": 30, "ai_copilot_limit": 0, "image_analysis_limit": 0, "priority_ranking": 1}',
     false, 'from-blue-500 to-indigo-600', '🚀'),
    ('pro', 'Pro', 'Para doctores en crecimiento', 999.00, 'MXN', 'monthly',
     ARRAY['100 pacientes WhatsApp/mes', 'Analytics avanzado', 'Ranking prioritario (+20%)', 'Recordatorios SMS'],
     '{"whatsapp_limit": 100, "ai_copilot_limit": 50, "image_analysis_limit": 0, "priority_ranking": 1.2}',
     true, 'from-purple-500 to-violet-600', '⭐'),
    ('elite', 'Elite', 'Para doctores premium', 1999.00, 'MXN', 'monthly',
     ARRAY['Pacientes WhatsApp ilimitados', 'Clinical Copilot ilimitado', 'Análisis de imagen (10/mes)', 'Listado destacado', 'Badge exclusivo', 'API access'],
     '{"whatsapp_limit": -1, "ai_copilot_limit": -1, "image_analysis_limit": 10, "priority_ranking": 1.5}',
     false, 'from-amber-500 to-orange-600', '👑')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    popular = EXCLUDED.popular,
    color = EXCLUDED.color,
    icon = EXCLUDED.icon;

SELECT 'Database fixed successfully!';


-- =====================================================
-- FIX 7: Update doctor_subscriptions and create usage table
-- Issue: Code expects fields not present in original schema
-- =====================================================

-- Add missing columns for Stripe integration and usage tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctor_subscriptions' 
        AND column_name = 'stripe_subscription_id'
    ) THEN
        ALTER TABLE doctor_subscriptions 
        ADD COLUMN stripe_subscription_id TEXT,
        ADD COLUMN stripe_customer_id TEXT,
        ADD COLUMN plan_id TEXT,
        ADD COLUMN plan_currency TEXT DEFAULT 'MXN',
        ADD COLUMN whatsapp_messages_used INTEGER DEFAULT 0,
        ADD COLUMN whatsapp_messages_limit INTEGER DEFAULT 0,
        ADD COLUMN ai_copilot_used INTEGER DEFAULT 0,
        ADD COLUMN ai_copilot_limit INTEGER DEFAULT 0,
        ADD COLUMN image_analysis_used INTEGER DEFAULT 0,
        ADD COLUMN image_analysis_limit INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added Stripe and usage tracking columns to doctor_subscriptions';
    END IF;
END $$;

-- Create doctor_subscription_usage table
CREATE TABLE IF NOT EXISTS doctor_subscription_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    
    whatsapp_messages_used INTEGER DEFAULT 0,
    whatsapp_messages_limit INTEGER DEFAULT 0,
    ai_copilot_used INTEGER DEFAULT 0,
    ai_copilot_limit INTEGER DEFAULT 0,
    image_analysis_used INTEGER DEFAULT 0,
    image_analysis_limit INTEGER DEFAULT 0,
    
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(doctor_id, period_start)
);

-- Enable RLS
ALTER TABLE doctor_subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Doctors can view their own usage"
    ON doctor_subscription_usage FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY IF NOT EXISTS "Service role can manage usage"
    ON doctor_subscription_usage FOR ALL
    USING (true)
    WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctor_subscription_usage_doctor_id 
    ON doctor_subscription_usage(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_subscription_usage_period 
    ON doctor_subscription_usage(period_start, period_end);

-- Add indexes to doctor_subscriptions if missing
CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_stripe_sub_id 
    ON doctor_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_plan_id 
    ON doctor_subscriptions(plan_id);
