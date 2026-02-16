import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNavigation from '@/components/app/AppNavigation'
import { ConversationalAIConsultation } from '@/components/soap/ConversationalAIConsultation'

export default async function AIConsultaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/app/ai-consulta')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation currentPage="/app/ai-consulta" />
      <ConversationalAIConsultation userId={user.id} />
    </div>
  )
}
