// Follow-up System Verification Endpoint
// GET: Comprehensive health check and testing for the follow-up system

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getFollowUpStats,
  getRetryableFollowUps,
  hasPatientOptedOut,
  recordOptOut,
  getPendingFollowUps,
  scheduleFollowUp,
} from '@/lib/followup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface VerificationResult {
  name: string
  status: 'pass' | 'fail' | 'warn' | 'degraded'
  message: string
  details?: Record<string, unknown>
}

interface HealthCheckResponse {
  overall: 'healthy' | 'degraded' | 'unhealthy'
  checks: VerificationResult[]
  timestamp: string
}

async function checkDatabaseConnection(): Promise<VerificationResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('followups').select('id').limit(1)

    if (error) {
      return {
        name: 'Database Connection',
        status: 'fail',
        message: 'Failed to connect to database',
        details: { error: error.message },
      }
    }

    return {
      name: 'Database Connection',
      status: 'pass',
      message: 'Database connection successful',
    }
  } catch (error) {
    return {
      name: 'Database Connection',
      status: 'fail',
      message: 'Exception during database connection',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    }
  }
}

async function checkFollowupTables(): Promise<VerificationResult> {
  try {
    const supabase = await createClient()

    // Check main followups table
    const { count: followupsCount } = await supabase
      .from('followups')
      .select('*', { count: 'exact', head: true })

    // Check followup_audit table
    const { error: auditError } = await supabase
      .from('followup_audit')
      .select('id')
      .limit(1)

    // Check followup_opt_outs table
    const { error: optOutError } = await supabase
      .from('followup_opt_outs')
      .select('id')
      .limit(1)

    const issues: string[] = []
    if (auditError) issues.push(`followup_audit: ${auditError.message}`)
    if (optOutError) issues.push(`followup_opt_outs: ${optOutError.message}`)

    if (issues.length > 0) {
      return {
        name: 'Follow-up Tables',
        status: 'warn',
        message: 'Some enhancement tables are missing',
        details: {
          issues,
          recommendation: 'Run migration 009_followup_enhancements.sql',
        },
      }
    }

    return {
      name: 'Follow-up Tables',
      status: 'pass',
      message: 'All follow-up tables exist',
      details: { totalFollowUps: followupsCount ?? 0 },
    }
  } catch (error) {
    return {
      name: 'Follow-up Tables',
      status: 'fail',
      message: 'Exception checking tables',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    }
  }
}

async function checkPendingFollowUps(): Promise<VerificationResult> {
  try {
    const pending = await getPendingFollowUps()

    // Get overdue follow-ups (scheduled more than 1 hour ago)
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const overdue = pending.filter(f => new Date(f.scheduled_at) < oneHourAgo)

    if (overdue.length > 10) {
      return {
        name: 'Pending Follow-ups',
        status: 'degraded',
        message: `${overdue.length} overdue follow-ups detected`,
        details: {
          totalPending: pending.length,
          overdueCount: overdue.length,
          recommendation: 'Cron job may not be running',
        },
      }
    }

    return {
      name: 'Pending Follow-ups',
      status: 'pass',
      message: `${pending.length} pending follow-ups`,
      details: { overdueCount: overdue.length },
    }
  } catch (error) {
    return {
      name: 'Pending Follow-ups',
      status: 'fail',
      message: 'Failed to check pending follow-ups',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    }
  }
}

async function checkRetryableFollowUps(): Promise<VerificationResult> {
  try {
    const retryable = await getRetryableFollowUps()

    return {
      name: 'Retryable Follow-ups',
      status: retryable.length > 0 ? 'warn' : 'pass',
      message: retryable.length > 0
        ? `${retryable.length} follow-ups ready for retry`
        : 'No follow-ups awaiting retry',
      details: { retryableCount: retryable.length },
    }
  } catch (error) {
    // This might fail if enhancement tables don't exist
    return {
      name: 'Retryable Follow-ups',
      status: 'warn',
      message: 'Retry logic not available - run enhancement migration',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    }
  }
}

async function checkEnvironmentVariables(): Promise<VerificationResult> {
  const required = [
    'CRON_SECRET',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
  ]

  const optional = [
    'TWILIO_WHATSAPP_NUMBER',
  ]

  const missing: string[] = []
  const missingOptional: string[] = []

  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  for (const varName of optional) {
    if (!process.env[varName]) {
      missingOptional.push(varName)
    }
  }

  if (missing.length > 0) {
    return {
      name: 'Environment Variables',
      status: 'fail',
      message: 'Missing required environment variables',
      details: { missing, missingOptional },
    }
  }

  return {
    name: 'Environment Variables',
    status: missingOptional.length > 0 ? 'warn' : 'pass',
    message: missingOptional.length > 0
      ? 'All required variables set, some optional missing'
      : 'All environment variables configured',
    details: { missingOptional },
  }
}

async function checkFollowUpStats(): Promise<VerificationResult> {
  try {
    const stats = await getFollowUpStats(7) // Last 7 days

    // Calculate health metrics
    const successRate = stats.total > 0 ? (stats.sent / stats.total) * 100 : 0
    const failureRate = stats.total > 0 ? (stats.failed / stats.total) * 100 : 0

    let status: 'pass' | 'warn' | 'fail' = 'pass'
    let message = `${successRate.toFixed(1)}% success rate (7 days)`

    if (failureRate > 20) {
      status = 'fail'
      message = `${failureRate.toFixed(1)}% failure rate - critical`
    } else if (failureRate > 10) {
      status = 'warn'
      message = `${failureRate.toFixed(1)}% failure rate - elevated`
    }

    return {
      name: 'Follow-up Success Rate',
      status,
      message,
      details: {
        period: '7 days',
        total: stats.total,
        sent: stats.sent,
        failed: stats.failed,
        pending: stats.pending,
        retryRate: stats.retryRate.toFixed(1) + '%',
        optOuts: stats.optOuts,
      },
    }
  } catch (error) {
    return {
      name: 'Follow-up Success Rate',
      status: 'warn',
      message: 'Could not calculate statistics',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    }
  }
}

async function checkCronJobConfiguration(): Promise<VerificationResult> {
  // This is informational - we can't actually verify the cron job is running
  // without external monitoring
  return {
    name: 'Cron Job Configuration',
    status: 'warn',
    message: 'Cron job status cannot be verified from within the app',
    details: {
      cronEndpoint: '/api/cron/followups',
      recommendedSchedule: '*/15 * * * * (every 15 minutes)',
      verificationCommand: `curl -H "Authorization: Bearer \$CRON_SECRET" https://your-domain.com/api/cron/followups`,
      monitoringAdvice: 'Use external monitoring (e.g., UptimeRobot, Cronitor) to verify cron execution',
    },
  }
}

export async function GET(request: NextRequest) {
  // Verify admin access
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  // Run all health checks
  const checks = await Promise.all([
    checkDatabaseConnection(),
    checkFollowupTables(),
    checkPendingFollowUps(),
    checkRetryableFollowUps(),
    checkEnvironmentVariables(),
    checkFollowUpStats(),
    checkCronJobConfiguration(),
  ])

  // Determine overall health
  const failedChecks = checks.filter(c => c.status === 'fail')
  const warnChecks = checks.filter(c => c.status === 'warn')

  let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  if (failedChecks.length > 0) {
    overall = 'unhealthy'
  } else if (warnChecks.length > 0) {
    overall = 'degraded'
  }

  return NextResponse.json({
    overall,
    checks,
    timestamp: new Date().toISOString(),
  } satisfies HealthCheckResponse)
}

// POST endpoint to test follow-up creation
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.email?.endsWith('@doctormx.com')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { action } = body

  if (action === 'create_test_followup') {
    // Create a test follow-up for the current user
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id')
      .eq('patient_id', user.id)
      .order('start_ts', { ascending: false })
      .limit(1)

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No appointments found for testing',
      })
    }

    const result = await scheduleFollowUp({
      appointmentId: (appointments[0] as { id: string }).id,
      type: 'follow_up_24h',
      scheduledAt: new Date(Date.now() + 60 * 1000), // 1 minute from now
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test follow-up created - it will be processed in 1 minute',
        followUpId: result.followUpId,
      })
    }

    return NextResponse.json({
      success: false,
      error: result.error,
    })
  }

  if (action === 'test_opt_out') {
    // Test opt-out functionality
    const optOutResult = await recordOptOut(
      user.id,
      'followups',
      'web',
      'Testing opt-out functionality'
    )

    return NextResponse.json({
      success: optOutResult.success,
      error: optOutResult.error,
      message: optOutResult.success ? 'Opt-out recorded successfully' : 'Failed to record opt-out',
    })
  }

  return NextResponse.json({
    error: 'Unknown action',
    availableActions: ['create_test_followup', 'test_opt_out'],
  }, { status: 400 })
}
