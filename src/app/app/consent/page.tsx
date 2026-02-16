/**
 * Consent Management Page
 *
 * Displays all user consents with history and provides navigation
 * to grant new consents or view specific consent details.
 *
 * Route: /app/app/consent
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConsentManagementClient } from './consent-client'

interface ConsentHistoryResponse {
  success: boolean
  data?: {
    history: Array<{
      id: string
      consent_record_id: string
      consent_type: string
      consent_type_label: string
      action: string
      old_status: string | null
      new_status: string
      old_consent_version_id: string | null
      new_consent_version_id: string
      changed_by: string
      changed_by_role: string
      change_reason: string | null
      ip_address: string | null
      created_at: string
    }>
    statistics: {
      total_entries: number
      by_action: Record<string, number>
      by_consent_type: Record<string, number>
    }
    user_id: string
    exported_at: string
  }
}

export default async function ConsentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/app/consent')
  }

  // Fetch consent history from API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/consent/history`,
    {
      cache: 'no-store',
      headers: {
        Cookie: (await supabase.auth.getSession()).data.session?.access_token ?? '',
      },
    }
  )

  const historyData: ConsentHistoryResponse | null = await response.json()

  return (
    <ConsentManagementClient
      userId={user.id}
      initialHistory={historyData?.data?.history ?? []}
      initialStatistics={historyData?.data?.statistics}
    />
  )
}
