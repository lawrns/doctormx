import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'
import {
  getPendingFollowUps,
  sendFollowUp24hNotification,
  sendFollowUp7dNotification,
  sendMedicationReminder,
  sendPrescriptionRefill,
} from '@/lib/followup'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pendingFollowUps = await getPendingFollowUps()

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const followUp of pendingFollowUps) {
      try {
        let result: { success: boolean; error?: string } | undefined

        switch (followUp.type) {
          case 'follow_up_24h':
            if (followUp.appointment_id) {
              result = await sendFollowUp24hNotification(followUp.appointment_id)
            }
            break
          case 'follow_up_7d':
            if (followUp.appointment_id) {
              result = await sendFollowUp7dNotification(followUp.appointment_id)
            }
            break
          case 'medication_reminder':
            if (followUp.prescription_id) {
              result = await sendMedicationReminder(followUp.prescription_id)
            }
            break
          case 'prescription_refill':
            if (followUp.prescription_id) {
              result = await sendPrescriptionRefill(followUp.prescription_id)
            }
            break
          default:
            results.errors.push(`Unknown follow-up type: ${followUp.type}`)
            continue
        }

        results.processed++

        if (result?.success) {
          results.successful++
        } else {
          results.failed++
          results.errors.push(`Failed to send ${followUp.type}: ${result?.error ?? 'Unknown error'}`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Error processing follow-up ${followUp.id}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error processing follow-up cron job:', { err: error })
    return NextResponse.json(
      { error: 'Failed to process follow-ups', details: String(error) },
      { status: 500 }
    )
  }
}
