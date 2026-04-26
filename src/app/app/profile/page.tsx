import { requireRole } from '@/lib/auth'
import PatientProfileClient from './PatientProfileClient'

export default async function PatientProfilePage() {
  const { user, profile } = await requireRole('patient')

  return <PatientProfileClient />
}
