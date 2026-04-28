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

  // Parallelize auth check + landing data fetch — both can run independently
  const [authResult, landingResult] = await Promise.allSettled([
    createClient().then(sb => sb.auth.getUser()),
    getPublicLandingData(),
  ])

  const user = authResult.status === 'fulfilled' ? authResult.value.data.user : null
  const landingData = landingResult.status === 'fulfilled' ? landingResult.value : null

  if (user) {
    try {
      const supabase = await createClient()
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
    } catch {
      // Fall through to landing page if profile fetch fails
    }
  }

  return <LandingPageClient trustData={landingData} />
}
