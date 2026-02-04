-- ================================================
-- FIX: Update doctor_subscriptions schema and create usage table
-- Issue: Code expects fields not present in original migration
-- ================================================

-- First, check if doctor_subscriptions exists and has the right columns
DO $$
BEGIN
    -- Check if stripe_subscription_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctor_subscriptions' 
        AND column_name = 'stripe_subscription_id'
    ) THEN
        -- Add missing columns for Stripe integration
        ALTER TABLE doctor_subscriptions 
        ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
        ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
        ADD COLUMN IF NOT EXISTS plan_id TEXT,
        ADD COLUMN IF NOT EXISTS plan_currency TEXT DEFAULT 'MXN',
        ADD COLUMN IF NOT EXISTS whatsapp_messages_used INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS whatsapp_messages_limit INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS ai_copilot_used INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS ai_copilot_limit INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS image_analysis_used INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS image_analysis_limit INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added missing columns to doctor_subscriptions';
    ELSE
        RAISE NOTICE 'doctor_subscriptions already has Stripe columns';
    END IF;
END $$;

-- Create doctor_subscription_usage table if not exists
CREATE TABLE IF NOT EXISTS doctor_subscription_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    
    -- Usage tracking for current period
    whatsapp_messages_used INTEGER DEFAULT 0,
    whatsapp_messages_limit INTEGER DEFAULT 0,
    ai_copilot_used INTEGER DEFAULT 0,
    ai_copilot_limit INTEGER DEFAULT 0,
    image_analysis_used INTEGER DEFAULT 0,
    image_analysis_limit INTEGER DEFAULT 0,
    
    -- Period tracking
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one record per doctor per period
    UNIQUE(doctor_id, period_start)
);

-- Enable RLS on usage table
ALTER TABLE doctor_subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for doctor_subscription_usage
CREATE POLICY "Doctors can view their own usage"
    ON doctor_subscription_usage FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage usage"
    ON doctor_subscription_usage FOR ALL
    USING (true)
    WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctor_subscription_usage_doctor_id 
    ON doctor_subscription_usage(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_subscription_usage_period 
    ON doctor_subscription_usage(period_start, period_end);

-- Create indexes for doctor_subscriptions if they don't exist
CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_doctor_id 
    ON doctor_subscriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_stripe_sub_id 
    ON doctor_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_status 
    ON doctor_subscriptions(status);

-- Function to reset usage at period end
CREATE OR REPLACE FUNCTION reset_doctor_subscription_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Reset usage counters when period ends
    UPDATE doctor_subscriptions
    SET whatsapp_messages_used = 0,
        ai_copilot_used = 0,
        image_analysis_used = 0,
        updated_at = NOW()
    WHERE current_period_end < NOW()
    AND status = 'active';
    
    -- Archive old usage to history table (optional, can be added later)
END;
$$;

-- Grant necessary permissions
GRANT ALL ON doctor_subscription_usage TO service_role;
GRANT SELECT ON doctor_subscription_usage TO authenticated;

-- Add helpful comment
COMMENT ON TABLE doctor_subscription_usage IS 'Tracks real-time usage of subscription features per billing period';
