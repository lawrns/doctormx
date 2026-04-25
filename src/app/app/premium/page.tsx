import { requireRole } from '@/lib/auth'
import { PatientShell } from '@/components/PatientShell'
import PremiumContent from './PremiumContent'

export default async function PremiumPage() {
  const { profile } = await requireRole('patient')
  return (
    <PatientShell profile={{ full_name: profile.full_name }} currentPath="/app/premium">
      <PremiumContent />
    </PatientShell>
  )
}
