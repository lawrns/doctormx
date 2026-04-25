import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDoctorProfile } from '@/lib/discovery'
import BookingForm from './BookingForm'

export default async function BookAppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ doctorId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { doctorId } = await params
  await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const doctorProfile = await getDoctorProfile(doctorId)
  if (!doctorProfile) {
    redirect('/doctors')
  }

  const currentUser = user
    ? await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }: { data: Record<string, unknown> | null }) => data || null)
    : null

  return <BookingForm doctor={doctorProfile} currentUser={currentUser} />
}
