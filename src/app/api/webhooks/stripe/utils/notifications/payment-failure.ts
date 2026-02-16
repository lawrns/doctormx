import { logger } from '@/lib/observability/logger'
import type { Appointment } from '../../types'

/**
 * Send payment failure notifications
 */
export async function sendPaymentFailureNotifications(
  appointment: Appointment,
  reason: string = 'payment_failed'
): Promise<void> {
  await Promise.all([
    sendPaymentFailureEmail(appointment, reason),
    sendPaymentFailureWhatsApp(appointment, reason),
  ])
}

/**
 * Send payment failure email
 */
async function sendPaymentFailureEmail(appointment: Appointment, reason: string): Promise<void> {
  if (!appointment.patient?.email) return

  try {
    const { sendEmail, getEmailTemplate } = await import('@/lib/notifications')

    const reasonMessages: Record<string, string> = {
      payment_failed: 'El pago con tarjeta fue rechazado. Por favor intenta con otro método de pago.',
      oxxo_expired: 'El voucher de OXXO expiró sin ser pagado. Puedes generar uno nuevo desde tu cuenta.',
    }

    const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Tu cita no pudo ser confirmada debido a un problema con el pago.
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #dc2626;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
        ${reasonMessages[reason] || 'Hubo un problema con el pago. Por favor intenta nuevamente.'}
      </p>
    </td>
  </tr>
</table>
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Si necesitas ayuda, contacta a nuestro equipo de soporte.
</p>
`
    const html = getEmailTemplate(content, appointment.patient.full_name || 'Paciente')

    await sendEmail({
      to: appointment.patient.email,
      subject: 'Problema con tu pago - Doctor.mx',
      html,
      tags: [
        { name: 'type', value: 'payment_failed' },
        { name: 'appointmentId', value: appointment.id },
      ],
    })
    logger.info(`Payment failure email sent for appointment ${appointment.id}`)
  } catch (error) {
    logger.error('Failed to send payment failure email:', { error, appointmentId: appointment.id })
  }
}

/**
 * Send payment failure WhatsApp
 */
async function sendPaymentFailureWhatsApp(appointment: Appointment, reason: string): Promise<void> {
  if (!appointment.patient?.phone) return

  try {
    const { sendWhatsAppNotification } = await import('@/lib/whatsapp-notifications')

    await sendWhatsAppNotification(
      appointment.patient.phone,
      'appointment_confirmation',
      {
        patientName: appointment.patient.full_name,
        bookingLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/dashboard`,
      }
    )
    logger.info(`Payment failure WhatsApp sent for appointment ${appointment.id}`)
  } catch (error) {
    logger.error('Failed to send payment failure WhatsApp:', { error, appointmentId: appointment.id })
  }
}
