'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

export default function CheckoutForm({
  appointmentId,
}: {
  appointmentId: string
}) {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?appointmentId=${appointmentId}`,
      },
    })

    if (error) {
      setMessage(error.message || 'Error al procesar el pago')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm text-neutral-700">
          Si tu pago se interrumpe o tu banco lo rechaza, podrás volver a intentarlo sin perder el seguimiento de la cita.
        </p>
      </div>

      {message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-900">No se pudo confirmar el pago.</p>
          <p className="mt-1 text-sm text-red-900">{message}</p>
          <div className="mt-3 text-sm">
            <Link href="/app/appointments" className="font-medium text-red-800 underline underline-offset-2">
              Revisar el estado de mi cita
            </Link>
          </div>
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Procesando...' : 'Pagar ahora'}
      </button>
    </form>
  )
}
