import { createServiceClient } from '@/lib/supabase/server'
import { expireStalePendingPaymentAppointments } from '@/lib/appointment-expiry'

export type PatientAppointmentContext = {
  id: string
  patientId: string
  doctorId: string
  startTs: string
  endTs: string
  status: string
  appointmentType: 'video' | 'in_person' | null
  videoStatus: string | null
  videoRoomUrl: string | null
  cancellationReason: string | null
  reasonForVisit: string | null
  notes: string | null
  createdAt: string | null
  doctor: {
    id: string
    name: string
    photoUrl: string | null
    specialty: string | null
    licenseNumber: string | null
    city: string | null
    state: string | null
    officeAddress: string | null
    priceCents: number
    currency: string
  }
  payment: {
    id: string
    amountCents: number
    currency: string
    status: string
    provider: string | null
    providerRef: string | null
  } | null
  hold: {
    expiresAt: string | null
    status: string | null
    expired: boolean
  } | null
  clinicalSummary: {
    patientSummary: string | null
    sentToPatientAt: string | null
    approvedAt: string | null
  } | null
  canCancel: boolean
  canJoinVideo: boolean
}

type AppointmentRow = {
  id: string
  patient_id: string
  doctor_id: string
  start_ts: string
  end_ts: string
  status: string
  appointment_type: 'video' | 'in_person' | null
  video_status: string | null
  video_room_url: string | null
  cancellation_reason: string | null
  reason_for_visit: string | null
  notes: string | null
  created_at: string | null
}

export async function getPatientAppointmentContext(
  appointmentId: string,
  patientId: string
): Promise<PatientAppointmentContext | null> {
  await expireStalePendingPaymentAppointments({ appointmentId })

  const supabase = createServiceClient()

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      doctor_id,
      start_ts,
      end_ts,
      status,
      appointment_type,
      video_status,
      video_room_url,
      cancellation_reason,
      reason_for_visit,
      notes,
      created_at
    `)
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .single()

  if (appointmentError || !appointment) return null

  const appointmentRow = appointment as AppointmentRow

  const [{ data: doctor }, { data: profile }, { data: payment }, { data: hold }, { data: soapNote }] = await Promise.all([
    supabase
      .from('doctors')
      .select('id, specialty, license_number, city, state, office_address, price_cents, currency')
      .eq('id', appointmentRow.doctor_id)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('id, full_name, photo_url')
      .eq('id', appointmentRow.doctor_id)
      .maybeSingle(),
    supabase
      .from('payments')
      .select('id, amount_cents, currency, status, provider, provider_ref')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('appointment_holds')
      .select('expires_at, status')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('soap_notes')
      .select('patient_summary, sent_to_patient_at, approved_at')
      .eq('appointment_id', appointmentId)
      .eq('patient_id', patientId)
      .eq('status', 'approved')
      .maybeSingle(),
  ])

  const now = Date.now()
  const startMs = new Date(appointmentRow.start_ts).getTime()
  const endMs = new Date(appointmentRow.end_ts).getTime()
  const videoWindowOpen = now >= startMs - 15 * 60 * 1000 && now <= endMs

  return {
    id: appointmentRow.id,
    patientId: appointmentRow.patient_id,
    doctorId: appointmentRow.doctor_id,
    startTs: appointmentRow.start_ts,
    endTs: appointmentRow.end_ts,
    status: appointmentRow.status,
    appointmentType: appointmentRow.appointment_type,
    videoStatus: appointmentRow.video_status,
    videoRoomUrl: appointmentRow.video_room_url,
    cancellationReason: appointmentRow.cancellation_reason,
    reasonForVisit: appointmentRow.reason_for_visit,
    notes: appointmentRow.notes,
    createdAt: appointmentRow.created_at,
    doctor: {
      id: appointmentRow.doctor_id,
      name: profile?.full_name || 'Médico verificado',
      photoUrl: profile?.photo_url || null,
      specialty: doctor?.specialty || null,
      licenseNumber: doctor?.license_number || null,
      city: doctor?.city || null,
      state: doctor?.state || null,
      officeAddress: doctor?.office_address || null,
      priceCents: doctor?.price_cents || 0,
      currency: doctor?.currency || 'MXN',
    },
    payment: payment
      ? {
          id: payment.id,
          amountCents: payment.amount_cents,
          currency: payment.currency,
          status: payment.status,
          provider: payment.provider,
          providerRef: payment.provider_ref,
        }
      : null,
    hold: hold
      ? {
          expiresAt: hold.expires_at,
          status: hold.status,
          expired: hold.expires_at ? new Date(hold.expires_at).getTime() <= now : false,
        }
      : null,
    clinicalSummary: soapNote
      ? {
          patientSummary: soapNote.patient_summary || null,
          sentToPatientAt: soapNote.sent_to_patient_at || null,
          approvedAt: soapNote.approved_at || null,
        }
      : null,
    canCancel: ['pending_payment', 'confirmed'].includes(appointmentRow.status) && startMs > now,
    canJoinVideo:
      appointmentRow.status === 'confirmed' &&
      appointmentRow.appointment_type === 'video' &&
      videoWindowOpen &&
      Boolean(appointmentRow.video_room_url || ['ready', 'in_progress'].includes(appointmentRow.video_status || '')),
  }
}
