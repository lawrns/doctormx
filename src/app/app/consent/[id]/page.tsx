/**
 * Consent Detail Page
 *
 * Shows detailed information about a specific consent record
 * including its history of changes.
 *
 * Route: /app/app/consent/[id]
 */

import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConsentDetailClient } from './ConsentDetailClient'

interface ConsentDetailParams {
  id: string
}

export default async function ConsentDetailPage({
  params,
}: {
  params: Promise<ConsentDetailParams>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/app/consent')
  }

  const { id } = await params

  // Fetch consent status from API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/consent/status`,
    {
      cache: 'no-store',
    }
  )

  const data = await response.json()

  if (!data.success) {
    notFound()
  }

  // Find the specific consent record
  const consentRecord = data.data?.consents?.find(
    (c: { id: string }) => c.id === id
  )

  if (!consentRecord) {
    notFound()
  }

  // Fetch history for this consent
  const historyResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/consent/history?consent_type=${consentRecord.consent_type}`,
    {
      cache: 'no-store',
    }
  )

  const historyData = await historyResponse.json()

  return (
    <ConsentDetailClient
      consentRecord={consentRecord}
      userId={user.id}
      history={historyData.data?.history ?? []}
      allConsents={data.data?.consents ?? []}
      pendingConsents={data.data?.pending_consents ?? []}
    />
  )
}
