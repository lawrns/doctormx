/**
 * Appointment Reminder Service
 * Creates reminder schedules, sends via email/SMS/WhatsApp, handles patient responses.
 */

import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail, getEmailTemplate, formatMexicanDateTime } from '@/lib/notifications'
import {
  sendWhatsAppNotification,
  sendAppointmentConfirmation as sendWAConfirmation,
  sendConsultationReminder as sendWAReminder,
} from '@/lib/whatsapp-notifications'

export type ReminderChannel = 'email' | 'sms' | 'whatsapp'
export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'skipped'
export type PatientResponse = 'confirm' | 'cancel' | 'reschedule'

const REMINDER_TEMPLATES: Record<
  number,
  { label: string; subject: string; urgency: 'low' | 'medium' | 'high' }
> = {
  48: { label: '48 horas antes', subject: 'Recordatorio: Tu cita es en 48 horas', urgency: 'low' },
  24: { label: '24 horas antes', subject: 'Recordatorio: Tu cita es mañana', urgency: 'medium' },
  2: { label: '2 horas antes', subject: 'Tu consulta comienza en 2 horas', urgency: 'high' },
}

/**
 * Schedule all reminders for an appointment at time of booking.
 */
export async function scheduleAppointmentReminders(appointmentId: string) {
  const supabase = createServiceClient()

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, doctor_id, patient_id, start_ts, status')
    .eq('id', appointmentId)
    .single()

  if (!appointment || appointment.status === 'cancelled') {
    return { scheduled: 0, skipped: true }
  }

  // Get doctor preferences
  const { data: prefs } = await supabase
    .from('doctor_reminder_preferences')
    .select('*')
    .eq('doctor_id', appointment.doctor_id)
    .single()

  const defaults = {
    email_enabled: true,
    sms_enabled: false,
    whatsapp_enabled: true,
    reminder_48h: true,
    reminder_24h: true,
    reminder_2h: true,
  }

  const config = prefs || defaults

  const channels: ReminderChannel[] = []
  if (config.email_enabled) channels.push('email')
  if (config.whatsapp_enabled) channels.push('whatsapp')

  const hoursList: number[] = []
  if (config.reminder_48h) hoursList.push(48)
  if (config.reminder_24h) hoursList.push(24)
  if (config.reminder_2h) hoursList.push(2)

  const startTs = new Date(appointment.start_ts)
  const inserts: Array<{
    appointment_id: string
    doctor_id: string
    patient_id: string
    hours_before: number
    channel: ReminderChannel
    scheduled_at: string
  }> = []

  for (const hours of hoursList) {
    for (const channel of channels) {
      const scheduledAt = new Date(startTs.getTime() - hours * 60 * 60 * 1000)
      // Only schedule if it's in the future
      if (scheduledAt > new Date()) {
        inserts.push({
          appointment_id: appointmentId,
          doctor_id: appointment.doctor_id,
          patient_id: appointment.patient_id,
          hours_before: hours,
          channel,
          scheduled_at: scheduledAt.toISOString(),
        })
      }
    }
  }

  if (inserts.length === 0) {
    return { scheduled: 0 }
  }

  // Delete any existing pending reminders for this appointment to avoid duplicates
  await supabase
    .from('appointment_reminder_schedules')
    .delete()
    .eq('appointment_id', appointmentId)
    .eq('status', 'pending')

  const { data, error } = await supabase
    .from('appointment_reminder_schedules')
    .insert(inserts)
    .select('id')

  if (error) {
    console.error('Error scheduling reminders:', error)
    throw new Error(`Failed to schedule reminders: ${error.message}`)
  }

  return { scheduled: data?.length ?? 0 }
}

/**
 * Cancel all pending reminders for an appointment (when cancelled/rescheduled).
 */
export async function cancelAppointmentReminders(appointmentId: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('appointment_reminder_schedules')
    .update({ status: 'skipped', updated_at: new Date().toISOString() })
    .eq('appointment_id', appointmentId)
    .eq('status', 'pending')

  if (error) {
    console.error('Error cancelling reminders:', error)
  }
}

/**
 * Get all pending reminders that are due to be sent now.
 */
export async function getPendingRemindersDue(): Promise<
  Array<{
    id: string
    appointment_id: string
    doctor_id: string
    patient_id: string
    hours_before: number
    channel: ReminderChannel
  }>
> {
  const supabase = createServiceClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('appointment_reminder_schedules')
    .select('id, appointment_id, doctor_id, patient_id, hours_before, channel')
    .eq('status', 'pending')
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(100)

  if (error) {
    console.error('Error fetching pending reminders:', error)
    return []
  }

  return data || []
}

/**
 * Send a single reminder via the specified channel.
 */
export async function sendReminder(reminder: {
  id: string
  appointment_id: string
  doctor_id: string
  patient_id: string
  hours_before: number
  channel: ReminderChannel
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  // Fetch full appointment context
  const { data: apt } = await supabase
    .from('appointments')
    .select(
      `
      id, start_ts, status,
      doctor:doctors(id, specialty),
      doctor_profile:profiles!appointments_doctor_id_fkey(full_name, email),
      patient:profiles!appointments_patient_id_fkey(full_name, email, phone)
    `
    )
    .eq('id', reminder.appointment_id)
    .single()

  if (!apt || apt.status === 'cancelled') {
    await markReminderStatus(reminder.id, 'skipped', 'Appointment cancelled')
    return { success: true }
  }

  const doctorName = (apt.doctor_profile as any)?.full_name || 'Doctor'
  const patientName = (apt.patient as any)?.full_name || 'Paciente'
  const patientEmail = (apt.patient as any)?.email
  const patientPhone = (apt.patient as any)?.phone
  const specialty = (apt.doctor as any)?.specialty || 'Medicina General'

  const tmpl = REMINDER_TEMPLATES[reminder.hours_before]
  const appointmentDate = formatMexicanDateTime(apt.start_ts)

  let success = false
  let errorMsg: string | undefined

  try {
    switch (reminder.channel) {
      case 'email':
        if (!patientEmail) {
          errorMsg = 'No patient email'
          break
        }
        success = await sendReminderEmail({
          to: patientEmail,
          patientName,
          doctorName,
          specialty,
          appointmentDate,
          hoursBefore: reminder.hours_before,
          appointmentId: reminder.appointment_id,
        })
        break

      case 'whatsapp':
        if (!patientPhone) {
          errorMsg = 'No patient phone'
          break
        }
        const waResult = await sendWAReminder(patientPhone, patientName, doctorName, appointmentDate, '',
          `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/app/appointments`
        )
        success = waResult.success
        if (!success) errorMsg = waResult.error
        break

      case 'sms':
        // Placeholder: SMS via Twilio would go here
        errorMsg = 'SMS not yet implemented'
        break
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : 'Unknown error'
    success = false
  }

  await markReminderStatus(
    reminder.id,
    success ? 'sent' : 'failed',
    success ? undefined : errorMsg
  )

  return { success, error: errorMsg }
}

async function markReminderStatus(
  reminderId: string,
  status: ReminderStatus,
  errorMessage?: string
) {
  const supabase = createServiceClient()
  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === 'sent') {
    update.sent_at = new Date().toISOString()
  }
  if (errorMessage) {
    update.error_message = errorMessage
  }

  await supabase.from('appointment_reminder_schedules').update(update).eq('id', reminderId)
}

async function sendReminderEmail({
  to,
  patientName,
  doctorName,
  specialty,
  appointmentDate,
  hoursBefore,
  appointmentId,
}: {
  to: string
  patientName: string
  doctorName: string
  specialty: string
  appointmentDate: string
  hoursBefore: number
  appointmentId: string
}): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'

  const confirmUrl = `${appUrl}/api/reminders/respond?a=${appointmentId}&r=confirm&t=${hoursBefore}`
  const cancelUrl = `${appUrl}/api/reminders/respond?a=${appointmentId}&r=cancel&t=${hoursBefore}`
  const rescheduleUrl = `${appUrl}/app/appointments`

  const urgencyColor = hoursBefore <= 2 ? '#ef4444' : hoursBefore <= 24 ? '#f59e0b' : '#0066cc'
  const urgencyLabel = hoursBefore <= 2 ? 'Muy pronto' : hoursBefore <= 24 ? 'Mañana' : 'Próximamente'

  const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Hola ${patientName}, te recordamos tu cita médica programada.
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <tr>
    <td style="padding: 16px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid ${urgencyColor};">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${urgencyLabel}</p>
      <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">${appointmentDate}</p>
      <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">Dr. ${doctorName} — ${specialty}</p>
    </td>
  </tr>
</table>
<p style="margin: 0 0 16px 0; color: #1f2937; font-size: 15px;">
  <strong>¿Puedes asistir?</strong>
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <tr>
    <td style="padding: 0 8px 0 0; width: 33%;">
      <a href="${confirmUrl}" style="display: block; padding: 12px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 600; font-size: 14px;">✓ Confirmar</a>
    </td>
    <td style="padding: 0 8px; width: 33%;">
      <a href="${rescheduleUrl}" style="display: block; padding: 12px; background-color: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 600; font-size: 14px;">↻ Reagendar</a>
    </td>
    <td style="padding: 0 0 0 8px; width: 33%;">
      <a href="${cancelUrl}" style="display: block; padding: 12px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 600; font-size: 14px;">✕ Cancelar</a>
    </td>
  </tr>
</table>
<p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
  Si necesitas ayuda, responde a este correo o contacta a soporte.
</p>
`

  const html = getEmailTemplate(content, patientName)

  const result = await sendEmail({
    to,
    subject: `Recordatorio: Tu cita con Dr. ${doctorName}`,
    html,
    tags: [
      { name: 'type', value: 'appointment_reminder' },
      { name: 'hoursBefore', value: String(hoursBefore) },
      { name: 'appointmentId', value: appointmentId },
    ],
  })

  return result.success
}

/**
 * Handle patient response to a reminder (confirm/cancel/reschedule).
 */
export async function handleReminderResponse(
  appointmentId: string,
  response: PatientResponse
): Promise<{ success: boolean; message: string }> {
  const supabase = createServiceClient()

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, status, doctor_id, patient_id')
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { success: false, message: 'Cita no encontrada' }
  }

  if (appointment.status === 'cancelled') {
    return { success: false, message: 'Esta cita ya fue cancelada' }
  }

  switch (response) {
    case 'confirm': {
      // Update status to confirmed if it was pending_payment
      if (appointment.status === 'pending_payment') {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('id', appointmentId)

        if (error) {
          return { success: false, message: 'No se pudo confirmar la cita' }
        }
      }
      return { success: true, message: 'Cita confirmada. ¡Te esperamos!' }
    }

    case 'cancel': {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', appointmentId)

      if (error) {
        return { success: false, message: 'No se pudo cancelar la cita' }
      }

      // Cancel all pending reminders
      await cancelAppointmentReminders(appointmentId)

      return { success: true, message: 'Cita cancelada. Puedes reagendar en cualquier momento.' }
    }

    case 'reschedule':
      return {
        success: true,
        message: 'Para reagendar, ingresa a tu panel de citas en Doctor.mx',
        // In a real implementation, this would trigger a reschedule flow
      }

    default:
      return { success: false, message: 'Respuesta no válida' }
  }
}

/**
 * Get reminder statistics for a doctor dashboard.
 */
export async function getDoctorReminderStats(doctorId: string) {
  const supabase = createServiceClient()

  const { data: statsRaw } = await supabase
    .rpc('get_reminder_stats', { p_doctor_id: doctorId })

  // Fallback: if RPC doesn't exist, compute manually
  let stats = statsRaw
  if (!statsRaw) {
    const { data: allReminders } = await supabase
      .from('appointment_reminder_schedules')
      .select('status')
      .eq('doctor_id', doctorId)

    const counts: Record<string, number> = {}
    for (const r of allReminders || []) {
      counts[r.status] = (counts[r.status] || 0) + 1
    }
    stats = Object.entries(counts).map(([status, count]) => ({ status, count }))
  }

  const { data: recent } = await supabase
    .from('appointment_reminder_schedules')
    .select('id, hours_before, channel, status, scheduled_at, sent_at, patient_response, appointment_id')
    .eq('doctor_id', doctorId)
    .order('scheduled_at', { ascending: false })
    .limit(50)

  return {
    stats: stats || [],
    recent: recent || [],
  }
}
