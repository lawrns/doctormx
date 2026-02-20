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
import { DataRightsClient } from './DataRightsClient'
import { logger } from '@/lib/observability/logger'

const DEFAULT_TIMEOUT = 30000 // 30 seconds

/**
 * Fetch with timeout for server-side requests
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    
    throw error
  }
}

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

  // Fetch ARCO requests from API with timeout
  let requestsData: ArcoRequestsResponse | null = null
  let statsData = null
  
  try {
    const response = await fetchWithTimeout(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/arco/requests`,
      {
        cache: 'no-store',
        headers: {
          Cookie: (await supabase.auth.getSession()).data.session?.access_token ?? '',
        },
      }
    )
    requestsData = await response.json()
  } catch (error) {
    logger.error('Error fetching ARCO requests', { 
      error: error instanceof Error ? error.message : String(error),
      component: 'DataRightsPage'
    })
    // Return empty data on timeout/error - component handles empty state
    requestsData = { success: false }
  }

  // Fetch stats with timeout
  try {
    const statsResponse = await fetchWithTimeout(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/arco/stats`,
      {
        cache: 'no-store',
        headers: {
          Cookie: (await supabase.auth.getSession()).data.session?.access_token ?? '',
        },
      }
    )
    statsData = await statsResponse.json()
  } catch (error) {
    logger.error('Error fetching ARCO stats', { 
      error: error instanceof Error ? error.message : String(error),
      component: 'DataRightsPage'
    })
    // Return empty stats on timeout/error
    statsData = { success: false }
  }

  return (
    <DataRightsClient
      userId={user.id}
      initialRequests={requestsData?.data?.requests ?? []}
      initialCount={requestsData?.data?.count ?? 0}
      initialStats={statsData}
    />
  )
}
