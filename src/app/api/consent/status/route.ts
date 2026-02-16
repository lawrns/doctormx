/**
 * GET /api/consent/status
 * 
 * Obtiene el estado completo de consentimientos del usuario autenticado.
 * Incluye resumen de consentimientos activos, retirados, expirados y pendientes.
 * 
 * @returns {UserConsentSummary} Resumen de consentimientos del usuario
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserConsentSummary, getUserConsents, hasUserConsent, CONSENT_TYPE_LABELS } from '@/lib/consent'
import { logger } from '@/lib/observability/logger'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Se requiere autenticación' },
        { status: 401 }
      )
    }

    // Obtener el resumen completo de consentimientos
    const summary = await getUserConsentSummary(user.id)

    // Obtener los consentimientos detallados con información de versión
    const consents = await getUserConsents(user.id, {
      include_expired: true,
      include_withdrawn: true,
    })

    // Enriquecer los consentimientos con información adicional
    const enrichedConsents = await Promise.all(
      consents.map(async (consent) => {
        const { data: version } = await supabase
          .from('consent_versions')
          .select('version, title, description, category, effective_date')
          .eq('id', consent.consent_version_id)
          .single()

        return {
          id: consent.id,
          consent_type: consent.consent_type,
          consent_type_label: CONSENT_TYPE_LABELS[consent.consent_type],
          status: consent.status,
          granted_at: consent.granted_at,
          withdrawn_at: consent.withdrawn_at,
          withdrawal_reason: consent.withdrawal_reason,
          expires_at: consent.expires_at,
          version: version ? {
            id: consent.consent_version_id,
            version: version.version,
            title: version.title,
            description: version.description,
            category: version.category,
            effective_date: version.effective_date,
          } : null,
          delivery_method: consent.delivery_method,
          age_verification: consent.age_verification,
          updated_at: consent.updated_at,
        }
      })
    )

    // Verificar qué tipos de consentimiento requieren atención
    const consentTypes = Object.keys(CONSENT_TYPE_LABELS) as Array<keyof typeof CONSENT_TYPE_LABELS>
    const pendingConsents = []
    
    for (const type of consentTypes) {
      const hasConsent = await hasUserConsent(user.id, type)
      if (!hasConsent) {
        const { data: latestVersion } = await supabase
          .from('consent_versions')
          .select('id, version, title, description, category, required_for_new_users')
          .eq('consent_type', type)
          .order('effective_date', { ascending: false })
          .limit(1)
          .single()

        if (latestVersion && latestVersion.required_for_new_users) {
          pendingConsents.push({
            consent_type: type,
            label: CONSENT_TYPE_LABELS[type],
            required: true,
            version: latestVersion,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        consents: enrichedConsents,
        pending_consents: pendingConsents,
        total_pending: pendingConsents.length,
      },
    })
  } catch (error) {
    logger.error('Error fetching consent status:', { err: error })
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error al obtener el estado de consentimientos' 
      },
      { status: 500 }
    )
  }
}
