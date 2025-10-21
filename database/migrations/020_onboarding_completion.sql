-- Migration 020: Add onboarding completion fields and indexes
-- This migration adds fields to track doctor onboarding completion and performance indexes

-- Add onboarding completion fields to doctors table
ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "whatsapp": true}'::jsonb,
ADD COLUMN IF NOT EXISTS verification_data JSONB;

-- Create subscription_events table for tracking subscription events
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctor_verifications table for tracking SEP verifications
CREATE TABLE IF NOT EXISTS doctor_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula VARCHAR(20) UNIQUE NOT NULL,
    sep_verified BOOLEAN DEFAULT FALSE,
    verification_data JSONB,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create onboarding_analytics table for tracking conversion funnel
CREATE TABLE IF NOT EXISTS onboarding_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctors_onboarding_completed ON doctors(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_doctors_subscription_status ON doctors(subscription_status);
CREATE INDEX IF NOT EXISTS idx_doctors_verification_status ON doctors(verification_status);
CREATE INDEX IF NOT EXISTS idx_doctors_license_status ON doctors(license_status);
CREATE INDEX IF NOT EXISTS idx_doctors_subscription_plan ON doctors(subscription_plan);

-- Add indexes for subscription events
CREATE INDEX IF NOT EXISTS idx_subscription_events_doctor_id ON subscription_events(doctor_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at);

-- Add indexes for doctor verifications
CREATE INDEX IF NOT EXISTS idx_doctor_verifications_cedula ON doctor_verifications(cedula);
CREATE INDEX IF NOT EXISTS idx_doctor_verifications_sep_verified ON doctor_verifications(sep_verified);
CREATE INDEX IF NOT EXISTS idx_doctor_verifications_verified_at ON doctor_verifications(verified_at);

-- Add indexes for onboarding analytics
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_doctor_id ON onboarding_analytics(doctor_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_event_type ON onboarding_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_created_at ON onboarding_analytics(created_at);

-- Add RLS policies for subscription_events
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own subscription events" ON subscription_events
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Service role can manage all subscription events" ON subscription_events
    FOR ALL USING (auth.role() = 'service_role');

-- Add RLS policies for doctor_verifications
ALTER TABLE doctor_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all doctor verifications" ON doctor_verifications
    FOR ALL USING (auth.role() = 'service_role');

-- Add RLS policies for onboarding_analytics
ALTER TABLE onboarding_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own onboarding analytics" ON onboarding_analytics
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Service role can manage all onboarding analytics" ON onboarding_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_events_updated_at 
    BEFORE UPDATE ON subscription_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_verifications_updated_at 
    BEFORE UPDATE ON doctor_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON COLUMN doctors.onboarding_completed IS 'Whether the doctor has completed the full onboarding process';
COMMENT ON COLUMN doctors.onboarding_completed_at IS 'Timestamp when onboarding was completed';
COMMENT ON COLUMN doctors.subscription_trial_end IS 'When the subscription trial period ends';
COMMENT ON COLUMN doctors.notification_preferences IS 'Doctor notification preferences (email, whatsapp)';
COMMENT ON COLUMN doctors.verification_data IS 'Data from SEP verification process';

COMMENT ON TABLE subscription_events IS 'Tracks subscription-related events for doctors';
COMMENT ON TABLE doctor_verifications IS 'Tracks SEP cédula verifications';
COMMENT ON TABLE onboarding_analytics IS 'Tracks doctor onboarding conversion funnel events';
