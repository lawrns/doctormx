import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OnboardingForm from './OnboardingForm'

export default async function DoctorOnboarding() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user.id)
    .single()

  // Solo redirigir si está aprobado (para testing permitimos re-editar pending)
  if (doctor?.status === 'approved') {
    redirect('/doctor')
  }

  // Permitir editar siempre (testing mode)
  return <OnboardingForm doctor={doctor} profile={profile} />
}

