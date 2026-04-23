import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializePayment } from '@/lib/payment'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { appointmentId, patientInsuranceId } = await request.json()

  if (!appointmentId) {
    return NextResponse.json(
      { error: 'appointmentId required' },
      { status: 400 }
    )
  }

  try {
    // Sistema de pago maneja todo: validación + stripe + registro
    const result = await initializePayment({
      appointmentId,
      userId: user.id,
      patientInsuranceId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
