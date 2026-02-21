// Session Management System for Doctor.mx
// Handles session tracking, invalidation, and security event recording

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { cookies } from 'next/headers'

/**
 * Information about the current user session
 */
export interface SessionInfo {
  userId: string
  createdAt: Date
  lastActivity: Date
  ipAddress?: string
  userAgent?: string
}

/**
 * Security event types that can trigger session invalidation
 */
export type SecurityEventType = 'password_change' | 'suspicious_activity' | 'role_change'

/**
 * Get the current session information for the authenticated user
 * @returns SessionInfo if user is authenticated, null otherwise
 */
export async function getCurrentSession(): Promise<SessionInfo | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    // Get session metadata
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return null
    }

    // Extract IP and User Agent from request context
    const cookieStore = await cookies()
    const ipAddress = cookieStore.get('client_ip')?.value
    const userAgent = cookieStore.get('user_agent')?.value

    return {
      userId: user.id,
      createdAt: new Date(user.created_at),
      lastActivity: new Date(user.last_sign_in_at || user.created_at),
      ipAddress,
      userAgent
    }
  } catch (error) {
    // Log error but don't throw - return null on failure
    logger.error({ err: error }, 'Error getting current session')
    return null
  }
}

/**
 * Invalidate all sessions for a specific user
 * This is typically called after security events like password changes
 * @param userId - The user ID whose sessions should be invalidated
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  try {
    const serviceClient = createServiceClient()

    // Use Supabase Admin API to revoke all sessions for the user
    const { error } = await serviceClient.auth.admin.deleteUser(userId)

    if (error) {
      throw new Error(`Failed to invalidate sessions for user ${userId}: ${error.message}`)
    }
  } catch (error) {
    logger.error({ err: error }, 'Error invalidating user sessions')
    throw error
  }
}

/**
 * Invalidate the current user's session
 * This is used for sign out operations
 */
export async function invalidateCurrentSession(): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(`Failed to invalidate current session: ${error.message}`)
    }
  } catch (error) {
    logger.error({ err: error }, 'Error invalidating current session')
    throw error
  }
}

/**
 * Refresh the current session to extend its validity
 * This updates the session's last activity timestamp
 */
export async function refreshSession(): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()

    if (refreshError) {
      throw new Error(`Failed to refresh session: ${refreshError.message}`)
    }

    if (!session) {
      throw new Error('No session to refresh')
    }
  } catch (error) {
    logger.error({ err: error }, 'Error refreshing session')
    throw error
  }
}

/**
 * Record a security event for audit and potential session invalidation
 * This creates a record in the security_events table and can trigger
 * automatic session invalidation based on the event type
 *
 * @param userId - The user ID associated with the security event
 * @param eventType - The type of security event
 */
export async function recordSecurityEvent(
  userId: string,
  eventType: SecurityEventType
): Promise<void> {
  try {
    const serviceClient = createServiceClient()

    // Get request context for IP and User Agent
    const cookieStore = await cookies()
    const ipAddress = cookieStore.get('client_ip')?.value
    const userAgent = cookieStore.get('user_agent')?.value

    // Record the security event
    const { error: insertError } = await serviceClient
      .from('security_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'session_management'
        }
      })

    if (insertError) {
      throw new Error(`Failed to record security event: ${insertError.message}`)
    }

    // For certain event types, automatically invalidate all user sessions
    if (eventType === 'password_change' || eventType === 'role_change') {
      await invalidateAllUserSessions(userId)
    }
  } catch (error) {
    logger.error({ err: error }, 'Error recording security event')
    throw error
  }
}

/**
 * Get recent security events for a user
 * This is useful for audit trails and security monitoring
 *
 * @param userId - The user ID to get security events for
 * @param limit - Maximum number of events to return (default: 10)
 * @returns Array of security events
 */
export async function getUserSecurityEvents(
  userId: string,
  limit: number = 10
): Promise<SecurityEvent[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get security events: ${error.message}`)
    }

    return data || []
  } catch (error) {
    logger.error({ err: error }, 'Error getting user security events')
    throw error
  }
}

/**
 * Security event record interface
 */
export interface SecurityEvent {
  id: string
  user_id: string
  event_type: SecurityEventType
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}
