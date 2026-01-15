/**
 * AI Provider Router
 * Intelligent routing between OpenAI, OpenRouter, and DeepSeek
 * Optimizes for cost, latency, and accuracy based on use case
 */

import { openai } from '@/lib/openai'
import { openrouter } from './openrouter'
import { deepseek, type DeepSeekMessage } from './deepseek'
import { logger } from '@/lib/observability/logger'

export type AIProvider = 'openai' | 'openrouter' | 'deepseek'

export type UseCase =
  | 'vision-analysis'      // Medical image analysis
  | 'differential-diagnosis' // Complex medical reasoning
  | 'triage'              // Patient symptom triage
  | 'prescription'        // Medication recommendations
  | 'transcription'       // Audio to text
  | 'general-chat'        // General conversation
  | 'soap-notes'          // Clinical documentation

export interface RouterConfig {
  preferredProvider?: AIProvider
  fallbackProviders?: AIProvider[]
  maxRetries?: number
  costOptimization?: boolean
}

export interface RouterResponse {
  content: string
  provider: AIProvider
  model: string
  costUSD: number
  latencyMs: number
  reasoning?: string
}

/**
 * Default routing strategy based on use case
 */
const USE_CASE_ROUTING: Record<UseCase, { primary: AIProvider; fallbacks: AIProvider[] }> = {
  'vision-analysis': {
    primary: 'openrouter',  // 90% cost savings
    fallbacks: ['openai'],
  },
  'differential-diagnosis': {
    primary: 'deepseek',    // Superior medical reasoning
    fallbacks: ['openai'],
  },
  'triage': {
    primary: 'deepseek',    // Better at symptom analysis
    fallbacks: ['openai'],
  },
  'prescription': {
    primary: 'deepseek',    // Evidence-based recommendations
    fallbacks: ['openai'],
  },
  'transcription': {
    primary: 'openai',      // Whisper is still best
    fallbacks: [],
  },
  'general-chat': {
    primary: 'openai',      // Fastest response
    fallbacks: ['deepseek'],
  },
  'soap-notes': {
    primary: 'deepseek',    // Better structured output
    fallbacks: ['openai'],
  },
}

class AIRouter {
  /**
   * Route vision analysis request
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
      // Try OpenRouter first (90% cheaper)
      if (provider === 'openrouter' && openrouter.isConfigured()) {
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

        return {
          content: response.content,
          provider: 'openrouter',
          model: response.model,
          costUSD: response.costUSD,
          latencyMs: Date.now() - startTime,
        }
      }

      // Fallback to OpenAI
      logger.info('[ROUTER] Routing vision to OpenAI (fallback)')

      const response = await openai.chat.completions.create({
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

      const content = response.choices[0]?.message?.content || ''
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 }

      // OpenAI GPT-4o pricing: $2.50 input, $10.00 output per 1M tokens
      const costUSD =
        (usage.prompt_tokens / 1_000_000) * 2.5 +
        (usage.completion_tokens / 1_000_000) * 10.0

      return {
        content,
        provider: 'openai',
        model: 'gpt-4o',
        costUSD,
        latencyMs: Date.now() - startTime,
      }
    } catch (error) {
      logger.error('[ROUTER] Vision routing failed', { error, provider })
      throw error
    }
  }

  /**
   * Route medical reasoning request
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
      // Try DeepSeek first (98% cheaper, better reasoning)
      if (provider === 'deepseek' && deepseek.isConfigured()) {
        logger.info('[ROUTER] Routing reasoning to DeepSeek')

        const response = await deepseek.chatCompletion(
          messages as DeepSeekMessage[],
          {
            temperature: 0.3,
            maxTokens: 2000,
          }
        )

        return {
          content: response.content,
          provider: 'deepseek',
          model: 'deepseek-reasoner',
          costUSD: response.costUSD,
          latencyMs: Date.now() - startTime,
          reasoning: response.reasoning,
        }
      }

      // Fallback to OpenAI GPT-4 Turbo
      logger.info('[ROUTER] Routing reasoning to OpenAI (fallback)')

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages,
        temperature: 0.3,
        max_tokens: 2000,
      })

      const content = response.choices[0]?.message?.content || ''
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 }

      // GPT-4 Turbo pricing: $10.00 input, $30.00 output per 1M tokens
      const costUSD =
        (usage.prompt_tokens / 1_000_000) * 10.0 +
        (usage.completion_tokens / 1_000_000) * 30.0

      return {
        content,
        provider: 'openai',
        model: 'gpt-4-turbo',
        costUSD,
        latencyMs: Date.now() - startTime,
      }
    } catch (error) {
      logger.error('[ROUTER] Reasoning routing failed', { error, provider })
      throw error
    }
  }

  /**
   * Route general chat request
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
      // OpenAI is fastest for general chat
      if (provider === 'openai') {
        logger.info('[ROUTER] Routing chat to OpenAI')

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        })

        const content = response.choices[0]?.message?.content || ''
        const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 }

        // GPT-4o-mini pricing: $0.15 input, $0.60 output per 1M tokens
        const costUSD =
          (usage.prompt_tokens / 1_000_000) * 0.15 +
          (usage.completion_tokens / 1_000_000) * 0.6

        return {
          content,
          provider: 'openai',
          model: 'gpt-4o-mini',
          costUSD,
          latencyMs: Date.now() - startTime,
        }
      }

      // Fallback to DeepSeek if specified
      if (provider === 'deepseek' && deepseek.isConfigured()) {
        logger.info('[ROUTER] Routing chat to DeepSeek')

        const response = await deepseek.chatCompletion(
          messages as DeepSeekMessage[],
          {
            temperature: 0.7,
            maxTokens: 500,
          }
        )

        return {
          content: response.content,
          provider: 'deepseek',
          model: 'deepseek-reasoner',
          costUSD: response.costUSD,
          latencyMs: Date.now() - startTime,
          reasoning: response.reasoning,
        }
      }

      throw new Error('No configured AI provider available')
    } catch (error) {
      logger.error('[ROUTER] Chat routing failed', { error, provider })
      throw error
    }
  }

  /**
   * Get cost comparison across providers
   */
  async getCostComparison(
    estimatedTokens: { input: number; output: number }
  ): Promise<Record<AIProvider, number>> {
    return {
      openai: (estimatedTokens.input / 1_000_000) * 10.0 + (estimatedTokens.output / 1_000_000) * 30.0,
      deepseek: (estimatedTokens.input / 1_000_000) * 0.14 + (estimatedTokens.output / 1_000_000) * 0.28,
      openrouter: (estimatedTokens.input / 1_000_000) * 0.125 + (estimatedTokens.output / 1_000_000) * 0.375,
    }
  }

  /**
   * Get provider status
   */
  getProviderStatus(): Record<AIProvider, boolean> {
    return {
      openai: !!process.env.OPENAI_API_KEY,
      openrouter: openrouter.isConfigured(),
      deepseek: deepseek.isConfigured(),
    }
  }
}

// Singleton instance
let aiRouter: AIRouter | null = null

export function getAIRouter(): AIRouter {
  if (!aiRouter) {
    aiRouter = new AIRouter()
  }
  return aiRouter
}

export const router = getAIRouter()
