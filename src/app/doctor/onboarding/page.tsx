import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OnboardingForm from './OnboardingForm'
import { checkSubscriptionStatus } from '@/lib/subscription'
import { getTrialStatus } from '@/lib/trials'

export default async function DoctorOnboarding() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user.id)
    .single()

  if (doctor?.status === 'approved') {
    const subscriptionStatus = await checkSubscriptionStatus(user.id)

    if (subscriptionStatus.isActive) {
      redirect('/doctor')
    }

    // Check if doctor has an active trial
    const trialStatus = await getTrialStatus(user.id)
    if (trialStatus.isInTrial) {
      redirect('/doctor')
    }

    redirect('/doctor/subscription?required=true')
  }

  return <OnboardingForm doctor={doctor} profile={profile} />
}
