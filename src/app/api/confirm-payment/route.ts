import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { confirmSuccessfulPayment } from '@/lib/payment'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { appointmentId, paymentIntentId } = await request.json()

  try {
    // Sistema de confirmación maneja todo: verificar + actualizar + confirmar
    const result = await confirmSuccessfulPayment(paymentIntentId, appointmentId)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      appointment: result.appointment,
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
