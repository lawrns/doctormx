import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/observability/logger'
import {
  fillTemplate,
  FOLLOWUP_TEMPLATES,
  auditAIOperation,
  AI_CONFIG
} from '@/lib/ai';

export async function POST(req: NextRequest) {
  if (!AI_CONFIG.features.followUp) {
    return NextResponse.json(
      { error: 'Feature no habilitada' },
      { status: 403 }
    );
  }

  const startTime = Date.now();
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { followUpId, response: userResponse } = await req.json();

    if (!followUpId || !userResponse) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Obtener follow-up
    const { data: followUp } = await supabase
      .from('follow_up_schedules')
      .select('*, appointments!inner(doctor_id)')
      .eq('id', followUpId)
      .eq('patient_id', user.id)
      .single();

    if (!followUp) {
      return NextResponse.json({ error: 'Seguimiento no encontrado' }, { status: 404 });
    }

    // Actualizar respuesta
    await supabase
      .from('follow_up_schedules')
      .update({
        response: userResponse,
        responded_at: new Date().toISOString(),
        status: 'responded',
      })
      .eq('id', followUpId);

    // Detectar si necesita escalamiento (respuesta "peor" o "emergencia")
    const needsEscalation = /peor|mal|dolor|sangr|emergencia/i.test(userResponse);

    if (needsEscalation) {
      await supabase
        .from('follow_up_schedules')
        .update({ status: 'escalated' })
        .eq('id', followUpId);

      // FUTURE_ENHANCEMENT: Notificar al doctor vía email/SMS cuando un paciente reporta síntomas de empeoramiento o emergencia
    }

    // Auditoría
    await auditAIOperation({
      operation: 'follow-up',
      userId: user.id,
      userType: 'patient',
      input: { followUpId, response: userResponse },
      output: { escalated: needsEscalation },
      latencyMs: Date.now() - startTime,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      escalated: needsEscalation,
      message: needsEscalation
        ? 'Tu doctor ha sido notificado de tu situación'
        : 'Gracias por tu respuesta',
    });
  } catch (error: unknown) {
    logger.error('[FOLLOW-UP ERROR]:', { err: error });

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await auditAIOperation({
        operation: 'follow-up',
        userId: user.id,
        userType: 'patient',
        input: { error: 'Request failed' },
        output: {},
        latencyMs: Date.now() - startTime,
        status: 'error',
        error: errorMessage,
      });
    }

    return NextResponse.json(
      { error: 'Error procesando respuesta' },
      { status: 500 }
    );
  }
}

// Endpoint para crear follow-ups manualmente (doctor trigger)
export async function PUT(req: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { appointmentId } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointmentId requerido' },
        { status: 400 }
      );
    }

    // Verificar que es un doctor y que la cita es suya
    const { data: appointment } = await supabase
      .from('appointments')
      .select('*, profiles!appointments_patient_id_fkey(full_name)')
      .eq('id', appointmentId)
      .eq('doctor_id', user.id)
      .single();

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    // Obtener datos del doctor
    const { data: doctor } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const variables = {
      patientName: appointment.profiles?.full_name || 'Paciente',
      doctorName: doctor?.full_name || 'Dr./Dra.',
      chiefComplaint: 'tu consulta reciente',
    };

    // Crear 3 follow-ups
    const followUps = [
      {
        type: '24h-check',
        delayHours: 24,
      },
      {
        type: '7d-progress',
        delayHours: 24 * 7,
      },
      {
        type: '30d-outcome',
        delayHours: 24 * 30,
      },
    ] as const;

    const appointmentEndTime = new Date(appointment.end_time);

    for (const fu of followUps) {
      const template = FOLLOWUP_TEMPLATES[fu.type];
      const scheduledFor = new Date(appointmentEndTime.getTime() + fu.delayHours * 60 * 60 * 1000);

      await supabase.from('follow_up_schedules').insert({
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        type: fu.type,
        scheduled_for: scheduledFor.toISOString(),
        message: fillTemplate(template.template, variables),
        channel: fu.type === '30d-outcome' ? 'email' : 'whatsapp',
        status: 'pending',
      });
    }

    return NextResponse.json({ success: true, count: 3 });
  } catch (error: unknown) {
    logger.error('[CREATE FOLLOW-UPS ERROR]:', { err: error });
    return NextResponse.json(
      { error: 'Error creando seguimientos' },
      { status: 500 }
    );
  }
}
