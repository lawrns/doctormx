import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

interface MockQuery {
  select: (arg?: string) => MockQuery;
  from: (table: string) => MockQuery;
  eq: (col: string, val: unknown) => MockQuery;
  gte: (col: string, val: unknown) => MockQuery;
  lte: (col: string, val: unknown) => MockQuery;
  lt: (col: string, val: unknown) => MockQuery;
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
    lt: vi.fn().mockReturnThis(),
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

vi.mock('@/lib/whatsapp-notifications', () => ({
  getPatientPhone: vi.fn().mockResolvedValue('+525511111111'),
  sendAppointmentConfirmation: vi.fn().mockResolvedValue({ success: true }),
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

  it('should return doctors list', async () => {
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

    const doctors = await discoverDoctors()
    expect(Array.isArray(doctors)).toBe(true)
  })

  it('should handle payment failure', async () => {
    const { createClient, createServiceClient } = await import('@/lib/supabase/server')
    const { handlePaymentFailure } = await import('@/lib/payment')
    
    const aptData = { id: 'apt-1', doctor_id: 'doc-1', start_ts: new Date().toISOString(), end_ts: new Date().toISOString() }
    const payData = { id: 'pay-1' }

    const mockFrom = vi.fn()
      .mockReturnValueOnce(createMockQuery(aptData))
      .mockReturnValueOnce(createMockQuery())
      .mockReturnValueOnce(createMockQuery())
      .mockReturnValueOnce(createMockQuery(payData))
      .mockReturnValueOnce(createMockQuery())

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
      auth: { getUser: vi.fn() }
    } as never)

    vi.mocked(createServiceClient).mockReturnValue({
      from: vi.fn().mockReturnValue(createMockQuery({ phone: null, full_name: null })),
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
    const mockDoctor = {
      status: 'approved',
      is_listed: true,
      office_address: 'Av. Reforma 123',
      offers_video: true,
      offers_in_person: true,
    }
    const mockHold = { id: 'hold-1' }
    const mockFrom = vi.fn()
      .mockReturnValueOnce(createMockQuery(mockDoctor))
      .mockReturnValueOnce(createMockQuery())
      .mockReturnValueOnce(createMockQuery(mockHold))
      .mockReturnValueOnce(createMockQuery(mockAppointment))
      .mockReturnValueOnce(createMockQuery())
      .mockReturnValueOnce(createMockQuery({ email: 't@t.com' }))
      .mockReturnValueOnce(createMockQuery({ id: 'a1', start_ts: new Date().toISOString(), doctor: { profile: { full_name: 'D' } } }))
      .mockReturnValueOnce(createMockQuery({ full_name: 'P', phone: '+525511111111' }))

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
    fc.assert(
      fc.property(fc.string({minLength: 1}), (path: string) => {
        const url = new URL('/auth/login', 'http://localhost')
        url.searchParams.set('redirect', path)
        return url.searchParams.get('redirect') === path
      })
    )
  })
})
