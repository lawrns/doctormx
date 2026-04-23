import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LandingPageClient } from '@/components/landing'
import { getPublicLandingData } from '@/lib/public-trust'

export default async function Home() {
  const hasSupabaseEnv =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasSupabaseEnv) {
    return <LandingPageClient />
  }

  try {
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
  } catch {
    return <LandingPageClient />
  }

  const landingData = await getPublicLandingData().catch(() => null)

  return <LandingPageClient trustData={landingData} />
}
