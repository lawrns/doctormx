-- Migration: Add usage tracking columns to doctor_subscriptions
-- This migration adds columns for tracking feature usage per billing cycle

-- Add usage tracking columns if they don't exist
ALTER TABLE doctor_subscriptions
ADD COLUMN IF NOT EXISTS whatsapp_messages_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS whatsapp_messages_limit INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS ai_copilot_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_copilot_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_analysis_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_analysis_limit INTEGER DEFAULT 0;

-- Update existing rows with appropriate limits based on plan
UPDATE doctor_subscriptions
SET
    whatsapp_messages_limit = CASE
        WHEN plan_id = 'starter' THEN 30
        WHEN plan_id = 'pro' THEN 100
        WHEN plan_id = 'elite' THEN -1
        ELSE 30
    END,
    ai_copilot_limit = CASE
        WHEN plan_id = 'elite' THEN -1
        WHEN plan_id = 'pro' THEN 50
        ELSE 0
    END,
    image_analysis_limit = CASE
        WHEN plan_id = 'elite' THEN 10
        ELSE 0
    END
WHERE status = 'active';

-- Create index for faster usage queries
CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_usage
ON doctor_subscriptions(doctor_id, status, current_period_end);

-- Function to reset monthly usage (called by cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE doctor_subscriptions
    SET
        whatsapp_messages_used = 0,
        ai_copilot_used = 0,
        image_analysis_used = 0,
        updated_at = NOW()
    WHERE status = 'active'
    AND current_period_end < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
