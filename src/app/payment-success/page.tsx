'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import type { Appointment, Doctor } from '@/types'
import { ANALYTICS_EVENTS, trackClientEvent } from '@/lib/analytics/posthog'

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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-600">Confirmando pago...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-6">
            <Link href="/" className="text-2xl font-bold text-neutral-900">
              Doctor.mx
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Estamos revisando tu pago
            </h1>

            <p className="text-neutral-600 mb-4">
              Tu pago pudo haberse procesado, pero no logramos confirmar el estado automáticamente.
            </p>

            <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-left text-sm text-yellow-900">
              {error}
            </div>

            <div className="space-y-3">
              <Link
                href="/app/appointments"
                className="block w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 font-medium"
              >
                Revisar mis citas
              </Link>
              <Link
                href="/contact"
                className="block w-full border border-neutral-300 text-neutral-700 py-3 rounded-lg hover:bg-neutral-50 font-medium"
              >
                Contactar soporte
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-2xl font-bold text-neutral-900">
            Doctor.mx
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            ¡Pago Exitoso!
          </h1>

          <p className="text-neutral-600 mb-8">
            Tu consulta ha sido agendada y confirmada
          </p>

          <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left text-sm text-blue-900">
            Siguiente paso: revisa tu cita, guarda la fecha y entra a la videollamada desde <strong>Mis consultas</strong> cuando llegue la hora.
          </div>

          {appointment && (
            <div className="bg-neutral-50 p-6 rounded-lg mb-8 text-left">
              <h3 className="font-semibold text-neutral-900 mb-4">
                Detalles de la consulta
              </h3>
              <div className="space-y-2 text-sm text-neutral-600">
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
            <Link
              href="/app/appointments"
              className="block w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 font-medium"
            >
              Ir a Mis Consultas
            </Link>
            <Link
              href="/doctors"
              className="block w-full border border-neutral-300 text-neutral-700 py-3 rounded-lg hover:bg-neutral-50 font-medium"
            >
              Buscar Otro Doctor
            </Link>
          </div>

          <p className="text-sm text-neutral-500 mt-6 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-primary-500" />
            Recibirás un email de confirmación con los detalles de tu consulta
          </p>
        </div>
      </main>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center"><p>Cargando...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
