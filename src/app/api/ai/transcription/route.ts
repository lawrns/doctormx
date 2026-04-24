import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  transcribeAudio,
  structuredAnalysis,
  auditAIOperation,
  TRANSCRIPTION_SUMMARY_PROMPT,
  AI_CONFIG
} from '@/lib/ai';

export async function POST(req: NextRequest) {
  if (!AI_CONFIG.features.transcription) {
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

    // Verificar que es un doctor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'doctor') {
      return NextResponse.json({ error: 'Solo doctores' }, { status: 403 });
    }

    const formData = await req.formData();
    const appointmentId = formData.get('appointmentId') as string;
    const audioFile = formData.get('audio') as File;
    const recordingConsent = formData.get('recordingConsent') === 'true';

    if (!appointmentId || !audioFile) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    if (!recordingConsent) {
      return NextResponse.json(
        { error: 'Se requiere confirmar consentimiento de grabacion' },
        { status: 400 }
      );
    }

    // Verificar que la cita existe y pertenece al doctor
    const { data: appointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('doctor_id', user.id)
      .single();

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    // Convertir File a Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribir con Whisper
    const { segments, fullText, duration, cost } = await transcribeAudio({
      audioFile: buffer,
      language: 'es',
    });

    // Generar resumen estructurado
    const summary = await structuredAnalysis<{
      diagnosis: string;
      symptoms: string[];
      prescriptions: string[];
      followUpInstructions: string;
      nextSteps: string[];
    }>({
      systemPrompt: 'Eres un asistente médico experto en resumir consultas.',
      userPrompt: TRANSCRIPTION_SUMMARY_PROMPT.replace('{transcript}', fullText),
    });

    // Guardar transcripción en Supabase Storage. Store only the private path;
    // callers must fetch signed URLs through an authenticated endpoint.
    const fileName = `transcripts/${appointmentId}-${Date.now()}.txt`;
    const { error: uploadError } = await supabase.storage
      .from('medical-records')
      .upload(fileName, fullText, { contentType: 'text/plain' });

    if (uploadError) {
      throw uploadError;
    }

    // Guardar en DB
    const { data: transcript } = await supabase
      .from('consultation_transcripts')
      .insert({
        appointment_id: appointmentId,
        doctor_id: user.id,
        patient_id: appointment.patient_id,
        storage_path: fileName,
        segments,
        summary,
        status: 'completed',
        processed_at: new Date().toISOString(),
        metadata: {
          durationMinutes: Math.round(duration / 60),
          cost,
          model: AI_CONFIG.whisper.model,
        },
      })
      .select()
      .single();

    // Auditoría
    await auditAIOperation({
      operation: 'transcription',
      userId: user.id,
      userType: 'doctor',
      input: { appointmentId, durationMinutes: Math.round(duration / 60) },
      output: { transcriptId: transcript?.id, summary },
      cost,
      latencyMs: Date.now() - startTime,
      status: 'success',
    });

    return NextResponse.json({
      transcriptId: transcript?.id,
      transcriptText: fullText,
      summary,
      duration: Math.round(duration / 60),
      cost,
    });
  } catch (error: unknown) {
    console.error('[TRANSCRIPTION ERROR]:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await auditAIOperation({
        operation: 'transcription',
        userId: user.id,
        userType: 'doctor',
        input: { error: 'Request failed' },
        output: {},
        latencyMs: Date.now() - startTime,
        status: 'error',
        error: errorMessage,
      });
    }

    return NextResponse.json(
      { error: 'Error procesando transcripción' },
      { status: 500 }
    );
  }
}
