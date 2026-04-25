'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Clock,
  Calendar,
  User,
} from 'lucide-react'

interface IntakeField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  min?: number
  max?: number
  helpText?: string
}

interface IntakeTemplate {
  id: string
  name: string
  description: string | null
  fields_json: IntakeField[]
}

interface AppointmentInfo {
  id: string
  start_ts: string
  doctor_name: string
  specialty: string
  status: string
}

export default function PatientIntakePage() {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [template, setTemplate] = useState<IntakeTemplate | null>(null)
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null)
  const [responses, setResponses] = useState<Record<string, string | number | boolean | string[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!appointmentId) return

    Promise.all([
      fetch(`/api/intake/responses?appointment_id=${appointmentId}`),
      fetch(`/api/appointments/${appointmentId}`),
    ])
      .then(async ([respRes, aptRes]) => {
        const respData = await respRes.json().catch((e) => { console.error('[IntakeForm] Failed to parse responses:', e); return null })
        const aptData = await aptRes.json().catch((e) => { console.error('[IntakeForm] Failed to parse appointment:', e); return null })

        if (respData?.response) {
          setSubmitted(true)
          setResponses(respData.response.responses_json || {})
        }

        if (aptData?.appointment) {
          setAppointment(aptData.appointment)
        }

        // Fetch default template for this doctor
        if (aptData?.appointment?.doctor_id) {
          const tplRes = await fetch(`/api/intake/templates?doctor_id=${aptData.appointment.doctor_id}&defaults=true`)
          const tplData = await tplRes.json().catch((e) => { console.error('[IntakeForm] Failed to parse template:', e); return null })
          if (tplData?.templates?.[0]) {
            setTemplate(tplData.templates[0])
          }
        }
      })
      .finally(() => setLoading(false))
  }, [appointmentId])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!template) return true

    for (const field of template.fields_json) {
      const value = responses[field.id]
      if (field.required && (!value || (Array.isArray(value) && value.length === 0) || value === '')) {
        newErrors[field.id] = 'Este campo es obligatorio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submit = async () => {
    if (!validate() || !template || !appointmentId) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/intake/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointmentId,
          template_id: template.id,
          responses,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Formulario enviado correctamente')
        setSubmitted(true)
      } else {
        toast.error(data.error || 'Error al enviar')
      }
    } catch {
      toast.error('Error de red')
    } finally {
      setSubmitting(false)
    }
  }

  const updateResponse = (fieldId: string, value: string | number | boolean | string[]) => {
    setResponses((r) => ({ ...r, [fieldId]: value }))
    setErrors((e) => {
      const next = { ...e }
      delete next[fieldId]
      return next
    })
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Cita no encontrada</h1>
        <p className="text-sm text-muted-foreground mb-6">
          No pudimos encontrar la información de esta cita.
        </p>
        <Button onClick={() => router.push('/app')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al panel
        </Button>
      </div>
    )
  }

  const appointmentDate = new Date(appointment.start_ts).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-muted-foreground"
          onClick={() => router.push('/app/appointments')}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Mis citas
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Formulario previo a consulta
          </h1>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            Completa este breve formulario para que tu doctor esté preparado y aproveche al máximo tu consulta.
          </p>
        </div>

        {/* Appointment info card */}
        <Card className="mb-6 border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-primary/[0.02]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                Dr. {appointment.doctor_name}
              </p>
              <p className="text-xs text-muted-foreground">{appointment.specialty}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium text-foreground flex items-center gap-1.5 justify-end">
                <Calendar className="w-3.5 h-3.5" />
                {appointmentDate}
              </p>
            </div>
          </CardContent>
        </Card>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border border-emerald-200/60 bg-emerald-50/30 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Formulario enviado
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Tu doctor ya tiene toda la información. Gracias por completarlo con anticipación.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => router.push('/app/appointments')}
                >
                  Volver a mis citas
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : template ? (
          <Card className="border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
              {template.description && (
                <CardDescription>{template.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatePresence>
                {template.fields_json.map((field, i) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.04,
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="space-y-2"
                  >
                    <Label
                      htmlFor={field.id}
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>

                    {field.helpText && (
                      <p className="text-xs text-muted-foreground">{field.helpText}</p>
                    )}

                    <FieldInput
                      field={field}
                      value={responses[field.id]}
                      onChange={(v) => updateResponse(field.id, v)}
                      error={errors[field.id]}
                    />

                    {errors[field.id] && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors[field.id]}
                      </p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="pt-4 border-t border-border/60 flex justify-end">
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="gap-2 px-6 transition-transform active:scale-[0.98]"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Enviar formulario
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CardContent className="p-8 text-center">
              <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Formulario no disponible
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Tu doctor aún no ha configurado un formulario de ingreso para esta cita.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: IntakeField
  value: unknown
  onChange: (v: string | number | boolean | string[]) => void
  error?: string
}) {
  const baseClass = `w-full transition-colors ${error ? 'border-destructive focus-visible:ring-destructive/20' : ''}`

  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          id={field.id}
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`${baseClass} min-h-[120px] resize-none`}
        />
      )

    case 'number':
      return (
        <Input
          id={field.id}
          type="number"
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={field.placeholder}
          className={baseClass}
        />
      )

    case 'scale':
      const min = field.min ?? 0
      const max = field.max ?? 10
      const numValue = typeof value === 'number' ? value : min
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{min}</span>
            <span className="text-lg font-semibold tabular-nums w-8 text-center">{numValue}</span>
            <span className="text-xs text-muted-foreground">{max}</span>
          </div>
          <input
            id={field.id}
            type="range"
            min={min}
            max={max}
            value={numValue}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      )

    case 'select':
      return (
        <select
          id={field.id}
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseClass} h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
        >
          <option value="">Selecciona una opción</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )

    case 'multiselect':
      const selected = Array.isArray(value) ? value : []
      return (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((opt) => {
            const isSelected = selected.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const next = isSelected
                    ? selected.filter((s) => s !== opt)
                    : [...selected, opt]
                  onChange(next)
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-[0.97] ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )

    case 'yesno':
      return (
        <div className="flex gap-3">
          {[
            { label: 'Sí', val: true },
            { label: 'No', val: false },
          ].map((opt) => {
            const isSelected = value === opt.val
            return (
              <button
                key={String(opt.val)}
                type="button"
                onClick={() => onChange(opt.val)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all active:scale-[0.97] ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )

    case 'date':
      return (
        <Input
          id={field.id}
          type="date"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      )

    default:
      return (
        <Input
          id={field.id}
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseClass}
        />
      )
  }
}
