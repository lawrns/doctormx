/**
 * POST /api/soap/stream
 *
 * Streaming SOAP consultation using Server-Sent Events (SSE)
 * This avoids Netlify's 10s function timeout by streaming progress updates
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { rateLimit } from '@/lib/cache'
import { glmChatCompletion, GLM_CONFIG } from '@/lib/ai/glm'
import { buildPatientDataPrompt } from '@/lib/soap/prompts'
import type { SubjectiveData, ObjectiveData, SpecialistRole, UrgencyLevel } from '@/lib/soap/types'
import { z } from 'zod'

// Extended timeout for streaming
export const maxDuration = 60

// Specialist prompts are defined inline in consultSpecialist() for faster streaming

// All 4 specialists for comprehensive assessment
// Running in parallel completes within ~30-45s with GLM
const SPECIALIST_ROLES: SpecialistRole[] = [
  'general-practitioner',
  'dermatologist',
  'internist',
  'psychiatrist',
]

// Simplified streaming types (full types stored in DB)
interface StreamingAssessment {
  role: SpecialistRole
  diagnosis: string
  confidence: number
  urgency: UrgencyLevel
  redFlags: string[]
  recommendations: string[]
  tokensUsed: number
  costUSD: number
  _rawContent?: string // Debug: raw GLM response
}

interface StreamingConsensus {
  primaryDiagnosis: string | null
  urgencyLevel: UrgencyLevel
  agreementLevel: 'strong' | 'moderate' | 'weak' | 'disagreement'
  confidenceScore: number
  combinedRedFlags: string[]
  requiresHumanReview: boolean
}

interface StreamingPlan {
  recommendations: string[]
  selfCareInstructions: string[]
  followUpTiming: string
  followUpType: 'telemedicine' | 'in-person' | 'emergency' | 'self-monitor'
  returnPrecautions: string[]
}

// Validation schema
const SubjectiveSchema = z.object({
  chiefComplaint: z.string().min(5),
  symptomsDescription: z.string().min(10),
  symptomDuration: z.string().min(1),
  symptomSeverity: z.number().min(1).max(10),
  onsetType: z.enum(['sudden', 'gradual']),
  associatedSymptoms: z.array(z.string()).default([]),
  aggravatingFactors: z.array(z.string()).default([]),
  relievingFactors: z.array(z.string()).default([]),
  previousTreatments: z.array(z.string()).default([]),
  medicalHistory: z.string().optional(),
  medications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
})

const ConsultRequestSchema = z.object({
  patientId: z.string().uuid(),
  subjective: SubjectiveSchema,
  objective: z.object({
    patientAge: z.number().optional(),
    patientGender: z.enum(['male', 'female', 'other']).optional(),
  }).optional(),
})

// Using buildPatientDataPrompt from @/lib/soap/prompts for sanitized input

// Specialist prompts optimized for GLM - MUST output JSON ONLY (no reasoning text)
// GLM tends to add reasoning before JSON, so we're very explicit about format
const SPECIALIST_PROMPTS: Record<SpecialistRole, string> = {
  'general-practitioner': `Tu rol: Médico general. Evalúa los síntomas y da tu impresión clínica.

IMPORTANTE: Responde SOLO con el JSON abajo, sin explicaciones ni razonamiento.

{"clinicalImpression":"[tu diagnóstico en 1-2 oraciones]","urgencyLevel":"moderate","redFlags":[],"recommendedTests":[],"confidence":0.7}`,

  'dermatologist': `Tu rol: Dermatóloga. Evalúa si hay componente cutáneo.

IMPORTANTE: Responde SOLO con el JSON abajo, sin explicaciones ni razonamiento.

{"clinicalImpression":"[tu evaluación dermatológica]","urgencyLevel":"moderate","redFlags":[],"recommendedTests":[],"confidence":0.7}`,

  'internist': `Tu rol: Internista. Evalúa enfermedades sistémicas.

IMPORTANTE: Responde SOLO con el JSON abajo, sin explicaciones ni razonamiento.

{"clinicalImpression":"[tu evaluación de medicina interna]","urgencyLevel":"moderate","redFlags":[],"recommendedTests":[],"confidence":0.7}`,

  'psychiatrist': `Tu rol: Psiquiatra. Evalúa componente emocional/psicológico.

IMPORTANTE: Responde SOLO con el JSON abajo, sin explicaciones ni razonamiento.

{"clinicalImpression":"[tu evaluación psiquiátrica]","urgencyLevel":"moderate","redFlags":[],"recommendedTests":[],"confidence":0.7}`
}

/**
 * Consult a single specialist
 */
async function consultSpecialist(
  role: SpecialistRole,
  patientData: string,
  retryCount = 0
): Promise<StreamingAssessment> {
  // Use the streamlined prompt directly (already includes JSON schema)
  const prompt = SPECIALIST_PROMPTS[role]

  const response = await glmChatCompletion({
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: patientData },
    ],
    model: GLM_CONFIG.models.costEffective,
    jsonMode: true,
    temperature: 0.3,
    maxTokens: 500, // Balanced for quality and speed
  })

  // Retry once if we get an empty response (GLM rate limiting issue)
  if (!response.content && retryCount < 1) {
    logger.warn('[SOAP Specialist] Empty response, retrying...', { role, retryCount })
    await new Promise(resolve => setTimeout(resolve, 500)) // Small delay before retry
    return consultSpecialist(role, patientData, retryCount + 1)
  }

  // Try to extract JSON from response (may be wrapped in markdown or have reasoning text)
  let parsed: Record<string, unknown> | null = null
  const content = response.content

  // Debug: log what GLM returned
  logger.info('[SOAP Specialist] GLM response', {
    role,
    contentLength: content.length,
    contentPreview: content.slice(0, 300),
    contentEnd: content.slice(-300), // Also log the END where JSON is likely to be
  })

  try {
    // First, try direct JSON parse
    parsed = JSON.parse(content)
  } catch {
    // GLM reasoning models output thinking THEN JSON - look for the LAST complete JSON object
    // Strategy: find all JSON-like patterns and try parsing from the most complete one

    // Try to find JSON in markdown code blocks first
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      try {
        parsed = JSON.parse(codeBlockMatch[1].trim())
      } catch { /* continue */ }
    }

    // If not in code block, find the last JSON object (reasoning models put it at the end)
    if (!parsed) {
      // Find the last opening brace and extract from there
      const lastBraceIndex = content.lastIndexOf('{')
      if (lastBraceIndex !== -1) {
        const jsonCandidate = content.slice(lastBraceIndex)
        // Try to find matching closing brace
        let braceCount = 0
        let endIndex = 0
        for (let i = 0; i < jsonCandidate.length; i++) {
          if (jsonCandidate[i] === '{') braceCount++
          if (jsonCandidate[i] === '}') {
            braceCount--
            if (braceCount === 0) {
              endIndex = i + 1
              break
            }
          }
        }
        if (endIndex > 0) {
          try {
            parsed = JSON.parse(jsonCandidate.slice(0, endIndex))
          } catch { /* continue */ }
        }
      }
    }

    // Fallback: try the first JSON object
    if (!parsed) {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0])
        } catch {
          logger.warn('[SOAP Specialist] All JSON extraction failed', {
            role,
            contentLength: content.length,
          })
        }
      }
    }
  }

  // Accept multiple possible field names for diagnosis
  const diagnosisField = parsed?.clinicalImpression
    || parsed?.clinical_impression
    || parsed?.diagnosis
    || parsed?.impression
    || parsed?.assessment
    || (parsed?.differentialDiagnoses as unknown[])?.[0]
    || null

  if (parsed && diagnosisField) {
    const diagnosisText = typeof diagnosisField === 'string'
      ? diagnosisField
      : typeof diagnosisField === 'object' && diagnosisField !== null
        ? (diagnosisField as Record<string, unknown>).name as string || JSON.stringify(diagnosisField)
        : String(diagnosisField)

    return {
      role,
      diagnosis: diagnosisText,
      confidence: Number(parsed.confidence || parsed.confidenceScore) || 0.7,
      urgency: (parsed.urgencyLevel || parsed.urgency || 'moderate') as UrgencyLevel,
      redFlags: Array.isArray(parsed.redFlags)
        ? parsed.redFlags as string[]
        : Array.isArray(parsed.red_flags)
          ? parsed.red_flags as string[]
          : [],
      recommendations: Array.isArray(parsed.recommendedTests)
        ? parsed.recommendedTests as string[]
        : Array.isArray(parsed.recommendations)
          ? parsed.recommendations as string[]
          : Array.isArray(parsed.recommended_tests)
            ? parsed.recommended_tests as string[]
            : [],
      tokensUsed: response.usage.totalTokens,
      costUSD: response.costUSD,
      _rawContent: content.slice(0, 300), // Debug
    }
  }

  // Fallback: include raw content for debugging
  return {
    role,
    diagnosis: 'Evaluación pendiente',
    confidence: 0.5,
    urgency: 'moderate' as UrgencyLevel,
    redFlags: [],
    recommendations: ['Consultar con un médico para evaluación completa'],
    tokensUsed: response.usage.totalTokens,
    costUSD: response.costUSD,
    _rawContent: content.slice(0, 500), // Debug: see what GLM actually returned
  }
}

/**
 * Build consensus from specialist assessments
 */
async function buildConsensus(
  specialists: StreamingAssessment[]
): Promise<StreamingConsensus> {
  const consensusPrompt = `Eres el Dr. Hernández, Jefe de Medicina del equipo de consulta virtual.

TU ROL: Sintetizar las evaluaciones de todos los especialistas y construir un consenso clínico.

CRITERIOS:
- Si hay acuerdo en diagnóstico → agreementLevel: "strong"
- Si hay desacuerdo parcial → agreementLevel: "moderate"
- Si hay desacuerdo significativo → agreementLevel: "weak"
- Prioriza la urgencia más alta reportada
- Combina todos los signos de alarma

RESPONDE ÚNICAMENTE en JSON válido:
{
  "primaryDiagnosis": "El diagnóstico más probable basado en consenso",
  "urgencyLevel": "emergency|urgent|moderate|routine|self-care",
  "agreementLevel": "strong|moderate|weak",
  "confidenceScore": 0.0-1.0,
  "combinedRedFlags": ["Todos los signos de alarma identificados"],
  "requiresHumanReview": true/false,
  "reasoning": "Por qué se llegó a este consenso"
}`

  const specialistSummary = specialists.map(s =>
    `${s.role}: ${s.diagnosis} (Urgencia: ${s.urgency}, Confianza: ${s.confidence}, Red flags: ${s.redFlags.join(', ') || 'ninguno'})`
  ).join('\n')

  const response = await glmChatCompletion({
    messages: [
      { role: 'system', content: consensusPrompt },
      { role: 'user', content: specialistSummary },
    ],
    model: GLM_CONFIG.models.costEffective,
    jsonMode: true,
    temperature: 0.2,
    maxTokens: 600,
  })

  try {
    const parsed = JSON.parse(response.content)
    return {
      primaryDiagnosis: parsed.primaryDiagnosis?.name || parsed.primaryDiagnosis || null,
      urgencyLevel: parsed.urgencyLevel || 'moderate',
      agreementLevel: parsed.agreementLevel || 'moderate',
      confidenceScore: parsed.confidenceScore || 0.5,
      combinedRedFlags: parsed.combinedRedFlags || [],
      requiresHumanReview: parsed.requiresHumanReview || false,
    }
  } catch {
    return {
      primaryDiagnosis: null,
      urgencyLevel: 'moderate',
      agreementLevel: 'weak',
      confidenceScore: 0,
      combinedRedFlags: [],
      requiresHumanReview: true,
    }
  }
}

/**
 * Generate treatment plan
 */
async function generatePlan(
  consensus: StreamingConsensus,
  subjective: SubjectiveData
): Promise<StreamingPlan> {
  const planPrompt = `Eres un asistente médico que genera planes de tratamiento claros y accionables.

CONTEXTO: Esta es una PRE-CONSULTA virtual. El plan NO reemplaza la evaluación médica presencial.

CRITERIOS SEGÚN URGENCIA:
- emergency → Instrucciones para ir a urgencias inmediatamente
- urgent → Cita médica en 24-48 horas
- moderate → Cita en la próxima semana
- routine → Seguimiento cuando sea conveniente
- self-care → Monitoreo en casa con precauciones claras

RESPONDE ÚNICAMENTE en JSON válido:
{
  "recommendations": ["Recomendaciones médicas específicas para este caso"],
  "selfCareInstructions": ["Instrucciones de autocuidado en casa"],
  "followUpTiming": "Cuándo hacer seguimiento (ej: 48 horas, 1 semana)",
  "followUpType": "telemedicine|in-person|emergency|self-monitor",
  "returnPrecautions": ["Signos de alarma: cuándo buscar atención inmediata"]
}`

  const patientContext = `DIAGNÓSTICO: ${consensus.primaryDiagnosis || 'Pendiente evaluación'}
URGENCIA: ${consensus.urgencyLevel}
SIGNOS DE ALARMA: ${consensus.combinedRedFlags.join(', ') || 'Ninguno identificado'}
SÍNTOMA PRINCIPAL: ${subjective.chiefComplaint}
SEVERIDAD: ${subjective.symptomSeverity}/10
DURACIÓN: ${subjective.symptomDuration}`

  const response = await glmChatCompletion({
    messages: [
      { role: 'system', content: planPrompt },
      { role: 'user', content: patientContext },
    ],
    model: GLM_CONFIG.models.costEffective,
    jsonMode: true,
    temperature: 0.3,
    maxTokens: 700,
  })

  try {
    const parsed = JSON.parse(response.content)
    return {
      recommendations: parsed.recommendations || [],
      selfCareInstructions: parsed.selfCareInstructions || parsed.lifestyle || [],
      followUpTiming: parsed.followUpTiming || parsed.followUp?.timing || '1 semana',
      followUpType: parsed.followUpType || parsed.followUp?.type || 'telemedicine',
      returnPrecautions: parsed.returnPrecautions || parsed.redFlagWarnings || [],
    }
  } catch {
    return {
      recommendations: ['Consultar con un médico'],
      selfCareInstructions: [],
      followUpTiming: '1 semana',
      followUpType: 'telemedicine',
      returnPrecautions: [],
    }
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      try {
        // Rate limiting
        const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
        const { success } = await rateLimit.ai.limit(identifier)

        if (!success) {
          sendEvent('error', { error: 'Too many requests' })
          controller.close()
          return
        }

        // Parse and validate
        const body = await request.json()
        const validation = ConsultRequestSchema.safeParse(body)

        if (!validation.success) {
          sendEvent('error', { error: 'Validation failed', details: validation.error.flatten() })
          controller.close()
          return
        }

        const { patientId, subjective, objective } = validation.data
        const consultationId = `soap-stream-${Date.now()}`
        // Use sanitized prompt builder to prevent injection attacks
        const patientData = buildPatientDataPrompt(subjective as SubjectiveData, objective as ObjectiveData)

        sendEvent('start', { consultationId, patientId, timestamp: new Date().toISOString() })

        // Run all specialists in parallel for speed (reduces timeout risk)
        sendEvent('specialists_start', { specialists: SPECIALIST_ROLES })

        const specialistPromises = SPECIALIST_ROLES.map(role =>
          consultSpecialist(role, patientData).then(assessment => {
            sendEvent('specialist_done', {
              specialist: role,
              diagnosis: assessment.diagnosis.slice(0, 150),
              confidence: assessment.confidence,
              urgency: assessment.urgency,
              redFlags: assessment.redFlags.slice(0, 3),
              // Debug: show what GLM actually returned
              _rawContent: assessment._rawContent?.slice(0, 200),
              _tokens: assessment.tokensUsed,
            })
            return assessment
          })
        )

        const specialists = await Promise.all(specialistPromises)
        sendEvent('specialists_complete', { count: specialists.length })

        // Build consensus
        sendEvent('consensus_start', {})
        const consensus = await buildConsensus(specialists)
        sendEvent('consensus_done', {
          primaryDiagnosis: consensus.primaryDiagnosis,
          urgencyLevel: consensus.urgencyLevel,
          agreementLevel: consensus.agreementLevel,
          confidence: consensus.confidenceScore,
        })

        // Generate plan
        sendEvent('plan_start', {})
        const plan = await generatePlan(consensus, subjective as SubjectiveData)
        sendEvent('plan_done', {
          recommendations: plan.recommendations.length,
          followUpTiming: plan.followUpTiming,
          followUpType: plan.followUpType,
        })

        // Store in database
        const supabase = await createClient()
        const { error: dbError } = await supabase.from('soap_consultations').insert({
          id: consultationId,
          patient_id: patientId,
          status: 'complete',
          subjective_data: subjective,
          objective_data: objective || null,
          assessment_data: { specialists, consensus },
          plan_data: plan,
          completed_at: new Date().toISOString(),
        })
        if (dbError) {
          logger.warn('[SOAP Stream] DB insert failed', { error: dbError })
        }

        // Send complete event with full data
        sendEvent('complete', {
          consultationId,
          specialists,
          consensus,
          plan,
          summary: {
            urgency: consensus.urgencyLevel,
            primaryDiagnosis: consensus.primaryDiagnosis,
            confidence: consensus.confidenceScore,
            recommendedAction: consensus.urgencyLevel === 'emergency' ? 'emergency' : 'routine-appointment',
          },
        })

        controller.close()
      } catch (error) {
        logger.error('[SOAP Stream] Error', { error })
        sendEvent('error', { error: error instanceof Error ? error.message : 'Unknown error' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
