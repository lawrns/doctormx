import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getDoctorProfile } from '@/lib/discovery'
import BookingForm from './BookingForm'
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
    const reqHeaders = await headers()
    const host = reqHeaders.get('host') || 'doctor.mx'
    const protocol = reqHeaders.get('x-forwarded-proto') || 'https'
    const baseUrl = `${protocol}://${host}`

    const loginUrl = new URL('/auth/login', baseUrl)
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
    redirect('/doctors')
  }

  // Get current user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <BookingForm doctor={doctorProfile as any} currentUser={profile || undefined} />
}
