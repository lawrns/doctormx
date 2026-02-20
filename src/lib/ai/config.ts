/**
 * Configuración central para servicios de IA
 * GLM (Primary), OpenAI (Fallback), Whisper, y otros modelos
 *
 * GLM z.ai is the primary provider for Doctor.mx
 * - Cost effective: 90% cheaper than GPT-4
 * - Better multilingual support (Spanish)
 * - OpenAI SDK compatible
 * 
 * @module lib/ai/config
 * @example
 * ```typescript
 * import { AI_CONFIG, validateAIConfig, estimateCost, getActiveProvider } from '@/lib/ai/config';
 * 
 * // Validate configuration
 * const validation = validateAIConfig();
 * if (!validation.valid) {
 *   console.error(validation.errors);
 * }
 * 
 * // Estimate cost
 * const cost = estimateCost({ type: 'chat', inputTokens: 1000, outputTokens: 500 });
 * ```
 */

import { AI, TIME, LIMITS } from '@/lib/constants';

/**
 * AI configuration object
 * Contains settings for all AI providers and features
 */
export const AI_CONFIG = {
  // GLM - Primary AI Provider (z.ai)
  // Docs: https://docs.z.ai/guides/overview/quick-start
  glm: {
    apiKey: process.env.GLM_API_KEY ?? '',
    baseURL: 'https://api.z.ai/api/coding/paas/v4/', // GLM Coding Plan endpoint
    models: {
      reasoning: 'glm-4.7',        // Latest flagship - complex reasoning (returns reasoning_content only)
      chat: 'glm-4.5-air',         // Fast chat model - returns proper content field
      vision: 'glm-4.6v',          // Multimodal with 128K context - medical image analysis
    },
    defaultModel: 'glm-4.5-air',   // Use air model for chat - returns clean responses
    temperature: 0.3,              // Less creative, more consistent
    maxTokens: AI.MAX_TOKENS_DEFAULT, // Concise responses
  },

  // OpenAI - Fallback provider
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: 'gpt-4o-mini', // Fallback model
    temperature: 0.3,
    maxTokens: AI.MAX_TOKENS_DEFAULT,
  },

  // Whisper - Audio transcription (still uses OpenAI)
  whisper: {
    apiKey: process.env.OPENAI_API_KEY ?? '', // Whisper requires OpenAI key
    model: 'whisper-1',
    language: 'es', // Spanish default
    responseFormat: 'json' as const,
  },

  // Limits and quotas
  limits: {
    maxMessagesPerSession: TIME.MAX_MESSAGES_PER_SESSION, // Pre-consultation limits
    maxAudioMinutes: TIME.MAX_AUDIO_MINUTES, // Typical consultation 20-40min
    maxRetries: LIMITS.MAX_RETRIES,
    timeoutMs: TIME.AI_REQUEST_TIMEOUT_MS, // 30 seconds
  },

  // Cost tracking (per 1M tokens)
  costs: {
    // GLM pricing
    glmInputPer1M: AI.COSTS.GLM_INPUT_PER_1M,
    glmOutputPer1M: AI.COSTS.GLM_OUTPUT_PER_1M,
    glmCachedPer1M: AI.COSTS.GLM_CACHED_PER_1M,
    // OpenAI pricing (fallback)
    gpt4oMiniInputPer1M: AI.COSTS.GPT4O_MINI_INPUT_PER_1M,
    gpt4oMiniOutputPer1M: AI.COSTS.GPT4O_MINI_OUTPUT_PER_1M,
    // Whisper
    whisperPerMinute: AI.COSTS.WHISPER_PER_MINUTE,
  },

  // Feature flags
  features: {
    preConsulta: process.env.NEXT_PUBLIC_AI_PRECONSULTA === 'true' || true,
    transcription: process.env.NEXT_PUBLIC_AI_TRANSCRIPTION === 'true' || true,
    followUp: process.env.NEXT_PUBLIC_AI_FOLLOWUP === 'true' || true,
    prescriptionAssist: false, // Phase 2
    smartMatching: false,      // Phase 2
    useGLM: true,              // Use GLM as primary provider
  },

  // Provider priority
  providers: {
    primary: 'glm' as const,
    fallback: 'openai' as const,
  },
} as const;

/**
 * Validates that the AI API keys are configured
 * @returns Validation result with status, errors, and warnings
 * @example
 * const result = validateAIConfig();
 * if (!result.valid) {
 *   console.error('Configuration errors:', result.errors);
 * }
 * if (result.warnings.length > 0) {
 *   console.warn('Warnings:', result.warnings);
 * }
 */
export function validateAIConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check GLM (primary provider)
  if (!AI_CONFIG.glm.apiKey && AI_CONFIG.features.useGLM && AI_CONFIG.features.preConsulta) {
    if (!AI_CONFIG.openai.apiKey) {
      errors.push('GLM_API_KEY no configurada y no hay fallback OpenAI disponible');
    } else {
      warnings.push('GLM_API_KEY no configurada - usando OpenAI como fallback');
    }
  }

  // Check OpenAI (fallback and Whisper)
  if (!AI_CONFIG.whisper.apiKey && AI_CONFIG.features.transcription) {
    errors.push('OPENAI_API_KEY requerida para transcripción con Whisper');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get the active AI provider based on configuration
 * @returns Active provider name ('glm' or 'openai')
 * @example
 * const provider = getActiveProvider();
 * if (provider === 'glm') {
 *   // Use GLM client
 * }
 */
export function getActiveProvider(): 'glm' | 'openai' {
  if (AI_CONFIG.features.useGLM && AI_CONFIG.glm.apiKey) {
    return 'glm';
  }
  return 'openai';
}

/**
 * Calculate estimated cost of an operation
 * @param operation - Operation details
 * @param operation.type - Type of operation: 'chat' or 'transcription'
 * @param operation.inputTokens - Number of input tokens (for chat)
 * @param operation.outputTokens - Number of output tokens (for chat)
 * @param operation.audioMinutes - Audio duration in minutes (for transcription)
 * @param operation.provider - Provider to use for calculation (optional)
 * @returns Estimated cost in USD
 * @example
 * // Estimate chat cost
 * const chatCost = estimateCost({
 *   type: 'chat',
 *   inputTokens: 1000,
 *   outputTokens: 500,
 *   provider: 'glm'
 * });
 * 
 * // Estimate transcription cost
 * const transcriptionCost = estimateCost({
 *   type: 'transcription',
 *   audioMinutes: 30
 * });
 */
export function estimateCost(operation: {
  type: 'chat' | 'transcription';
  inputTokens?: number;
  outputTokens?: number;
  audioMinutes?: number;
  provider?: 'glm' | 'openai';
}): number {
  if (operation.type === 'chat') {
    const provider = operation.provider || getActiveProvider();
    if (provider === 'glm') {
      const inputCost = ((operation.inputTokens ?? 0) / 1_000_000) * AI_CONFIG.costs.glmInputPer1M;
      const outputCost = ((operation.outputTokens ?? 0) / 1_000_000) * AI_CONFIG.costs.glmOutputPer1M;
      return inputCost + outputCost;
    } else {
      const inputCost = ((operation.inputTokens ?? 0) / 1_000_000) * AI_CONFIG.costs.gpt4oMiniInputPer1M;
      const outputCost = ((operation.outputTokens ?? 0) / 1_000_000) * AI_CONFIG.costs.gpt4oMiniOutputPer1M;
      return inputCost + outputCost;
    }
  }

  if (operation.type === 'transcription') {
    return (operation.audioMinutes ?? 0) * AI_CONFIG.costs.whisperPerMinute;
  }

  return 0;
}
