import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * POST /api/consultation-notes
 * Save a consultation note (used by offline sync)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { appointmentId, patientId, content, type = 'soap' } = body;

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
  } catch (error) {
    console.error('Consultation notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/consultation-notes?appointmentId={id}
 * Get notes for a specific appointment
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

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
  } catch (error) {
    console.error('Consultation notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
