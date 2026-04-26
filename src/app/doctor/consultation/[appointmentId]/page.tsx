'use client'

import { use, useEffect, useRef, useState } from 'react'
import type { DailyCall } from '@daily-co/daily-js'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PhoneOff, Video, FileText, Pill } from 'lucide-react'
import AutoSoapPanel from '@/components/AutoSoapPanel'

interface DoctorConsultationPageProps {
  params: Promise<{ appointmentId: string }>
}

type AppointmentState = {
  id: string
  patient_id: string
  start_ts: string
  end_ts: string
  status: string
  appointment_type?: 'video' | 'in_person'
  video_status?: string | null
  consultation_notes?: string | null
  patient?: { full_name: string | null; photo_url: string | null; email?: string | null }[]
}

type VideoRoomData = {
  roomUrl: string
  token: string
}

export default function DoctorConsultationPage({ params }: DoctorConsultationPageProps) {
  const { appointmentId } = use(params)
  const [supabase] = useState(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  })
  const [appointment, setAppointment] = useState<AppointmentState | null>(null)
  const [roomData, setRoomData] = useState<VideoRoomData | null>(null)
  const [soapNote, setSoapNote] = useState<Record<string, unknown> | null>(null)
  const [patientIntake, setPatientIntake] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [ending, setEnding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dailyRef = useRef<DailyCall | null>(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    async function loadAppointment() {
      const { data, error: loadError } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          start_ts,
          end_ts,
          status,
          appointment_type,
          video_status,
          consultation_notes,
          patient:profiles!appointments_patient_id_fkey(full_name, photo_url, email)
        `)
        .eq('id', appointmentId)
        .single()

      if (loadError || !data) {
        setError('No pudimos cargar esta consulta.')
      } else {
        setAppointment(data as unknown as AppointmentState)
      }
      setLoading(false)
    }

    loadAppointment()
  }, [appointmentId, supabase])

  // Fetch existing SOAP note and patient intake data
  useEffect(() => {
    if (!appointmentId) return

    async function loadSoapAndIntake() {
      // Fetch existing SOAP note
      try {
        const soapRes = await fetch(`/api/soap-notes/appointment/${appointmentId}`)
        if (soapRes.ok) {
          const soapData = await soapRes.json()
          if (soapData.note) setSoapNote(soapData.note)
        }
      } catch {
        // Silently fail — SOAP note is optional
      }

      // Fetch patient intake responses for this appointment
      try {
        const intakeRes = await fetch(`/api/intake/responses?appointment_id=${appointmentId}`)
        if (intakeRes.ok) {
          const intakeData = await intakeRes.json()
          if (intakeData.response?.responses_json) {
            setPatientIntake(intakeData.response.responses_json as Record<string, unknown>)
          }
        }
      } catch {
        // Silently fail — intake form is optional
      }
    }

    loadSoapAndIntake()
  }, [appointmentId])

  useEffect(() => {
    return () => {
      const callFrame = dailyRef.current
      dailyRef.current = null
      if (callFrame && !callFrame.isDestroyed()) {
        void callFrame.destroy()
      }
    }
  }, [])

  async function joinVideo() {
    if (dailyRef.current || isCompleted) return

    setJoining(true)
    setError(null)
    let callFrame: DailyCall | null = null

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/video`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'No pudimos abrir la sala de video.')
      }

      const { default: DailyIframe } = await import('@daily-co/daily-js')
      const frameElement = document.getElementById('doctor-daily-frame')
      if (!frameElement) {
        throw new Error('No pudimos preparar el contenedor de video.')
      }

      callFrame = DailyIframe.createFrame(frameElement, {
        showLeaveButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
        },
      })

      callFrame.on('left-meeting', () => {
        dailyRef.current = null
        setRoomData(null)
      })

      await callFrame.join({
        url: data.roomUrl,
        token: data.token,
      })

      dailyRef.current = callFrame
      setRoomData(data)
    } catch (err) {
      if (callFrame && !callFrame.isDestroyed()) {
        await callFrame.destroy()
      }
      setError(err instanceof Error ? err.message : 'Error al conectar con Daily.')
    } finally {
      setJoining(false)
    }
  }

  async function completeConsultation() {
    setEnding(true)
    setError(null)

    try {
      if (dailyRef.current) {
        await dailyRef.current.leave()
        dailyRef.current = null
      }

      const response = await fetch(`/api/appointments/${appointmentId}/video`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'No pudimos cerrar la consulta.')
      }

      setAppointment((current) => current ? { ...current, status: 'completed', video_status: 'completed' } : current)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al finalizar la consulta.')
    } finally {
      setEnding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="font-medium text-foreground">{error || 'Consulta no encontrada.'}</p>
            <Button asChild className="mt-4">
              <Link href="/doctor/appointments">Volver a consultas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const patient = Array.isArray(appointment.patient) ? appointment.patient[0] : appointment.patient
  const isVideo = appointment.appointment_type === 'video'
  const isCompleted = appointment.status === 'completed' || appointment.video_status === 'completed'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <Link href="/doctor/appointments" className="text-sm font-medium text-primary">
              Volver a consultas
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground">Consulta con {patient?.full_name || 'Paciente'}</h1>
          </div>
          <Badge variant={isCompleted ? 'secondary' : 'default'}>
            {isCompleted ? 'Completada' : isVideo ? 'Videoconsulta' : 'Presencial'}
          </Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <Card>
            <CardContent className="p-0">
              {isVideo ? (
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-black">
                  <div id="doctor-daily-frame" className="h-full w-full" />
                  {!roomData && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black text-white">
                      <Video className="h-12 w-12" />
                      <Button onClick={joinVideo} disabled={joining}>
                        {joining ? 'Conectando...' : 'Unirse a la llamada'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-t-lg bg-secondary">
                  <div className="text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="font-medium text-foreground">Consulta presencial</p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3 border-t p-4">
                <Button onClick={completeConsultation} disabled={ending || isCompleted} variant="destructive">
                  <PhoneOff className="mr-2 h-4 w-4" />
                  {ending ? 'Finalizando...' : 'Finalizar consulta'}
                </Button>
                <Button asChild variant="secondary">
                  <Link href={`/doctor/prescription/${appointment.id}`}>
                    <Pill className="mr-2 h-4 w-4" />
                    Receta
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <AutoSoapPanel
            appointmentId={appointmentId}
            initialNote={soapNote as any}
            patientContext={{
              name: (patient as any)?.full_name,
              intakeResponses: patientIntake || undefined,
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle>Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{patient?.full_name || 'Paciente'}</p>
              <p className="text-muted-foreground">{patient?.email || 'Sin email registrado'}</p>
              <p className="text-muted-foreground">
                {new Date(appointment.start_ts).toLocaleString('es-MX', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}
