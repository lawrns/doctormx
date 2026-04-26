import { requireRole } from '@/lib/auth'
import { notFound } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import PrescriptionPageClient from './prescription-form'

export default async function PrescriptionPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = await params
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, status')
    .eq('id', user.id)
    .single()

  const isPending = !doctor || doctor.status !== 'approved'
  const doctorId = doctor?.id || ''

  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:profiles!appointments_patient_id_fkey (full_name, phone, date_of_birth, email)
    `)
    .eq('id', appointmentId)
    .eq('doctor_id', user.id)
    .eq('status', 'confirmed')
    .single()

  if (!appointment) {
    notFound()
  }

  const { data: existingPrescription } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('appointment_id', appointmentId)
    .single()

  const patient = Array.isArray(appointment.patient) ? appointment.patient[0] : appointment.patient

  return (
    <DoctorLayout profile={profile} isPending={isPending} currentPath="/doctor/prescriptions" doctorId={doctorId}>
      <PrescriptionPageClient
        appointment={{
          id: appointment.id,
          start_ts: appointment.start_ts,
          end_ts: appointment.end_ts,
          status: appointment.status,
          patient: {
            full_name: patient?.full_name || 'Paciente',
            date_of_birth: patient?.date_of_birth,
            phone: patient?.phone,
            email: patient?.email,
          },
        }}
        existingPrescription={existingPrescription ? {
          id: existingPrescription.id,
          diagnosis: existingPrescription.diagnosis,
          medications: existingPrescription.medications,
          instructions: existingPrescription.instructions,
        } : null}
      />
    </DoctorLayout>
  )
}
