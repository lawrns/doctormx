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
import type { CareTriage, RoutingDecision } from '@/lib/types/care-case';

/** Map TriageResult.recommendedAction to CareTriage RoutingDecision */
function mapRecommendedAction(action: TriageResult['recommendedAction']): RoutingDecision {
  switch (action) {
    case 'book-appointment': return 'doctor';
    case 'seek-emergency': return 'emergency';
    case 'self-care': return 'self-care';
    default: return 'doctor';
  }
}

function isMessageRole(value: unknown): value is PreConsultaMessage['role'] {
  return value === 'system' || value === 'user' || value === 'assistant';
}

function normalizeMessages(input: unknown): PreConsultaMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((message) => {
      if (!message || typeof message !== 'object') {
        return null;
      }

      const candidate = message as Partial<PreConsultaMessage> & { role?: unknown; content?: unknown; id?: unknown; timestamp?: unknown };
      if (!isMessageRole(candidate.role) || typeof candidate.content !== 'string') {
        return null;
      }

      const normalizedTimestamp = candidate.timestamp instanceof Date
        ? candidate.timestamp
        : typeof candidate.timestamp === 'string' || typeof candidate.timestamp === 'number'
          ? new Date(candidate.timestamp)
          : new Date();

      return {
        id: typeof candidate.id === 'string' ? candidate.id : crypto.randomUUID(),
        role: candidate.role,
        content: candidate.content.trim(),
        timestamp: Number.isNaN(normalizedTimestamp.getTime()) ? new Date() : normalizedTimestamp,
      } satisfies PreConsultaMessage;
    })
    .filter((message): message is PreConsultaMessage => Boolean(message?.content));
}

function isConfigurationError(message: string) {
  return message.includes('No hay API key')
    || message.includes('must be set')
    || message.includes('no configurad')
    || message.includes('Incorrect API key')
    || message.includes('Invalid API key')
    || message.includes('Unauthorized')
    || message.includes('authentication')
    || message.includes('API key');
}

async function safeUpsertSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: Record<string, unknown>
) {
  try {
    const { error } = await supabase.from('pre_consulta_sessions').upsert(payload);
    if (error) {
      console.error('[PRE-CONSULTA] Failed to persist session:', error);
    }
  } catch (error) {
    console.error('[PRE-CONSULTA] Unexpected persistence error:', error);
  }
}

/** Build a CareTriage from the AI TriageResult and conversation context */
function buildCareTriage(triage: TriageResult, chiefComplaint: string): CareTriage {
  return {
    chiefComplaint,
    symptoms: [],
    urgency: triage.urgency,
    specialty: triage.specialty,
    specialtyConfidence: triage.confidence,
    redFlags: triage.redFlags,
    recommendedAction: mapRecommendedAction(triage.recommendedAction),
    reasoning: triage.reasoning,
  };
}

/** Safely import and call care orchestration functions. Returns null if module not available. */
async function tryGetCareOrchestration() {
  try {
    return await import('@/lib/care-orchestration');
  } catch {
    console.warn('[PRE-CONSULTA] care-orchestration module not available yet, skipping care case tracking');
    return null;
  }
}

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

    const { sessionId, messages: rawMessages, anonymous } = await req.json() as {
      sessionId: string;
      messages: unknown;
      anonymous?: boolean;
    };

    const messages = normalizeMessages(rawMessages);

    if (!sessionId || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // For anonymous users, check quota before proceeding
    if (anonymous && !user) {
      const { canAnonymousConsult } = await import('@/lib/anonymous-quota')
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

    // --- Care Case: create on first interaction ---
    let careCaseId: string | null = null;
    const careOrch = await tryGetCareOrchestration();
    const userMessageCount = messages.filter((m) => m.role === 'user').length;
    if (careOrch && userMessageCount <= 1) {
      try {
        const careCase = await careOrch.createCareCase({
          channel: 'web',
          patientId: user?.id,
        });
        careCaseId = careCase.id;
      } catch (err) {
        console.error('[PRE-CONSULTA] Failed to create care case:', err);
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
      await safeUpsertSession(supabase, {
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

      // --- Care Case: update triage, route, and link session ---
      if (careOrch && summary) {
        try {
          const chiefComplaint = userMessages[0]?.content || summary.specialty;
          const careTriage = buildCareTriage(summary, chiefComplaint);

          // If we didn't create the care case earlier (ongoing session), create it now
          if (!careCaseId) {
            const careCase = await careOrch.createCareCase({
              channel: 'web',
              patientId: user?.id,
            });
            careCaseId = careCase.id;
          }

          await careOrch.updateCaseTriage({ careCaseId, triage: careTriage });
          const routing = careOrch.deriveCareRouting(careTriage);
          await careOrch.routeCaseWithContext({ careCaseId, routing });

          if (routing.recommendedPartnerType) {
            await careOrch.createPartnerHandoff({
              careCaseId,
              partnerType: routing.recommendedPartnerType,
              reason: routing.reason,
              metadata: {
                specialty: routing.specialty,
                urgency: routing.urgency,
                source: 'preconsulta',
                sessionId,
              },
            });
          }

          await careOrch.linkPreConsultaSession(sessionId, careCaseId);
        } catch (err) {
          console.error('[PRE-CONSULTA] Failed to update care case triage:', err);
        }
      }
    } else {
      // Guardar progreso
      await safeUpsertSession(supabase, {
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
      careCaseId: careCaseId || undefined,
      anonymous,
      quota,
    });
  } catch (error: unknown) {
    console.error('[PRE-CONSULTA ERROR]:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    // Auditoría de error — best-effort, don't let it swallow the real error response
    try {
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
    } catch (auditErr) {
      console.error('[PRE-CONSULTA] Audit logging failed:', auditErr);
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

    if (isConfigurationError(errorMessage)) {
      return NextResponse.json(
        {
          error: 'configuration_error',
          message: 'El servicio de IA no está configurado correctamente.',
          technical: errorMessage,
        },
        { status: 503 }
      );
    }

    if (errorMessage.includes('Datos inválidos')) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'La solicitud de chat no es válida.', technical: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error procesando consulta', technical: errorMessage },
      { status: 500 }
    );
  }
}
