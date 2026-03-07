/**
 * Configuración central para servicios de IA
 * GLM (Primary), Kimi (Secondary), OpenAI (Fallback), Whisper, y otros modelos
 *
 * GLM z.ai is the primary provider for Doctor.mx
 * - Cost effective: 90% cheaper than GPT-4
 * - Better multilingual support (Spanish)
 * - OpenAI SDK compatible
 */

export const AI_CONFIG = {
  // GLM - Primary AI Provider (z.ai)
  // Docs: https://docs.z.ai/guides/overview/quick-start
  glm: {
    apiKey: process.env.GLM_API_KEY || '',
    baseURL: 'https://api.z.ai/api/coding/paas/v4/', // GLM Coding Plan endpoint
    models: {
      reasoning: 'glm-5',          // Deep reasoning — use for structured analysis (accepts 10-12s)
      chat: 'glm-4.5-air',         // Fast chat — no CoT overhead (~3-4s), enough for triage dialog
      vision: 'glm-5',             // Best multimodal available on coding plan
    },
    defaultModel: 'glm-4.5-air',   // Fast model for conversational paths
    chatMaxTokens: 1000,            // glm-4.5-air: ~700 CoT + short answer fits in 1000
    analysisMaxTokens: 2000,        // glm-5: ~1500 CoT + detailed answer
    temperature: 0.3,              // Less creative, more consistent
    maxTokens: 1000,               // Default; analysis overrides to 2000
  },

  // Kimi - Secondary AI Provider (Moonshot)
  // Supports custom base URL so coding/special plan endpoints can be used if needed.
  kimi: {
    apiKey: process.env.KIMI_API_KEY || '',
    baseURL: process.env.KIMI_BASE_URL || 'https://api.kimi.com/coding/v1',
    models: {
      reasoning: process.env.KIMI_REASONING_MODEL || 'kimi-for-coding',
      chat: process.env.KIMI_CHAT_MODEL || 'kimi-for-coding',
      vision: process.env.KIMI_VISION_MODEL || 'kimi-for-coding',
    },
    defaultModel: process.env.KIMI_CHAT_MODEL || 'kimi-for-coding',
    temperature: 0.3,
    maxTokens: 500,
  },

  // OpenAI - Fallback provider
  openai: {
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4o-mini', // Fallback model
    temperature: 0.3,
    maxTokens: 500,
  },

  // Whisper - Audio transcription (still uses OpenAI)
  whisper: {
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '', // Whisper requires OpenAI key
    model: 'whisper-1',
    language: 'es', // Spanish default
    responseFormat: 'json' as const,
  },

  // Limits and quotas
  limits: {
    maxMessagesPerSession: 20, // Pre-consultation limits
    maxAudioMinutes: 60,       // Typical consultation 20-40min
    maxRetries: 3,
    timeoutMs: 30000,          // 30 seconds
  },

  // Cost tracking (per 1M tokens)
  costs: {
    // GLM pricing
    glmInputPer1M: 0.60,
    glmOutputPer1M: 2.20,
    glmCachedPer1M: 0.11,
    // Kimi pricing
    kimiInputPer1M: 0.50,
    kimiOutputPer1M: 2.80,
    // OpenAI pricing (fallback)
    gpt4oMiniInputPer1M: 0.15,
    gpt4oMiniOutputPer1M: 0.60,
    // Whisper
    whisperPerMinute: 0.006,
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
    secondary: 'kimi' as const,
    fallback: 'openai' as const,
  },
} as const;

/**
 * Valida que las API keys estén configuradas
 */
export function validateAIConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check GLM (primary provider)
  if (!AI_CONFIG.glm.apiKey && AI_CONFIG.features.useGLM && AI_CONFIG.features.preConsulta) {
    if (!AI_CONFIG.kimi.apiKey && !AI_CONFIG.openai.apiKey) {
      errors.push('GLM_API_KEY no configurada y no hay fallback KIMI/OpenAI disponible');
    } else {
      warnings.push('GLM_API_KEY no configurada - usando Kimi/OpenAI como fallback');
    }
  }

  if (!AI_CONFIG.kimi.apiKey) {
    warnings.push('KIMI_API_KEY no configurada - Kimi no estará disponible como proveedor secundario');
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
 */
export function getActiveProvider(): 'glm' | 'kimi' | 'openai' {
  if (AI_CONFIG.features.useGLM && AI_CONFIG.glm.apiKey) {
    return 'glm';
  }
  if (AI_CONFIG.kimi.apiKey) {
    return 'kimi';
  }
  return 'openai';
}

/**
 * Calcula costo estimado de una operación
 */
export function estimateCost(operation: {
  type: 'chat' | 'transcription';
  inputTokens?: number;
  outputTokens?: number;
  audioMinutes?: number;
  provider?: 'glm' | 'kimi' | 'openai';
}): number {
  if (operation.type === 'chat') {
    const provider = operation.provider || getActiveProvider();
    if (provider === 'glm') {
      const inputCost = ((operation.inputTokens || 0) / 1_000_000) * AI_CONFIG.costs.glmInputPer1M;
      const outputCost = ((operation.outputTokens || 0) / 1_000_000) * AI_CONFIG.costs.glmOutputPer1M;
      return inputCost + outputCost;
    } else if (provider === 'kimi') {
      const inputCost = ((operation.inputTokens || 0) / 1_000_000) * AI_CONFIG.costs.kimiInputPer1M;
      const outputCost = ((operation.outputTokens || 0) / 1_000_000) * AI_CONFIG.costs.kimiOutputPer1M;
      return inputCost + outputCost;
    } else {
      const inputCost = ((operation.inputTokens || 0) / 1_000_000) * AI_CONFIG.costs.gpt4oMiniInputPer1M;
      const outputCost = ((operation.outputTokens || 0) / 1_000_000) * AI_CONFIG.costs.gpt4oMiniOutputPer1M;
      return inputCost + outputCost;
    }
  }

  if (operation.type === 'transcription') {
    return (operation.audioMinutes || 0) * AI_CONFIG.costs.whisperPerMinute;
  }

  return 0;
}
