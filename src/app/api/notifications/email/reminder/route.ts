import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendConsultationReminder } from '@/lib/notifications'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { appointmentId } = await request.json()

  if (!appointmentId) {
    return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 })
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    if (!profile?.email) {
      return NextResponse.json({ error: 'No email found for user' }, { status: 400 })
    }

    const result = await sendConsultationReminder(
      appointmentId,
      profile.email,
      profile.full_name ?? 'Paciente'
    )

    if (!result.success) {
      logger.error('Failed to send consultation reminder:', { err: result.error })
      return NextResponse.json(
        { error: 'Failed to send reminder email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error sending consultation reminder:', { err: error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
