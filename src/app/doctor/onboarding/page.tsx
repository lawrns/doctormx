import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OnboardingForm from './OnboardingForm'
import { checkSubscriptionStatus } from '@/lib/subscription'

export default async function DoctorOnboarding() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user.id)
    .single()

  if (doctor?.status === 'approved') {
    const subscriptionStatus = await checkSubscriptionStatus(user.id)

    if (!subscriptionStatus.isActive) {
      redirect('/doctor/subscription?required=true')
    }

    redirect('/doctor')
  }

  return <OnboardingForm doctor={doctor} profile={profile} />
}

