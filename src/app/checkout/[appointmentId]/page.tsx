'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CheckoutForm from './CheckoutForm'

export default function CheckoutPage({
  params,
}: {
  params: { appointmentId: string }
}) {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState('')
  const [stripePromise, setStripePromise] = useState<Promise<import('@stripe/stripe-js').Stripe | null> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Crear payment intent
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: params.appointmentId }),
    })
      .then(res => res.json())
      .then(data => {
        setClientSecret(data.clientSecret)
        setStripePromise(loadStripe(data.publishableKey))
        setLoading(false)
      })
      .catch(() => {
        alert('Error al procesar el pago')
        router.push('/app')
      })
  }, [params.appointmentId, router])

  if (loading || !clientSecret) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-600">Preparando pago...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-neutral-900">Doctor.mx</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-6">
            Completar Pago
          </h1>

          {stripePromise && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: { theme: 'stripe' },
              }}
            >
              <CheckoutForm appointmentId={params.appointmentId} />
            </Elements>
          )}
        </div>
      </main>
    </div>
  )
}
