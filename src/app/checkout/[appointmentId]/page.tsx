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
  const [error, setError] = useState('')

  const createPaymentIntent = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: params.appointmentId }),
      })

      const data = await response.json()

      if (!response.ok || !data?.clientSecret) {
        throw new Error(data?.error || 'No fue posible iniciar el pago en este momento.')
      }

      setClientSecret(data.clientSecret)
      setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar el pago en este momento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    createPaymentIntent()
  }, [params.appointmentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-600">Preparando pago...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-neutral-900">Doctor.mx</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-xl">
          <div className="bg-white rounded-lg shadow p-6 space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">No pudimos preparar tu pago</h1>
              <p className="text-neutral-600">
                Tu cita todavía no se ha confirmado. Puedes intentar nuevamente o volver a tus citas para revisar el estado.
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-900">{error}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={createPaymentIntent}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary-500 px-4 py-3 font-medium text-white hover:bg-primary-600"
                disabled={loading}
              >
                {loading ? 'Reintentando...' : 'Reintentar pago'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/app/appointments')}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-neutral-300 px-4 py-3 font-medium text-neutral-900 hover:bg-neutral-100"
              >
                Volver a mis citas
              </button>
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
          <h1 className="text-2xl font-bold text-neutral-900">Doctor.mx</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-6">
            Completar Pago
          </h1>

          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              Tu cita quedará confirmada en cuanto se procese el pago. Si interrumpes este paso, podrás retomarlo después desde <strong>Mis citas</strong>.
            </p>
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
      </main>
    </div>
  )
}
