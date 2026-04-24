import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getPatientAppointmentContext } from '@/lib/appointment-context'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const { id } = await params
    if (profile?.role === 'patient') {
      const appointment = await getPatientAppointmentContext(id, user.id)

      if (!appointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ appointment })
    }

    if (profile?.role === 'doctor' || profile?.role === 'admin') {
      const service = createServiceClient()
      let query = service
        .from('appointments')
        .select('id, patient_id, doctor_id, start_ts, end_ts, status, appointment_type, reason_for_visit, notes')
        .eq('id', id)

      if (profile.role === 'doctor') {
        query = query.eq('doctor_id', user.id)
      }

      const { data: appointment } = await query.single()
      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
      }

      const { data: patient } = await service
        .from('profiles')
        .select('full_name')
        .eq('id', appointment.patient_id)
        .maybeSingle()

      return NextResponse.json({
        appointment: {
          ...appointment,
          patient_name: patient?.full_name || 'Paciente',
        },
      })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}
