'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  type SecondOpinionRequest,
  type SecondOpinionDocument,
  type SecondOpinionMessage,
  SECOND_OPINION_CONFIG,
} from '@/lib/domains/second-opinion/shared'

interface RequestWithData extends SecondOpinionRequest {
  documents: SecondOpinionDocument[]
}

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'info' | 'secondary'

const STATUS_LABELS: Record<string, { label: string; color: BadgeVariant }> = {
  draft: { label: 'Borrador', color: 'secondary' },
  submitted: { label: 'Enviada', color: 'info' },
  ai_processing: { label: 'Procesando', color: 'info' },
  pending_review: { label: 'Pendiente revisión', color: 'warning' },
  in_review: { label: 'En revisión', color: 'warning' },
  completed: { label: 'Completada', color: 'success' },
  expired: { label: 'Expirada', color: 'destructive' },
  cancelled: { label: 'Cancelada', color: 'destructive' },
}

const STATUS_ORDER = ['draft', 'submitted', 'ai_processing', 'pending_review', 'in_review', 'completed']
const STATUS_DISPLAY: Record<string, string> = {
  draft: 'Solicitado',
  submitted: 'Enviado',
  ai_processing: 'Análisis IA',
  pending_review: 'Pendiente',
  in_review: 'En revisión',
  completed: 'Reporte listo',
}

export default function SecondOpinionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.requestId as string

  const [requestData, setRequest] = useState<RequestWithData | null>(null)
  const [messages, setMessages] = useState<SecondOpinionMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const fetchRequest = useCallback(async () => {
    try {
      const response = await fetch(`/api/second-opinion/${requestId}`)
      if (!response.ok) {
        throw new Error('No se pudo cargar la solicitud')
      }
      const data = await response.json()
      setRequest(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [requestId])

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/second-opinion/messages?request_id=${requestId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch {
      // silently fail
    }
  }, [requestId])

  useEffect(() => {
    fetchRequest()
    fetchMessages()
  }, [fetchRequest, fetchMessages])

  useEffect(() => {
    if (requestData && ['submitted', 'ai_processing', 'pending_review', 'in_review'].includes(requestData.status)) {
      const interval = setInterval(fetchMessages, 15000)
      return () => clearInterval(interval)
    }
  }, [requestData?.status, fetchMessages])

  const handleSubmit = async () => {
    if (!requestData) return

    setSubmitting(true)
    try {
      const type = requestData.type
      const amount = SECOND_OPINION_CONFIG.PRICES[type]

      const paymentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'second_opinion',
          second_opinion_id: requestId,
          amount,
        }),
      })

      if (!paymentResponse.ok) {
        const paymentData = await paymentResponse.json()
        throw new Error(paymentData.error || 'Error creando el pago')
      }

      const { payment_intent_id } = await paymentResponse.json()

      const response = await fetch(`/api/second-opinion/${requestId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: payment_intent_id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar')
      }

      await fetchRequest()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !requestData) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'other')

      const response = await fetch(`/api/second-opinion/${requestId}/documents`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al subir documento')
      }

      await fetchRequest()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setUploading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !requestData) return

    setSendingMsg(true)
    try {
      const response = await fetch('/api/second-opinion/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          content: newMessage.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Error al enviar mensaje')
      }

      setNewMessage('')
      await fetchMessages()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSendingMsg(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (error || !requestData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="p-6 text-center">
          <p className="text-destructive">{error || 'Solicitud no encontrada'}</p>
          <Button className="mt-4" onClick={() => router.push('/app/second-opinion')}>
            Volver
          </Button>
        </Card>
      </div>
    )
  }

  const statusInfo = STATUS_LABELS[requestData.status] || { label: requestData.status, color: 'secondary' as const }
  const price = SECOND_OPINION_CONFIG.PRICES[requestData.type] / 100
  const currentStepIndex = STATUS_ORDER.indexOf(requestData.status)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Segunda Opinión
            </h1>
            <p className="text-sm text-muted-foreground">ID: {requestData.id.slice(0, 8)}...</p>
          </div>
          <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
        </div>

        <div className="space-y-6">
          {/* Status tracker */}
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Estado</h2>
            <div className="flex items-center gap-2">
              {STATUS_ORDER.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex
                const isCurrent = idx === currentStepIndex
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          isCompleted ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                        } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className="mt-1 text-xs text-muted-foreground">{STATUS_DISPLAY[step]}</span>
                    </div>
                    {idx < STATUS_ORDER.length - 1 && (
                      <div className={`h-0.5 flex-1 ${idx < currentStepIndex ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Clinical Information */}
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Información Clínica</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Motivo de consulta</label>
                <p className="mt-1 text-foreground">{requestData.chief_complaint}</p>
              </div>
              {requestData.current_diagnosis && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Diagnóstico actual</label>
                  <p className="mt-1 text-foreground">{requestData.current_diagnosis}</p>
                </div>
              )}
              {requestData.current_treatment && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tratamiento actual</label>
                  <p className="mt-1 text-foreground">{requestData.current_treatment}</p>
                </div>
              )}
              {requestData.medical_history && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Historial médico</label>
                  <p className="mt-1 text-foreground">{requestData.medical_history}</p>
                </div>
              )}
              {requestData.questions && requestData.questions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preguntas para el médico</label>
                  <ul className="mt-1 list-inside list-disc text-foreground">
                    {requestData.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Documents */}
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Documentos</h2>
            {requestData.documents.length === 0 ? (
              <p className="text-muted-foreground">No se han subido documentos</p>
            ) : (
              <ul className="divide-y divide-border space-y-3">
                {requestData.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between py-3 bg-secondary/50 rounded-xl border border-border px-4">
                    <div>
                      <p className="font-medium text-foreground">{doc.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.type} • {((doc.size_bytes || 0) / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {['draft', 'submitted'].includes(requestData.status) && (
              <div className="mt-4">
                <label className="cursor-pointer">
                  <Button variant="secondary" size="sm" disabled={uploading} asChild>
                    <span>{uploading ? 'Subiendo...' : '+ Subir documento'}</span>
                  </Button>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp,.dcm" onChange={handleFileUpload} />
                </label>
              </div>
            )}
          </Card>

          {/* AI Summary */}
          {requestData.ai_preliminary_summary && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">
                Resumen Preliminar (IA)
              </h2>
              <p className="text-xs text-muted-foreground mb-3">
                Este es un análisis automatizado. La opinión final será del médico.
              </p>
              <p className="text-foreground">{requestData.ai_preliminary_summary}</p>
            </Card>
          )}

          {/* Messages */}
          {(requestData.status !== 'draft' || messages.length > 0) && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Mensajes</h2>
              {messages.length === 0 ? (
                <p className="text-muted-foreground">No hay mensajes todavía</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-xl p-3 ${
                        msg.sender_role === 'patient'
                          ? 'bg-primary/10 ml-8'
                          : msg.sender_role === 'doctor'
                          ? 'bg-secondary mr-8'
                          : 'bg-muted mx-8 text-center'
                      }`}
                    >
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {msg.sender_role === 'patient' ? 'Tú' : msg.sender_role === 'doctor' ? 'Médico' : 'Sistema'}
                      </p>
                      <p className="text-foreground text-sm">{msg.content}</p>
                      {msg.attachment_url && (
                        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 block">
                          Ver adjunto
                        </a>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.created_at).toLocaleString('es-MX')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {!['completed', 'expired', 'cancelled'].includes(requestData.status) && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <Button onClick={handleSendMessage} disabled={sendingMsg || !newMessage.trim()} size="sm">
                    {sendingMsg ? '...' : 'Enviar'}
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Doctor Opinion */}
          {requestData.status === 'completed' && requestData.doctor_opinion && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Opinión del Médico</h2>
              <div className="space-y-4">
                <p className="text-foreground">{requestData.doctor_opinion}</p>
                {requestData.doctor_recommendations && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Recomendaciones</label>
                    <p className="mt-1 text-foreground">{requestData.doctor_recommendations}</p>
                  </div>
                )}
                {requestData.doctor_follow_up_needed && (
                  <div className="rounded-xl bg-secondary/50 border border-border p-3">
                    <p className="text-sm font-medium text-foreground">
                      El médico recomienda seguimiento
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Payment & Submit */}
          {requestData.status === 'draft' && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-bold tracking-tight text-foreground">
                    Total: ${price.toLocaleString()} MXN
                  </p>
                  <p className="text-sm text-muted-foreground">Revisión en hasta 72 horas</p>
                </div>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Procesando...' : 'Pagar y Enviar'}
                </Button>
              </div>
            </Card>
          )}

          <div className="flex justify-start">
            <Button variant="secondary" onClick={() => router.push('/app/second-opinion')}>
              ← Volver a mis solicitudes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
