import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import ProfileForm from './ProfileForm'

export default async function DoctorProfilePage() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!doctor) {
    redirect('/doctor/onboarding')
  }

  const isPending = doctor.status === 'pending' || doctor.status === 'rejected'

  let completedCount = 0
  if (!isPending) {
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .eq('status', 'completed')

    completedCount = count || 0
  }

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/profile">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Mi perfil</h2>
        <p className="text-muted-foreground mb-6 lg:mb-8">Información profesional y datos de contacto</p>
        <ProfileForm user={user} profile={profile!} doctor={doctor} completedCount={completedCount} isPending={isPending} />
      </div>
    </DoctorLayout>
  )
}
