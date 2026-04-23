import { cache } from '@/lib/cache'
import { createServiceClient } from '@/lib/supabase/server'

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
        console.warn('Failed to invalidate availability after stale hold cleanup:', error)
      })
    )
  )

  return { expiredCount: pendingIds.length }
}
