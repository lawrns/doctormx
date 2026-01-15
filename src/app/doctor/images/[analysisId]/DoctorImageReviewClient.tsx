'use client'

import { useState } from 'react'
import { LoadingButton } from '@/components/LoadingButton'
import { Textarea } from '@/components/Input'
import Link from 'next/link'

interface AnalysisData {
  id: string
  imageUrl: string
  imageType: string
  imageTypeLabel: string
  patientName: string
  patientEmail: string
  patientPhone: string
  patientNotes: string | null
  findings: string
  possibleConditions: Array<{ condition: string; probability: string }>
  urgencyLevel: string
  urgencyLabel: string
  recommendations: string[]
  followUpNeeded: boolean
  followUpNotes: string | null
  confidencePercent: number
  status: string
  statusLabel: string
  createdAt: string
  reviewedAt: string | null
  costCents: number
}

interface DoctorImageReviewClientProps {
  analysis: AnalysisData
  doctorId: string
  doctorName: string
}

type ActionStatus = 'idle' | 'submitting' | 'success' | 'error'

export default function DoctorImageReviewClient({
  analysis
}: DoctorImageReviewClientProps) {
  const [doctorNotes, setDoctorNotes] = useState('')
  const [modifiedFindings, setModifiedFindings] = useState(analysis.findings)
  const [action, setAction] = useState<'approved' | 'rejected' | 'modified' | null>(null)
  const [actionStatus, setActionStatus] = useState<ActionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleAction = async (selectedAction: 'approved' | 'rejected' | 'modified') => {
    setAction(selectedAction)
    setActionStatus('submitting')
    setErrorMessage(null)

    try {
      const response = await fetch(`/api/ai/vision/result/${analysis.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorNotes,
          doctorAction: selectedAction,
          modifiedFindings: selectedAction === 'modified' ? modifiedFindings : undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar la revisión')
      }

      setActionStatus('success')
    } catch (error) {
      setActionStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (actionStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/doctor/appointments" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Volver</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Revisión completada</h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisión guardada</h2>
            <p className="text-gray-600 mb-6">
              Tu revisión del análisis de imagen ha sido guardada correctamente.
              El paciente podrá verla en su expediente.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/doctor/appointments"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Volver a consultas
              </Link>
              <Link
                href="/doctor/images"
                className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Ver más análisis
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/doctor/appointments" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">Revisar Imagen Médica</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              analysis.urgencyLevel === 'emergency' ? 'bg-red-100 text-red-800' :
              analysis.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
              analysis.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              Urgencia: {analysis.urgencyLabel}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Imagen Original</h2>
              </div>
              <div className="p-6">
                /* eslint-disable-next-line @next/next/no-img-element */ <img
                  src={analysis.imageUrl}
                  alt="Imagen médica"
                  className="w-full rounded-lg object-contain max-h-[500px]"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Información del Paciente</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Nombre</dt>
                  <dd className="text-gray-900">{analysis.patientName}</dd>
                </div>
                {analysis.patientEmail && (
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-gray-900">{analysis.patientEmail}</dd>
                  </div>
                )}
                {analysis.patientPhone && (
                  <div>
                    <dt className="text-sm text-gray-500">Teléfono</dt>
                    <dd className="text-gray-900">{analysis.patientPhone}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">Tipo de imagen</dt>
                  <dd className="text-gray-900">{analysis.imageTypeLabel}</dd>
                </div>
                {analysis.patientNotes && (
                  <div>
                    <dt className="text-sm text-gray-500">Notas del paciente</dt>
                    <dd className="text-gray-900 text-sm">{analysis.patientNotes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Análisis de IA</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Confianza: {analysis.confidencePercent}%</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{analysis.statusLabel}</span>
                </div>
              </div>

              {analysis.findings && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Hallazgos</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{analysis.findings}</p>
                </div>
              )}

              {analysis.possibleConditions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Posibles condiciones</h4>
                  <ul className="space-y-2">
                    {analysis.possibleConditions.map((condition, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-primary-500 rounded-full" />
                        <span className="text-gray-600">{condition.condition}</span>
                        <span className="text-gray-400">({condition.probability})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.recommendations.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recomendaciones</h4>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.followUpNeeded && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Seguimiento requerido:</strong> {analysis.followUpNotes || 'Ver recomendaciones'}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400">
                <p>Analizado: {formatDate(analysis.createdAt)}</p>
                <p>Costo: ${(analysis.costCents / 100).toFixed(2)} MXN</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tu Revisión</h3>

              <Textarea
                label="Notas del doctor"
                placeholder="Agrega tus observaciones, correcciones o comentarios..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={4}
                containerClassName="mb-4"
              />

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modificar hallazgos (opcional)
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={modifiedFindings}
                  onChange={(e) => setModifiedFindings(e.target.value)}
                  placeholder="Corrige o amplía los hallazgos de la IA..."
                />
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              <div className="flex gap-3">
                <LoadingButton
                  onClick={() => handleAction('approved')}
                  isLoading={actionStatus === 'submitting' && action === 'approved'}
                  variant="primary"
                  className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
                >
                  Aprobar análisis
                </LoadingButton>
                <LoadingButton
                  onClick={() => handleAction('modified')}
                  isLoading={actionStatus === 'submitting' && action === 'modified'}
                  variant="secondary"
                  className="flex-1"
                >
                  Modificar
                </LoadingButton>
                <LoadingButton
                  onClick={() => handleAction('rejected')}
                  isLoading={actionStatus === 'submitting' && action === 'rejected'}
                  variant="danger"
                  className="flex-1"
                >
                  Rechazar
                </LoadingButton>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Recuerda</p>
                  <p className="mt-1">
                    Este análisis de IA es una herramienta de apoyo. Tu evaluación clínica es la que prevalece para el diagnóstico y tratamiento del paciente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
