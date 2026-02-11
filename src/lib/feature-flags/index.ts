// Feature Flags Service
// Input: User context, flag key
// Process: Check flag status from DB with fallback to defaults
// Output: Boolean indicating if feature is enabled

import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { FEATURE_FLAGS, type FeatureFlagKey } from './flags'

export { FEATURE_FLAGS, type FeatureFlagKey } from './flags'

interface FlagContext {
  userId?: string
  subscriptionTier?: string
  doctorId?: string
}

interface FlagOverride {
  key: string
  enabled: boolean
  rollout_percentage: number
  allowed_user_ids: string[] | null
  allowed_subscription_tiers: string[] | null
  updated_at: string
}

// Cache for flag overrides (refreshed every 60 seconds)
let flagCache: Map<string, FlagOverride> = new Map()
let cacheTimestamp = 0
const CACHE_TTL_MS = 60_000

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
  } catch (err) {
    logger.error('Unexpected error loading feature flags', { error: (err as Error).message }, err as Error)
  }
}

/**
 * Check if a feature flag is enabled for a given context
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

  // If completely disabled, return false
  if (!enabled) {
    return false
  }

  // Check user allowlist
  if (allowedUserIds?.length && context.userId) {
    if (allowedUserIds.includes(context.userId)) {
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
    return bucket < rolloutPercentage
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

