/**
 * GLM (Zhipu AI) Client for Doctor.mx
 * OpenAI SDK compatible - uses z.ai API endpoint
 *
 * Models:
 * - GLM-5.1: Flagship model - advanced reasoning (comparable to GPT-4)
 * - GLM-4.5-Air: Cost-effective for general tasks
 * - GLM-5.1: Vision model for medical image analysis
 *
 * Pricing (per 1M tokens):
 * - Input: $0.60
 * - Output: $2.20
 * - Cached: $0.11
 */

import OpenAI from 'openai'
import { logger } from '@/lib/observability/logger'
import { AI_CONFIG } from './config'

// GLM Client - OpenAI SDK compatible with timeout configuration
// Uses GLM Coding Plan endpoint (different from standard API)
export const glm = new OpenAI({
  apiKey: process.env.GLM_API_KEY || '',
  baseURL: AI_CONFIG.glm.baseURL, // GLM Coding Plan endpoint from config
  timeout: 14000, // 14s — GLM-5.1 takes ~10-12s; leaves budget for fallbacks within Netlify 26s cap
  maxRetries: 0, // No retries — let the fallback chain handle provider failure
})

// GLM Configuration
export const GLM_CONFIG = {
  models: {
    reasoning: 'glm-5.1',        // Flagship model - best for medical reasoning, differential diagnosis
    costEffective: 'glm-4.5-air', // Good for general chat, triage
    vision: 'glm-5.1',          // Flagship model for medical image analysis
  },
  pricing: {
    input: 0.60,    // USD per 1M tokens
    output: 2.20,   // USD per 1M tokens
    cached: 0.11,   // USD per 1M tokens (for cached prompts)
  },
  defaults: {
    temperature: 0.3,      // Lower for medical accuracy
    maxTokens: 2000,       // GLM-5.1 reasoning model: ~1500 CoT tokens + answer
    topP: 0.95,
  },
} as const

export type GLMModel = typeof GLM_CONFIG.models[keyof typeof GLM_CONFIG.models]

/**
 * Calculate cost for GLM API usage
 */
export function calculateGLMCost(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): number {
  const inputCost = ((inputTokens - cachedTokens) / 1_000_000) * GLM_CONFIG.pricing.input
  const cachedCost = (cachedTokens / 1_000_000) * GLM_CONFIG.pricing.cached
  const outputCost = (outputTokens / 1_000_000) * GLM_CONFIG.pricing.output
  return inputCost + cachedCost + outputCost
}

/**
 * Check if GLM is configured
 */
export function isGLMConfigured(): boolean {
  return !!process.env.GLM_API_KEY
}

/**
 * Get recommended GLM model for use case
 */
export function getGLMModel(useCase: 'reasoning' | 'chat' | 'vision'): GLMModel {
  switch (useCase) {
    case 'reasoning':
      return GLM_CONFIG.models.reasoning
    case 'vision':
      return GLM_CONFIG.models.vision
    case 'chat':
    default:
      return GLM_CONFIG.models.costEffective
  }
}

/**
 * GLM Chat Completion wrapper with cost tracking
 */
export async function glmChatCompletion(params: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  model?: GLMModel
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}): Promise<{
  content: string
  usage: { inputTokens: number; outputTokens: number; totalTokens: number }
  costUSD: number
  model: string
}> {
  const {
    messages,
    model = GLM_CONFIG.models.costEffective,
    temperature = GLM_CONFIG.defaults.temperature,
    maxTokens = GLM_CONFIG.defaults.maxTokens,
    jsonMode = false,
  } = params

  const startTime = Date.now()

  try {
    const response = await glm.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    })

    // GLM may return content in different fields depending on model
    const message = response.choices[0]?.message
    // Check for reasoning_content (GLM-4.7 thinking models) or regular content
    const content = message?.content
      || (message as unknown as { reasoning_content?: string })?.reasoning_content
      || ''
    const usage = {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    }
    const costUSD = calculateGLMCost(usage.inputTokens, usage.outputTokens)

    const latencyMs = Date.now() - startTime

    logger.info('[GLM] Chat completion successful', {
      model,
      latencyMs,
      tokens: usage.totalTokens,
      costUSD,
    })

    return {
      content,
      usage,
      costUSD,
      model,
    }
  } catch (error) {
    const latencyMs = Date.now() - startTime
    logger.error('[GLM] Chat completion failed', { error, model, latencyMs })
    throw error
  }
}

/**
 * GLM Streaming Chat Completion
 */
export async function* glmStreamingCompletion(params: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  model?: GLMModel
  temperature?: number
  maxTokens?: number
}): AsyncGenerator<string, void, unknown> {
  const {
    messages,
    model = GLM_CONFIG.models.costEffective,
    temperature = GLM_CONFIG.defaults.temperature,
    maxTokens = GLM_CONFIG.defaults.maxTokens,
  } = params

  try {
    const stream = await glm.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  } catch (error) {
    logger.error('[GLM] Streaming completion failed', { error, model })
    throw error
  }
}

/**
 * GLM Vision Analysis for medical images
 */
export async function glmVisionAnalysis(params: {
  imageUrl: string
  prompt: string
  systemPrompt?: string
  detail?: 'low' | 'high' | 'auto'
}): Promise<{
  content: string
  usage: { inputTokens: number; outputTokens: number; totalTokens: number }
  costUSD: number
  model: string
}> {
  const {
    imageUrl,
    prompt,
    systemPrompt = 'Eres un asistente medico especializado en analisis de imagenes medicas.',
    detail = 'high',
  } = params

  const startTime = Date.now()

  try {
    const response = await glm.chat.completions.create({
      model: GLM_CONFIG.models.vision,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    })

    const content = response.choices[0]?.message?.content || ''
    const usage = {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    }
    const costUSD = calculateGLMCost(usage.inputTokens, usage.outputTokens)

    const latencyMs = Date.now() - startTime

    logger.info('[GLM] Vision analysis successful', {
      model: GLM_CONFIG.models.vision,
      latencyMs,
      tokens: usage.totalTokens,
      costUSD,
    })

    return {
      content,
      usage,
      costUSD,
      model: GLM_CONFIG.models.vision,
    }
  } catch (error) {
    const latencyMs = Date.now() - startTime
    logger.error('[GLM] Vision analysis failed', { error, latencyMs })
    throw error
  }
}

// Export default client for backwards compatibility
export default glm
