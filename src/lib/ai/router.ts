/**
 * AI Provider Router
 * Intelligent routing between GLM (primary), OpenAI, OpenRouter, and DeepSeek
 * Optimizes for cost, latency, and accuracy based on use case
 *
 * GLM z.ai is now the primary provider for Doctor.mx
 * 
 * @module lib/ai/router
 * @example
 * ```typescript
 * import { router, getAIRouter } from '@/lib/ai/router';
 * 
 * // Route vision analysis
 * const response = await router.routeVision(imageUrl, prompt, systemPrompt);
 * 
 * // Route medical reasoning
 * const result = await router.routeReasoning(messages, 'differential-diagnosis');
 * ```
 */

import { z } from 'zod'
import { openai } from '@/lib/openai'
import { openrouter } from './openrouter'
import { deepseek, type DeepSeekMessage } from './deepseek'
import { glm as glmClient, GLM_CONFIG, isGLMConfigured, calculateGLMCost } from './glm'
import { AI_CONFIG } from './config'
import { logger } from '@/lib/observability/logger'

// ============================================
// ZOD SCHEMAS FOR AI RESPONSE VALIDATION
// ============================================

/**
 * Usage schema - common across all providers
 */
const UsageSchema = z.object({
  prompt_tokens: z.number().int().min(0).default(0),
  completion_tokens: z.number().int().min(0).default(0),
  total_tokens: z.number().int().min(0).optional(),
})

/**
 * OpenAI/GLM compatible message schema
 */
const AIMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().nullable().optional(),
  reasoning_content: z.string().optional(),
})

/**
 * Choice schema for OpenAI/GLM responses
 */
const ChoiceSchema = z.object({
  index: z.number().int().optional(),
  message: AIMessageSchema,
  finish_reason: z.string().optional(),
})

/**
 * OpenAI API response schema (also used by GLM)
 */
const OpenAIResponseSchema = z.object({
  id: z.string().optional(),
  object: z.string().optional(),
  created: z.number().optional(),
  model: z.string(),
  choices: z.array(ChoiceSchema).min(1),
  usage: UsageSchema.optional(),
})

/**
 * DeepSeek message schema with reasoning support
 */
const DeepSeekMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
  reasoning_content: z.string().optional(),
})

/**
 * DeepSeek API response schema
 */
const DeepSeekResponseSchema = z.object({
  id: z.string().optional(),
  object: z.string().optional(),
  created: z.number().optional(),
  model: z.string().optional(),
  choices: z.array(
    z.object({
      index: z.number().int().optional(),
      message: DeepSeekMessageSchema,
      finish_reason: z.string().optional(),
    })
  ).min(1),
  usage: UsageSchema.optional(),
})

/**
 * OpenRouter API response schema
 */
const OpenRouterResponseSchema = z.object({
  id: z.string().optional(),
  model: z.string(),
  choices: z.array(
    z.object({
      message: z.object({
        role: z.string(),
        content: z.string(),
      }),
    })
  ).min(1),
  usage: UsageSchema.optional(),
})

/**
 * Router response validation schema
 */
const RouterResponseSchema = z.object({
  content: z.string().min(0),
  provider: z.enum(['glm', 'openai', 'openrouter', 'deepseek']),
  model: z.string().min(1),
  costUSD: z.number().min(0),
  latencyMs: z.number().int().min(0),
  reasoning: z.string().optional(),
})

// Export types derived from schemas
export type ValidatedOpenAIResponse = z.infer<typeof OpenAIResponseSchema>
export type ValidatedDeepSeekResponse = z.infer<typeof DeepSeekResponseSchema>
export type ValidatedOpenRouterResponse = z.infer<typeof OpenRouterResponseSchema>
export type ValidatedRouterResponse = z.infer<typeof RouterResponseSchema>

/**
 * Validation error class for AI responses
 */
export class AIValidationError extends Error {
  /**
   * Creates a new AI validation error
   * @param message - Error message
   * @param provider - AI provider that returned invalid response
   * @param rawResponse - Raw response from the provider
   * @param validationErrors - Zod validation error details
   */
  constructor(
    message: string,
    public readonly provider: string,
    public readonly rawResponse: unknown,
    public readonly validationErrors: z.ZodError
  ) {
    super(`[${provider}] ${message}`)
    this.name = 'AIValidationError'
  }
}

/**
 * Validate and parse OpenAI/GLM response
 * @param response - Raw response from the API
 * @param provider - Provider name ('openai' or 'glm')
 * @returns Object with extracted content and usage information
 * @throws {AIValidationError} If response validation fails
 * @example
 * const validated = validateOpenAIResponse(rawResponse, 'glm');
 * console.log(validated.content, validated.usage);
 */
function validateOpenAIResponse(
  response: unknown,
  provider: 'openai' | 'glm'
): { content: string; usage: { prompt_tokens: number; completion_tokens: number } } {
  const result = OpenAIResponseSchema.safeParse(response)

  if (!result.success) {
    logger.error(`[ROUTER] ${provider} response validation failed`, {
      issues: result.error.issues,
      response,
    })
    throw new AIValidationError(
      'Invalid response structure from AI provider',
      provider,
      response,
      result.error
    )
  }

  const validated = result.data
  const firstChoice = validated.choices[0]

  // Handle content extraction with fallback to reasoning_content for GLM
  let content = firstChoice.message.content ?? ''
  if (!content && firstChoice.message.reasoning_content) {
    content = firstChoice.message.reasoning_content
  }

  return {
    content,
    usage: validated.usage || { prompt_tokens: 0, completion_tokens: 0 },
  }
}

/**
 * Validate and parse DeepSeek response
 * @param response - Raw response from DeepSeek API
 * @returns Object with content, reasoning (if available), and usage
 * @throws {AIValidationError} If response validation fails
 * @example
 * const validated = validateDeepSeekResponse(rawResponse);
 * console.log(validated.content, validated.reasoning);
 */
function validateDeepSeekResponse(
  response: unknown
): { content: string; reasoning?: string; usage: { prompt_tokens: number; completion_tokens: number } } {
  const result = DeepSeekResponseSchema.safeParse(response)

  if (!result.success) {
    logger.error('[ROUTER] DeepSeek response validation failed', {
      issues: result.error.issues,
      response,
    })
    throw new AIValidationError(
      'Invalid response structure from DeepSeek',
      'deepseek',
      response,
      result.error
    )
  }

  const validated = result.data
  const firstChoice = validated.choices[0]

  return {
    content: firstChoice.message.content ?? '',
    reasoning: firstChoice.message.reasoning_content,
    usage: validated.usage || { prompt_tokens: 0, completion_tokens: 0 },
  }
}

/**
 * Validate and parse OpenRouter response
 * @param response - Raw response from OpenRouter API
 * @returns Object with content, model, and usage information
 * @throws {AIValidationError} If response validation fails
 * @example
 * const validated = validateOpenRouterResponse(rawResponse);
 * console.log(validated.content, validated.model);
 */
function validateOpenRouterResponse(
  response: unknown
): { content: string; model: string; usage: { prompt_tokens: number; completion_tokens: number } } {
  const result = OpenRouterResponseSchema.safeParse(response)

  if (!result.success) {
    logger.error('[ROUTER] OpenRouter response validation failed', {
      issues: result.error.issues,
      response,
    })
    throw new AIValidationError(
      'Invalid response structure from OpenRouter',
      'openrouter',
      response,
      result.error
    )
  }

  const validated = result.data

  return {
    content: validated.choices[0].message.content ?? '',
    model: validated.model,
    usage: validated.usage || { prompt_tokens: 0, completion_tokens: 0 },
  }
}

/**
 * Validate router response before returning
 * @param response - Response object to validate
 * @returns Validated router response
 * @throws {Error} If response structure is invalid
 * @example
 * const validated = validateRouterResponse({
 *   content: 'AI response',
 *   provider: 'glm',
 *   model: 'glm-4.5-air',
 *   costUSD: 0.002,
 *   latencyMs: 1200
 * });
 */
function validateRouterResponse(response: unknown): RouterResponse {
  const result = RouterResponseSchema.safeParse(response)

  if (!result.success) {
    logger.error('[ROUTER] Router response validation failed', {
      issues: result.error.issues,
      response,
    })
    // This is an internal error - we should always produce valid responses
    throw new Error(
      `Internal router error: Invalid response structure. ${result.error.message}`
    )
  }

  return result.data as RouterResponse
}

/** Available AI providers */
export type AIProvider = 'glm' | 'openai' | 'openrouter' | 'deepseek'

/** Use cases for AI routing */
export type UseCase =
  | 'vision-analysis'      // Medical image analysis
  | 'differential-diagnosis' // Complex medical reasoning
  | 'triage'              // Patient symptom triage
  | 'prescription'        // Medication recommendations
  | 'transcription'       // Audio to text
  | 'general-chat'        // General conversation
  | 'soap-notes'          // Clinical documentation

/** Configuration options for the AI router */
export interface RouterConfig {
  /** Preferred AI provider (optional) */
  preferredProvider?: AIProvider
  /** Fallback providers in order of preference (optional) */
  fallbackProviders?: AIProvider[]
  /** Maximum number of retries (optional) */
  maxRetries?: number
  /** Enable cost optimization (optional) */
  costOptimization?: boolean
}

/** Response from the AI router */
export interface RouterResponse {
  /** Generated content from the AI */
  content: string
  /** Provider that generated the response */
  provider: AIProvider
  /** Model used for generation */
  model: string
  /** Cost in USD */
  costUSD: number
  /** Latency in milliseconds */
  latencyMs: number
  /** Reasoning content (if available from DeepSeek) */
  reasoning?: string
}

/**
 * Default routing strategy based on use case
 * GLM is now the primary provider for most use cases
 */
const USE_CASE_ROUTING: Record<UseCase, { primary: AIProvider; fallbacks: AIProvider[] }> = {
  'vision-analysis': {
    primary: 'glm',         // GLM-4.5v for medical images (cost effective)
    fallbacks: ['openrouter', 'openai'],
  },
  'differential-diagnosis': {
    primary: 'glm',         // GLM-4.7 for complex reasoning
    fallbacks: ['deepseek', 'openai'],
  },
  'triage': {
    primary: 'glm',         // GLM-4.5-air for fast triage
    fallbacks: ['deepseek', 'openai'],
  },
  'prescription': {
    primary: 'glm',         // GLM for evidence-based recommendations
    fallbacks: ['deepseek', 'openai'],
  },
  'transcription': {
    primary: 'openai',      // Whisper is still best for transcription
    fallbacks: [],
  },
  'general-chat': {
    primary: 'glm',         // GLM-4.5-air for fast, cost-effective chat
    fallbacks: ['openai', 'deepseek'],
  },
  'soap-notes': {
    primary: 'glm',         // GLM-4.7 for structured output
    fallbacks: ['deepseek', 'openai'],
  },
}

/**
 * AI Router class for intelligent provider selection
 * Routes requests to the optimal AI provider based on use case and availability
 */
class AIRouter {
  /**
   * Route vision analysis request
   * @param imageUrl - URL of the image to analyze
   * @param prompt - Analysis prompt/question
   * @param systemPrompt - System prompt for context
   * @param useCase - Use case category (default: 'vision-analysis')
   * @param config - Router configuration options (optional)
   * @returns Promise with routed response
   * @throws {Error} If all providers fail
   * @example
   * const result = await router.routeVision(
   *   'https://example.com/xray.jpg',
   *   'Analyze this chest X-ray',
   *   'You are a radiologist AI'
   * );
   * console.log(result.content, result.provider);
   */
  async routeVision(
    imageUrl: string,
    prompt: string,
    systemPrompt: string,
    useCase: UseCase = 'vision-analysis',
    config: RouterConfig = {}
  ): Promise<RouterResponse> {
    const startTime = Date.now()
    const routing = USE_CASE_ROUTING[useCase]
    const provider = config.preferredProvider || routing.primary

    try {
      // Try GLM first (primary provider, cost effective)
      if (provider === 'glm' && isGLMConfigured()) {
        logger.info('[ROUTER] Routing vision to GLM')

        const rawResponse = await glmClient.chat.completions.create({
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
                    detail: 'high',
                  },
                },
                {
                  type: 'text',
                  text: prompt,
                },
              ],
            },
          ],
          max_tokens: 1500,
          temperature: 0.2,
        })

        const validated = validateOpenAIResponse(rawResponse, 'glm')
        const costUSD = calculateGLMCost(validated.usage.prompt_tokens, validated.usage.completion_tokens)

        return validateRouterResponse({
          content: validated.content,
          provider: 'glm',
          model: GLM_CONFIG.models.vision,
          costUSD,
          latencyMs: Date.now() - startTime,
        })
      }

      // Try OpenRouter as fallback (90% cheaper than OpenAI)
      if ((provider === 'openrouter' || (provider === 'glm' && !isGLMConfigured())) && openrouter.isConfigured()) {
        logger.info('[ROUTER] Routing vision to OpenRouter')

        const response = await openrouter.analyzeImage(
          imageUrl,
          prompt,
          systemPrompt,
          {
            model: config.costOptimization
              ? openrouter.getRecommendedModel('cost')
              : openrouter.getRecommendedModel('accuracy'),
            detail: 'high',
          }
        )

        return validateRouterResponse({
          content: response.content,
          provider: 'openrouter',
          model: response.model,
          costUSD: response.costUSD,
          latencyMs: Date.now() - startTime,
        })
      }

      // Fallback to OpenAI
      logger.info('[ROUTER] Routing vision to OpenAI (fallback)')

      const rawResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
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
                  detail: 'high',
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0.2,
      })

      const validated = validateOpenAIResponse(rawResponse, 'openai')

      // OpenAI GPT-4o pricing: $2.50 input, $10.00 output per 1M tokens
      const costUSD =
        (validated.usage.prompt_tokens / 1_000_000) * 2.5 +
        (validated.usage.completion_tokens / 1_000_000) * 10.0

      return validateRouterResponse({
        content: validated.content,
        provider: 'openai',
        model: 'gpt-4o',
        costUSD,
        latencyMs: Date.now() - startTime,
      })
    } catch (error) {
      if (error instanceof AIValidationError) {
        logger.error('[ROUTER] Vision routing failed - validation error', {
          provider: error.provider,
          issues: error.validationErrors.issues,
        })
        throw new Error(
          `AI provider ${error.provider} returned invalid response structure. ` +
          `Please try again or contact support if the problem persists.`
        )
      }
      logger.error('[ROUTER] Vision routing failed', { error, provider })
      throw error
    }
  }

  /**
   * Route medical reasoning request
   * @param messages - Array of messages for the conversation
   * @param useCase - Use case category (default: 'differential-diagnosis')
   * @param config - Router configuration options (optional)
   * @returns Promise with routed response
   * @throws {Error} If all providers fail
   * @example
   * const result = await router.routeReasoning([
   *   { role: 'system', content: 'You are a medical AI' },
   *   { role: 'user', content: 'Analyze these symptoms...' }
   * ], 'differential-diagnosis');
   */
  async routeReasoning(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    useCase: UseCase = 'differential-diagnosis',
    config: RouterConfig = {}
  ): Promise<RouterResponse> {
    const startTime = Date.now()
    const routing = USE_CASE_ROUTING[useCase]
    const provider = config.preferredProvider || routing.primary

    try {
      // Try GLM first (primary provider for reasoning)
      if (provider === 'glm' && isGLMConfigured()) {
        logger.info('[ROUTER] Routing reasoning to GLM')

        const rawResponse = await glmClient.chat.completions.create({
          model: GLM_CONFIG.models.reasoning,
          messages,
          temperature: 0.3,
          max_tokens: 2000,
        })

        const validated = validateOpenAIResponse(rawResponse, 'glm')
        const costUSD = calculateGLMCost(validated.usage.prompt_tokens, validated.usage.completion_tokens)

        return validateRouterResponse({
          content: validated.content,
          provider: 'glm',
          model: GLM_CONFIG.models.reasoning,
          costUSD,
          latencyMs: Date.now() - startTime,
        })
      }

      // Try DeepSeek as fallback (98% cheaper than GPT-4, better reasoning)
      if ((provider === 'deepseek' || (provider === 'glm' && !isGLMConfigured())) && deepseek.isConfigured()) {
        logger.info('[ROUTER] Routing reasoning to DeepSeek')

        const response = await deepseek.chatCompletion(
          messages as DeepSeekMessage[],
          {
            temperature: 0.3,
            maxTokens: 2000,
          }
        )

        return validateRouterResponse({
          content: response.content,
          provider: 'deepseek',
          model: 'deepseek-reasoner',
          costUSD: response.costUSD,
          latencyMs: Date.now() - startTime,
          reasoning: response.reasoning,
        })
      }

      // Fallback to OpenAI GPT-4 Turbo
      logger.info('[ROUTER] Routing reasoning to OpenAI (fallback)')

      const rawResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages,
        temperature: 0.3,
        max_tokens: 2000,
      })

      const validated = validateOpenAIResponse(rawResponse, 'openai')

      // GPT-4 Turbo pricing: $10.00 input, $30.00 output per 1M tokens
      const costUSD =
        (validated.usage.prompt_tokens / 1_000_000) * 10.0 +
        (validated.usage.completion_tokens / 1_000_000) * 30.0

      return validateRouterResponse({
        content: validated.content,
        provider: 'openai',
        model: 'gpt-4-turbo',
        costUSD,
        latencyMs: Date.now() - startTime,
      })
    } catch (error) {
      if (error instanceof AIValidationError) {
        logger.error('[ROUTER] Reasoning routing failed - validation error', {
          provider: error.provider,
          issues: error.validationErrors.issues,
        })
        throw new Error(
          `AI provider ${error.provider} returned invalid response structure. ` +
          `Please try again or contact support if the problem persists.`
        )
      }
      logger.error('[ROUTER] Reasoning routing failed', { error, provider })
      throw error
    }
  }

  /**
   * Route general chat request
   * @param messages - Array of messages for the conversation
   * @param useCase - Use case category (default: 'general-chat')
   * @param config - Router configuration options (optional)
   * @returns Promise with routed response
   * @throws {Error} If no provider is available
   * @example
   * const result = await router.routeChat([
   *   { role: 'user', content: 'Hello, I have a question' }
   * ], 'general-chat');
   */
  async routeChat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    useCase: UseCase = 'general-chat',
    config: RouterConfig = {}
  ): Promise<RouterResponse> {
    const startTime = Date.now()
    const routing = USE_CASE_ROUTING[useCase]
    const provider = config.preferredProvider || routing.primary

    try {
      // GLM is primary for general chat (cost effective)
      if (provider === 'glm' && isGLMConfigured()) {
        logger.info('[ROUTER] Routing chat to GLM')

        const rawResponse = await glmClient.chat.completions.create({
          model: GLM_CONFIG.models.costEffective,
          messages,
          temperature: 0.7,
          max_tokens: 500,
        })

        const validated = validateOpenAIResponse(rawResponse, 'glm')
        const costUSD = calculateGLMCost(validated.usage.prompt_tokens, validated.usage.completion_tokens)

        return validateRouterResponse({
          content: validated.content,
          provider: 'glm',
          model: GLM_CONFIG.models.costEffective,
          costUSD,
          latencyMs: Date.now() - startTime,
        })
      }

      // OpenAI as fallback for general chat
      if (provider === 'openai' || (provider === 'glm' && !isGLMConfigured())) {
        logger.info('[ROUTER] Routing chat to OpenAI')

        const rawResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        })

        const validated = validateOpenAIResponse(rawResponse, 'openai')

        // GPT-4o-mini pricing: $0.15 input, $0.60 output per 1M tokens
        const costUSD =
          (validated.usage.prompt_tokens / 1_000_000) * 0.15 +
          (validated.usage.completion_tokens / 1_000_000) * 0.6

        return validateRouterResponse({
          content: validated.content,
          provider: 'openai',
          model: 'gpt-4o-mini',
          costUSD,
          latencyMs: Date.now() - startTime,
        })
      }

      // DeepSeek as another fallback option
      if (provider === 'deepseek' && deepseek.isConfigured()) {
        logger.info('[ROUTER] Routing chat to DeepSeek')

        const response = await deepseek.chatCompletion(
          messages as DeepSeekMessage[],
          {
            temperature: 0.7,
            maxTokens: 500,
          }
        )

        return validateRouterResponse({
          content: response.content,
          provider: 'deepseek',
          model: 'deepseek-reasoner',
          costUSD: response.costUSD,
          latencyMs: Date.now() - startTime,
          reasoning: response.reasoning,
        })
      }

      throw new Error('No configured AI provider available')
    } catch (error) {
      if (error instanceof AIValidationError) {
        logger.error('[ROUTER] Chat routing failed - validation error', {
          provider: error.provider,
          issues: error.validationErrors.issues,
        })
        throw new Error(
          `AI provider ${error.provider} returned invalid response structure. ` +
          `Please try again or contact support if the problem persists.`
        )
      }
      logger.error('[ROUTER] Chat routing failed', { error, provider })
      throw error
    }
  }

  /**
   * Get cost comparison across providers
   * @param estimatedTokens - Estimated token usage { input, output }
   * @returns Promise with cost estimates for each provider
   * @example
   * const costs = await router.getCostComparison({ input: 1000, output: 500 });
   * console.log(costs.glm, costs.openai, costs.deepseek);
   */
  async getCostComparison(
    estimatedTokens: { input: number; output: number }
  ): Promise<Record<AIProvider, number>> {
    return {
      glm: (estimatedTokens.input / 1_000_000) * GLM_CONFIG.pricing.input + (estimatedTokens.output / 1_000_000) * GLM_CONFIG.pricing.output,
      openai: (estimatedTokens.input / 1_000_000) * 10.0 + (estimatedTokens.output / 1_000_000) * 30.0,
      deepseek: (estimatedTokens.input / 1_000_000) * 0.14 + (estimatedTokens.output / 1_000_000) * 0.28,
      openrouter: (estimatedTokens.input / 1_000_000) * 0.125 + (estimatedTokens.output / 1_000_000) * 0.375,
    }
  }

  /**
   * Get provider status
   * @returns Object with availability status for each provider
   * @example
   * const status = router.getProviderStatus();
   * if (status.glm) { // Use GLM }
   */
  getProviderStatus(): Record<AIProvider, boolean> {
    return {
      glm: isGLMConfigured(),
      openai: !!process.env.OPENAI_API_KEY,
      openrouter: openrouter.isConfigured(),
      deepseek: deepseek.isConfigured(),
    }
  }

  /**
   * Get the primary provider based on configuration
   * @returns The primary AI provider
   * @example
   * const primary = router.getPrimaryProvider();
   * console.log('Using:', primary);
   */
  getPrimaryProvider(): AIProvider {
    if (AI_CONFIG.features.useGLM && isGLMConfigured()) {
      return 'glm'
    }
    if (deepseek.isConfigured()) {
      return 'deepseek'
    }
    return 'openai'
  }
}

// Singleton instance
let aiRouter: AIRouter | null = null

/**
 * Get or create the AI router singleton instance
 * @returns The AIRouter singleton instance
 * @example
 * const router = getAIRouter();
 * const response = await router.routeChat(messages);
 */
export function getAIRouter(): AIRouter {
  if (!aiRouter) {
    aiRouter = new AIRouter()
  }
  return aiRouter
}

/** Singleton router instance for convenience */
export const router = getAIRouter()

// Export validation functions for testing
export {
  validateOpenAIResponse,
  validateDeepSeekResponse,
  validateOpenRouterResponse,
  validateRouterResponse,
}
