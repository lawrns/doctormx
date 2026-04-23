// Sistema de Transacción de Pago - Se explica solo
// Input: Cita, Método de pago
// Proceso: Crear intención → Procesar pago → Confirmar cita → Registrar transacción
// Output: Pago confirmado + Cita confirmada

import { createClient } from '@/lib/supabase/server'
import { stripe } from './stripe'
import { sendPaymentReceipt } from './notifications'
import { sendPaymentReceipt as sendWhatsAppReceipt, getPatientPhone, getDoctorName } from './whatsapp-notifications'
import { logger } from '@/lib/observability/logger'
import { ensureVideoRoomForAppointment } from '@/lib/video/videoService'
import { validatePaymentIntentBinding } from '@/lib/payment-integrity'
import {
  getSelectedInsuranceEstimate,
  upsertAppointmentInsuranceClaim,
} from '@/lib/insurance'

export type PaymentRequest = {
  appointmentId: string
  userId: string
  patientInsuranceId?: string | null
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
  const appointmentData = await getAppointmentPaymentData(
    request.appointmentId,
    request.userId,
    request.patientInsuranceId
  )

  // Paso 2: Crear payment intent en Stripe with Mexican payment methods
  const paymentIntent = await stripe.paymentIntents.create({
    amount: appointmentData.amount,
    currency: appointmentData.currency.toLowerCase(),
    metadata: {
      appointmentId: request.appointmentId,
      doctorId: appointmentData.doctorId,
      patientId: request.userId,
      amountCents: String(appointmentData.amount),
      amount: String(appointmentData.amount),
      currency: appointmentData.currency,
      patientInsuranceId: request.patientInsuranceId || '',
      insuranceEstimate: appointmentData.insuranceEstimateStatus,
    },
    // Enable Mexican payment methods: Cards, OXXO, and SPEI
    payment_method_types: ['card', 'oxxo', 'customer_balance'],
    // For OXXO: payment confirmation can take up to 3 days
    payment_method_options: {
      oxxo: {
        expires_after_days: 3, // OXXO voucher expires in 3 days
      },
      customer_balance: {
        funding_type: 'bank_transfer', // SPEI bank transfers
        bank_transfer: {
          type: 'mx_bank_transfer', // Specifically Mexican SPEI
        },
      },
    },
  })

  // Paso 3: Registrar el pago en nuestra base de datos
  await recordPaymentAttempt({
    appointmentId: request.appointmentId,
    providerRef: paymentIntent.id,
    amount: appointmentData.amount,
    currency: appointmentData.currency,
  })

  if (request.patientInsuranceId && appointmentData.insuranceAccepted) {
    await upsertAppointmentInsuranceClaim({
      appointmentId: request.appointmentId,
      patientId: request.userId,
      patientInsuranceId: request.patientInsuranceId,
    })
  }

  return {
    clientSecret: paymentIntent.client_secret!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    amount: appointmentData.amount,
    currency: appointmentData.currency,
  }
}

// Bloque: Obtener datos necesarios para el pago
async function getAppointmentPaymentData(
  appointmentId: string,
  userId: string,
  patientInsuranceId?: string | null
) {
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

  if (!patientInsuranceId) {
    return {
      amount: doctor.price_cents,
      currency: doctor.currency,
      doctorId: appointment.doctor_id,
      insuranceAccepted: false,
      insuranceEstimateStatus: 'cash',
    }
  }

  const { estimate } = await getSelectedInsuranceEstimate({
    appointmentId,
    patientId: userId,
    patientInsuranceId,
    supabase,
  })

  return {
    amount: estimate.patientResponsibilityCents,
    currency: doctor.currency,
    doctorId: appointment.doctor_id,
    insuranceAccepted: estimate.acceptedByDoctor,
    insuranceEstimateStatus: estimate.eligibilityStatus,
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

  const { error } = await supabase.from('payments').insert({
    appointment_id: data.appointmentId,
    provider: 'stripe',
    provider_ref: data.providerRef,
    stripe_payment_intent_id: data.providerRef,
    amount_cents: data.amount,
    currency: data.currency,
    status: 'pending',
    fee_cents: 0,
    net_cents: data.amount,
  })

  if (error) {
    throw new Error(`Failed to record payment attempt: ${error.message}`)
  }
}

// Sistema completo: confirmar pago exitoso
export async function confirmSuccessfulPayment(
  paymentIntentId: string,
  appointmentId: string,
  patientId?: string
): Promise<{ success: boolean; appointment?: import('@/types').Appointment }> {
  const supabase = await createClient()

  // Paso 1: Verificar con Stripe que el pago fue exitoso
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (paymentIntent.status !== 'succeeded') {
    return { success: false }
  }

  await validatePaymentIntentBinding({
    supabase,
    paymentIntent,
    appointmentId,
    patientId,
  })

  // Paso 2: Actualizar el registro de pago
  await updatePaymentStatus(paymentIntentId, 'paid')

  // Paso 3: Confirmar la cita
  const appointment = await confirmAppointment(appointmentId)

  // Enviar email de recibo (no bloquea el flujo principal)
  if (appointment?.patient_id) {
    sendReceiptEmail(appointment.patient_id, appointmentId).catch((err: unknown) => {
      logger.error('Failed to send receipt email:', { error: err })
    })

    sendReceiptWhatsApp(appointment.patient_id, appointment).catch((err: unknown) => {
      logger.error('Failed to send WhatsApp receipt:', { error: err })
    })
  }

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
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .select(`
      *,
      doctor:doctors (
        id,
        specialty,
        license_number,
        city,
        state,
        office_address,
        profile:profiles (
          full_name,
          photo_url
        )
      )
    `)
    .single()

  if (error) throw error

  ensureVideoRoomForAppointment(supabase, appointmentId).catch((err: unknown) => {
    logger.error('Failed to create video room after payment confirmation:', { error: err, appointmentId })
  })

  return data
}

/**
 * Handle payment failure - release slot and optionally refund
 * Input: appointmentId, reason
 * Process: Cancel appointment → Release slot → Optionally refund
 * Output: Cancelled appointment
 */
export async function handlePaymentFailure(
  appointmentId: string,
  reason: string = 'Payment failed'
) {
  const supabase = await createClient()

  try {
    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found')
    }

    // Cancel appointment
    const { error: cancelError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date(),
      })
      .eq('id', appointmentId)

    if (cancelError) {
      throw new Error(`Failed to cancel appointment: ${cancelError.message}`)
    }

    // Release any active appointment holds
    await supabase
      .from('appointment_holds')
      .update({ status: 'released', updated_at: new Date().toISOString() })
      .eq('appointment_id', appointmentId)

    // Update payment status to failed
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single()

    if (payment) {
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)
    }

    return {
      success: true,
      appointment,
    }
  } catch (error) {
    logger.error('Error handling payment failure:', { error })
    throw error
  }
}

/**
 * Process refund for appointment
 * Input: appointmentId, reason
 * Process: Create refund → Update payment status
 * Output: Refund record
 */
export async function processRefund(
  appointmentId: string,
  reason: string = 'Patient requested'
) {
  const supabase = await createClient()

  try {
    // Get payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('appointment_id', appointmentId)
      .eq('status', 'paid')
      .single()

    if (paymentError || !payment) {
      throw new Error('No paid payment found for appointment')
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.provider_ref,
      reason: 'requested_by_customer',
      metadata: {
        appointmentId,
        reason,
      },
    })

    // Store refund record
    const { data: refundRecord, error: refundError } = await supabase
      .from('refunds')
      .insert({
        payment_id: payment.id,
        amount_cents: payment.amount_cents,
        status: 'processing',
        provider_ref: refund.id,
        reason,
      })
      .select()
      .single()

    if (refundError) {
      throw new Error(`Failed to store refund: ${refundError.message}`)
    }

    // Update payment status
    await supabase
      .from('payments')
      .update({ status: 'refunded' })
      .eq('id', payment.id)

    return {
      success: true,
      refund: refundRecord,
    }
  } catch (error) {
    logger.warn('Refund processing failed', { error })
    throw error
  }
}

async function sendReceiptEmail(patientId: string, appointmentId: string) {
  const supabase = await createClient()

  const profileQuery = supabase.from('profiles')
  if (!profileQuery || typeof profileQuery.select !== 'function') {
    return
  }

  const { data: profile } = await profileQuery
    .select('email, full_name')
    .eq('id', patientId)
    .single()

  if (!profile?.email) {
    logger.warn('No email found for patient:', { patientId })
    return
  }

  await sendPaymentReceipt(
    appointmentId,
    profile.email,
    profile.full_name || 'Paciente'
  )
}

async function sendReceiptWhatsApp(patientId: string, appointment: { id: string; doctor_id: string; start_ts: string; price_cents: number; currency: string }) {
  const supabase = await createClient()

  const phone = await getPatientPhone(patientId)
  if (!phone) {
    return
  }

  const profileQuery = supabase.from('profiles')
  if (!profileQuery || typeof profileQuery.select !== 'function') {
    return
  }

  const { data: profile } = await profileQuery
    .select('full_name')
    .eq('id', patientId)
    .single()

  const doctorName = await getDoctorName(appointment.doctor_id)
  if (!doctorName) {
    return
  }

  const startTs = new Date(appointment.start_ts)
  const dateStr = startTs.toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = startTs.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  await sendWhatsAppReceipt(
    phone,
    profile?.full_name || 'Paciente',
    doctorName,
    dateStr,
    timeStr,
    appointment.price_cents || 0,
    appointment.currency || 'MXN',
    `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/consultation/${appointment.id}`
  )
}
