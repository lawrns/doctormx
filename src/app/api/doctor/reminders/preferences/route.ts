import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { user } = await requireRole('doctor')
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('doctor_reminder_preferences')
      .select('*')
      .eq('doctor_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return defaults if no record exists
    return NextResponse.json({
      preferences: data || {
        doctor_id: user.id,
        email_enabled: true,
        sms_enabled: false,
        whatsapp_enabled: true,
        reminder_48h: true,
        reminder_24h: true,
        reminder_2h: true,
        preferred_language: 'es',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole('doctor')
    const body = await request.json()
    const supabase = createServiceClient()

    const upsertData = {
      doctor_id: user.id,
      email_enabled: body.email_enabled ?? true,
      sms_enabled: body.sms_enabled ?? false,
      whatsapp_enabled: body.whatsapp_enabled ?? true,
      reminder_48h: body.reminder_48h ?? true,
      reminder_24h: body.reminder_24h ?? true,
      reminder_2h: body.reminder_2h ?? true,
      preferred_language: body.preferred_language ?? 'es',
      custom_subject: body.custom_subject || null,
      custom_body: body.custom_body || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('doctor_reminder_preferences')
      .upsert(upsertData, { onConflict: 'doctor_id' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, preferences: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}
