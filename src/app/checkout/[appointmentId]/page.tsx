'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-neutral-900 hover:text-primary-600 transition-colors">
            Doctor.mx
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Volver al Inicio
          </Link>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver
            </button>
            <h1 className="text-2xl font-bold text-neutral-900">
              Completar Pago
            </h1>
          </div>

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

        <div className="mt-6 text-center">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar y volver al panel
          </Link>
        </div>
      </main>
    </div>
  )
}
