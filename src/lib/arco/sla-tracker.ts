/**
 * ARCO SLA Tracker
 *
 * Tracks Service Level Agreement compliance for ARCO requests.
 * Legal requirement: 20 business days to respond (LFPDPPP maximum)
 */

import { createClient } from '@/lib/supabase/server'
import type {
  ArcoRequestRow,
  ArcoRequestType,
  SlaComplianceMetrics,
} from '@/types/arco'
import { ArcoError, ArcoErrorCode } from '@/types/arco'
import { calculateBusinessDays, addBusinessDays } from './index'

// ================================================
// CONSTANTS
// ================================================

/**
 * Legal SLA: 20 business days per LFPDPPP
 */
export const LEGAL_SLA_DAYS = 20

/**
 * Warning threshold: 15 business days (75% of SLA)
 */
export const WARNING_THRESHOLD_DAYS = 15

/**
 * Critical threshold: 18 business days (90% of SLA)
 */
export const CRITICAL_THRESHOLD_DAYS = 18

/**
 * SLA tier thresholds for escalation
 */
export const SLA_THRESHOLDS = {
  tier_1: 5, // Escalate to tier 2 after 5 days
  tier_2: 10, // Escalate to tier 3 after 10 days
  tier_3: 15, // Escalate to tier 4 after 15 days
} as const

// ================================================
// SLA TRACKING
// ================================================

/**
 * Check SLA compliance for a single request
 *
 * @param request - ARCO request to check
 * @returns SLA status information
 */
export async function checkSlaCompliance(request: ArcoRequestRow): Promise<{
  is_compliant: boolean
  is_overdue: boolean
  is_warning: boolean
  is_critical: boolean
  business_days_elapsed: number
  business_days_remaining: number
  percentage_used: number
  due_date: Date
  recommended_action: string
}> {
  const now = new Date()
  const dueDate = new Date(request.due_date)

  // Calculate business days
  const businessDaysElapsed = calculateBusinessDays(request.created_at, now)
  const businessDaysRemaining = Math.max(
    0,
    calculateBusinessDays(now, request.due_date)
  )

  // Calculate percentage of SLA used
  const percentageUsed = (businessDaysElapsed / LEGAL_SLA_DAYS) * 100

  // Determine status
  const isOverdue = now > dueDate && !['completed', 'denied', 'cancelled'].includes(request.status)
  const isWarning = businessDaysElapsed >= WARNING_THRESHOLD_DAYS && !isOverdue
  const isCritical = businessDaysElapsed >= CRITICAL_THRESHOLD_DAYS && !isOverdue
  const isCompliant = !isOverdue

  // Determine recommended action
  let recommendedAction = 'Continue processing normally'
  if (isOverdue) {
    recommendedAction = 'URGENT: Request is overdue. Immediate escalation required.'
  } else if (isCritical) {
    recommendedAction = 'CRITICAL: Request at 90% of SLA. Escalate immediately.'
  } else if (isWarning) {
    recommendedAction = 'WARNING: Request at 75% of SLA. Consider escalation.'
  }

  return {
    is_compliant: isCompliant,
    is_overdue: isOverdue,
    is_warning: isWarning,
    is_critical: isCritical,
    business_days_elapsed: businessDaysElapsed,
    business_days_remaining: businessDaysRemaining,
    percentage_used: Math.round(percentageUsed),
    due_date: dueDate,
    recommended_action: recommendedAction,
  }
}

/**
 * Track SLA compliance for all requests (admin dashboard)
 *
 * @returns SLA compliance summary
 */
export async function trackSlaCompliance(): Promise<{
  total_requests: number
  pending_requests: number
  overdue_requests: number
  warning_requests: number
  critical_requests: number
  compliant_requests: number
  sla_compliance_rate: number
  by_type: Record<ArcoRequestType, {
    total: number
    overdue: number
    avg_response_time: number
  }>
}> {
  const supabase = await createClient()

  // Get all non-terminal requests
  const { data: activeRequests, error } = await supabase
    .from('arco_requests')
    .select('*')
    .not('status', 'in', '("completed","denied","cancelled")')
    .order('created_at', { ascending: false })

  if (error) {
    throw new ArcoError(
      `Error tracking SLA: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  // Get completed requests for compliance rate calculation
  const { data: completedRequests } = await supabase
    .from('arco_requests')
    .select('*')
    .in('status', ['completed', 'denied'])
    .gte('created_at', getDateMonthsAgo(6)) // Last 6 months
    .order('created_at', { ascending: false })

  // Analyze active requests
  let overdueCount = 0
  let warningCount = 0
  let criticalCount = 0
  const byType: Record<string, {
    total: number
    overdue: number
    avg_response_time: number
  }> = {}

  for (const request of activeRequests || []) {
    const sla = await checkSlaCompliance(request)

    if (sla.is_overdue) overdueCount++
    if (sla.is_warning) warningCount++
    if (sla.is_critical) criticalCount++

    // Track by type
    if (!byType[request.request_type]) {
      byType[request.request_type] = {
        total: 0,
        overdue: 0,
        avg_response_time: 0,
      }
    }
    byType[request.request_type].total++
    if (sla.is_overdue) {
      byType[request.request_type].overdue++
    }
  }

  // Calculate compliance rate
  let compliantCount = 0
  let totalCompleted = 0
  const completedByType: Record<string, number[]> = {}

  for (const request of completedRequests || []) {
    if (request.completed_at) {
      const responseTime = calculateBusinessDays(request.created_at, request.completed_at)
      const wasCompliant = responseTime <= LEGAL_SLA_DAYS

      if (wasCompliant) compliantCount++
      totalCompleted++

      // Track average response time by type
      if (!completedByType[request.request_type]) {
        completedByType[request.request_type] = []
      }
      completedByType[request.request_type].push(responseTime)
    }
  }

  // Calculate average response times
  for (const type in completedByType) {
    if (byType[type]) {
      const times = completedByType[type]
      byType[type].avg_response_time = times.length > 0
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : 0
    }
  }

  const slaComplianceRate = totalCompleted > 0
    ? Math.round((compliantCount / totalCompleted) * 100)
    : 100

  return {
    total_requests: activeRequests?.length || 0,
    pending_requests: activeRequests?.length || 0,
    overdue_requests: overdueCount,
    warning_requests: warningCount,
    critical_requests: criticalCount,
    compliant_requests: (activeRequests?.length || 0) - overdueCount,
    sla_compliance_rate: slaComplianceRate,
    by_type: byType as Record<ArcoRequestType, {
      total: number
      overdue: number
      avg_response_time: number
    }>,
  }
}

/**
 * Get detailed SLA metrics for a specific period
 *
 * @param startDate - Period start date
 * @param endDate - Period end date
 * @returns Detailed SLA metrics
 */
export async function getSlaMetrics(
  startDate?: Date,
  endDate?: Date
): Promise<SlaComplianceMetrics> {
  const supabase = await createClient()

  // Default to last 6 months if not specified
  const start = startDate || getDateMonthsAgo(6)
  const end = endDate || new Date()

  // Get all requests in period
  const { data: requests, error } = await supabase
    .from('arco_requests')
    .select('*')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  if (error) {
    throw new ArcoError(
      `Error fetching SLA metrics: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  // Calculate metrics
  const totalRequests = requests?.length || 0
  const completedRequests = requests?.filter(r =>
    ['completed', 'denied', 'cancelled'].includes(r.status)
  ).length || 0
  const overdueRequests = requests?.filter(r =>
    new Date(r.due_date) < new Date() &&
    !['completed', 'denied', 'cancelled'].includes(r.status)
  ).length || 0

  // Calculate completion rate
  const completionRate = totalRequests > 0
    ? Math.round((completedRequests / totalRequests) * 100)
    : 0

  // Calculate SLA compliance rate
  let slaCompliantCount = 0
  let totalCompletedInTime = 0
  let totalResponseTime = 0

  const byType: Record<string, {
    total: number
    completed: number
    overdue: number
    avg_completion_time: number
  }> = {}

  for (const request of requests || []) {
    if (!byType[request.request_type]) {
      byType[request.request_type] = {
        total: 0,
        completed: 0,
        overdue: 0,
        avg_completion_time: 0,
      }
    }

    byType[request.request_type].total++

    if (request.completed_at) {
      const responseTime = calculateBusinessDays(request.created_at, request.completed_at)
      const wasCompliant = responseTime <= LEGAL_SLA_DAYS

      if (wasCompliant) slaCompliantCount++
      totalCompletedInTime++
      totalResponseTime += responseTime

      byType[request.request_type].completed++
    }

    if (
      new Date(request.due_date) < new Date() &&
      !['completed', 'denied', 'cancelled'].includes(request.status)
    ) {
      byType[request.request_type].overdue++
    }
  }

  // Calculate average completion times by type
  for (const type in byType) {
    const typeRequests = requests?.filter(r => r.request_type === type && r.completed_at)
    if (typeRequests && typeRequests.length > 0) {
      const totalTime = typeRequests.reduce((sum, r) => {
        return sum + calculateBusinessDays(r.created_at, r.completed_at!)
      }, 0)
      byType[type].avg_completion_time = Math.round(totalTime / typeRequests.length)
    }
  }

  const slaComplianceRate = totalCompletedInTime > 0
    ? Math.round((slaCompliantCount / totalCompletedInTime) * 100)
    : 100

  const averageResponseTime = totalCompletedInTime > 0
    ? Math.round(totalResponseTime / totalCompletedInTime)
    : 0

  return {
    period_start: start.toISOString(),
    period_end: end.toISOString(),
    total_requests: totalRequests,
    completed_requests: completedRequests,
    overdue_requests: overdueRequests,
    completion_rate: completionRate,
    sla_compliance_rate: slaComplianceRate,
    average_response_time_days: averageResponseTime,
    by_type: byType as Record<ArcoRequestType, {
      total: number
      completed: number
      overdue: number
      avg_completion_time: number
    }>,
  }
}

// ================================================
// NOTIFICATIONS
// ================================================

/**
 * Check for requests that need SLA reminders
 *
 * @returns Requests that need reminders
 */
export async function getRequestsNeedingReminders(): Promise<{
  warning: ArcoRequestRow[]
  critical: ArcoRequestRow[]
  overdue: ArcoRequestRow[]
}> {
  const supabase = await createClient()

  const now = new Date()
  const warningDate = addBusinessDays(now, LEGAL_SLA_DAYS - WARNING_THRESHOLD_DAYS)
  const criticalDate = addBusinessDays(now, LEGAL_SLA_DAYS - CRITICAL_THRESHOLD_DAYS)

  // Get all pending requests
  const { data: requests } = await supabase
    .from('arco_requests')
    .select('*')
    .not('status', 'in', '("completed","denied","cancelled")')

  const warning: ArcoRequestRow[] = []
  const critical: ArcoRequestRow[] = []
  const overdue: ArcoRequestRow[] = []

  for (const request of requests || []) {
    const sla = await checkSlaCompliance(request)

    if (sla.is_overdue) {
      // Only add if not reminded in last 24 hours
      if (shouldSendReminder(request, 'overdue')) {
        overdue.push(request)
      }
    } else if (sla.is_critical) {
      if (shouldSendReminder(request, 'critical')) {
        critical.push(request)
      }
    } else if (sla.is_warning) {
      if (shouldSendReminder(request, 'warning')) {
        warning.push(request)
      }
    }
  }

  return { warning, critical, overdue }
}

/**
 * Check if a reminder should be sent for a request
 *
 * @param request - ARCO request
 * @param level - Reminder level
 * @returns True if reminder should be sent
 */
function shouldSendReminder(
  request: ArcoRequestRow,
  level: 'warning' | 'critical' | 'overdue'
): boolean {
  if (!request.last_reminder_at) return true

  const lastReminder = new Date(request.last_reminder_at)
  const now = new Date()
  const hoursSinceReminder = (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60)

  // Don't send more than one reminder per 24 hours
  return hoursSinceReminder >= 24
}

/**
 * Mark a request as having received a reminder
 *
 * @param requestId - Request ID
 */
export async function markReminderSent(requestId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('arco_requests')
    .update({ last_reminder_at: new Date().toISOString() })
    .eq('id', requestId)
}

// ================================================
// REPORTING
// ================================================

/**
 * Generate SLA compliance report
 *
 * @param months - Number of months to include
 * @returns SLA report data
 */
export async function generateSlaReport(months = 6): Promise<{
  summary: {
    period: string
    total_requests: number
    sla_compliance_rate: number
    avg_response_time: number
    overdue_rate: number
  }
  by_month: Array<{
    month: string
    total: number
    completed: number
    overdue: number
    compliance_rate: number
  }>
  by_type: Array<{
    type: string
    total: number
    completed: number
    overdue: number
    avg_completion_time: number
    compliance_rate: number
  }>
}> {
  const supabase = await createClient()
  const startDate = getDateMonthsAgo(months)

  // Get all requests in period
  const { data: requests } = await supabase
    .from('arco_requests')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  // Group by month
  const byMonth: Record<string, {
    total: number
    completed: number
    overdue: number
    compliant: number
  }> = {}

  // Group by type
  const byType: Record<string, {
    total: number
    completed: number
    overdue: number
    total_completion_time: number
    completed_count: number
    compliant: number
  }> = {}

  let totalCompliant = 0
  let totalCompleted = 0
  let totalCompletionTime = 0

  for (const request of requests || []) {
    const monthKey = request.created_at.slice(0, 7) // YYYY-MM

    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { total: 0, completed: 0, overdue: 0, compliant: 0 }
    }
    byMonth[monthKey].total++

    if (!byType[request.request_type]) {
      byType[request.request_type] = {
        total: 0,
        completed: 0,
        overdue: 0,
        total_completion_time: 0,
        completed_count: 0,
        compliant: 0,
      }
    }
    byType[request.request_type].total++

    // Check if completed
    if (request.completed_at) {
      const completionTime = calculateBusinessDays(
        request.created_at,
        request.completed_at
      )
      const isCompliant = completionTime <= LEGAL_SLA_DAYS

      byMonth[monthKey].completed++
      byType[request.request_type].completed++
      byType[request.request_type].total_completion_time += completionTime
      byType[request.request_type].completed_count++

      if (isCompliant) {
        byMonth[monthKey].compliant++
        byType[request.request_type].compliant++
        totalCompliant++
      }

      totalCompleted++
      totalCompletionTime += completionTime
    }

    // Check if overdue
    if (
      new Date(request.due_date) < new Date() &&
      !['completed', 'denied', 'cancelled'].includes(request.status)
    ) {
      byMonth[monthKey].overdue++
      byType[request.request_type].overdue++
    }
  }

  // Calculate monthly compliance rates
  const monthlyData = Object.entries(byMonth)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, data]) => ({
      month,
      total: data.total,
      completed: data.completed,
      overdue: data.overdue,
      compliance_rate: data.completed > 0
        ? Math.round((data.compliant / data.completed) * 100)
        : 100,
    }))

  // Calculate type compliance rates
  const typeData = Object.entries(byType).map(([type, data]) => ({
    type,
    total: data.total,
    completed: data.completed,
    overdue: data.overdue,
    avg_completion_time: data.completed_count > 0
      ? Math.round(data.total_completion_time / data.completed_count)
      : 0,
    compliance_rate: data.completed_count > 0
      ? Math.round((data.compliant / data.completed_count) * 100)
      : 100,
  }))

  const totalRequests = requests?.length || 0
  const slaComplianceRate = totalCompleted > 0
    ? Math.round((totalCompliant / totalCompleted) * 100)
    : 100
  const avgResponseTime = totalCompleted > 0
    ? Math.round(totalCompletionTime / totalCompleted)
    : 0

  const totalOverdue = Object.values(byMonth).reduce((sum, m) => sum + m.overdue, 0)
  const overdueRate = totalRequests > 0
    ? Math.round((totalOverdue / totalRequests) * 100)
    : 0

  return {
    summary: {
      period: `${startDate.toISOString().slice(0, 10)} to ${new Date().toISOString().slice(0, 10)}`,
      total_requests: totalRequests,
      sla_compliance_rate: slaComplianceRate,
      avg_response_time: avgResponseTime,
      overdue_rate: overdueRate,
    },
    by_month: monthlyData,
    by_type: typeData,
  }
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Get date N months ago
 *
 * @param months - Number of months to go back
 * @returns Date
 */
function getDateMonthsAgo(months: number): Date {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return date
}

/**
 * Calculate SLA risk level for a request
 *
 * @param request - ARCO request
 * @returns Risk level: 'low', 'medium', 'high', 'critical'
 */
export async function getSlaRiskLevel(request: ArcoRequestRow): Promise<{
  level: 'low' | 'medium' | 'high' | 'critical'
  color: string
  description: string
}> {
  const sla = await checkSlaCompliance(request)

  if (sla.is_overdue) {
    return {
      level: 'critical',
      color: 'red',
      description: 'Solicitud vencida - Acción inmediata requerida',
    }
  }

  if (sla.is_critical) {
    return {
      level: 'high',
      color: 'orange',
      description: 'Crítico - 90% del tiempo SLA utilizado',
    }
  }

  if (sla.is_warning) {
    return {
      level: 'medium',
      color: 'yellow',
      description: 'Precaución - 75% del tiempo SLA utilizado',
    }
  }

  return {
    level: 'low',
    color: 'green',
    description: 'Dentro de los límites SLA',
  }
}

