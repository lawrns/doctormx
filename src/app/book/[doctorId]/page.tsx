import { redirect } from 'next/navigation'
import { getDoctorProfile } from '@/lib/discovery'
import BookingForm from './BookingForm'
import { createClient } from '@/lib/supabase/server'

export default async function BookAppointmentPage({
  params,
}: {
  params: Promise<{ doctorId: string }>
}) {
  const { doctorId } = await params

  // Obtener doctor (sin auth - slots públicos)
  const doctor = await getDoctorProfile(doctorId)

  if (!doctor) {
    redirect('/doctors')
  }

  // Obtener usuario actual (puede ser null)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentUser = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    currentUser = profile
  }

  return <BookingForm doctor={doctor} currentUser={currentUser} />
}
