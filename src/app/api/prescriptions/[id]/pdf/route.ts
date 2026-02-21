import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getPrescriptionPDF } from '@/lib/prescriptions'
import { logger } from '@/lib/observability/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireRole('doctor')
    const { id } = await params

    const { data: prescription } = await supabase
      .from('prescriptions')
      .select(`
        *,
        appointment:appointments (doctor_id)
      `)
      .eq('id', id)
      .single()

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    const appointment = Array.isArray(prescription.appointment) ? prescription.appointment[0] : prescription.appointment
    if (appointment.doctor_id !== user.id) {
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
