import { describe, it, expect, vi } from 'vitest'
import {
  AIValidationError,
  validateOpenAIResponse,
  validateDeepSeekResponse,
  validateOpenRouterResponse,
} from '../router'
import { z } from 'zod'

// Mock dependencies
vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}))

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
  isGLMConfigured: vi.fn(() => false),
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
    glm: {
      apiKey: 'test-key',
      baseURL: 'https://test.z.ai',
    },
    limits: {
      timeoutMs: 30000,
      maxRetries: 3,
    },
  },
}))

vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

describe('AI Router Validation', () => {
  describe('validateOpenAIResponse', () => {
    it('should validate a valid OpenAI response', () => {
      const validResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1677652288,
        model: 'gpt-4o',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'This is a test response',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      }

      const result = validateOpenAIResponse(validResponse, 'openai')
      expect(result.content).toBe('This is a test response')
      expect(result.usage.prompt_tokens).toBe(10)
      expect(result.usage.completion_tokens).toBe(5)
    })

    it('should handle response with reasoning_content (GLM)', () => {
      const responseWithReasoning = {
        model: 'glm-4.7',
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              reasoning_content: 'Thinking about this...',
            },
          },
        ],
        usage: {
          prompt_tokens: 20,
          completion_tokens: 10,
        },
      }

      const result = validateOpenAIResponse(responseWithReasoning, 'glm')
      expect(result.content).toBe('Thinking about this...')
    })

    it('should use default values when optional fields are missing', () => {
      const minimalResponse = {
        model: 'gpt-4o-mini',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Minimal response',
            },
          },
        ],
      }

      const result = validateOpenAIResponse(minimalResponse, 'openai')
      expect(result.content).toBe('Minimal response')
      expect(result.usage.prompt_tokens).toBe(0)
      expect(result.usage.completion_tokens).toBe(0)
    })

    it('should throw AIValidationError for invalid response (missing model)', () => {
      const invalidResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Test',
            },
          },
        ],
      }

      expect(() => validateOpenAIResponse(invalidResponse, 'openai')).toThrow(
        AIValidationError
      )
    })

    it('should throw AIValidationError for empty choices array', () => {
      const emptyChoicesResponse = {
        model: 'gpt-4o',
        choices: [],
      }

      expect(() => validateOpenAIResponse(emptyChoicesResponse, 'openai')).toThrow(
        AIValidationError
      )
    })

    it('should throw AIValidationError for missing choices', () => {
      const noChoicesResponse = {
        model: 'gpt-4o',
      }

      expect(() => validateOpenAIResponse(noChoicesResponse, 'openai')).toThrow(
        AIValidationError
      )
    })

    it('should include provider name in error message', () => {
      const invalidResponse = { model: 'gpt-4o' }

      try {
        validateOpenAIResponse(invalidResponse, 'openai')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(AIValidationError)
        expect((error as AIValidationError).provider).toBe('openai')
        expect(error.message).toContain('[openai]')
      }
    })
  })

  describe('validateDeepSeekResponse', () => {
    it('should validate a valid DeepSeek response', () => {
      const validResponse = {
        id: 'ds-123',
        model: 'deepseek-reasoner',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'DeepSeek response',
              reasoning_content: 'Chain of thought...',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 30,
          total_tokens: 80,
        },
      }

      const result = validateDeepSeekResponse(validResponse)
      expect(result.content).toBe('DeepSeek response')
      expect(result.reasoning).toBe('Chain of thought...')
      expect(result.usage.prompt_tokens).toBe(50)
    })

    it('should handle response without reasoning_content', () => {
      const responseWithoutReasoning = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Simple response',
            },
          },
        ],
      }

      const result = validateDeepSeekResponse(responseWithoutReasoning)
      expect(result.content).toBe('Simple response')
      expect(result.reasoning).toBeUndefined()
    })

    it('should throw AIValidationError for invalid response', () => {
      const invalidResponse = {
        choices: [],
      }

      expect(() => validateDeepSeekResponse(invalidResponse)).toThrow(
        AIValidationError
      )
    })
  })

  describe('validateOpenRouterResponse', () => {
    it('should validate a valid OpenRouter response', () => {
      const validResponse = {
        id: 'or-123',
        model: 'google/gemini-pro-vision',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'OpenRouter analysis result',
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      }

      const result = validateOpenRouterResponse(validResponse)
      expect(result.content).toBe('OpenRouter analysis result')
      expect(result.model).toBe('google/gemini-pro-vision')
      expect(result.usage.prompt_tokens).toBe(100)
    })

    it('should throw AIValidationError for missing model', () => {
      const invalidResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Test',
            },
          },
        ],
      }

      expect(() => validateOpenRouterResponse(invalidResponse)).toThrow(
        AIValidationError
      )
    })
  })

  describe('AIValidationError', () => {
    it('should store validation errors', () => {
      const rawResponse = { invalid: true }
      const schema = z.object({ name: z.string() })
      const validationResult = schema.safeParse(rawResponse)

      if (!validationResult.success) {
        const error = new AIValidationError(
          'Validation failed',
          'openai',
          rawResponse,
          validationResult.error
        )

        expect(error.name).toBe('AIValidationError')
        expect(error.provider).toBe('openai')
        expect(error.rawResponse).toEqual(rawResponse)
        expect(error.validationErrors).toBe(validationResult.error)
        expect(error.message).toContain('[openai]')
      }
    })
  })
})
