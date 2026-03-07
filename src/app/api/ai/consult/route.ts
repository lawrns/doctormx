/**
 * Conversational AI Consultation API
 * Phase 1.3: Dynamic specialist selection based on symptoms
 * Phase 1.4: Streaming conversation support
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { aiChatCompletion } from '@/lib/ai/openai'
import { classifyMessage, getTier0Response } from '@/lib/ai/classifier'
import { PRECONSULTA_SYSTEM_PROMPT, PRECONSULTA_URGENCY_PROMPT } from '@/lib/ai/prompts'
import { runSOAPConsultation } from '@/lib/soap/agents'
import type { ConsensusResult } from '@/lib/soap/types'
import type { SubjectiveData, SpecialistAssessment, UrgencyLevel } from '@/lib/soap/types'

const consultRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  patientId: z.string().optional(),
})

// Dynamic specialist selection based on symptoms
const SPECIALTY_MAPPING: Record<string, string[]> = {
  'cardiology': ['dolor de pecho', 'palpitaciones', 'presión alta', 'presión baja', 'dolor en el pecho', 'cansancio extremo', 'falta de aire', 'edema'],
  'dermatology': ['erupción', 'picazón', 'sarpullido', 'manchas en la piel', 'acné', 'psoriasis', 'eczema', 'verrugas'],
  'orthopedics': ['dolor articular', 'fractura', 'esguince', 'dolor de espalda', 'dolor de cuello', 'artritis', 'lesión deportiva'],
  'neurology': ['dolor de cabeza', 'migraña', 'mareos', 'aturdimiento', 'convulsiones', 'entumecimiento', 'débil', 'problemas de memoria'],
  'gastroenterology': ['dolor abdominal', 'náuseas', 'vómitos', 'diarrea', 'estreñimiento', 'acidez', 'reflujo', 'hinchazón'],
  'pulmonology': ['tos', 'falta de aire', 'dificultad para respirar', 'respiración rápida', 'sibilancias', 'neumonía', 'asma'],
  'urology': ['dolor al orinar', 'sangre en la orina', 'infección urinaria', 'dolor lumbar', 'problemas de próstata'],
  'endocrinology': ['fatiga', 'cambios de peso', 'sudoración excesiva', 'sed excesiva', 'diabetes', 'problemas de tiroides'],
  'psychiatry': ['ansiedad', 'depresión', 'insomnio', 'cambios de humor', 'pensamientos suicidas', 'pánico', 'estrés'],
  'infectious_disease': ['fiebre', 'infección', 'gripe', 'covid', 'síntomas virales', 'dolor de garganta'],
}

function selectSpecialists(symptoms: string): string[] {
  const symptomLower = symptoms.toLowerCase()
  const matched: string[] = []
  
  // Always include general practitioner
  matched.push('general_practitioner')
  
  // Match symptoms to specialties
  for (const [specialty, keywords] of Object.entries(SPECIALTY_MAPPING)) {
    for (const keyword of keywords) {
      if (symptomLower.includes(keyword)) {
        matched.push(specialty)
        break
      }
    }
  }
  
  return [...new Set(matched)].slice(0, 4) // Max 4 specialists
}

// Emergency/red flag detection
const RED_FLAGS = [
  'dolor de pecho severo', 'dificultad para respirar severa', 'sangrado abundante',
  'pérdida de conciencia', 'convulsiones', 'parálisis', 'dolor de cabeza explosivo',
  'fiebre muy alta', 'deshidratación severa', 'pensamientos suicidas', 'intento de suicidio',
  'quemaduras graves', 'trauma craneoencefálico', 'embarazo con dolor severo',
]

type ConsultMessage = { role: 'user' | 'assistant' | 'system'; content: string }

type ExtractedSubjective = SubjectiveData & {
  enoughInformation: boolean
  followUpQuestion?: string
  urgencyHint?: UrgencyLevel
}

type ConsultationResult = {
  id: string
  primaryDiagnosis: string
  confidence: number
  specialists: Array<{
    id: string
    name: string
    specialty: string
    assessment: string
    confidence: number
  }>
  differentialDiagnoses: string[]
  urgency: UrgencyLevel
  recommendations: string[]
  nextSteps: string[]
  consensus: ConsensusResult
}

function detectRedFlags(symptoms: string): { hasRedFlag: boolean; urgency: string } {
  const symptomLower = symptoms.toLowerCase()
  const hasRedFlag = RED_FLAGS.some(flag => symptomLower.includes(flag))
  
  if (hasRedFlag) {
    return { hasRedFlag: true, urgency: 'emergency' }
  }
  
  // Check for urgent symptoms
  const urgentKeywords = ['dolor severo', 'fiebre alta', 'vómito persistente', 'deshidratación']
  const isUrgent = urgentKeywords.some(kw => symptomLower.includes(kw))
  
  if (isUrgent) {
    return { hasRedFlag: false, urgency: 'urgent' }
  }
  
  return { hasRedFlag: false, urgency: 'moderate' }
}

function sanitizeConversation(messages: ConsultMessage[]): ConsultMessage[] {
  return messages.filter((message) => message.content.trim().length > 0)
}

function buildIntakePrompt(specialists: string[], hasEmergency: boolean): string {
  return `${PRECONSULTA_SYSTEM_PROMPT}

ESPECIALISTAS RELEVANTES PARA ESTA CONSULTA: ${specialists.join(', ')}
${hasEmergency ? '⚠️ ALERTA: Se detectaron posibles síntomas de emergencia. Indica atención inmediata si se confirma riesgo actual.' : ''}

INSTRUCCIONES ADICIONALES:
- Haz solo una pregunta de alto valor por turno.
- Si ya hay información suficiente para análisis, responde con un resumen corto y agrega [READY_FOR_ANALYSIS: true] al final.
- Mantén el enfoque en triaje seguro, no diagnóstico definitivo.`
}

async function extractSubjectiveData(messages: ConsultMessage[]): Promise<ExtractedSubjective> {
  const conversation = messages
    .filter((message) => message.role !== 'system')
    .map((message) => `${message.role === 'user' ? 'Paciente' : 'Asistente'}: ${message.content}`)
    .join('\n')

  const extractionPrompt = `Analiza esta conversación clínica y extrae un estado estructurado para pre-consulta.

CONVERSACIÓN:
${conversation}

Responde SOLO en JSON válido con este esquema:
{
  "chiefComplaint": "motivo principal en una frase",
  "symptomsDescription": "resumen clínico breve y fiel a lo dicho",
  "symptomDuration": "duración o 'No especificada'",
  "symptomSeverity": 1,
  "onsetType": "sudden|gradual",
  "associatedSymptoms": ["síntoma"],
  "aggravatingFactors": ["factor"],
  "relievingFactors": ["factor"],
  "previousTreatments": ["tratamiento"],
  "medicalHistory": "texto breve o vacío",
  "medications": ["medicamento"],
  "allergies": ["alergia"],
  "familyHistory": "texto breve o vacío",
  "socialHistory": "texto breve o vacío",
  "enoughInformation": true,
  "followUpQuestion": "siguiente mejor pregunta si falta información",
  "urgencyHint": "emergency|urgent|moderate|routine|self-care"
}`

  const extracted = await aiChatCompletion({
    messages: [{ role: 'user', content: extractionPrompt }],
    temperature: 0.1,
    maxTokens: 1200,
    jsonMode: true,
    preferOpenAI: false,
  })

  const parsed = JSON.parse(extracted.content) as Partial<ExtractedSubjective>

  return {
    chiefComplaint: parsed.chiefComplaint || 'Consulta general',
    symptomsDescription: parsed.symptomsDescription || conversation.slice(0, 500),
    symptomDuration: parsed.symptomDuration || 'No especificada',
    symptomSeverity: Math.min(10, Math.max(1, Number(parsed.symptomSeverity || 5))),
    onsetType: parsed.onsetType === 'sudden' ? 'sudden' : 'gradual',
    associatedSymptoms: Array.isArray(parsed.associatedSymptoms) ? parsed.associatedSymptoms : [],
    aggravatingFactors: Array.isArray(parsed.aggravatingFactors) ? parsed.aggravatingFactors : [],
    relievingFactors: Array.isArray(parsed.relievingFactors) ? parsed.relievingFactors : [],
    previousTreatments: Array.isArray(parsed.previousTreatments) ? parsed.previousTreatments : [],
    medicalHistory: parsed.medicalHistory || '',
    medications: Array.isArray(parsed.medications) ? parsed.medications : [],
    allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
    familyHistory: parsed.familyHistory || '',
    socialHistory: parsed.socialHistory || '',
    enoughInformation: Boolean(parsed.enoughInformation),
    followUpQuestion: parsed.followUpQuestion || '¿Desde cuándo comenzaron los síntomas y qué tan intensos son del 1 al 10?',
    urgencyHint: parsed.urgencyHint || 'moderate',
  }
}

async function classifyUrgency(messages: ConsultMessage[]): Promise<{ urgency: UrgencyLevel; specialty: string; confidence: number; redFlags: string[]; recommendedAction: string }> {
  const conversation = messages
    .filter((message) => message.role !== 'system')
    .map((message) => `${message.role === 'user' ? 'Paciente' : 'Asistente'}: ${message.content}`)
    .join('\n')

  const response = await aiChatCompletion({
    messages: [{ role: 'user', content: PRECONSULTA_URGENCY_PROMPT.replace('{conversation}', conversation) }],
    temperature: 0.1,
    maxTokens: 800,
    jsonMode: true,
    preferOpenAI: false,
  })

  const parsed = JSON.parse(response.content) as {
    urgency?: UrgencyLevel
    specialty?: string
    confidence?: number
    redFlags?: string[]
    recommendedAction?: string
  }

  return {
    urgency: parsed.urgency || 'moderate',
    specialty: parsed.specialty || 'medicina general',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    recommendedAction: parsed.recommendedAction || 'book-appointment',
  }
}

function buildNextSteps(urgency: UrgencyLevel, referralNeeded: boolean): string[] {
  if (urgency === 'emergency') {
    return ['Ve al hospital o llama a emergencias inmediatamente.']
  }

  if (urgency === 'urgent') {
    return ['Programa una cita médica en las próximas 24-48 horas.']
  }

  if (referralNeeded) {
    return ['Agenda una consulta con el especialista recomendado lo antes posible.']
  }

  if (urgency === 'self-care') {
    return ['Sigue las medidas de autocuidado y monitorea cualquier empeoramiento.']
  }

  return ['Programa una cita de seguimiento en 1-2 semanas si no mejoras.']
}

function mapSpecialists(specialists: SpecialistAssessment[]): ConsultationResult['specialists'] {
  return specialists.map((specialist) => ({
    id: specialist.specialistId,
    name: specialist.specialist.name,
    specialty: specialist.specialist.description,
    assessment: specialist.clinicalImpression || specialist.reasoningNotes || 'Evaluación completada',
    confidence: specialist.confidence,
  }))
}

function mapConsultationResult(consultation: Awaited<ReturnType<typeof runSOAPConsultation>>): ConsultationResult {
  const consensus = consultation.assessment?.consensus
  const specialists = consultation.assessment?.specialists || []
  const plan = consultation.plan
  const primaryDiagnosis = consensus?.primaryDiagnosis?.name || specialists[0]?.differentialDiagnoses?.[0]?.name || 'En evaluación'

  return {
    id: consultation.id,
    primaryDiagnosis,
    confidence: consensus?.confidenceScore || 0.5,
    specialists: mapSpecialists(specialists),
    differentialDiagnoses: (consensus?.differentialDiagnoses || [])
      .map((diagnosis) => diagnosis.name)
      .filter(Boolean)
      .slice(0, 3),
    urgency: consensus?.urgencyLevel || 'moderate',
    recommendations: plan?.recommendations || [consensus?.supervisorSummary || 'Consulta médica recomendada.'],
    nextSteps: buildNextSteps(consensus?.urgencyLevel || 'moderate', Boolean(plan?.referralNeeded)),
    consensus: consensus || {
      kendallW: 0,
      agreementLevel: 'disagreement',
      primaryDiagnosis: null,
      differentialDiagnoses: [],
      consensusCategory: 'conflict',
      urgencyLevel: 'moderate',
      combinedRedFlags: [],
      recommendedSpecialty: null,
      recommendedTests: [],
      supervisorSummary: 'No fue posible generar consenso.',
      confidenceScore: 0,
      requiresHumanReview: true,
    },
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request
    const body = await request.json()
    const parsed = consultRequestSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { messages, patientId } = parsed.data
    const conversation = sanitizeConversation(messages as ConsultMessage[])
    const userMessage = conversation[conversation.length - 1]?.content || ''

    // ── Tier 0 fast-path: social/admin messages skip all AI processing ────────
    if (userMessage) {
      const classification = classifyMessage(userMessage)
      if (classification.tier === 0) {
        const fastResponse = getTier0Response(userMessage, classification.bucket)
        if (fastResponse) {
          return NextResponse.json({
            message: fastResponse,
            complete: false,
            specialists: [],
            responseMode: 'fast-path',
            classification: classification.bucket,
            meta: { latencyMs: Date.now() - startTime, provider: 'fast-path', model: 'none', costUSD: 0 },
          })
        }
      }
    }
    // ── End Tier 0 ────────────────────────────────────────────────────────────

    // Determine conversation state
    const conversationLength = conversation.filter(m => m.role === 'user').length
    
    // Extract symptoms and select specialists
    const specialists = selectSpecialists(userMessage)
    const redFlagCheck = detectRedFlags(userMessage)
    const subjective = await extractSubjectiveData(conversation)
    const urgencyAssessment = await classifyUrgency(conversation)
    
    // Build system prompt
    const systemPrompt = buildIntakePrompt(specialists, redFlagCheck.hasRedFlag || urgencyAssessment.urgency === 'emergency')

    // Call AI for conversation
    const response = await aiChatCompletion({
      messages: conversation.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
      system: systemPrompt,
      temperature: 0.3,
      maxTokens: 1024,
      preferOpenAI: false,
    })

    const isReadyForAnalysis = response.content.includes('[READY_FOR_ANALYSIS: true]') || subjective.enoughInformation || conversationLength >= 4
    const cleanedContent = response.content.replace('[READY_FOR_ANALYSIS: true]', '').trim()

    // If ready for analysis, run multi-specialist consultation
    if (isReadyForAnalysis && conversationLength >= 3) {
      const consultation = await runSOAPConsultation(patientId || user.id, subjective)

      if (consultation.status === 'error' || !consultation.assessment || !consultation.plan) {
        throw new Error('SOAP consultation failed')
      }

      const analysisResult = mapConsultationResult(consultation)
      
      return NextResponse.json({
        message: `${cleanedContent}\n\nHe completado el análisis con nuestro panel de especialistas. Aquí están los resultados:`,
        complete: true,
        result: analysisResult,
        specialists,
        meta: {
          latencyMs: Date.now() - startTime,
          provider: response.provider,
          model: response.model,
          costUSD: response.costUSD,
        },
      })
    }

    // Continue conversation
    return NextResponse.json({
      message: cleanedContent || subjective.followUpQuestion,
      complete: false,
      specialists,
      meta: {
        latencyMs: Date.now() - startTime,
        provider: response.provider,
        model: response.model,
        costUSD: response.costUSD,
      },
    })

  } catch (error) {
    console.error('[AI Consult] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
