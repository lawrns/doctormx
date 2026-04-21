'use client'

import { useState } from 'react'
import { LoadingButton } from '@/components/LoadingButton'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  const getUrgencyBadgeVariant = (level: string) => {
    switch (level) {
      case 'emergency':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  if (actionStatus === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/doctor/appointments" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Volver</span>
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">Revisión completada</h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12">
          <Card className="bg-card rounded-2xl border border-border shadow-dx-1 p-8 text-center">
            <CardContent className="p-0">
              <div className="w-20 h-20 bg-vital-soft rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-vital" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Revisión guardada</h2>
              <p className="text-muted-foreground mb-6">
                Tu revisión del análisis de imagen ha sido guardada correctamente.
                El paciente podrá verla en su expediente.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href="/doctor/appointments">
                    Volver a consultas
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/doctor/images">
                    Ver más análisis
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/doctor/appointments" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-semibold text-foreground">Revisar Imagen Médica</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getUrgencyBadgeVariant(analysis.urgencyLevel)}>
              Urgencia: {analysis.urgencyLabel}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="bg-card rounded-2xl border border-border shadow-dx-1 overflow-hidden">
              <CardHeader className="py-4 border-b border-border">
                <CardTitle className="font-semibold text-foreground text-base">Imagen Original</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={analysis.imageUrl}
                  alt="Imagen médica"
                  className="w-full rounded-lg object-contain max-h-[500px]"
                />
              </CardContent>
            </Card>

            <Card className="bg-card rounded-2xl border border-border shadow-dx-1">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Información del Paciente</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-muted-foreground">Nombre</dt>
                    <dd className="text-foreground">{analysis.patientName}</dd>
                  </div>
                  {analysis.patientEmail && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Email</dt>
                      <dd className="text-foreground">{analysis.patientEmail}</dd>
                    </div>
                  )}
                  {analysis.patientPhone && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Teléfono</dt>
                      <dd className="text-foreground">{analysis.patientPhone}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-muted-foreground">Tipo de imagen</dt>
                    <dd className="text-foreground">{analysis.imageTypeLabel}</dd>
                  </div>
                  {analysis.patientNotes && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Notas del paciente</dt>
                      <dd className="text-foreground text-sm">{analysis.patientNotes}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card rounded-2xl border border-border shadow-dx-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Análisis de IA</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Confianza: {analysis.confidencePercent}%</span>
                    <Badge variant="secondary">{analysis.statusLabel}</Badge>
                  </div>
                </div>

                {analysis.findings && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-2">Hallazgos</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{analysis.findings}</p>
                  </div>
                )}

                {analysis.possibleConditions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-2">Posibles condiciones</h4>
                    <ul className="space-y-2">
                      {analysis.possibleConditions.map((condition, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-muted-foreground">{condition.condition}</span>
                          <span className="text-muted-foreground/70">({condition.probability})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-2">Recomendaciones</h4>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <svg className="w-4 h-4 text-vital mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.followUpNeeded && (
                  <div className="p-3 bg-secondary/50 border border-border rounded-lg">
                    <p className="text-sm text-foreground">
                      <strong>Seguimiento requerido:</strong> {analysis.followUpNotes || 'Ver recomendaciones'}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  <p>Analizado: {formatDate(analysis.createdAt)}</p>
                  <p>Costo: ${(analysis.costCents / 100).toFixed(2)} MXN</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card rounded-2xl border border-border shadow-dx-1">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Tu Revisión</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notas del doctor
                  </label>
                  <Textarea
                    placeholder="Agrega tus observaciones, correcciones o comentarios..."
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Modificar hallazgos (opcional)
                  </label>
                  <Textarea
                    rows={4}
                    value={modifiedFindings}
                    onChange={(e) => setModifiedFindings(e.target.value)}
                    placeholder="Corrige o amplía los hallazgos de la IA..."
                  />
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{errorMessage}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <LoadingButton
                    onClick={() => handleAction('approved')}
                    isLoading={actionStatus === 'submitting' && action === 'approved'}
                    variant="primary"
                    className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground"
                  >
                    Aprobar análisis
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => handleAction('modified')}
                    isLoading={actionStatus === 'submitting' && action === 'modified'}
                    variant="secondary"
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    Modificar
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => handleAction('rejected')}
                    isLoading={actionStatus === 'submitting' && action === 'rejected'}
                    variant="danger"
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
                  >
                    Rechazar
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>

            <div className="bg-secondary/50 border border-border rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-amber-700">
                  <p className="font-medium text-foreground">Recuerda</p>
                  <p className="mt-1 text-muted-foreground">
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
