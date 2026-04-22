import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date().toISOString()

  const { data: expiredSubscriptions, error } = await supabase
    .from('doctor_subscriptions')
    .select('doctor_id, stripe_subscription_id, grace_period_ends_at')
    .eq('status', 'past_due')
    .not('grace_period_ends_at', 'is', null)
    .lt('grace_period_ends_at', now)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch past due subscriptions', details: error.message },
      { status: 500 }
    )
  }

  const doctorIds = Array.from(new Set((expiredSubscriptions || []).map((sub) => sub.doctor_id).filter(Boolean)))

  if (doctorIds.length > 0) {
    const { error: updateError } = await supabase
      .from('doctors')
      .update({
        is_listed: false,
        updated_at: now,
      })
      .in('id', doctorIds)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to hide past due doctors', details: updateError.message },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    success: true,
    processed: expiredSubscriptions?.length || 0,
    hiddenDoctors: doctorIds.length,
    timestamp: now,
  })
}
