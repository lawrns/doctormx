import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AIConsultaClient } from '../orientacion/ai-consulta-client'

export default async function SecondOpinionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/app/second-opinion')
  }

  return <AIConsultaClient userId={user.id} />
}
