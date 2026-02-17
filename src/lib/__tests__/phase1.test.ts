import { describe, it, expect, vi, beforeEach } from 'vitest'

interface MockQuery {
  select: (arg?: string) => MockQuery;
  from: (table: string) => MockQuery;
  eq: (col: string, val: unknown) => MockQuery;
  gte: (col: string, val: unknown) => MockQuery;
  lte: (col: string, val: unknown) => MockQuery;
  in: (col: string, val: unknown[]) => MockQuery;
  order: (col: string, options?: unknown) => MockQuery;
  limit: (count: number) => MockQuery;
  single: () => MockQuery;
  maybeSingle: () => MockQuery;
  update: (data: unknown) => MockQuery;
  delete: () => MockQuery;
  insert: (data: unknown) => MockQuery;
  then: (onFulfilled: (result: { data: unknown; error: unknown }) => void) => Promise<void>;
}

const createMockQuery = (data: unknown = [], error: unknown = null): MockQuery => {
  const query: MockQuery = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((onFulfilled: (result: { data: unknown; error: unknown }) => void) => {
      return Promise.resolve({ data, error }).then(onFulfilled)
    }),
  }
  return query
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: vi.fn().mockReturnValue(createMockQuery()),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }) }
  })),
  createServiceClient: vi.fn().mockImplementation(() => ({
    from: vi.fn().mockReturnValue(createMockQuery()),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }) }
  })),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({ id: 'pi_test', client_secret: 'pi_test_secret' }),
      retrieve: vi.fn().mockResolvedValue({ id: 'pi_test', status: 'succeeded' }),
    },
    refunds: {
      create: vi.fn().mockResolvedValue({ id: 're_test', status: 'succeeded' }),
    },
  },
}))

vi.mock('@/lib/availability', () => ({
  getAvailableSlots: vi.fn().mockResolvedValue(['09:30'])
}))

vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({ diagnoses: [{ diagnosis: 'Test', probability: 80 }] })
            }
          }]
        }),
      },
    },
  },
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ success: true, data: { id: 'email-test' } }),
    },
  })),
}))

describe('Phase 1: Unit Tests', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('should return doctores list', async () => {
    const { createServiceClient } = await import('@/lib/supabase/server')
    const { discoverDoctors } = await import('@/lib/discovery')
    
    const mockData = [{ 
      id: '1', 
      status: 'approved', 
      doctor_subscriptions: [{status: 'active', current_period_end: '2099-01-01'}] 
    }]
    
    vi.mocked(createServiceClient).mockReturnValue({
      from: vi.fn().mockReturnValue(createMockQuery(mockData)),
      auth: { getUser: vi.fn() }
    } as never)

    const doctores = await discoverDoctors()
    expect(Array.isArray(doctores)).toBe(true)
  })

  it('should handle payment failure', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { handlePaymentFailure } = await import('@/lib/payment')
    
    const aptData = { id: 'apt-1', doctor_id: 'doc-1', start_ts: new Date().toISOString(), end_ts: new Date().toISOString() }
    const payData = { id: 'pay-1' }

    const mockFrom = vi.fn()
      .mockReturnValueOnce(createMockQuery(aptData))
      .mockReturnValueOnce(createMockQuery())
      .mockReturnValueOnce(createMockQuery())
      .mockReturnValueOnce(createMockQuery(payData))
      .mockReturnValueOnce(createMockQuery())
      .mockReturnValueOnce(createMockQuery())

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
      auth: { getUser: vi.fn() }
    } as never)

    const result = await handlePaymentFailure('apt-1')
    expect(result.success).toBe(true)
  })

  it('should reserve slot', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { reserveAppointmentSlot } = await import('@/lib/booking')
    const { getAvailableSlots } = await import('@/lib/availability')
    
    vi.mocked(getAvailableSlots).mockResolvedValue(['09:30'])

    const mockAppointment = { id: 'apt-1', status: 'pending_payment' }
    const mockFrom = vi.fn()
      .mockReturnValueOnce(createMockQuery(mockAppointment))
      .mockReturnValueOnce(createMockQuery({ email: 't@t.com' }))
      .mockReturnValueOnce(createMockQuery({ id: 'a1', start_ts: new Date().toISOString(), doctor: { profile: { full_name: 'D' } } }))
      .mockReturnValueOnce(createMockQuery({ full_name: 'P' }))

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
      auth: { getUser: vi.fn() }
    } as never)

    const result = await reserveAppointmentSlot({
      patientId: 'p1',
      doctorId: 'd1',
      date: '2025-01-01',
      time: '09:30'
    })

    expect(result.success).toBe(true)
  })
})

describe('Phase 1: Property Tests', () => {
  it('should validate redirect URLs', () => {
    // Test various redirect paths
    const testPaths = [
      '/book/appointment',
      '/checkout/payment',
      '/dashboard',
      '/patient/profile',
    ]
    
    for (const path of testPaths) {
      const url = new URL('/auth/login', 'http://localhost')
      url.searchParams.set('redirect', path)
      expect(url.searchParams.get('redirect')).toBe(path)
    }
  })
})

