/**
 * New Consent Page
 *
 * Form for granting new consent.
 * Uses ConsentModal component for the consent interface.
 *
 * Route: /app/app/consent/new
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewConsentClient } from './new-consent-client'

export default async function NewConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/app/consent/new')
  }

  const params = await searchParams
  const preselectedType = params.type

  return <NewConsentClient userId={user.id} preselectedType={preselectedType} />
}
