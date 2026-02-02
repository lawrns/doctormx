/**
 * Adaptive AI Questionnaire System
 * Core types and interfaces for organic, adaptive medical questioning
 */

export type ConversationPhase = 'history_taking' | 'focused_inquiry' | 'synthesis'

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency'

export type Symptom = {
  name: string
  severity?: number // 1-10
  duration?: string
  frequency?: string
  location?: string
  characteristics?: string[]
  triggers?: string[]
  relievers?: string[]
  associated_symptoms?: string[]
}

export type DiagnosticHypothesis = {
  diagnosis: string
  probability: number // 0-100
  reasoning: string
  supporting_evidence: string[]
  contradicting_evidence: string[]
  confidence: number // 0-1
}

export type RedFlag = {
  symptom: string
  severity: 'high' | 'critical'
  message: string
  action: string
  detected_at: string // ISO timestamp
}

export type ConversationState = {
  phase: ConversationPhase
  collected_symptoms: Symptom[]
  patient_info: {
    age?: number
    gender?: string
    medical_history?: string[]
    current_medications?: string[]
    allergies?: string[]
  }
  diagnostic_hypotheses: DiagnosticHypothesis[]
  knowledge_gaps: string[]
  urgency_level: UrgencyLevel
  red_flags: RedFlag[]
  questions_asked: string[]
  question_count: number
  start_time: string
  last_update: string
  completed: boolean
}

export type ToolResult = {
  success: boolean
  data?: unknown
  error?: string
  confidence?: number
}

export type Tool = {
  name: string
  description: string
  parameters: Record<string, unknown>
  execute: (params: unknown, context: ConversationContext) => Promise<ToolResult>
}

export type ConversationContext = {
  state: ConversationState
  history: ConversationTurn[]
  patient_id?: string
}

export type ConversationTurn = {
  id: string
  turn_number: number
  role: 'user' | 'assistant' | 'system'
  content: string
  tools_called?: ToolCall[]
  metadata?: Record<string, unknown>
  created_at: string
}

export type ToolCall = {
  tool_name: string
  parameters: unknown
  result: ToolResult
  executed_at: string
}

export type Question = {
  id: string
  text: string
  type: 'open' | 'choice' | 'scale' | 'yes_no' | 'location' | 'image'
  options?: string[]
  min_value?: number
  max_value?: number
  category: 'symptom' | 'history' | 'risk_factor' | 'red_flag' | 'follow_up'
  priority: number // 1-10, higher = more important
  reasoning: string
  expected_duration?: string
}

export type AdaptiveQuestionnaireConfig = {
  max_questions: number
  min_questions: number
  urgency_threshold: number
  red_flag_escalation: boolean
  multimodal_enabled: boolean
  voice_input_enabled: boolean
  language: string
  medical_terminology_level: 'simple' | 'standard' | 'technical'
}

export const DEFAULT_CONFIG: AdaptiveQuestionnaireConfig = {
  max_questions: 20,
  min_questions: 5,
  urgency_threshold: 0.7,
  red_flag_escalation: true,
  multimodal_enabled: true,
  voice_input_enabled: true,
  language: 'es',
  medical_terminology_level: 'simple'
}

export const RED_FLAG_PATTERNS = [
  { 
    pattern: /dolor.{0,30}pecho|pecho.{0,30}dolor|angina|infarto|ataque.{0,10}corazón/i, 
    message: 'Dolor torácico - Evaluar emergencia cardiaca',
    severity: 'critical' as const,
    action: 'CALL_EMERGENCY'
  },
  { 
    pattern: /dificultad.{0,15}respirar|cuesta.{0,10}respirar|ahogo|sibilancias|no\s+pued[oe]\s+respirar|falta.{0,10}aire/i, 
    message: 'Síntomas respiratorios graves - Evaluar emergencia',
    severity: 'critical' as const,
    action: 'CALL_EMERGENCY'
  },
  { 
    pattern: /parálisis|paralisis|debilidad.{0,20}(brazo|pierna|extremidad)|cara.{0,10}(caída|colgada)|no\s+pued[oe]\s+mover/i, 
    message: 'Posible evento neurológico - Evaluar ACV',
    severity: 'critical' as const,
    action: 'CALL_EMERGENCY'
  },
  { 
    pattern: /hemorragia|sangrado\s+fuerte|sangrado\s+no\s+para/i, 
    message: 'Sangrado significativo - Evaluar urgencia',
    severity: 'high' as const,
    action: 'URGENT_CARE'
  },
  { 
    pattern: /convulsiones|ataques|espasmos|pérdida\s+consciencia/i, 
    message: 'Convulsiones - Requiere evaluación urgente',
    severity: 'critical' as const,
    action: 'CALL_EMERGENCY'
  },
  { 
    pattern: /fiebre\s+(muy\s+)?alta|41|42|40\s+grados/i, 
    message: 'Fiebre muy alta - Riesgo de sepsis',
    severity: 'high' as const,
    action: 'URGENT_CARE'
  },
  { 
    pattern: /confusión|desorientado|no\s+reconoce|delirio/i, 
    message: 'Alteración del estado mental - Evaluar',
    severity: 'high' as const,
    action: 'URGENT_CARE'
  },
  { 
    pattern: /pensamientos\s+suicida|quiere\s+morir|autolesión|suicidio/i, 
    message: 'Ideación suicida - Intervención inmediata',
    severity: 'critical' as const,
    action: 'CRISIS_LINE'
  },
  { 
    pattern: /dolor\s+cabeza\s+peor|explosivo|thunderclap/i, 
    message: 'Cefalea thunderclap - Descartar hemorragia subaracnoidea',
    severity: 'critical' as const,
    action: 'CALL_EMERGENCY'
  },
  { 
    pattern: /abdomen\s+rígido|rebound|defensa\s+abdominal|peritonitis/i, 
    message: 'Signos de peritonitis - Evaluar emergencia quirúrgica',
    severity: 'high' as const,
    action: 'URGENT_CARE'
  }
]

export const SYMPTOM_QUESTION_TEMPLATES: Record<string, Question[]> = {
  'dolor': [
    {
      id: 'pain_location',
      text: '¿Dónde exactamente sientes el dolor?',
      type: 'location',
      category: 'symptom',
      priority: 10,
      reasoning: 'Localización es crucial para diagnóstico diferencial'
    },
    {
      id: 'pain_intensity',
      text: 'En una escala del 1 al 10, ¿qué tan intenso es el dolor?',
      type: 'scale',
      min_value: 1,
      max_value: 10,
      category: 'symptom',
      priority: 9,
      reasoning: 'Intensidad ayuda a determinar urgencia'
    },
    {
      id: 'pain_duration',
      text: '¿Cuánto tiempo llevas con este dolor?',
      type: 'open',
      category: 'symptom',
      priority: 9,
      reasoning: 'Duración indica agudo vs crónico'
    },
    {
      id: 'pain_radiation',
      text: '¿El dolor se irradia a otras partes del cuerpo?',
      type: 'yes_no',
      category: 'symptom',
      priority: 8,
      reasoning: 'Radiación puede indicar origen específico'
    },
    {
      id: 'pain_triggers',
      text: '¿Qué lo empeora o lo mejora?',
      type: 'open',
      category: 'symptom',
      priority: 7,
      reasoning: 'Factores desencadenantes orientan al diagnóstico'
    }
  ],
  'fiebre': [
    {
      id: 'fever_temperature',
      text: '¿Cuál es la temperatura máxima que has registrado?',
      type: 'open',
      category: 'symptom',
      priority: 10,
      reasoning: 'Temperatura específica determina gravedad'
    },
    {
      id: 'fever_duration',
      text: '¿Cuánto tiempo llevas con fiebre?',
      type: 'open',
      category: 'symptom',
      priority: 9,
      reasoning: 'Duración indica posible etiología'
    },
    {
      id: 'fever_pattern',
      text: '¿Es constante o va y viene?',
      type: 'choice',
      options: ['Constante', 'Intermitente', 'Solo en las noches', 'No estoy seguro'],
      category: 'symptom',
      priority: 8,
      reasoning: 'Patrón férrico orienta diagnóstico'
    }
  ],
  'tos': [
    {
      id: 'cough_type',
      text: '¿Qué tipo de tos tienes?',
      type: 'choice',
      options: ['Seca', 'Con flemas', 'Productiva (con mucosidad)', 'Nocturna', 'Ladrante'],
      category: 'symptom',
      priority: 9,
      reasoning: 'Tipo de tos indica posible causa'
    },
    {
      id: 'cough_duration',
      text: '¿Cuánto tiempo llevas con la tos?',
      type: 'open',
      category: 'symptom',
      priority: 9,
      reasoning: 'Tos aguda vs crónica'
    },
    {
      id: 'cough_sputum',
      text: 'Si tienes flemas, ¿de qué color son?',
      type: 'choice',
      options: ['Transparente/blanca', 'Amarilla/verde', 'Con sangre', 'No tengo flemas'],
      category: 'symptom',
      priority: 8,
      reasoning: 'Color del esputo indica infección vs otras causas'
    }
  ],
  'náuseas': [
    {
      id: 'nausea_vomiting',
      text: '¿Has vomitado?',
      type: 'yes_no',
      category: 'symptom',
      priority: 10,
      reasoning: 'Vómito presente o ausente cambia abordaje'
    },
    {
      id: 'nausea_frequency',
      text: '¿Cuántas veces has vomitado?',
      type: 'open',
      category: 'symptom',
      priority: 8,
      reasoning: 'Frecuencia determina gravedad y deshidratación'
    },
    {
      id: 'nausea_content',
      text: '¿Qué contenido tiene el vómito?',
      type: 'choice',
      options: ['Comida', 'Bilis (verde/amarillo)', 'Sangre', 'No he vomitado', 'No estoy seguro'],
      category: 'symptom',
      priority: 8,
      reasoning: 'Contenido del vómito orienta diagnóstico'
    }
  ],
  'diarrea': [
    {
      id: 'diarrhea_frequency',
      text: '¿Cuántas evacuaciones al día tienes?',
      type: 'open',
      category: 'symptom',
      priority: 9,
      reasoning: 'Frecuencia indica severidad'
    },
    {
      id: 'diarrhea_characteristics',
      text: '¿Cómo son las heces?',
      type: 'choice',
      options: ['Acuosas', 'Con mucosidad', 'Con sangre', 'Negras', 'Con grasa'],
      category: 'symptom',
      priority: 10,
      reasoning: 'Características de heces son diagnósticas'
    },
    {
      id: 'diarrhea_duration',
      text: '¿Cuánto tiempo llevas con diarrea?',
      type: 'open',
      category: 'symptom',
      priority: 9,
      reasoning: 'Aguda vs crónica'
    }
  ]
}
