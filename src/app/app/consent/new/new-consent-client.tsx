/**
 * New Consent Client Component
 *
 * Client-side component for granting new consent.
 * Displays available consent types and uses ConsentModal.
 *
 * @component NewConsentClient
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logger } from '@/lib/observability/logger'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ConsentModal } from '@/components/consent/ConsentModal'
import { ArrowLeft, CheckCircle2, Plus, AlertCircle, FileText, Loader2 } from 'lucide-react'
import type { ConsentType } from '@/lib/consent/client'
import { CONSENT_TYPE_LABELS, CONSENT_TYPE_CATEGORIES, CONSENT_CATEGORIES } from '@/lib/consent/client'

// Consent type descriptions
const CONSENT_DESCRIPTIONS: Record<ConsentType, string> = {
  medical_treatment: 'Autorizo el tratamiento médico por parte de los profesionales de Doctor.mx',
  data_processing: 'Autorizo el procesamiento de mis datos personales conforme a la LFPDPPP',
  telemedicine: 'Autorizo la realización de consultas médicas a través de videollamada',
  recording: 'Autorizo la grabación de mis consultas para fines de calidad y formación',
  ai_analysis: 'Autorizo el uso de IA para analizar mi información médica',
  data_sharing: 'Autorizo compartir mis datos con terceros seleccionados',
  research: 'Autorizo el uso de mis datos para investigación médica anonimizada',
  marketing: 'Autorizo el envío de comunicaciones promocionales',
  emergency_contact: 'Autorizo contactar a mis contactos de emergencia si es necesario',
  prescription_forwarding: 'Autorizo el reenvío de mis recetas a farmacias seleccionadas',
}

interface ConsentStatusResponse {
  success: boolean
  data?: {
    summary: {
      user_id: string
      total_consents: number
      active_consents: number
      withdrawn_consents: number
      expired_consents: number
      pending_consents: number
      consents_by_type: Record<ConsentType, number>
      consents_by_category: Record<string, number>
      requires_attention: boolean
      last_updated: string
    }
    consents: Array<{
      id: string
      consent_type: ConsentType
      consent_type_label: string
      status: string
      granted_at: string
      withdrawn_at: string | null
      expires_at: string | null
    }>
    pending_consents: Array<{
      consent_type: ConsentType
      label: string
      required: boolean
    }>
    total_pending: number
  }
}

interface NewConsentClientProps {
  userId: string
  preselectedType?: string | null
}

const CONSENT_TYPE_ORDER: ConsentType[] = [
  'medical_treatment',
  'data_processing',
  'telemedicine',
  'ai_analysis',
  'recording',
  'data_sharing',
  'research',
  'marketing',
  'prescription_forwarding',
  'emergency_contact',
]

export function NewConsentClient({ userId, preselectedType }: NewConsentClientProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<ConsentType | null>(null)
  const [currentConsents, setCurrentConsents] = useState<Set<ConsentType>>(new Set())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch current consent status on mount
  useEffect(() => {
    async function fetchConsentStatus() {
      try {
        const response = await fetch('/api/consent/status')
        const data: ConsentStatusResponse = await response.json()

        if (data.success && data.data?.consents) {
          const grantedTypes = new Set<ConsentType>()
          for (const consent of data.data.consents) {
            if (consent.status === 'granted') {
              grantedTypes.add(consent.consent_type)
            }
          }
          setCurrentConsents(grantedTypes)
        }
      } catch (err) {
        logger.error('Error fetching consent status', { error: err instanceof Error ? err.message : String(err) })
      } finally {
        setLoading(false)
      }
    }

    fetchConsentStatus()
  }, [])

  // Auto-open modal if type preselected
  useEffect(() => {
    if (preselectedType && CONSENT_TYPE_ORDER.includes(preselectedType as ConsentType)) {
      setSelectedType(preselectedType as ConsentType)
    }
  }, [preselectedType])

  const handleGrant = async () => {
    if (!selectedType) return

    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/consent/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_type: selectedType,
          delivery_method: 'click_wrap',
          metadata: {
            granted_via: 'web_consent_center',
            user_agent: navigator.userAgent,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al otorgar consentimiento')
      }

      // Update current consents
      setCurrentConsents((prev) => new Set([...prev, selectedType]))

      setSuccessMessage(`Consentimiento de ${CONSENT_TYPE_LABELS[selectedType]} otorgado exitosamente`)

      // Close modal and redirect after delay
      setTimeout(() => {
        router.push('/app/consent')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al otorgar consentimiento')
      setSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!selectedType) return

    setSubmitting(true)
    setError(null)

    try {
      // First get the consent record ID for this type
      const statusResponse = await fetch('/api/consent/status')
      const statusData: ConsentStatusResponse = await statusResponse.json()

      const consentRecord = statusData.data?.consents.find(
        (c) => c.consent_type === selectedType && c.status === 'granted'
      )

      if (!consentRecord) {
        throw new Error('No se encontró el consentimiento activo')
      }

      // Withdraw the consent
      const response = await fetch('/api/consent/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_record_id: consentRecord.id,
          withdrawal_reason: 'Retirado por el usuario desde el centro de consentimientos',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al retirar consentimiento')
      }

      // Update current consents
      setCurrentConsents((prev) => {
        const newSet = new Set(prev)
        newSet.delete(selectedType)
        return newSet
      })

      setSuccessMessage(`Consentimiento de ${CONSENT_TYPE_LABELS[selectedType]} retirado`)

      setTimeout(() => {
        router.push('/app/consent')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al retirar consentimiento')
      setSubmitting(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Esencial':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Funcional':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Analítico':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Marketing':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Legal':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando consentimientos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/app/consent">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900">Nuevo Consentimiento</h1>
            <p className="text-xs text-gray-500">Gestiona tus permisos de datos</p>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Info Banner */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Tus derechos sobre tus datos
                </h3>
                <p className="text-sm text-blue-800">
                  Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento
                  de tus datos personales (Derechos ARCO). Todos los consentimientos que otorgues
                  pueden ser retirados en cualquier momento desde este centro.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent Types Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Selecciona un tipo de consentimiento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONSENT_TYPE_ORDER.map((consentType) => {
              const hasCurrentConsent = currentConsents.has(consentType)
              const category = CONSENT_TYPE_CATEGORIES[consentType]

              return (
                <Card
                  key={consentType}
                  className="transition-all hover:shadow-md cursor-pointer"
                  onClick={() => setSelectedType(consentType)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {CONSENT_TYPE_LABELS[consentType]}
                          </h3>
                          <Badge className={getCategoryColor(category)} variant="outline">
                            {category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {CONSENT_DESCRIPTIONS[consentType]}
                        </p>
                      </div>

                      {/* Status Indicator */}
                      {hasCurrentConsent ? (
                        <div className="flex-shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                      ) : (
                        <Plus className="h-6 w-6 text-gray-400 flex-shrink-0" />
                      )}
                    </div>

                    <Button
                      variant={hasCurrentConsent ? "outline" : "default"}
                      className={hasCurrentConsent ? "w-full border-green-200 text-green-700 hover:bg-green-50" : "w-full"}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedType(consentType)
                      }}
                    >
                      {hasCurrentConsent ? 'Gestionar' : 'Otorgar'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Privacy Notice */}
        <Card className="mt-8 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-amber-900 mb-2">Aviso de Privacidad</h4>
            <p className="text-sm text-amber-800">
              Tus datos serán protegidos conforme a la Ley Federal de Protección de Datos Personales
              en Posesión de los Particulares (LFPDPPP). Para más información sobre
              cómo utilizamos tus datos, consulta nuestro{' '}
              <a href="/privacy" className="underline font-medium">
                Aviso de Privacidad
              </a>
              {' '}y{' '}
              <a href="/terms" className="underline font-medium">
                Términos de Servicio
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Consent Modal */}
      {selectedType && (
        <ConsentModal
          open={!!selectedType}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedType(null)
              setError(null)
              setSuccessMessage(null)
            }
          }}
          consentType={selectedType}
          currentConsent={currentConsents.has(selectedType)}
          loading={submitting}
          onGrant={handleGrant}
          onWithdraw={handleWithdraw}
        />
      )}
    </div>
  )
}
