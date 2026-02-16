import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

/**
 * Send subscription welcome notification
 */
export async function sendSubscriptionWelcomeNotification(doctorId: string, tier: string): Promise<void> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', doctorId)
    .single()

  if (!profile?.email) return

  try {
    const { sendEmail, getEmailTemplate } = await import('@/lib/notifications')

    const tierNames: Record<string, string> = {
      pro: 'Profesional',
      elite: 'Élite',
    }

    const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  ¡Bienvenido a Doctor.mx ${tierNames[tier] || tier}!
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #ecfdf5; border-radius: 6px; border-left: 4px solid #10b981;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
        Tu suscripción ha sido activada exitosamente. Ya tienes acceso a todas las funcionalidades de tu plan.
      </p>
    </td>
  </tr>
</table>
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Si tienes alguna pregunta, no dudes en contactarnos.
</p>
`
    const html = getEmailTemplate(content, profile.full_name || 'Doctor')

    await sendEmail({
      to: profile.email,
      subject: `¡Bienvenido a Doctor.mx ${tierNames[tier] || tier}!`,
      html,
      tags: [
        { name: 'type', value: 'subscription_welcome' },
        { name: 'tier', value: tier },
      ],
    })

    logger.info(`Subscription welcome email sent`, { doctorId, tier })
  } catch (error) {
    logger.error('Failed to send subscription welcome email', { error, doctorId })
  }
}

/**
 * Send subscription canceled notification
 */
export async function sendSubscriptionCanceledNotification(doctorId: string): Promise<void> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', doctorId)
    .single()

  if (!profile?.email) return

  try {
    const { sendEmail, getEmailTemplate } = await import('@/lib/notifications')

    const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Tu suscripción a Doctor.mx ha sido cancelada.
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #dc2626;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
        Tu suscripción ha finalizado. Si deseas reactivarla, puedes hacerlo desde tu panel de control.
      </p>
    </td>
  </tr>
</table>
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Esperamos verte de nuevo pronto.
</p>
`
    const html = getEmailTemplate(content, profile.full_name || 'Doctor')

    await sendEmail({
      to: profile.email,
      subject: 'Tu suscripción a Doctor.mx ha sido cancelada',
      html,
      tags: [
        { name: 'type', value: 'subscription_canceled' },
      ],
    })

    logger.info(`Subscription canceled email sent`, { doctorId })
  } catch (error) {
    logger.error('Failed to send subscription canceled email', { error, doctorId })
  }
}

/**
 * Send subscription payment failed notification
 */
export async function sendSubscriptionPaymentFailedNotification(doctorId: string, tier: string): Promise<void> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', doctorId)
    .single()

  if (!profile?.email) return

  try {
    const { sendEmail, getEmailTemplate } = await import('@/lib/notifications')

    const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  No pudimos procesar tu pago de suscripción a Doctor.mx.
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #dc2626;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
        El pago de tu suscripción falló. Por favor actualiza tu método de pago para evitar interrupciones en el servicio.
      </p>
    </td>
  </tr>
</table>
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Puedes actualizar tu método de pago desde tu panel de control.
</p>
`
    const html = getEmailTemplate(content, profile.full_name || 'Doctor')

    await sendEmail({
      to: profile.email,
      subject: 'Pago de suscripción falló - Doctor.mx',
      html,
      tags: [
        { name: 'type', value: 'subscription_payment_failed' },
      ],
    })

    logger.info(`Subscription payment failed email sent`, { doctorId })
  } catch (error) {
    logger.error('Failed to send subscription payment failed email', { error, doctorId })
  }
}
