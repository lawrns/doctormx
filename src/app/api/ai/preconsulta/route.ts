import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  chatCompletion,
  structuredAnalysis,
  auditAIOperation,
  PRECONSULTA_SYSTEM_PROMPT,
  PRECONSULTA_URGENCY_PROMPT,
  AI_CONFIG
} from '@/lib/ai';
import { matchDoctorsForReferral } from '@/lib/ai/referral';
import type { PreConsultaMessage, TriageResult } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  if (!AI_CONFIG.features.preConsulta) {
    return NextResponse.json(
      { error: 'Feature no habilitada' },
      { status: 403 }
    );
  }

  const startTime = Date.now();
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { sessionId, messages } = await req.json() as {
      sessionId: string;
      messages: PreConsultaMessage[];
    };

    if (!sessionId || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Chat completion
    const { response, usage } = await chatCompletion({
      messages,
      systemPrompt: PRECONSULTA_SYSTEM_PROMPT,
    });

    // Skip safety check for pre-consulta (it's conversational, not diagnostic)

    // Determinar si la conversación está completa (>= 3 mensajes del usuario)
    const userMessages = messages.filter((m) => m.role === 'user');
    const isComplete = userMessages.length >= 3;

    let summary: TriageResult | null = null;
    let referrals: any[] = [];

    if (isComplete) {
      // Análisis final de urgencia
      const conversationText = messages
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');

      summary = await structuredAnalysis<TriageResult>({
        systemPrompt: 'Eres un experto en triaje médico.',
        userPrompt: PRECONSULTA_URGENCY_PROMPT.replace('{conversation}', conversationText),
      });

      // Match real doctors
      try {
        referrals = await matchDoctorsForReferral({
          symptoms: summary.redFlags || [],
          urgency: summary.urgency,
          specialty: summary.specialty,
          sessionId,
          patientId: user?.id || 'anonymous'
        });
      } catch (err) {
        console.error('[REFERRAL ERROR]:', err);
      }

      // Guardar sesión en DB
      await supabase.from('pre_consulta_sessions').upsert({
        id: sessionId,
        patient_id: user?.id || null,
        messages: messages,
        summary: {
          chiefComplaint: summary.specialty,
          symptoms: [],
          urgencyLevel: summary.urgency,
          suggestedSpecialty: summary.specialty,
          aiConfidence: summary.confidence,
        },
        status: summary.urgency === 'emergency' ? 'redirected-to-emergency' : 'completed',
        completed_at: new Date().toISOString(),
      });
    } else {
      // Guardar progreso
      await supabase.from('pre_consulta_sessions').upsert({
        id: sessionId,
        patient_id: user?.id || null,
        messages: messages,
        status: 'active',
      });
    }

    // Auditoría
    await auditAIOperation({
      operation: 'pre-consulta',
      userId: user?.id || 'anonymous',
      userType: 'patient',
      input: { sessionId, messageCount: messages.length },
      output: { response, summary, referralCount: referrals.length },
      tokens: usage.inputTokens + usage.outputTokens,
      cost: usage.cost,
      latencyMs: Date.now() - startTime,
      status: 'success',
    });

    return NextResponse.json({
      response,
      completed: isComplete,
      summary: isComplete ? summary : null,
      referrals: referrals.slice(0, 3)
    });
  } catch (error: unknown) {
    console.error('[PRE-CONSULTA ERROR]:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    // Auditoría de error
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await auditAIOperation({
        operation: 'pre-consulta',
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
      { error: 'Error procesando consulta' },
      { status: 500 }
    );
  }
}
