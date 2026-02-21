import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scheduleFollowUp, type FollowUpType } from '@/lib/followup'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await request.json()
  const { appointmentId, type, scheduledAt } = body

  if (!appointmentId || !type) {
    return NextResponse.json(
      { error: 'Missing required fields: appointmentId and type' },
      { status: 400 }
    )
  }

  const validTypes: FollowUpType[] = [
    'follow_up_24h',
    'follow_up_7d',
    'medication_reminder',
    'prescription_refill',
    'chronic_care_check',
  ]

  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: 'Invalid follow-up type' },
      { status: 400 }
    )
  }

  try {
    const result = await scheduleFollowUp({
      appointmentId,
      type,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      followUpId: result.followUpId,
    })
  } catch (error) {
    logger.error('Error scheduling follow-up:', { err: error })
    return NextResponse.json(
      { error: 'Failed to schedule follow-up' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const appointmentId = searchParams.get('appointmentId')
  const status = searchParams.get('status')

  let query = supabase
    .from('followups')
    .select('*')
    .eq('patient_id', user.id)

  if (appointmentId) {
    query = query.eq('appointment_id', appointmentId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('scheduled_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ followUps: data || [] })
}
