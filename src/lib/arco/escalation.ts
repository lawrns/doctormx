/**
 * ARCO Request Escalation System
 *
 * Manages automatic and manual escalation of ARCO requests based on:
 * - Time thresholds (SLA compliance)
 * - Request complexity
 * - User type (VIP, enterprise, etc.)
 * - Legal requirements
 */

import { createClient } from '@/lib/supabase/server'
import type {
  ArcoRequestRow,
  EscalationLevel,
  ArcoRequestStatus,
} from '@/types/arco'
import { ArcoError, ArcoErrorCode } from '@/types/arco'
import { calculateBusinessDays, checkSlaCompliance } from './index'

// ================================================
// ESCALATION CONFIGURATION
// ================================================

/**
 * Escalation level definitions
 */
export const ESCALATION_CONFIG = {
  tier_1: {
    label: 'Nivel 1 - Soporte al Cliente',
    business_days_threshold: 0,
    auto_escalate_days: 5,
    responsible_team: 'customer_support',
    notification_channels: ['email'],
    requires_manager_approval: false,
  },
  tier_2: {
    label: 'Nivel 2 - Oficial de Protección de Datos',
    business_days_threshold: 5,
    auto_escalate_days: 10,
    responsible_team: 'compliance',
    notification_channels: ['email', 'slack'],
    requires_manager_approval: false,
  },
  tier_3: {
    label: 'Nivel 3 - Departamento Legal',
    business_days_threshold: 10,
    auto_escalate_days: 15,
    responsible_team: 'legal',
    notification_channels: ['email', 'slack', 'sms'],
    requires_manager_approval: true,
  },
  tier_4: {
    label: 'Nivel 4 - Counsel Legal Externo',
    business_days_threshold: 15,
    auto_escalate_days: 20,
    responsible_team: 'external_counsel',
    notification_channels: ['email', 'slack', 'sms', 'phone'],
    requires_manager_approval: true,
  },
} as const

/**
 * Request type complexity scores (higher = more complex)
 */
const REQUEST_COMPLEXITY = {
  ACCESS: 1,
  RECTIFY: 3,
  OPPOSE: 4,
  CANCEL: 5, // Most complex due to retention requirements
} as const

/**
 * Priority multipliers for escalation
 */
const PRIORITY_MULTIPLIERS = {
  low: 1.5,
  normal: 1,
  high: 0.7,
  urgent: 0.5,
} as const

// ================================================
// ESCALATION LOGIC
// ================================================

/**
 * Check if a request should be escalated
 *
 * @param request - ARCO request to check
 * @returns Escalation criteria and decision
 */
export async function shouldEscalate(request: ArcoRequestRow): Promise<{
  should_escalate: boolean
  current_level: EscalationLevel
  next_level?: EscalationLevel
  reason: string
  business_days_elapsed: number
  business_days_remaining: number
}> {
  const sla = await checkSlaCompliance(request)
  const config = ESCALATION_CONFIG[request.escalation_level]
  const complexity = REQUEST_COMPLEXITY[request.request_type]
  const priorityMultiplier = PRIORITY_MULTIPLIERS[request.priority]

  // Calculate adjusted threshold based on complexity and priority
  const adjustedThreshold = Math.floor(
    config.auto_escalate_days * complexity * priorityMultiplier
  )

  // Check if overdue - always escalate
  if (sla.is_overdue) {
    const nextLevel = getNextEscalationLevel(request.escalation_level)
    return {
      should_escalate: nextLevel !== undefined,
      current_level: request.escalation_level,
      next_level: nextLevel,
      reason: 'Solicitud vencida (excede los 20 días hábiles)',
      business_days_elapsed: sla.business_days_elapsed,
      business_days_remaining: sla.business_days_remaining,
    }
  }

  // Check if approaching SLA limit
  if (sla.is_critical && sla.business_days_remaining <= 2) {
    const nextLevel = getNextEscalationLevel(request.escalation_level)
    return {
      should_escalate: nextLevel !== undefined,
      current_level: request.escalation_level,
      next_level: nextLevel,
      reason: 'Crítico: Menos de 2 días hábiles restantes',
      business_days_elapsed: sla.business_days_elapsed,
      business_days_remaining: sla.business_days_remaining,
    }
  }

  // Check if time threshold reached
  if (sla.business_days_elapsed >= adjustedThreshold) {
    const nextLevel = getNextEscalationLevel(request.escalation_level)
    return {
      should_escalate: nextLevel !== undefined,
      current_level: request.escalation_level,
      next_level: nextLevel,
      reason: `Umbral de tiempo alcanzado (${sla.business_days_elapsed} días hábiles)`,
      business_days_elapsed: sla.business_days_elapsed,
      business_days_remaining: sla.business_days_remaining,
    }
  }

  // Check if request requires additional review
  if (await requiresAdditionalReview(request)) {
    return {
      should_escalate: true,
      current_level: request.escalation_level,
      next_level: 'tier_3', // Skip to legal for special cases
      reason: 'Requiere revisión adicional por complejidad o naturaleza legal',
      business_days_elapsed: sla.business_days_elapsed,
      business_days_remaining: sla.business_days_remaining,
    }
  }

  // Check if stuck in same status for too long
  if (await isStuckRequest(request)) {
    const nextLevel = getNextEscalationLevel(request.escalation_level)
    return {
      should_escalate: nextLevel !== undefined,
      current_level: request.escalation_level,
      next_level: nextLevel,
      reason: 'Solicitud estancada sin progreso',
      business_days_elapsed: sla.business_days_elapsed,
      business_days_remaining: sla.business_days_remaining,
    }
  }

  return {
    should_escalate: false,
    current_level: request.escalation_level,
    reason: 'Dentro de los límites normales de procesamiento',
    business_days_elapsed: sla.business_days_elapsed,
    business_days_remaining: sla.business_days_remaining,
  }
}

/**
 * Escalate a request to the next level
 *
 * @param requestId - Request ID to escalate
 * @param adminId - Admin user ID performing the escalation
 * @param reason - Reason for escalation
 * @returns Updated request
 */
export async function escalateRequest(
  requestId: string,
  adminId: string,
  reason?: string
): Promise<ArcoRequestRow> {
  const supabase = await createClient()

  // Get current request
  const { data: request, error } = await supabase
    .from('arco_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (error || !request) {
    throw new ArcoError(
      'Request not found',
      ArcoErrorCode.REQUEST_NOT_FOUND,
      404
    )
  }

  // Get next escalation level
  const nextLevel = getNextEscalationLevel(request.escalation_level)
  if (!nextLevel) {
    throw new ArcoError(
      'Request is already at maximum escalation level',
      ArcoErrorCode.INVALID_STATUS,
      400
    )
  }

  // Check if approval is required
  const config = ESCALATION_CONFIG[nextLevel]
  if (config.requires_manager_approval) {
    // TODO: Implement manager approval workflow
    // For now, just log that approval would be required
    console.warn(`Escalation to ${nextLevel} requires manager approval`)
  }

  // Update request
  const { data: updated, error: updateError } = await supabase
    .from('arco_requests')
    .update({
      escalation_level: nextLevel,
      status: 'escalated',
      metadata: {
        ...request.metadata,
        escalated_at: new Date().toISOString(),
        escalated_by: adminId,
        escalation_reason: reason || 'Escalación automática por tiempo',
        previous_level: request.escalation_level,
      },
    })
    .eq('id', requestId)
    .select()
    .single()

  if (updateError) {
    throw new ArcoError(
      `Error escalating request: ${updateError.message}`,
      ArcoErrorCode.INVALID_STATUS,
      500
    )
  }

  // Create history entry
  await supabase.from('arco_request_history').insert({
    request_id: requestId,
    old_status: request.status,
    new_status: 'escalated',
    changed_by: adminId,
    change_reason: reason || `Escalado de ${request.escalation_level} a ${nextLevel}`,
    metadata: {
      previous_level: request.escalation_level,
      new_level: nextLevel,
    },
  })

  // Send notification
  await sendEscalationNotification(updated, request.escalation_level, nextLevel)

  return updated
}

/**
 * Get the appropriate escalation level for a new request
 *
 * @param requestType - Type of ARCO request
 * @param priority - Request priority
 * @param userId - User ID (for VIP check)
 * @returns Initial escalation level
 */
export async function getEscalationLevel(
  requestType: ArcoRequestRow['request_type'],
  priority: ArcoRequestRow['priority'],
  userId: string
): Promise<EscalationLevel> {
  // Check if user is VIP
  const isVip = await isVipUser(userId)

  // High-priority or VIP requests start at tier 2
  if (priority === 'urgent' || priority === 'high' || isVip) {
    return 'tier_2'
  }

  // Cancel requests (most complex) start at tier 2
  if (requestType === 'CANCEL') {
    return 'tier_2'
  }

  // Default to tier 1
  return 'tier_1'
}

/**
 * Update escalation level manually (admin override)
 *
 * @param requestId - Request ID
 * @param newLevel - New escalation level
 * @param adminId - Admin user ID
 * @param reason - Reason for change
 * @returns Updated request
 */
export async function updateEscalationLevel(
  requestId: string,
  newLevel: EscalationLevel,
  adminId: string,
  reason?: string
): Promise<ArcoRequestRow> {
  const supabase = await createClient()

  // Get current request
  const { data: request } = await supabase
    .from('arco_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!request) {
    throw new ArcoError(
      'Request not found',
      ArcoErrorCode.REQUEST_NOT_FOUND,
      404
    )
  }

  // Update request
  const { data: updated, error } = await supabase
    .from('arco_requests')
    .update({
      escalation_level: newLevel,
      metadata: {
        ...request.metadata,
        escalation_manually_updated: true,
        escalation_updated_by: adminId,
        escalation_update_reason: reason,
        escalation_update_time: new Date().toISOString(),
      },
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    throw new ArcoError(
      `Error updating escalation level: ${error.message}`,
      ArcoErrorCode.INVALID_STATUS,
      500
    )
  }

  // Create history entry
  await supabase.from('arco_request_history').insert({
    request_id: requestId,
    old_status: request.status,
    new_status: request.status,
    changed_by: adminId,
    change_reason: `Nivel de escalación cambiado de ${request.escalation_level} a ${newLevel}${reason ? ': ' + reason : ''}`,
  })

  return updated
}

// ================================================
// AUTOMATIC ESCALATION
// ================================================

/**
 * Check all requests and auto-escalate those that meet criteria
 * This should be run by a scheduled job (e.g., daily)
 *
 * @returns Summary of escalation actions
 */
export async function autoEscalateRequests(): Promise<{
  checked: number
  escalated: string[]
  already_max_level: string[]
  errors: Array<{ request_id: string; error: string }>
}> {
  const supabase = await createClient()

  // Get all active non-terminal requests
  const { data: requests } = await supabase
    .from('arco_requests')
    .select('*')
    .not('status', 'in', '("completed","denied","cancelled")')

  const escalated: string[] = []
  const alreadyMaxLevel: string[] = []
  const errors: Array<{ request_id: string; error: string }> = []

  for (const request of requests || []) {
    try {
      const decision = await shouldEscalate(request)

      if (decision.should_escalate && decision.next_level) {
        await escalateRequest(
          request.id,
          'system', // System auto-escalation
          decision.reason
        )
        escalated.push(request.id)
      } else if (decision.next_level === undefined) {
        alreadyMaxLevel.push(request.id)
      }
    } catch (error) {
      errors.push({
        request_id: request.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return {
    checked: requests?.length || 0,
    escalated,
    already_max_level: alreadyMaxLevel,
    errors,
  }
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Get the next escalation level
 *
 * @param currentLevel - Current escalation level
 * @returns Next level or undefined if at max
 */
function getNextEscalationLevel(
  currentLevel: EscalationLevel
): EscalationLevel | undefined {
  const levels: EscalationLevel[] = ['tier_1', 'tier_2', 'tier_3', 'tier_4']
  const currentIndex = levels.indexOf(currentLevel)

  if (currentIndex === -1 || currentIndex === levels.length - 1) {
    return undefined
  }

  return levels[currentIndex + 1]
}

/**
 * Check if a request requires additional legal review
 *
 * @param request - ARCO request
 * @returns True if requires additional review
 */
async function requiresAdditionalReview(request: ArcoRequestRow): Promise<boolean> {
  // Cancellation requests affecting medical records
  if (request.request_type === 'CANCEL' &&
      request.data_scope.includes('soap_consultations')) {
    return true
  }

  // Opposition requests with legal implications
  if (request.request_type === 'OPPOSE') {
    // Check if opposing required processing
    const hasRequiredScope = request.data_scope.some(scope =>
      ['profiles', 'appointments', 'payments'].includes(scope)
    )
    if (hasRequiredScope) {
      return true
    }
  }

  // Rectification requests for medical records
  if (request.request_type === 'RECTIFY' &&
      request.data_scope.includes('soap_consultations')) {
    return true
  }

  // Check for special keywords in justification
  if (request.justification) {
    const legalKeywords = [
      'ley', 'legal', 'abogado', 'demanda', 'juicio',
      'inai', 'autoridad', 'regulador', 'cofepris',
    ]
    const lowerJustification = request.justification.toLowerCase()
    if (legalKeywords.some(keyword => lowerJustification.includes(keyword))) {
      return true
    }
  }

  return false
}

/**
 * Check if a request is stuck (no progress for too long)
 *
 * @param request - ARCO request
 * @returns True if request is stuck
 */
async function isStuckRequest(request: ArcoRequestRow): Promise<boolean> {
  // Get history to check last status change
  const supabase = await createClient()
  const { data: history } = await supabase
    .from('arco_request_history')
    .select('created_at')
    .eq('request_id', request.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!history || history.length === 0) {
    // No history yet, check creation date
    const daysSinceCreation = calculateBusinessDays(
      request.created_at,
      new Date()
    )
    return daysSinceCreation > 7 // Stuck if no progress for 7 business days
  }

  const lastChange = new Date(history[0].created_at)
  const daysSinceChange = calculateBusinessDays(lastChange, new Date())

  return daysSinceChange > 7 // Stuck if no status change for 7 business days
}

/**
 * Check if user is VIP (gets faster escalation)
 *
 * @param userId - User ID
 * @returns True if VIP
 */
async function isVipUser(userId: string): Promise<boolean> {
  const supabase = await createClient()

  // Check if user has special flags or is enterprise customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  // Admins are considered VIP
  if (profile?.role === 'admin') {
    return true
  }

  // TODO: Add VIP/enterprise flags to profile
  // For now, just check if doctor with high rating
  const { data: doctor } = await supabase
    .from('doctors')
    .select('rating_count')
    .eq('id', userId)
    .single()

  // Doctors with many patients might be VIP
  if (doctor && doctor.rating_count > 100) {
    return true
  }

  return false
}

/**
 * Send escalation notification to responsible team
 *
 * @param request - Escalated request
 * @param previousLevel - Previous escalation level
 * @param newLevel - New escalation level
 */
async function sendEscalationNotification(
  request: ArcoRequestRow,
  previousLevel: EscalationLevel,
  newLevel: EscalationLevel
): Promise<void> {
  const config = ESCALATION_CONFIG[newLevel]

  // TODO: Implement actual notification sending
  // This would integrate with your notification system
  console.log(`[ARCO Escalation] Request ${request.id} escalated from ${previousLevel} to ${newLevel}`)
  console.log(`Team: ${config.responsible_team}`)
  console.log(`Channels: ${config.notification_channels.join(', ')}`)

  // Store notification record
  const supabase = await createClient()
  await supabase.from('arco_communications').insert({
    request_id: request.id,
    direction: 'outgoing',
    channel: 'email',
    subject: `ARCO Request Escalated to ${config.label}`,
    content: `ARCO request ${request.id} has been escalated from ${previousLevel} to ${newLevel}.`,
    sent_at: new Date().toISOString(),
  })
}

/**
 * Get escalation statistics
 *
 * @returns Escalation metrics
 */
export async function getEscalationStats(): Promise<{
  by_level: Record<EscalationLevel, number>
  escalations_last_30_days: number
  avg_escalation_time: number
  most_common_reasons: Array<{ reason: string; count: number }>
}> {
  const supabase = await createClient()

  // Get current requests by level
  const { data: requests } = await supabase
    .from('arco_requests')
    .select('escalation_level, metadata')
    .not('status', 'in', '("completed","denied","cancelled")')

  const byLevel: Record<EscalationLevel, number> = {
    tier_1: 0,
    tier_2: 0,
    tier_3: 0,
    tier_4: 0,
  }

  const reasonCounts: Record<string, number> = {}

  for (const request of requests || []) {
    byLevel[request.escalation_level as EscalationLevel]++

    if (request.metadata?.escalation_reason) {
      const reason = String(request.metadata.escalation_reason)
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    }
  }

  // Get escalations in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentEscalations } = await supabase
    .from('arco_request_history')
    .select('created_at, request_id')
    .eq('new_status', 'escalated')
    .gte('created_at', thirtyDaysAgo.toISOString())

  // Calculate average escalation time
  // (This would require more complex queries in production)

  const mostCommonReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason, count]) => ({ reason, count }))

  return {
    by_level: byLevel,
    escalations_last_30_days: recentEscalations?.length || 0,
    avg_escalation_time: 0, // Would need more complex query
    most_common_reasons: mostCommonReasons,
  }
}
