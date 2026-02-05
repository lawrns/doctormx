import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConversationalAIConsultation } from '@/components/soap/ConversationalAIConsultation'

export default async function AIConsultaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/app/orientacion')
  }

  return <ConversationalAIConsultation userId={user.id} />
}
