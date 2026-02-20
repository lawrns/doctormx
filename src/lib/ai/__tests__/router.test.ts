import { describe, it, expect, vi, beforeEach } from 'vitest'
import { router } from '../router'
import { openrouter } from '../openrouter'
import { deepseek } from '../deepseek'
import { openai } from '@/lib/openai'
import type { ChatCompletionResponse } from '../types'

// Mock dependencies
vi.mock('../openrouter', () => ({
  openrouter: {
    analyzeImage: vi.fn(),
    isConfigured: vi.fn(() => true),
    getRecommendedModel: vi.fn(() => 'google/gemini-pro-vision'),
  },
}))

vi.mock('../deepseek', () => ({
  deepseek: {
    chatCompletion: vi.fn(),
    isConfigured: vi.fn(() => true),
  },
}))

vi.mock('../glm', () => ({
  glm: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
  isGLMConfigured: vi.fn(() => false), // Default to false so tests fall through to other providers
  calculateGLMCost: vi.fn((input, output) => (input / 1_000_000) * 0.60 + (output / 1_000_000) * 2.20),
  GLM_CONFIG: {
    models: {
      reasoning: 'glm-4.7',
      costEffective: 'glm-4.5-air',
      vision: 'glm-4.5v',
    },
    pricing: {
      input: 0.60,
      output: 2.20,
      cached: 0.11,
    },
  },
}))

vi.mock('../config', () => ({
  AI_CONFIG: {
    features: {
      useGLM: true,
    },
  },
}))

vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}))

vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('AI Router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('routeVision', () => {
    it('should route to OpenRouter when GLM not configured and OpenRouter is available', async () => {
      // GLM is mocked as not configured (default), so falls through to OpenRouter
      const mockResponse = {
        content: 'Analysis result',
        model: 'google/gemini-pro-vision',
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        costUSD: 0.001,
      }

      vi.mocked(openrouter.analyzeImage).mockResolvedValue(mockResponse)

      const result = await router.routeVision(
        'https://example.com/image.jpg',
        'Analyze this image',
        'You are a medical AI',
        'vision-analysis'
      )

      expect(result.provider).toBe('openrouter')
      expect(result.content).toBe('Analysis result')
      expect(result.costUSD).toBe(0.001)
      expect(openrouter.analyzeImage).toHaveBeenCalled()
    })

    it('should fallback to OpenAI when GLM and OpenRouter not available', async () => {
      vi.mocked(openrouter.isConfigured).mockReturnValue(false)
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        model: 'gpt-4o',
        choices: [{ message: { role: 'assistant', content: 'OpenAI result' } }],
        usage: { prompt_tokens: 100, completion_tokens: 50 },
            } as unknown as ChatCompletionResponse)

      const result = await router.routeVision(
        'https://example.com/image.jpg',
        'Analyze this image',
        'You are a medical AI',
        'vision-analysis'
      )

      expect(result.provider).toBe('openai')
      expect(result.content).toBe('OpenAI result')
      expect(openai.chat.completions.create).toHaveBeenCalled()
    })

    it('should calculate cost correctly for OpenAI', async () => {
      vi.mocked(openrouter.isConfigured).mockReturnValue(false)
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        model: 'gpt-4o',
        choices: [{ message: { role: 'assistant', content: 'Result' } }],
        usage: { prompt_tokens: 1000, completion_tokens: 500 },
      } as unknown as ChatCompletionResponse)

      const result = await router.routeVision(
        'https://example.com/image.jpg',
        'Test',
        'System',
        'vision-analysis'
      )

      // GPT-4o pricing: $2.50 input, $10.00 output per 1M tokens
      // (1000 / 1M * 2.5) + (500 / 1M * 10) = 0.0025 + 0.005 = 0.0075
      expect(result.costUSD).toBeCloseTo(0.0075, 4)
    })
  })

  describe('routeReasoning', () => {
    it('should route to DeepSeek when GLM not configured', async () => {
      // GLM is mocked as not configured (default), so falls through to DeepSeek
      const mockResponse = {
        content: 'Diagnosis result',
        usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 },
        costUSD: 0.0001,
        reasoning: 'Step-by-step reasoning',
      }

      vi.mocked(deepseek.chatCompletion).mockResolvedValue(mockResponse)

      const result = await router.routeReasoning(
        [
          { role: 'system', content: 'You are a doctor' },
          { role: 'user', content: 'Patient has fever and cough' },
        ],
        'differential-diagnosis'
      )

      expect(result.provider).toBe('deepseek')
      expect(result.content).toBe('Diagnosis result')
      expect(result.reasoning).toBe('Step-by-step reasoning')
      expect(result.costUSD).toBeLessThan(0.001) // DeepSeek is cheap
      expect(deepseek.chatCompletion).toHaveBeenCalled()
    })

    it('should fallback to OpenAI when GLM and DeepSeek unavailable', async () => {
      vi.mocked(deepseek.isConfigured).mockReturnValue(false)
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        model: 'gpt-4-turbo',
        choices: [{ message: { role: 'assistant', content: 'OpenAI reasoning' } }],
        usage: { prompt_tokens: 200, completion_tokens: 100 },
      } as unknown as ChatCompletionResponse)

      const result = await router.routeReasoning(
        [{ role: 'user', content: 'Test' }],
        'differential-diagnosis'
      )

      expect(result.provider).toBe('openai')
      expect(openai.chat.completions.create).toHaveBeenCalled()
    })
  })

  describe('routeChat', () => {
    it('should use OpenAI for general chat when GLM not configured', async () => {
      // GLM is mocked as not configured (default), so falls through to OpenAI
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        model: 'gpt-4o-mini',
        choices: [{ message: { role: 'assistant', content: 'Chat response' } }],
        usage: { prompt_tokens: 50, completion_tokens: 30 },
      } as unknown as ChatCompletionResponse)

      const result = await router.routeChat(
        [{ role: 'user', content: 'Hello' }],
        'general-chat'
      )

      expect(result.provider).toBe('openai')
      expect(result.content).toBe('Chat response')
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
        })
      )
    })

    it('should use DeepSeek when explicitly specified', async () => {
      vi.mocked(deepseek.chatCompletion).mockResolvedValue({
        content: 'DeepSeek chat',
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        costUSD: 0.00001,
      })

      const result = await router.routeChat(
        [{ role: 'user', content: 'Test' }],
        'general-chat',
        { preferredProvider: 'deepseek' }
      )

      expect(result.provider).toBe('deepseek')
      expect(deepseek.chatCompletion).toHaveBeenCalled()
    })
  })

  describe('getCostComparison', () => {
    it('should calculate cost comparison across providers including GLM', async () => {
      const costs = await router.getCostComparison({
        input: 1_000_000,
        output: 1_000_000,
      })

      // GLM: 0.60 * 1 + 2.20 * 1 = $2.80
      expect(costs.glm).toBeCloseTo(2.80, 2)

      // OpenAI: 10 * 1 + 30 * 1 = $40
      expect(costs.openai).toBeCloseTo(40, 2)

      // DeepSeek: 0.14 * 1 + 0.28 * 1 = $0.42
      expect(costs.deepseek).toBeCloseTo(0.42, 2)

      // OpenRouter (Gemini): 0.125 * 1 + 0.375 * 1 = $0.50
      expect(costs.openrouter).toBeCloseTo(0.5, 2)
    })

    it('should show DeepSeek as cheapest, GLM as good value', async () => {
      const costs = await router.getCostComparison({
        input: 1_000_000,
        output: 1_000_000,
      })

      // DeepSeek is cheapest
      expect(costs.deepseek).toBeLessThan(costs.openrouter)
      expect(costs.deepseek).toBeLessThan(costs.glm)
      expect(costs.deepseek).toBeLessThan(costs.openai)

      // GLM is cheaper than OpenAI
      expect(costs.glm).toBeLessThan(costs.openai)
    })
  })

  describe('getProviderStatus', () => {
    it('should return status of all providers including GLM', () => {
      const status = router.getProviderStatus()

      expect(status).toHaveProperty('glm')
      expect(status).toHaveProperty('openai')
      expect(status).toHaveProperty('openrouter')
      expect(status).toHaveProperty('deepseek')
      expect(typeof status.glm).toBe('boolean')
      expect(typeof status.openai).toBe('boolean')
      expect(typeof status.openrouter).toBe('boolean')
      expect(typeof status.deepseek).toBe('boolean')
    })
  })
})

