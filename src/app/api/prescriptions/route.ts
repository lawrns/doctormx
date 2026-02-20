import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPrescription, updatePrescription, getPrescriptionByAppointment } from '@/lib/prescriptions'
import { logger } from '@/lib/observability/logger'
import { validateCSRFToken, createCSRFErrorResponse } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check CSRF token for state-changing operations
  const csrfCookie = request.cookies.get('csrf_token')?.value
  const csrfResult = validateCSRFToken(request, csrfCookie || '', true)
  if (!csrfResult.valid) {
    return createCSRFErrorResponse(csrfResult)
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

  // Validate medications is valid JSON
  try {
    const parsedMedications = JSON.parse(medications)
    if (!Array.isArray(parsedMedications)) {
      return NextResponse.json(
        { error: 'Medications must be an array' },
        { status: 400 }
      )
    }
    if (parsedMedications.length === 0) {
      return NextResponse.json(
        { error: 'At least one medication is required' },
        { status: 400 }
      )
    }
    // Validate each medication has a name
    for (const med of parsedMedications) {
      if (!med.name || typeof med.name !== 'string' || med.name.trim() === '') {
        return NextResponse.json(
          { error: 'Medication name is required' },
          { status: 400 }
        )
      }
    }
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid medications format' },
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

    try {
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
    } catch (err) {
      // Log any errors from prescription operations but don't fail
      logger.warn('Prescription operation had issues, but continuing', { error: (err as Error).message })
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
