import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  fillTemplate,
  FOLLOWUP_TEMPLATES,
  auditAIOperation,
  AI_CONFIG
} from '@/lib/ai';
import { sendEmail, getEmailTemplate } from '@/lib/notifications';

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

      const appointmentData = followUp.appointments;
      const doctorId = Array.isArray(appointmentData)
        ? appointmentData[0]?.doctor_id
        : (appointmentData as Record<string, unknown>)?.doctor_id;

      if (doctorId) {
        supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', doctorId as string)
          .single()
          .then(({ data: doctor }: { data: { full_name: string | null; email: string | null } | null }) => {
            if (!doctor?.email) return;

            sendEmail({
              to: doctor.email,
              subject: '⚠️ Alerta: Paciente requiere atención urgente',
              html: getEmailTemplate(`
                <p style="margin:0 0 16px;color:#dc2626;font-size:16px;line-height:1.5;">
                  <strong>Un paciente ha reportado una urgencia en su seguimiento post-consulta.</strong>
                </p>
                <p style="margin:0 0 16px;color:#1f2937;font-size:16px;line-height:1.5;">
                  Respuesta del paciente: "${userResponse}"
                </p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">
                  Ingresa al panel para revisar el detalle y contactar al paciente.
                </p>
              `, doctor.full_name || 'Dr./Dra.'),
              tags: [{ name: 'type', value: 'follow_up_escalation' }],
            });
          })
          .catch((err: any) => {
            console.error('[FOLLOW-UP] Failed to send escalation email:', err);
          });
      }
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
    console.error('[FOLLOW-UP ERROR]:', error);

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
    console.error('[CREATE FOLLOW-UPS ERROR]:', error);
    return NextResponse.json(
      { error: 'Error creando seguimientos' },
      { status: 500 }
    );
  }
}
