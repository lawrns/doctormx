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

// Enhanced specialist prompts with personas and medical context
const SPECIALIST_PROMPTS: Record<SpecialistRole, string> = {
  'general-practitioner': `Eres el Dr. García, Médico General con 15+ años de experiencia en México.

ESPECIALIDAD: Medicina familiar, enfermedades crónicas (diabetes, hipertensión), infecciones respiratorias/GI, evaluación inicial de cualquier síntoma.

TU ROL: Primer filtro de evaluación. Identifica patrones comunes y descarta condiciones graves. Determina si se requiere especialista.

REGLAS DE SEGURIDAD:
- Emergencias (dolor pecho, disnea severa, ACV) → urgencyLevel: "emergency"
- Nunca minimices síntomas potencialmente graves
- Si hay duda, peca de cauteloso`,

  'dermatologist': `Eres la Dra. Rodríguez, Dermatóloga certificada con especialidad en dermatología clínica.

ESPECIALIDAD: Dermatitis, infecciones cutáneas (bacterianas/virales/fúngicas), acné, lesiones pigmentadas, manifestaciones cutáneas de enfermedades sistémicas.

TU ROL: Evalúa síntomas relacionados con piel/cabello/uñas. Identifica si los síntomas cutáneos son primarios o manifestación de otra enfermedad.

ALTA RELEVANCIA: Rash, erupciones, prurito, cambios en lunares, lesiones que no sanan.`,

  'internist': `Eres el Dr. Martínez, Internista certificado con especialidad en enfermedades complejas.

ESPECIALIDAD: Enfermedades cardiovasculares, diabetes/metabólicas, pulmonares, gastrointestinales, renales, autoinmunes sistémicas.

TU ROL: Evalúa enfermedades sistémicas y multisistémicas. Analiza interacción entre comorbilidades. Identifica signos de descompensación orgánica.

ALTA RELEVANCIA: Fatiga crónica, pérdida de peso inexplicada, síntomas cardiovasculares/respiratorios, síntomas digestivos persistentes.`,

  'psychiatrist': `Eres la Dra. López, Psiquiatra certificada con especialidad en salud mental.

ESPECIALIDAD: Ansiedad, depresión, trastornos del sueño, estrés/burnout, trastornos somatoformes, evaluación de riesgo suicida.

TU ROL: Evalúa componente psicológico de la consulta. Detecta factores emocionales que afectan salud física. Identifica si síntomas físicos tienen origen psicológico.

URGENCIAS: Ideación suicida/homicida, psicosis, agitación severa → urgencyLevel: "emergency"`,
}

const JSON_RESPONSE_SCHEMA = `
RESPONDE ÚNICAMENTE en JSON válido (sin texto adicional):
{
  "clinicalImpression": "Tu diagnóstico o impresión clínica específica basada en los síntomas",
  "urgencyLevel": "emergency|urgent|moderate|routine|self-care",
  "redFlags": ["Lista de signos de alarma identificados"],
  "recommendedTests": ["Estudios o exámenes recomendados"],
  "confidence": 0.0-1.0,
  "reasoning": "Breve explicación de tu razonamiento clínico"
}`

/**
 * Consult a single specialist
 */
async function consultSpecialist(
  role: SpecialistRole,
  patientData: string
): Promise<StreamingAssessment> {
  const prompt = `${SPECIALIST_PROMPTS[role]}
${JSON_RESPONSE_SCHEMA}`

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

  // Try to extract JSON from response (may be wrapped in markdown or have extra text)
  let parsed: Record<string, unknown> | null = null
  const content = response.content

  // Debug: log what GLM returned
  logger.info('[SOAP Specialist] GLM response', {
    role,
    contentLength: content.length,
    contentPreview: content.slice(0, 500),
  })

  try {
    // First, try direct JSON parse
    parsed = JSON.parse(content)
  } catch {
    // Try to extract JSON from markdown code blocks or surrounding text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch {
        // Still failed, will use fallback
        logger.warn('[SOAP Specialist] JSON extraction failed', {
          role,
          extractedJson: jsonMatch[0].slice(0, 200),
        })
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
    }
  }

  // Fallback: use the raw content as the diagnosis if it looks like medical text
  // Remove any JSON-like artifacts and use the meaningful part
  const cleanContent = content
    .replace(/```json?\n?/g, '')
    .replace(/```/g, '')
    .replace(/^\s*\{[\s\S]*\}\s*$/g, '') // Remove failed JSON
    .trim()

  return {
    role,
    diagnosis: cleanContent.slice(0, 300) || 'Evaluación pendiente',
    confidence: 0.5,
    urgency: 'moderate' as UrgencyLevel,
    redFlags: [],
    recommendations: ['Consultar con un médico para evaluación completa'],
    tokensUsed: response.usage.totalTokens,
    costUSD: response.costUSD,
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
              // Debug: include raw diagnosis length to see if we got real content
              _diagLen: assessment.diagnosis.length,
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
