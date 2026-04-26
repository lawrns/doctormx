import { requireRole } from '@/lib/auth'
import AppointmentsClient from './AppointmentsClient'

export default async function AppointmentsPage() {
  const { user, profile } = await requireRole('patient')

  return <AppointmentsClient />
}
