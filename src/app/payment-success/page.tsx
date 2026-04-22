'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarCheck, Mail, ReceiptText, Video } from 'lucide-react'
import type { Appointment, Doctor } from '@/types'
import { ANALYTICS_EVENTS, trackClientEvent } from '@/lib/analytics/posthog'
import { Button } from '@/components/ui/button'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<Appointment & { doctor: Doctor } | null>(null)
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
        setError(err instanceof Error ? err.message : 'No pudimos confirmar el pago automáticamente.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [appointmentId, paymentIntent])

  useEffect(() => {
    if (!appointment || hasTrackedBookingPaid.current) {
      return
    }

    hasTrackedBookingPaid.current = true
    void trackClientEvent(ANALYTICS_EVENTS.BOOKING_PAID, {
      appointmentId: appointment.id,
      doctorId: appointment.doctor_id,
      paymentIntent,
    })
  }, [appointment, paymentIntent])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Confirmando pago...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="glass-nav sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/"
              className="inline-flex rounded-lg transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Doctor.mx - Inicio"
            >
              <DoctorMxLogo />
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
          <div className="bg-card rounded-2xl border border-border shadow-dx-1 p-8 text-center">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <svg className="w-8 h-8 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-4">
              Estamos revisando tu pago
            </h1>

            <p className="text-muted-foreground mb-4">
              Tu pago pudo haberse procesado, pero no logramos confirmar el estado automáticamente.
            </p>

            <div className="mb-8 rounded-xl border border-border bg-secondary/50 p-4 text-left text-sm text-foreground">
              {error}
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/app/appointments">
                  Revisar mis citas
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/contact">
                  Contactar soporte
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-nav sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex rounded-lg transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Doctor.mx - Inicio"
          >
            <DoctorMxLogo />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
        <div className="bg-card rounded-2xl border border-border shadow-dx-1 p-8 text-center">
          <div className="w-16 h-16 bg-vital-soft rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-vital" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-4">
            Pago confirmado
          </h1>

          <p className="text-muted-foreground mb-8">
            Tu consulta ha sido agendada y confirmada
          </p>

          <div className="mb-8 grid gap-3 rounded-xl border border-border bg-secondary/50 p-4 text-left text-sm text-foreground">
            <p className="flex items-start gap-2">
              <CalendarCheck className="mt-0.5 h-4 w-4 text-vital" />
              Guarda la fecha y revisa tu cita desde Mis consultas.
            </p>
            <p className="flex items-start gap-2">
              <Video className="mt-0.5 h-4 w-4 text-primary" />
              Si es videollamada, el enlace aparecerá cerca de la hora de inicio.
            </p>
            <p className="flex items-start gap-2">
              <ReceiptText className="mt-0.5 h-4 w-4 text-primary" />
              Para cambios, cancelaciones o reembolsos, usa soporte con el ID de cita.
            </p>
          </div>

          {appointment && (
            <div className="bg-secondary/50 p-6 rounded-xl mb-8 text-left border border-border">
              <h3 className="font-semibold text-foreground mb-4">
                Detalles de la consulta
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Fecha:</strong>{' '}
                  {new Date(appointment.start_ts).toLocaleDateString('es-MX')}
                </p>
                <p>
                  <strong>Hora:</strong>{' '}
                  {new Date(appointment.start_ts).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p>
                  <strong>ID de cita:</strong> {appointment.id}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/app/appointments">
                Ir a Mis Consultas
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/doctors">
                Buscar Otro Doctor
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Recibirás un email de confirmación con los detalles de tu consulta
          </p>
        </div>
      </main>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p>Cargando...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
