'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CheckoutForm from './CheckoutForm'
import { Button } from '@/components/ui/button'

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Preparando pago...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="glass-nav sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Doctor.mx</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-xl">
          <div className="bg-card rounded-2xl border border-border shadow-dx-1 p-6 space-y-5">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">No pudimos preparar tu pago</h1>
              <p className="text-muted-foreground">
                Tu cita todavía no se ha confirmado. Puedes intentar nuevamente o volver a tus citas para revisar el estado.
              </p>
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={createPaymentIntent}
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Reintentando...' : 'Reintentar pago'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/app/appointments')}
                className="flex-1"
              >
                Volver a mis citas
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Doctor.mx</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-xl">
        <div className="bg-card rounded-2xl border border-border shadow-dx-1 p-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
            Completar Pago
          </h1>

          <div className="mb-6 rounded-xl border border-border bg-secondary/50 p-4">
            <p className="text-sm text-foreground">
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
