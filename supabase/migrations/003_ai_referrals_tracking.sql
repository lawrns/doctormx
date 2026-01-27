-- Migration: AI Referrals Tracking
-- Description: Add consultation_id tracking to appointments for AI→Doctor conversion analytics
-- Date: 2026-01-26
-- Author: Phase 3 UX Upgrade

-- Add consultation_id column to appointments table
-- This links appointments created from AI consultations back to the original consultation
ALTER TABLE appointments
ADD COLUMN consultation_id UUID REFERENCES soap_consultations(id) ON DELETE SET NULL;

-- Add ai_referral boolean flag for quick filtering/analytics
-- This is redundant with consultation_id but useful for performance
ALTER TABLE appointments
ADD COLUMN ai_referral BOOLEAN DEFAULT FALSE;

-- Create index for fast lookups of AI-referred appointments
CREATE INDEX idx_appointments_consultation_id ON appointments(consultation_id)
WHERE consultation_id IS NOT NULL;

CREATE INDEX idx_appointments_ai_referral ON appointments(ai_referral)
WHERE ai_referral = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN appointments.consultation_id IS 'Links to the AI consultation that referred this appointment (Warm Introduction flow)';
COMMENT ON COLUMN appointments.ai_referral IS 'Quick flag indicating this appointment came from AI consultation referral';

-- Create materialized view for AI conversion analytics
CREATE MATERIALIZED VIEW ai_conversion_analytics AS
SELECT
  DATE_TRUNC('day', sc.created_at) as consultation_date,
  COUNT(DISTINCT sc.id) as total_consultations,
  COUNT(DISTINCT a.id) FILTER (WHERE a.consultation_id IS NOT NULL) as referral_bookings,
  COUNT(DISTINCT a.id) FILTER (WHERE a.consultation_id IS NOT NULL AND a.status = 'completed') as completed_bookings,
  ROUND(
    (COUNT(DISTINCT a.id) FILTER (WHERE a.consultation_id IS NOT NULL)::decimal /
     NULLIF(COUNT(DISTINCT sc.id), 0)) * 100,
    2
  ) as conversion_rate_pct,
  SUM(d.price_cents) FILTER (WHERE a.consultation_id IS NOT NULL AND a.status = 'completed') as revenue_cents
FROM soap_consultations sc
LEFT JOIN appointments a ON sc.id = a.consultation_id
LEFT JOIN doctors d ON a.doctor_id = d.id
WHERE sc.status = 'complete'
GROUP BY DATE_TRUNC('day', sc.created_at)
ORDER BY consultation_date DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_ai_conversion_analytics_date ON ai_conversion_analytics(consultation_date);

-- Add comment
COMMENT ON MATERIALIZED VIEW ai_conversion_analytics IS 'Daily AI consultation → doctor booking conversion metrics. Refresh with REFRESH MATERIALIZED VIEW CONCURRENTLY ai_conversion_analytics;';

-- Grant permissions (adjust based on your RLS setup)
-- Assuming standard Supabase roles: anon, authenticated, service_role
GRANT SELECT ON ai_conversion_analytics TO authenticated;
GRANT ALL ON ai_conversion_analytics TO service_role;

-- Refresh function (can be called daily via cron)
CREATE OR REPLACE FUNCTION refresh_ai_conversion_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ai_conversion_analytics;
END;
$$;

COMMENT ON FUNCTION refresh_ai_conversion_analytics() IS 'Refreshes the AI conversion analytics materialized view. Should be called daily.';

-- Optional: Create a trigger to auto-set ai_referral flag when consultation_id is set
CREATE OR REPLACE FUNCTION set_ai_referral_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.consultation_id IS NOT NULL AND NEW.ai_referral = FALSE THEN
    NEW.ai_referral = TRUE;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_ai_referral_flag
BEFORE INSERT OR UPDATE OF consultation_id ON appointments
FOR EACH ROW
EXECUTE FUNCTION set_ai_referral_flag();

COMMENT ON TRIGGER trigger_set_ai_referral_flag ON appointments IS 'Automatically sets ai_referral=true when consultation_id is not null';

-- Backfill existing appointments if needed (optional - only if data already exists)
-- UPDATE appointments SET ai_referral = TRUE WHERE consultation_id IS NOT NULL AND ai_referral = FALSE;
