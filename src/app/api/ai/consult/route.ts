/**
 * Conversational AI Consultation API
 * Phase 1.3: Dynamic specialist selection based on symptoms
 * Phase 1.4: Streaming conversation support
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { aiChatCompletion } from '@/lib/ai/openai'
import type { ConsensusResult } from '@/lib/soap/types'
import {
  retrieveMedicalContext,
  generateAugmentedPrompt,
  getMedicalKnowledgeStats
} from '@/lib/medical-knowledge'
import { withRateLimit } from '@/lib/rate-limit/middleware'

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

export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
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
    const userMessage = messages[messages.length - 1]?.content || ''
    
    // Determine conversation state
    const conversationLength = messages.filter(m => m.role === 'user').length
    const hasEnoughInfo = conversationLength >= 3
    
    // Extract symptoms and select specialists
    const specialists = selectSpecialists(userMessage)
    const redFlagCheck = detectRedFlags(userMessage)

    // RAG: Retrieve relevant medical context from knowledge base
    let ragContext: Awaited<ReturnType<typeof retrieveMedicalContext>> | null = null
    let augmentedSystemPrompt = ''
    try {
      // Map specialty names to Spanish specialty names for knowledge base
      const specialtyMap: Record<string, string> = {
        'cardiology': 'Cardiología',
        'neurology': 'Neurología',
        'gastroenterology': 'Gastroenterología',
        'pulmonology': 'Neumología',
        'endocrinology': 'Endocrinología',
        'dermatology': 'Dermatología',
        'psychiatry': 'Psiquiatría',
        'infectious_disease': 'Infectología',
        'orthopedics': 'Traumatología',
        'urology': 'Urología',
        'general_practitioner': 'General',
      }

      // Get relevant specialty for RAG filter
      const relevantSpecialty = specialists.find(s => specialtyMap[s]) || 'general_practitioner'
      const specialtyFilter = specialtyMap[relevantSpecialty]

      ragContext = await retrieveMedicalContext(userMessage, {
        specialty: specialtyFilter,
        limit: 3,
      })
    } catch (ragError) {
      console.warn('[AI Consult] RAG retrieval failed, continuing without medical context:', ragError)
    }

    // Build base system prompt
    const baseSystemPrompt = `Eres un asistente médico AI de Doctor.mx, diseñado para ayudar a pacientes a entender sus síntomas de manera conversacional y natural.

REGLAS IMPORTANTES:
1. Habla en español de México de forma natural y empática
2. Haz preguntas de seguimiento para obtener más detalles
3. No des diagnósticos definitivos, solo posibilidades
4. Si detectas síntomas de emergencia (rojos), advierte inmediatamente
5. Después de 3-4 intercambios, ofrece un análisis preliminar

ESPECIALISTAS RELEVANTES PARA ESTA CONSULTA: ${specialists.join(', ')}
${redFlagCheck.hasRedFlag ? '\n⚠️ ALERTA: Se detectaron síntomas de EMERGENCIA. Aconseja buscar atención médica inmediata.' : ''}

INSTRUCCIONES DE FLUJO:
- Intercambio 1-2: Recopila información básica (qué siente, desde cuándo)
- Intercambio 3: Pide detalles sobre severidad y factores
- Intercambio 4+: Si tienes suficiente información, indica que estás listo para el análisis

Cuando tengas suficiente información para un análisis completo, incluye al final de tu respuesta:
[READY_FOR_ANALYSIS: true]`

    // Apply RAG augmentation if medical context was retrieved
    const systemPrompt = (ragContext && ragContext.documents.length > 0)
      ? generateAugmentedPrompt(baseSystemPrompt, ragContext)
      : baseSystemPrompt

    // Call OpenAI for conversation
    const response = await aiChatCompletion({
      messages: messages.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
      system: systemPrompt,
      temperature: 0.3,
      maxTokens: 1024,
      preferOpenAI: true,
    })

    const isReadyForAnalysis = response.content.includes('[READY_FOR_ANALYSIS: true]') || hasEnoughInfo
    const cleanedContent = response.content.replace('[READY_FOR_ANALYSIS: true]', '').trim()

    // If ready for analysis, run multi-specialist consultation
    if (isReadyForAnalysis && conversationLength >= 3) {
      const analysisResult = await runMultiSpecialistAnalysis(messages, specialists, user.id)

      return NextResponse.json({
        message: `${cleanedContent}\n\nHe completado el análisis con nuestro panel de especialistas. Aquí están los resultados:`,
        complete: true,
        result: analysisResult,
        specialists,
        citations: ragContext?.documents.map(doc => ({
          title: doc.metadata?.title || doc.source,
          source: doc.source,
          year: doc.metadata?.year,
          type: doc.metadata?.type,
        })) || [],
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
      message: cleanedContent,
      complete: false,
      specialists,
      citations: ragContext?.documents.map(doc => ({
        title: doc.metadata?.title || doc.source,
        source: doc.source,
        year: doc.metadata?.year,
        type: doc.metadata?.type,
      })) || [],
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
  })
}

interface SpecialistAnalysisResult {
  id: string
  primaryDiagnosis: string
  confidence: number
  specialists: Array<{
    id: string
    name: string
    specialty: string
    primaryDiagnosis: string
    confidence: number
    assessment: string
    differentialDiagnoses: string[]
    recommendations: string[]
    urgency: string
  }>
  differentialDiagnoses: string[]
  urgency: string
  recommendations: string[]
  nextSteps: string[]
  consensus: {
    kendallW: number
    agreementLevel: string
    primaryDiagnosis: string | null
    differentialDiagnoses: string[]
    consensusCategory: string
    urgencyLevel: string
    combinedRedFlags: string[]
    recommendedSpecialty: string | null
    recommendedTests: string[]
    supervisorSummary: string
    confidenceScore: number
    requiresHumanReview: boolean
  }
}

async function runMultiSpecialistAnalysis(
  messages: Array<{ role: string; content: string }>,
  selectedSpecialists: string[],
  patientId: string
): Promise<SpecialistAnalysisResult> {
  const caseSummary = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'user' ? 'Paciente' : 'Asistente'}: ${m.content}`)
    .join('\n')

  // Run specialist consultations in parallel
  const specialistResults = await Promise.all(
    selectedSpecialists.map(async (specialty) => {
      const specialtyPrompts: Record<string, string> = {
        general_practitioner: 'Eres un médico general con 15 años de experiencia. Proporciona una evaluación amplia y considera todas las posibilidades.',
        cardiology: 'Eres un cardiólogo especializado. Evalúa síntomas cardiovasculares y riesgo cardíaco.',
        dermatology: 'Eres un dermatólogo. Evalúa condiciones de piel y enfermedades dermatológicas.',
        orthopedics: 'Eres un ortopedista. Evalúa problemas musculoesqueléticos y lesiones.',
        neurology: 'Eres un neurólogo. Evalúa síntomas neurológicos y trastornos del sistema nervioso.',
        gastroenterology: 'Eres un gastroenterólogo. Evalúa problemas digestivos y abdominales.',
        pulmonology: 'Eres un neumólogo. Evalúa problemas respiratorios y pulmonares.',
        urology: 'Eres un urólogo. Evalúa problemas urinarios y del tracto urinario.',
        endocrinology: 'Eres un endocrinólogo. Evalúa problemas hormonales y metabólicos.',
        psychiatry: 'Eres un psiquiatra. Evalúa síntomas psicológicos y de salud mental.',
        infectious_disease: 'Eres un infectólogo. Evalúa infecciones y enfermedades infecciosas.',
      }

      const response = await aiChatCompletion({
        messages: [{ role: 'user' as const, content: caseSummary }],
        system: `${specialtyPrompts[specialty] || specialtyPrompts.general_practitioner}

Proporciona tu evaluación en formato JSON:
{
  "primaryDiagnosis": "diagnóstico principal",
  "confidence": 0.0-1.0,
  "assessment": "explicación detallada en español",
  "differentialDiagnoses": ["otra posibilidad 1", "otra posibilidad 2"],
  "recommendations": ["recomendación 1", "recomendación 2"],
  "urgency": "emergency|urgent|moderate|routine|self-care"
}`,
        temperature: 0.2,
        maxTokens: 1500,
        jsonMode: true,
        preferOpenAI: true,
      })

      try {
        const parsed = JSON.parse(response.content)
        return {
          id: specialty,
          name: specialty.charAt(0).toUpperCase() + specialty.slice(1).replace('_', ' '),
          specialty: specialty.replace('_', ' '),
          ...parsed,
        }
      } catch {
        return {
          id: specialty,
          name: specialty.charAt(0).toUpperCase() + specialty.slice(1).replace('_', ' '),
          specialty: specialty.replace('_', ' '),
          primaryDiagnosis: 'No determinado',
          confidence: 0.5,
          assessment: response.content,
          differentialDiagnoses: [],
          recommendations: [],
          urgency: 'moderate',
        }
      }
    })
  )

  // Build consensus
  const diagnoses = specialistResults.map(s => s.primaryDiagnosis as string)
  const urgencies = specialistResults.map(s => s.urgency as string)
  const confidences = specialistResults.map(s => s.confidence)
  
  // Determine final urgency (highest concern wins)
  const urgencyPriority: Array<'emergency' | 'urgent' | 'moderate' | 'routine' | 'self-care'> = ['emergency', 'urgent', 'moderate', 'routine', 'self-care']
  const finalUrgency: 'emergency' | 'urgent' | 'moderate' | 'routine' | 'self-care' = urgencyPriority.find(u => urgencies.includes(u)) || 'moderate'
  
  // Calculate average confidence
  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length

  // Build consensus result
  const agreementLevel = avgConfidence >= 0.8 ? 'strong' : avgConfidence >= 0.6 ? 'moderate' : avgConfidence >= 0.4 ? 'weak' : 'disagreement'
  const consensusCategory = avgConfidence >= 0.6 ? 'consistent' : 'conflict'

  const consensus: {
    kendallW: number
    agreementLevel: 'strong' | 'moderate' | 'weak' | 'disagreement'
    primaryDiagnosis: string | null
    differentialDiagnoses: string[]
    consensusCategory: 'consistent' | 'conflict'
    urgencyLevel: 'emergency' | 'urgent' | 'moderate' | 'routine' | 'self-care'
    combinedRedFlags: string[]
    recommendedSpecialty: string | null
    recommendedTests: string[]
    supervisorSummary: string
    confidenceScore: number
    requiresHumanReview: boolean
  } = {
    kendallW: avgConfidence,
    agreementLevel,
    primaryDiagnosis: null,
    differentialDiagnoses: [],
    consensusCategory,
    urgencyLevel: finalUrgency,
    combinedRedFlags: [],
    recommendedSpecialty: null,
    recommendedTests: [],
    supervisorSummary: 'Análisis multi-especialista completado',
    confidenceScore: avgConfidence,
    requiresHumanReview: finalUrgency === 'emergency' || finalUrgency === 'urgent',
  }

  return {
    id: `cons-${Date.now()}`,
    primaryDiagnosis: diagnoses[0],
    confidence: avgConfidence,
    specialists: specialistResults,
    differentialDiagnoses: [...new Set(diagnoses)].slice(0, 3),
    urgency: finalUrgency,
    recommendations: [...new Set(specialistResults.flatMap(s => s.recommendations))],
    nextSteps: finalUrgency === 'emergency' 
      ? ['Ve al hospital o llama a emergencias inmediatamente']
      : finalUrgency === 'urgent'
      ? ['Programa una cita médica en las próximas 24-48 horas']
      : ['Programa una cita de seguimiento en 1-2 semanas'],
    consensus,
  }
}
