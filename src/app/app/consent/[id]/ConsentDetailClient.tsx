/**
 * Consent Detail Client Component
 *
 * Client-side component for displaying detailed consent information
 * and change history.
 *
 * @component ConsentDetailClient
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Calendar,
  User,
  Shield,
  History,
  AlertTriangle,
  Download,
  ExternalLink,
  Info,
} from 'lucide-react'
import { ConsentModal } from '@/components/consent/ConsentModal'
import type { ConsentType } from '@/lib/consent/client'
import { CONSENT_TYPE_LABELS, CONSENT_CATEGORIES, CONSENT_TYPE_CATEGORIES, ESSENTIAL_CONSENTS } from '@/lib/consent/client'

interface ConsentRecord {
  id: string
  consent_type: ConsentType
  consent_type_label: string
  status: string
  granted_at: string
  withdrawn_at: string | null
  expires_at: string | null
  version?: {
    id: string
    version: string
    title: string
    description: string
    category: string
    effective_date: string
  } | null
}

interface ConsentHistoryEntry {
  id: string
  consent_record_id: string
  consent_type: string
  consent_type_label: string
  action: string
  old_status: string | null
  new_status: string
  changed_by: string
  changed_by_role: string
  change_reason: string | null
  ip_address: string | null
  created_at: string
}

interface ConsentDetailClientProps {
  consentRecord: ConsentRecord
  userId: string
  history: ConsentHistoryEntry[]
  allConsents: ConsentRecord[]
  pendingConsents: Array<{
    consent_type: string
    label: string
    required: boolean
  }>
}

export function ConsentDetailClient({
  consentRecord,
  userId,
  history,
  allConsents,
  pendingConsents,
}: ConsentDetailClientProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isGranted = consentRecord.status === 'granted'
  const isWithdrawn = consentRecord.status === 'withdrawn'
  const isExpired = consentRecord.status === 'expired'
  const isEssential = ESSENTIAL_CONSENTS.includes(consentRecord.consent_type)

  // Filter history for this specific consent record
  const consentHistory = history.filter(
    (entry) => entry.consent_record_id === consentRecord.id
  )

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'withdrawn':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'revoked':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      granted: 'Otorgado',
      withdrawn: 'Retirado',
      expired: 'Expirado',
      revoked: 'Revocado',
    }
    return labels[status] || status
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'granted':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'withdrawn':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'expired':
        return <Clock className="h-5 w-5 text-gray-600" />
      case 'modified':
        return <FileText className="h-5 w-5 text-blue-600" />
      default:
        return <History className="h-5 w-5 text-amber-600" />
    }
  }

  const handleGrant = async () => {
    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/consent/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_type: consentRecord.consent_type,
          delivery_method: 'click_wrap',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'Error al otorgar consentimiento')
      }

      setSuccessMessage('Consentimiento actualizado exitosamente')
      setTimeout(() => {
        router.push('/app/consent')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar consentimiento')
      setSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/consent/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_record_id: consentRecord.id,
          withdrawal_reason: 'Retirado por el usuario',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'Error al retirar consentimiento')
      }

      setSuccessMessage('Consentimiento retirado exitosamente')
      setTimeout(() => {
        router.push('/app/consent')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al retirar consentimiento')
      setSubmitting(false)
    }
  }

  const category = CONSENT_CATEGORIES[CONSENT_TYPE_CATEGORIES[consentRecord.consent_type]] ?? 'legal'

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/app/consent">
            <Button variant="ghost" size="icon" aria-label="Regresar a consentimientos">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900">Detalle del Consentimiento</h1>
            <p className="text-xs text-gray-500">{CONSENT_TYPE_LABELS[consentRecord.consent_type]}</p>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Status Banner */}
        <Card className={isGranted ? 'border-green-200 bg-green-50' : isWithdrawn ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isGranted && <CheckCircle2 className="h-12 w-12 text-green-600" />}
                {isWithdrawn && <XCircle className="h-12 w-12 text-red-600" />}
                {isExpired && <Clock className="h-12 w-12 text-gray-600" />}

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {CONSENT_TYPE_LABELS[consentRecord.consent_type]}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(consentRecord.status)} variant="outline">
                      {getStatusLabel(consentRecord.status)}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                      {category}
                    </Badge>
                    {isEssential && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200" variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        Esencial
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {!isWithdrawn && !isExpired && (
                  <Button
                    onClick={() => setShowModal(true)}
                    variant={isGranted ? "outline" : "default"}
                    className={isGranted ? "border-red-200 text-red-700 hover:bg-red-50" : ""}
                  >
                    {isGranted ? 'Retirar' : 'Otorgar'}
                  </Button>
                )}
                <Link href="/app/consent">
                  <Button variant="outline">Volver al Centro</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="version">Versión</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información del Consentimiento</CardTitle>
                <CardDescription>Detalles sobre este permiso de datos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Otorgamiento
                    </label>
                    <p className="text-gray-900 font-medium">
                      {formatDate(consentRecord.granted_at)}
                    </p>
                  </div>

                  {consentRecord.withdrawn_at && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Fecha de Retiro
                      </label>
                      <p className="text-gray-900 font-medium">
                        {formatDate(consentRecord.withdrawn_at)}
                      </p>
                    </div>
                  )}

                  {consentRecord.expires_at && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Fecha de Expiración
                      </label>
                      <p className="text-gray-900 font-medium">
                        {formatDate(consentRecord.expires_at)}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Categoría
                    </label>
                    <p className="text-gray-900 font-medium">
                      {category}
                    </p>
                  </div>
                </div>

                {isEssential && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      Este es un consentimiento esencial requerido para el funcionamiento del servicio.
                      {isWithdrawn ? ' Debes otorgarlo nuevamente para continuar.' : ' No puede ser retirado.'}
                    </AlertDescription>
                  </Alert>
                )}

                {isWithdrawn && !isEssential && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Has retirado este consentimiento. Ya no procesaremos tus datos
                      bajo esta categoría. Puedes otorgarlo nuevamente en cualquier momento.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Cambios</CardTitle>
                <CardDescription>
                  Todos los cambios realizados en este consentimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {consentHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay historial disponible para este consentimiento</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] w-full">
                    <div className="space-y-3 pr-4">
                      {consentHistory.map((entry, index) => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-4 p-4 rounded-lg border bg-gray-50"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {getActionIcon(entry.action)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {getStatusLabel(entry.new_status)}
                              </span>
                              <Badge className="bg-blue-100 text-blue-800" variant="outline">
                                {entry.action === 'granted' && 'Otorgado'}
                                {entry.action === 'withdrawn' && 'Retirado'}
                                {entry.action === 'modified' && 'Modificado'}
                                {entry.action === 'expired' && 'Expirado'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {formatDate(entry.created_at)}
                            </p>
                            {entry.change_reason && (
                              <div className="bg-white p-3 rounded text-sm border">
                                <span className="font-medium">Razón:</span>
                                <p className="mt-1 text-gray-700">{entry.change_reason}</p>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                              Por: {entry.changed_by_role === 'user' ? 'Usuario' : entry.changed_by_role}
                              {entry.ip_address && ` • IP: ${entry.ip_address}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Version Tab */}
          <TabsContent value="version" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Versión del Consentimiento</CardTitle>
                <CardDescription>
                  Información sobre la versión actual de los términos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {consentRecord.version ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600">Versión</label>
                      <p className="text-lg font-bold text-gray-900">
                        v{consentRecord.version.version}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600">Título</label>
                      <p className="text-gray-900">{consentRecord.version.title}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600">Descripción</label>
                      <p className="text-gray-900">{consentRecord.version.description}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600">Vigente desde</label>
                      <p className="text-gray-900">
                        {formatDate(consentRecord.version.effective_date)}
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Términos Completos
                      </Button>
                    </div>
                  </>
                ) : (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      No se encontró información de la versión de este consentimiento.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Relacionadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/app/consent" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Ver todos mis consentimientos
              </Button>
            </Link>

            {pendingConsents.length > 0 && (
              <Link href="/app/consent/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Consentimientos pendientes ({pendingConsents.length})
                </Button>
              </Link>
            )}

            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Exportar mis datos (ARCO)
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Consent Modal */}
      {showModal && (
        <ConsentModal
          open={showModal}
          onOpenChange={(open) => {
            if (!open) {
              setShowModal(false)
              setError(null)
              setSuccessMessage(null)
            }
          }}
          consentType={consentRecord.consent_type}
          currentConsent={isGranted}
          loading={submitting}
          onGrant={handleGrant}
          onWithdraw={isGranted ? handleWithdraw : undefined}
        />
      )}
    </div>
  )
}
