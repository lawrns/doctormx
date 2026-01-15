'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { 
  type SecondOpinionRequest, 
  type SecondOpinionDocument,
  SECOND_OPINION_CONFIG 
} from '@/lib/domains/second-opinion/shared'

interface RequestWithDocuments extends SecondOpinionRequest {
  documents: SecondOpinionDocument[]
}

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

const STATUS_LABELS: Record<string, { label: string; color: BadgeVariant }> = {
  draft: { label: 'Borrador', color: 'neutral' },
  submitted: { label: 'Enviada', color: 'info' },
  ai_processing: { label: 'Procesando', color: 'info' },
  pending_review: { label: 'Pendiente revisión', color: 'warning' },
  in_review: { label: 'En revisión', color: 'warning' },
  completed: { label: 'Completada', color: 'success' },
  expired: { label: 'Expirada', color: 'error' },
  cancelled: { label: 'Cancelada', color: 'error' },
}

export default function SecondOpinionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [request, setRequest] = useState<RequestWithDocuments | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-red-600">{error || 'Solicitud no encontrada'}</p>
          <Button className="mt-4" onClick={() => router.push('/app/second-opinion')}>
            Volver
          </Button>
        </Card>
      </div>
    )
  }

  const statusInfo = STATUS_LABELS[request.status] || { label: request.status, color: 'gray' as const }
  const price = SECOND_OPINION_CONFIG.PRICES[request.type] / 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Segunda Opinión
            </h1>
            <p className="text-sm text-gray-500">ID: {request.id.slice(0, 8)}...</p>
          </div>
          <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Clinical Information */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Información Clínica</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Motivo de consulta
                </label>
                <p className="mt-1 text-gray-900">{request.chief_complaint}</p>
              </div>

              {request.current_diagnosis && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Diagnóstico actual
                  </label>
                  <p className="mt-1 text-gray-900">{request.current_diagnosis}</p>
                </div>
              )}

              {request.current_treatment && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tratamiento actual
                  </label>
                  <p className="mt-1 text-gray-900">{request.current_treatment}</p>
                </div>
              )}

              {request.medical_history && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Historial médico
                  </label>
                  <p className="mt-1 text-gray-900">{request.medical_history}</p>
                </div>
              )}

              {request.questions && request.questions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Preguntas para el médico
                  </label>
                  <ul className="mt-1 list-inside list-disc text-gray-900">
                    {request.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Documents */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Documentos</h2>
            
            {request.documents.length === 0 ? (
              <p className="text-gray-500">No se han subido documentos</p>
            ) : (
              <ul className="divide-y">
                {request.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">{doc.file_name}</p>
                      <p className="text-sm text-gray-500">
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
            <Card className="border-green-200 bg-green-50">
              <h2 className="mb-4 text-lg font-semibold text-green-800">
                Opinión del Médico
              </h2>
              <div className="space-y-4">
                <p className="text-gray-900">{request.doctor_opinion}</p>
                
                {request.doctor_recommendations && (
                  <div>
                    <label className="text-sm font-medium text-green-700">
                      Recomendaciones
                    </label>
                    <p className="mt-1 text-gray-900">{request.doctor_recommendations}</p>
                  </div>
                )}
                
                {request.doctor_follow_up_needed && (
                  <div className="rounded-lg bg-yellow-100 p-3">
                    <p className="text-sm font-medium text-yellow-800">
                      ⚠️ El médico recomienda seguimiento
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* AI Summary (if available) */}
          {request.ai_preliminary_summary && (
            <Card className="border-blue-200 bg-blue-50">
              <h2 className="mb-2 text-lg font-semibold text-blue-800">
                Resumen Preliminar (IA)
              </h2>
              <p className="text-xs text-blue-600 mb-3">
                Este es un análisis automatizado. La opinión final será del médico.
              </p>
              <p className="text-gray-900">{request.ai_preliminary_summary}</p>
            </Card>
          )}

          {/* Payment & Submit */}
          {request.status === 'draft' && (
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    Total: ${price.toLocaleString()} MXN
                  </p>
                  <p className="text-sm text-gray-500">
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
