import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import type { Appointment } from '../../types'

/**
 * Send payment success notifications (email and WhatsApp)
 */
export async function sendPaymentNotifications(
  appointment: Appointment,
  method: 'card' | 'oxxo' | 'spei'
): Promise<void> {
  await Promise.all([
    sendPaymentSuccessEmail(appointment),
    sendPaymentSuccessWhatsApp(appointment, method),
  ])
}

/**
 * Send payment success email
 */
async function sendPaymentSuccessEmail(appointment: Appointment): Promise<void> {
  if (!appointment.patient?.email) return

  try {
    const { sendPaymentReceipt } = await import('@/lib/notifications')
    await sendPaymentReceipt(
      appointment.id,
      appointment.patient.email,
      appointment.patient.full_name ?? 'Paciente'
    )
    logger.info(`Payment receipt email sent for appointment ${appointment.id}`)
  } catch (error) {
    logger.error('Failed to send payment receipt email:', { error, appointmentId: appointment.id })
  }
}

/**
 * Send payment success WhatsApp
 */
async function sendPaymentSuccessWhatsApp(
  appointment: Appointment,
  method: 'card' | 'oxxo' | 'spei'
): Promise<void> {
  if (!appointment.patient?.phone) return

  try {
    const { sendPaymentReceipt: sendWhatsAppReceipt, getDoctorName } = await import('@/lib/whatsapp-notifications')

    const doctorName = await getDoctorName(appointment.doctor_id)
    const startTs = new Date(appointment.start_ts)
    const dateStr = startTs.toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' })
    const timeStr = startTs.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

    await sendWhatsAppReceipt(
      appointment.patient.phone,
      appointment.patient.full_name ?? 'Paciente',
      doctorName ?? 'tu médico',
      dateStr,
      timeStr,
      appointment.price_cents ?? 0,
      appointment.currency ?? 'MXN',
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://doctory.mx'}/consultation/${appointment.id}`
    )
    logger.info(`Payment receipt WhatsApp sent for appointment ${appointment.id}`)
  } catch (error) {
    logger.error('Failed to send payment receipt WhatsApp:', { error, appointmentId: appointment.id })
  }
}
