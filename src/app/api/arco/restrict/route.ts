/**
 * ARCO Restriction API Route - GDPR Article 18
 *
 * POST /api/arco/restrict - Solicitar restricción de tratamiento de datos
 *
 * Este endpoint permite a los usuarios solicitar la restricción del tratamiento
 * de sus datos personales según el Artículo 18 del GDPR.
 *
 * Casos de aplicación:
 * - El usuario impugna la exactitud de los datos
 * - El tratamiento es ilícito pero el usuario se opone a la eliminación
 * - Los datos son necesarios para reclamaciones legales
 * - Verificación de interés público
 *
 * Al aplicar restricción:
 * - Los datos solo se almacenan, no se procesan
 * - No se comparten con terceros
 * - No se utilizan para análisis o marketing
 * - Se mantienen para posibles reclamaciones legales
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createArcoRequest,
  getArcoRequestTemplate,
  isValidDataScope,
} from '@/lib/arco/index'
import {
  createDataRestriction,
  getUserActiveRestrictions,
  RESTRICTION_REASON_LABELS,
  type DataRestriction,
} from '@/lib/arco/restrictions'
import type { CreateArcoRequestInput } from '@/types/arco'
import type { RestrictionReason } from '@/lib/arco/restrictions'
import { ArcoError } from '@/types/arco'
import { logger } from '@/lib/observability/logger'
import { z } from 'zod'

// Validation schema for restriction request
const restrictSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  data_scope: z.array(z.enum(['profiles', 'appointments', 'prescriptions', 'soap_consultations', 'chat_conversations', 'chat_messages', 'payments', 'follow_up_schedules', 'all'])).default(['all']),
  restriction_reason: z.enum([
    'accuracy_contested',
    'unlawful_processing',
    'legal_claims',
    'public_interest',
    'objection_pending',
  ]).default('accuracy_contested'),
  restriction_details: z.string().max(1000).optional(),
  duration_type: z.enum(['permanent', 'temporary']).default('permanent'),
  duration_days: z.number().int().min(1).max(365).optional(),
  apply_immediately: z.boolean().default(true),
})

/**
 * POST /api/arco/restrict
 *
 * Crear una solicitud de restricción de tratamiento (GDPR Art. 18)
 *
 * Body:
 * - description?: string - descripción de la solicitud
 * - title?: string - título personalizado
 * - data_scope?: string[] - tablas a restringir (default: ['all'])
 * - restriction_reason: enum - motivo de la restricción
 *   - accuracy_contested: exactitud impugnada
 *   - unlawful_processing: tratamiento ilícito
 *   - legal_claims: reclamaciones legales
 *   - public_interest: interés público
 *   - objection_pending: oposición pendiente
 * - restriction_details?: string - detalles adicionales
 * - duration_type?: 'permanent' | 'temporary' - tipo de duración
 * - duration_days?: number - días si es temporal (1-365)
 * - apply_immediately?: boolean - aplicar cambios inmediatamente (default: true)
 *
 * Response:
 * - success: boolean
 * - data: { request, restrictions_applied, active_restrictions, sla_days, due_date }
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
    const validationResult = restrictSchema.safeParse(body)
    
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

    // Get template for RESTRICT request type
    const template = getArcoRequestTemplate('RESTRICT')

    // Calculate expiration date if temporary
    let restrictedUntil: string | undefined
    if (data.duration_type === 'temporary' && data.duration_days) {
      const until = new Date()
      until.setDate(until.getDate() + data.duration_days)
      restrictedUntil = until.toISOString()
    }

    // Build description with restriction details
    const reasonLabel = RESTRICTION_REASON_LABELS[data.restriction_reason]
    
    let description = data.description || template.description
    description += `\n\nMotivo de restricción: ${reasonLabel}`
    
    if (data.restriction_details) {
      description += `\nDetalles: ${data.restriction_details}`
    }

    if (data.duration_type === 'temporary' && restrictedUntil) {
      description += `\nDuración: Temporal hasta ${new Date(restrictedUntil).toLocaleDateString('es-MX')}`
    } else {
      description += `\nDuración: Permanente (hasta que se levante la restricción)`
    }

    description += `\n\nAlcance de la restricción: ${data.data_scope.join(', ')}`
    description += `\n\nIMPORTANTE: Durante el período de restricción:`
    description += `\n- Sus datos solo se almacenarán, no se procesarán`
    description += `\n- No se compartirán con terceros`
    description += `\n- No se utilizarán para análisis o marketing`
    description += `\n- Se mantendrán para posibles reclamaciones legales`

    // Get request headers for metadata
    const headers = request.headers
    const userAgent = headers.get('user-agent') || undefined
    const forwardedFor = headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined

    // Prepare input for RESTRICT request
    const input: CreateArcoRequestInput = {
      request_type: 'RESTRICT',
      title: data.title || template.title,
      description: description,
      data_scope: data.data_scope,
      justification: data.restriction_details,
      submitted_via: 'web',
      ip_address: ipAddress,
      user_agent: userAgent,
    }

    // Create the restriction request
    const arcoRequest = await createArcoRequest(user.id, input)

    // Apply restrictions immediately if requested
    let appliedRestrictions: DataRestriction[] = []
    
    if (data.apply_immediately) {
      // Create individual restrictions for each scope
      for (const scope of data.data_scope) {
        const restriction = await createDataRestriction({
          user_id: user.id,
          arco_request_id: arcoRequest.id,
          table_name: scope,
          restriction_reason: data.restriction_reason,
          restriction_details: data.restriction_details,
          restricted_until: restrictedUntil,
        })
        appliedRestrictions.push(restriction)
      }
    }

    // Get all active restrictions for the user
    const activeRestrictions = await getUserActiveRestrictions(user.id)

    // Log the restriction request
    logger.info('Restriction request created', {
      userId: user.id,
      requestId: arcoRequest.id,
      reason: data.restriction_reason,
      scope: data.data_scope,
      restrictionsApplied: appliedRestrictions.length,
    })

    return NextResponse.json({
      success: true,
      data: {
        request: arcoRequest,
        template: {
          title: template.title,
          description: template.description,
        },
        restrictions_applied: appliedRestrictions.map(r => ({
          id: r.id,
          table_name: r.table_name,
          reason: r.restriction_reason,
          restricted_until: r.restricted_until,
        })),
        active_restrictions_count: activeRestrictions.length,
        restriction_details: {
          reason: data.restriction_reason,
          reason_label: reasonLabel,
          duration_type: data.duration_type,
          restricted_until: restrictedUntil || null,
        },
        message: 'Solicitud de restricción creada exitosamente',
        sla_days: 20,
        due_date: arcoRequest.due_date,
        gdpr_notice: {
          article: 18,
          title: 'Right to Restriction of Processing',
          description: 'You have the right to obtain restriction of processing where one of the grounds applies',
          restrictions_effective: data.apply_immediately,
        },
      },
    }, { status: 201 })

  } catch (error) {
    logger.error('Error creating restriction request:', { err: error, userId: user.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al crear la solicitud de restricción' } },
      { status: 500 }
    )
  }
}

/**
 * GET /api/arco/restrict
 *
 * Obtener información sobre restricciones activas y opciones disponibles
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
    // Get user's active restrictions
    const activeRestrictions = await getUserActiveRestrictions(user.id)

    // Restriction reason options with descriptions
    const restrictionOptions = [
      {
        id: 'accuracy_contested',
        label: RESTRICTION_REASON_LABELS.accuracy_contested,
        description: 'Impugno la exactitud de mis datos personales',
        legal_basis: 'GDPR Art. 18(1)(a)',
        applicable_when: 'Cuando usted cuestiona la exactitud de sus datos',
      },
      {
        id: 'unlawful_processing',
        label: RESTRICTION_REASON_LABELS.unlawful_processing,
        description: 'El tratamiento es ilícito pero me opongo a la eliminación',
        legal_basis: 'GDPR Art. 18(1)(b)',
        applicable_when: 'Cuando prefiere restringir en lugar de eliminar',
      },
      {
        id: 'legal_claims',
        label: RESTRICTION_REASON_LABELS.legal_claims,
        description: 'Necesito los datos para la formulación, ejercicio o defensa de reclamaciones',
        legal_basis: 'GDPR Art. 18(1)(c)',
        applicable_when: 'Para proteger sus derechos legales',
      },
      {
        id: 'objection_pending',
        label: RESTRICTION_REASON_LABELS.objection_pending,
        description: 'He presentado oposición y se está verificando',
        legal_basis: 'GDPR Art. 18(1)(d)',
        applicable_when: 'Mientras se verifica si los motivos legítimos prevalecen',
      },
      {
        id: 'public_interest',
        label: RESTRICTION_REASON_LABELS.public_interest,
        description: 'Se requiere verificación de interés público',
        legal_basis: 'GDPR Art. 18(1)(d)',
        applicable_when: 'Para verificación de interés público',
      },
    ]

    // Format active restrictions for display
    const formattedRestrictions = activeRestrictions.map(r => ({
      id: r.id,
      table_name: r.table_name,
      reason: r.restriction_reason,
      reason_label: RESTRICTION_REASON_LABELS[r.restriction_reason],
      status: r.status,
      restricted_until: r.restricted_until,
      created_at: r.created_at,
      is_temporary: !!r.restricted_until,
    }))

    return NextResponse.json({
      success: true,
      data: {
        active_restrictions: formattedRestrictions,
        restriction_options: restrictionOptions,
        gdpr_info: {
          article: 18,
          title: 'Right to Restriction of Processing',
          url: 'https://gdpr-info.eu/art-18-gdpr/',
          description: 'The data subject shall have the right to obtain from the controller restriction of processing',
        },
        effects: {
          storage_only: 'Sus datos solo se almacenarán, no se procesarán',
          no_sharing: 'No se compartirán con terceros',
          no_analytics: 'No se utilizarán para análisis o marketing',
          legal_preserve: 'Se mantendrán para posibles reclamaciones legales',
        },
      },
    })

  } catch (error) {
    logger.error('Error getting restriction info:', { err: error, userId: user.id })
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener información de restricciones' } },
      { status: 500 }
    )
  }
}
