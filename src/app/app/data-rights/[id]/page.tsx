/**
 * ARCO Request Detail Page
 *
 * Shows detailed information about a specific ARCO request
 * including its history, status, and available actions.
 *
 * Route: /app/app/data-rights/[id]
 */

import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArcoRequestDetailClient } from './ArcoRequestDetailClient'

interface ArcoRequestResponse {
  success: boolean
  data?: {
    request: {
      id: string
      request_type: 'ACCESS' | 'RECTIFY' | 'CANCEL' | 'OPPOSE'
      title: string
      description: string
      status: string
      priority: string
      data_scope: string[]
      specific_records: string[] | null
      justification: string | null
      created_at: string
      due_date: string
      completed_at: string | null
      response_message: string | null
      resolution_summary: string | null
    }
    history: Array<{
      id: string
      status: string
      status_changed_at: string
      changed_by: string
      notes: string | null
      attachment_url: string | null
    }>
  }
}

export default async function ArcoRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/app/data-rights')
  }

  const { id } = await params

  // Fetch request details from API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/arco/requests/${id}`,
    {
      cache: 'no-store',
      headers: {
        Cookie: (await supabase.auth.getSession()).data.session?.access_token ?? '',
      },
    }
  )

  const data: ArcoRequestResponse | null = await response.json()

  if (!data?.success || !data?.data?.request) {
    notFound()
  }

  return (
    <ArcoRequestDetailClient
      userId={user.id}
      request={data.data.request}
      history={data.data.history}
    />
  )
}
