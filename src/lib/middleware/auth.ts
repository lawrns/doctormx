// Enhanced Authentication Middleware with Role-Based Access Control
// Provides centralized authentication and authorization for API routes and server components

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'
import type { User } from '@supabase/supabase-js'
import type { ProfileRow } from '@/types'

type SupabaseProfile = ProfileRow

/**
 * Authentication context containing user, session, and profile information
 */
export interface AuthContext {
  user: User
  profile: SupabaseProfile
  session: {
    access_token: string
    refresh_token: string | null
    expires_at: number | null
    expires_in: number | null
    token_type: string
  }
}

/**
 * Authentication error types for better error handling
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'NOT_AUTHENTICATED' | 'NOT_AUTHORIZED' | 'PROFILE_NOT_FOUND' | 'SESSION_EXPIRED'
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Enhanced requireAuth function with role-based access control
 *
 * @param allowedRoles - Optional array of roles allowed to access the resource
 * @returns AuthContext containing user, profile, and session information
 * @throws AuthError if user is not authenticated or not authorized
 *
 * @example
 * ```ts
 * // Require authentication only
 * const { user, profile } = await requireAuth()
 *
 * // Require specific role
 * const { user, profile } = await requireAuth(['doctor'])
 *
 * // Require one of multiple roles
 * const { user, profile } = await requireAuth(['doctor', 'admin'])
 * ```
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<AuthContext> {
  const supabase = await createClient()

  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    throw new AuthError(
      'Error al obtener la sesión',
      'SESSION_EXPIRED'
    )
  }

  if (!session) {
    throw new AuthError(
      'No autenticado',
      'NOT_AUTHENTICATED'
    )
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile) {
    throw new AuthError(
      'Perfil no encontrado',
      'PROFILE_NOT_FOUND'
    )
  }

  // Check role authorization if roles specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(profile.role as unknown as UserRole)) {
      throw new AuthError(
        `Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
        'NOT_AUTHORIZED'
      )
    }
  }

  return {
    user: session.user,
    profile,
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at ?? null,
      expires_in: session.expires_in ?? null,
      token_type: session.token_type,
    }
  }
}

/**
 * Check if user is authenticated without throwing
 * Useful for conditional UI rendering
 *
 * @returns AuthContext if authenticated, null otherwise
 */
export async function getOptionalAuth(): Promise<AuthContext | null> {
  try {
    return await requireAuth()
  } catch {
    return null
  }
}

/**
 * Get user profile by ID
 * Used for fetching other users' profiles (e.g., doctor in consultation)
 *
 * @param userId - The user ID to fetch
 * @returns User profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<SupabaseProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Check if current user has specific role
 *
 * @param role - Role to check
 * @returns true if user has the role, false otherwise
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  try {
    const auth = await requireAuth()
    return auth.profile.role === role
  } catch {
    return false
  }
}

/**
 * Check if current user has any of the specified roles
 *
 * @param roles - Array of roles to check
 * @returns true if user has any of the roles, false otherwise
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  try {
    const auth = await requireAuth()
    return roles.includes(auth.profile.role as UserRole)
  } catch {
    return false
  }
}

/**
 * Get current user ID
 * Convenience function for getting just the user ID
 *
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const auth = await requireAuth()
    return auth.user.id
  } catch {
    return null
  }
}

/**
 * Server-side authentication check for middleware
 * Used in Next.js middleware for route protection
 *
 * @param request - NextRequest object
 * @param allowedRoles - Optional array of allowed roles
 * @returns Object with authenticated status and user info
 */
export async function checkAuthForMiddleware(
  request: Request,
  allowedRoles?: UserRole[]
): Promise<{ authenticated: boolean; authorized: boolean; userId?: string; role?: UserRole }> {
  try {
    // For middleware, we need to use the anon key since we don't have cookies context
    const supabase = await createClient()

    // Extract authorization header if present
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return { authenticated: false, authorized: false }
    }

    // For middleware-level auth checks, we'll rely on session cookies
    // This is handled by the main middleware.ts
    return { authenticated: false, authorized: false }
  } catch {
    return { authenticated: false, authorized: false }
  }
}

