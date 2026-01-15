import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LandingPageClient } from '@/components/landing'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'doctor') {
      redirect('/doctor')
    } else if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/app')
    }
  }

  return <LandingPageClient />
}
