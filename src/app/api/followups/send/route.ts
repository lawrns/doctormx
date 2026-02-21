import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import {
  sendFollowUp24hNotification,
  sendFollowUp7dNotification,
  sendMedicationReminder,
  sendPrescriptionRefill,
  sendChronicCareFollowUp,
} from '@/lib/followup'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, appointmentId, prescriptionId, patientId } = body

  if (!type) {
    return NextResponse.json({ error: 'Missing required field: type' }, { status: 400 })
  }

  try {
    let result: { success: boolean; messageSid?: string; error?: string } | undefined

    switch (type) {
      case 'follow_up_24h':
        if (!appointmentId) {
          return NextResponse.json({ error: 'appointmentId required for follow_up_24h' }, { status: 400 })
        }
        result = await sendFollowUp24hNotification(appointmentId)
        break

      case 'follow_up_7d':
        if (!appointmentId) {
          return NextResponse.json({ error: 'appointmentId required for follow_up_7d' }, { status: 400 })
        }
        result = await sendFollowUp7dNotification(appointmentId)
        break

      case 'medication_reminder':
        if (!prescriptionId) {
          return NextResponse.json({ error: 'prescriptionId required for medication_reminder' }, { status: 400 })
        }
        result = await sendMedicationReminder(prescriptionId)
        break

      case 'prescription_refill':
        if (!prescriptionId) {
          return NextResponse.json({ error: 'prescriptionId required for prescription_refill' }, { status: 400 })
        }
        result = await sendPrescriptionRefill(prescriptionId)
        break

      case 'chronic_care_check':
        if (!patientId) {
          return NextResponse.json({ error: 'patientId required for chronic_care_check' }, { status: 400 })
        }
        result = await sendChronicCareFollowUp(patientId)
        break

      default:
        return NextResponse.json({ error: 'Invalid follow-up type' }, { status: 400 })
    }

    if (!result || !result.success) {
      return NextResponse.json({ error: result?.error || 'Failed to send follow-up' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageSid: result.messageSid })
  } catch (error) {
    logger.error('Error sending follow-up:', { err: error })
    return NextResponse.json({ error: 'Failed to send follow-up' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('followups')
    .select(`*, appointment:appointments(doctor:doctors(profile:profiles(full_name)))`)
    .eq('patient_id', user.id)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('scheduled_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ followUps: data || [] })
}
