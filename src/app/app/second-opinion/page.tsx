import { requireRole } from '@/lib/auth'
import { PatientShell } from '@/components/PatientShell'
import SecondOpinionContent from './SecondOpinionContent'

export default async function SecondOpinionPage() {
  const { profile } = await requireRole('patient')
  return (
    <PatientShell profile={{ full_name: profile.full_name }} currentPath="/app/second-opinion">
      <SecondOpinionContent />
    </PatientShell>
  )
}
