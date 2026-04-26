'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  Save,
  Send,
  Upload,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Activity,
  ClipboardList,
  Pill,
} from 'lucide-react'

interface SoapSection {
  key: 'subjective' | 'objective' | 'assessment' | 'plan'
  label: string
  icon: React.ReactNode
  placeholder: string
}

const SECTIONS: SoapSection[] = [
  {
    key: 'subjective',
    label: 'Subjetivo',
    icon: <Stethoscope className="w-4 h-4" />,
    placeholder: 'Síntomas reportados por el paciente, duración, historial...',
  },
  {
    key: 'objective',
    label: 'Objetivo',
    icon: <Activity className="w-4 h-4" />,
    placeholder: 'Hallazgos del examen físico, signos vitales, resultados...',
  },
  {
    key: 'assessment',
    label: 'Análisis',
    icon: <ClipboardList className="w-4 h-4" />,
    placeholder: 'Diagnóstico diferencial, impresión diagnóstica...',
  },
  {
    key: 'plan',
    label: 'Plan',
    icon: <Pill className="w-4 h-4" />,
    placeholder: 'Tratamiento, medicamentos, estudios, seguimiento...',
  },
]

interface AutoSoapPanelProps {
  appointmentId: string
  initialNote?: {
    id: string
    status: string
    soap_subjective?: string
    soap_objective?: string
    soap_assessment?: string
    soap_plan?: string
    transcript_raw?: string
    patient_summary?: string
  } | null
  patientContext?: {
    name?: string
    intakeResponses?: Record<string, unknown>
  } | null
  chatTranscript?: string
  onNoteSaved?: () => void
}

export default function AutoSoapPanel({
  appointmentId,
  initialNote,
  patientContext,
  chatTranscript,
  onNoteSaved,
}: AutoSoapPanelProps) {
  const [soap, setSoap] = useState<Record<string, string>>({
    subjective: initialNote?.soap_subjective || '',
    objective: initialNote?.soap_objective || '',
    assessment: initialNote?.soap_assessment || '',
    plan: initialNote?.soap_plan || '',
  })
  const [status, setStatus] = useState(initialNote?.status || 'draft')
  const [generating, setGenerating] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('subjective')
  const [noteId, setNoteId] = useState(initialNote?.id || null)
  const [recordingConsent, setRecordingConsent] = useState(false)
  const [transcriptText, setTranscriptText] = useState(initialNote?.transcript_raw || chatTranscript || '')
  const [patientSummary, setPatientSummary] = useState(initialNote?.patient_summary || '')

  // Load existing note if available
  useEffect(() => {
    if (initialNote) {
      setSoap({
        subjective: initialNote.soap_subjective || '',
        objective: initialNote.soap_objective || '',
        assessment: initialNote.soap_assessment || '',
        plan: initialNote.soap_plan || '',
      })
      setStatus(initialNote.status)
      setNoteId(initialNote.id)
      setTranscriptText(initialNote.transcript_raw || chatTranscript || '')
      setPatientSummary(initialNote.patient_summary || '')
    }
  }, [chatTranscript, initialNote])

  const updateField = useCallback((key: string, value: string) => {
    setSoap((prev) => ({ ...prev, [key]: value }))
  }, [])

  const transcribeAudio = async (file: File | null) => {
    if (!file) return
    if (!recordingConsent) {
      toast.error('Confirma que el paciente autorizó el uso de la grabación.')
      return
    }

    setTranscribing(true)
    try {
      const formData = new FormData()
      formData.append('appointmentId', appointmentId)
      formData.append('audio', file)
      formData.append('recordingConsent', 'true')

      const res = await fetch('/api/ai/transcription', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'No se pudo transcribir el audio')
        return
      }

      if (data.transcriptText) {
        setTranscriptText(data.transcriptText)
      }
      toast.success('Transcripción lista. Revísala antes de generar la nota.')
    } catch {
      toast.error('Error de red al transcribir')
    } finally {
      setTranscribing(false)
    }
  }

  const ensureDraftNote = async () => {
    if (noteId) return noteId

    const res = await fetch(`/api/soap-notes/appointment/${appointmentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: transcriptText || chatTranscript || null,
        transcript_sources: transcriptText ? ['doctor_reviewed_transcript'] : [],
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok && res.status !== 409) {
      throw new Error(data.error || 'No se pudo crear la nota')
    }

    if (data.note?.id) {
      setNoteId(data.note.id)
      setStatus(data.note.status || 'draft')
      return data.note.id as string
    }

    return noteId
  }

  const generateDraft = async () => {
    setGenerating(true)
    try {
      const transcript = [
        transcriptText || chatTranscript || '',
        patientContext?.intakeResponses
          ? `Contexto del paciente: ${JSON.stringify(patientContext.intakeResponses, null, 2)}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n')

      const res = await fetch('/api/soap-notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript || 'Consulta médica realizada por videollamada.',
          patient_context: {
            name: patientContext?.name,
            ...(patientContext?.intakeResponses || {}),
          },
          appointment_id: appointmentId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status !== 409) {
          toast.error(data.error || 'Error al generar borrador')
          return
        }
      }

      // Fetch the generated note to populate fields
      const noteRes = await fetch(`/api/soap-notes/appointment/${appointmentId}`)
      const noteData = await noteRes.json()
      if (noteData.note) {
        setSoap({
          subjective: noteData.note.soap_subjective || '',
          objective: noteData.note.soap_objective || '',
          assessment: noteData.note.soap_assessment || '',
          plan: noteData.note.soap_plan || '',
        })
        setStatus(noteData.note.status)
        setNoteId(noteData.note.id)
        setTranscriptText(noteData.note.transcript_raw || transcriptText)
      }

      toast.success('Borrador generado. Revísalo y edita según sea necesario.')
    } catch {
      toast.error('Error de red al generar borrador')
    } finally {
      setGenerating(false)
    }
  }

  const saveDraft = async () => {
    setSaving(true)
    try {
      await ensureDraftNote()

      const body: Record<string, unknown> = {
        soap_subjective: soap.subjective,
        soap_objective: soap.objective,
        soap_assessment: soap.assessment,
        soap_plan: soap.plan,
        status: 'pending_review',
      }

      if (transcriptText || chatTranscript) {
        body.transcript_raw = transcriptText || chatTranscript
      }

      const res = await fetch(`/api/soap-notes/appointment/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al guardar')
        return
      }

      setStatus('pending_review')
      toast.success('Nota guardada como borrador')
      onNoteSaved?.()
    } catch {
      toast.error('Error de red al guardar')
    } finally {
      setSaving(false)
    }
  }

  const finalizeNote = async () => {
    setSaving(true)
    try {
      await ensureDraftNote()
      const summary = patientSummary || `${soap.subjective}\n\n${soap.assessment}\n\n${soap.plan}`.trim()
      const res = await fetch(`/api/soap-notes/appointment/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soap_subjective: soap.subjective,
          soap_objective: soap.objective,
          soap_assessment: soap.assessment,
          soap_plan: soap.plan,
          status: 'approved',
          patient_summary: summary,
          sent_to_patient_at: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al finalizar')
        return
      }

      setStatus('approved')
      setPatientSummary(summary)
      toast.success('Nota SOAP finalizada y aprobada')
      onNoteSaved?.()
    } catch {
      toast.error('Error de red al finalizar')
    } finally {
      setSaving(false)
    }
  }

  const statusConfig = {
    draft: { label: 'Borrador', variant: 'secondary' as const, color: 'text-muted-foreground' },
    generating: { label: 'Generando...', variant: 'default' as const, color: 'text-primary' },
    pending_review: { label: 'Pendiente de revisión', variant: 'outline' as const, color: 'text-yellow-600' },
    approved: { label: 'Aprobada', variant: 'default' as const, color: 'text-emerald-600' },
  }

  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

  return (
    <Card className="border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">AutoSOAP</CardTitle>
              <p className="text-xs text-muted-foreground">
                Nota clínica asistida por IA
              </p>
            </div>
          </div>
          <Badge variant={currentStatus.variant} className={`text-[10px] font-medium ${currentStatus.color}`}>
            {currentStatus.label}
          </Badge>
        </div>

        {status === 'approved' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 p-2.5 bg-emerald-50/60 rounded-md border border-emerald-200/50"
          >
            <div className="flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Nota aprobada. El paciente recibirá un resumen al finalizar la consulta.
            </div>
          </motion.div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Action bar */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs transition-transform active:scale-[0.98]"
            onClick={generateDraft}
            disabled={generating}
          >
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {generating ? 'Generando...' : 'Generar borrador'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs transition-transform active:scale-[0.98]"
            onClick={saveDraft}
            disabled={saving}
          >
            <Save className="w-3.5 h-3.5" />
            Guardar borrador
          </Button>

          <Button
            size="sm"
            variant="primary"
            className="gap-1.5 text-xs transition-transform active:scale-[0.98]"
            onClick={finalizeNote}
            disabled={saving || status === 'approved'}
          >
            <Send className="w-3.5 h-3.5" />
            {saving ? 'Guardando...' : 'Finalizar nota'}
          </Button>
        </div>

        <Separator />

        <div className="space-y-3 rounded-[var(--public-radius-control)] border border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--public-surface-soft))] p-3">
          <div className="flex items-start gap-2">
            <input
              id={`recording-consent-${appointmentId}`}
              type="checkbox"
              checked={recordingConsent}
              onChange={(event) => setRecordingConsent(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor={`recording-consent-${appointmentId}`} className="text-xs leading-5 text-muted-foreground">
              Confirmo que el paciente autorizó usar esta grabación/transcripción para preparar la nota clínica.
            </label>
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[var(--public-radius-control)] border border-dashed border-[hsl(var(--public-border)/0.9)] bg-card px-3 py-2 text-xs font-semibold text-[hsl(var(--brand-ocean))] hover:bg-primary/5">
            {transcribing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {transcribing ? 'Transcribiendo...' : 'Subir audio de consulta'}
            <input
              type="file"
              accept="audio/*,video/webm"
              className="sr-only"
              disabled={transcribing || !recordingConsent}
              onChange={(event) => {
                const file = event.target.files?.[0] || null
                void transcribeAudio(file)
                event.target.value = ''
              }}
            />
          </label>
          <Textarea
            value={transcriptText}
            onChange={(event) => setTranscriptText(event.target.value)}
            placeholder="Transcripción revisada por el médico. Puedes pegar dictado, notas de consulta o el resultado de la transcripción."
            className="min-h-[96px] bg-background text-xs"
            disabled={status === 'approved'}
          />
        </div>

        {/* Patient context preview */}
        {patientContext?.intakeResponses && Object.keys(patientContext.intakeResponses).length > 0 && (
          <div className="p-3 bg-secondary/40 rounded-lg border border-border/30">
            <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Contexto del paciente
            </p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {Object.entries(patientContext.intakeResponses).slice(0, 5).map(([key, val]) => (
                <div key={key} className="flex items-start gap-2 text-xs">
                  <span className="text-muted-foreground shrink-0">{key}:</span>
                  <span className="text-foreground font-medium truncate">
                    {Array.isArray(val) ? val.join(', ') : String(val)}
                  </span>
                </div>
              ))}
              {Object.keys(patientContext.intakeResponses).length > 5 && (
                <p className="text-[10px] text-muted-foreground">
                  +{Object.keys(patientContext.intakeResponses).length - 5} campos más
                </p>
              )}
            </div>
          </div>
        )}

        {/* SOAP Sections — accordion style */}
        <div className="space-y-2">
          {SECTIONS.map((section) => {
            const isExpanded = expandedSection === section.key
            return (
              <div
                key={section.key}
                className={`border rounded-lg overflow-hidden transition-colors ${
                  isExpanded ? 'border-border bg-card' : 'border-border/40 bg-secondary/20'
                }`}
              >
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.key)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                      isExpanded ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {section.icon}
                    </div>
                    <span className="text-sm font-medium">{section.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3">
                        <Textarea
                          value={soap[section.key] || ''}
                          onChange={(e) => updateField(section.key, e.target.value)}
                          placeholder={section.placeholder}
                          className="min-h-[100px] text-sm resize-y bg-background"
                          disabled={status === 'approved'}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        <div className="space-y-2 rounded-[var(--public-radius-control)] border border-[hsl(var(--public-border)/0.78)] bg-card p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Resumen para paciente
          </p>
          <Textarea
            value={patientSummary}
            onChange={(event) => setPatientSummary(event.target.value)}
            placeholder="Resumen claro para el paciente. Evita jerga interna, diferenciales no explicados o notas crudas."
            className="min-h-[84px] text-sm"
            disabled={status === 'approved'}
          />
        </div>
      </CardContent>
    </Card>
  )
}
