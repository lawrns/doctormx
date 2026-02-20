/**
 * GET /api/consent/history
 * 
 * Obtiene el historial completo de cambios de consentimiento del usuario autenticado.
 * Incluye otorgamientos, retiros, modificaciones y expiraciones.
 * Soporta exportación en formato JSON o CSV.
 * 
 * @query {string} format - Formato de exportación ('json' o 'csv')
 * @query {string} consent_type - Filtrar por tipo de consentimiento (opcional)
 * @query {string} start_date - Fecha inicial ISO (opcional)
 * @query {string} end_date - Fecha final ISO (opcional)
 * @query {number} limit - Límite de resultados (opcional, default: 100)
 * @returns {ConsentHistoryEntry[]} Historial de cambios de consentimiento
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { 
  getConsentHistoryForUser,
  exportConsentHistory,
  CONSENT_TYPE_LABELS,
} from '@/lib/consent'
import type { ConsentType } from '@/lib/consent'
import { logger } from '@/lib/observability/logger'

// Esquema de validación para query params
const HistoryQuerySchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  consent_type: z.enum([
    'medical_treatment',
    'data_processing',
    'telemedicine',
    'recording',
    'ai_analysis',
    'data_sharing',
    'research',
    'marketing',
    'emergency_contact',
    'prescription_forwarding',
  ] as const).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
})

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

    // Parsear query params
    const { searchParams } = new URL(request.url)
    const queryData = {
      format: searchParams.get('format') ?? 'json',
      consent_type: searchParams.get('consent_type') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
    }

    const validationResult = HistoryQuerySchema.safeParse(queryData)

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
      consentType?: string
      startDate?: Date
      endDate?: Date
      limit?: number
    } = {}

    if (params.consent_type) {
      options.consentType = params.consent_type
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

    // Si solicita CSV, exportar directamente
    if (params.format === 'csv') {
      const csvData = await exportConsentHistory(user.id, 'csv')
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="consent-history-${user.id}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Obtener historial en formato JSON
    const history = await getConsentHistoryForUser(user.id, options)

    // Enriquecer el historial con información adicional
    const enrichedHistory = await Promise.all(
      history.map(async (entry) => {
        // Obtener información del consentimiento
        const { data: consentRecord } = await supabase
          .from('user_consent_records')
          .select('consent_type')
          .eq('id', entry.consent_record_id)
          .single()

        return {
          id: entry.id,
          consent_record_id: entry.consent_record_id,
          consent_type: consentRecord?.consent_type,
          consent_type_label: consentRecord?.consent_type 
            ? CONSENT_TYPE_LABELS[consentRecord.consent_type as ConsentType] 
            : 'Desconocido',
          action: entry.action,
          old_status: entry.old_status,
          new_status: entry.new_status,
          old_consent_version_id: entry.old_consent_version_id,
          new_consent_version_id: entry.new_consent_version_id,
          changed_by: entry.changed_by,
          changed_by_role: entry.changed_by_role,
          change_reason: entry.change_reason,
          ip_address: entry.ip_address,
          created_at: entry.created_at,
        }
      })
    )

    // Calcular estadísticas
    const stats = {
      total_entries: enrichedHistory.length,
      by_action: enrichedHistory.reduce((acc, entry) => {
        acc[entry.action] = (acc[entry.action] ?? 0) + 1
        return acc
      }, {} as Record<string, number>),
      by_consent_type: enrichedHistory.reduce((acc, entry) => {
        const type = entry.consent_type ?? 'unknown'
        acc[type] = (acc[type] ?? 0) + 1
        return acc
      }, {} as Record<string, number>),
    }

    return NextResponse.json({
      success: true,
      data: {
        history: enrichedHistory,
        statistics: stats,
        user_id: user.id,
        exported_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    logger.error('Error fetching consent history:', { err: error })
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error al obtener el historial de consentimientos' 
      },
      { status: 500 }
    )
  }
}
