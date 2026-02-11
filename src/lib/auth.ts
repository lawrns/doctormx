// ============================================================================
// ENHANCED RBAC AUTHENTICATION SYSTEM
// ============================================================================
// This module provides backward-compatible re-exports of the enhanced
// authentication functions from middleware/auth.ts, maintaining the old API
// while leveraging the new enhanced error handling and type safety.
//
// Migration Guide:
// - Old API: requireAuth() → { user, supabase }
// - New API: requireAuth() → { user, profile, session }
// - Old API: requireRole(role) → { user, profile, supabase }
// - New API: requireAuth([role]) → { user, profile, session }
//
// The old API is maintained for backward compatibility. New code should use
// the enhanced versions from @/lib/middleware/auth.ts directly.
// ============================================================================

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

// Re-export all enhanced types and functions from middleware/auth
export type { AuthContext } from './middleware/auth'
export { AuthError } from './middleware/auth'
export {
  requireAuth as requireAuthEnhanced,
  getOptionalAuth,
  getUserProfile,
  hasRole,
  hasAnyRole,
  getCurrentUserId,
  checkAuthForMiddleware,
} from './middleware/auth'

// ============================================================================
// BACKWARD COMPATIBILITY LAYER
// ============================================================================

/**
 * Legacy requireAuth - Maintains old API for backward compatibility
 *
 * @deprecated Use requireAuthEnhanced from @/lib/middleware/auth instead
 * @returns { user, supabase } - Old API response format
 */
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return { user, supabase }
}

/**
 * Legacy getProfile - Fetch user profile by ID
 *
 * @param userId - User ID to fetch
 * @returns Profile or null if not found
 */
export async function getProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return profile
}

/**
 * Legacy requireRole - Maintains old API for backward compatibility
 *
 * @deprecated Use requireAuthEnhanced([role]) from @/lib/middleware/auth instead
 * @param role - Required role
 * @returns { user, profile, supabase } - Old API response format
 */
export async function requireRole(role: UserRole) {
  const { user, supabase } = await requireAuth()
  const profile = await getProfile(user.id)

  if (!profile) {
    redirect('/auth/complete-profile')
  }

  if (profile.role !== role) {
    const dashboards = {
      patient: '/app',
      doctor: '/doctor',
      admin: '/admin',
    }
    redirect(dashboards[profile.role as UserRole])
  }

  return { user, profile, supabase }
}

