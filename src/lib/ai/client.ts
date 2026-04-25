/**
 * Cliente de IA para Doctor.mx
 * Primary:  OpenRouter (MiniMax M2.7)
 * Fallback: Ollama proxy (qwen3.5:latest / kimi-k2.5:cloud)
 * Audio:    OpenAI Whisper
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
 * Chat completion — OpenRouter primary, Ollama proxy fallback
 */
export async function chatCompletion(params: {
  messages: PreConsultaMessage[];
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{
  response: string;
  usage: { inputTokens: number; outputTokens: number; cost: number };
  provider: 'openrouter' | 'ollama';
}> {
  const { messages, systemPrompt, maxTokens, temperature } = params;

  const apiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: (m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant') as 'system' | 'user' | 'assistant',
      content: m.content,
    })),
  ];

  // ── Primary: OpenRouter ──────────────────────────────────────────────────
  if (AI_CONFIG.openrouter.apiKey) {
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

      console.log(`[AI] Éxito con openrouter`);
      return { response: responseContent, usage: { inputTokens, outputTokens, cost }, provider: 'openrouter' };
    } catch (error: unknown) {
      const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
      console.warn(`[AI] OpenRouter falló, intentando Ollama fallback: ${errMsg}`);
    }
  }

  // ── Fallback: Ollama proxy ───────────────────────────────────────────────
  if (AI_CONFIG.ollama.proxyUrl && AI_CONFIG.ollama.proxyKey) {
    try {
      const { ollamaChatCompletion } = await import('./ollama');
      const result = await ollamaChatCompletion({ messages: apiMessages });
      return {
        response: result.content,
        usage: { inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens, cost: 0 },
        provider: 'ollama',
      };
    } catch (ollamaError: unknown) {
      const errMsg = ollamaError instanceof Error ? ollamaError.message : String(ollamaError);
      console.error(`[AI] Ollama fallback también falló: ${errMsg}`);
    }
  }

  throw new Error('Error de IA: todos los proveedores fallaron (OpenRouter + Ollama)');
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
    throw new Error(`Error de transcripción: ${message}`, { cause: error });
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

  let systemContent = systemPrompt;
  if (schema) {
    systemContent += `\n\nRespuesta DEBE ser JSON válido con este formato:\n${schema}`;
  }

  const messages = [
    { role: 'system' as const, content: systemContent },
    { role: 'user' as const, content: userPrompt },
  ];

  // ── Primary: OpenRouter ──────────────────────────────────────────────────
  if (AI_CONFIG.openrouter.apiKey) {
    console.log(`[AI] Intentando análisis con openrouter (model=${AI_CONFIG.openrouter.analysisModel})...`);
    try {
      const client = await getOpenRouterClient();
      const completion = await client.chat.completions.create({
        model: AI_CONFIG.openrouter.analysisModel,
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
      const errMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
      console.warn(`[AI] OpenRouter análisis falló, intentando Ollama: ${errMsg}`);
    }
  }

  // ── Fallback: Ollama proxy (ask it to return JSON directly) ──────────────
  if (AI_CONFIG.ollama.proxyUrl && AI_CONFIG.ollama.proxyKey) {
    try {
      const { ollamaChatCompletion } = await import('./ollama');
      // Append explicit JSON instruction to system message for Ollama
      const ollamaMessages = [
        { ...messages[0], content: messages[0].content + '\n\nResponde SOLO con JSON válido, sin texto adicional ni código fences.' },
        ...messages.slice(1),
      ];
      const result = await ollamaChatCompletion({ messages: ollamaMessages, useReasoning: true });
      const raw = result.content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
      console.log(`[AI] Éxito análisis con ollama`);
      return JSON.parse(raw) as T;
    } catch (ollamaError: unknown) {
      const errMsg = ollamaError instanceof Error ? ollamaError.message : String(ollamaError);
      console.error(`[AI] Ollama análisis también falló: ${errMsg}`);
    }
  }

  throw new Error('Error de análisis: todos los proveedores fallaron (OpenRouter + Ollama)');
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
  provider?: 'openrouter' | 'openai';
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
