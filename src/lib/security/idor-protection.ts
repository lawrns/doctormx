/**
 * IDOR (Insecure Direct Object Reference) Protection Module
 * 
 * Provides utilities for preventing and logging IDOR attempts.
 * IDOR occurs when an attacker can access or modify resources belonging to other users
 * by manipulating resource identifiers in requests.
 */

import { createClient } from '@/lib/supabase/server'
import { logSecurityEvent } from './audit-logger'
import { logger } from '@/lib/observability/logger'

export interface OwnershipCheckParams {
  table: string
  resourceId: string
  userId: string
  ownerField?: string
}

export interface OwnershipCheckResult {
  allowed: boolean
  resource?: Record<string, unknown> | null
  error?: string
}

export interface IDORAttemptEvent {
  userId: string
  targetResource: string
  resourceType: string
  action: string
  ipAddress?: string
  userAgent?: string
  timestamp: string
  additionalContext?: Record<string, unknown>
}

/**
 * Verify resource ownership before allowing access
 * Security: Centralized ownership validation to prevent IDOR attacks
 */
export async function verifyOwnership(
  params: OwnershipCheckParams
): Promise<OwnershipCheckResult> {
  const { table, resourceId, userId, ownerField = 'user_id' } = params
  
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', resourceId)
      .single()
    
    if (error || !data) {
      return {
        allowed: false,
        error: 'Resource not found',
        resource: null,
      }
    }
    
    // Check if the requesting user owns the resource
    const ownerId = data[ownerField]
    
    if (ownerId !== userId) {
      return {
        allowed: false,
        error: 'Access denied - resource ownership mismatch',
        resource: data,
      }
    }
    
    return {
      allowed: true,
      resource: data,
    }
  } catch (err) {
    logger.error('Error verifying ownership:', { error: err, params })
    return {
      allowed: false,
      error: 'Failed to verify ownership',
      resource: null,
    }
  }
}

/**
 * Log IDOR attempt for security monitoring
 * Security: Tracks potential unauthorized access attempts
 */
export async function logIDORAttempt(event: IDORAttemptEvent): Promise<void> {
  const {
    userId,
    targetResource,
    resourceType,
    action,
    ipAddress,
    userAgent,
    timestamp,
    additionalContext,
  } = event
  
  // Log to security audit system
  await logSecurityEvent({
    eventType: 'permission_denied',
    severity: 'high',
    userId,
    description: `IDOR attempt: User ${userId} attempted to ${action} ${resourceType} ${targetResource}`,
    ipAddress,
    userAgent,
    details: {
      type: 'IDOR_ATTEMPT',
      targetResource,
      resourceType,
      action,
      timestamp,
      ...additionalContext,
    },
  })
  
  // Also log as warning for immediate monitoring
  logger.warn(`IDOR_ATTEMPT: User ${userId} tried to ${action} ${resourceType} ${targetResource}`, {
    userId,
    targetResource,
    resourceType,
    action,
    timestamp,
    additionalContext,
  })
}

/**
 * Helper to get request metadata for logging
 */
export function getRequestMetadata(request: Request): {
  ipAddress: string | undefined
  userAgent: string | undefined
} {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  }
}

/**
 * Ownership check for appointments specifically
 * Security: Validates patient ownership of appointments
 */
export async function verifyAppointmentOwnership(
  appointmentId: string,
  patientId: string
): Promise<OwnershipCheckResult> {
  const supabase = await createClient()
  
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('id, patient_id, status, doctor_id')
      .eq('id', appointmentId)
      .single()
    
    if (error || !appointment) {
      return {
        allowed: false,
        error: 'Appointment not found',
        resource: null,
      }
    }
    
    if (appointment.patient_id !== patientId) {
      return {
        allowed: false,
        error: 'Forbidden - appointment belongs to another patient',
        resource: appointment,
      }
    }
    
    return {
      allowed: true,
      resource: appointment,
    }
  } catch (err) {
    logger.error('Error verifying appointment ownership:', { error: err, appointmentId, patientId })
    return {
      allowed: false,
      error: 'Failed to verify appointment ownership',
      resource: null,
    }
  }
}

/**
 * Ownership check for conversations
 * Security: Validates user participation in conversations
 */
export async function verifyConversationOwnership(
  conversationId: string,
  userId: string
): Promise<OwnershipCheckResult> {
  const supabase = await createClient()
  
  try {
    const { data: conversation, error } = await supabase
      .from('chat_conversations')
      .select('id, patient_id, doctor_id')
      .eq('id', conversationId)
      .single()
    
    if (error || !conversation) {
      return {
        allowed: false,
        error: 'Conversation not found',
        resource: null,
      }
    }
    
    // User must be either patient or doctor in the conversation
    if (conversation.patient_id !== userId && conversation.doctor_id !== userId) {
      return {
        allowed: false,
        error: 'Forbidden - user not part of this conversation',
        resource: conversation,
      }
    }
    
    return {
      allowed: true,
      resource: conversation,
    }
  } catch (err) {
    logger.error('Error verifying conversation ownership:', { error: err, conversationId, userId })
    return {
      allowed: false,
      error: 'Failed to verify conversation ownership',
      resource: null,
    }
  }
}

/**
 * Middleware-style wrapper for IDOR-protected routes
 * Usage: Wrap your route handler with this function
 */
export function withIDORProtection<T extends (...args: unknown[]) => unknown>(
  resourceType: string,
  getResourceId: (args: unknown[]) => string,
  getUserId: (args: unknown[]) => string,
  handler: T
): T {
  return (async (...args: unknown[]) => {
    const resourceId = getResourceId(args)
    const userId = getUserId(args)
    
    const ownership = await verifyOwnership({
      table: resourceType,
      resourceId,
      userId,
    })
    
    if (!ownership.allowed) {
      const request = args[0] as Request
      const { ipAddress, userAgent } = getRequestMetadata(request)
      
      await logIDORAttempt({
        userId,
        targetResource: resourceId,
        resourceType,
        action: 'access',
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString(),
      })
      
      throw new Error(`IDOR attempt blocked: ${ownership.error}`)
    }
    
    return handler(...args)
  }) as T
}

// Export convenience object
export const IDORProtection = {
  verifyOwnership,
  verifyAppointmentOwnership,
  verifyConversationOwnership,
  logIDORAttempt,
  getRequestMetadata,
  withIDORProtection,
}

export default IDORProtection
