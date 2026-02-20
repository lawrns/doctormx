import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendFollowUp } from '@/lib/notifications'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { appointmentId, followUpNotes } = await request.json()

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

    const result = await sendFollowUp(
      appointmentId,
      profile.email,
      profile.full_name ?? 'Paciente',
      followUpNotes
    )

    if (!result.success) {
      logger.error('Failed to send follow-up:', { err: result.error })
      return NextResponse.json(
        { error: 'Failed to send follow-up email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error sending follow-up:', { err: error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
