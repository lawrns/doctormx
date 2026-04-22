import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireRole('patient')
    const { id } = await params
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_ts,
        end_ts,
        status,
        appointment_type,
        doctor_id,
        doctors:specialty,
        doctor_profile:profiles!appointments_doctor_id_fkey(full_name)
      `)
      .eq('id', id)
      .eq('patient_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      appointment: {
        id: data.id,
        start_ts: data.start_ts,
        end_ts: data.end_ts,
        status: data.status,
        appointment_type: data.appointment_type,
        doctor_id: data.doctor_id,
        doctor_name: (data.doctor_profile as any)?.full_name || 'Doctor',
        specialty: (data as any)?.doctors?.specialty || 'Medicina General',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}
