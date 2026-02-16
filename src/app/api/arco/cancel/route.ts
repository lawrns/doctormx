/**
 * ARCO Cancellation API Route
 *
 * POST /api/arco/cancel - Solicitar cancelación de datos personales
 *
 * Este endpoint permite a los usuarios solicitar la eliminación de sus
 * datos personales de los sistemas de Doctor.mx (Derecho de Cancelación ARCO).
 * 
 * Nota: Algunos datos pueden no eliminarse completamente debido a:
 * - Requisitos legales de retención (NOM-004-SSA3-2012: 5 años para expedientes médicos)
 * - Requisitos fiscales (SAT: 5 años para registros de pagos)
 * - Relaciones de base de datos (se anonimizarán en su lugar)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createArcoRequest,
  getArcoRequestTemplate,
  isValidDataScope,
  planDataDeletion,
  type CreateArcoRequestInput,
} from '@/lib/arco'
import { ArcoError } from '@/types/arco'
import { logger } from '@/lib/observability/logger'
import { z } from 'zod'

// Validation schema for cancellation request
const cancelSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  data_scope: z.array(z.enum(['profiles', 'appointments', 'prescriptions', 'soap_consultations', 'chat_conversations', 'chat_messages', 'payments', 'follow_up_schedules', 'all'])).default(['all']),
  specific_records: z.array(z.string()).optional(),
  justification: z.string().max(1000).optional(),
  acknowledge_retention: z.boolean().default(false),
})

/**
 * POST /api/arco/cancel
 *
 * Crear una solicitud de cancelación de datos personales
 *
 * Body:
 * - description?: string - descripción de la solicitud
 * - title?: string - título personalizado
 * - data_scope?: string[] - tablas a eliminar (default: ['all'])
 * - specific_records?: string[] - registros específicos a eliminar
 * - justification?: string - justificación adicional
 * - acknowledge_retention?: boolean - aceptar que algunos datos se retendrán
 *
 * Response:
 * - success: boolean
 * - data: { request, template, deletion_plan, sla_days, due_date }
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

  try {
    const body = await request.json()

    // Validate request body
    const validationResult = cancelSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Datos de entrada inválidos',
            details: errors,
          } 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Validate data scope
    if (!isValidDataScope(data.data_scope)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_DATA_SCOPE', 
            message: 'El alcance de datos especificado no es válido' 
          } 
        },
        { status: 400 }
      )
    }

    // Get template for CANCEL request type
    const template = getArcoRequestTemplate('CANCEL')

    // Build description with retention notice if not acknowledged
    let description = data.description || template.description
    
    if (!data.acknowledge_retention) {
      description += '\n\nNota: El usuario no ha confirmado el entendimiento de las políticas de retención de datos.'
    }

    // Add retention policy information
    description += '\n\nInformación de retención:\n'
    description += '- Expedientes médicos: 5 años (NOM-004-SSA3-2012)\n'
    description += '- Registros de pagos: 5 años (requisitos fiscales SAT)\n'
    description += '- Perfil de usuario: Se anonimizará para mantener integridad de base de datos\n'
    description += '- Historial de chat: 2 años (retención recomendada)'

    // Get request headers for metadata
    const headers = request.headers
    const userAgent = headers.get('user-agent') || undefined
    const forwardedFor = headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined

    // Prepare input for CANCEL request
    const input: CreateArcoRequestInput = {
      request_type: 'CANCEL',
      title: data.title || template.title,
      description: description,
      data_scope: data.data_scope,
      specific_records: data.specific_records,
      justification: data.justification,
      submitted_via: 'web',
      ip_address: ipAddress,
      user_agent: userAgent,
    }

    // Create the cancellation request
    const arcoRequest = await createArcoRequest(user.id, input)

    // Get deletion plan for user information
    let deletionPlan = null
    try {
      deletionPlan = await planDataDeletion(arcoRequest.id, user.id)
    } catch (planError) {
      logger.warn('Could not generate deletion plan:', { err: planError, userId: user.id })
    }

    return NextResponse.json({
      success: true,
      data: {
        request: arcoRequest,
        template: {
          title: template.title,
          description: template.description,
        },
        deletion_plan: deletionPlan,
        message: 'Solicitud de cancelación creada exitosamente',
        sla_days: 20,
        due_date: arcoRequest.due_date,
        retention_notice: {
          medical_records: '5 años (NOM-004-SSA3-2012)',
          payment_records: '5 años (SAT)',
          chat_history: '2 años',
          profile: 'Anonimización',
        },
      },
    }, { status: 201 })

  } catch (error) {
    logger.error('Error creating cancellation request:', { err: error, userId: user.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al crear la solicitud de cancelación' } },
      { status: 500 }
    )
  }
}

/**
 * GET /api/arco/cancel
 *
 * Obtener información sobre el plan de cancelación sin crear la solicitud
 * Útil para mostrar al usuario qué datos se eliminarán antes de confirmar
 *
 * Query params:
 * - scope: string[] - tablas a evaluar (default: ['all'])
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

  try {
    const { searchParams } = new URL(request.url)
    const scopeParam = searchParams.get('scope')
    
    let scope: string[] = ['all']
    if (scopeParam) {
      try {
        scope = JSON.parse(scopeParam)
      } catch {
        scope = scopeParam.split(',')
      }
    }

    // Return retention policy information
    return NextResponse.json({
      success: true,
      data: {
        retention_policy: {
          medical_records: {
            retention_period: '5 años',
            legal_basis: 'NOM-004-SSA3-2012',
            description: 'Expedientes clínicos y notas médicas SOAP',
          },
          prescriptions: {
            retention_period: '5 años',
            legal_basis: 'NOM-004-SSA3-2012',
            description: 'Recetas médicas emitidas',
          },
          payment_records: {
            retention_period: '5 años',
            legal_basis: 'Código Fiscal de la Federación (SAT)',
            description: 'Registros de pagos y facturación',
          },
          chat_history: {
            retention_period: '2 años',
            legal_basis: 'Política interna de Doctor.mx',
            description: 'Conversaciones y mensajes de chat',
          },
          profile: {
            retention_period: 'Indefinido (anonimizado)',
            legal_basis: 'Integridad de base de datos',
            description: 'Se anonimizará en lugar de eliminar',
          },
        },
        user_data_summary: {
          note: 'Para obtener un plan detallado de eliminación, cree una solicitud de cancelación',
        },
      },
    })

  } catch (error) {
    logger.error('Error getting cancellation info:', { err: error, userId: user.id })
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener información de cancelación' } },
      { status: 500 }
    )
  }
}
