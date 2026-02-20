import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNavigation from '@/components/app/AppNavigation'
import { DynamicAuthenticatedConsulta } from '@/components/ai-consulta/DynamicAuthenticatedConsulta'

/**
 * Authenticated AI Consultation Page
 * 
 * PERF-004: Uses dynamic import for the heavy AI consultation component
 * The ConversationalAIConsultation component is lazy-loaded with a skeleton fallback
 * This reduces initial JS bundle by ~120KB
 */
export default async function AIConsultaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/app/ai-consulta')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation currentPage="/app/ai-consulta" />
      <DynamicAuthenticatedConsulta userId={user.id} />
    </div>
  )
}
