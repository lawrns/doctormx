// WhatsApp Notification Service via Meta Business API
// Input: Notification data (appointment, patient, template type)
// Process: Format template → Send via Twilio WhatsApp API → Log delivery
// Output: Success/failure with message SID

import { createServiceClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { logger } from '@/lib/observability/logger'
import { sendWhatsAppMessage, sendTemplateMessage } from './whatsapp-business-api'

// Lazy initialization - only check when actually used
function getTwilioConfig() {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
  const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Missing required Twilio environment variables: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN')
  }

  return { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER }
}

export type NotificationTemplate =
  | 'appointment_confirmation'
  | 'payment_receipt'
  | 'consultation_reminder'
  | 'follow_up_24h'
  | 'follow_up_7d'
  | 'prescription_ready'
  | 'doctor_available'

interface NotificationContext {
  patientName?: string
  doctorName?: string
  specialty?: string
  appointmentDate?: string
  appointmentTime?: string
  price?: string
  currency?: string
  bookingLink?: string
  prescriptionLink?: string
}

interface TwilioMessage {
  sid: string
  status: string
  to: string
  from: string
  body: string
  dateCreated: string
}

function getWhatsAppPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('52') && cleaned.length === 12) {
    return `whatsapp:+${cleaned}`
  }
  if (cleaned.length === 10) {
    return `whatsapp:+52${cleaned}`
  }
  return `whatsapp:+${cleaned}`
}

function formatTemplate(template: NotificationTemplate, ctx: NotificationContext): string {
  switch (template) {
    case 'appointment_confirmation':
      return `📅 *Confirmación de Cita - Doctor.mx*

Hola${ctx.patientName ? ` ${ctx.patientName}` : ''},

Tu cita con el Dr.${ctx.doctorName ? ` ${ctx.doctorName}` : ''} ha sido confirmada.

📋 *Detalles:*
• Especialidad: ${ctx.specialty || 'Medicina General'}
• Fecha: ${ctx.appointmentDate || 'Por confirmar'}
• Hora: ${ctx.appointmentTime || 'Por confirmar'}
• Costo: ${ctx.price || 'Por confirmar'} ${ctx.currency || 'MXN'}

🏥 Para acceder a tu consulta, entra a: ${ctx.bookingLink || 'https://doctory.mx/app'}

❓ ¿Necesitas ayuda? Responde a este mensaje.

— *Doctor.mx: Tu salud, simplificada*`

    case 'payment_receipt':
      return `✅ *Pago Recibido - Doctor.mx*

Hola${ctx.patientName ? ` ${ctx.patientName}` : ''},

Hemos recibido tu pago por ${ctx.price || 'monto'} ${ctx.currency || 'MXN'}.

📋 *Detalles del pago:*
• Cita con: Dr.${ctx.doctorName || 'tu médico'}
• Fecha: ${ctx.appointmentDate || 'Por confirmar'}
• Hora: ${ctx.appointmentTime || 'Por confirmar'}
• Referencia: ${ctx.bookingLink?.slice(-8).toUpperCase() || 'N/A'}

Tu cita está confirmada. Te recordamos llegar 5 minutos antes.

— *Doctor.mx: Tu salud, simplificada*`

    case 'consultation_reminder':
      return `⏰ *Recordatorio: Tu consulta es en 1 hora*

Hola${ctx.patientName ? ` ${ctx.patientName}` : ''},

Tu consulta con el Dr.${ctx.doctorName || 'tu médico'} comienza en aproximadamente 1 hora.

📅 ${ctx.appointmentDate} a las ${ctx.appointmentTime}

🖥️ *Cómo acceder:*
 entra a ${ctx.bookingLink || 'https://doctory.mx/app'} y selecciona "Iniciar Consulta"

💡 *Consejos para tu consulta:*
• Encuentra un lugar privado y con buena conexión
• Ten a mano tus medicamentos actuales
• Prepara tus preguntas

❓ ¿Problemas técnicos? Llama al: 55-DOCTORY

— *Doctor.mx: Tu salud, simplificada*`

    case 'follow_up_24h':
      return `🏥 *Doctor.mx - Seguimiento Post-Consulta*

Hola${ctx.patientName ? ` ${ctx.patientName}` : ''},

¿Cómo te sientes después de tu consulta con el Dr.${ctx.doctorName ? ` ${ctx.doctorName}` : ''}?

Responde con:
• 👍 Mejor
• 😐 Sin cambios
• 👎 Peor
• O describe cómo te sientes

📋 *¿Tomaste los medicamentos recetados?*
• Sí
• No aún
• No tenía receta

*Recuerda: Esta IA asiste, no diagnostica. Si tienes síntomas graves, busca atención médica.*

— *Doctor.mx: Tu salud, simplificada*`

    case 'follow_up_7d':
      return `📅 *Doctor.mx - Seguimiento a 7 días*

Hola${ctx.patientName ? ` ${ctx.patientName}` : ''},

Hace una semana tuviste tu consulta. ¿Cómo estás ahora?

Responde:
• 👍 Totalmente recuperado
• 👍 Mucho mejor
• 😐 Algo mejor
• 👎 Sin mejoría
• 👎 Peor

*Recuerda agendar tu próxima cita si es necesario: ${ctx.bookingLink || 'doctory.mx/doctores'}*

— *Doctor.mx: Tu salud, simplificada*`

    case 'prescription_ready':
      return `💊 *Receta Lista - Doctor.mx*

Hola${ctx.patientName ? ` ${ctx.patientName}` : ''},

Tu receta de la consulta con el Dr.${ctx.doctorName ? ` ${ctx.doctorName}` : ''} está lista.

📋 *Detalles:*
• Fecha de emisión: ${ctx.appointmentDate || 'Hoy'}
• Válida por: 30 días
• Descargar: ${ctx.prescriptionLink || 'https://doctory.mx/app/prescriptions'}

🏥 *Farmacias participantes:*
Tu receta puede redenarse en cualquier farmacia del país.

— *Doctor.mx: Tu salud, simplificada*`

    case 'doctor_available':
      return `👨‍⚕️ *Doctor.mx - ¡Tu doctor está disponible!*

Hola${ctx.patientName ? ` ${ctx.patientName}` : ''},

${ctx.doctorName} ya está atendiendo consultas.

📋 *Especialidad:* ${ctx.specialty || 'Medicina General'}

📅 *Agenda ahora:*
${ctx.bookingLink || 'https://doctory.mx/doctores'}

* Cupo limitado - Reserva tu espacio*

— *Doctor.mx: Tu salud, simplificada*`

    default:
      return 'Mensaje de Doctor.mx'
  }
}

// LEGACY: Twilio implementation - kept for fallback
async function sendTwilioWhatsApp(
  to: string,
  body: string
): Promise<TwilioMessage | null> {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } = getTwilioConfig()
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_WHATSAPP_NUMBER,
        To: getWhatsAppPhone(to),
        Body: body,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error('Twilio API error', { error })
      return null
    }

    return await response.json() as TwilioMessage
  } catch (error) {
    logger.error('Error sending WhatsApp message', { error })
    return null
  }
}

async function sendBusinessAPIWhatsApp(
  to: string,
  body: string
): Promise<{ messageId?: string; error?: string }> {
  const { sendWhatsAppMessage } = await import('./whatsapp-business-api')
  const { success, messageId, error } = await sendWhatsAppMessage(to, body)
  if (!success) {
    return { error: error || 'Unknown error' }
  }
  return { messageId }
}

export async function sendWhatsAppNotification(
  phone: string,
  template: NotificationTemplate,
  context: NotificationContext = {}
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const supabase = createServiceClient()

  try {
    const messageBody = formatTemplate(template, context)
    const businessResult = await sendBusinessAPIWhatsApp(phone, messageBody)

    if (!businessResult.messageId) {
      await supabase.from('notification_logs').insert({
        phone_number: phone,
        template,
        status: 'failed',
        error: businessResult.error || 'Business API failed',
        context: context as Record<string, unknown>,
      })
      return { success: false, error: 'Failed to send message' }
    }

    await supabase.from('notification_logs').insert({
      phone_number: phone,
      template,
      status: 'sent',
      whatsapp_message_id: businessResult.messageId,
      message_body: messageBody,
      context: context as Record<string, unknown>,
    })

    return { success: true, messageSid: businessResult.messageId }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Error sending notification', { error })

    await supabase.from('notification_logs').insert({
      phone_number: phone,
      template,
      status: 'failed',
      error: errorMessage,
      context: context as Record<string, unknown>,
    })

    return { success: false, error: errorMessage }
  }
}

export async function sendAppointmentConfirmation(
  phone: string,
  patientName: string,
  doctorName: string,
  specialty: string,
  appointmentDate: string,
  appointmentTime: string,
  priceCents: number,
  currency: string,
  bookingLink: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  return sendWhatsAppNotification(phone, 'appointment_confirmation', {
    patientName,
    doctorName,
    specialty,
    appointmentDate,
    appointmentTime,
    price: formatCurrency(priceCents, currency),
    currency,
    bookingLink,
  })
}

export async function sendPaymentReceipt(
  phone: string,
  patientName: string,
  doctorName: string,
  appointmentDate: string,
  appointmentTime: string,
  priceCents: number,
  currency: string,
  bookingLink: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  return sendWhatsAppNotification(phone, 'payment_receipt', {
    patientName,
    doctorName,
    appointmentDate,
    appointmentTime,
    price: formatCurrency(priceCents, currency),
    currency,
    bookingLink,
  })
}

export async function sendConsultationReminder(
  phone: string,
  patientName: string,
  doctorName: string,
  appointmentDate: string,
  appointmentTime: string,
  bookingLink: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  return sendWhatsAppNotification(phone, 'consultation_reminder', {
    patientName,
    doctorName,
    appointmentDate,
    appointmentTime,
    bookingLink,
  })
}

export async function sendFollowUp24h(
  phone: string,
  patientName: string,
  doctorName: string,
  bookingLink: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  return sendWhatsAppNotification(phone, 'follow_up_24h', {
    patientName,
    doctorName,
    bookingLink,
  })
}

export async function sendFollowUp7d(
  phone: string,
  patientName: string,
  bookingLink: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  return sendWhatsAppNotification(phone, 'follow_up_7d', {
    patientName,
    bookingLink,
  })
}

export async function sendPrescriptionReady(
  phone: string,
  patientName: string,
  doctorName: string,
  prescriptionLink: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  return sendWhatsAppNotification(phone, 'prescription_ready', {
    patientName,
    doctorName,
    prescriptionLink,
  })
}

export async function sendDoctorAvailable(
  phone: string,
  doctorName: string,
  specialty: string,
  bookingLink: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  return sendWhatsAppNotification(phone, 'doctor_available', {
    doctorName,
    specialty,
    bookingLink,
  })
}

export async function getPatientPhone(patientId: string): Promise<string | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', patientId)
    .single()

  if (error || !data?.phone) {
    return null
  }

  return data.phone
}

export async function getDoctorName(doctorId: string): Promise<string | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', doctorId)
    .single()

  if (error || !data?.full_name) {
    return null
  }

  return data.full_name
}

