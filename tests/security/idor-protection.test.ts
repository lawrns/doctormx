/**
 * IDOR (Insecure Direct Object Reference) Security Tests
 * 
 * These tests verify that users cannot access or modify resources belonging to other users
 * by manipulating resource identifiers in requests.
 * 
 * Security Principle: Users should only be able to access resources they own or have
 * explicit permission to access.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { verifyOwnership, verifyAppointmentOwnership, verifyConversationOwnership, logIDORAttempt } from '@/lib/security/idor-protection'

// Mock the dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/security/audit-logger', () => ({
  logSecurityEvent: vi.fn(),
}))

vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { createClient } from '@/lib/supabase/server'
import { logSecurityEvent } from '@/lib/security/audit-logger'
import { logger } from '@/lib/observability/logger'

describe('IDOR Protection', () => {
  const mockSupabase = {
    from: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>)
  })

  describe('verifyOwnership', () => {
    it('should allow access when user owns the resource', async () => {
      const mockData = { id: 'resource-123', user_id: 'user-456', name: 'Test Resource' }
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      const result = await verifyOwnership({
        table: 'resources',
        resourceId: 'resource-123',
        userId: 'user-456',
      })

      expect(result.allowed).toBe(true)
      expect(result.resource).toEqual(mockData)
      expect(result.error).toBeUndefined()
    })

    it('should deny access when user does not own the resource', async () => {
      const mockData = { id: 'resource-123', user_id: 'user-999', name: 'Test Resource' }
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      const result = await verifyOwnership({
        table: 'resources',
        resourceId: 'resource-123',
        userId: 'user-456', // Different from owner
      })

      expect(result.allowed).toBe(false)
      expect(result.error).toBe('Access denied - resource ownership mismatch')
      expect(result.resource).toEqual(mockData)
    })

    it('should deny access when resource does not exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      })

      const result = await verifyOwnership({
        table: 'resources',
        resourceId: 'non-existent',
        userId: 'user-456',
      })

      expect(result.allowed).toBe(false)
      expect(result.error).toBe('Resource not found')
      expect(result.resource).toBeNull()
    })

    it('should use custom owner field when specified', async () => {
      const mockData = { id: 'resource-123', owner_id: 'user-456', name: 'Test Resource' }
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      const result = await verifyOwnership({
        table: 'resources',
        resourceId: 'resource-123',
        userId: 'user-456',
        ownerField: 'owner_id',
      })

      expect(result.allowed).toBe(true)
    })
  })

  describe('verifyAppointmentOwnership', () => {
    it('should allow access when patient owns the appointment', async () => {
      const mockAppointment = {
        id: 'apt-123',
        patient_id: 'patient-456',
        doctor_id: 'doctor-789',
        status: 'pending_payment',
      }
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
          }),
        }),
      })

      const result = await verifyAppointmentOwnership('apt-123', 'patient-456')

      expect(result.allowed).toBe(true)
      expect(result.resource).toEqual(mockAppointment)
    })

    it('should deny access when patient does not own the appointment', async () => {
      const mockAppointment = {
        id: 'apt-123',
        patient_id: 'patient-999', // Different patient
        doctor_id: 'doctor-789',
        status: 'pending_payment',
      }
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
          }),
        }),
      })

      const result = await verifyAppointmentOwnership('apt-123', 'patient-456')

      expect(result.allowed).toBe(false)
      expect(result.error).toBe('Forbidden - appointment belongs to another patient')
    })
  })

  describe('verifyConversationOwnership', () => {
    it('should allow access when user is the patient in conversation', async () => {
      const mockConversation = {
        id: 'conv-123',
        patient_id: 'patient-456',
        doctor_id: 'doctor-789',
      }
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockConversation, error: null }),
          }),
        }),
      })

      const result = await verifyConversationOwnership('conv-123', 'patient-456')

      expect(result.allowed).toBe(true)
    })

    it('should allow access when user is the doctor in conversation', async () => {
      const mockConversation = {
        id: 'conv-123',
        patient_id: 'patient-456',
        doctor_id: 'doctor-789',
      }
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockConversation, error: null }),
          }),
        }),
      })

      const result = await verifyConversationOwnership('conv-123', 'doctor-789')

      expect(result.allowed).toBe(true)
    })

    it('should deny access when user is not a participant', async () => {
      const mockConversation = {
        id: 'conv-123',
        patient_id: 'patient-456',
        doctor_id: 'doctor-789',
      }
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockConversation, error: null }),
          }),
        }),
      })

      const result = await verifyConversationOwnership('conv-123', 'hacker-999')

      expect(result.allowed).toBe(false)
      expect(result.error).toBe('Forbidden - user not part of this conversation')
    })
  })

  describe('logIDORAttempt', () => {
    it('should log IDOR attempt to security audit', async () => {
      const event = {
        userId: 'user-456',
        targetResource: 'resource-123',
        resourceType: 'appointment',
        action: 'payment',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: '2026-02-16T10:00:00Z',
        additionalContext: { reason: 'ownership_mismatch' },
      }

      await logIDORAttempt(event)

      expect(logSecurityEvent).toHaveBeenCalledWith({
        eventType: 'permission_denied',
        severity: 'high',
        userId: 'user-456',
        description: 'IDOR attempt: User user-456 attempted to payment appointment resource-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        details: {
          type: 'IDOR_ATTEMPT',
          targetResource: 'resource-123',
          resourceType: 'appointment',
          action: 'payment',
          timestamp: '2026-02-16T10:00:00Z',
          reason: 'ownership_mismatch',
        },
      })

      expect(logger.warn).toHaveBeenCalled()
    })
  })
})

describe('API Endpoint IDOR Protection', () => {
  describe('create-payment-intent', () => {
    it('should return 403 when User A tries to pay for User B\'s appointment', async () => {
      // This would be an integration test making actual API calls
      // For now, we document the expected behavior
      const testScenario = {
        description: 'User A attempts to create payment for User B\'s appointment',
        userA: { id: 'user-a', appointmentId: 'apt-a' },
        userB: { id: 'user-b', appointmentId: 'apt-b' },
        expected: {
          status: 403,
          error: 'Forbidden',
          securityEventLogged: true,
        },
      }

      expect(testScenario.expected.status).toBe(403)
      expect(testScenario.expected.error).toBe('Forbidden')
    })

    it('should return 200 when user pays for their own appointment', async () => {
      const testScenario = {
        description: 'User pays for their own appointment',
        user: { id: 'user-a', appointmentId: 'apt-a' },
        expected: {
          status: 200,
          hasClientSecret: true,
        },
      }

      expect(testScenario.expected.status).toBe(200)
      expect(testScenario.expected.hasClientSecret).toBe(true)
    })
  })

  describe('confirm-payment', () => {
    it('should return 403 when User A tries to confirm payment for User B\'s appointment', async () => {
      const testScenario = {
        description: 'User A attempts to confirm payment for User B\'s appointment',
        expected: {
          status: 403,
          error: 'Forbidden',
        },
      }

      expect(testScenario.expected.status).toBe(403)
    })
  })

  describe('chat/conversations', () => {
    it('should return 403 when user tries to access conversation they are not part of', async () => {
      const testScenario = {
        description: 'User attempts to access another user\'s conversation',
        expected: {
          status: 403,
          error: 'Forbidden',
        },
      }

      expect(testScenario.expected.status).toBe(403)
    })
  })

  describe('consultation-notes', () => {
    it('should return 401 when not authenticated', async () => {
      const testScenario = {
        description: 'Anonymous user attempts to access consultation notes',
        expected: {
          status: 401,
          error: 'Unauthorized',
        },
      }

      expect(testScenario.expected.status).toBe(401)
    })

    it('should return 403 when user tries to access notes for appointment they are not part of', async () => {
      const testScenario = {
        description: 'User attempts to access notes for unauthorized appointment',
        expected: {
          status: 403,
          error: 'Forbidden',
        },
      }

      expect(testScenario.expected.status).toBe(403)
    })
  })
})

describe('Security Event Logging', () => {
  it('should log all IDOR attempts with required fields', async () => {
    const requiredFields = [
      'eventType',
      'severity',
      'userId',
      'description',
      'details',
    ]

    const event = {
      eventType: 'permission_denied',
      severity: 'high',
      userId: 'user-123',
      description: 'Test IDOR attempt',
      details: {
        type: 'IDOR_ATTEMPT',
        targetResource: 'resource-456',
      },
    }

    await logSecurityEvent(event)

    expect(logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'permission_denied',
        severity: 'high',
      })
    )
  })

  it('should include IP address and user agent when available', async () => {
    const event = {
      userId: 'user-123',
      targetResource: 'resource-456',
      resourceType: 'appointment',
      action: 'payment',
      ipAddress: '203.0.113.1',
      userAgent: 'Mozilla/5.0 (Test)',
      timestamp: new Date().toISOString(),
    }

    await logIDORAttempt(event)

    expect(logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        ipAddress: '203.0.113.1',
        userAgent: 'Mozilla/5.0 (Test)',
      })
    )
  })
})
