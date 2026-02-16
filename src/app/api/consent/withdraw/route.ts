/**
 * POST /api/consent/withdraw
 * 
 * Retira un consentimiento previamente otorgado por el usuario autenticado.
 * No permite retirar consentimientos esenciales (medical_treatment, emergency_contact).
 * Requiere autenticación y valida los datos de entrada con Zod.
 * 
 * @body {WithdrawConsentRequest} Datos del consentimiento a retirar
 * @returns {UserConsentRecord} Registro de consentimiento actualizado
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { 
  withdrawConsent, 
  getUserConsents,
  CONSENT_TYPE_LABELS,
  ESSENTIAL_CONSENTS,
} from '@/lib/consent'
import type { ConsentType } from '@/lib/consent'
import { logger } from '@/lib/observability/logger'

// Esquema de validación Zod para retirar consentimiento
const WithdrawConsentSchema = z.object({
  consent_record_id: z.string().uuid(),
  withdrawal_reason: z.string().min(1).max(500),
})

// Esquema alternativo para retirar por tipo de consentimiento
const WithdrawByTypeSchema = z.object({
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
  withdrawal_reason: z.string().min(1).max(500),
})

const WithdrawRequestSchema = z.union([WithdrawConsentSchema, WithdrawByTypeSchema])

type WithdrawConsentRequest = z.infer<typeof WithdrawRequestSchema>

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
    const validationResult = WithdrawRequestSchema.safeParse(body)

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

    // Determinar el consent_record_id
    let consentRecordId: string

    if ('consent_record_id' in data) {
      consentRecordId = data.consent_record_id
      
      // Verificar que el consentimiento pertenece al usuario
      const { data: consentCheck } = await supabase
        .from('user_consent_records')
        .select('user_id, consent_type')
        .eq('id', consentRecordId)
        .single()

      if (!consentCheck || consentCheck.user_id !== user.id) {
        return NextResponse.json(
          { 
            error: 'Forbidden', 
            message: 'No tiene permiso para retirar este consentimiento' 
          },
          { status: 403 }
        )
      }

      // Verificar que no sea un consentimiento esencial
      if (ESSENTIAL_CONSENTS.includes(consentCheck.consent_type as ConsentType)) {
        return NextResponse.json(
          { 
            error: 'Cannot Withdraw Essential', 
            message: `No se puede retirar el consentimiento esencial: ${CONSENT_TYPE_LABELS[consentCheck.consent_type as ConsentType]}` 
          },
          { status: 403 }
        )
      }
    } else {
      // Buscar por tipo de consentimiento
      const consentType = data.consent_type as ConsentType

      // Verificar que no sea un consentimiento esencial
      if (ESSENTIAL_CONSENTS.includes(consentType)) {
        return NextResponse.json(
          { 
            error: 'Cannot Withdraw Essential', 
            message: `No se puede retirar el consentimiento esencial: ${CONSENT_TYPE_LABELS[consentType]}` 
          },
          { status: 403 }
        )
      }

      const userConsents = await getUserConsents(user.id, {
        consent_type: consentType,
        status: 'granted',
      })

      if (userConsents.length === 0) {
        return NextResponse.json(
          { 
            error: 'Consent Not Found', 
            message: `No se encontró un consentimiento activo de tipo: ${data.consent_type}` 
          },
          { status: 404 }
        )
      }

      consentRecordId = userConsents[0].id
    }

    // Retirar el consentimiento
    const withdrawnConsent = await withdrawConsent({
      consent_record_id: consentRecordId,
      withdrawal_reason: data.withdrawal_reason,
      withdrawn_by: 'user',
    })

    return NextResponse.json({
      success: true,
      message: 'Consentimiento retirado exitosamente',
      data: {
        consent: withdrawnConsent,
        consent_type_label: CONSENT_TYPE_LABELS[withdrawnConsent.consent_type],
        withdrawn_at: withdrawnConsent.withdrawn_at,
        withdrawal_reason: withdrawnConsent.withdrawal_reason,
      },
    })
  } catch (error) {
    logger.error('Error withdrawing consent:', { err: error })
    
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
        message: 'Error al retirar el consentimiento' 
      },
      { status: 500 }
    )
  }
}
