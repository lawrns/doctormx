import type Stripe from 'stripe'

type QueryClient = {
  from: (table: string) => {
    select: (columns?: string) => QueryBuilder
    update: (values: Record<string, unknown>) => QueryBuilder
    insert: (values: Record<string, unknown>) => QueryBuilder
  }
}

type QueryBuilder = {
  eq: (column: string, value: unknown) => QueryBuilder
  single: () => Promise<{ data: Record<string, unknown> | null; error: { message?: string; code?: string } | null }>
}

type PaymentIntentLike = Pick<Stripe.PaymentIntent, 'id' | 'amount' | 'amount_received' | 'currency' | 'metadata' | 'status'>

type BindingOptions = {
  supabase: unknown
  paymentIntent: PaymentIntentLike
  appointmentId: string
  patientId?: string
}

function metadataValue(metadata: Stripe.Metadata | undefined, ...keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function normalizeCurrency(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

function expectedAmountFromIntent(paymentIntent: PaymentIntentLike) {
  return paymentIntent.amount_received || paymentIntent.amount
}

function assertEqual(label: string, actual: unknown, expected: unknown) {
  if (String(actual) !== String(expected)) {
    throw new Error(`Payment binding mismatch for ${label}`)
  }
}

export async function validatePaymentIntentBinding({
  supabase,
  paymentIntent,
  appointmentId,
  patientId,
}: BindingOptions) {
  const db = supabase as QueryClient

  if (paymentIntent.status !== 'succeeded') {
    throw new Error('Payment intent has not succeeded')
  }

  const metadataAppointmentId = metadataValue(paymentIntent.metadata, 'appointmentId', 'appointment_id')
  const metadataDoctorId = metadataValue(paymentIntent.metadata, 'doctorId', 'doctor_id')
  const metadataPatientId = metadataValue(paymentIntent.metadata, 'patientId', 'patient_id')
  const metadataAmount = metadataValue(paymentIntent.metadata, 'amountCents', 'amount_cents', 'amount')
  const metadataCurrency = metadataValue(paymentIntent.metadata, 'currency')

  assertEqual('appointment metadata', metadataAppointmentId, appointmentId)

  const { data: appointment, error: appointmentError } = await db
    .from('appointments')
    .select('id, doctor_id, patient_id, status')
    .eq('id', appointmentId)
    .single()

  if (appointmentError || !appointment) {
    throw new Error(`Appointment not found for payment binding: ${appointmentError?.message || 'missing'}`)
  }

  const { data: payment, error: paymentError } = await db
    .from('payments')
    .select('id, appointment_id, provider_ref, stripe_payment_intent_id, amount_cents, currency, status')
    .eq('provider_ref', paymentIntent.id)
    .single()

  if (paymentError || !payment) {
    throw new Error(`Payment record not found for intent: ${paymentError?.message || 'missing'}`)
  }

  assertEqual('payment appointment', payment.appointment_id, appointmentId)
  assertEqual('doctor metadata', metadataDoctorId, appointment.doctor_id)
  assertEqual('patient metadata', metadataPatientId, appointment.patient_id)

  if (patientId) {
    assertEqual('authenticated patient', patientId, appointment.patient_id)
  }

  const expectedAmount = expectedAmountFromIntent(paymentIntent)
  assertEqual('amount', payment.amount_cents, expectedAmount)

  if (metadataAmount) {
    assertEqual('amount metadata', metadataAmount, expectedAmount)
  }

  if (metadataCurrency) {
    assertEqual('currency metadata', normalizeCurrency(metadataCurrency), normalizeCurrency(paymentIntent.currency))
  }

  assertEqual('currency', normalizeCurrency(payment.currency), normalizeCurrency(paymentIntent.currency))

  return { appointment, payment }
}
