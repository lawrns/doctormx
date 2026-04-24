import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ALLOWED_STATUSES = ['pending', 'approved', 'rejected', 'answered', 'closed']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const status = String(body.status || '')

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const admin = createServiceClient()
  const { data, error } = await admin
    .from('expert_questions')
    .update({ status })
    .eq('id', id)
    .select('id, status')
    .single()

  if (error) {
    console.error('Error updating expert question:', error)
    return NextResponse.json({ error: 'Error updating question' }, { status: 500 })
  }

  return NextResponse.json({ question: data })
}
