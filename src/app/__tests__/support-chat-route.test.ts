import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/support/chat/route'
import { createClient } from '@/lib/supabase/server'
import { aiChatCompletion } from '@/lib/ai/openai'

vi.mock('@/lib/ai/openai', () => ({
  aiChatCompletion: vi.fn(),
}))

describe('/api/support/chat POST', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      })),
    } as never)
  })

  it('returns structured support guidance', async () => {
    vi.mocked(aiChatCompletion).mockResolvedValue({
      content: JSON.stringify({
        message: 'Doctor.mx te ayuda a encontrar doctores y resolver dudas de salud digital.',
        suggestions: ['Buscar doctores', 'Entender AI consulta'],
        links: [{ label: 'Buscar doctores', href: '/doctors' }],
        escalate: false,
      }),
      usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
      costUSD: 0.001,
      model: 'glm-5',
      provider: 'openrouter',
    })

    const request = new Request('http://localhost/api/support/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '¿Qué es Doctor.mx?',
        pathname: '/',
        history: [],
      }),
    })

    const response = await POST(request as never)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.message).toContain('Doctor.mx')
    expect(json.links[0].href).toBe('/doctors')
    expect(json.meta.provider).toBe('glm')
  })

  it('rejects invalid payloads', async () => {
    const request = new Request('http://localhost/api/support/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathname: '/' }),
    })

    const response = await POST(request as never)

    expect(response.status).toBe(400)
  })
})
