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
 * Chat completion con retry logic y fallback automático
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
  const { messages, systemPrompt, maxTokens, temperature } = params;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  ];

  // Try GLM first if configured
  const primaryProvider = getActiveProvider();
  const providers: Array<'glm' | 'openai'> = primaryProvider === 'glm' && AI_CONFIG.glm.apiKey
    ? ['glm', 'openai']
    : ['openai'];

  let lastError: unknown = null;

  for (const provider of providers) {
    // Skip if no API key for this provider
    if (provider === 'glm' && !AI_CONFIG.glm.apiKey) continue;
    if (provider === 'openai' && !AI_CONFIG.openai.apiKey) continue;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = provider === 'glm' ? await getGLMClient() : await getOpenAIClient() as unknown as any;
      const model = provider === 'glm' ? AI_CONFIG.glm.defaultModel : AI_CONFIG.openai.model;
      const configuredMaxTokens = provider === 'glm' ? AI_CONFIG.glm.maxTokens : AI_CONFIG.openai.maxTokens;
      const configuredTemp = provider === 'glm' ? AI_CONFIG.glm.temperature : AI_CONFIG.openai.temperature;

      console.log(`[AI] Intentando con ${provider}...`);

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

      console.log(`[AI] Éxito con ${provider}`);

      return {
        response: completion.choices[0]?.message?.content || '',
        usage,
        provider,
      };
    } catch (error: unknown) {
      console.error(`[AI] Error con ${provider}:`, error);
      lastError = error;

      // Check for specific errors
      const status = error && typeof error === 'object' && 'status' in error ? error.status : null;
      const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message
        : '';

      // Check for insufficient balance (GLM specific)
      if (status === 429 && errorMessage.includes('Insufficient balance')) {
        console.warn(`[AI] ${provider} sin saldo - intentando fallback...`);
        continue; // Try next provider
      }

      // Check for rate limit
      if (status === 429) {
        console.warn(`[AI] ${provider} rate limit - intentando fallback...`);
        continue; // Try next provider
      }

      // Check for auth error
      if (status === 401) {
        console.warn(`[AI] ${provider} API key inválida - intentando fallback...`);
        continue; // Try next provider
      }

      // For other errors, continue to fallback
      continue;
    }
  }

  // All providers failed
  console.error('[AI] Todos los proveedores fallaron');

  // Provide helpful error message
  if (!AI_CONFIG.glm.apiKey && !AI_CONFIG.openai.apiKey) {
    throw new Error('No hay API key configurada. Configura GLM_API_KEY o OPENAI_API_KEY.');
  }

  const errorMessage = lastError && typeof lastError === 'object' && 'message' in lastError && typeof lastError.message === 'string'
    ? lastError.message
    : 'Error desconocido';

  if (errorMessage.includes('Insufficient balance')) {
    throw new Error('Sin saldo en GLM. Recarga tu cuenta en z.ai o configura OPENAI_API_KEY como fallback.');
  }

  throw new Error(`Error de IA: ${errorMessage}`);
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
  const { systemPrompt, userPrompt, schema } = params;

  let systemContent = systemPrompt;
  if (schema) {
    systemContent += `\n\nRespuesta DEBE ser JSON válido con este formato:\n${schema}`;
  }

  const messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: userPrompt },
  ];

  // Try GLM first if configured
  const primaryProvider = getActiveProvider();
  const providers: Array<'glm' | 'openai'> = primaryProvider === 'glm' && AI_CONFIG.glm.apiKey
    ? ['glm', 'openai']
    : ['openai'];

  let lastError: unknown = null;

  for (const provider of providers) {
    // Skip if no API key for this provider
    if (provider === 'glm' && !AI_CONFIG.glm.apiKey) continue;
    if (provider === 'openai' && !AI_CONFIG.openai.apiKey) continue;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = provider === 'glm' ? await getGLMClient() : await getOpenAIClient() as unknown as any;
      const model = provider === 'glm' ? AI_CONFIG.glm.defaultModel : AI_CONFIG.openai.model;

      const completion = await client.chat.completions.create({
        model,
        messages,
        response_format: { type: 'json_object' }, // Fuerza JSON
        temperature: 0.2, // Más determinístico para análisis
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(responseText) as T;
    } catch (error: unknown) {
      console.error(`[AI] Error análisis con ${provider}:`, error);
      lastError = error;
      continue; // Try next provider
    }
  }

  // All providers failed
  const errorMessage = lastError && typeof lastError === 'object' && 'message' in lastError && typeof lastError.message === 'string'
    ? lastError.message
    : 'Desconocido';
  throw new Error(`Error de análisis: ${errorMessage}`);
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
