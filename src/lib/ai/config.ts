/**
 * Configuración central para servicios de IA
 * GLM (Primary), OpenAI (Fallback), Whisper, y otros modelos
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
    baseURL: 'https://api.z.ai/api/paas/v4/',
    models: {
      reasoning: 'glm-4.7',        // Latest flagship - complex medical reasoning & agentic coding
      costEffective: 'glm-4.7',    // Use flagship for quality
      vision: 'glm-4.6v',          // Multimodal with 128K context - medical image analysis
    },
    defaultModel: 'glm-4.7',       // Latest flagship model for all operations
    temperature: 0.3,              // Less creative, more consistent
    maxTokens: 500,                // Concise responses
  },

  // OpenAI - Fallback provider
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini', // Fallback model
    temperature: 0.3,
    maxTokens: 500,
  },

  // Whisper - Audio transcription (still uses OpenAI)
  whisper: {
    apiKey: process.env.OPENAI_API_KEY || '', // Whisper requires OpenAI key
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
 */
export function getActiveProvider(): 'glm' | 'openai' {
  if (AI_CONFIG.features.useGLM && AI_CONFIG.glm.apiKey) {
    return 'glm';
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
  provider?: 'glm' | 'openai';
}): number {
  if (operation.type === 'chat') {
    const provider = operation.provider || getActiveProvider();
    if (provider === 'glm') {
      const inputCost = ((operation.inputTokens || 0) / 1_000_000) * AI_CONFIG.costs.glmInputPer1M;
      const outputCost = ((operation.outputTokens || 0) / 1_000_000) * AI_CONFIG.costs.glmOutputPer1M;
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
