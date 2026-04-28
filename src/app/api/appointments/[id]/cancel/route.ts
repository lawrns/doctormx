import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-auth'

export const POST = withAuth(async (request, { user, supabase, params }) => {
  const { id: appointmentId } = await params!

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'patient') {
    return NextResponse.json(
      { error: 'Only patients can cancel appointments' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { reason } = body

  if (!appointmentId) {
    return NextResponse.json(
      { error: 'Appointment ID is required' },
      { status: 400 }
    )
  }

  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .eq('patient_id', user.id)
    .single()

  if (fetchError || !appointment) {
    return NextResponse.json(
      { error: 'Appointment not found or access denied' },
      { status: 404 }
    )
  }

  if (appointment.status === 'cancelled') {
    return NextResponse.json(
      { error: 'Appointment is already cancelled' },
      { status: 400 }
    )
  }

  if (appointment.status === 'completed') {
    return NextResponse.json(
      { error: 'Cannot cancel a completed appointment' },
      { status: 400 }
    )
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancellation_reason: reason || 'Cancelled by patient',
      cancelled_by: user.id,
      cancelled_at: new Date().toISOString()
    })
    .eq('id', appointmentId)

  if (updateError) {
    console.error('Error cancelling appointment:', updateError)
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Appointment cancelled successfully'
  })
})
