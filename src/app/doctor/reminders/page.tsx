import { requireRole } from '@/lib/auth'
import { getDoctorRecordByUserId } from '@/lib/doctor-record'
import DoctorLayout from '@/components/DoctorLayout'
import RemindersClient from './reminders-client'

export default async function DoctorRemindersPage() {
  const { user, profile } = await requireRole('doctor')
  const doctor = await getDoctorRecordByUserId(user.id)
  const isPending = doctor?.status === 'pending' || doctor?.status === 'rejected'

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/reminders" doctorId={user.id}>
      <RemindersClient />
    </DoctorLayout>
  )
}
