'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  type SecondOpinionRequest,
  SECOND_OPINION_CONFIG,
} from '@/lib/domains/second-opinion/shared'

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

function SecondOpinionContent() {
  const router = useRouter()
  const [requests, setRequests] = useState<SecondOpinionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [form, setForm] = useState({
    type: 'specialist' as const,
    chief_complaint: '',
    current_diagnosis: '',
    current_treatment: '',
    medical_history: '',
    allergies: '',
    medications: '',
    questions: [] as string[],
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      const response = await fetch('/api/second-opinion')
      if (!response.ok) throw new Error('Error al cargar solicitudes')
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (form.chief_complaint.length < 10) {
      setError('Describe tu motivo de consulta (mínimo 10 caracteres)')
      return
    }

    setCreating(true)
    setError(null)
    try {
      const response = await fetch('/api/second-opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          questions: form.questions.filter(Boolean),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear solicitud')
      }

      const result = await response.json()
      router.push(`/app/second-opinion/${result.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Segunda Opinión Médica
            </h1>
            <p className="text-sm text-muted-foreground">
              Obtén la opinión de un especialista verificado sobre tu caso clínico
            </p>
          </div>
          <Button onClick={() => setShowNewForm(!showNewForm)}>
            {showNewForm ? 'Cancelar' : '+ Nueva solicitud'}
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* New request form */}
        {showNewForm && (
          <Card className="p-6 mb-8">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Nueva solicitud</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo de revisión</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-foreground"
                >
                  <option value="basic">Básica - $500 MXN</option>
                  <option value="specialist">Especializada - $1,500 MXN</option>
                  <option value="panel">Panel Multidisciplinario - $3,000 MXN</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Motivo de consulta *</label>
                <textarea
                  value={form.chief_complaint}
                  onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })}
                  placeholder="Describe tu situación médica, síntomas y por qué buscas una segunda opinión..."
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-foreground min-h-[100px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Diagnóstico actual</label>
                  <input
                    type="text"
                    value={form.current_diagnosis}
                    onChange={(e) => setForm({ ...form, current_diagnosis: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tratamiento actual</label>
                  <input
                    type="text"
                    value={form.current_treatment}
                    onChange={(e) => setForm({ ...form, current_treatment: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Historial médico relevante</label>
                <textarea
                  value={form.medical_history}
                  onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
                  placeholder="Cirugías previas, condiciones crónicas, etc."
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-foreground"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Alergias</label>
                  <input
                    type="text"
                    value={form.allergies}
                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Medicamentos actuales</label>
                  <input
                    type="text"
                    value={form.medications}
                    onChange={(e) => setForm({ ...form, medications: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
              </div>

              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? 'Creando...' : 'Crear solicitud'}
              </Button>
            </div>
          </Card>
        )}

        {/* Requests list */}
        {requests.length === 0 && !showNewForm ? (
          <Card className="p-12 text-center">
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No tienes solicitudes todavía
            </h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primera solicitud de segunda opinión médica
            </p>
            <Button onClick={() => setShowNewForm(true)}>
              Solicitar segunda opinión
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const statusInfo = STATUS_LABELS[req.status] || { label: req.status, color: 'secondary' as const }
              const price = (req.price_cents || SECOND_OPINION_CONFIG.PRICES[req.type]) / 100
              return (
                <Card
                  key={req.id}
                  className="p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => router.push(`/app/second-opinion/${req.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
                        <span className="text-sm font-medium text-muted-foreground">
                          {req.type === 'basic' ? 'Básica' : req.type === 'specialist' ? 'Especializada' : 'Panel'}
                          {' · '}${price.toLocaleString()} MXN
                        </span>
                      </div>
                      <p className="text-foreground line-clamp-2">{req.chief_complaint}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(req.created_at).toLocaleDateString('es-MX', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-muted-foreground shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SecondOpinionContent
