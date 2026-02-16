/**
 * GET /api/consent/version/[type]
 * 
 * Obtiene la versión actual (activa) de un tipo específico de consentimiento.
 * También proporciona información sobre cambios desde versiones anteriores
 * y si el usuario necesita re-consentir.
 * 
 * @param {string} type - Tipo de consentimiento (medical_treatment, data_processing, etc.)
 * @query {string} include_history - Incluir historial de versiones ('true' o 'false', default: 'false')
 * @query {string} check_user_consent - Verificar estado del usuario ('true' o 'false', default: 'true')
 * @returns {ConsentVersionInfo} Información de la versión del consentimiento
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { 
  getLatestConsentVersion,
  getConsentVersionHistory,
  checkIfReConsentRequired,
  compareConsentVersions,
  CONSENT_TYPE_LABELS,
  CONSENT_TYPE_CATEGORIES,
  CONSENT_CATEGORIES,
  ESSENTIAL_CONSENTS,
} from '@/lib/consent'
import type { ConsentType } from '@/lib/consent'
import { logger } from '@/lib/observability/logger'

// Lista de tipos de consentimiento válidos
const VALID_CONSENT_TYPES: ConsentType[] = [
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
]

// Esquema de validación para query params
const VersionQuerySchema = z.object({
  include_history: z.enum(['true', 'false']).default('false'),
  check_user_consent: z.enum(['true', 'false']).default('true'),
})

interface VersionRouteParams {
  params: Promise<{
    type: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: VersionRouteParams
) {
  try {
    const { type } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Se requiere autenticación' },
        { status: 401 }
      )
    }

    // Validar que el tipo de consentimiento sea válido
    if (!VALID_CONSENT_TYPES.includes(type as ConsentType)) {
      return NextResponse.json(
        { 
          error: 'Invalid Consent Type', 
          message: `Tipo de consentimiento inválido: ${type}`,
          valid_types: VALID_CONSENT_TYPES,
        },
        { status: 400 }
      )
    }

    const consentType = type as ConsentType

    // Parsear query params
    const { searchParams } = new URL(request.url)
    const queryData = {
      include_history: searchParams.get('include_history') || 'false',
      check_user_consent: searchParams.get('check_user_consent') || 'true',
    }

    const validationResult = VersionQuerySchema.safeParse(queryData)

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

    const params_query = validationResult.data

    // Obtener la versión actual (activa)
    const currentVersion = await getLatestConsentVersion(consentType)

    if (!currentVersion) {
      return NextResponse.json(
        { 
          error: 'Version Not Found', 
          message: `No se encontró una versión activa para el tipo: ${CONSENT_TYPE_LABELS[consentType]}` 
        },
        { status: 404 }
      )
    }

    // Verificar estado del consentimiento del usuario
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userConsentStatus: any = null
    if (params_query.check_user_consent === 'true') {
      const { data: userConsent } = await supabase
        .from('user_consent_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('consent_type', consentType)
        .order('granted_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const needsReConsent = await checkIfReConsentRequired(user.id, consentType)

      userConsentStatus = {
        has_consent: !!userConsent && userConsent.status === 'granted',
        consent_record_id: userConsent?.id || null,
        current_version_id: userConsent?.consent_version_id || null,
        status: userConsent?.status || 'not_granted',
        granted_at: userConsent?.granted_at || null,
        needs_re_consent: needsReConsent,
        is_up_to_date: userConsent?.consent_version_id === currentVersion.id,
      }

      // Si tiene consentimiento pero no está actualizado, obtener comparación
      if (userConsent && userConsent.consent_version_id !== currentVersion.id) {
        try {
          const comparison = await compareConsentVersions(
            userConsent.consent_version_id,
            currentVersion.id
          )
          userConsentStatus.version_comparison = {
            current_user_version: comparison.current_version,
            latest_version: comparison.new_version,
            has_major_changes: comparison.has_major_changes,
            has_minor_changes: comparison.has_minor_changes,
            requires_re_consent: comparison.requires_re_consent,
            changes_summary: comparison.changes.map((c) => ({
              field: c.field,
              change_type: c.change_type,
              significance: c.significance,
            })),
          }
        } catch (error) {
          logger.warn('Error comparing consent versions:', { error })
        }
      }
    }

    // Construir respuesta base
    const response: {
      success: boolean
      data: {
        consent_type: ConsentType
        consent_type_label: string
        category: string
        category_label: string
        is_essential: boolean
        current_version: {
          id: string
          version: string
          title: string
          description: string
          legal_text: string
          effective_date: string
          deprecated_date: string | null
          data_retention_period: string | null
          third_party_sharing: string[] | null
          age_restriction: {
            min_age?: number
            requires_guardian?: boolean
          } | null
          requires_re_consent: boolean
          required_for_new_users: boolean
        }
        user_status: typeof userConsentStatus
        version_history?: unknown[]
      }
    } = {
      success: true,
      data: {
        consent_type: consentType,
        consent_type_label: CONSENT_TYPE_LABELS[consentType],
        category: CONSENT_TYPE_CATEGORIES[consentType],
        category_label: CONSENT_CATEGORIES[CONSENT_TYPE_CATEGORIES[consentType]],
        is_essential: ESSENTIAL_CONSENTS.includes(consentType),
        current_version: {
          id: currentVersion.id,
          version: currentVersion.version,
          title: currentVersion.title,
          description: currentVersion.description,
          legal_text: currentVersion.legal_text,
          effective_date: currentVersion.effective_date,
          deprecated_date: currentVersion.deprecated_date,
          data_retention_period: currentVersion.data_retention_period,
          third_party_sharing: currentVersion.third_party_sharing,
          age_restriction: currentVersion.age_restriction,
          requires_re_consent: currentVersion.requires_re_consent,
          required_for_new_users: currentVersion.required_for_new_users,
        },
        user_status: userConsentStatus,
      },
    }

    // Incluir historial de versiones si se solicita
    if (params_query.include_history === 'true') {
      const versionHistory = await getConsentVersionHistory(consentType)
      response.data.version_history = versionHistory.map((v) => ({
        id: v.id,
        version: v.version,
        title: v.title,
        effective_date: v.effective_date,
        deprecated_date: v.deprecated_date,
        requires_re_consent: v.requires_re_consent,
        is_active: !v.deprecated_date && new Date(v.effective_date) <= new Date(),
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error fetching consent version:', { err: error })
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error al obtener la versión del consentimiento' 
      },
      { status: 500 }
    )
  }
}
