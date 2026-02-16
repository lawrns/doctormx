import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendWhatsAppNotification } from '@/lib/whatsapp-notifications'
import { logger } from '@/lib/observability/logger'
import { addDays, addHours } from 'date-fns'

export type FollowUpType =
  | 'follow_up_24h'
  | 'follow_up_7d'
  | 'medication_reminder'
  | 'prescription_refill'
  | 'chronic_care_check'

export interface FollowUp {
  id: string
  appointment_id: string | null
  patient_id: string
  doctor_id: string | null
  prescription_id: string | null
  type: FollowUpType
  scheduled_at: string
  sent_at: string | null
  status: 'pending' | 'sent' | 'failed' | 'responded' | 'cancelled'
  response: string | null
  response_action: string | null
  created_at: string
}

export async function scheduleFollowUp(params: {
  appointmentId: string
  type: FollowUpType
  scheduledAt?: Date
}): Promise<{ success: boolean; followUpId?: string; error?: string }> {
  const supabase = await createClient()
  const { appointmentId, type, scheduledAt } = params

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, patient_id, doctor_id, start_ts, status')
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { success: false, error: 'Appointment not found' }
  }

  let scheduledTime: Date
  switch (type) {
    case 'follow_up_24h':
      scheduledTime = scheduledAt || addHours(new Date(appointment.start_ts), 24)
      break
    case 'follow_up_7d':
      scheduledTime = scheduledAt || addDays(new Date(appointment.start_ts), 7)
      break
    default:
      scheduledTime = scheduledAt || new Date()
  }

  const { data: followUp, error } = await supabase
    .from('followups')
    .insert({
      appointment_id: appointmentId,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      type,
      scheduled_at: scheduledTime.toISOString(),
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    logger.error('Error scheduling follow-up', { error })
    return { success: false, error: error.message }
  }

  return { success: true, followUpId: followUp.id }
}

export async function sendFollowUp24hNotification(
  appointmentId: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const supabase = await createClient()

  const { data: appointment } = await supabase
    .from('appointments')
    .select(
      `id, patient_id, doctor_id, start_ts,
      patient:profiles!appointments_patient_id_fkey(full_name, phone),
      doctor.doctores!appointments_doctor_id_fkey(profile:profiles.doctores_id_fkey(full_name))`
    )
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { success: false, error: 'Appointment not found' }
  }

  const patient = Array.isArray(appointment.patient)
    ? appointment.patient[0]
    : appointment.patient
  const doctor = Array.isArray(appointment.doctor)
    ? appointment.doctor[0]
    : appointment.doctor
  const doctorProfile = Array.isArray(doctor?.profile)
    ? doctor.profile[0]
    : doctor?.profile

  if (!patient?.phone) {
    return { success: false, error: 'Patient phone not found' }
  }

  const result = await sendWhatsAppNotification(patient.phone, 'follow_up_24h', {
    patientName: patient.full_name,
    doctorName: doctorProfile?.full_name || 'tu médico',
    bookingLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/doctores`,
  })

  if (result.success) {
    await supabase
      .from('followups')
      .update({ sent_at: new Date().toISOString(), status: 'sent' })
      .eq('appointment_id', appointmentId)
      .eq('type', 'follow_up_24h')
      .eq('status', 'pending')
  } else {
    await supabase
      .from('followups')
      .update({ status: 'failed' })
      .eq('appointment_id', appointmentId)
      .eq('type', 'follow_up_24h')
      .eq('status', 'pending')
  }

  return result
}

export async function sendFollowUp7dNotification(
  appointmentId: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const supabase = await createClient()

  const { data: appointment } = await supabase
    .from('appointments')
    .select(
      `id, patient_id, doctor_id, start_ts,
      patient:profiles!appointments_patient_id_fkey(full_name, phone)`
    )
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { success: false, error: 'Appointment not found' }
  }

  const patient = Array.isArray(appointment.patient)
    ? appointment.patient[0]
    : appointment.patient

  if (!patient?.phone) {
    return { success: false, error: 'Patient phone not found' }
  }

  const result = await sendWhatsAppNotification(patient.phone, 'follow_up_7d', {
    patientName: patient.full_name,
    bookingLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/doctores`,
  })

  if (result.success) {
    await supabase
      .from('followups')
      .update({ sent_at: new Date().toISOString(), status: 'sent' })
      .eq('appointment_id', appointmentId)
      .eq('type', 'follow_up_7d')
      .eq('status', 'pending')
  } else {
    await supabase
      .from('followups')
      .update({ status: 'failed' })
      .eq('appointment_id', appointmentId)
      .eq('type', 'follow_up_7d')
      .eq('status', 'pending')
  }

  return result
}

export async function sendMedicationReminder(
  prescriptionId: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const supabase = await createClient()

  const { data: prescription } = await supabase
    .from('prescriptions')
    .select(
      `id, appointment_id, medications, instructions,
      appointment:appointments!prescriptions_appointment_id_fkey(
        patient:profiles!appointments_patient_id_fkey(full_name, phone)
      )`
    )
    .eq('id', prescriptionId)
    .single()

  if (!prescription) {
    return { success: false, error: 'Prescription not found' }
  }

  const apt = prescription.appointment as { patient?: Array<{ full_name: string; phone: string | null }> }
  const patient = Array.isArray(apt?.patient) ? apt.patient[0] : apt?.patient

  if (!patient?.phone) {
    return { success: false, error: 'Patient phone not found' }
  }

  const message = `💊 *Recordatorio de Medicación - Doctor.mx*

Hola${patient.full_name ? ` ${patient.full_name}` : ''},

Es hora de tomar tu medicamento:

${prescription.medications}

¿Ya lo tomaste?
Responde:
• ✅ Sí
• ⏰ No aún
• ❓ Duda

*Recuerda: Esta IA asiste, no diagnostica. Consulta a tu médico si tienes dudas.*

— *Doctor.mx: Tu salud, simplificada*`

  const result = await sendCustomWhatsAppNotification(patient.phone, message, 'medication_reminder')

  if (result.success) {
    await supabase
      .from('followups')
      .update({ sent_at: new Date().toISOString(), status: 'sent', prescription_id: prescriptionId })
      .eq('prescription_id', prescriptionId)
      .eq('type', 'medication_reminder')
      .eq('status', 'pending')
  }

  return result
}

export async function sendPrescriptionRefill(
  prescriptionId: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const supabase = await createClient()

  const { data: prescription } = await supabase
    .from('prescriptions')
    .select(
      `id, appointment_id, medications,
      appointment:appointments!prescriptions_appointment_id_fkey(
        patient:profiles!appointments_patient_id_fkey(full_name, phone)
      )`
    )
    .eq('id', prescriptionId)
    .single()

  if (!prescription) {
    return { success: false, error: 'Prescription not found' }
  }

  const apt = prescription.appointment as { patient?: Array<{ full_name: string; phone: string | null }> }
  const patient = Array.isArray(apt?.patient) ? apt.patient[0] : apt?.patient

  if (!patient?.phone) {
    return { success: false, error: 'Patient phone not found' }
  }

  const message = `💊 *Tu receta está por terminar - Doctor.mx*

Hola${patient.full_name ? ` ${patient.full_name}` : ''},

Tu receta de:
${prescription.medications}

Está por terminarse.

¿Necesitas agendar una consulta para renovación?

Responde *RENOVAR* para agendar ahora.

— *Doctor.mx: Tu salud, simplificada*`

  const result = await sendCustomWhatsAppNotification(patient.phone, message, 'prescription_refill')

  if (result.success) {
    await supabase
      .from('followups')
      .update({ sent_at: new Date().toISOString(), status: 'sent', prescription_id: prescriptionId })
      .eq('prescription_id', prescriptionId)
      .eq('type', 'prescription_refill')
      .eq('status', 'pending')
  }

  return result
}

export async function sendChronicCareFollowUp(
  patientId: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const supabase = await createClient()

  const { data: patient } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', patientId)
    .single()

  if (!patient) {
    return { success: false, error: 'Patient not found' }
  }

  if (!patient.phone) {
    return { success: false, error: 'Patient phone not found' }
  }

  const message = `🏥 *Doctor.mx - Seguimiento de Cuidado Crónico*

Hola${patient.full_name ? ` ${patient.full_name}` : ''},

¿Te encuentras bien? Queremos asegurarnos de que tu tratamiento esté funcionando correctamente.

Responde:
• 👍 Me siento bien
• 😐 Hay algunas dudas
• 👎 Necesito atención

*Recuerda: Esta IA asiste, no diagnostica. Para emergencias, llama al 911.*

— *Doctor.mx: Tu salud, simplificada*`

  const result = await sendCustomWhatsAppNotification(patient.phone, message, 'chronic_care_check')

  return result
}

async function sendCustomWhatsAppNotification(
  phone: string,
  body: string,
  template: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
  const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Missing required Twilio environment variables: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN')
  }

  const getWhatsAppPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('52') && cleaned.length === 12) return `whatsapp:+${cleaned}`
    if (cleaned.length === 10) return `whatsapp:+52${cleaned}`
    return `whatsapp:+${cleaned}`
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        From: TWILIO_WHATSAPP_NUMBER,
        To: getWhatsAppPhone(phone),
        Body: body,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error('Twilio API error', { error })
      return { success: false, error }
    }

    const twilioMessage = await response.json()

    const supabase = createServiceClient()
    await supabase.from('notification_logs').insert({
      phone_number: phone,
      template,
      status: 'sent',
      twilio_sid: twilioMessage.sid,
      message_body: body,
    })

    return { success: true, messageSid: twilioMessage.sid }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Error sending WhatsApp message', { error })
    return { success: false, error: errorMessage }
  }
}

export async function getPatientFollowUps(patientId: string): Promise<FollowUp[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('followups')
      .select('*')
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: false })

    if (error) {
      logger.error('Error fetching patient follow-ups', { error })
      return []
    }
    return data || []
  } catch (error) {
    logger.error('Exception fetching patient follow-ups', { error })
    return []
  }
}

export async function getDoctorFollowUpResponses(doctorId: string): Promise<{
  followUps: FollowUp[]
  responses: Array<{ id: string; followup_id: string; patient_name: string; response: string; action_taken: string; created_at: string }>
}> {
  const supabase = await createClient()

  const { data: followUps } = await supabase
    .from('followups')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('status', 'responded')
    .order('created_at', { ascending: false })

  const followUpIds = (followUps || []).map((f) => f.id)

  const { data: responses } = followUpIds.length > 0
    ? await supabase
        .from('followup_responses')
        .select(
          `id, followup_id, response, action_taken, created_at,
          patient:profiles!followup_responses_followup_id_fkey(full_name)`
        )
        .in('followup_id', followUpIds)
        .order('created_at', { ascending: false })
    : { data: null }

  return {
    followUps: followUps || [],
    responses: (responses || []).map((r) => ({
      id: r.id,
      followup_id: r.followup_id,
      patient_name: (r.patient as unknown as { full_name: string } | null)?.full_name || 'Paciente',
      response: r.response,
      action_taken: r.action_taken,
      created_at: r.created_at,
    })),
  }
}

export async function processFollowUpResponse(
  followUpId: string,
  response: string
): Promise<{ action: string; message: string }> {
  const supabase = await createServiceClient()
  const normalizedResponse = response.toLowerCase().trim()

  let action = 'logged'
  let actionMessage = 'Tu respuesta ha sido registrada.'

  if (normalizedResponse.includes('peor') || normalizedResponse.includes('4')) {
    action = 'alert_doctor'
    actionMessage = 'Nos preocupan tus síntomas. Te contactaremos pronto para agendar una cita de seguimiento.'
  } else if (normalizedResponse.includes('sin cambios') || normalizedResponse.includes('3')) {
    action = 'suggest_followup'
    actionMessage = 'Considera agendar una cita de seguimiento. Responde SEGUIMIENTO para agendar.'
  } else if (normalizedResponse.includes('mejor') || normalizedResponse.includes('1') || normalizedResponse.includes('2')) {
    action = 'positive_outcome'
    actionMessage = '¡Nos alegra saber que te sientes mejor! Continúa con tu tratamiento.'
  } else if (normalizedResponse.includes('sí') || normalizedResponse.includes('si')) {
    action = 'medication_taken'
    actionMessage = '¡Excelente! Mantener el tratamiento es clave para tu recuperación.'
  } else if (normalizedResponse.includes('no') && !normalizedResponse.includes('noches')) {
    action = 'medication_missed'
    actionMessage = '¿Por qué no lo has tomado? Responde con más detalles si necesitas ayuda.'
  } else if (normalizedResponse.includes('renovar')) {
    action = 'prescription_renewal'
    actionMessage = 'Entendido. Puedes agendar tu cita de renovación aquí: https://doctory.mx/doctores'
  }

  await supabase
    .from('followups')
    .update({ status: 'responded', response, response_action: action })
    .eq('id', followUpId)

  await supabase.from('followup_responses').insert({ followup_id: followUpId, response, action_taken: action })

  if (action === 'alert_doctor') {
    const { data: followUp } = await supabase.from('followups').select('doctor_id, patient_id').eq('id', followUpId).single()
    if (followUp?.doctor_id) {
      await supabase.from('notifications').insert({
        user_id: followUp.doctor_id,
        type: 'follow_up_alert',
        title: 'Paciente reporta empeoramiento',
        message: 'Un paciente reportó haberse sentido peor después de su consulta. Revisa sus respuestas.',
        link: '/doctor/followups',
      })
    }
  }

  return { action, message: actionMessage }
}

export async function getPendingFollowUps(): Promise<FollowUp[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('followups')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function markAppointmentCompleted(appointmentId: string): Promise<void> {
  await scheduleFollowUp({ appointmentId, type: 'follow_up_24h' })
}

