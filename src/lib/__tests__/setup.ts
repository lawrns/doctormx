import { vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import { config } from 'dotenv'
import { cleanup } from '@testing-library/react'

// Load environment variables from .env file
config({ path: '.env' })

// Mock next/headers to avoid "headers was called outside a request scope" errors
// These mocks are essential for testing API routes that use headers() or cookies()
const mockHeadersGet = vi.fn()
const mockCookiesGetAll = vi.fn(() => [])
const mockCookiesSet = vi.fn()
const mockCookiesGet = vi.fn()

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({
    get: mockHeadersGet,
    entries: vi.fn().mockReturnValue([]),
    getSetCookie: vi.fn().mockReturnValue([]),
    has: vi.fn().mockReturnValue(false),
  })),
  cookies: vi.fn(() => Promise.resolve({
    getAll: mockCookiesGetAll,
    set: mockCookiesSet,
    get: mockCookiesGet,
    has: vi.fn().mockReturnValue(false),
    delete: vi.fn(),
  })),
}))

// Export mock functions for test configuration
export { mockHeadersGet, mockCookiesGetAll, mockCookiesSet, mockCookiesGet }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(),
}))

vi.mock('stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    refunds: {
      create: vi.fn(),
    },
  },
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ success: true, data: { id: 'test-email-id' } }),
    },
  })),
}))

vi.mock('openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                diagnoses: [
                  { diagnosis: 'Test Diagnosis', probability: 80, reasoning: 'Test reasoning' }
                ]
              })
            }
          }]
        }),
      },
    },
  },
}))

beforeEach(() => {
  vi.resetAllMocks()
})

afterEach(() => {
  vi.clearAllMocks()
  cleanup()
})
