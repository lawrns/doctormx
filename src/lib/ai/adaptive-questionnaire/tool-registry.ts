/**
 * Tool Registry
 * Manages all available tools for the adaptive questionnaire system
 */

import { z } from 'zod'
import { Tool, ToolResult, ConversationContext, Symptom, DiagnosticHypothesis } from './types'
import { stateTransitionEngine } from './state-engine'

// Schema definitions for tool parameters
const AnalyzeSymptomSchema = z.object({
  symptom_name: z.string(),
  description: z.string(),
  patient_text: z.string()
})

const AssessUrgencySchema = z.object({
  symptoms: z.array(z.string()),
  patient_text: z.string()
})

const GenerateDifferentialSchema = z.object({
  symptoms: z.array(z.string()),
  patient_info: z.object({
    age: z.number().optional(),
    gender: z.string().optional(),
    medical_history: z.array(z.string()).optional()
  }).optional()
})

const GenerateFollowUpQuestionSchema = z.object({
  current_symptoms: z.array(z.string()),
  knowledge_gaps: z.array(z.string()),
  phase: z.enum(['history_taking', 'focused_inquiry', 'synthesis'])
})

const ExtractSymptomDetailsSchema = z.object({
  symptom_name: z.string(),
  patient_responses: z.array(z.string())
})

const CheckDrugInteractionsSchema = z.object({
  medications: z.array(z.string()),
  symptoms: z.array(z.string()).optional()
})

const TriagePatientSchema = z.object({
  symptoms: z.array(z.string()),
  urgency_level: z.enum(['low', 'medium', 'high', 'emergency']),
  red_flags: z.array(z.string())
})

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map()

  constructor() {
    this.registerDefaultTools()
  }

  register(tool: Tool): void {
    this.tools.set(tool.name, tool)
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name)
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values())
  }

  getAvailableTools(context: ConversationContext): Tool[] {
    // Filter tools based on conversation phase and state
    const { phase, urgency_level } = context.state
    const allTools = this.getAll()

    // Always available tools
    const alwaysAvailable = ['analyzeSymptom', 'extractSymptomDetails', 'detectRedFlags']

    // Phase-specific tools
    const phaseTools: Record<string, string[]> = {
      'history_taking': ['analyzeSymptom', 'extractSymptomDetails', 'detectRedFlags', 'generateFollowUpQuestion'],
      'focused_inquiry': ['analyzeSymptom', 'extractSymptomDetails', 'detectRedFlags', 'generateDifferentialDiagnosis', 'generateFollowUpQuestion', 'checkDrugInteractions'],
      'synthesis': ['generateDifferentialDiagnosis', 'triagePatient', 'summarizeConversation']
    }

    const allowedTools = phaseTools[phase] || alwaysAvailable

    // If emergency, prioritize triage
    if (urgency_level === 'emergency' || urgency_level === 'high') {
      allowedTools.push('triagePatient')
    }

    return allTools.filter(tool => allowedTools.includes(tool.name))
  }

  private registerDefaultTools(): void {
    // Tool 1: Analyze Symptom
    this.register({
      name: 'analyzeSymptom',
      description: 'Analyzes a symptom description to extract structured information',
      parameters: AnalyzeSymptomSchema.shape,
      execute: async (params, context) => {
        try {
          const { description, patient_text } = AnalyzeSymptomSchema.parse(params)
          const fullText = description + ' ' + patient_text
          
          // Extract actual symptom name from text
          const symptomName = this.extractSymptomName(fullText)
          
          // Analyze the symptom using pattern matching and NLP heuristics
          const symptom: Partial<Symptom> = {
            name: symptomName,
            ...this.extractSymptomCharacteristics(fullText)
          }

          return {
            success: true,
            data: symptom,
            confidence: 0.8
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    })

    // Tool 2: Assess Urgency
    this.register({
      name: 'assessUrgency',
      description: 'Assesses the urgency level of patient symptoms',
      parameters: AssessUrgencySchema.shape,
      execute: async (params, context) => {
        try {
          const { symptoms, patient_text } = AssessUrgencySchema.parse(params)
          
          const redFlags = stateTransitionEngine.detectRedFlags(symptoms.join(' ') + ' ' + patient_text)
          const urgencyLevel = stateTransitionEngine.calculateUrgencyLevel({
            ...context.state,
            red_flags: redFlags,
            collected_symptoms: symptoms.map(s => ({ name: s }))
          })

          return {
            success: true,
            data: {
              urgency_level: urgencyLevel,
              red_flags: redFlags,
              requires_immediate_attention: urgencyLevel === 'emergency' || urgencyLevel === 'high'
            },
            confidence: redFlags.length > 0 ? 0.95 : 0.7
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    })

    // Tool 3: Generate Differential Diagnosis
    this.register({
      name: 'generateDifferentialDiagnosis',
      description: 'Generates a ranked list of possible diagnoses based on symptoms',
      parameters: GenerateDifferentialSchema.shape,
      execute: async (params, context) => {
        try {
          const { symptoms, patient_info } = GenerateDifferentialSchema.parse(params)
          
          // Use AI to generate differential diagnoses
          const diagnoses = await this.generateAIDifferentialDiagnoses(symptoms, patient_info)

          return {
            success: true,
            data: diagnoses,
            confidence: 0.75
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    })

    // Tool 4: Generate Follow-up Question
    this.register({
      name: 'generateFollowUpQuestion',
      description: 'Generates the most appropriate next question based on current state',
      parameters: GenerateFollowUpQuestionSchema.shape,
      execute: async (params, context) => {
        try {
          const { current_symptoms, knowledge_gaps, phase } = GenerateFollowUpQuestionSchema.parse(params)
          
          const question = this.generateSmartFollowUpQuestion(current_symptoms, knowledge_gaps, phase, context)

          return {
            success: true,
            data: question,
            confidence: 0.85
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    })

    // Tool 5: Extract Symptom Details
    this.register({
      name: 'extractSymptomDetails',
      description: 'Extracts detailed information about a specific symptom from patient responses',
      parameters: ExtractSymptomDetailsSchema.shape,
      execute: async (params, context) => {
        try {
          const { symptom_name, patient_responses } = ExtractSymptomDetailsSchema.parse(params)
          
          const details = this.extractDetailedSymptomInfo(symptom_name, patient_responses)

          return {
            success: true,
            data: details,
            confidence: 0.8
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    })

    // Tool 6: Check Drug Interactions
    this.register({
      name: 'checkDrugInteractions',
      description: 'Checks for potential drug interactions with current symptoms',
      parameters: CheckDrugInteractionsSchema.shape,
      execute: async (params, context) => {
        try {
          const { medications, symptoms } = CheckDrugInteractionsSchema.parse(params)
          
          const interactions = this.checkKnownDrugInteractions(medications, symptoms || [])

          return {
            success: true,
            data: interactions,
            confidence: 0.9
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    })

    // Tool 7: Triage Patient
    this.register({
      name: 'triagePatient',
      description: 'Determines appropriate care level and next steps for patient',
      parameters: TriagePatientSchema.shape,
      execute: async (params, context) => {
        try {
          const { symptoms, urgency_level, red_flags } = TriagePatientSchema.parse(params)
          
          const triage = this.determineTriage(symptoms, urgency_level, red_flags)

          return {
            success: true,
            data: triage,
            confidence: 0.9
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    })

    // Tool 8: Detect Red Flags
    this.register({
      name: 'detectRedFlags',
      description: 'Detects red flag symptoms that require immediate attention',
      parameters: z.object({ text: z.string() }).shape,
      execute: async (params, context) => {
        try {
          const { text } = z.object({ text: z.string() }).parse(params)
          
          const redFlags = stateTransitionEngine.detectRedFlags(text)

          return {
            success: true,
            data: {
              red_flags: redFlags,
              has_critical: redFlags.some(rf => rf.severity === 'critical'),
              count: redFlags.length
            },
            confidence: 0.95
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    })

    // Tool 9: Summarize Conversation
    this.register({
      name: 'summarizeConversation',
      description: 'Generates a summary of the conversation for medical review',
      parameters: z.object({}).shape,
      execute: async (params, context) => {
        try {
          const summary = this.generateConversationSummary(context)

          return {
            success: true,
            data: summary,
            confidence: 0.85
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    })
  }

  private extractSymptomCharacteristics(text: string): Partial<Symptom> {
    const characteristics: string[] = []
    let severity: number | undefined
    let duration: string | undefined
    let location: string | undefined

    // Extract severity
    const severityMatch = text.match(/(\d+)\s*(?:de\s*)?10|muy\s+(?:intenso|fuerte)|leve|moderado|severo/i)
    if (severityMatch) {
      const num = parseInt(severityMatch[1])
      if (!isNaN(num)) severity = num
    }

    // Extract duration
    const durationMatch = text.match(/(\d+\s*(?:días?|semanas?|meses?|años?|horas?))|(ayer|hoy|último|pasado)/i)
    if (durationMatch) {
      duration = durationMatch[0]
    }

    // Extract location
    const locationPatterns = [
      /(?:en\s+(?:el|la)\s+)?(cabeza|pecho|abdomen|espalda|brazo|pierna|cuello|garganta|estómago)/i,
      /(?:parte\s+)?(superior|inferior|derecha|izquierda|central)/i
    ]
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern)
      if (match) {
        location = location ? `${location} ${match[1]}` : match[1]
      }
    }

    // Extract characteristics
    const characteristicKeywords = [
      'punzante', 'opresivo', 'ardiente', 'molesto', 'constante', 
      'intermitente', 'agudo', 'crónico', 'espontáneo', 'inducido'
    ]
    
    for (const keyword of characteristicKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        characteristics.push(keyword)
      }
    }

    return { severity, duration, location, characteristics }
  }

  private async generateAIDifferentialDiagnoses(
    symptoms: string[],
    patient_info?: { age?: number; gender?: string; medical_history?: string[] }
  ): Promise<DiagnosticHypothesis[]> {
    // This will be enhanced with actual AI integration
    // For now, return mock data structure
    const mockDiagnoses: DiagnosticHypothesis[] = [
      {
        diagnosis: 'Evaluación con médico necesaria',
        probability: 50,
        reasoning: 'Síntomas no específicos, requiere evaluación clínica',
        supporting_evidence: symptoms,
        contradicting_evidence: [],
        confidence: 0.6
      }
    ]

    return mockDiagnoses
  }

  private generateSmartFollowUpQuestion(
    currentSymptoms: string[],
    knowledgeGaps: string[],
    phase: string,
    context: ConversationContext
  ) {
    // Prioritize knowledge gaps
    if (knowledgeGaps.length > 0) {
      const gap = knowledgeGaps[0]
      const [type, detail] = gap.split(':')
      
      if (type === 'severity') {
        return {
          text: `En una escala del 1 al 10, ¿qué tan intenso es el ${detail}?`,
          type: 'scale',
          priority: 10,
          reasoning: 'Necesitamos evaluar la severidad del síntoma'
        }
      }
      
      if (type === 'duration') {
        return {
          text: `¿Cuánto tiempo llevas con ${detail}?`,
          type: 'open',
          priority: 10,
          reasoning: 'La duración es importante para el diagnóstico'
        }
      }
      
      if (type === 'location') {
        return {
          text: `¿Dónde exactamente sientes ${detail}?`,
          type: 'location',
          priority: 10,
          reasoning: 'La localización ayuda a identificar el origen'
        }
      }
    }

    // Phase-specific questions
    if (phase === 'history_taking') {
      return {
        text: '¿Hay algo más que me quieras contar sobre cómo te sientes?',
        type: 'open',
        priority: 5,
        reasoning: 'Exploración amplia inicial'
      }
    }

    return {
      text: '¿Has notado algún otro síntoma?',
      type: 'open',
      priority: 5,
      reasoning: 'Recopilación completa de síntomas'
    }
  }

  private extractSymptomName(text: string): string {
    const lowerText = text.toLowerCase()
    
    // Common symptom patterns to extract - ordered by specificity
    const symptomPatterns: { pattern: RegExp; name: string }[] = [
      // Respiratory emergencies first
      { pattern: /dificultad\s*(para)?\s*respirar|falta\s*(de)?\s*aire|ahogo|no\s*puedo\s*respirar|cuesta\s*respirar/i, name: 'dificultad respiratoria' },
      // Chest pain
      { pattern: /dolor.{0,20}pecho|pecho.{0,20}dolor/i, name: 'dolor de pecho' },
      // Head pain
      { pattern: /dolor.{0,20}cabeza|cabeza.{0,20}dolor|cefalea|migraña/i, name: 'dolor de cabeza' },
      // Abdominal
      { pattern: /dolor.{0,20}(abdomen|estómago|estomago|barriga|panza)/i, name: 'dolor abdominal' },
      // Back pain
      { pattern: /dolor.{0,20}espalda|espalda.{0,20}dolor/i, name: 'dolor de espalda' },
      // Throat
      { pattern: /dolor.{0,20}garganta|garganta.{0,20}dolor/i, name: 'dolor de garganta' },
      // Other specific symptoms
      { pattern: /fiebre/i, name: 'fiebre' },
      { pattern: /tos/i, name: 'tos' },
      { pattern: /náusea|nausea/i, name: 'náuseas' },
      { pattern: /vómito|vomito/i, name: 'vómitos' },
      { pattern: /diarrea/i, name: 'diarrea' },
      { pattern: /mareo|vértigo|vertigo/i, name: 'mareo' },
      { pattern: /fatiga|cansancio/i, name: 'fatiga' },
      { pattern: /ansiedad/i, name: 'ansiedad' },
      { pattern: /depresión|tristeza/i, name: 'síntomas depresivos' },
      { pattern: /insomnio|no\s*puedo\s*dormir/i, name: 'insomnio' },
      { pattern: /dolor.{0,20}(pierna|brazo|rodilla|mano|pie)/i, name: 'dolor en extremidades' },
    ]
    
    for (const { pattern, name } of symptomPatterns) {
      if (pattern.test(lowerText)) {
        return name
      }
    }
    
    // Generic pain extraction - skip adjectives like muy, fuerte, leve, etc.
    const bodyParts = ['cabeza', 'pecho', 'espalda', 'pierna', 'brazo', 'cuello', 'hombro', 'rodilla', 'tobillo', 'muñeca', 'cadera', 'costilla']
    for (const part of bodyParts) {
      if (lowerText.includes(part)) {
        return `dolor de ${part}`
      }
    }
    
    // Fallback to generic symptom
    return 'síntoma reportado'
  }

  private extractDetailedSymptomInfo(symptomName: string, responses: string[]) {
    const combinedText = responses.join(' ')
    return {
      name: symptomName,
      ...this.extractSymptomCharacteristics(combinedText),
      raw_responses: responses
    }
  }

  private checkKnownDrugInteractions(medications: string[], symptoms: string[]) {
    const knownInteractions = [
      {
        drugs: ['ibuprofeno', 'naproxeno', 'diclofenaco'],
        interactions: ['aspirina', 'warfarina', 'alcohol'],
        severity: 'high',
        description: 'Aumento del riesgo de sangrado gastrointestinal'
      },
      {
        drugs: ['metformina'],
        interactions: ['contrastes yodados', 'alcohol'],
        severity: 'high',
        description: 'Riesgo de acidosis láctica'
      },
      {
        drugs: ['warfarina', 'acenocumarol'],
        interactions: ['aspirina', 'ibuprofeno', 'vitamina K'],
        severity: 'high',
        description: 'Interferencia con anticoagulación'
      }
    ]

    const interactions = []
    const lowerMeds = medications.map(m => m.toLowerCase())

    for (const known of knownInteractions) {
      const hasDrug = known.drugs.some(drug => 
        lowerMeds.some(med => med.includes(drug))
      )
      
      if (hasDrug) {
        interactions.push({
          drugs: known.drugs.filter(drug => 
            lowerMeds.some(med => med.includes(drug))
          ),
          severity: known.severity,
          description: known.description
        })
      }
    }

    return interactions
  }

  private determineTriage(symptoms: string[], urgencyLevel: string, redFlags: string[]) {
    if (urgencyLevel === 'emergency') {
      return {
        level: 'EMERGENCY',
        action: 'CALL_EMERGENCY_SERVICES',
        message: 'Llama al 911 o ve a la sala de emergencias más cercana inmediatamente',
        timeframe: 'Inmediato',
        specialty: 'Emergencias'
      }
    }

    if (urgencyLevel === 'high') {
      return {
        level: 'URGENT',
        action: 'SAME_DAY_CARE',
        message: 'Busca atención médica hoy mismo',
        timeframe: '24 horas',
        specialty: this.inferSpecialty(symptoms)
      }
    }

    if (urgencyLevel === 'medium') {
      return {
        level: 'ROUTINE',
        action: 'SCHEDULE_APPOINTMENT',
        message: 'Agenda una consulta médica pronto',
        timeframe: '2-3 días',
        specialty: this.inferSpecialty(symptoms)
      }
    }

    return {
      level: 'SELF_CARE',
      action: 'MONITOR_SYMPTOMS',
      message: 'Monitorea tus síntomas y consulta si empeoran',
      timeframe: '1 semana',
      specialty: 'Medicina General'
    }
  }

  private inferSpecialty(symptoms: string[]): string {
    const symptomText = symptoms.join(' ').toLowerCase()
    
    if (/corazón|pecho|palpitaciones|presión/i.test(symptomText)) {
      return 'Cardiología'
    }
    if (/cabeza|mareo|vértigo|dolor.*cabeza/i.test(symptomText)) {
      return 'Neurología'
    }
    if (/estómago|diarrea|náusea|vómito|abdomen/i.test(symptomText)) {
      return 'Gastroenterología'
    }
    if (/tos|respirar|pecho|gripe/i.test(symptomText)) {
      return 'Neumología'
    }
    if (/piel|erupción|comezón/i.test(symptomText)) {
      return 'Dermatología'
    }
    if (/dolor.*espalda|articulación|hueso/i.test(symptomText)) {
      return 'Traumatología'
    }
    
    return 'Medicina General'
  }

  private generateConversationSummary(context: ConversationContext) {
    const { state, history } = context
    
    return {
      chief_complaint: state.collected_symptoms[0]?.name || 'No especificado',
      symptoms: state.collected_symptoms,
      urgency_level: state.urgency_level,
      red_flags: state.red_flags,
      diagnostic_hypotheses: state.diagnostic_hypotheses,
      question_count: state.question_count,
      duration_minutes: this.calculateDuration(state.start_time),
      conversation_phase: state.phase,
      recommended_action: state.urgency_level === 'emergency' 
        ? 'EMERGENCY_CARE' 
        : state.urgency_level === 'high' 
          ? 'URGENT_CARE' 
          : 'SCHEDULE_CONSULTATION'
    }
  }

  private calculateDuration(startTime: string): number {
    const start = new Date(startTime)
    const now = new Date()
    return Math.round((now.getTime() - start.getTime()) / 60000) // minutes
  }
}

export const toolRegistry = new ToolRegistry()
