import { requireRole } from '@/lib/auth'
import { AIMetricsClient } from './AIMetricsClient'

export default async function DoctorAIMetricsPage() {
  // Server-side auth check
  const { user } = await requireRole('doctor')

  // Return client component for interactivity
  return <AIMetricsClient />
}
