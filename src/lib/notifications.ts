// Sistema de Notificaciones por Email - Resend
// Envía confirmaciones, recibos, recordatorios y seguimientos

import { Resend } from 'resend'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const FROM_EMAIL = 'Doctor.mx <noreply@doctory.com.mx>'
const SUPPORT_EMAIL = 'soporte@doctory.com.mx'

const resend = new Resend(process.env.RESEND_API_KEY)

export function formatMexicanDateTime(dateString: string): string {
  const date = new Date(dateString)
  return format(date, "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
}

export function getVideoConsultationLink(appointmentId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.com.mx'}/consultation/${appointmentId}`
}

export function getPriceDisplay(amountCents: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
  }).format(amountCents / 100)
}

export function getEmailTemplate(content: string, patientName: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Doctor.mx - Notificación</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; background-color: #0066cc; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Doctor.mx</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; opacity: 0.9; font-size: 14px;">Tu plataforma de telemedicina</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">Hola ${patientName},</p>
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-align: center;">
                ¿Tienes preguntas? Contáctanos en <a href="mailto:${SUPPORT_EMAIL}" style="color: #0066cc; text-decoration: none;">${SUPPORT_EMAIL}</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Doctor.mx. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export async function sendEmail({
  to,
  subject,
  html,
  tags,
}: {
  to: string
  subject: string
  html: string
  tags?: Array<{ name: string; value: string }>
}) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      tags,
    })
    console.log(`Email sent successfully: ${result.data?.id}`)
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export async function sendAppointmentConfirmation(
  appointmentId: string,
  patientEmail: string,
  patientName: string
): Promise<{ success: boolean; error?: unknown }> {
  const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
  
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors (
        *,
        profile:profiles (full_name, photo_url)
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { success: false, error: 'Appointment not found' }
  }

  const doctor = Array.isArray(appointment.doctor) ? appointment.doctor[0] : appointment.doctor
  const doctorProfile = Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile
  const doctorName = doctorProfile?.full_name || 'Doctor'
  const specialty = doctor.specialty || 'Especialidad'

  const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Tu cita ha sido confirmada con éxito. Aquí están los detalles:
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <tr>
    <td style="padding: 12px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #0066cc;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Doctor</p>
      <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${doctorName}</p>
      <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${specialty}</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 12px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #0066cc; vertical-align: top;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Fecha y Hora</p>
      <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${formatMexicanDateTime(appointment.start_ts)}</p>
      <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Hora del centro de México (GMT-6)</p>
    </td>
  </tr>
</table>
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Tu enlace de videoconsultación estará disponible 10 minutos antes de tu cita.
</p>
<p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
  Si necesitas reprogramar o cancelar, te pedimos que lo hagas con al menos 2 horas de anticipación.
</p>
`

  const html = getEmailTemplate(content, patientName)

  const result = await sendEmail({
    to: patientEmail,
    subject: 'Confirmación de tu cita en Doctor.mx',
    html,
    tags: [
      { name: 'type', value: 'appointment_confirmation' },
      { name: 'appointmentId', value: appointmentId },
    ],
  })

  return { success: result.success, error: result.error }
}

export async function sendPaymentReceipt(
  appointmentId: string,
  patientEmail: string,
  patientName: string
): Promise<{ success: boolean; error?: unknown }> {
  const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
  
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors (
        *,
        profile:profiles (full_name)
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { success: false, error: 'Appointment not found' }
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('appointment_id', appointmentId)
    .eq('status', 'paid')
    .single()

  if (!payment) {
    return { success: false, error: 'Payment not found' }
  }

  const doctor = Array.isArray(appointment.doctor) ? appointment.doctor[0] : appointment.doctor
  const doctorProfile = Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile
  const doctorName = doctorProfile?.full_name || 'Doctor'

  const receiptNumber = `REC-${payment.id.slice(0, 8).toUpperCase()}`
  const paymentDate = formatMexicanDateTime(payment.created_at || new Date().toISOString())

  const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Tu pago ha sido procesado correctamente. Aquí está tu recibo:
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f9fafb; border-radius: 6px; overflow: hidden;">
  <tr>
    <td style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Recibo número</p>
      <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${receiptNumber}</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Fecha de pago</p>
      <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 16px;">${paymentDate}</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Concepto</p>
      <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 16px;">Consulta con ${doctorName}</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 16px 20px;">
      <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Monto pagado</p>
      <p style="margin: 4px 0 0 0; color: #059669; font-size: 24px; font-weight: 700;">${getPriceDisplay(payment.amount_cents, payment.currency)}</p>
    </td>
  </tr>
</table>
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Este correo funciona como tu comprobante de pago. Te recomendamos guardarlo.
</p>
`

  const html = getEmailTemplate(content, patientName)

  const result = await sendEmail({
    to: patientEmail,
    subject: `Recibo de pago - ${receiptNumber}`,
    html,
    tags: [
      { name: 'type', value: 'payment_receipt' },
      { name: 'appointmentId', value: appointmentId },
    ],
  })

  return { success: result.success, error: result.error }
}

export async function sendConsultationReminder(
  appointmentId: string,
  patientEmail: string,
  patientName: string
): Promise<{ success: boolean; error?: unknown }> {
  const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
  
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors (
        *,
        profile:profiles (full_name)
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { success: false, error: 'Appointment not found' }
  }

  const doctor = Array.isArray(appointment.doctor) ? appointment.doctor[0] : appointment.doctor
  const doctorProfile = Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile
  const doctorName = doctorProfile?.full_name || 'Doctor'

  const videoLink = getVideoConsultationLink(appointmentId)

  const appointmentDate = formatMexicanDateTime(appointment.start_ts)

  const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  ¡Tu videoconsultación es en 1 hora! Preparamos todo para que tu experiencia sea excelente.
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <tr>
    <td style="padding: 16px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b; text-align: center;">
      <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Tu cita con ${doctorName}</p>
      <p style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 700;">${appointmentDate}</p>
    </td>
  </tr>
</table>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <tr>
    <td style="padding: 16px; background-color: #ecfdf5; border-radius: 6px; border-left: 4px solid #10b981; text-align: center;">
      <p style="margin: 0 0 12px 0; color: #065f46; font-size: 14px;">Accede a tu videoconsultación:</p>
      <a href="${videoLink}" style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Entrar a la Videoconsultación</a>
    </td>
  </tr>
</table>
<p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
  <strong>Recomendaciones para tu consulta:</strong>
</p>
<ul style="margin: 0 0 20px 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
  <li>Asegúrate de tener buena conexión a internet</li>
  <li>Encuentra un lugar tranquilo y bien iluminado</li>
  <li>Ten a la mano cualquier documento médico relevante</li>
  <li>Prepare tus preguntas con anticipación</li>
</ul>
`

  const html = getEmailTemplate(content, patientName)

  const result = await sendEmail({
    to: patientEmail,
    subject: 'Recordatorio: Tu videoconsultación es en 1 hora',
    html,
    tags: [
      { name: 'type', value: 'consultation_reminder' },
      { name: 'appointmentId', value: appointmentId },
    ],
  })

  return { success: result.success, error: result.error }
}

export async function sendFollowUp(
  appointmentId: string,
  patientEmail: string,
  patientName: string,
  followUpNotes?: string
): Promise<{ success: boolean; error?: unknown }> {
  const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
  
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors (
        *,
        profile:profiles (full_name)
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { success: false, error: 'Appointment not found' }
  }

  const doctor = Array.isArray(appointment.doctor) ? appointment.doctor[0] : appointment.doctor
  const doctorProfile = Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile
  const doctorName = doctorProfile?.full_name || 'Doctor'

  const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Gracias por tu consulta con ${doctorName}. Esperamos que te hayas beneficiado de la atención recibida.
</p>
${followUpNotes ? `
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f0f9ff; border-radius: 6px; overflow: hidden;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0 0 8px 0; color: #0369a1; font-size: 14px; font-weight: 600;">Notas de seguimiento:</p>
      <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">${followUpNotes}</p>
    </td>
  </tr>
</table>
` : ''}
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Si tienes alguna pregunta adicional o necesitas programar una cita de seguimiento, estamos aquí para ayudarte.
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <tr>
    <td align="center" style="padding: 8px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.com.mx'}/doctors" style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">Agendar Nueva Cita</a>
    </td>
  </tr>
</table>
<p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
  Tu opinión es muy importante para nosotros. Si deseas dejar una reseña sobre tu experiencia, te agradecemos mucho tu retroalimentación.
</p>
`

  const html = getEmailTemplate(content, patientName)

  const result = await sendEmail({
    to: patientEmail,
    subject: 'Gracias por tu consulta en Doctor.mx',
    html,
    tags: [
      { name: 'type', value: 'follow_up' },
      { name: 'appointmentId', value: appointmentId },
    ],
  })

  return { success: result.success, error: result.error }
}
