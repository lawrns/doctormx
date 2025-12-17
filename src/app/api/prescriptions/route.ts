import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  try {
    // Verificar que la cita pertenece al doctor
    const { data: appointment } = await supabase
      .from('appointments')
      .select('doctor_id')
      .eq('id', appointmentId)
      .single()

    if (!appointment || appointment.doctor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verificar si ya existe una receta
    const { data: existing } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('appointment_id', appointmentId)
      .single()

    if (existing) {
      // Actualizar receta existente
      await supabase
        .from('prescriptions')
        .update({
          diagnosis,
          medications,
          instructions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      // Crear nueva receta
      await supabase.from('prescriptions').insert({
        appointment_id: appointmentId,
        diagnosis,
        medications,
        instructions,
      })
    }

    return NextResponse.redirect(new URL('/doctor', request.url))
  } catch (error) {
    console.error('Error saving prescription:', error)
    return NextResponse.json(
      { error: 'Failed to save prescription' },
      { status: 500 }
    )
  }
}
