import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPrescriptionPDF } from '@/lib/prescriptions'
import { logger } from '@/lib/observability/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { id } = await params

    const { data: prescription } = await supabase
      .from('prescriptions')
      .select(`
        *,
        appointment:appointments (doctor_id, patient_id)
      `)
      .eq('id', id)
      .single()

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    const appointment = Array.isArray(prescription.appointment) ? prescription.appointment[0] : prescription.appointment
    
    // Doctors can access their own prescriptions, patients can access their own
    const isDoctor = profile.role === 'doctor'
    const isPatient = profile.role === 'patient'
    const isOwner = appointment.doctor_id === user.id
    const isPatientOwner = appointment.patient_id === user.id
    
    // Allow if: doctor is the owner, or patient is the owner
    if (!(isDoctor && isOwner) && !(isPatient && isPatientOwner)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pdfBuffer = await getPrescriptionPDF(id)

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="prescripcion-${id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    logger.error('Error generating PDF:', { err: error })
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
