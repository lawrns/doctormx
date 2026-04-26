import { requireRole } from '@/lib/auth'
import { notFound } from 'next/navigation'
import PatientIntakeClient from './PatientIntakeClient'

interface PageProps {
  params: Promise<{ appointmentId: string }>
}

export default async function PatientIntakePage({ params }: PageProps) {
  const { user, profile, supabase } = await requireRole('patient')
  const { appointmentId } = await params

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, patient_id')
    .eq('id', appointmentId)
    .eq('patient_id', user.id)
    .single()

  if (!appointment) {
    notFound()
  }

  return <PatientIntakeClient appointmentId={appointmentId} />
}
