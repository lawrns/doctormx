import { requireRole } from '@/lib/auth'
import { PatientShell } from '@/components/PatientShell'
import ReferralsContent from './ReferralsContent'

export default async function ReferralsPage() {
  const { profile } = await requireRole('patient')
  return (
    <PatientShell profile={{ full_name: profile.full_name }} currentPath="/app/referrals">
      <ReferralsContent />
    </PatientShell>
  )
}
