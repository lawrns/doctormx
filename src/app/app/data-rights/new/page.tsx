/**
 * New ARCO Request Page
 *
 * Form for creating a new ARCO request (Access, Rectification, Cancellation, Opposition).
 * Pre-selects request type from query parameter.
 *
 * Route: /app/app/data-rights/new
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewArcoRequestClient } from './new-arco-request-client'

export default async function NewArcoRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/app/data-rights/new')
  }

  const params = await searchParams
  const preselectedType = params.type

  return <NewArcoRequestClient userId={user.id} preselectedType={preselectedType} />
}
