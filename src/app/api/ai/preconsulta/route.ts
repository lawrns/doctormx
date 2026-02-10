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
import type { PreConsultaReferral } from '@/lib/types/api';

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

    const { sessionId, messages, anonymous } = await req.json() as {
      sessionId: string;
      messages: PreConsultaMessage[];
      anonymous?: boolean;
    };

    if (!sessionId || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // For anonymous users, check quota before proceeding
    if (anonymous && !user) {
      const { canAnonymousConsult, useAnonymousConsultation } = await import('@/lib/anonymous-quota')
      const quotaCheck = await canAnonymousConsult(sessionId)

      if (!quotaCheck.canConsult) {
        return NextResponse.json(
          {
            error: 'quota_exceeded',
            message: quotaCheck.message,
            quota: quotaCheck.quota,
            requireAuth: true,
          },
          { status: 403 }
        )
      }
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
    let referrals: PreConsultaReferral[] = [];

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
        const matchedDoctors = await matchDoctorsForReferral({
          symptoms: summary?.redFlags || [],
          urgency: summary?.urgency || 'low',
          specialty: summary?.specialty || 'general',
          sessionId,
          patientId: user?.id || 'anonymous'
        });

        // Transform to PreConsultaReferral format
        referrals = matchedDoctors.map((m) => ({
          id: m.doctor.id,
          name: m.doctor.profile?.full_name || 'Doctor',
          specialty: summary?.specialty || 'general',
          availability: 'available',
          nextAvailable: 'Consultar disponibilidad'
        })) as PreConsultaReferral[];
      } catch (err) {
        console.error('[REFERRAL ERROR]:', err);
      }

      // Guardar sesión en DB
      await supabase.from('pre_consulta_sessions').upsert({
        id: sessionId,
        patient_id: user?.id || null,
        messages: messages,
        summary: {
          chiefComplaint: summary?.specialty || 'general',
          symptoms: [],
          urgencyLevel: summary?.urgency || 'low',
          suggestedSpecialty: summary?.specialty || 'general',
          aiConfidence: summary?.confidence || 0.5,
        },
        status: summary?.urgency === 'emergency' ? 'redirected-to-emergency' : 'completed',
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

    // Use anonymous quota if applicable
    if (anonymous && !user && isComplete) {
      const { useAnonymousConsultation } = await import('@/lib/anonymous-quota')
      await useAnonymousConsultation(sessionId)
    }

    // Auditoría
    await auditAIOperation({
      operation: 'pre-consulta',
      userId: user?.id || 'anonymous',
      userType: 'patient',
      input: { sessionId, messageCount: messages.length, anonymous },
      output: { response, summary, referralCount: referrals.length },
      tokens: usage.inputTokens + usage.outputTokens,
      cost: usage.cost,
      latencyMs: Date.now() - startTime,
      status: 'success',
    });

    // Get updated quota for anonymous users
    let quota = null
    if (anonymous && !user) {
      const { getAnonymousQuota } = await import('@/lib/anonymous-quota')
      quota = await getAnonymousQuota(sessionId)
    }

    return NextResponse.json({
      response,
      completed: isComplete,
      summary: isComplete ? summary : null,
      referrals: referrals.slice(0, 3),
      anonymous,
      quota,
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

    // Return user-friendly error messages
    if (errorMessage.includes('Sin saldo') || errorMessage.includes('Insufficient balance')) {
      return NextResponse.json(
        {
          error: 'service_unavailable',
          message: 'El servicio de IA no está disponible temporalmente. Intenta más tarde.',
          technical: errorMessage,
        },
        { status: 503 }
      );
    }

    if (errorMessage.includes('No hay API key')) {
      return NextResponse.json(
        {
          error: 'configuration_error',
          message: 'El servicio de IA no está configurado correctamente.',
          technical: errorMessage,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Error procesando consulta', technical: errorMessage },
      { status: 500 }
    );
  }
}
