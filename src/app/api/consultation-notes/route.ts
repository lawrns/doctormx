import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createProjectClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/api-auth';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/consultation-notes
 * Save a consultation note (used by offline sync)
 */
export const POST = withAuth(async (request, { user }) => {
  const supabase = getSupabaseClient();
  const body = await request.json();
  const { appointmentId, patientId, content, type = 'soap' } = body;

  // Verify user is authorized for this patient's appointment
  const projectClient = await createProjectClient()
  const { data: profile } = await projectClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'patient' && patientId && patientId !== user.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // Validation
  if (!appointmentId || !content) {
    return NextResponse.json(
      { error: 'appointmentId and content are required' },
      { status: 400 }
    );
  }

  // Insert note into database
  const { data, error } = await supabase
    .from('consultation_notes')
    .insert({
      appointment_id: appointmentId,
      patient_id: patientId || null,
      content,
      type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to save note' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    note: data,
    syncedAt: new Date().toISOString(),
  });
})

/**
 * GET /api/consultation-notes?appointmentId={id}
 * Get notes for a specific appointment
 */
export const GET = withAuth(async (request, { user }) => {
  const supabase = getSupabaseClient();
  const { searchParams } = new URL(request.url);
  const appointmentId = searchParams.get('appointmentId');

  // Verify user has access to this appointment's notes
  const projectClient = await createProjectClient()
  const { data: appointment } = await projectClient
    .from('appointments')
    .select('patient_id, doctor_id')
    .eq('id', appointmentId)
    .single()

  if (appointment) {
    const { data: profile } = await projectClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isPatient = profile?.role === 'patient' && appointment.patient_id === user.id
    const isDoctor = profile?.role === 'doctor' && appointment.doctor_id === user.id

    if (!isPatient && !isDoctor && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
  }

  if (!appointmentId) {
    return NextResponse.json(
      { error: 'appointmentId is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('consultation_notes')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    notes: data || [],
    count: data?.length || 0,
  });
})
