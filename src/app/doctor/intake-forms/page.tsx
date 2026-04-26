import { requireRole } from '@/lib/auth'
import { getDoctorRecordByUserId } from '@/lib/doctor-record'
import DoctorLayout from '@/components/DoctorLayout'
import IntakeFormsClient from './intake-forms-client'

export default async function DoctorIntakeFormsPage() {
  const { user, profile } = await requireRole('doctor')
  const doctor = await getDoctorRecordByUserId(user.id)
  const isPending = doctor?.status === 'pending' || doctor?.status === 'rejected'

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/intake-forms" doctorId={user.id}>
      <IntakeFormsClient />
    </DoctorLayout>
  )
}
