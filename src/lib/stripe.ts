// Sistema de pagos - Simple y claro
// Lazy initialization to prevent build-time failures when env vars aren't available
import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY no configurada')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    })
  }
  return stripeInstance
}

// Export a proxy that lazily initializes
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

// Helper: Crear payment intent
export async function createPaymentIntent(params: {
  appointmentId: string
  amount: number // en centavos
  currency: string
  metadata?: Record<string, string>
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    metadata: {
      appointmentId: params.appointmentId,
      ...params.metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return paymentIntent
}

// Helper: Confirmar pago exitoso
export async function verifyPayment(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  return paymentIntent.status === 'succeeded'
}

