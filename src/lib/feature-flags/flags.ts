// Feature Flag Definitions
// Input: Flag key
// Process: Define available flags with defaults
// Output: Type-safe flag configuration

export type FeatureFlagKey =
  | 'second_opinion_enabled'
  | 'doctor_referrals_enabled'
  | 'ai_soap_notes_enabled'
  | 'directory_claim_flow_enabled'
  | 'programmatic_seo_enabled'
  | 'whatsapp_bot_v2_enabled'
  | 'subscription_tier_specialist_enabled'
  | 'subscription_tier_clinic_enabled'

export interface FeatureFlag {
  key: FeatureFlagKey
  description: string
  default_enabled: boolean
  rollout_percentage: number
  allowed_user_ids?: string[]
  allowed_subscription_tiers?: string[]
}

export const FEATURE_FLAGS: Record<FeatureFlagKey, FeatureFlag> = {
  second_opinion_enabled: {
    key: 'second_opinion_enabled',
    description: 'Enable second opinion request and review flow',
    default_enabled: false,
    rollout_percentage: 0,
    allowed_subscription_tiers: ['pro', 'elite'],
  },
  doctor_referrals_enabled: {
    key: 'doctor_referrals_enabled',
    description: 'Enable doctor-to-doctor referral network',
    default_enabled: false,
    rollout_percentage: 0,
    allowed_subscription_tiers: ['pro', 'elite'],
  },
  ai_soap_notes_enabled: {
    key: 'ai_soap_notes_enabled',
    description: 'Enable AI-generated SOAP notes from voice/transcripts',
    default_enabled: false,
    rollout_percentage: 0,
    allowed_subscription_tiers: ['pro', 'elite'],
  },
  directory_claim_flow_enabled: {
    key: 'directory_claim_flow_enabled',
    description: 'Enable unclaimed doctor profile claiming',
    default_enabled: true,
    rollout_percentage: 100,
  },
  programmatic_seo_enabled: {
    key: 'programmatic_seo_enabled',
    description: 'Enable programmatic SEO directory pages',
    default_enabled: true,
    rollout_percentage: 100,
  },
  whatsapp_bot_v2_enabled: {
    key: 'whatsapp_bot_v2_enabled',
    description: 'Enable WhatsApp bot v2 with AI triage',
    default_enabled: false,
    rollout_percentage: 0,
  },
  subscription_tier_specialist_enabled: {
    key: 'subscription_tier_specialist_enabled',
    description: 'Enable Specialist subscription tier (1499 MXN)',
    default_enabled: false,
    rollout_percentage: 0,
  },
  subscription_tier_clinic_enabled: {
    key: 'subscription_tier_clinic_enabled',
    description: 'Enable Clinic subscription tier (2999 MXN)',
    default_enabled: false,
    rollout_percentage: 0,
  },
}

export const DEFAULT_FLAGS = FEATURE_FLAGS

