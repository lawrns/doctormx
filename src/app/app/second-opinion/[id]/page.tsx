'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  type SecondOpinionRequest, 
  type SecondOpinionDocument,
  SECOND_OPINION_CONFIG 
} from '@/lib/domains/second-opinion/shared'

interface RequestWithDocuments extends SecondOpinionRequest {
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

export default function SecondOpinionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [request, setRequest] = useState<RequestWithDocuments | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function fetchRequest() {
      try {
        const response = await fetch(`/api/second-opinion/${id}`)
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
    }
    
    fetchRequest()
  }, [id])

  const handleSubmit = async () => {
    if (!request) return
    
    setSubmitting(true)
    try {
      // Create payment intent for second opinion
      const paymentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'second_opinion',
          second_opinion_id: id,
          amount: SECOND_OPINION_CONFIG.PRICES.basic,
        }),
      })
      
      if (!paymentResponse.ok) {
        const paymentData = await paymentResponse.json()
        throw new Error(paymentData.error || 'Error creating payment')
      }
      
      const { payment_intent_id } = await paymentResponse.json()
      
      const response = await fetch(`/api/second-opinion/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: payment_intent_id }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar')
      }
      
      // Refresh data
      const updated = await fetch(`/api/second-opinion/${id}`)
      const data = await updated.json()
      setRequest(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (error || !request) {
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

  const statusInfo = STATUS_LABELS[request.status] || { label: request.status, color: 'secondary' as const }
  const price = SECOND_OPINION_CONFIG.PRICES[request.type] / 100

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Segunda Opinión
            </h1>
            <p className="text-sm text-muted-foreground">ID: {request.id.slice(0, 8)}...</p>
          </div>
          <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Clinical Information */}
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Información Clínica</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Motivo de consulta
                </label>
                <p className="mt-1 text-foreground">{request.chief_complaint}</p>
              </div>

              {request.current_diagnosis && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Diagnóstico actual
                  </label>
                  <p className="mt-1 text-foreground">{request.current_diagnosis}</p>
                </div>
              )}

              {request.current_treatment && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tratamiento actual
                  </label>
                  <p className="mt-1 text-foreground">{request.current_treatment}</p>
                </div>
              )}

              {request.medical_history && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Historial médico
                  </label>
                  <p className="mt-1 text-foreground">{request.medical_history}</p>
                </div>
              )}

              {request.questions && request.questions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Preguntas para el médico
                  </label>
                  <ul className="mt-1 list-inside list-disc text-foreground">
                    {request.questions.map((q, i) => (
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
            
            {request.documents.length === 0 ? (
              <p className="text-muted-foreground">No se han subido documentos</p>
            ) : (
              <ul className="divide-y divide-border space-y-3">
                {request.documents.map((doc) => (
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

            {request.status === 'draft' && (
              <div className="mt-4">
                <Button variant="secondary" size="sm">
                  + Subir documento
                </Button>
              </div>
            )}
          </Card>

          {/* Doctor Opinion (if completed) */}
          {request.status === 'completed' && request.doctor_opinion && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Opinión del Médico
              </h2>
              <div className="space-y-4">
                <p className="text-foreground">{request.doctor_opinion}</p>
                
                {request.doctor_recommendations && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Recomendaciones
                    </label>
                    <p className="mt-1 text-foreground">{request.doctor_recommendations}</p>
                  </div>
                )}
                
                {request.doctor_follow_up_needed && (
                  <div className="rounded-xl bg-secondary/50 border border-border p-3">
                    <p className="text-sm font-medium text-foreground">
                      El médico recomienda seguimiento
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* AI Summary (if available) */}
          {request.ai_preliminary_summary && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">
                Resumen Preliminar (IA)
              </h2>
              <p className="text-xs text-muted-foreground mb-3">
                Este es un análisis automatizado. La opinión final será del médico.
              </p>
              <p className="text-foreground">{request.ai_preliminary_summary}</p>
            </Card>
          )}

          {/* Payment & Submit */}
          {request.status === 'draft' && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-bold tracking-tight text-foreground">
                    Total: ${price.toLocaleString()} MXN
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Revisión en hasta 72 horas
                  </p>
                </div>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Procesando...' : 'Pagar y Enviar'}
                </Button>
              </div>
            </Card>
          )}

          {/* Back Button */}
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
