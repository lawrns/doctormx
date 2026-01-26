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

/**
 * Consult a single specialist
 */
async function consultSpecialist(
  role: SpecialistRole,
  patientData: string
): Promise<StreamingAssessment> {
  // Specialist-specific prompts for medical accuracy with fast JSON response
  const rolePrompts: Record<SpecialistRole, string> = {
    'general-practitioner': 'Eres un médico general experimentado. Evalúa el cuadro clínico general e identifica condiciones graves.',
    'dermatologist': 'Eres una dermatóloga certificada. Evalúa cualquier manifestación cutánea o falta de ella.',
    'internist': 'Eres un internista certificado. Evalúa enfermedades sistémicas y multisistémicas.',
    'psychiatrist': 'Eres una psiquiatra certificada. Evalúa componentes psicológicos y emocionales.',
  }

  const prompt = `${rolePrompts[role]}
Responde SOLO en JSON válido: {"clinicalImpression":"impresión clínica breve","urgencyLevel":"emergency|urgent|moderate|routine|self-care","redFlags":["signos de alarma"],"recommendedTests":["estudios sugeridos"],"confidence":0.0-1.0}`

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

  try {
    const parsed = JSON.parse(response.content)
    // Map to expected schema - clinicalImpression is the main field per prompts
    return {
      role,
      diagnosis: parsed.clinicalImpression ||
                 parsed.differentialDiagnoses?.[0]?.name ||
                 'Evaluación en proceso',
      confidence: parsed.confidence || 0.5,
      urgency: parsed.urgencyLevel || 'moderate',
      redFlags: parsed.redFlags || [],
      recommendations: parsed.recommendedTests || parsed.recommendations || [],
      tokensUsed: response.usage.totalTokens,
      costUSD: response.costUSD,
    }
  } catch (err) {
    // GLM might return reasoning_content for some models, try to extract
    const content = response.content
    return {
      role,
      diagnosis: content.slice(0, 200) || 'Evaluación completada',
      confidence: 0.5,
      urgency: 'moderate' as UrgencyLevel,
      redFlags: [],
      recommendations: ['Consultar con un médico para evaluación completa'],
      tokensUsed: response.usage.totalTokens,
      costUSD: response.costUSD,
    }
  }
}

/**
 * Build consensus from specialist assessments
 */
async function buildConsensus(
  specialists: StreamingAssessment[]
): Promise<StreamingConsensus> {
  // Simplified consensus prompt for faster response
  const simpleConsensusPrompt = `Sintetiza las evaluaciones médicas en JSON:
{"primaryDiagnosis":"nombre del diagnóstico más probable","urgencyLevel":"emergency|urgent|moderate|routine|self-care","agreementLevel":"strong|moderate|weak","confidenceScore":0.8,"combinedRedFlags":["..."],"requiresHumanReview":false}`

  const specialistSummary = specialists.map(s =>
    `${s.role}: ${s.diagnosis.slice(0, 100)} (${s.urgency})`
  ).join('\n')

  const response = await glmChatCompletion({
    messages: [
      { role: 'system', content: simpleConsensusPrompt },
      { role: 'user', content: specialistSummary },
    ],
    model: GLM_CONFIG.models.costEffective,
    jsonMode: true,
    temperature: 0.2,
    maxTokens: 500, // Reduced for faster response
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
  // Simplified prompt for faster response
  const simplePlanPrompt = `Genera un plan de tratamiento breve en JSON:
{"recommendations":["..."],"selfCareInstructions":["..."],"followUpTiming":"...","followUpType":"telemedicine|in-person","returnPrecautions":["..."]}`

  const response = await glmChatCompletion({
    messages: [
      { role: 'system', content: simplePlanPrompt },
      { role: 'user', content: `Diagnóstico: ${consensus.primaryDiagnosis || 'Cefalea'}, Urgencia: ${consensus.urgencyLevel}, Síntoma: ${subjective.chiefComplaint}` },
    ],
    model: GLM_CONFIG.models.costEffective,
    jsonMode: true,
    temperature: 0.3,
    maxTokens: 500, // Reduced for faster response
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
