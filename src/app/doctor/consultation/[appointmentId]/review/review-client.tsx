'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Send,
  Clock,
  Calendar,
  User,
  AlertTriangle,
} from 'lucide-react'

interface SoapNote {
  id: string
  status: string
  soap_subjective: string | null
  soap_objective: string | null
  soap_assessment: string | null
  soap_plan: string | null
  patient_summary: string | null
  ai_model: string | null
  ai_generated_at: string | null
  approved_at: string | null
  created_at: string
}

interface AppointmentData {
  id: string
  patient_name: string
  start_ts: string
  status: string
  appointment_type: string
}

interface ConsultationReviewClientProps {
  appointment: AppointmentData
  appointmentId: string
  soapNote: SoapNote | null
}

export default function ConsultationReviewClient({ appointment, appointmentId, soapNote: initialSoapNote }: ConsultationReviewClientProps) {
  const [soapNote, setSoapNote] = useState<SoapNote | null>(initialSoapNote)
  const [sending, setSending] = useState(false)

  const sendToPatient = async () => {
    if (!soapNote) return
    setSending(true)
    try {
      const res = await fetch(`/api/soap-notes/appointment/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          sent_to_patient_at: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al enviar')
        return
      }

      setSoapNote((prev) => prev ? { ...prev, status: 'approved', approved_at: new Date().toISOString() } : prev)
      toast.success('Resumen enviado al paciente')
    } catch {
      toast.error('Error de red')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
              <Link href="/doctor/appointments">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
                Revisión de consulta
              </h1>
              <p className="text-xs text-muted-foreground">
                {appointment.patient_name} —{' '}
                {new Date(appointment.start_ts).toLocaleString('es-MX', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Appointment metadata */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CardContent className="p-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{appointment.patient_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {new Date(appointment.start_ts).toLocaleDateString('es-MX')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {new Date(appointment.start_ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {appointment.appointment_type === 'video' ? 'Videoconsulta' : 'Presencial'}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* SOAP Note */}
        {soapNote ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">Nota SOAP</CardTitle>
                      {soapNote.ai_generated_at && (
                        <p className="text-[11px] text-muted-foreground">
                          Generada por IA {soapNote.ai_model ? `(${soapNote.ai_model})` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={soapNote.status === 'approved' ? 'default' : 'outline'}
                    className="text-[10px]"
                  >
                    {soapNote.status === 'approved' ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Aprobada
                      </span>
                    ) : (
                      'Pendiente'
                    )}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {soapNote.soap_subjective && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Subjetivo
                    </h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {soapNote.soap_subjective}
                    </p>
                  </div>
                )}

                {soapNote.soap_objective && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Objetivo
                      </h4>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {soapNote.soap_objective}
                      </p>
                    </div>
                  </>
                )}

                {soapNote.soap_assessment && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Análisis
                      </h4>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {soapNote.soap_assessment}
                      </p>
                    </div>
                  </>
                )}

                {soapNote.soap_plan && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Plan
                      </h4>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {soapNote.soap_plan}
                      </p>
                    </div>
                  </>
                )}

                {soapNote.status !== 'approved' && (
                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/doctor/consultation/${appointmentId}`}>
                        Editar nota
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      className="gap-1.5 transition-transform active:scale-[0.98]"
                      onClick={sendToPatient}
                      disabled={sending}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {sending ? 'Enviando...' : 'Enviar al paciente'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Card className="border border-dashed border-border/60">
              <CardContent className="p-6 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Sin nota SOAP
                </h3>
                <p className="text-xs text-muted-foreground/70 mb-4">
                  No se generó una nota clínica para esta consulta.
                </p>
                <Button size="sm" asChild>
                  <Link href={`/doctor/consultation/${appointmentId}`}>
                    Ir a la consulta
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
