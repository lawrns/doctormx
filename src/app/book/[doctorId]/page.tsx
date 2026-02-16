import { redirect } from 'next/navigation'
import { getDoctorProfile } from '@/lib/discovery'
import BookingForm, { type DoctorProfile } from './BookingForm'
import { createClient } from '@/lib/supabase/server'

export default async function BookAppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ doctorId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { doctorId } = await params
  const search = await searchParams

  // Get current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If not authenticated, redirect to login with return URL
  if (!user) {
    const loginUrl = new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    loginUrl.searchParams.set('redirect', `/book/${doctorId}`)

    // Preserve any query parameters (like date/time selection)
    if (search && Object.keys(search).length > 0) {
      loginUrl.searchParams.set('state', JSON.stringify(search))
    }

    redirect(loginUrl.toString())
  }

  // Get doctor profile
  const doctorProfile = await getDoctorProfile(doctorId)

  if (!doctorProfile || typeof doctorProfile !== 'object' || !('id' in doctorProfile)) {
    redirect('/doctores')
  }

  // Get current user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Type assertion is safe here because we validated doctorProfile above
  // The validation ensures it's an object with an 'id' property
  return <BookingForm doctor={doctorProfile as DoctorProfile} currentUser={profile || undefined} />
}
