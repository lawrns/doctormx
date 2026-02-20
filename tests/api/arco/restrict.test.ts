/**
 * GDPR Article 18 Restriction API Tests
 *
 * Tests for the right to restriction of processing endpoint
 * POST /api/arco/restrict
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST, GET } from '../../../src/app/api/arco/restrict/route'
import { createClient } from '../../../src/lib/supabase/server'

// Mock Supabase
vi.mock('../../../src/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock logger
vi.mock('../../../src/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('POST /api/arco/restrict', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
    }
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase)
  })

  it('should return 401 when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

    const request = new Request('http://localhost:3000/api/arco/restrict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Test restriction',
        restriction_reason: 'accuracy_contested',
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('should return 400 for invalid input data', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })

    const request = new Request('http://localhost:3000/api/arco/restrict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing required description
        restriction_reason: 'invalid_reason', // Invalid reason
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('should create restriction request successfully with valid data', async () => {
    const userId = 'user-123'
    const requestId = 'request-456'
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId, email: 'test@example.com' } },
    })

    // Mock no existing requests (for canSubmitArcoRequest)
    mockSupabase.select.mockResolvedValueOnce({ data: [], error: null })
    
    // Mock insert for arco_requests
    mockSupabase.single
      .mockResolvedValueOnce({
        data: {
          id: requestId,
          user_id: userId,
          request_type: 'RESTRICT',
          title: 'Solicitud de Restricción de Tratamiento (GDPR Art. 18)',
          description: 'Test description',
          data_scope: ['profiles'],
          status: 'pending',
          due_date: '2026-03-20T00:00:00Z',
          created_at: '2026-02-20T00:00:00Z',
        },
        error: null,
      })
      // Mock insert for history
      .mockResolvedValueOnce({ data: null, error: null })
      // Mock insert for data_restrictions
      .mockResolvedValueOnce({
        data: {
          id: 'restriction-789',
          user_id: userId,
          arco_request_id: requestId,
          table_name: 'profiles',
          restriction_reason: 'accuracy_contested',
          status: 'active',
          created_at: '2026-02-20T00:00:00Z',
        },
        error: null,
      })

    // Mock getUserActiveRestrictions
    mockSupabase.select.mockResolvedValueOnce({
      data: [
        {
          id: 'restriction-789',
          table_name: 'profiles',
          restriction_reason: 'accuracy_contested',
          status: 'active',
        },
      ],
      error: null,
    })

    const request = new Request('http://localhost:3000/api/arco/restrict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Test restriction request',
        restriction_reason: 'accuracy_contested',
        data_scope: ['profiles'],
        duration_type: 'permanent',
        apply_immediately: true,
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.request.request_type).toBe('RESTRICT')
    expect(body.data.restrictions_applied).toHaveLength(1)
    expect(body.data.gdpr_notice.article).toBe(18)
  })

  it('should handle temporary restriction with duration_days', async () => {
    const userId = 'user-123'
    const requestId = 'request-456'
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId, email: 'test@example.com' } },
    })

    // Mock no existing requests
    mockSupabase.select.mockResolvedValueOnce({ data: [], error: null })
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)

    // Mock insert for arco_requests
    mockSupabase.single
      .mockResolvedValueOnce({
        data: {
          id: requestId,
          user_id: userId,
          request_type: 'RESTRICT',
          title: 'Solicitud de Restricción de Tratamiento (GDPR Art. 18)',
          description: 'Test description',
          data_scope: ['appointments'],
          status: 'pending',
          due_date: futureDate.toISOString(),
          created_at: new Date().toISOString(),
        },
        error: null,
      })
      // Mock insert for history
      .mockResolvedValueOnce({ data: null, error: null })
      // Mock insert for data_restrictions
      .mockResolvedValueOnce({
        data: {
          id: 'restriction-789',
          user_id: userId,
          arco_request_id: requestId,
          table_name: 'appointments',
          restriction_reason: 'legal_claims',
          status: 'active',
          restricted_until: futureDate.toISOString(),
          created_at: new Date().toISOString(),
        },
        error: null,
      })

    // Mock getUserActiveRestrictions
    mockSupabase.select.mockResolvedValueOnce({
      data: [],
      error: null,
    })

    const request = new Request('http://localhost:3000/api/arco/restrict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Temporary restriction for legal claims',
        restriction_reason: 'legal_claims',
        data_scope: ['appointments'],
        duration_type: 'temporary',
        duration_days: 30,
        apply_immediately: true,
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.restriction_details.duration_type).toBe('temporary')
    expect(body.data.restriction_details.restricted_until).toBeTruthy()
  })

  it('should return 400 for invalid data_scope', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })

    const request = new Request('http://localhost:3000/api/arco/restrict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Test restriction',
        restriction_reason: 'accuracy_contested',
        data_scope: ['invalid_table'],
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('INVALID_DATA_SCOPE')
  })
})

describe('GET /api/arco/restrict', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    }
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase)
  })

  it('should return 401 when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

    const request = new Request('http://localhost:3000/api/arco/restrict', {
      method: 'GET',
    })

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('should return restriction options and active restrictions', async () => {
    const userId = 'user-123'
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId, email: 'test@example.com' } },
    })

    const now = new Date().toISOString()
    
    // Mock getUserActiveRestrictions
    mockSupabase.select.mockResolvedValue({
      data: [
        {
          id: 'restriction-1',
          user_id: userId,
          table_name: 'profiles',
          restriction_reason: 'accuracy_contested',
          status: 'active',
          restricted_until: null,
          created_at: now,
        },
        {
          id: 'restriction-2',
          user_id: userId,
          table_name: 'appointments',
          restriction_reason: 'legal_claims',
          status: 'active',
          restricted_until: null,
          created_at: now,
        },
      ],
      error: null,
    })

    const request = new Request('http://localhost:3000/api/arco/restrict', {
      method: 'GET',
    })

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.active_restrictions).toHaveLength(2)
    expect(body.data.restriction_options).toHaveLength(5)
    expect(body.data.gdpr_info.article).toBe(18)
    expect(body.data.effects).toBeDefined()
    expect(body.data.effects.storage_only).toContain('solo se almacenarán')
  })

  it('should return empty array when no active restrictions', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })

    // Mock empty restrictions
    mockSupabase.select.mockResolvedValue({
      data: [],
      error: null,
    })

    const request = new Request('http://localhost:3000/api/arco/restrict', {
      method: 'GET',
    })

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.active_restrictions).toHaveLength(0)
    expect(body.data.restriction_options).toHaveLength(5)
  })
})
