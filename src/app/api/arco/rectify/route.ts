/**
 * ARCO Rectification API Route
 *
 * POST /api/arco/rectify - Solicitar rectificación de datos personales
 *
 * Este endpoint permite a los usuarios solicitar la corrección de datos
 * personales inexactos o incompletos (Derecho de Rectificación ARCO).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createArcoRequest,
  getArcoRequestTemplate,
  isValidDataScope,
  type CreateArcoRequestInput,
} from '@/lib/arco'
import { ArcoError } from '@/types/arco'
import { logger } from '@/lib/observability/logger'
import { z } from 'zod'

// Validation schema for rectification request
const rectifySchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(2000),
  data_scope: z.array(z.enum(['profiles', 'appointments', 'prescriptions', 'soap_consultations', 'chat_conversations', 'chat_messages', 'payments', 'follow_up_schedules', 'all'])).default(['profiles']),
  specific_records: z.array(z.string()).optional(),
  justification: z.string().max(1000).optional(),
  field_changes: z.array(z.object({
    table: z.string(),
    field: z.string(),
    current_value: z.string().nullable(),
    proposed_value: z.string(),
  })).optional(),
})

/**
 * POST /api/arco/rectify
 *
 * Crear una solicitud de rectificación de datos personales
 *
 * Body:
 * - description: string - descripción detallada de los cambios solicitados
 * - title?: string - título personalizado (opcional, se genera automáticamente)
 * - data_scope?: string[] - tablas afectadas (default: ['profiles'])
 * - specific_records?: string[] - IDs de registros específicos
 * - justification?: string - justificación adicional
 * - field_changes?: array - cambios específicos de campo propuestos
 *
 * Response:
 * - success: boolean
 * - data: { request, template, sla_days, due_date }
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
    const validationResult = rectifySchema.safeParse(body)
    
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

    // Get template for RECTIFY request type
    const template = getArcoRequestTemplate('RECTIFY')

    // Build description including field changes if provided
    let description = data.description
    if (data.field_changes && data.field_changes.length > 0) {
      const changesList = data.field_changes.map(change => 
        `- ${change.table}.${change.field}: "${change.current_value || 'vacío'}" → "${change.proposed_value}"`
      ).join('\n')
      
      description = `${data.description}\n\nCambios solicitados:\n${changesList}`
    }

    // Get request headers for metadata
    const headers = request.headers
    const userAgent = headers.get('user-agent') || undefined
    const forwardedFor = headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined

    // Prepare input for RECTIFY request
    const input: CreateArcoRequestInput = {
      request_type: 'RECTIFY',
      title: data.title || template.title,
      description: description,
      data_scope: data.data_scope,
      specific_records: data.specific_records,
      justification: data.justification,
      submitted_via: 'web',
      ip_address: ipAddress,
      user_agent: userAgent,
    }

    // Create the rectification request
    const arcoRequest = await createArcoRequest(user.id, input)

    return NextResponse.json({
      success: true,
      data: {
        request: arcoRequest,
        template: {
          title: template.title,
          description: template.description,
        },
        message: 'Solicitud de rectificación creada exitosamente',
        sla_days: 20,
        due_date: arcoRequest.due_date,
      },
    }, { status: 201 })

  } catch (error) {
    logger.error('Error creating rectification request:', { err: error, userId: user.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al crear la solicitud de rectificación' } },
      { status: 500 }
    )
  }
}
