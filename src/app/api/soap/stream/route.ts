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

// Specialist prompts - using simple extraction pattern since GLM ignores JSON mode
// We'll extract the diagnosis from natural language instead
const SPECIALIST_PROMPTS: Record<SpecialistRole, string> = {
  'general-practitioner': `Eres Dr. García, médico general. Analiza estos síntomas y da tu diagnóstico en UNA oración.
Formato: DIAGNÓSTICO: [tu diagnóstico] | URGENCIA: [baja/media/alta/emergencia] | CONFIANZA: [0-100]%`,

  'dermatologist': `Eres Dra. Rodríguez, dermatóloga. ¿Hay componente cutáneo en estos síntomas? Responde en UNA oración.
Formato: DIAGNÓSTICO: [tu evaluación] | URGENCIA: [baja/media/alta/emergencia] | CONFIANZA: [0-100]%`,

  'internist': `Eres Dr. Martínez, internista. ¿Hay afectación sistémica en estos síntomas? Responde en UNA oración.
Formato: DIAGNÓSTICO: [tu evaluación] | URGENCIA: [baja/media/alta/emergencia] | CONFIANZA: [0-100]%`,

  'psychiatrist': `Eres Dra. López, psiquiatra. ¿Hay componente emocional/psicológico? Responde en UNA oración.
Formato: DIAGNÓSTICO: [tu evaluación] | URGENCIA: [baja/media/alta/emergencia] | CONFIANZA: [0-100]%`
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
    jsonMode: false, // GLM ignores JSON mode, so we parse natural language instead
    temperature: 0.3,
    maxTokens: 300, // Shorter since we only need 1 sentence
  })

  // Retry once if we get an empty response (GLM rate limiting issue)
  if (!response.content && retryCount < 1) {
    logger.warn('[SOAP Specialist] Empty response, retrying...', { role, retryCount })
    await new Promise(resolve => setTimeout(resolve, 500)) // Small delay before retry
    return consultSpecialist(role, patientData, retryCount + 1)
  }

  const content = response.content

  // Debug: log what GLM returned
  logger.info('[SOAP Specialist] GLM response', {
    role,
    contentLength: content.length,
    content: content.slice(0, 500),
  })

  // Parse natural language format: DIAGNÓSTICO: ... | URGENCIA: ... | CONFIANZA: ...
  // Also handle if GLM outputs in a different format
  let diagnosis = 'Evaluación completada'
  let urgency: UrgencyLevel = 'moderate'
  let confidence = 0.7

  // Try to extract structured fields
  const diagMatch = content.match(/DIAGN[ÓO]STICO:\s*([^|]+)/i)
  const urgencyMatch = content.match(/URGENCIA:\s*([^|]+)/i)
  const confMatch = content.match(/CONFIANZA:\s*(\d+)/i)

  if (diagMatch) {
    diagnosis = diagMatch[1].trim()
  } else {
    // If no structured format, use the first meaningful sentence
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 20)
    if (sentences.length > 0) {
      // Skip reasoning sentences like "Let me analyze" or "Vamos a analizar"
      const meaningfulSentence = sentences.find(s =>
        !s.match(/let me|vamos a|desde la perspectiva|from.*perspective/i)
      )
      if (meaningfulSentence) {
        diagnosis = meaningfulSentence.trim().slice(0, 200)
      }
    }
  }

  if (urgencyMatch) {
    const urg = urgencyMatch[1].trim().toLowerCase()
    if (urg.includes('emergencia') || urg.includes('alta') || urg.includes('emergency')) {
      urgency = 'emergency'
    } else if (urg.includes('urgent') || urg.includes('media')) {
      urgency = 'moderate'
    } else if (urg.includes('baja') || urg.includes('low') || urg.includes('routine')) {
      urgency = 'routine'
    }
  }

  if (confMatch) {
    confidence = parseInt(confMatch[1], 10) / 100
  }

  return {
    role,
    diagnosis,
    confidence,
    urgency,
    redFlags: [],
    recommendations: [],
    tokensUsed: response.usage.totalTokens,
    costUSD: response.costUSD,
    _rawContent: content.slice(0, 300),
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
