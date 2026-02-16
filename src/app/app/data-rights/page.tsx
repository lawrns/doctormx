/**
 * ARCO Rights Management Page
 *
 * Central hub for exercising ARCO rights (Access, Rectification, Cancellation, Opposition).
 * Displays user's requests and provides navigation to create new ones.
 *
 * Route: /app/app/data-rights
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DataRightsClient } from './data-rights-client'

interface ArcoRequestsResponse {
  success: boolean
  data?: {
    requests: Array<{
      id: string
      request_type: 'ACCESS' | 'RECTIFY' | 'CANCEL' | 'OPPOSE'
      title: string
      description: string
      status: string
      created_at: string
      due_date: string
      priority: string
      data_scope: string[]
    }>
    count: number
  }
}

export default async function DataRightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/app/data-rights')
  }

  // Fetch ARCO requests from API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/arco/requests`,
    {
      cache: 'no-store',
      headers: {
        Cookie: (await supabase.auth.getSession()).data.session?.access_token ?? '',
      },
    }
  )

  const requestsData: ArcoRequestsResponse | null = await response.json()

  // Fetch stats
  const statsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/arco/stats`,
    {
      cache: 'no-store',
      headers: {
        Cookie: (await supabase.auth.getSession()).data.session?.access_token ?? '',
      },
    }
  )

  const statsData = await statsResponse.json()

  return (
    <DataRightsClient
      userId={user.id}
      initialRequests={requestsData?.data?.requests ?? []}
      initialCount={requestsData?.data?.count ?? 0}
      initialStats={statsData}
    />
  )
}
