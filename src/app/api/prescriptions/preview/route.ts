import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { generatePrescriptionPDF, buildPrescriptionData } from '@/lib/prescriptions-pdf'

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireRole('doctor')

    const { appointmentId, diagnosis, medications, instructions } = await request.json()

    if (!appointmentId || !diagnosis || !medications || medications.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey (full_name, date_of_birth),
        doctor:doctors!appointments_doctor_id_fkey (
          *,
          profile:profiles!doctors_id_fkey (full_name)
        )
      `)
      .eq('id', appointmentId)
      .eq('doctor_id', user.id)
      .single()

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const patient = Array.isArray(appointment.patient) ? appointment.patient[0] : appointment.patient
    const doctor = Array.isArray(appointment.doctor) ? appointment.doctor[0] : appointment.doctor
    const doctorProfile = Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile

    const prescriptionData = buildPrescriptionData(
      {
        id: 'preview',
        appointment_id: appointmentId,
        diagnosis,
        medications: JSON.stringify(medications),
        instructions: instructions || '',
      },
      {
        full_name: doctorProfile?.full_name || 'Doctor',
        license_number: doctor.license_number,
        specialty: doctor.specialty,
      },
      {
        full_name: patient.full_name,
        date_of_birth: patient.date_of_birth,
      },
      new Date(appointment.start_ts)
    )

    const pdfBuffer = await generatePrescriptionPDF(prescriptionData)

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="receta-preview.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
