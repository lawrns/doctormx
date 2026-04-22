import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { user } = await requireRole('doctor')
    const supabase = createServiceClient()

    // Get counts by status manually since .group() isn't in the JS client
    const { data: allReminders } = await supabase
      .from('appointment_reminder_schedules')
      .select('status')
      .eq('doctor_id', user.id)

    const counts: Record<string, number> = {}
    for (const r of allReminders || []) {
      counts[r.status] = (counts[r.status] || 0) + 1
    }

    const stats = Object.entries(counts).map(([status, count]) => ({ status, count }))

    const { data: recent } = await supabase
      .from('appointment_reminder_schedules')
      .select('id, hours_before, channel, status, scheduled_at, sent_at, patient_response, appointment_id')
      .eq('doctor_id', user.id)
      .order('scheduled_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ stats, recent: recent || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}
