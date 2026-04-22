import { NextRequest, NextResponse } from 'next/server'
import { getPendingRemindersDue, sendReminder } from '@/lib/reminders'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pending = await getPendingRemindersDue()

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    }

    for (const reminder of pending) {
      results.processed++
      const result = await sendReminder(reminder)

      if (result.success) {
        results.successful++
      } else {
        results.failed++
        results.errors.push(`Reminder ${reminder.id}: ${result.error || 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error processing reminder cron:', error)
    return NextResponse.json(
      { error: 'Failed to process reminders', details: String(error) },
      { status: 500 }
    )
  }
}
