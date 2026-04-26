import { requireRole } from '@/lib/auth'
import { getDoctorRecordByUserId, getDoctorOperationalRecordId } from '@/lib/doctor-record'
import { notFound } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import ConsultationReviewClient from './review-client'

export default async function ConsultationReviewPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params
  const { user, profile, supabase } = await requireRole('doctor')
  const doctor = await getDoctorRecordByUserId(user.id)
  const doctorRecordId = getDoctorOperationalRecordId(doctor, user.id)
  const isPending = doctor?.status === 'pending' || doctor?.status === 'rejected'

  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      id,
      start_ts,
      status,
      appointment_type,
      patient:profiles!appointments_patient_id_fkey(full_name)
    `)
    .eq('id', appointmentId)
    .eq('doctor_id', doctorRecordId)
    .single()

  if (!appointment) {
    notFound()
  }

  let soapNote = null
  try {
    const { data: existingSoap } = await supabase
      .from('soap_notes')
      .select('*')
      .eq('appointment_id', appointmentId)
      .eq('doctor_id', doctorRecordId)
      .maybeSingle()
    if (existingSoap) soapNote = existingSoap
  } catch {
    // SOAP note is optional
  }

  const appointmentData = {
    id: appointment.id,
    patient_name:
      ((appointment.patient as unknown as { full_name: string } | null)?.full_name) ||
      'Paciente',
    start_ts: appointment.start_ts,
    status: appointment.status,
    appointment_type: appointment.appointment_type || 'in_person',
  }

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/appointments" doctorId={user.id}>
      <ConsultationReviewClient
        appointment={appointmentData}
        appointmentId={appointmentId}
        soapNote={soapNote as any}
      />
    </DoctorLayout>
  )
}
