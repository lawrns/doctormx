'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { AlertTriangle, CalendarCheck, CheckCircle2, Mail, MapPin, ReceiptText, ShieldCheck, Video } from 'lucide-react'
import type { Appointment } from '@/types'
import { ANALYTICS_EVENTS, trackClientEvent } from '@/lib/analytics/posthog'
import { captureError } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'
import { PostConsultationReferral } from '@/components/referrals/PostConsultationReferral'

type DoctorSummary = {
  id: string
  specialty: string | null
  license_number: string | null
  city: string | null
  state: string | null
  office_address: string | null
  profile?: {
    full_name: string | null
    photo_url: string | null
  } | {
    full_name: string | null
    photo_url: string | null
  }[] | null
}

type ConfirmedAppointment = Appointment & {
  doctor?: DoctorSummary | DoctorSummary[] | null
}

function normalizeDoctor(doctor?: DoctorSummary | DoctorSummary[] | null) {
  const value = Array.isArray(doctor) ? doctor[0] : doctor
  const profile = Array.isArray(value?.profile) ? value?.profile[0] : value?.profile

  return {
    doctor: value || null,
    profile: profile || null,
  }
}

function formatDate(dateIso?: string) {
  if (!dateIso) return 'Fecha por confirmar'
  return new Date(dateIso).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(dateIso?: string) {
  if (!dateIso) return '--:--'
  return new Date(dateIso).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<ConfirmedAppointment | null>(null)
  const [error, setError] = useState('')
  const hasTrackedBookingPaid = useRef(false)

  const appointmentId = searchParams.get('appointmentId')
  const paymentIntent = searchParams.get('payment_intent')

  useEffect(() => {
    if (!appointmentId || !paymentIntent) {
      setError('No encontramos la referencia completa del pago. Revisa el estado de tu cita desde tu panel.')
      setLoading(false)
      return
    }

    fetch('/api/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, paymentIntentId: paymentIntent }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'No pudimos confirmar tu pago todavía.')
        }
        setAppointment(data.appointment)
      })
      .catch((err) => {
        captureError(err, 'PaymentSuccess.confirmPayment')
        setError(err instanceof Error ? err.message : 'No pudimos confirmar el pago automáticamente.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [appointmentId, paymentIntent])

  useEffect(() => {
    if (!appointment || hasTrackedBookingPaid.current) return

    hasTrackedBookingPaid.current = true
    void trackClientEvent(ANALYTICS_EVENTS.BOOKING_PAID, {
      appointmentId: appointment.id,
      doctorId: appointment.doctor_id,
      paymentIntent,
    })
  }, [appointment, paymentIntent])

  const { doctor, profile } = normalizeDoctor(appointment?.doctor)
  const doctorName = profile?.full_name || 'Médico verificado'
  const doctorPhotoUrl = profile?.photo_url || null
  const modality = appointment?.appointment_type === 'in_person' ? 'Presencial' : 'Videoconsulta'
  const location = [doctor?.office_address, doctor?.city, doctor?.state].filter(Boolean).join(', ')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,hsl(var(--public-bg))_0%,hsl(var(--card))_100%)]">
        <p className="text-sm font-medium text-[hsl(var(--public-muted))]">Confirmando pago y cita...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--public-bg))_0%,hsl(var(--card))_100%)]">
        <Header />
        <main className="editorial-shell py-8">
          <div className="mx-auto max-w-2xl border border-destructive/20 bg-card p-8 shadow-[var(--public-shadow-soft)]">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                  Estamos revisando tu pago
                </h1>
                <p className="mt-2 text-sm leading-6 text-[hsl(var(--public-muted))]">
                  Tu pago pudo haberse procesado, pero no logramos confirmar el estado automáticamente.
                </p>
              </div>
            </div>

            <div className="mt-6 border border-border bg-secondary/50 p-4 text-sm text-foreground">
              {error}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button asChild>
                <Link href="/app/appointments">Revisar mis citas</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contactar soporte</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--public-bg))_0%,hsl(var(--card))_100%)]">
      <Header />

      <main className="editorial-shell py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="border border-[hsl(var(--public-border)/0.78)] bg-card p-6 shadow-[var(--public-shadow-soft)] sm:p-8">
            <Badge variant="success">Pago confirmado</Badge>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[hsl(var(--public-ink))] sm:text-4xl">
              Tu consulta quedó confirmada.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--public-muted))]">
              Guardamos la cita, registramos el pago y activamos las instrucciones del siguiente paso. Tu panel de paciente es la fuente principal para estado, acceso e instrucciones.
            </p>

            <div className="mt-7 grid gap-5 border border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--public-surface-soft))] p-5 md:grid-cols-[80px_1fr]">
              <div className="relative h-20 w-20 overflow-hidden bg-[hsl(var(--surface-tint))]">
                {doctorPhotoUrl ? (
                  <Image src={doctorPhotoUrl} alt={doctorName} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[hsl(var(--brand-ocean))]">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-display text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                      {doctorName}
                    </p>
                    <p className="mt-1 text-sm text-[hsl(var(--public-muted))]">
                      {doctor?.specialty || 'Especialidad médica'}
                      {doctor?.license_number ? ` · Cédula ${doctor.license_number}` : ''}
                    </p>
                  </div>
                  <Badge variant="outline">{modality}</Badge>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <InfoLine icon={<CalendarCheck className="h-4 w-4" />} label="Fecha" value={formatDate(appointment?.start_ts)} />
                  <InfoLine icon={<ReceiptText className="h-4 w-4" />} label="Hora" value={formatTime(appointment?.start_ts)} />
                  <InfoLine
                    icon={appointment?.appointment_type === 'in_person' ? <MapPin className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    label="Acceso"
                    value={appointment?.appointment_type === 'in_person' ? location || 'Dirección por confirmar' : 'Enlace visible antes de la cita'}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <TimelineStep title="Ahora" body="La cita aparece en Mis consultas con estado confirmado." />
              <TimelineStep title="Antes de la consulta" body="Recibirás recordatorios y preparación previa si aplica." />
              <TimelineStep title="Durante la consulta" body="El médico revisa tu caso; Dr. Simeon no sustituye criterio clínico." />
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                    Recibo en proceso
                  </p>
                  <p className="text-sm text-[hsl(var(--public-muted))]">
                    Se enviará por correo si está disponible.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-[hsl(var(--public-border)/0.78)] pt-4 text-sm text-[hsl(var(--public-muted))]">
                <p>ID de cita: <span className="font-medium text-[hsl(var(--public-ink))]">{appointment?.id}</span></p>
                <p>Estado: <span className="font-medium text-[hsl(var(--public-ink))]">Confirmada</span></p>
                <p>Soporte: usa este ID si necesitas cambiar o revisar la cita.</p>
              </div>

              <div className="mt-5 grid gap-3">
                <Button asChild size="lg">
                  <Link href={appointment?.id ? `/app/appointments/${appointment.id}` : '/app/appointments'}>Ver detalle de cita</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/doctors">Buscar otro doctor</Link>
                </Button>
              </div>
            </div>

            <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
              <p className="flex items-start gap-2 text-sm leading-6 text-[hsl(var(--public-muted))]">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--brand-ocean))]" />
                Si no recibes correo, revisa Mis consultas. La confirmación visible en tu panel es la fuente principal.
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-8">
          <PostConsultationReferral />
        </section>
      </main>
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--public-border)/0.72)] bg-[hsl(var(--card)/0.9)] backdrop-blur-xl">
      <div className="editorial-shell py-5">
        <Link
          href="/"
          className="inline-flex rounded-[var(--public-radius-control)] transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Doctor.mx - Inicio"
        >
          <DoctorMxLogo />
        </Link>
      </div>
    </header>
  )
}

function InfoLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-3">
      <div className="text-[hsl(var(--brand-ocean))]">{icon}</div>
      <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--public-muted))]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[hsl(var(--public-ink))]">{value}</p>
    </div>
  )
}

function TimelineStep({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-4">
      <p className="font-semibold text-[hsl(var(--public-ink))]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">{body}</p>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><p>Cargando...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
