/**
 * Sistema de Transacción de Pago - Se explica solo
 * Input: Cita, Método de pago
 * Proceso: Crear intención → Procesar pago → Confirmar cita → Registrar transacción
 * Output: Pago confirmado + Cita confirmada
 * 
 * @module lib/payment
 * @example
 * ```typescript
 * import { initializePayment, confirmSuccessfulPayment } from '@/lib/payment';
 * 
 * // Initialize payment
 * const paymentIntent = await initializePayment({
 *   appointmentId: 'apt-123',
 *   userId: 'user-456'
 * });
 * 
 * // Confirm after successful Stripe payment
 * const result = await confirmSuccessfulPayment(paymentIntentId, appointmentId);
 * ```
 */

import { createClient } from '@/lib/supabase/server'
import { stripe } from './stripe'
import { sendPaymentReceipt } from './notifications'
import { sendPaymentReceipt as sendWhatsAppReceipt, getPatientPhone, getDoctorName } from './whatsapp-notifications'
import { logger } from '@/lib/observability/logger'

/**
 * Request parameters for initializing a payment
 */
export type PaymentRequest = {
  /** Appointment ID to create payment for */
  appointmentId: string
  /** User ID of the patient making the payment */
  userId: string
}

/**
 * Result of payment initialization
 */
export type PaymentIntentResult = {
  /** Stripe client secret for completing the payment */
  clientSecret: string
  /** Stripe publishable key for the frontend */
  publishableKey: string
  /** Payment amount in cents */
  amount: number
  /** Currency code (e.g., 'MXN') */
  currency: string
}

/**
 * Initializes a payment for an appointment
 * Creates a Stripe payment intent with Mexican payment methods support
 * @param request - Payment request parameters
 * @param request.appointmentId - Appointment ID to create payment for
 * @param request.userId - User ID of the patient
 * @returns Promise with payment intent result including client secret
 * @throws {Error} If appointment not found, not authorized, or Stripe error
 * @example
 * const payment = await initializePayment({
 *   appointmentId: 'apt-123',
 *   userId: 'user-456'
 * });
 * 
 * // Pass to Stripe Elements
 * const elements = stripe.elements({ clientSecret: payment.clientSecret });
 */
export async function initializePayment(
  request: PaymentRequest
): Promise<PaymentIntentResult> {
  // Paso 1: Obtener información de la cita
  const appointmentData = await getAppointmentPaymentData(request.appointmentId, request.userId)

  // Paso 2: Crear payment intent en Stripe with Mexican payment methods
  const paymentIntent = await stripe.paymentIntents.create({
    amount: appointmentData.amount,
    currency: appointmentData.currency.toLowerCase(),
    metadata: {
      appointment_id: request.appointmentId,
      doctor_id: appointmentData.doctorId,
      patient_id: request.userId,
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

  const clientSecret = paymentIntent.client_secret;
  if (!clientSecret) {
    throw new Error('Payment intent missing client secret');
  }

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error('Missing STRIPE_PUBLISHABLE_KEY environment variable');
  }

  return {
    clientSecret,
    publishableKey,
    amount: appointmentData.amount,
    currency: appointmentData.currency,
  }
}

/**
 * Retrieves appointment data needed for payment processing
 * @param appointmentId - Appointment ID to fetch
 * @param userId - User ID for authorization check
 * @returns Promise with payment data including amount, currency, and doctor ID
 * @throws {Error} If appointment not found or user not authorized
 * @example
 * const data = await getAppointmentPaymentData('apt-123', 'user-456');
 * console.log(data.amount, data.currency);
 */
async function getAppointmentPaymentData(appointmentId: string, userId: string) {
  const supabase = await createClient()

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      id,
      doctor_id,
      patient_id,
      doctor.doctores (
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

  const apt = appointment as unknown as {
    doctor_id: string
    doctor?: {
      price_cents: number
      currency: string
    } | {
      price_cents: number
      currency: string
    }[] | undefined
  }
  const doctor = Array.isArray(apt.doctor) ? apt.doctor[0] : apt.doctor

  if (!doctor?.price_cents || !doctor?.currency) {
    throw new Error('Doctor price or currency not configured')
  }

  return {
    amount: doctor.price_cents,
    currency: doctor.currency,
    doctorId: apt.doctor_id,
  }
}

/**
 * Records a payment attempt in the database
 * @param data - Payment attempt data
 * @param data.appointmentId - Associated appointment ID
 * @param data.providerRef - Stripe payment intent ID
 * @param data.amount - Payment amount in cents
 * @param data.currency - Currency code
 * @returns Promise that resolves when record is created
 * @example
 * await recordPaymentAttempt({
 *   appointmentId: 'apt-123',
 *   providerRef: 'pi_xxx',
 *   amount: 50000,
 *   currency: 'MXN'
 * });
 */
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
    stripe_payment_intent_id: data.providerRef,
    amount_cents: data.amount,
    currency: data.currency,
    status: 'pending',
    fee_cents: 0,
    net_cents: data.amount,
  })
}

/**
 * Confirms a successful payment and updates appointment status
 * Verifies payment with Stripe, updates records, and sends receipts
 * @param paymentIntentId - Stripe payment intent ID
 * @param appointmentId - Appointment ID to confirm
 * @returns Promise with success status and updated appointment
 * @throws {Error} If payment verification fails or database error occurs
 * @example
 * const result = await confirmSuccessfulPayment('pi_xxx', 'apt-123');
 * if (result.success) {
 *   console.log('Payment confirmed, appointment:', result.appointment);
 * }
 */
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

/**
 * Updates the payment status in the database
 * @param providerRef - Stripe payment intent ID
 * @param status - New payment status
 * @returns Promise that resolves when status is updated
 * @example
 * await updatePaymentStatus('pi_xxx', 'paid');
 */
async function updatePaymentStatus(providerRef: string, status: string) {
  const supabase = await createClient()

  await supabase
    .from('payments')
    .update({ status })
    .eq('provider_ref', providerRef)
}

/**
 * Confirms an appointment by updating its status
 * @param appointmentId - Appointment ID to confirm
 * @returns Promise with the updated appointment
 * @throws {Error} If appointment not found or update fails
 * @example
 * const appointment = await confirmAppointment('apt-123');
 * console.log('Status:', appointment.status);
 */
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

/**
 * Handle payment failure - release slot and optionally refund
 * Input: appointmentId, reason
 * Process: Cancel appointment → Release slot → Optionally refund
 * Output: Cancelled appointment
 * @param appointmentId - Appointment ID that failed payment
 * @param reason - Reason for the failure (default: 'Payment failed')
 * @returns Promise with success status and cancelled appointment
 * @throws {Error} If appointment not found or cancellation fails
 * @example
 * const result = await handlePaymentFailure('apt-123', 'Card declined');
 * console.log('Appointment cancelled:', result.appointment);
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

    // Release any slot locks
    await supabase
      .from('slot_locks')
      .delete()
      .eq('doctor_id', appointment.doctor_id)
      .gte('start_ts', appointment.start_ts)
      .lte('end_ts', appointment.end_ts)

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
 * @param appointmentId - Appointment ID to refund
 * @param reason - Reason for the refund (default: 'Patient requested')
 * @returns Promise with success status and refund record
 * @throws {Error} If no paid payment found or refund processing fails
 * @example
 * const result = await processRefund('apt-123', 'Doctor cancelled');
 * if (result.success) {
 *   console.log('Refund processed:', result.refund);
 * }
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
        appointment_id: appointmentId,
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
    logger.error('Error processing refund:', { error })
    throw error
  }
}

/**
 * Sends email receipt for a payment
 * @param patientId - Patient's unique identifier
 * @param appointmentId - Appointment ID for the receipt
 * @returns Promise that resolves when email is sent
 * @example
 * await sendReceiptEmail('pat-123', 'apt-456');
 */
async function sendReceiptEmail(patientId: string, appointmentId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
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
    profile.full_name ?? 'Paciente'
  )
}

/**
 * Sends WhatsApp receipt for a payment
 * @param patientId - Patient's unique identifier
 * @param appointment - Appointment object with payment details
 * @returns Promise that resolves when WhatsApp message is sent
 * @example
 * await sendReceiptWhatsApp('pat-123', appointment);
 */
async function sendReceiptWhatsApp(patientId: string, appointment: { id: string; doctor_id: string; start_ts: string; price_cents: number; currency: string }) {
  const supabase = await createClient()

  const phone = await getPatientPhone(patientId)
  if (!phone) {
    logger.warn('No phone found for patient:', { patient_id: patientId })
    return
  }

  const doctorName = await getDoctorName(appointment.doctor_id)
  if (!doctorName) {
    logger.warn('No doctor found:', { doctor_id: appointment.doctor_id })
    return
  }

  const startTs = new Date(appointment.start_ts)
  const dateStr = startTs.toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = startTs.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', patientId)
    .single()

  await sendWhatsAppReceipt(
    phone,
    profile?.full_name ?? 'Paciente',
    doctorName,
    dateStr,
    timeStr,
    appointment.price_cents ?? 0,
    appointment.currency ?? 'MXN',
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://doctory.mx'}/consultation/${appointment.id}`
  )
}
