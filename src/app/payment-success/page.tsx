'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { Appointment, Doctor } from '@/types'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<Appointment & { doctor: Doctor } | null>(null)

  const appointmentId = searchParams.get('appointmentId')
  const paymentIntent = searchParams.get('payment_intent')

  useEffect(() => {
    if (appointmentId && paymentIntent) {
      // Confirmar pago en el backend
      fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, paymentIntentId: paymentIntent }),
      })
        .then(res => res.json())
        .then(data => {
          setAppointment(data.appointment)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [appointmentId, paymentIntent])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Confirmando pago...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Doctory
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

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Pago Exitoso!
          </h1>

          <p className="text-gray-600 mb-8">
            Tu consulta ha sido agendada y confirmada
          </p>

          {appointment && (
            <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">
                Detalles de la consulta
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
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
              href="/app"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Ir a Mis Consultas
            </Link>
            <Link
              href="/doctors"
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium"
            >
              Buscar Otro Doctor
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            📧 Recibirás un email de confirmación con los detalles de tu consulta
          </p>
        </div>
      </main>
    </div>
  )
}
