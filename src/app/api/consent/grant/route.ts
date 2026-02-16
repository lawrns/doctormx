/**
 * POST /api/consent/grant
 * 
 * Otorga un consentimiento específico para el usuario autenticado.
 * Requiere autenticación y valida los datos de entrada con Zod.
 * 
 * @body {GrantConsentRequest} Datos del consentimiento a otorgar
 * @returns {UserConsentRecord} Registro de consentimiento creado
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { 
  grantConsent, 
  getLatestConsentVersion,
  verifyAgeAndConsentRequirements,
  CONSENT_TYPE_LABELS,
} from '@/lib/consent'
import type { ConsentType, ConsentDeliveryMethod } from '@/lib/consent'
import { logger } from '@/lib/observability/logger'

// Esquema de validación Zod para otorgar consentimiento
const GrantConsentSchema = z.object({
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
  ] as const),
  consent_version_id: z.string().uuid().optional(),
  delivery_method: z.enum([
    'electronic_signature',
    'click_wrap',
    'browse_wrap',
    'paper_form',
    'verbal',
    'implied',
  ] as const).default('click_wrap'),
  date_of_birth: z.string().datetime().optional().nullable(),
  guardian_consent_record_id: z.string().uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

type GrantConsentRequest = z.infer<typeof GrantConsentSchema>

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Se requiere autenticación' },
        { status: 401 }
      )
    }

    // Parsear y validar el body
    const body = await request.json()
    const validationResult = GrantConsentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          message: 'Datos de entrada inválidos',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Si no se proporciona version_id, obtener la última versión activa
    let versionId = data.consent_version_id
    if (!versionId) {
      const latestVersion = await getLatestConsentVersion(data.consent_type as ConsentType)
      if (!latestVersion) {
        return NextResponse.json(
          { 
            error: 'Version Not Found', 
            message: `No se encontró una versión activa para el tipo de consentimiento: ${data.consent_type}` 
          },
          { status: 404 }
        )
      }
      versionId = latestVersion.id
    }

    // Verificar requisitos de edad
    const ageVerification = await verifyAgeAndConsentRequirements(
      user.id,
      data.consent_type as ConsentType,
      data.date_of_birth
    )

    // Preparar metadata con información del cliente
    const clientMetadata = {
      ...data.metadata,
      granted_via_api: true,
      granted_at: new Date().toISOString(),
    }

    // Otorgar el consentimiento
    const consentRecord = await grantConsent({
      user_id: user.id,
      consent_type: data.consent_type as ConsentType,
      consent_version_id: versionId,
      delivery_method: data.delivery_method as ConsentDeliveryMethod,
      date_of_birth: data.date_of_birth || undefined,
      guardian_consent_record_id: data.guardian_consent_record_id || undefined,
      metadata: clientMetadata,
    })

    return NextResponse.json({
      success: true,
      message: 'Consentimiento otorgado exitosamente',
      data: {
        consent: consentRecord,
        consent_type_label: CONSENT_TYPE_LABELS[data.consent_type as ConsentType],
        age_verification: ageVerification,
      },
    })
  } catch (error) {
    logger.error('Error granting consent:', { err: error })
    
    // Manejar errores específicos del sistema de consentimientos
    if (error instanceof Error) {
      if (error.name === 'ConsentError') {
        const consentError = error as unknown as { code: string; statusCode: number }
        return NextResponse.json(
          { 
            error: consentError.code, 
            message: error.message 
          },
          { status: consentError.statusCode || 400 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error al otorgar el consentimiento' 
      },
      { status: 500 }
    )
  }
}
