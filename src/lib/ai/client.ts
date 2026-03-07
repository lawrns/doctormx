/**
 * Cliente de IA para Doctor.mx
 * Proveedor único: OpenRouter (Kimi K2.5)
 * Transcripción de audio: OpenAI Whisper
 */

import { AI_CONFIG } from './config';
import { createClient } from '@/lib/supabase/server';
import type {
  PreConsultaMessage,
  TranscriptionSegment,
  AIAuditLog
} from './types';

import type OpenAI from 'openai';

let openrouterClient: OpenAI | null = null;
let openaiClient: OpenAI | null = null;

async function getOpenRouterClient(): Promise<OpenAI> {
  if (!openrouterClient && typeof window === 'undefined') {
    const { default: OpenAISDK } = await import('openai');
    openrouterClient = new OpenAISDK({
      apiKey: AI_CONFIG.openrouter.apiKey,
      baseURL: AI_CONFIG.openrouter.baseURL,
      timeout: 20000,
      maxRetries: 0,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://doctormx.com',
        'X-Title': 'Doctor.mx Telemedicine',
      },
    });
  }
  if (!openrouterClient) throw new Error('OpenRouter client not initialized');
  return openrouterClient;
}

async function getOpenAIClient(): Promise<OpenAI> {
  if (!openaiClient && typeof window === 'undefined') {
    const { default: OpenAISDK } = await import('openai');
    openaiClient = new OpenAISDK({
      apiKey: AI_CONFIG.openai.apiKey,
      timeout: 15000,
    });
  }
  if (!openaiClient) throw new Error('OpenAI client not initialized');
  return openaiClient;
}

/**
 * Chat completion via OpenRouter (Kimi K2.5)
 */
export async function chatCompletion(params: {
  messages: PreConsultaMessage[];
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{
  response: string;
  usage: { inputTokens: number; outputTokens: number; cost: number };
  provider: 'openrouter';
}> {
  const { messages, systemPrompt, maxTokens, temperature } = params;

  if (!AI_CONFIG.openrouter.apiKey) {
    throw new Error('No hay API key configurada. Configura OPENROUTER_API_KEY.');
  }

  const apiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: (m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant') as 'system' | 'user' | 'assistant',
      content: m.content,
    })),
  ];

  console.log(`[AI] Intentando con openrouter (model=${AI_CONFIG.openrouter.model})...`);

  try {
    const client = await getOpenRouterClient();
    const completion = await client.chat.completions.create({
      model: AI_CONFIG.openrouter.model,
      messages: apiMessages,
      max_tokens: maxTokens || AI_CONFIG.openrouter.maxTokens,
      temperature: temperature ?? AI_CONFIG.openrouter.temperature,
    });

    const msg = completion.choices[0]?.message;
    const responseContent = msg?.content || '';

    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const cost =
      (inputTokens / 1_000_000) * AI_CONFIG.costs.openrouterInputPer1M +
      (outputTokens / 1_000_000) * AI_CONFIG.costs.openrouterOutputPer1M;

    console.log(`[AI] Éxito con openrouter (model=${AI_CONFIG.openrouter.model})`);

    return {
      response: responseContent,
      usage: { inputTokens, outputTokens, cost },
      provider: 'openrouter',
    };
  } catch (error: unknown) {
    const errStatus = error && typeof error === 'object' && 'status' in error ? error.status : null;
    const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
    console.error(`[AI] Error con openrouter (status=${errStatus}):`, errMsg);
    throw new Error(`Error de IA: ${errMsg}`);
  }
}

/**
 * Transcripción de audio con Whisper (OpenAI)
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
      response_format: 'verbose_json',
    });

    const segments: TranscriptionSegment[] = transcription.segments?.map((s: { text: string; start: number; confidence?: number }) => ({
      text: s.text,
      timestamp: s.start,
      confidence: s.confidence,
    })) || [];

    const duration = transcription.duration || 0;
    const cost = (duration / 60) * AI_CONFIG.costs.whisperPerMinute;

    return { segments, fullText: transcription.text, duration, cost };
  } catch (error: unknown) {
    console.error('Error en transcripción:', error);
    const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : 'Desconocido';
    throw new Error(`Error de transcripción: ${message}`);
  }
}

/**
 * Análisis estructurado con JSON mode via OpenRouter
 */
export async function structuredAnalysis<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  schema?: string;
}): Promise<T> {
  const { systemPrompt, userPrompt, schema } = params;

  if (!AI_CONFIG.openrouter.apiKey) {
    throw new Error('No hay API key configurada. Configura OPENROUTER_API_KEY.');
  }

  let systemContent = systemPrompt;
  if (schema) {
    systemContent += `\n\nRespuesta DEBE ser JSON válido con este formato:\n${schema}`;
  }

  const messages = [
    { role: 'system' as const, content: systemContent },
    { role: 'user' as const, content: userPrompt },
  ];

  console.log(`[AI] Intentando análisis con openrouter (model=${AI_CONFIG.openrouter.model})...`);

  try {
    const client = await getOpenRouterClient();
    const completion = await client.chat.completions.create({
      model: AI_CONFIG.openrouter.model,
      messages,
      max_tokens: AI_CONFIG.openrouter.analysisMaxTokens,
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const msg = completion.choices[0]?.message;
    const raw = msg?.content || '{}';
    const responseText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    console.log(`[AI] Éxito análisis con openrouter`);
    return JSON.parse(responseText) as T;
  } catch (error: unknown) {
    const errStatus = error && typeof error === 'object' && 'status' in error ? error.status : null;
    const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
    console.error(`[AI] Error análisis con openrouter (status=${errStatus}):`, errMsg);
    throw new Error(`Error de análisis: ${errMsg}`);
  }
}

/**
 * Safety check — detecta si la respuesta de IA está dando consejos médicos inapropiados
 */
export async function safetyCheck(text: string): Promise<{
  safe: boolean;
  flags: string[];
}> {
  const dangerousPatterns = [
    /tienes|padeces|sufres de/i,
    /deberías tomar|toma este medicamento/i,
    /no es urgente|no te preocupes/i,
    /no necesitas doctor/i,
  ];

  const flags: string[] = [];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      flags.push(`Patrón peligroso detectado: ${pattern.source}`);
    }
  }

  return { safe: flags.length === 0, flags };
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
  provider?: 'openrouter' | 'openai' | 'glm' | 'kimi';
}): Promise<void> {
  const supabase = await createClient();
  const model = AI_CONFIG.openrouter.model;

  try {
    await supabase.from('ai_audit_logs').insert({
      operation: params.operation,
      user_id: params.userId === 'anonymous' ? null : params.userId,
      user_type: params.userType,
      input: params.input,
      output: params.output,
      model,
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
