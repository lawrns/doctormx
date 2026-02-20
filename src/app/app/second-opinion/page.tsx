import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNavigation from '@/components/app/AppNavigation'
import { AIConsultaClient } from '../ai-consulta/AiConsultaClient'

export default async function SecondOpinionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/app/second-opinion')
  }

  return <AIConsultaClient userId={user.id} />
}
