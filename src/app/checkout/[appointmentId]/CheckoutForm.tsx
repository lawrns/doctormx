'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
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

      {message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-900">{message}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="flex-1 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Procesando...' : 'Pagar ahora'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="px-6 py-3 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancelar
        </button>
      </div>

      <div className="text-center">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Volver al panel de usuario
        </Link>
      </div>
    </form>
  )
}
