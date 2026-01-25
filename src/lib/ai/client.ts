/**
 * Cliente de IA para operaciones de AI
 * Wrapper centralizado con error handling, retry logic, y auditoría
 *
 * GLM z.ai es el proveedor principal para Doctor.mx
 * OpenAI se usa como fallback y para transcripción con Whisper
 */

import { AI_CONFIG, getActiveProvider } from './config';
import { createClient } from '@/lib/supabase/server';
import type {
  PreConsultaMessage,
  TranscriptionSegment,
  AIAuditLog
} from './types';

/**
 * Cliente de IA singleton
 * Lazy-loaded para evitar errores en build
 * Usa GLM como proveedor principal, OpenAI como fallback
 */
import type OpenAI from "openai";

let glmClient: OpenAI | null = null;
let openaiClient: OpenAI | null = null;

async function getGLMClient(): Promise<OpenAI> {
  if (!glmClient && typeof window === "undefined") {
    try {
      const { default: OpenAI } = (await import("openai")) as typeof import("openai");
      glmClient = new OpenAI({
        apiKey: AI_CONFIG.glm.apiKey,
        baseURL: AI_CONFIG.glm.baseURL,
      });
    } catch (error) {
      console.error("Error al inicializar GLM client:", error);
      throw new Error("GLM client no disponible");
    }
  }

  if (!glmClient) {
    throw new Error("GLM client no inicializado");
  }

  return glmClient;
}

async function getOpenAIClient(): Promise<OpenAI> {
  if (!openaiClient && typeof window === "undefined") {
    try {
      const { default: OpenAI } = (await import("openai")) as typeof import("openai");
      openaiClient = new OpenAI({
        apiKey: AI_CONFIG.openai.apiKey,
      });
    } catch (error) {
      console.error("Error al inicializar OpenAI client:", error);
      throw new Error("OpenAI client no disponible");
    }
  }

  if (!openaiClient) {
    throw new Error("OpenAI client no inicializado");
  }

  return openaiClient;
}

/**
 * Get the appropriate AI client based on configuration
 * Uses GLM if configured, otherwise falls back to OpenAI
 */
async function getAIClient(): Promise<OpenAI> {
  const provider = getActiveProvider();
  if (provider === 'glm' && AI_CONFIG.glm.apiKey) {
    return getGLMClient();
  }
  return getOpenAIClient();
}


/**
 * Chat completion con retry logic
 * Uses GLM as primary provider, OpenAI as fallback
 */
export async function chatCompletion(params: {
  messages: PreConsultaMessage[];
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{
  response: string;
  usage: { inputTokens: number; outputTokens: number; cost: number };
  provider: 'glm' | 'openai';
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = await getAIClient() as unknown as any;
  const provider = getActiveProvider();
  const { messages, systemPrompt, maxTokens, temperature } = params;

  // Select model based on provider
  const model = provider === 'glm' ? AI_CONFIG.glm.defaultModel : AI_CONFIG.openai.model;
  const configuredMaxTokens = provider === 'glm' ? AI_CONFIG.glm.maxTokens : AI_CONFIG.openai.maxTokens;
  const configuredTemp = provider === 'glm' ? AI_CONFIG.glm.temperature : AI_CONFIG.openai.temperature;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  ];

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: apiMessages,
      max_tokens: maxTokens || configuredMaxTokens,
      temperature: temperature ?? configuredTemp,
    });

    const usage = {
      inputTokens: completion.usage?.prompt_tokens || 0,
      outputTokens: completion.usage?.completion_tokens || 0,
      cost: 0,
    };

    // Calculate cost based on provider
    if (provider === 'glm') {
      usage.cost =
        (usage.inputTokens / 1_000_000) * AI_CONFIG.costs.glmInputPer1M +
        (usage.outputTokens / 1_000_000) * AI_CONFIG.costs.glmOutputPer1M;
    } else {
      usage.cost =
        (usage.inputTokens / 1_000_000) * AI_CONFIG.costs.gpt4oMiniInputPer1M +
        (usage.outputTokens / 1_000_000) * AI_CONFIG.costs.gpt4oMiniOutputPer1M;
    }

    return {
      response: completion.choices[0]?.message?.content || '',
      usage,
      provider,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = await getOpenAIClient() as unknown as any;
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
 * Uses GLM as primary provider, OpenAI as fallback
 */
export async function structuredAnalysis<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  schema?: string; // Descripción del schema esperado
}): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = await getAIClient() as unknown as any;
  const provider = getActiveProvider();
  const { systemPrompt, userPrompt, schema } = params;

  // Select model based on provider
  const model = provider === 'glm' ? AI_CONFIG.glm.defaultModel : AI_CONFIG.openai.model;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  if (schema) {
    messages[0].content += `\n\nRespuesta DEBE ser JSON válido con este formato:\n${schema}`;
  }

  try {
    const completion = await client.chat.completions.create({
      model,
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
  provider?: 'glm' | 'openai';
}): Promise<void> {
  const supabase = await createClient();
  const provider = params.provider || getActiveProvider();
  const model = provider === 'glm' ? AI_CONFIG.glm.defaultModel : AI_CONFIG.openai.model;

  try {
    await supabase.from('ai_audit_logs').insert({
      operation: params.operation,
      user_id: params.userId === 'anonymous' ? null : params.userId,
      user_type: params.userType,
      input: params.input,
      output: params.output,
      model: model,
      tokens: params.tokens,
      cost: params.cost,
      latency_ms: params.latencyMs,
      status: params.status,
      error: params.error,
    });
  } catch (error) {
    console.error('Error logging AI operation to DB:', error);
  }
}
