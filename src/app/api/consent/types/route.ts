/**
 * GET /api/consent/types
 * 
 * Lista todos los tipos de consentimiento disponibles en el sistema.
 * Incluye información sobre categorías, etiquetas y si son esenciales.
 * Opcionalmente incluye las versiones activas de cada tipo.
 * 
 * @query {string} include_versions - Incluir versiones activas ('true' o 'false', default: 'false')
 * @query {string} category - Filtrar por categoría (opcional)
 * @returns {ConsentTypeInfo[]} Lista de tipos de consentimiento
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { 
  CONSENT_TYPE_LABELS,
  CONSENT_TYPE_CATEGORIES,
  CONSENT_CATEGORIES,
  ESSENTIAL_CONSENTS,
  getActiveConsentVersions,
} from '@/lib/consent'
import type { ConsentType, ConsentCategory } from '@/lib/consent'
import { logger } from '@/lib/observability/logger'

// Esquema de validación para query params
const TypesQuerySchema = z.object({
  include_versions: z.enum(['true', 'false']).default('false'),
  category: z.enum(['essential', 'functional', 'analytical', 'marketing', 'legal']).optional(),
})

interface ConsentTypeInfo {
  type: ConsentType
  label: string
  category: ConsentCategory
  category_label: string
  is_essential: boolean
  description: string
  active_version?: {
    id: string
    version: string
    title: string
    effective_date: string
    requires_re_consent: boolean
  } | null
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

    // Parsear query params
    const { searchParams } = new URL(request.url)
    const queryData = {
      include_versions: searchParams.get('include_versions') || 'false',
      category: searchParams.get('category') || undefined,
    }

    const validationResult = TypesQuerySchema.safeParse(queryData)

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

    // Construir lista de tipos de consentimiento
    const allTypes = Object.keys(CONSENT_TYPE_LABELS) as ConsentType[]
    
    let typesList: ConsentTypeInfo[] = allTypes.map((type) => ({
      type,
      label: CONSENT_TYPE_LABELS[type],
      category: CONSENT_TYPE_CATEGORIES[type],
      category_label: CONSENT_CATEGORIES[CONSENT_TYPE_CATEGORIES[type]],
      is_essential: ESSENTIAL_CONSENTS.includes(type),
      description: getConsentTypeDescription(type),
    }))

    // Filtrar por categoría si se especifica
    if (params.category) {
      typesList = typesList.filter(
        (t) => t.category === params.category
      )
    }

    // Incluir versiones activas si se solicita
    if (params.include_versions === 'true') {
      const activeVersions = await getActiveConsentVersions()
      
      // Crear mapa de versiones por tipo
      const versionMap = new Map(
        activeVersions.map((v) => [v.consent_type, v])
      )

      typesList = typesList.map((typeInfo) => ({
        ...typeInfo,
        active_version: versionMap.has(typeInfo.type)
          ? {
              id: versionMap.get(typeInfo.type)!.id,
              version: versionMap.get(typeInfo.type)!.version,
              title: versionMap.get(typeInfo.type)!.title,
              effective_date: versionMap.get(typeInfo.type)!.effective_date,
              requires_re_consent: versionMap.get(typeInfo.type)!.requires_re_consent,
            }
          : null,
      }))
    }

    // Calcular estadísticas
    const stats = {
      total_types: typesList.length,
      by_category: typesList.reduce((acc, type) => {
        acc[type.category] = (acc[type.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      essential_count: typesList.filter((t) => t.is_essential).length,
      optional_count: typesList.filter((t) => !t.is_essential).length,
    }

    return NextResponse.json({
      success: true,
      data: {
        types: typesList,
        statistics: stats,
        categories: CONSENT_CATEGORIES,
      },
    })
  } catch (error) {
    logger.error('Error fetching consent types:', { err: error })
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error al obtener los tipos de consentimiento' 
      },
      { status: 500 }
    )
  }
}

/**
 * Obtiene la descripción de un tipo de consentimiento
 */
function getConsentTypeDescription(type: ConsentType): string {
  const descriptions: Record<ConsentType, string> = {
    medical_treatment: 'Consentimiento necesario para recibir tratamiento médico y servicios de salud',
    data_processing: 'Autorización para procesar datos personales de acuerdo con la LFPDPPP',
    telemedicine: 'Consentimiento para recibir servicios médicos a través de consultas virtuales',
    recording: 'Permiso para grabar consultas médicas para fines de calidad y registro',
    ai_analysis: 'Consentimiento para utilizar inteligencia artificial en el análisis de consultas',
    data_sharing: 'Autorización para compartir datos con terceros relacionados con la salud',
    research: 'Permiso para utilizar datos anonimizados en investigaciones médicas',
    marketing: 'Consentimiento para recibir comunicaciones promocionales y de marketing',
    emergency_contact: 'Autorización para contactar personas de emergencia cuando sea necesario',
    prescription_forwarding: 'Permiso para enviar recetas médicas a farmacias o terceros',
  }

  return descriptions[type] || ''
}
