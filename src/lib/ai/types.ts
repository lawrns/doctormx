/**
 * Tipos TypeScript para sistema de IA cooperativa
 */

// ============================================
// AI PROVIDER INTERFACES
// ============================================

export type AIProvider = 'openai' | 'glm' | 'anthropic' | 'deepseek';

export type AIProviderConfig = {
  apiKey: string;
  baseURL?: string;
  model: string;
  maxTokens: number;
  temperature: number;
};

export type AIProviderSettings = {
  openai: AIProviderConfig;
  glm: AIProviderConfig;
  anthropic?: AIProviderConfig;
  deepseek?: AIProviderConfig;
};

// ============================================
// AI CLIENT INTERFACES
// ============================================

export type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning_content?: string; // GLM specific
};

export type ChatCompletionRequest = {
  messages: ChatCompletionMessage[];
  model: string;
  max_tokens?: number;
  temperature?: number;
  response_format?: { type: 'json_object' };
};

export type ChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content?: string;
      reasoning_content?: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type TranscriptionRequest = {
  file: File | Buffer;
  model: string;
  language?: string;
  response_format: 'verbose_json';
};

export type TranscriptionResponse = {
  text: string;
  segments?: Array<{
    text: string;
    start: number;
    confidence?: number;
  }>;
  duration?: number;
};

// ============================================
// PRE-CONSULTA INTELIGENTE
// ============================================

export type PreConsultaMessage = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    cost?: number;
  };
};

export type PreConsultaSession = {
  id: string;
  patientId: string;
  doctorId?: string; // Puede no tener doctor asignado aún
  specialty?: string; // Especialidad sugerida por IA
  messages: PreConsultaMessage[];
  summary: {
    chiefComplaint: string; // Motivo principal
    symptoms: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    suggestedSpecialty: string;
    aiConfidence: number; // 0-1
  } | null;
  status: 'active' | 'completed' | 'escalated-to-doctor' | 'redirected-to-emergency';
  createdAt: Date;
  completedAt?: Date;
};

export type TriageResult = {
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  specialty: string;
  confidence: number;
  reasoning: string;
  redFlags: string[]; // Síntomas de alerta
  recommendedAction: 'book-appointment' | 'seek-emergency' | 'self-care';
};

// ============================================
// TRANSCRIPCIÓN + RESUMEN
// ============================================

export type TranscriptionSegment = {
  text: string;
  speaker?: 'doctor' | 'patient'; // Diarización si está disponible
  timestamp: number; // Segundos desde inicio
  confidence?: number;
};

export type ConsultationTranscript = {
  id: string;
  appointmentId: string;
  audioUrl: string; // Supabase Storage URL
  segments: TranscriptionSegment[];
  summary: {
    diagnosis: string;
    symptoms: string[];
    prescriptions: string[];
    followUpInstructions: string;
    nextSteps: string[];
  } | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  metadata?: {
    durationMinutes: number;
    cost: number;
    model: string;
  };
};

// ============================================
// SEGUIMIENTO POST-CONSULTA
// ============================================

export type FollowUpSchedule = {
  id: string;
  appointmentId: string;
  patientId: string;
  type: '24h-check' | '7d-progress' | '30d-outcome';
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'responded' | 'no-response' | 'escalated';
  channel: 'whatsapp' | 'email' | 'sms';
  message: string;
  response?: string;
  respondedAt?: Date;
  createdAt: Date;
};

export type FollowUpTemplate = {
  type: '24h-check' | '7d-progress' | '30d-outcome';
  delayHours: number;
  subject: string;
  template: string; // Puede tener variables {{doctorName}}, {{patientName}}, etc
  questions: string[];
};

// ============================================
// ASISTENTE DE RECETAS (FASE 2)
// ============================================

export type PrescriptionSuggestion = {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  warnings: string[];
  interactions: string[]; // Con otros medicamentos del paciente
  alternatives: {
    name: string;
    reason: string; // "Genérico más económico", "Menos efectos secundarios"
  }[];
};

// ============================================
// MATCHING INTELIGENTE (FASE 2)
// ============================================

export type MatchingScore = {
  doctorId: string;
  score: number; // 0-100
  reasons: string[];
  factors: {
    specialtyMatch: number;
    availabilityMatch: number;
    locationMatch: number;
    priceMatch: number;
    ratingMatch: number;
    experienceMatch: number;
  };
};

// ============================================
// SISTEMA DE AUDITORÍA
// ============================================

export type AIAuditLog = {
  id: string;
  operation: 'pre-consulta' | 'transcription' | 'follow-up' | 'prescription-assist' | 'matching';
  userId: string;
  userType: 'patient' | 'doctor' | 'admin';
  input: unknown; // JSON del input
  output: unknown; // JSON del output
  model: string;
  tokens?: number;
  cost?: number;
  latencyMs: number;
  status: 'success' | 'error';
  error?: string;
  timestamp: Date;
};

// ============================================
// COMPLIANCE & SAFETY
// ============================================

export type AIDisclaimer = {
  type: 'pre-consulta' | 'transcription' | 'prescription';
  text: string;
  acknowledged: boolean;
  acknowledgedAt?: Date;
};

export type SafetyCheck = {
  passed: boolean;
  flags: {
    type: 'medical-advice' | 'diagnosis-claim' | 'prescription-modification' | 'emergency-dismissal';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
  }[];
};

// ============================================
// TOOL RESULT INTERFACES
// ============================================

export type TriageToolResult = {
  level: string;
  action: string;
  message: string;
  timeframe: string;
  specialty: string;
};

export type ToolResultData = {
  success: boolean;
  data?: unknown;
  error?: string;
  confidence?: number;
};

export type ToolResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
};

// ============================================
// STRUCTURED ANALYSIS INTERFACES
// ============================================

export type StructuredAnalysisRequest<T = unknown> = {
  systemPrompt: string;
  userPrompt: string;
  schema?: string;
};

export type StructuredAnalysisResponse<T = unknown> = T;

export type ChatCompletionResponseFormatted = {
  response: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
  provider: 'glm' | 'openai';
};

export type TranscriptionResponseFormatted = {
  segments: TranscriptionSegment[];
  fullText: string;
  duration: number;
  cost: number;
};

// ============================================
// DIFFERENTIAL DIAGNOSIS INTERFACE
// ============================================

export type DifferentialDiagnosis = {
  diagnosis: string;
  probability: number; // 0-100
  reasoning: string;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  confidence: number; // 0-1
};
