/**
 * ARCO Opposition API Route
 *
 * POST /api/arco/oppose - Solicitar oposición al tratamiento de datos
 *
 * Este endpoint permite a los usuarios oponerse al procesamiento de sus
 * datos personales para fines específicos (Derecho de Oposición ARCO).
 * 
 * Las oposiciones comunes incluyen:
 * - No deseo recibir comunicaciones de marketing
 * - No deseo que mis datos se usen para análisis
 * - No deseo que mis datos se compartan con terceros
 * - No deseo que mis datos se usen para entrenar IA
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createArcoRequest,
  getArcoRequestTemplate,
  updateUserPrivacyPreferences,
  getUserPrivacyPreferences,
  type CreateArcoRequestInput,
  type UpdatePrivacyPreferencesInput,
} from '@/lib/arco'
import { ArcoError } from '@/types/arco'
import { logger } from '@/lib/observability/logger'
import { z } from 'zod'

// Validation schema for opposition request
const opposeSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  opposition_reasons: z.array(z.enum([
    'marketing_emails',
    'marketing_sms',
    'marketing_push',
    'analytics',
    'personalization',
    'research',
    'ai_training',
    'data_sharing',
    'voice_recording',
  ])).min(1),
  apply_immediately: z.boolean().default(true),
  justification: z.string().max(1000).optional(),
})

// Map opposition reasons to privacy preference fields
const oppositionToPreferenceMap: Record<string, keyof UpdatePrivacyPreferencesInput> = {
  marketing_emails: 'marketing_emails',
  marketing_sms: 'marketing_sms',
  marketing_push: 'marketing_push',
  analytics: 'analytics_consent',
  personalization: 'personalization_consent',
  research: 'research_consent',
  ai_training: 'ai_training_consent',
  voice_recording: 'voice_recording_consent',
  data_sharing: 'share_with_insurance', // Maps to multiple sharing options
}

/**
 * POST /api/arco/oppose
 *
 * Crear una solicitud de oposición al tratamiento de datos
 *
 * Body:
 * - opposition_reasons: string[] - motivos de oposición
 *   - marketing_emails: correos de marketing
 *   - marketing_sms: SMS de marketing
 *   - marketing_push: notificaciones push de marketing
 *   - analytics: análisis de datos
 *   - personalization: personalización
 *   - research: investigación
 *   - ai_training: entrenamiento de IA
 *   - data_sharing: compartir datos con terceros
 *   - voice_recording: grabación de voz
 * - apply_immediately?: boolean - aplicar cambios inmediatamente (default: true)
 * - description?: string - descripción adicional
 * - justification?: string - justificación legal (opcional)
 *
 * Response:
 * - success: boolean
 * - data: { request, privacy_preferences_updated, applied_changes, sla_days, due_date }
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
    const validationResult = opposeSchema.safeParse(body)
    
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

    // Get current privacy preferences
    const currentPrefs = await getUserPrivacyPreferences(user.id)

    // Build description with opposition details
    const template = getArcoRequestTemplate('OPPOSE')
    
    const oppositionLabels: Record<string, string> = {
      marketing_emails: 'Correos electrónicos de marketing',
      marketing_sms: 'Mensajes SMS de marketing',
      marketing_push: 'Notificaciones push de marketing',
      analytics: 'Análisis y estadísticas de uso',
      personalization: 'Personalización de contenido',
      research: 'Investigación médica',
      ai_training: 'Entrenamiento de modelos de IA',
      data_sharing: 'Compartir datos con terceros (seguros, farmacias, laboratorios)',
      voice_recording: 'Grabación de consultas de voz',
    }

    const oppositionList = data.opposition_reasons
      .map(reason => `- ${oppositionLabels[reason] || reason}`)
      .join('\n')

    const description = data.description || 
      `${template.description}\n\n` +
      `Me opongo al uso de mis datos personales para los siguientes fines:\n${oppositionList}\n\n` +
      `Solicito que se actualicen mis preferencias de privacidad para reflejar estas oposiciones.`

    // Get request headers for metadata
    const headers = request.headers
    const userAgent = headers.get('user-agent') || undefined
    const forwardedFor = headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined

    // Prepare input for OPPOSE request
    const input: CreateArcoRequestInput = {
      request_type: 'OPPOSE',
      title: data.title || template.title,
      description: description,
      data_scope: ['all'],
      justification: data.justification,
      submitted_via: 'web',
      ip_address: ipAddress,
      user_agent: userAgent,
    }

    // Create the opposition request
    const arcoRequest = await createArcoRequest(user.id, input)

    // Apply privacy preference changes immediately if requested
    let appliedChanges: Record<string, boolean> = {}
    let preferencesUpdated = false

    if (data.apply_immediately) {
      const updates: UpdatePrivacyPreferencesInput = {}

      for (const reason of data.opposition_reasons) {
        const prefField = oppositionToPreferenceMap[reason]
        if (prefField) {
          // Most oppositions mean setting the preference to false
          // For data_sharing, we need to update multiple fields
          if (reason === 'data_sharing') {
            updates.share_with_insurance = false
            updates.share_with_pharmacies = false
            updates.share_with_labs = false
            appliedChanges['share_with_insurance'] = false
            appliedChanges['share_with_pharmacies'] = false
            appliedChanges['share_with_labs'] = false
          } else {
            (updates as Record<string, boolean>)[prefField] = false
            appliedChanges[prefField] = false
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        await updateUserPrivacyPreferences(user.id, updates)
        preferencesUpdated = true
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        request: arcoRequest,
        template: {
          title: template.title,
          description: template.description,
        },
        privacy_preferences_updated: preferencesUpdated,
        applied_changes: appliedChanges,
        previous_preferences: currentPrefs,
        message: 'Solicitud de oposición creada exitosamente',
        sla_days: 20,
        due_date: arcoRequest.due_date,
      },
    }, { status: 201 })

  } catch (error) {
    logger.error('Error creating opposition request:', { err: error, userId: user.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al crear la solicitud de oposición' } },
      { status: 500 }
    )
  }
}

/**
 * GET /api/arco/oppose
 *
 * Obtener opciones de oposición disponibles y preferencias actuales
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
    const preferences = await getUserPrivacyPreferences(user.id)

    const oppositionOptions = [
      {
        id: 'marketing_emails',
        label: 'Correos electrónicos de marketing',
        description: 'Recibir correos promocionales y newsletters',
        currently_active: preferences?.marketing_emails ?? true,
      },
      {
        id: 'marketing_sms',
        label: 'Mensajes SMS de marketing',
        description: 'Recibir mensajes de texto promocionales',
        currently_active: preferences?.marketing_sms ?? false,
      },
      {
        id: 'marketing_push',
        label: 'Notificaciones push de marketing',
        description: 'Recibir notificaciones push promocionales',
        currently_active: preferences?.marketing_push ?? false,
      },
      {
        id: 'analytics',
        label: 'Análisis y estadísticas',
        description: 'Usar mis datos para análisis de uso y mejora del servicio',
        currently_active: preferences?.analytics_consent ?? true,
      },
      {
        id: 'personalization',
        label: 'Personalización de contenido',
        description: 'Personalizar mi experiencia basada en mis datos',
        currently_active: preferences?.personalization_consent ?? true,
      },
      {
        id: 'research',
        label: 'Investigación médica',
        description: 'Usar mis datos (anónimos) para investigación médica',
        currently_active: preferences?.research_consent ?? false,
      },
      {
        id: 'ai_training',
        label: 'Entrenamiento de IA',
        description: 'Usar mis datos (anónimos) para entrenar modelos de IA',
        currently_active: preferences?.ai_training_consent ?? false,
      },
      {
        id: 'data_sharing',
        label: 'Compartir datos con terceros',
        description: 'Compartir datos con aseguradoras, farmacias y laboratorios',
        currently_active: (preferences?.share_with_insurance || 
                          preferences?.share_with_pharmacies || 
                          preferences?.share_with_labs) ?? false,
      },
      {
        id: 'voice_recording',
        label: 'Grabación de consultas de voz',
        description: 'Grabar consultas para transcripción y análisis',
        currently_active: preferences?.voice_recording_consent ?? false,
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        opposition_options: oppositionOptions,
        current_preferences: preferences,
        note: 'Al oponerse a un uso de datos, actualizaremos sus preferencias de privacidad automáticamente.',
      },
    })

  } catch (error) {
    logger.error('Error getting opposition options:', { err: error, userId: user.id })
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener opciones de oposición' } },
      { status: 500 }
    )
  }
}
