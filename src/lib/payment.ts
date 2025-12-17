// Sistema de Transacción de Pago - Se explica solo
// Input: Cita, Método de pago
// Proceso: Crear intención → Procesar pago → Confirmar cita → Registrar transacción
// Output: Pago confirmado + Cita confirmada

import { createClient } from '@/lib/supabase/server'
import { stripe } from './stripe'

export type PaymentRequest = {
  appointmentId: string
  userId: string
}

export type PaymentIntentResult = {
  clientSecret: string
  publishableKey: string
  amount: number
  currency: string
}

// Sistema completo: crear intención de pago
export async function initializePayment(
  request: PaymentRequest
): Promise<PaymentIntentResult> {
  // Paso 1: Obtener información de la cita
  const appointmentData = await getAppointmentPaymentData(request.appointmentId, request.userId)

  // Paso 2: Crear payment intent en Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: appointmentData.amount,
    currency: appointmentData.currency.toLowerCase(),
    metadata: {
      appointmentId: request.appointmentId,
      doctorId: appointmentData.doctorId,
      patientId: request.userId,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  // Paso 3: Registrar el pago en nuestra base de datos
  await recordPaymentAttempt({
    appointmentId: request.appointmentId,
    providerRef: paymentIntent.id,
    amount: appointmentData.amount,
    currency: appointmentData.currency,
  })

  return {
    clientSecret: paymentIntent.client_secret!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    amount: appointmentData.amount,
    currency: appointmentData.currency,
  }
}

// Bloque: Obtener datos necesarios para el pago
async function getAppointmentPaymentData(appointmentId: string, userId: string) {
  const supabase = await createClient()

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      id,
      doctor_id,
      patient_id,
      doctor:doctors (
        price_cents,
        currency
      )
    `)
    .eq('id', appointmentId)
    .eq('patient_id', userId)
    .single()

  if (error || !appointment) {
    throw new Error('Cita no encontrada o no autorizada')
  }

  const doctor = Array.isArray(appointment.doctor) ? appointment.doctor[0] : appointment.doctor

  return {
    amount: doctor.price_cents,
    currency: doctor.currency,
    doctorId: appointment.doctor_id,
  }
}

// Bloque: Registrar intento de pago
async function recordPaymentAttempt(data: {
  appointmentId: string
  providerRef: string
  amount: number
  currency: string
}) {
  const supabase = await createClient()

  await supabase.from('payments').insert({
    appointment_id: data.appointmentId,
    provider: 'stripe',
    provider_ref: data.providerRef,
    amount_cents: data.amount,
    currency: data.currency,
    status: 'pending',
    fee_cents: 0,
    net_cents: data.amount,
  })
}

// Sistema completo: confirmar pago exitoso
export async function confirmSuccessfulPayment(
  paymentIntentId: string,
  appointmentId: string
): Promise<{ success: boolean; appointment?: import('@/types').Appointment }> {
  // Paso 1: Verificar con Stripe que el pago fue exitoso
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (paymentIntent.status !== 'succeeded') {
    return { success: false }
  }

  // Paso 2: Actualizar el registro de pago
  await updatePaymentStatus(paymentIntentId, 'paid')

  // Paso 3: Confirmar la cita
  const appointment = await confirmAppointment(appointmentId)

  return {
    success: true,
    appointment,
  }
}

// Bloque: Actualizar estado del pago
async function updatePaymentStatus(providerRef: string, status: string) {
  const supabase = await createClient()

  await supabase
    .from('payments')
    .update({ status })
    .eq('provider_ref', providerRef)
}

// Bloque: Confirmar cita (cambiar estado)
async function confirmAppointment(appointmentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) throw error

  return data
}
