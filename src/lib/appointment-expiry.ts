import { cache } from '@/lib/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { captureError } from '@/lib/utils'

export type ExpireStalePendingPaymentOptions = {
  doctorId?: string
  appointmentId?: string
}

export type ExpireStalePendingPaymentResult = {
  expiredCount: number
}

type StaleHold = {
  id: string
  appointment_id: string | null
  doctor_id: string | null
}

type PendingAppointment = {
  id: string
  doctor_id: string | null
}

export async function expireStalePendingPaymentAppointments(
  options: ExpireStalePendingPaymentOptions = {}
): Promise<ExpireStalePendingPaymentResult> {
  const supabase = createServiceClient()
  const nowIso = new Date().toISOString()

  let holdQuery = supabase
    .from('appointment_holds')
    .select('id, appointment_id, doctor_id')
    .eq('status', 'converted')
    .not('appointment_id', 'is', null)

  if (options.doctorId) {
    holdQuery = holdQuery.eq('doctor_id', options.doctorId)
  }

  if (options.appointmentId) {
    holdQuery = holdQuery.eq('appointment_id', options.appointmentId)
  }

  const { data: staleHolds, error: holdError } = await holdQuery.lt('expires_at', nowIso)

  if (holdError) {
    throw new Error(`No fue posible limpiar reservas vencidas: ${holdError.message}`)
  }

  const holds = (staleHolds || []) as StaleHold[]
  const appointmentIds = [...new Set(holds.map((hold) => hold.appointment_id).filter(Boolean))] as string[]

  if (appointmentIds.length === 0) {
    return { expiredCount: 0 }
  }

  const { data: pendingAppointments, error: appointmentSelectError } = await supabase
    .from('appointments')
    .select('id, doctor_id')
    .in('id', appointmentIds)
    .eq('status', 'pending_payment')

  if (appointmentSelectError) {
    throw new Error(`No fue posible consultar citas vencidas: ${appointmentSelectError.message}`)
  }

  const appointments = (pendingAppointments || []) as PendingAppointment[]
  const pendingIds = appointments.map((appointment) => appointment.id)

  if (pendingIds.length === 0) {
    return { expiredCount: 0 }
  }

  const { error: appointmentUpdateError } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancellation_reason: 'Payment window expired',
      cancelled_at: nowIso,
      updated_at: nowIso,
    })
    .in('id', pendingIds)
    .eq('status', 'pending_payment')

  if (appointmentUpdateError) {
    throw new Error(`No fue posible cancelar citas vencidas: ${appointmentUpdateError.message}`)
  }

  const holdIds = holds
    .filter((hold) => hold.appointment_id && pendingIds.includes(hold.appointment_id))
    .map((hold) => hold.id)

  if (holdIds.length > 0) {
    const { error: holdUpdateError } = await supabase
      .from('appointment_holds')
      .update({
        status: 'expired',
        updated_at: nowIso,
      })
      .in('id', holdIds)

    if (holdUpdateError) {
      throw new Error(`No fue posible liberar reservas vencidas: ${holdUpdateError.message}`)
    }
  }

  const doctorIds = [
    ...new Set([
      ...appointments.map((appointment) => appointment.doctor_id).filter(Boolean),
      ...holds.map((hold) => hold.doctor_id).filter(Boolean),
    ]),
  ] as string[]

  await Promise.all(
    doctorIds.map((doctorId) =>
      cache.invalidateAvailability(doctorId).catch((error) => {
        captureError(error, 'appointmentExpiry.invalidateAvailability')
      })
    )
  )

  // Schedule abandoned booking recovery sequences
  try {
    const { sendAbandonedBooking15m, sendAbandonedBooking24h } = await import('./whatsapp-notifications')

    for (const appointment of appointments) {
      // Get patient phone + name
      const { data: patientData } = await supabase
        .from('appointments')
        .select('patient_id, start_ts, doctor_id')
        .eq('id', appointment.id)
        .single()

      if (!patientData?.patient_id) continue

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', patientData.patient_id)
        .single()

      const { data: doctorData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', patientData.doctor_id ?? '')
        .single()

      const phone = profile?.phone
      if (!phone) continue

      const patientName = profile?.full_name?.split(' ')[0] || ''
      const doctorName = doctorData?.full_name || ''
      const apptDate = patientData?.start_ts
        ? new Date(patientData.start_ts).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
        : ''
      const apptTime = patientData?.start_ts
        ? new Date(patientData.start_ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        : ''
      const checkoutLink = `https://doctor.mx/checkout/${appointment.id}`
      const doctorsLink = `https://doctor.mx/doctors`

      // Send 15-min recovery (immediate, since we're already past expiry)
      // Fire-and-forget: notification failure should not block expiry
      sendAbandonedBooking15m(phone, patientName, doctorName, apptDate, apptTime, checkoutLink).catch(() => {})

      // Schedule 24h recovery with a setTimeout (fire-and-forget)
      // Fire-and-forget: notification failure should not block expiry
      setTimeout(() => {
        sendAbandonedBooking24h(phone, patientName, doctorName, doctorsLink).catch(() => {})
      }, 24 * 60 * 60 * 1000)
    }
  } catch {
    // Non-critical — don't fail expiry if recovery scheduling fails
  }

  return { expiredCount: pendingIds.length }
}
