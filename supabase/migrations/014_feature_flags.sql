-- ================================================
-- FEATURE FLAGS TABLE
-- Migration: 014_feature_flags.sql
-- Purpose: Enable controlled feature rollouts
-- ================================================

-- UP Migration

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  allowed_user_ids TEXT[] DEFAULT NULL,
  allowed_subscription_tiers TEXT[] DEFAULT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled) WHERE enabled = true;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_feature_flags_timestamp ON feature_flags;
CREATE TRIGGER update_feature_flags_timestamp
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage flags, but service role can read
CREATE POLICY "Service role can read feature flags"
  ON feature_flags FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default flags
INSERT INTO feature_flags (key, description, enabled, rollout_percentage, allowed_subscription_tiers)
VALUES
  ('second_opinion_enabled', 'Enable second opinion request and review flow', false, 0, ARRAY['pro', 'elite']),
  ('doctor_referrals_enabled', 'Enable doctor-to-doctor referral network', false, 0, ARRAY['pro', 'elite']),
  ('ai_soap_notes_enabled', 'Enable AI-generated SOAP notes from voice/transcripts', false, 0, ARRAY['pro', 'elite']),
  ('directory_claim_flow_enabled', 'Enable unclaimed doctor profile claiming', true, 100, NULL),
  ('programmatic_seo_enabled', 'Enable programmatic SEO directory pages', true, 100, NULL),
  ('whatsapp_bot_v2_enabled', 'Enable WhatsApp bot v2 with AI triage', false, 0, NULL),
  ('subscription_tier_specialist_enabled', 'Enable Specialist subscription tier (1499 MXN)', false, 0, NULL),
  ('subscription_tier_clinic_enabled', 'Enable Clinic subscription tier (2999 MXN)', false, 0, NULL)
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

-- Feature flag audit log
CREATE TABLE IF NOT EXISTS feature_flag_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT NOT NULL,
  action TEXT NOT NULL, -- 'enabled', 'disabled', 'rollout_changed', 'config_changed'
  old_value JSONB,
  new_value JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flag_audit_key ON feature_flag_audit(flag_key, changed_at DESC);

-- Trigger to log flag changes
CREATE OR REPLACE FUNCTION log_feature_flag_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO feature_flag_audit (flag_key, action, old_value, new_value, changed_by)
  VALUES (
    NEW.key,
    CASE
      WHEN OLD.enabled != NEW.enabled THEN
        CASE WHEN NEW.enabled THEN 'enabled' ELSE 'disabled' END
      WHEN OLD.rollout_percentage != NEW.rollout_percentage THEN 'rollout_changed'
      ELSE 'config_changed'
    END,
    jsonb_build_object(
      'enabled', OLD.enabled,
      'rollout_percentage', OLD.rollout_percentage,
      'allowed_user_ids', OLD.allowed_user_ids,
      'allowed_subscription_tiers', OLD.allowed_subscription_tiers
    ),
    jsonb_build_object(
      'enabled', NEW.enabled,
      'rollout_percentage', NEW.rollout_percentage,
      'allowed_user_ids', NEW.allowed_user_ids,
      'allowed_subscription_tiers', NEW.allowed_subscription_tiers
    ),
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_feature_flag_changes ON feature_flags;
CREATE TRIGGER log_feature_flag_changes
  AFTER UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION log_feature_flag_change();

-- ================================================
-- DOWN Migration (for rollback)
-- Run these commands to rollback:
-- 
-- DROP TRIGGER IF EXISTS log_feature_flag_changes ON feature_flags;
-- DROP FUNCTION IF EXISTS log_feature_flag_change();
-- DROP TABLE IF EXISTS feature_flag_audit;
-- DROP TRIGGER IF EXISTS update_feature_flags_timestamp ON feature_flags;
-- DROP FUNCTION IF EXISTS update_feature_flags_updated_at();
-- DROP TABLE IF EXISTS feature_flags;
-- ================================================
