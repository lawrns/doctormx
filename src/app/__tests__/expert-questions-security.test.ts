import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
  requireAuth: vi.fn(),
  getPublicQuestions: vi.fn(),
  getQuestionStats: vi.fn(),
  resolveSpecialtyId: vi.fn(),
  createQuestion: vi.fn(),
  getPublicQuestionById: vi.fn(),
  getModerationQuestionById: vi.fn(),
  createAnswer: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
  createServiceClient: mocks.createServiceClient,
}))

vi.mock('@/lib/auth', () => ({
  requireAuth: mocks.requireAuth,
}))

vi.mock('@/lib/expert-questions', () => ({
  getPublicQuestions: mocks.getPublicQuestions,
  getQuestionStats: mocks.getQuestionStats,
  resolveSpecialtyId: mocks.resolveSpecialtyId,
  createQuestion: mocks.createQuestion,
  getPublicQuestionById: mocks.getPublicQuestionById,
  getModerationQuestionById: mocks.getModerationQuestionById,
  createAnswer: mocks.createAnswer,
}))

function request(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init)
}

function singleResult(data: unknown) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data, error: null }),
        }),
        single: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    }),
  }
}

describe('expert questions API security', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mocks.resolveSpecialtyId.mockResolvedValue(null)
    mocks.getPublicQuestions.mockResolvedValue([])
    mocks.getQuestionStats.mockResolvedValue({ totalAnswered: 0, totalDoctors: 0, totalQuestions: 0 })
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    })
  })

  it('ignores public status filters so pending questions are not exposed', async () => {
    const { GET } = await import('@/app/api/expert-questions/route')

    const response = await GET(request('https://doctor.mx/api/expert-questions?status=pending&limit=10'))

    expect(response.status).toBe(200)
    expect(mocks.getPublicQuestions).toHaveBeenCalledWith({
      specialtyId: undefined,
      limit: 10,
      offset: 0,
    })
  })

  it('blocks non-doctors from answering questions', async () => {
    mocks.requireAuth.mockResolvedValue({ user: { id: 'patient-1' } })
    mocks.createServiceClient.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === 'doctors') return singleResult(null)
        if (table === 'profiles') return singleResult({ role: 'patient' })
        return singleResult(null)
      }),
    })

    const { POST } = await import('@/app/api/expert-questions/[id]/answers/route')
    const response = await POST(
      request('https://doctor.mx/api/expert-questions/q-1/answers', {
        method: 'POST',
        body: JSON.stringify({
          answer: 'Esta es una respuesta con suficiente longitud para pasar la validacion inicial del endpoint.',
        }),
      }),
      { params: Promise.resolve({ id: 'q-1' }) }
    )

    expect(response.status).toBe(403)
    expect(mocks.createAnswer).not.toHaveBeenCalled()
  })
})
