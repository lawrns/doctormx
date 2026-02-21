import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPrescription, updatePrescription, getPrescriptionByAppointment } from '@/lib/prescriptions'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const appointmentId = formData.get('appointmentId') as string
  const diagnosis = formData.get('diagnosis') as string
  const medications = formData.get('medications') as string
  const instructions = formData.get('instructions') as string

  if (!appointmentId || !diagnosis || !medications) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  try {
    const { data: appointment } = await supabase
      .from('appointments')
      .select('doctor_id')
      .eq('id', appointmentId)
      .single()

    if (!appointment || appointment.doctor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existingPrescription = await getPrescriptionByAppointment(appointmentId)

    if (existingPrescription) {
      await updatePrescription(existingPrescription.id, {
        diagnosis,
        medications,
        instructions,
      })
    } else {
      await createPrescription(
        appointmentId,
        diagnosis,
        medications,
        instructions
      )
    }

    return NextResponse.redirect(new URL('/doctor', request.url))
  } catch (error) {
    logger.error('Error saving prescription:', { err: error })
    return NextResponse.json(
      { error: 'Failed to save prescription' },
      { status: 500 }
    )
  }
}
