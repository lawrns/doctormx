/**
 * Configuración central para servicios de IA
 * OpenRouter (MiniMax M2.7 + Kimi K2.6) — sole active LLM provider
 * OpenAI Whisper — audio transcription only
 *
 * Model selection (Apr 2026 OpenRouter pricing):
 *   • minimax/minimax-m2.7  — $0.30 / $1.20 per 1M tok  (default chat / triage)
 *   • moonshotai/kimi-k2.6  — $0.60 / $2.80 per 1M tok  (structured analysis / SOAP)
 *   • openai/gpt-4o-mini    — $0.15 / $0.60 per 1M tok  (vision fallback)
 */

export const AI_CONFIG = {
  // OpenRouter — sole LLM provider (OpenAI-compatible)
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'minimax/minimax-m2.7',           // Default: fast, cheap, great for triage + JSON
    analysisModel: 'minimax/minimax-m2.7',    // Same — M2.7 handles structured output better than K2.6 (no reasoning token overhead)
    visionModel: 'openai/gpt-4o-mini',        // Vision analysis (cheapest reliable vision)
    temperature: 0.3,
    maxTokens: 1500,
    analysisMaxTokens: 2000,
  },

  // Ollama proxy — self-hosted fallback (ngrok tunnel, Ollama-native API)
  ollama: {
    proxyUrl: process.env.OLLAMA_PROXY_URL || '',
    proxyKey: process.env.OLLAMA_PROXY_KEY || '',
    models: {
      default: 'qwen3.5:latest',     // 9.7B general-purpose, fast
      reasoning: 'kimi-k2.5:cloud',  // cloud-hosted, high quality
    },
    timeoutMs: 30000,      // 30s for standard calls
    longTimeoutMs: 120000, // 120s for long-form generation
  },

  // GLM — disabled (kept as stub to avoid breaking legacy references)
  glm: {
    apiKey: '',
    baseURL: 'https://api.z.ai/api/coding/paas/v4/',
    models: {
      reasoning: 'glm-5.1',
      chat: 'glm-4.5-air',
      vision: 'glm-5.1',
    },
    defaultModel: 'glm-5.1',
    chatMaxTokens: 1000,
    analysisMaxTokens: 2000,
    temperature: 0.3,
    maxTokens: 1000,
  },

  // Kimi — disabled (kept as stub to avoid breaking legacy references)
  kimi: {
    apiKey: '',
    baseURL: 'https://api.kimi.com/coding/v1',
    models: {
      reasoning: 'kimi-for-coding',
      chat: 'kimi-for-coding',
      vision: 'kimi-for-coding',
    },
    defaultModel: 'kimi-for-coding',
    temperature: 0.3,
    maxTokens: 500,
  },

  // OpenAI — Whisper transcription only (not used for chat/analysis)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
    temperature: 0.3,
    maxTokens: 500,
  },

  // Whisper — Audio transcription (still uses OpenAI)
  whisper: {
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '',
    model: 'whisper-1',
    language: 'es', // Spanish default
    responseFormat: 'json' as const,
  },

  // Limits and quotas
  limits: {
    maxMessagesPerSession: 20,
    maxAudioMinutes: 60,
    maxRetries: 0,
    timeoutMs: 20000, // 20 seconds
  },

  // Cost tracking (per 1M tokens) — OpenRouter actual pricing Apr 2026
  costs: {
    // MiniMax M2.7  ($0.30 in / $1.20 out)
    openrouterInputPer1M: 0.30,
    openrouterOutputPer1M: 1.20,
    // (Kimi K2.6 kept as experimental override only — $0.60/$2.80, but burns tokens on reasoning)
    openrouterAnalysisInputPer1M: 0.30,
    openrouterAnalysisOutputPer1M: 1.20,
    // GPT-4o-mini vision ($0.15 in / $0.60 out)
    openrouterVisionInputPer1M: 0.15,
    openrouterVisionOutputPer1M: 0.60,
    // Legacy keys kept for any existing audit/reporting references
    glmInputPer1M: 0.60,
    glmOutputPer1M: 2.20,
    glmCachedPer1M: 0.11,
    kimiInputPer1M: 0.50,
    kimiOutputPer1M: 2.80,
    gpt4oMiniInputPer1M: 0.15,
    gpt4oMiniOutputPer1M: 0.60,
    whisperPerMinute: 0.006,
  },

  // Feature flags
  features: {
    preConsulta: process.env.NEXT_PUBLIC_AI_PRECONSULTA === 'true' || true,
    transcription: process.env.NEXT_PUBLIC_AI_TRANSCRIPTION === 'true' || true,
    followUp: process.env.NEXT_PUBLIC_AI_FOLLOWUP === 'true' || true,
    prescriptionAssist: false,
    smartMatching: false,
    useGLM: false, // Disabled — using OpenRouter
  },

  // Provider priority
  providers: {
    primary: 'openrouter' as const,
    secondary: 'openrouter' as const,
    fallback: 'openai' as const,
  },
} as const;

/**
 * Valida que las API keys estén configuradas
 */
export function validateAIConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!AI_CONFIG.openrouter.apiKey) {
    errors.push('OPENROUTER_API_KEY no configurada');
  }

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
 * Get the active AI provider
 */
export function getActiveProvider(): 'openrouter' | 'openai' {
  if (AI_CONFIG.openrouter.apiKey) {
    return 'openrouter';
  }
  return 'openai';
}

/**
 * Calcula costo estimado de una operación
 */
export function estimateCost(operation: {
  type: 'chat' | 'analysis' | 'vision' | 'transcription';
  inputTokens?: number;
  outputTokens?: number;
  audioMinutes?: number;
  provider?: 'openrouter' | 'openai';
}): number {
  if (operation.type === 'chat') {
    const inputCost = ((operation.inputTokens || 0) / 1_000_000) * AI_CONFIG.costs.openrouterInputPer1M;
    const outputCost = ((operation.outputTokens || 0) / 1_000_000) * AI_CONFIG.costs.openrouterOutputPer1M;
    return inputCost + outputCost;
  }

  if (operation.type === 'analysis') {
    const inputCost = ((operation.inputTokens || 0) / 1_000_000) * AI_CONFIG.costs.openrouterAnalysisInputPer1M;
    const outputCost = ((operation.outputTokens || 0) / 1_000_000) * AI_CONFIG.costs.openrouterAnalysisOutputPer1M;
    return inputCost + outputCost;
  }

  if (operation.type === 'vision') {
    const inputCost = ((operation.inputTokens || 0) / 1_000_000) * AI_CONFIG.costs.openrouterVisionInputPer1M;
    const outputCost = ((operation.outputTokens || 0) / 1_000_000) * AI_CONFIG.costs.openrouterVisionOutputPer1M;
    return inputCost + outputCost;
  }

  if (operation.type === 'transcription') {
    return (operation.audioMinutes || 0) * AI_CONFIG.costs.whisperPerMinute;
  }

  return 0;
}
