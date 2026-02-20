/**
 * Security Audit Logger
 * Input: Security event details
 * Process: Log security events with structured data for analysis
 * Output: Persistent audit trail for compliance and security monitoring
 * 
 * Security: All security events are logged with context for forensic analysis
 */

import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/observability/logger'

export type SecurityEventType =
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'mfa_challenge'
  | 'session_created'
  | 'session_revoked'
  | 'suspicious_activity'
  | 'csrf_violation'
  | 'rate_limit_exceeded'
  | 'permission_denied'
  | 'idor_attempt'
  | 'data_export'
  | 'data_access'
  | 'config_change'
  | 'feature_flag_change'

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical'

export interface SecurityEvent {
  eventType: SecurityEventType
  severity: SecuritySeverity
  userId?: string
  description: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  requestId?: string
  metadata?: Record<string, unknown>
}

export interface AuthEvent {
  userId: string
  eventType: 'login' | 'logout' | 'login_failed' | 'password_change' | 
             'password_reset_requested' | 'password_reset_completed' |
             'mfa_enabled' | 'mfa_disabled' | 'mfa_challenge' |
             'session_created' | 'session_revoked' | 'suspicious_activity'
  success: boolean
  failureReason?: string
  ipAddress?: string
  userAgent?: string
  locationInfo?: Record<string, unknown>
  sessionId?: string
}

export interface DataAccessEvent {
  userId: string
  tableName: string
  recordId?: string
  accessType: 'read' | 'write' | 'delete' | 'export'
  ipAddress?: string
  userAgent?: string
  queryParams?: Record<string, unknown>
  rowsAccessed?: number
  justification?: string
}

/**
 * Log a security event to the audit system
 * Security: Critical events are logged immediately with full context
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const supabase = await createServiceClient()
  
  try {
    const { error } = await supabase
      .from('security_audit')
      .insert({
        event_type: event.eventType,
        severity: event.severity,
        user_id: event.userId,
        description: event.description,
        details: event.details || {},
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
      })

    if (error) {
      logger.error('Failed to log security event to database', { error, event })
    }

    // Also log to application logs for real-time monitoring
    const logMethod = event.severity === 'critical' ? 'error' : 
                      event.severity === 'high' ? 'warn' : 'info'
    
    logger[logMethod](`[Security] ${event.eventType}: ${event.description}`, {
      userId: event.userId,
      severity: event.severity,
      ipAddress: event.ipAddress,
      details: event.details,
    })

    // Alert on critical security events
    if (event.severity === 'critical') {
      await alertCriticalSecurityEvent(event)
    }
  } catch (err) {
    // Fallback logging if database is unavailable
    logger.error('Critical: Failed to log security event', { 
      error: err, 
      event 
    })
  }
}

/**
 * Log authentication events
 * Security: Tracks all authentication attempts for fraud detection
 */
export async function logAuthEvent(event: AuthEvent): Promise<void> {
  const supabase = await createServiceClient()
  
  try {
    await supabase.rpc('log_auth_event', {
      p_user_id: event.userId,
      p_event_type: event.eventType,
      p_success: event.success,
      p_failure_reason: event.failureReason,
      p_ip_address: event.ipAddress,
      p_user_agent: event.userAgent,
    })

    // Additional security logging for failed attempts
    if (!event.success && event.eventType === 'login_failed') {
      await logSecurityEvent({
        eventType: 'login_failure',
        severity: 'medium',
        userId: event.userId,
        description: `Failed login attempt: ${event.failureReason}`,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: { failureReason: event.failureReason }
      })
    }
  } catch (err) {
    logger.error('Failed to log auth event', { error: err, event })
  }
}

/**
 * Log data access events
 * Security: HIPAA compliance requires tracking all PHI access
 */
export async function logDataAccess(event: DataAccessEvent): Promise<void> {
  const supabase = await createServiceClient()
  
  try {
    const { error } = await supabase
      .from('data_access_audit')
      .insert({
        user_id: event.userId,
        table_name: event.tableName,
        record_id: event.recordId,
        access_type: event.accessType,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        query_params: event.queryParams,
        rows_accessed: event.rowsAccessed,
        justification: event.justification,
      })

    if (error) {
      logger.error('Failed to log data access', { error, event })
    }
  } catch (err) {
    logger.error('Failed to log data access event', { error: err, event })
  }
}

/**
 * Client-side security event logging (for browser events)
 * Security: Captures client-side security events like CSP violations
 */
export async function logClientSecurityEvent(
  event: Omit<SecurityEvent, 'ipAddress'>
): Promise<void> {
  const supabase = createClient()
  
  try {
    await supabase
      .from('security_audit')
      .insert({
        event_type: event.eventType,
        severity: event.severity,
        user_id: event.userId,
        description: event.description,
        details: event.details || {},
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })
  } catch (err) {
    // Client-side failures should not break the UI
    logger.error('Failed to log client security event', { error: err instanceof Error ? err.message : String(err) })
  }
}

/**
 * Detect and log suspicious patterns
 * Security: Automated threat detection
 */
export async function detectSuspiciousActivity(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<boolean> {
  const supabase = await createServiceClient()
  
  try {
    // Check for multiple failed logins from same IP
    const { data: recentFailures } = await supabase
      .from('auth_audit')
      .select('id')
      .eq('event_type', 'login_failed')
      .eq('ip_address', ipAddress)
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())

    if (recentFailures && recentFailures.length >= 5) {
      await logSecurityEvent({
        eventType: 'suspicious_activity',
        severity: 'high',
        userId,
        description: `Multiple failed login attempts from IP ${ipAddress}`,
        ipAddress,
        userAgent,
        details: {
          failureCount: recentFailures.length,
          timeWindow: '15 minutes',
          detectionType: 'brute_force_attempt'
        }
      })
      return true
    }

    // Check for rapid API requests (potential scraping)
    const { data: recentRequests } = await supabase
      .from('data_access_audit')
      .select('id')
      .eq('user_id', userId)
      .gte('accessed_at', new Date(Date.now() - 60 * 1000).toISOString())

    if (recentRequests && recentRequests.length >= 100) {
      await logSecurityEvent({
        eventType: 'suspicious_activity',
        severity: 'medium',
        userId,
        description: `High volume of data access requests detected`,
        ipAddress,
        userAgent,
        details: {
          requestCount: recentRequests.length,
          timeWindow: '1 minute',
          detectionType: 'potential_scraping'
        }
      })
      return true
    }

    return false
  } catch (err) {
    logger.error('Error in suspicious activity detection', { error: err })
    return false
  }
}

/**
 * Alert on critical security events
 * Security: Immediate notification for critical threats
 */
async function alertCriticalSecurityEvent(event: SecurityEvent): Promise<void> {
  // Log to error tracking service
  logger.error(`[CRITICAL SECURITY EVENT] ${event.eventType}`, {
    severity: 'critical',
    userId: event.userId,
    description: event.description,
    details: event.details,
  })

  // TODO: Implement additional alerting (email, Slack, PagerDuty)
  // This would typically integrate with notification services
}

/**
 * Get security audit summary for a user
 * Security: Allows users to review their security activity
 */
export async function getUserSecuritySummary(userId: string): Promise<{
  recentEvents: unknown[]
  failedLogins: number
  lastLogin: string | null
}> {
  const supabase = await createServiceClient()
  
  try {
    const [{ data: recentEvents }, { data: failedLogins }, { data: lastLogin }] = await Promise.all([
      supabase
        .from('security_audit')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      
      supabase
        .from('auth_audit')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('event_type', 'login_failed')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      
      supabase
        .from('auth_audit')
        .select('created_at')
        .eq('user_id', userId)
        .eq('event_type', 'login')
        .eq('success', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    ])

    return {
      recentEvents: recentEvents || [],
      failedLogins: failedLogins?.length ?? 0,
      lastLogin: lastLogin?.created_at || null
    }
  } catch (err) {
    logger.error('Failed to get user security summary', { error: err, userId })
    return {
      recentEvents: [],
      failedLogins: 0,
      lastLogin: null
    }
  }
}

/**
 * Export security audit for compliance
 * Security: Supports regulatory compliance requirements
 */
export async function exportSecurityAudit(
  startDate: Date,
  endDate: Date,
  eventTypes?: SecurityEventType[]
): Promise<unknown[]> {
  const supabase = await createServiceClient()
  
  try {
    let query = supabase
      .from('security_audit')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })

    if (eventTypes && eventTypes.length > 0) {
      query = query.in('event_type', eventTypes)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  } catch (err) {
    logger.error('Failed to export security audit', { error: err })
    throw err
  }
}

// Export convenience functions for common events
export const SecurityAudit = {
  logSecurityEvent,
  logAuthEvent,
  logDataAccess,
  logClientSecurityEvent,
  detectSuspiciousActivity,
  getUserSecuritySummary,
  exportSecurityAudit,
}

export default SecurityAudit
