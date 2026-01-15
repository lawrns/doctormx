import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { createReferral, markReferralSent } from '@/lib/pharmacy'

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireRole('doctor')

    const body = await request.json()
    const { pharmacyId, appointmentId, medications, prescriptionId } = body

    if (!pharmacyId || !appointmentId || !medications || medications.length === 0) {
      return NextResponse.json(
        { error: 'Pharmacy ID, appointment ID, and medications are required' },
        { status: 400 }
      )
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('patient_id, doctor_id')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    if (appointment.doctor_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized for this appointment' }, { status: 403 })
    }

    const referral = await createReferral(
      pharmacyId,
      appointmentId,
      appointment.patient_id,
      user.id,
      medications,
      prescriptionId
    )

    if (!referral) {
      return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 })
    }

    const { data: patient } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', appointment.patient_id)
      .single()

    let referralSent = false
    if (patient?.phone) {
      referralSent = await markReferralSent(referral.id, patient.phone)
    }

    return NextResponse.json({
      success: true,
      referral: {
        id: referral.id,
        referralCode: referral.referral_code,
        pharmacyId: referral.pharmacy_id,
        sent: referralSent,
      },
    })
  } catch (error) {
    console.error('Error creating referral:', error)
    return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 })
  }
}
