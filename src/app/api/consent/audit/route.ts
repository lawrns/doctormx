/**
 * GET /api/consent/audit
 * 
 * Obtiene logs de auditoría de consentimientos para administradores.
 * Permite ver la trazabilidad completa de cambios de consentimiento.
 * Requiere rol de administrador.
 * 
 * @query {string} user_id - ID de usuario específico (opcional)
 * @query {string} event_type - Tipo de evento a filtrar (opcional)
 * @query {string} start_date - Fecha inicial ISO (opcional)
 * @query {string} end_date - Fecha final ISO (opcional)
 * @query {number} limit - Límite de resultados (opcional, default: 100)
 * @query {number} offset - Offset para paginación (opcional, default: 0)
 * @returns {ConsentAuditLog[]} Logs de auditoría
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { 
  getAllAuditLogs,
  getAuditLogsForUser,
  getAuditLogStatistics,
  CONSENT_TYPE_LABELS,
} from '@/lib/consent'
import type { ConsentAuditEventType } from '@/lib/consent'
import { logger } from '@/lib/observability/logger'

// Esquema de validación para query params
const AuditQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
  event_type: z.enum([
    'consent_granted',
    'consent_withdrawn',
    'consent_expired',
    'consent_revoked',
    'consent_modified',
    'consent_requested',
    'consent_viewed',
    'consent_declined',
    'version_updated',
    'guardian_consent_added',
    'guardian_consent_removed',
    'bulk_consent_operation',
    'consent_export',
    'consent_import',
  ] as const).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
  include_stats: z.enum(['true', 'false']).default('false'),
})

// Función para verificar si el usuario es administrador
async function isAdmin(supabase: ReturnType<typeof createClient>): Promise<boolean> {
  const { data: { user } } = await (await supabase).auth.getUser()
  
  if (!user) return false

  // Verificar en tabla de admins o roles
  const { data: profile } = await (await supabase)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin' || profile?.role === 'superadmin'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Se requiere autenticación' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea administrador
    const adminCheck = await isAdmin(Promise.resolve(supabase))
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Se requieren privilegios de administrador' },
        { status: 403 }
      )
    }

    // Parsear query params
    const { searchParams } = new URL(request.url)
    const queryData = {
      user_id: searchParams.get('user_id') || undefined,
      event_type: searchParams.get('event_type') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      include_stats: searchParams.get('include_stats') || 'false',
    }

    const validationResult = AuditQuerySchema.safeParse(queryData)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          message: 'Parámetros de consulta inválidos',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const params = validationResult.data

    // Preparar opciones de filtro
    const options: {
      eventType?: ConsentAuditEventType
      startDate?: Date
      endDate?: Date
      limit?: number
      offset?: number
    } = {}

    if (params.event_type) {
      options.eventType = params.event_type as ConsentAuditEventType
    }
    if (params.start_date) {
      options.startDate = new Date(params.start_date)
    }
    if (params.end_date) {
      options.endDate = new Date(params.end_date)
    }
    if (params.limit) {
      options.limit = params.limit
    }
    if (params.offset) {
      options.offset = params.offset
    }

    // Obtener logs de auditoría
    let auditLogs
    if (params.user_id) {
      // Logs específicos de un usuario
      auditLogs = await getAuditLogsForUser(params.user_id, options)
    } else {
      // Todos los logs (admin)
      auditLogs = await getAllAuditLogs(options)
    }

    // Enriquecer los logs con información adicional
    const enrichedLogs = auditLogs.map((log) => ({
      id: log.id,
      event_type: log.event_type,
      user_id: log.user_id,
      consent_type: log.consent_type,
      consent_type_label: log.consent_type 
        ? CONSENT_TYPE_LABELS[log.consent_type] 
        : null,
      consent_record_id: log.consent_record_id,
      action: log.action,
      action_result: log.action_result,
      error_message: log.error_message,
      actor_user_id: log.actor_user_id,
      actor_role: log.actor_role,
      actor_ip_address: log.actor_ip_address,
      actor_user_agent: log.actor_user_agent,
      session_id: log.session_id,
      request_id: log.request_id,
      correlation_id: log.correlation_id,
      occurred_at: log.occurred_at,
      created_at: log.created_at,
      // Incluir cambios de datos si existen
      data_changes: log.data_changes,
    }))

    // Preparar respuesta
    const response: {
      success: boolean
      data: {
        logs: typeof enrichedLogs
        total: number
        limit: number
        offset: number
      }
      statistics?: Record<string, unknown>
    } = {
      success: true,
      data: {
        logs: enrichedLogs,
        total: enrichedLogs.length,
        limit: params.limit,
        offset: params.offset,
      },
    }

    // Incluir estadísticas si se solicitan
    if (params.include_stats === 'true' && params.start_date && params.end_date) {
      const stats = await getAuditLogStatistics(
        new Date(params.start_date),
        new Date(params.end_date)
      )
      response.statistics = stats
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error fetching consent audit logs:', { err: error })
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error al obtener los logs de auditoría' 
      },
      { status: 500 }
    )
  }
}
