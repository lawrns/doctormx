import { vi, beforeEach, afterEach } from 'vitest'

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
})

