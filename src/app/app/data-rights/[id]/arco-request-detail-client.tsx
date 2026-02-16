/**
 * ARCO Request Detail Client Component
 *
 * Client-side component for displaying detailed ARCO request information
 * and its change history.
 *
 * @component ArcoRequestDetailClient
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logger } from '@/lib/observability/logger'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  Eye,
  Edit3,
  Trash2,
  Ban,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  MessageSquare,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'

interface ArcoRequest {
  id: string
  request_type: 'ACCESS' | 'RECTIFY' | 'CANCEL' | 'OPPOSE'
  title: string
  description: string
  status: string
  priority: string
  data_scope: string[]
  specific_records: string[] | null
  justification: string | null
  created_at: string
  due_date: string
  completed_at: string | null
  response_message: string | null
  resolution_summary: string | null
}

interface HistoryEntry {
  id: string
  status: string
  status_changed_at: string
  changed_by: string
  notes: string | null
  attachment_url: string | null
}

interface ArcoRequestDetailClientProps {
  userId: string
  request: ArcoRequest
  history: HistoryEntry[]
}

const DATA_SCOPE_LABELS: Record<string, string> = {
  profiles: 'Información personal',
  appointments: 'Citas y consultas',
  prescriptions: 'Recetas médicas',
  soap_consultations: 'Notas SOAP',
  chat_conversations: 'Conversaciones de chat',
  chat_messages: 'Mensajes de chat',
  payments: 'Pagos',
  follow_up_schedules: 'Seguimientos',
  all: 'Todos los datos',
}

export function ArcoRequestDetailClient({ userId, request, history }: ArcoRequestDetailClientProps) {
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)
  const [ cancelling, setCancelling] = useState(false)

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
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      acknowledged: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      info_required: 'bg-orange-100 text-orange-800 border-orange-200',
      escalated: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      denied: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[status] || colors.pending
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      acknowledged: 'Reconocido',
      processing: 'Procesando',
      info_required: 'Información Requerida',
      escalated: 'Escalado',
      completed: 'Completado',
      denied: 'Denegado',
      cancelled: 'Cancelado',
    }
    return labels[status] || status
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    }
    return colors[priority] || colors.normal
  }

  const getRequestTypeIcon = () => {
    switch (request.request_type) {
      case 'ACCESS':
        return <Eye className="h-6 w-6 text-blue-600" />
      case 'RECTIFY':
        return <Edit3 className="h-6 w-6 text-green-600" />
      case 'CANCEL':
        return <Trash2 className="h-6 w-6 text-red-600" />
      case 'OPPOSE':
        return <Ban className="h-6 w-6 text-purple-600" />
      default:
        return <FileText className="h-6 w-6 text-gray-600" />
    }
  }

  const getRequestTypeLabel = () => {
    const labels: Record<string, string> = {
      ACCESS: 'Derecho de Acceso',
      RECTIFY: 'Derecho de Rectificación',
      CANCEL: 'Derecho de Cancelación',
      OPPOSE: 'Derecho de Oposición',
    }
    return labels[request.request_type] || request.request_type
  }

  const isOverdue = () => {
    return new Date(request.due_date) < new Date() &&
           !['completed', 'denied', 'cancelled'].includes(request.status)
  }

  const handleDownload = async () => {
    if (request.request_type !== 'ACCESS' || request.status !== 'completed') {
      return
    }

    setDownloading(true)

    try {
      const response = await fetch(`/api/arco/requests/${request.id}/export`)

      if (!response.ok) {
        throw new Error('Error al exportar datos')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `datos-arco-${request.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      logger.error('Error downloading data', { error: err instanceof Error ? err.message : String(err) })
    } finally {
      setDownloading(false)
    }
  }

  const handleCancel = async () => {
    if (!['pending', 'acknowledged'].includes(request.status)) {
      return
    }

    setCancelling(true)

    try {
      const response = await fetch(`/api/arco/requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (!response.ok) {
        throw new Error('Error al cancelar solicitud')
      }

      router.push('/app/data-rights')
    } catch (err) {
      logger.error('Error cancelling request', { error: err instanceof Error ? err.message : String(err) })
      setCancelling(false)
    }
  }

  const canCancel = ['pending', 'acknowledged'].includes(request.status)
  const canDownload = request.request_type === 'ACCESS' && request.status === 'completed'

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/app/data-rights">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900">Detalle de Solicitud ARCO</h1>
            <p className="text-xs text-gray-500">{getRequestTypeLabel()}</p>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status Banner */}
        <Card className={isOverdue() ? 'border-red-200 bg-red-50' : 'border-indigo-200 bg-indigo-50'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-white">
                  {getRequestTypeIcon()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{request.title}</h2>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(request.status)} variant="outline">
                      {getStatusLabel(request.status)}
                    </Badge>
                    {isOverdue() && (
                      <Badge className="bg-red-100 text-red-800" variant="outline">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Vencida
                      </Badge>
                    )}
                    <Badge className={getPriorityColor(request.priority)} variant="outline">
                      {request.priority === 'urgent' && '⚡ '}
                      Prioridad: {request.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">ID de Solicitud</p>
                <p className="font-mono font-bold text-gray-900">{request.id.slice(0, 8)}...</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="timeline">Historial</TabsTrigger>
            <TabsTrigger value="actions">Acciones</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Solicitud</CardTitle>
                <CardDescription>Detalles completos de tu solicitud ARCO</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Tipo de Solicitud</label>
                    <p className="text-gray-900 font-medium">{getRequestTypeLabel()}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                    <p className="text-gray-900 font-medium">{formatDate(request.created_at)}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Fecha Límite</label>
                    <p className={`font-medium ${isOverdue() ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(request.due_date)}
                    </p>
                  </div>

                  {request.completed_at && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600">Fecha de Resolución</label>
                      <p className="text-gray-900 font-medium">{formatDate(request.completed_at)}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg border">
                    {request.description}
                  </p>
                </div>

                {request.data_scope && request.data_scope.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Alcance de Datos Solicitado</label>
                    <div className="flex flex-wrap gap-2">
                      {request.data_scope.map((scope) => (
                        <Badge key={scope} variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-200">
                          {DATA_SCOPE_LABELS[scope] || scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {request.specific_records && request.specific_records.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Registros Específicos</label>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <code className="text-sm text-indigo-700">
                        {request.specific_records.join(', ')}
                      </code>
                    </div>
                  </div>
                )}

                {request.justification && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Justificación</label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg border">
                      {request.justification}
                    </p>
                  </div>
                )}

                {request.response_message && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Respuesta</label>
                    <div className={`p-4 rounded-lg border ${
                      request.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : request.status === 'denied'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className="text-gray-900">{request.response_message}</p>
                    </div>
                  </div>
                )}

                {request.resolution_summary && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Resolución de la Solicitud</label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg border">
                      {request.resolution_summary}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Cambios</CardTitle>
                <CardDescription>Todas las actualizaciones de esta solicitud</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay historial disponible para esta solicitud</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] w-full">
                    <div className="space-y-4 pr-4">
                      {history.map((entry, index) => (
                        <div key={entry.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-indigo-500' : 'bg-gray-300'
                            }`} />
                            {index < history.length - 1 && (
                              <div className="w-0.5 bg-gray-300 flex-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={getStatusColor(entry.status)} variant="outline">
                                {getStatusLabel(entry.status)}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {formatDate(entry.status_changed_at)}
                              </span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border">
                              <p className="text-sm text-gray-700 mb-1">
                                <strong>Cambiado por:</strong> {entry.changed_by}
                              </p>
                              {entry.notes && (
                                <p className="text-sm text-gray-900">{entry.notes}</p>
                              )}
                              {entry.attachment_url && (
                                <a
                                  href={entry.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mt-2"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Ver documento adjunto
                                </a>
                              )}
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

          {/* Actions Tab */}
          <TabsContent value="actions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Download Action (only for completed ACCESS requests) */}
              <Card className={canDownload ? 'cursor-pointer hover:shadow-md transition-shadow' : 'opacity-50'}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <Download className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Descargar Mis Datos</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {canDownload
                          ? 'Tu solicitud de acceso ha sido completada. Descarga tus datos en formato JSON.'
                          : 'Disponible cuando la solicitud de acceso esté completada.'}
                      </p>
                      <Button
                        onClick={handleDownload}
                        disabled={!canDownload || downloading}
                        className="w-full"
                      >
                        {downloading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Descargando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Datos
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cancel Action (only for pending requests) */}
              <Card className={canCancel ? 'cursor-pointer hover:shadow-md transition-shadow' : 'opacity-50'}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-red-50">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Cancelar Solicitud</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {canCancel
                          ? 'Puedes cancelar esta solicitud si ya no deseas continuar con ella.'
                          : 'Solo se pueden cancelar solicitudes pendientes.'}
                      </p>
                      <Button
                        onClick={handleCancel}
                        disabled={!canCancel || cancelling}
                        variant="destructive"
                        className="w-full"
                      >
                        {cancelling ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar Solicitud
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Action */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-50">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Contactar Soporte</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Si tienes dudas sobre esta solicitud, contacta a nuestro equipo de soporte.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/help')}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Abrir Chat de Soporte
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legal Resources */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-50">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Recursos Legales</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Conoce más sobre tus derechos ARCO y la normativa aplicable.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => router.push('/privacy')}
                        >
                          Aviso de Privacidad
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => router.push('/terms')}
                        >
                          Términos de Servicio
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to Center */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-600">
                <ArrowLeft className="h-4 w-4" />
                <Link href="/app/data-rights" className="hover:text-indigo-600 transition-colors">
                  Volver al Centro de Derechos ARCO
                </Link>
              </div>
              <Link href="/app/data-rights/new">
                <Button variant="outline">
                  Nueva Solicitud
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
