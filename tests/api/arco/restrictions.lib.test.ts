/**
 * GDPR Article 18 Restriction Library Tests
 *
 * Tests for the restriction utility functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../../src/lib/supabase/server'
import {
  createDataRestriction,
  isDataRestricted,
  liftDataRestriction,
  getUserActiveRestrictions,
  getRestrictionStats,
  validateProcessingOperation,
  formatRestriction,
  RESTRICTION_REASON_LABELS,
  RESTRICTION_REASON_DESCRIPTIONS,
} from '../../../src/lib/arco/restrictions'

// Mock Supabase
vi.mock('../../../src/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Restriction Library', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase)
  })

  describe('createDataRestriction', () => {
    it('should create a data restriction successfully', async () => {
      const userId = 'user-123'
      const restrictionId = 'restriction-456'
      
      const input = {
        user_id: userId,
        table_name: 'profiles' as const,
        restriction_reason: 'accuracy_contested' as const,
        restriction_details: 'Name is incorrect',
      }

      mockSupabase.single.mockResolvedValue({
        data: {
          id: restrictionId,
          user_id: userId,
          table_name: 'profiles',
          restriction_reason: 'accuracy_contested',
          restriction_details: 'Name is incorrect',
          status: 'active',
          created_at: new Date().toISOString(),
          metadata: { created_via: 'direct' },
        },
        error: null,
      })

      const result = await createDataRestriction(input)

      expect(result.id).toBe(restrictionId)
      expect(result.user_id).toBe(userId)
      expect(result.table_name).toBe('profiles')
      expect(result.status).toBe('active')
    })

    it('should create temporary restriction with expiration date', async () => {
      const userId = 'user-123'
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      
      const input = {
        user_id: userId,
        table_name: 'appointments' as const,
        restriction_reason: 'legal_claims' as const,
        restricted_until: futureDate.toISOString(),
      }

      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'restriction-789',
          user_id: userId,
          table_name: 'appointments',
          restriction_reason: 'legal_claims',
          status: 'active',
          restricted_until: futureDate.toISOString(),
          created_at: new Date().toISOString(),
        },
        error: null,
      })

      const result = await createDataRestriction(input)

      expect(result.restricted_until).toBe(futureDate.toISOString())
    })
  })

  describe('isDataRestricted', () => {
    it('should return false when no restrictions exist', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await isDataRestricted('user-123', 'profiles')

      expect(result.is_restricted).toBe(false)
    })

    it('should return true when active restriction exists', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [
          {
            id: 'restriction-1',
            user_id: 'user-123',
            table_name: 'profiles',
            restriction_reason: 'accuracy_contested',
            status: 'active',
            restricted_until: null,
          },
        ],
        error: null,
      })

      const result = await isDataRestricted('user-123', 'profiles')

      expect(result.is_restricted).toBe(true)
      expect(result.reason).toBe(RESTRICTION_REASON_LABELS.accuracy_contested)
      expect(result.restriction).toBeDefined()
    })

    it('should return false for expired temporary restrictions', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      mockSupabase.select.mockResolvedValue({
        data: [
          {
            id: 'restriction-1',
            user_id: 'user-123',
            table_name: 'profiles',
            restriction_reason: 'legal_claims',
            status: 'active',
            restricted_until: pastDate.toISOString(),
          },
        ],
        error: null,
      })

      const result = await isDataRestricted('user-123', 'profiles')

      expect(result.is_restricted).toBe(false)
    })

    it('should return true for non-expired temporary restrictions', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      mockSupabase.select.mockResolvedValue({
        data: [
          {
            id: 'restriction-1',
            user_id: 'user-123',
            table_name: 'profiles',
            restriction_reason: 'legal_claims',
            status: 'active',
            restricted_until: futureDate.toISOString(),
          },
        ],
        error: null,
      })

      const result = await isDataRestricted('user-123', 'profiles')

      expect(result.is_restricted).toBe(true)
    })
  })

  describe('liftDataRestriction', () => {
    it('should lift a restriction successfully', async () => {
      const restrictionId = 'restriction-123'
      const liftedBy = 'admin-456'

      mockSupabase.single.mockResolvedValue({
        data: {
          id: restrictionId,
          status: 'lifted',
          lifted_at: new Date().toISOString(),
          lifted_reason: 'User request',
          metadata: { lifted_by: liftedBy },
        },
        error: null,
      })

      const result = await liftDataRestriction(restrictionId, 'User request', liftedBy)

      expect(result.status).toBe('lifted')
      expect(result.lifted_reason).toBe('User request')
    })
  })

  describe('getUserActiveRestrictions', () => {
    it('should return only active non-expired restrictions', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)

      mockSupabase.select.mockResolvedValue({
        data: [
          {
            id: 'restriction-1',
            user_id: 'user-123',
            table_name: 'profiles',
            restriction_reason: 'accuracy_contested',
            status: 'active',
            restricted_until: null,
          },
          {
            id: 'restriction-2',
            user_id: 'user-123',
            table_name: 'appointments',
            restriction_reason: 'legal_claims',
            status: 'active',
            restricted_until: futureDate.toISOString(),
          },
        ],
        error: null,
      })

      const result = await getUserActiveRestrictions('user-123')

      expect(result).toHaveLength(2)
      expect(result[0].table_name).toBe('profiles')
      expect(result[1].table_name).toBe('appointments')
    })
  })

  describe('getRestrictionStats', () => {
    it('should return aggregated statistics', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 3)

      mockSupabase.select.mockResolvedValue({
        data: [
          {
            id: 'restriction-1',
            restriction_reason: 'accuracy_contested',
            table_name: 'profiles',
            restricted_until: null,
          },
          {
            id: 'restriction-2',
            restriction_reason: 'legal_claims',
            table_name: 'appointments',
            restricted_until: futureDate.toISOString(),
          },
          {
            id: 'restriction-3',
            restriction_reason: 'accuracy_contested',
            table_name: 'profiles',
            restricted_until: null,
          },
        ],
        error: null,
      })

      const result = await getRestrictionStats()

      expect(result.total_active).toBe(3)
      expect(result.by_reason.accuracy_contested).toBe(2)
      expect(result.by_reason.legal_claims).toBe(1)
      expect(result.by_table.profiles).toBe(2)
      expect(result.by_table.appointments).toBe(1)
      expect(result.expiring_soon).toBe(1) // One expires in 3 days
    })
  })

  describe('validateProcessingOperation', () => {
    it('should allow read operations even with restrictions', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [
          {
            id: 'restriction-1',
            user_id: 'user-123',
            table_name: 'profiles',
            restriction_reason: 'accuracy_contested',
            status: 'active',
          },
        ],
        error: null,
      })

      const result = await validateProcessingOperation('user-123', 'read', 'profiles')

      expect(result.allowed).toBe(true)
    })

    it('should block write operations when restricted', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [
          {
            id: 'restriction-1',
            user_id: 'user-123',
            table_name: 'profiles',
            restriction_reason: 'accuracy_contested',
            status: 'active',
          },
        ],
        error: null,
      })

      const result = await validateProcessingOperation('user-123', 'write', 'profiles')

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('write')
      expect(result.reason).toContain('restricted')
    })

    it('should block delete operations when restricted', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [
          {
            id: 'restriction-1',
            user_id: 'user-123',
            table_name: 'profiles',
            restriction_reason: 'accuracy_contested',
            status: 'active',
          },
        ],
        error: null,
      })

      const result = await validateProcessingOperation('user-123', 'delete', 'profiles')

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('delete')
    })

    it('should block share operations when restricted', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [
          {
            id: 'restriction-1',
            user_id: 'user-123',
            table_name: 'profiles',
            restriction_reason: 'accuracy_contested',
            status: 'active',
          },
        ],
        error: null,
      })

      const result = await validateProcessingOperation('user-123', 'share', 'profiles')

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('share')
    })

    it('should allow all operations when not restricted', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [],
        error: null,
      })

      const writeResult = await validateProcessingOperation('user-123', 'write', 'profiles')
      const deleteResult = await validateProcessingOperation('user-123', 'delete', 'profiles')

      expect(writeResult.allowed).toBe(true)
      expect(deleteResult.allowed).toBe(true)
    })
  })

  describe('formatRestriction', () => {
    it('should format permanent restriction correctly', () => {
      const restriction = {
        id: 'restriction-1',
        user_id: 'user-123',
        arco_request_id: null,
        table_name: 'profiles',
        record_id: null,
        field_name: null,
        restriction_reason: 'accuracy_contested' as const,
        restriction_details: null,
        status: 'active' as const,
        restricted_until: null,
        created_at: new Date().toISOString(),
        lifted_at: null,
        lifted_reason: null,
        metadata: {},
      }

      const formatted = formatRestriction(restriction)

      expect(formatted.title).toContain('Restricción')
      expect(formatted.title).toContain(RESTRICTION_REASON_LABELS.accuracy_contested)
      expect(formatted.status_label).toBe('Activa')
      expect(formatted.expires_text).toBe('Permanente')
      expect(formatted.description).toContain('profiles')
    })

    it('should format temporary restriction with expiration', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 15)

      const restriction = {
        id: 'restriction-1',
        user_id: 'user-123',
        arco_request_id: null,
        table_name: 'appointments',
        record_id: 'record-456',
        field_name: null,
        restriction_reason: 'legal_claims' as const,
        restriction_details: null,
        status: 'active' as const,
        restricted_until: futureDate.toISOString(),
        created_at: new Date().toISOString(),
        lifted_at: null,
        lifted_reason: null,
        metadata: {},
      }

      const formatted = formatRestriction(restriction)

      expect(formatted.expires_text).toContain('Expira en')
      expect(formatted.expires_text).toContain('15')
      expect(formatted.description).toContain('registro específico')
    })
  })
})

describe('Restriction Constants', () => {
  it('should have labels for all restriction reasons', () => {
    const reasons = ['accuracy_contested', 'unlawful_processing', 'legal_claims', 'public_interest', 'objection_pending']
    
    reasons.forEach(reason => {
      expect(RESTRICTION_REASON_LABELS[reason as keyof typeof RESTRICTION_REASON_LABELS]).toBeDefined()
      expect(RESTRICTION_REASON_DESCRIPTIONS[reason as keyof typeof RESTRICTION_REASON_DESCRIPTIONS]).toBeDefined()
    })
  })

  it('should have Spanish labels', () => {
    expect(RESTRICTION_REASON_LABELS.accuracy_contested).toContain('Exactitud')
    expect(RESTRICTION_REASON_LABELS.legal_claims).toContain('legales')
    expect(RESTRICTION_REASON_LABELS.objection_pending).toContain('oposición')
  })
})
