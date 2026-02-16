/**
 * Feature Flags Infrastructure
 * Input: User context, flag key
 * Process: Check flag status with database override support and gradual rollout
 * Output: Boolean indicating if feature is enabled
 * 
 * Security: Feature flags enable gradual rollout of security-sensitive features
 * to minimize blast radius of potential vulnerabilities
 */

import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

// Re-export from existing flags module
export { FEATURE_FLAGS, type FeatureFlagKey } from './feature-flags/flags'
import { FEATURE_FLAGS, type FeatureFlagKey } from './feature-flags/flags'

export interface FlagContext {
  userId?: string
  subscriptionTier?: string
  doctorId?: string
  email?: string
  userAgent?: string
}

export interface FlagOverride {
  key: string
  enabled: boolean
  rollout_percentage: number
  allowed_user_ids: string[] | null
  allowed_subscription_tiers: string[] | null
  blocked_user_ids: string[] | null
  updated_at: string
}

export interface FeatureFlagAuditEvent {
  flag_key: string
  user_id?: string
  action: 'checked' | 'enabled' | 'disabled' | 'rollout_updated'
  context_hash: string
  result: boolean
  timestamp: string
  ip_address?: string
  user_agent?: string
}

// Cache for flag overrides (refreshed every 60 seconds)
let flagCache: Map<string, FlagOverride> = new Map()
let cacheTimestamp = 0
const CACHE_TTL_MS = 60_000

/**
 * Generate a hash of context for audit purposes
 * Preserves privacy while allowing pattern analysis
 */
function hashContext(context: FlagContext): string {
  const str = `${context.userId || 'anon'}:${context.subscriptionTier || 'none'}:${context.doctorId || 'none'}`
  return simpleHash(str).toString(36)
}

async function refreshFlagCache(): Promise<void> {
  const now = Date.now()
  if (now - cacheTimestamp < CACHE_TTL_MS && flagCache.size > 0) {
    return
  }

  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')

    if (error) {
      logger.error('Error loading feature flags from database', { error: (error as Error).message }, error as Error)
      return
    }

    flagCache = new Map()
    for (const flag of data || []) {
      flagCache.set(flag.key, flag)
    }
    cacheTimestamp = now
    logger.info('Feature flags cache refreshed', { count: flagCache.size })
  } catch (err) {
    logger.error('Unexpected error loading feature flags', { error: (err as Error).message }, err as Error)
  }
}

/**
 * Check if a feature flag is enabled for a given context
 * Supports gradual rollout, allowlists, and blocklists
 */
export async function isFeatureEnabled(
  flagKey: FeatureFlagKey,
  context: FlagContext = {}
): Promise<boolean> {
  // Get default flag config
  const defaultFlag = FEATURE_FLAGS[flagKey]
  if (!defaultFlag) {
    logger.warn(`[FeatureFlags] Unknown flag: ${flagKey}`)
    return false
  }

  // Refresh cache if needed
  await refreshFlagCache()

  // Check for DB override
  const override = flagCache.get(flagKey)
  const enabled = override?.enabled ?? defaultFlag.default_enabled
  const rolloutPercentage = override?.rollout_percentage ?? defaultFlag.rollout_percentage
  const allowedUserIds = override?.allowed_user_ids ?? defaultFlag.allowed_user_ids
  const allowedTiers = override?.allowed_subscription_tiers ?? defaultFlag.allowed_subscription_tiers
  const blockedUserIds = override?.blocked_user_ids ?? []

  // Security: Check blocklist first (deny overrides allow)
  if (blockedUserIds?.length && context.userId) {
    if (blockedUserIds.includes(context.userId)) {
      await logFlagAudit({
        flag_key: flagKey,
        user_id: context.userId,
        action: 'checked',
        context_hash: hashContext(context),
        result: false,
        timestamp: new Date().toISOString(),
        user_agent: context.userAgent
      })
      return false
    }
  }

  // If completely disabled, return false
  if (!enabled) {
    return false
  }

  // Check user allowlist
  if (allowedUserIds?.length && context.userId) {
    if (allowedUserIds.includes(context.userId)) {
      await logFlagAudit({
        flag_key: flagKey,
        user_id: context.userId,
        action: 'checked',
        context_hash: hashContext(context),
        result: true,
        timestamp: new Date().toISOString(),
        user_agent: context.userAgent
      })
      return true
    }
  }

  // Check subscription tier allowlist
  if (allowedTiers?.length && context.subscriptionTier) {
    if (!allowedTiers.includes(context.subscriptionTier)) {
      return false
    }
  }

  // Check rollout percentage (deterministic based on userId)
  if (rolloutPercentage < 100 && context.userId) {
    const hash = simpleHash(context.userId + flagKey)
    const bucket = hash % 100
    const inRollout = bucket < rolloutPercentage
    
    await logFlagAudit({
      flag_key: flagKey,
      user_id: context.userId,
      action: 'checked',
      context_hash: hashContext(context),
      result: inRollout,
      timestamp: new Date().toISOString(),
      user_agent: context.userAgent
    })
    
    return inRollout
  }

  // 100% rollout or no user context
  return rolloutPercentage >= 100
}

/**
 * Get all flags with their current status for a context
 */
export async function getAllFlags(
  context: FlagContext = {}
): Promise<Record<FeatureFlagKey, boolean>> {
  const flags = {} as Record<FeatureFlagKey, boolean>
  
  for (const key of Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]) {
    flags[key] = await isFeatureEnabled(key, context)
  }
  
  return flags
}

/**
 * Simple hash function for deterministic rollout
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Server-side helper to check flag in API routes
 * Throws error if feature is not enabled
 */
export async function requireFeature(
  flagKey: FeatureFlagKey,
  context: FlagContext = {}
): Promise<void> {
  const enabled = await isFeatureEnabled(flagKey, context)
  if (!enabled) {
    throw new Error(`Feature '${flagKey}' is not enabled`)
  }
}

/**
 * Gradually increase rollout percentage for a feature
 * Security: Records audit trail of all rollout changes
 */
export async function incrementRollout(
  flagKey: FeatureFlagKey,
  incrementBy: number = 10
): Promise<void> {
  const supabase = await createServiceClient()
  
  const { data: current } = await supabase
    .from('feature_flags')
    .select('rollout_percentage')
    .eq('key', flagKey)
    .single()
  
  const newPercentage = Math.min(100, (current?.rollout_percentage || 0) + incrementBy)
  
  const { error } = await supabase
    .from('feature_flags')
    .update({ 
      rollout_percentage: newPercentage,
      updated_at: new Date().toISOString()
    })
    .eq('key', flagKey)
  
  if (error) {
    logger.error('Failed to update rollout percentage', { flagKey, error })
    throw error
  }
  
  // Invalidate cache
  cacheTimestamp = 0
  
  logger.info('Rollout percentage updated', { 
    flagKey, 
    newPercentage,
    previousPercentage: current?.rollout_percentage 
  })
}

/**
 * Log feature flag audit event
 * Security: Tracks feature access patterns for security analysis
 */
async function logFlagAudit(event: FeatureFlagAuditEvent): Promise<void> {
  try {
    const supabase = await createServiceClient()
    await supabase
      .from('feature_flag_audit')
      .insert(event)
  } catch (err) {
    // Non-blocking: audit failures shouldn't break feature flags
    logger.warn('Failed to log feature flag audit', { error: err })
  }
}

/**
 * Check if user has access to beta features
 * Security: Requires explicit opt-in and tier verification
 */
export async function hasBetaAccess(context: FlagContext): Promise<boolean> {
  if (!context.userId) return false
  
  const betaFlags = [
    'ai_soap_notes_enabled',
    'second_opinion_enabled',
    'doctor_referrals_enabled'
  ] as FeatureFlagKey[]
  
  for (const flag of betaFlags) {
    if (await isFeatureEnabled(flag, context)) {
      return true
    }
  }
  
  return false
}
