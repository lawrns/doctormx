import { requireRole } from '@/lib/auth'
import { getDoctorRecordByUserId, getDoctorOperationalRecordId } from '@/lib/doctor-record'
import { notFound } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import ConsultationClient from './consultation-client'

export default async function DoctorConsultationPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params
  const { user, profile, supabase } = await requireRole('doctor')
  const doctor = await getDoctorRecordByUserId(user.id)
  const doctorRecordId = getDoctorOperationalRecordId(doctor, user.id)
  const isPending = doctor?.status === 'pending' || doctor?.status === 'rejected'

  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      start_ts,
      end_ts,
      status,
      appointment_type,
      video_status,
      consultation_notes,
      patient:profiles!appointments_patient_id_fkey(full_name, photo_url, email)
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

  let intakeResponse = null
  try {
    const { data: existingIntake } = await supabase
      .from('patient_intake_responses')
      .select('responses_json')
      .eq('appointment_id', appointmentId)
      .eq('doctor_id', doctorRecordId)
      .maybeSingle()
    if (existingIntake) intakeResponse = existingIntake
  } catch {
    // Intake form is optional
  }

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/appointments" doctorId={user.id}>
      <ConsultationClient
        appointment={appointment as any}
        appointmentId={appointmentId}
        soapNote={soapNote}
        intakeResponse={intakeResponse}
      />
    </DoctorLayout>
  )
}
