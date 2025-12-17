/**
 * Cliente OpenAI para operaciones de IA
 * Wrapper centralizado con error handling, retry logic, y auditoría
 */

import { AI_CONFIG } from './config';
import type {
  PreConsultaMessage,
  TranscriptionSegment,
  AIAuditLog
} from './types';

/**
 * Cliente OpenAI singleton
 * Lazy-loaded para evitar errores en build
 */
let openaiClient: unknown = null;

async function getOpenAIClient() {
  if (!openaiClient && typeof window === 'undefined') {
    // Solo en servidor
    try {
      // Importación dinámica para evitar errores en cliente
      const { default: OpenAI } = await import('openai');
      openaiClient = new OpenAI({
        apiKey: AI_CONFIG.openai.apiKey,
      });
    } catch (error) {
      console.error('Error al inicializar OpenAI client:', error);
      throw new Error('OpenAI client no disponible');
    }
  }
  return openaiClient;
}

/**
 * Chat completion con retry logic
 */
export async function chatCompletion(params: {
  messages: PreConsultaMessage[];
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{
  response: string;
  usage: { inputTokens: number; outputTokens: number; cost: number };
}> {
  const client = getOpenAIClient();
  const { messages, systemPrompt, maxTokens, temperature } = params;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  ];

  try {
    const completion = await client.chat.completions.create({
      model: AI_CONFIG.openai.model,
      messages: apiMessages,
      max_tokens: maxTokens || AI_CONFIG.openai.maxTokens,
      temperature: temperature ?? AI_CONFIG.openai.temperature,
    });

    const usage = {
      inputTokens: completion.usage?.prompt_tokens || 0,
      outputTokens: completion.usage?.completion_tokens || 0,
      cost: 0,
    };

    // Calcular costo
    usage.cost =
      (usage.inputTokens / 1_000_000) * AI_CONFIG.costs.gpt4oMiniInputPer1M +
      (usage.outputTokens / 1_000_000) * AI_CONFIG.costs.gpt4oMiniOutputPer1M;

    return {
      response: completion.choices[0]?.message?.content || '',
      usage,
    };
  } catch (error: unknown) {
    console.error('Error en chat completion:', error);

    // Retry logic para errores de rate limit
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      throw new Error('Rate limit excedido. Intenta en unos segundos.');
    }

    if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
      throw new Error('API key inválida. Verifica configuración.');
    }

    const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : 'Desconocido';
    throw new Error(`Error de IA: ${message}`);
  }
}

/**
 * Transcripción de audio con Whisper
 */
export async function transcribeAudio(params: {
  audioFile: File | Buffer;
  language?: string;
}): Promise<{
  segments: TranscriptionSegment[];
  fullText: string;
  duration: number;
  cost: number;
}> {
  const client = getOpenAIClient();
  const { audioFile, language } = params;

  try {
    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: AI_CONFIG.whisper.model,
      language: language || AI_CONFIG.whisper.language,
      response_format: 'verbose_json', // Incluye timestamps
    });

    // Whisper verbose_json incluye segments con timestamps
    const segments: TranscriptionSegment[] = transcription.segments?.map((s: { text: string; start: number; confidence?: number }) => ({
      text: s.text,
      timestamp: s.start,
      confidence: s.confidence,
    })) || [];

    const duration = transcription.duration || 0;
    const cost = (duration / 60) * AI_CONFIG.costs.whisperPerMinute;

    return {
      segments,
      fullText: transcription.text,
      duration,
      cost,
    };
  } catch (error: unknown) {
    console.error('Error en transcripción:', error);
    const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : 'Desconocido';
    throw new Error(`Error de transcripción: ${message}`);
  }
}

/**
 * Análisis estructurado con JSON mode
 */
export async function structuredAnalysis<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  schema?: string; // Descripción del schema esperado
}): Promise<T> {
  const client = getOpenAIClient();
  const { systemPrompt, userPrompt, schema } = params;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  if (schema) {
    messages[0].content += `\n\nRespuesta DEBE ser JSON válido con este formato:\n${schema}`;
  }

  try {
    const completion = await client.chat.completions.create({
      model: AI_CONFIG.openai.model,
      messages,
      response_format: { type: 'json_object' }, // Fuerza JSON
      temperature: 0.2, // Más determinístico para análisis
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(responseText) as T;
  } catch (error: unknown) {
    console.error('Error en análisis estructurado:', error);
    const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : 'Desconocido';
    throw new Error(`Error de análisis: ${message}`);
  }
}

/**
 * Safety check - detecta si la respuesta de IA está dando consejos médicos inapropiados
 */
export async function safetyCheck(text: string): Promise<{
  safe: boolean;
  flags: string[];
}> {
  const dangerousPatterns = [
    /tienes|padeces|sufres de/i, // Diagnóstico directo
    /deberías tomar|toma este medicamento/i, // Prescripción
    /no es urgente|no te preocupes/i, // Minimizar emergencias
    /no necesitas doctor/i, // Desalentar atención médica
  ];

  const flags: string[] = [];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      flags.push(`Patrón peligroso detectado: ${pattern.source}`);
    }
  }

  return {
    safe: flags.length === 0,
    flags,
  };
}

/**
 * Auditoría de operación de IA
 */
export async function auditAIOperation(params: {
  operation: AIAuditLog['operation'];
  userId: string;
  userType: AIAuditLog['userType'];
  input: unknown;
  output: unknown;
  tokens?: number;
  cost?: number;
  latencyMs: number;
  status: 'success' | 'error';
  error?: string;
}): Promise<void> {
  // TODO: Guardar en Supabase tabla ai_audit_logs
  // Por ahora solo log en consola
  console.log('[AI AUDIT]', {
    ...params,
    timestamp: new Date().toISOString(),
  });

  // En producción esto iría a la DB:
  // await supabase.from('ai_audit_logs').insert({
  //   operation: params.operation,
  //   user_id: params.userId,
  //   user_type: params.userType,
  //   input: params.input,
  //   output: params.output,
  //   model: AI_CONFIG.openai.model,
  //   tokens: params.tokens,
  //   cost: params.cost,
  //   latency_ms: params.latencyMs,
  //   status: params.status,
  //   error: params.error,
  // });
}
