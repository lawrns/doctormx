/**
 * ARCO Statistics API Route
 *
 * GET /api/arco/stats - Obtener estadísticas del sistema ARCO (admin only)
 *
 * Proporciona métricas sobre:
 * - Solicitudes por tipo y estado
 * - Cumplimiento de SLA (20 días hábiles)
 * - Tiempos de respuesta promedio
 * - Solicitudes vencidas
 * - Escalaciones
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  trackSlaCompliance, 
  getSlaMetrics,
  generateSlaReport 
} from '@/lib/arco/sla-tracker'
import { 
  getEscalationStats,
  autoEscalateRequests 
} from '@/lib/arco/escalation'
import { ArcoError, type ArcoRequestType } from '@/types/arco'
import { logger } from '@/lib/observability/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Helper function to check if user is admin
 */
async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role === 'admin'
}

/**
 * GET /api/arco/stats
 *
 * Obtener estadísticas del sistema ARCO
 *
 * Query params:
 * - period: '7d' | '30d' | '90d' | '6m' | '1y' - período de análisis (default: '30d')
 * - detailed: boolean - incluir métricas detalladas (default: false)
 * - include_overdue: boolean - incluir lista de solicitudes vencidas (default: true)
 * - include_escalations: boolean - incluir estadísticas de escalación (default: true)
 *
 * Response:
 * - summary: resumen general de solicitudes
 * - sla_metrics: métricas de cumplimiento de SLA
 * - by_type: desglose por tipo de solicitud
 * - by_status: desglose por estado
 * - escalations: estadísticas de escalación
 * - overdue: lista de solicitudes vencidas
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Se requiere autenticación' } },
      { status: 401 }
    )
  }

  // Verify admin role
  const userIsAdmin = await isAdmin(supabase, user.id)
  if (!userIsAdmin) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Solo administradores pueden ver estadísticas ARCO' } },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)

    // Parse query params
    const period = searchParams.get('period') ?? '30d'
    const detailed = searchParams.get('detailed') === 'true'
    const includeOverdue = searchParams.get('include_overdue') !== 'false'
    const includeEscalations = searchParams.get('include_escalations') !== 'false'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case '30d':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get SLA compliance metrics
    const slaMetrics = await trackSlaCompliance()

    // Get detailed SLA metrics for the period
    const detailedSlaMetrics = await getSlaMetrics(startDate, now)

    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('arco_requests')
      .select('status, request_type')
      .gte('created_at', startDate.toISOString())

    if (statusError) {
      throw new ArcoError(
        `Error fetching status counts: ${statusError.message}`,
        'INTERNAL_ERROR',
        500
      )
    }

    // Calculate counts by status
    const byStatus: Record<string, number> = {}
    const byType: Record<ArcoRequestType, { total: number; completed: number; pending: number; overdue: number }> = {
      ACCESS: { total: 0, completed: 0, pending: 0, overdue: 0 },
      RECTIFY: { total: 0, completed: 0, pending: 0, overdue: 0 },
      CANCEL: { total: 0, completed: 0, pending: 0, overdue: 0 },
      OPPOSE: { total: 0, completed: 0, pending: 0, overdue: 0 },
    }

    for (const request of statusCounts || []) {
      // Count by status
      byStatus[request.status] = (byStatus[request.status] ?? 0) + 1

      // Count by type
      if (byType[request.request_type as ArcoRequestType]) {
        byType[request.request_type as ArcoRequestType].total++
        
        if (['completed', 'denied'].includes(request.status)) {
          byType[request.request_type as ArcoRequestType].completed++
        } else if (request.status === 'pending') {
          byType[request.request_type as ArcoRequestType].pending++
        }
      }
    }

    // Get overdue requests if requested
    let overdueRequests = null
    if (includeOverdue) {
      const { data: overdue } = await supabase
        .from('arco_requests')
        .select(`
          id,
          user_id,
          request_type,
          status,
          title,
          created_at,
          due_date,
          user:profiles!arco_requests_user_id_fkey (full_name, email)
        `)
        .not('status', 'in', '("completed","denied","cancelled")')
        .lt('due_date', now.toISOString())
        .order('due_date', { ascending: true })
        .limit(50)

      overdueRequests = overdue || []
    }

    // Get escalation stats if requested
    let escalationStats = null
    if (includeEscalations) {
      escalationStats = await getEscalationStats()
    }

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('arco_request_history')
      .select(`
        id,
        request_id,
        old_status,
        new_status,
        change_reason,
        created_at,
        changer:profiles!arco_request_history_changed_by_fkey (full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    // Build response
    const response: {
      success: boolean
      data: {
        summary: {
          period: string
          total_requests: number
          active_requests: number
          completed_requests: number
          cancelled_requests: number
          denied_requests: number
          overdue_count: number
          sla_compliance_rate: number
        }
        by_status: Record<string, number>
        by_type: Record<ArcoRequestType, { total: number; completed: number; pending: number; overdue: number }>
        sla_metrics?: typeof detailedSlaMetrics
        escalations?: typeof escalationStats
        overdue_requests?: typeof overdueRequests
        recent_activity?: typeof recentActivity
      }
    } = {
      success: true,
      data: {
        summary: {
          period: `${startDate.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`,
          total_requests: statusCounts?.length ?? 0,
          active_requests: slaMetrics.pending_requests,
          completed_requests: byStatus['completed'] ?? 0,
          cancelled_requests: byStatus['cancelled'] ?? 0,
          denied_requests: byStatus['denied'] ?? 0,
          overdue_count: slaMetrics.overdue_requests,
          sla_compliance_rate: slaMetrics.sla_compliance_rate,
        },
        by_status: byStatus,
        by_type: byType,
      },
    }

    // Add detailed metrics if requested
    if (detailed) {
      response.data.sla_metrics = detailedSlaMetrics
    }

    // Add escalations if requested
    if (includeEscalations) {
      response.data.escalations = escalationStats
    }

    // Add overdue requests if requested
    if (includeOverdue) {
      response.data.overdue_requests = overdueRequests
    }

    // Always include recent activity
    response.data.recent_activity = recentActivity

    return NextResponse.json(response)

  } catch (error) {
    logger.error('Error fetching ARCO stats:', { err: error, userId: user.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener las estadísticas' } },
      { status: 500 }
    )
  }
}

/**
 * POST /api/arco/stats
 *
 * Acciones administrativas sobre estadísticas ARCO
 *
 * Body:
 * - action: 'generate_report' | 'auto_escalate' | 'export_csv'
 * - period: string - período para el reporte (para generate_report)
 *
 * Acciones:
 * - generate_report: Generar reporte detallado de SLA
 * - auto_escalate: Ejecutar escalación automática de solicitudes
 * - export_csv: Exportar estadísticas a CSV
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Se requiere autenticación' } },
      { status: 401 }
    )
  }

  // Verify admin role
  const userIsAdmin = await isAdmin(supabase, user.id)
  if (!userIsAdmin) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Solo administradores pueden ejecutar acciones ARCO' } },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { action, period = 6 } = body

    switch (action) {
      case 'generate_report': {
        const report = await generateSlaReport(period)
        return NextResponse.json({
          success: true,
          data: {
            report,
            generated_at: new Date().toISOString(),
            generated_by: user.id,
          },
        })
      }

      case 'auto_escalate': {
        const result = await autoEscalateRequests()
        return NextResponse.json({
          success: true,
          data: {
            result,
            executed_at: new Date().toISOString(),
            executed_by: user.id,
          },
        })
      }

      case 'export_csv': {
        // Get all requests for the period
        const months = parseInt(period as string, 10) || 6
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - months)

        const { data: requests } = await supabase
          .from('arco_requests')
          .select(`
            id,
            request_type,
            status,
            title,
            created_at,
            due_date,
            completed_at,
            escalation_level,
            priority,
            user:profiles!arco_requests_user_id_fkey (full_name, email)
          `)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })

        if (!requests || requests.length === 0) {
          return NextResponse.json(
            { success: false, error: { code: 'NO_DATA', message: 'No hay datos para exportar' } },
            { status: 404 }
          )
        }

        // Generate CSV
        const headers = [
          'ID',
          'Tipo',
          'Estado',
          'Título',
          'Usuario',
          'Email',
          'Fecha Creación',
          'Fecha Vencimiento',
          'Fecha Completado',
          'Nivel Escalación',
          'Prioridad',
        ]

        const rows = requests.map((req: Record<string, unknown>) => [
          req.id,
          req.request_type,
          req.status,
          `"${(req.title as string)?.replace(/"/g, '""')}"`,
          (req.user as { full_name?: string })?.full_name ?? '',
          (req.user as { email?: string })?.email ?? '',
          req.created_at,
          req.due_date,
          req.completed_at ?? '',
          req.escalation_level,
          req.priority,
        ])

        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="arco-stats-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_ACTION', message: 'Acción no válida' } },
          { status: 400 }
        )
    }

  } catch (error) {
    logger.error('Error executing ARCO stats action:', { err: error, userId: user.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al ejecutar la acción' } },
      { status: 500 }
    )
  }
}
