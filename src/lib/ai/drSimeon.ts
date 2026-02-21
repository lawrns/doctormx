// Dr. Simeon - AI Medical Assistant
// Input: Patient symptoms
// Process: OPQRST methodology → Severity classification → Red flag detection
// Output: Triage summary with urgency level

import { router } from './router'
import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { retrieveMedicalContext, generateAugmentedPrompt } from '@/lib/medical-knowledge'

export type SeverityLevel = 'green' | 'yellow' | 'orange' | 'red'

export type TriageSummary = {
    chiefComplaint: string
    symptoms: string[]
    onsetTime: string
    provocation: string
    quality: string
    radiation: string
    severity: number // 1-10
    timing: string
    urgencyLevel: SeverityLevel
    redFlags: string[]
    suggestedSpecialty: string
    aiConfidence: number
    disclaimer: string
}

// Red flag patterns for emergency detection
const RED_FLAG_PATTERNS = {
    cardiovascular: {
        keywords: ['pecho', 'corazón', 'infarto', 'angina', 'presión', 'sudor', 'náusea'],
        severity: 'red',
        action: 'Llama al 911 o ve a emergencias inmediatamente',
    },
    neurological: {
        keywords: ['debilidad', 'parálisis', 'dificultad', 'habla', 'visión', 'mareo', 'convulsión'],
        severity: 'red',
        action: 'Llama al 911 o ve a emergencias inmediatamente',
    },
    respiratory: {
        keywords: ['respiración', 'ahogo', 'asfixia', 'labios', 'azules', 'pulmón'],
        severity: 'red',
        action: 'Llama al 911 o ve a emergencias inmediatamente',
    },
    abdominal: {
        keywords: ['abdomen', 'rígido', 'fiebre', 'peritonitis', 'sangrado'],
        severity: 'red',
        action: 'Llama al 911 o ve a emergencias inmediatamente',
    },
    obstetric: {
        keywords: ['embarazo', 'sangrado', 'contracciones', 'parto', 'placenta'],
        severity: 'red',
        action: 'Llama al 911 o ve a emergencias inmediatamente',
    },
    pediatric: {
        keywords: ['bebé', 'fiebre', '38', 'convulsión', 'letargo', 'deshidratación'],
        severity: 'red',
        action: 'Llama al 911 o ve a emergencias inmediatamente',
    },
    psychiatric: {
        keywords: ['suicida', 'autolesión', 'ideación', 'depresión', 'psicosis'],
        severity: 'red',
        action: 'Llama a línea de crisis o ve a emergencias',
    },
}

/**
 * Detect red flags in symptoms
 * Input: symptoms array
 * Process: Match against red flag patterns
 * Output: Array of detected red flags
 */
function detectRedFlags(symptoms: string[]): string[] {
    const symptomsLower = symptoms.map(s => s.toLowerCase()).join(' ')
    const detectedFlags: string[] = []

    for (const [category, pattern] of Object.entries(RED_FLAG_PATTERNS)) {
        const hasKeyword = pattern.keywords.some(keyword =>
            symptomsLower.includes(keyword.toLowerCase())
        )

        if (hasKeyword) {
            detectedFlags.push(`${category}: ${pattern.action}`)
        }
    }

    return detectedFlags
}

/**
 * Classify severity level based on symptoms
 * Input: symptoms, severity score
 * Process: Analyze patterns → Determine urgency
 * Output: Severity level (green/yellow/orange/red)
 */
function classifySeverity(
    symptoms: string[],
    severityScore: number,
    redFlags: string[]
): SeverityLevel {
    // Red flags = emergency
    if (redFlags.length > 0) {
        return 'red'
    }

    // Severity score 8-10 = orange (urgent)
    if (severityScore >= 8) {
        return 'orange'
    }

    // Severity score 5-7 = yellow (moderate)
    if (severityScore >= 5) {
        return 'yellow'
    }

    // Severity score 1-4 = green (mild)
    return 'green'
}

/**
 * Suggest appropriate medical specialty
 * Input: symptoms, chief complaint
 * Process: Match to specialties
 * Output: Suggested specialty
 */
function suggestSpecialty(symptoms: string[], chiefComplaint: string): string {
    const text = `${chiefComplaint} ${symptoms.join(' ')}`.toLowerCase()

    const specialtyMap: Record<string, string[]> = {
        'Medicina General': ['resfriado', 'gripe', 'fiebre', 'tos', 'dolor', 'general'],
        'Cardiología': ['corazón', 'pecho', 'presión', 'arritmia', 'infarto'],
        'Dermatología': ['piel', 'sarpullido', 'acné', 'lunar', 'picazón'],
        'Pediatría': ['bebé', 'niño', 'infantil', 'lactante'],
        'Ginecología': ['menstruación', 'embarazo', 'útero', 'ovario', 'femenino'],
        'Psiquiatría': ['depresión', 'ansiedad', 'estrés', 'mental', 'psicológico'],
        'Traumatología': ['fractura', 'esguince', 'hueso', 'articulación', 'musculoesquelético'],
        'Oftalmología': ['ojo', 'visión', 'vista', 'catarata', 'glaucoma'],
        'Neurología': ['cabeza', 'migraña', 'nervio', 'neurológico', 'convulsión'],
        'Gastroenterología': ['estómago', 'digestión', 'intestino', 'hígado', 'gastro'],
    }

    for (const [specialty, keywords] of Object.entries(specialtyMap)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return specialty
        }
    }

    return 'Medicina General'
}

/**
 * Conduct OPQRST triage assessment
 * Input: conversationHistory
 * Process: Extract OPQRST elements → Analyze → Generate summary
 * Output: Triage summary
 */
export async function conductOPQRSTAssessment(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<TriageSummary> {
    try {
        // Retrieve medical context for augmented prompts
        const userMessages = conversationHistory
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join(' ')

        const medicalContext = await retrieveMedicalContext(userMessages, { limit: 3 })

        // Build OPQRST extraction prompt
        const extractionPrompt = generateAugmentedPrompt(
            `Analiza la siguiente conversación médica y extrae los elementos OPQRST:
      - O (Onset): ¿Cuándo comenzó?
      - P (Provocation): ¿Qué lo provoca o empeora?
      - Q (Quality): ¿Cómo es el síntoma? (agudo, sordo, punzante, etc.)
      - R (Radiation): ¿Se irradia a otro lugar?
      - S (Severity): ¿Qué tan grave es? (1-10)
      - T (Timing): ¿Cuándo ocurre? (constante, intermitente, etc.)

      Responde en JSON con esta estructura:
      {
        "chiefComplaint": "queja principal",
        "symptoms": ["síntoma1", "síntoma2"],
        "onset": "descripción",
        "provocation": "descripción",
        "quality": "descripción",
        "radiation": "descripción",
        "severity": número,
        "timing": "descripción"
      }`,
            medicalContext
        )

        // Extract OPQRST elements using DeepSeek for superior triage reasoning
        const extractionResponse = await router.routeReasoning(
            [
                ...conversationHistory,
                {
                    role: 'user',
                    content: extractionPrompt,
                },
            ],
            'triage'
        )

        let opqrstData
        try {
            const jsonMatch = extractionResponse.content.match(
                /\{[\s\S]*\}/
            )
            opqrstData = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
        } catch {
            opqrstData = {}
        }

        // Detect red flags
        const symptoms = opqrstData.symptoms || []
        const redFlags = detectRedFlags(symptoms)

        // Classify severity
        const severityScore = opqrstData.severity || 5
        const urgencyLevel = classifySeverity(symptoms, severityScore, redFlags)

        // Suggest specialty
        const suggestedSpecialty = suggestSpecialty(
            symptoms,
            opqrstData.chiefComplaint || ''
        )

        // Generate summary
        const summary: TriageSummary = {
            chiefComplaint: opqrstData.chiefComplaint || 'No especificado',
            symptoms: symptoms,
            onsetTime: opqrstData.onset || 'No especificado',
            provocation: opqrstData.provocation || 'No especificado',
            quality: opqrstData.quality || 'No especificado',
            radiation: opqrstData.radiation || 'No especificado',
            severity: severityScore,
            timing: opqrstData.timing || 'No especificado',
            urgencyLevel,
            redFlags,
            suggestedSpecialty,
            aiConfidence: 0.85, // Placeholder - would be calculated from model confidence
            disclaimer:
                'La IA asiste, no diagnostica. Esta consulta es orientativa y no sustituye la evaluación médica presencial.',
        }

        return summary
    } catch (error) {
        logger.error({ err: error }, 'Error conducting OPQRST assessment')
        throw error
    }
}

/**
 * Generate Dr. Simeon response for triage
 * Input: userMessage, conversationHistory
 * Process: Generate contextual response → Ask next OPQRST question
 * Output: AI response
 */
export async function generateDrSimeonResponse(
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
    try {
        // Retrieve medical context
        const medicalContext = await retrieveMedicalContext(userMessage, { limit: 3 })

        // Build prompt for Dr. Simeon
        const systemPrompt = generateAugmentedPrompt(
            `Eres Dr. Simeon, un asistente médico virtual especializado en telemedicina para México.

Tu rol es conducir una evaluación inicial de síntomas usando la metodología OPQRST:
- Onset (Inicio): ¿Cuándo comenzó?
- Provocation (Provocación): ¿Qué lo provoca o empeora?
- Quality (Calidad): ¿Cómo es el síntoma?
- Radiation (Irradiación): ¿Se irradia a otro lugar?
- Severity (Severidad): ¿Qué tan grave es?
- Timing (Tiempo): ¿Cuándo ocurre?

Instrucciones:
1. Haz preguntas claras y empáticas en español
2. Enfócate en un elemento OPQRST por vez
3. Detecta banderas rojas (emergencias) y alerta inmediatamente
4. Mantén la conversación concisa (máximo 3-5 preguntas)
5. Siempre incluye el disclaimer: "La IA asiste, no diagnostica"
6. Sé profesional pero accesible

Banderas rojas que requieren 911:
- Dolor de pecho + sudoración + náusea
- Debilidad/parálisis súbita
- Dificultad para hablar
- Dificultad respiratoria severa
- Abdomen rígido + fiebre
- Sangrado vaginal en embarazo
- Fiebre > 38°C en bebés
- Ideación suicida activa`,
            medicalContext
        )

        // Generate response using DeepSeek for empathetic triage conversation
        const response = await router.routeChat(
            [
                { role: 'system', content: systemPrompt },
                ...conversationHistory,
            ],
            'triage',
            { preferredProvider: 'deepseek' }
        )

        return (
            response.content ||
            'Lo siento, no pude procesar tu mensaje. Por favor intenta de nuevo.'
        )
    } catch (error) {
        logger.error({ err: error }, 'Error generating Dr. Simeon response')
        throw error
    }
}

/**
 * Check if triage is complete
 * Input: conversationHistory
 * Process: Analyze conversation → Determine if enough info gathered
 * Output: Boolean
 */
export async function isTriageComplete(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<boolean> {
    // Triage is complete after 5-7 exchanges or if red flags detected
    const userMessages = conversationHistory.filter(m => m.role === 'user').length

    if (userMessages >= 5) {
        return true
    }

    // Check for red flags in conversation
    const fullText = conversationHistory
        .map(m => m.content)
        .join(' ')
        .toLowerCase()

    const hasRedFlags = Object.values(RED_FLAG_PATTERNS).some(pattern =>
        pattern.keywords.some(keyword => fullText.includes(keyword.toLowerCase()))
    )

    return hasRedFlags
}

/**
 * Log AI operation to audit trail
 * Input: operation details
 * Process: Store in ai_audit_logs
 * Output: Log record
 */
export async function logAIOperation(
    userId: string,
    userType: 'patient' | 'doctor' | 'admin',
    operation: string,
    input: Record<string, unknown>,
    output: Record<string, unknown>,
    model: string,
    tokens?: number,
    cost?: number,
    latencyMs?: number,
    status: 'success' | 'error' = 'success',
    error?: string
) {
    const supabase = createServiceClient()

    try {
        const { error: logError } = await supabase
            .from('ai_audit_logs')
            .insert({
                user_id: userId,
                user_type: userType,
                operation,
                input,
                output,
                model,
                tokens,
                cost,
                latency_ms: latencyMs,
                status,
                error,
            })

        if (logError) {
            logger.error({ err: logError }, 'Error logging AI operation')
        }
    } catch (error) {
        logger.error({ err: error }, 'Error logging AI operation')
    }
}
