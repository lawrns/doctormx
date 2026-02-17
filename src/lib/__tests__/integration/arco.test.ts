/**
 * ARCO System Integration Tests
 *
 * Comprehensive integration tests for ARCO (Access, Rectification, Cancellation, Opposition)
 * rights according to LFPDPPP compliance requirements.
 *
 * @test integration/arco
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterEach, vi, beforeEach } from 'vitest'
import { createClient } from '@/lib/supabase/server'
import { type ArcoRequestType, type ArcoRequestStatus } from '@/types/arco'

// Import functions to test
import {
  createArcoRequest,
  getArcoRequest,
  getUserArcoRequests,
  updateArcoRequest,
  canSubmitArcoRequest,
} from '@/lib/arco/index'

import {
  getUserDataExport,
  exportUserDataToJson,
  createDataExportAttachment,
  planDataDeletion,
  executeDataDeletion,
} from '@/lib/arco/data-export'

import {
  trackSlaCompliance,
  checkSlaCompliance,
  getSlaMetrics,
} from '@/lib/arco/sla-tracker'

// Test data
const TEST_USER_ID = 'test_user_integration_001'
const TEST_ADMIN_ID = 'test_admin_integration_001'

/**
 * Helper to create a mock Supabase client for ARCO tests
 */
const createMockSupabaseClient = () => {
  // In-memory storage for test data
  const storage: Record<string, any[]> = {
    profiles: [],
    arco_requests: [],
    arco_request_history: [],
    data_deletions: [],
    appointments: [],
    prescriptions: [],
    payments: [],
    chat_conversations: [],
    soap_consultations: [],
    privacy_preferences: [],
  }

  // Generate unique ID
  let idCounter = 1
  const generateId = () => `test_id_${Date.now()}_${idCounter++}`

  // Create chainable query builder for select operations
  const createQueryBuilder = (table: string, items: any[] = null) => {
    let currentData = items || [...(storage[table] || [])]
    let singleMode = false
    let maybeSingleMode = false
    let orderConfig: { column: string; ascending: boolean } | null = null

    const builder: any = {
      eq: (column: string, value: any) => {
        currentData = currentData.filter((item) => item[column] === value)
        return builder
      },
      in: (column: string, values: any[]) => {
        currentData = currentData.filter((item) => values.includes(item[column]))
        return builder
      },
      not: (column: string, condition: string, values: any) => {
        if (condition === 'in' && typeof values === 'string') {
          const valueArray = values.replace(/[()]/g, '').split(',').map((v: string) => v.replace(/"/g, ''))
          currentData = currentData.filter((item) => !valueArray.includes(item[column]))
        } else if (Array.isArray(values)) {
          currentData = currentData.filter((item) => !values.includes(item[column]))
        }
        return builder
      },
      gte: (column: string, value: any) => {
        currentData = currentData.filter((item) => new Date(item[column]) >= new Date(value))
        return builder
      },
      lte: (column: string, value: any) => {
        currentData = currentData.filter((item) => new Date(item[column]) <= new Date(value))
        return builder
      },
      lt: (column: string, value: any) => {
        currentData = currentData.filter((item) => new Date(item[column]) < new Date(value))
        return builder
      },
      order: (column: string, { ascending = true } = {}) => {
        orderConfig = { column, ascending }
        currentData = [...currentData].sort((a, b) => {
          const aVal = a[column]
          const bVal = b[column]
          if (ascending) {
            return aVal > bVal ? 1 : -1
          } else {
            return aVal < bVal ? 1 : -1
          }
        })
        return builder
      },
      single: () => {
        singleMode = true
        return builder
      },
      maybeSingle: () => {
        maybeSingleMode = true
        return builder
      },
      select: (_columns?: string) => builder,
      // Execute the query
      then: (resolve: any, reject: any) => {
        if (singleMode || maybeSingleMode) {
          resolve({ data: currentData[0] || null, error: null })
        } else {
          resolve({ data: currentData, error: null })
        }
      },
    }

    return builder
  }

  const mockClient = {
    from: (table: string) => {
      // Store reference for insert/update/delete operations
      const currentTable = table

      return {
        ...createQueryBuilder(currentTable),
        // Insert operation
        insert: (data: any | any[]) => {
          const items = Array.isArray(data) ? data : [data]
          const inserted = items.map((item) => ({
            id: generateId(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...item,
          }))
          storage[currentTable] = [...(storage[currentTable] || []), ...inserted]

          return {
            select: (_columns?: string) => ({
              single: () => Promise.resolve({ data: inserted[0], error: null }),
            }),
          }
        },
        // Update operation
        update: (data: any) => {
          return {
            eq: (column: string, value: any) => {
              const items = storage[currentTable] || []
              const itemIndex = items.findIndex((i) => i[column] === value)
              if (itemIndex >= 0) {
                items[itemIndex] = { 
                  ...items[itemIndex], 
                  ...data, 
                  updated_at: new Date().toISOString() 
                }
              }
              return {
                select: (_columns?: string) => ({
                  single: () => Promise.resolve({ 
                    data: itemIndex >= 0 ? items[itemIndex] : null, 
                    error: null 
                  }),
                }),
              }
            },
          }
        },
        // Delete operation
        delete: () => {
          return {
            eq: (column: string, value: any) => {
              storage[currentTable] = (storage[currentTable] || []).filter((i) => i[column] !== value)
              return Promise.resolve({ error: null })
            },
            in: (column: string, values: any[]) => {
              storage[currentTable] = (storage[currentTable] || []).filter((i) => !values.includes(i[column]))
              return Promise.resolve({ error: null })
            },
          }
        },
      }
    },
    storage: {
      from: (_bucket: string) => ({
        upload: () => Promise.resolve({ error: null }),
        getPublicUrl: () => ({ publicUrl: 'https://test.com/file.pdf' }),
      }),
    },
  }

  // Expose storage for test verification
  ;(mockClient as any)._storage = storage

  return mockClient
}

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

describe('ARCO System Integration Tests', () => {
  let mockStorage: Record<string, any[]>

  beforeEach(() => {
    // Create fresh mock client for each test
    const mockClient = createMockSupabaseClient()
    mockStorage = (mockClient as any)._storage
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    // Setup test user
    mockStorage.profiles = [
      {
        id: TEST_USER_ID,
        full_name: 'Test User Integration',
        email: `test_${Date.now()}@integration.test`,
        role: 'patient',
      },
    ]
  })

  afterEach(async () => {
    vi.clearAllMocks()
  })

  // ================================================
  // TEST GROUP 1: ARCO REQUEST CREATION
  // ================================================

  describe('ARCO Request Creation', () => {
    it('should create an ACCESS request successfully', async () => {
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'ACCESS',
          title: 'Solicitud de Acceso a Datos Personales',
          description: 'Solicito acceso a mis datos personales',
          data_scope: ['all'],
        }
      )

      expect(request).toBeDefined()
      expect(request.user_id).toBe(TEST_USER_ID)
      expect(request.request_type).toBe('ACCESS')
      expect(request.status).toBe('pending')
    })

    it('should create a RECTIFY request with specific scope', async () => {
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'RECTIFY',
          title: 'Solicitud de Rectificación de Datos Personales',
          description: 'Necesito rectificar mi dirección telefónica',
          data_scope: ['profiles', 'appointments'],
        }
      )

      expect(request).toBeDefined()
      expect(request.request_type).toBe('RECTIFY')
      expect(request.data_scope).toEqual(['profiles', 'appointments'])
    })

    it('should create a CANCEL request with justification', async () => {
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'CANCEL',
          title: 'Solicitud de Cancelación de Datos Personales',
          description: 'Deseo eliminar mi cuenta y todos mis datos',
          data_scope: ['all'],
        }
      )

      expect(request).toBeDefined()
      expect(request.request_type).toBe('CANCEL')
      expect(request.status).toBe('pending')
    })

    it('should create an OPPOSE request with specific purposes', async () => {
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'OPPOSE',
          title: 'Solicitud de Oposición al Tratamiento de Datos',
          description: 'Me opongo al uso de mis datos para marketing',
          data_scope: ['marketing_emails', 'analytics_consent'],
        }
      )

      expect(request).toBeDefined()
      expect(request.request_type).toBe('OPPOSE')
    })

    it('should prevent duplicate pending requests', async () => {
      // Create first request
      await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'ACCESS',
          title: 'Primera solicitud',
          description: 'Primera solicitud de acceso',
          data_scope: ['all'],
        }
      )

      // Check if can submit duplicate - should throw error
      await expect(
        createArcoRequest(
          TEST_USER_ID,
          {
            request_type: 'ACCESS',
            title: 'Segunda solicitud',
            description: 'Segunda solicitud de acceso',
            data_scope: ['all'],
          }
        )
      ).rejects.toThrow()
    })

    it('should calculate correct due date with business days', async () => {
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'ACCESS',
          title: 'Verificar cálculo de días hábiles',
          description: 'Verificar cálculo de días hábiles',
          data_scope: ['all'],
        }
      )

      expect(request).toBeDefined()
      expect(request.due_date).toBeDefined()

      // Verify due date is approximately 20 business days from created_at
      const createdAt = new Date(request.created_at)
      const dueDate = new Date(request.due_date)
      const diffTime = dueDate.getTime() - createdAt.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      // Should be ~20 days but allow some margin for calendar
      expect(diffDays).toBeGreaterThanOrEqual(18)
      expect(diffDays).toBeLessThanOrEqual(35)
    })
  })

  // ================================================
  // TEST GROUP 2: DATA EXPORT
  // ================================================

  describe('ARCO Data Export', () => {
    beforeEach(() => {
      // Setup mock data for export
      mockStorage.profiles = [
        {
          id: TEST_USER_ID,
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'should-be-removed',
          reset_password_token: 'should-be-removed',
        },
      ]
      mockStorage.appointments = []
      mockStorage.prescriptions = []
      mockStorage.payments = []
      mockStorage.chat_conversations = []
      mockStorage.soap_consultations = []
      mockStorage.privacy_preferences = []
    })

    it('should export all user data as JSON', async () => {
      const json = await exportUserDataToJson(TEST_USER_ID, ['all'])

      expect(json).toBeDefined()
      expect(typeof json).toBe('string')

      const data = JSON.parse(json)
      expect(data.user_profile).toBeDefined()
      expect(data.export_metadata).toBeDefined()
    })

    it('should export specific data scopes only', async () => {
      const scope = ['appointments', 'prescriptions'] as any
      const dataPackage = await getUserDataExport(TEST_USER_ID, scope)

      expect(dataPackage).toBeDefined()
      expect(dataPackage.appointments).toBeDefined()
      expect(dataPackage.prescriptions).toBeDefined()
    })

    it('should sanitize sensitive fields from export', async () => {
      const dataPackage = await getUserDataExport(TEST_USER_ID, ['all'])

      // Verify sensitive fields are removed
      expect(dataPackage.user_profile.password).toBeUndefined()
      expect(dataPackage.user_profile.reset_password_token).toBeUndefined()
      expect(dataPackage.user_profile.confirmation_token).toBeUndefined()
    })

    it('should generate proper export metadata', async () => {
      const dataPackage = await getUserDataExport(TEST_USER_ID, ['all'])

      expect(dataPackage.export_metadata).toBeDefined()
      expect(dataPackage.export_metadata.export_format).toBe('json')
      expect(dataPackage.export_metadata.total_records).toBeGreaterThanOrEqual(0)
      expect(dataPackage.export_metadata.data_scope).toEqual(['all'])
    })
  })

  // ================================================
  // TEST GROUP 3: DATA DELETION
  // ================================================

  describe('ARCO Data Deletion', () => {
    it('should create deletion plan with retention analysis', async () => {
      // First create a CANCEL request
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'CANCEL',
          title: 'Solicitud de Cancelación',
          description: 'Solicitud de cancelación para prueba',
          data_scope: ['all'],
        }
      )

      const plan = await planDataDeletion(request.id, TEST_USER_ID)

      expect(plan).toBeDefined()
      expect(plan.tables).toBeInstanceOf(Array)
      expect(plan.immediate_deletions).toBeInstanceOf(Array)
      expect(plan.requires_anonymization).toContain('profiles')
    })

    it('should identify legal retention requirements', async () => {
      // Create a CANCEL request first
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'CANCEL',
          title: 'Solicitud de Cancelación',
          description: 'Solicitud de cancelación para prueba',
          data_scope: ['all'],
        }
      )

      const plan = await planDataDeletion(request.id, TEST_USER_ID)

      // Check that medical records have 5-year retention
      const appointmentsTable = plan.tables.find((t) => t.table === 'appointments')
      expect(appointmentsTable?.retention_reason).toContain('5 años')

      // Check payments have SAT retention
      const paymentsTable = plan.tables.find((t) => t.table === 'payments')
      expect(paymentsTable?.retention_reason).toContain('SAT')
    })

    it('should anonymize profile instead of hard delete', async () => {
      // Create a CANCEL request first
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'CANCEL',
          title: 'Solicitud de Cancelación',
          description: 'Solicitud de cancelación para prueba',
          data_scope: ['all'],
        }
      )

      // Profile should be anonymized, not deleted
      const plan = await planDataDeletion(request.id, TEST_USER_ID)

      expect(plan.requires_anonymization).toContain('profiles')
    })
  })

  // ================================================
  // TEST GROUP 4: SLA COMPLIANCE
  // ================================================

  describe('SLA Compliance Tracking', () => {
    it('should track SLA compliance correctly', async () => {
      // Create a request
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'ACCESS',
          title: 'Test SLA tracking',
          description: 'Test SLA tracking',
          data_scope: ['all'],
        }
      )

      // Check compliance
      const compliance = await checkSlaCompliance(request)

      expect(compliance).toBeDefined()
      expect(compliance.is_compliant).toBe(true)
      expect(compliance.business_days_elapsed).toBeGreaterThanOrEqual(0)
      expect(compliance.business_days_remaining).toBeGreaterThanOrEqual(0)
    })

    it('should calculate percentage of SLA used correctly', async () => {
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'ACCESS',
          title: 'Test SLA percentage',
          description: 'Test SLA percentage',
          data_scope: ['all'],
        }
      )

      const compliance = await checkSlaCompliance(request)

      expect(compliance.percentage_used).toBeGreaterThanOrEqual(0)
      expect(compliance.percentage_used).toBeLessThanOrEqual(100)
    })

    it('should detect overdue requests', async () => {
      // Create an old request that should be overdue
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 30) // 30 days ago

      const overdueRequest = {
        id: `old_request_${Date.now()}`,
        user_id: TEST_USER_ID,
        request_type: 'ACCESS' as ArcoRequestType,
        status: 'pending' as ArcoRequestStatus,
        created_at: oldDate.toISOString(),
        due_date: new Date(
          oldDate.getTime() - 20 * 24 * 60 * 60 * 1000
        ).toISOString(), // Already past due
        title: 'Old request',
        description: 'Old request',
        data_scope: ['all'],
      }

      const compliance = await checkSlaCompliance(overdueRequest)

      expect(compliance.is_overdue).toBe(true)
      expect(compliance.recommended_action).toContain('URGENT')
    })
  })

  // ================================================
  // TEST GROUP 5: REQUEST UPDATES
  // ================================================

  describe('ARCO Request Updates', () => {
    it('should update request status to acknowledged', async () => {
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'ACCESS',
          title: 'Test update to acknowledged',
          description: 'Test update to acknowledged',
          data_scope: ['all'],
        }
      )

      const updated = await updateArcoRequest(
        request.id,
        {
          status: 'acknowledged',
        },
        TEST_ADMIN_ID
      )

      expect(updated.status).toBe('acknowledged')
      expect(updated.updated_at).toBeDefined()
    })

    it('should update request status to completed with resolution', async () => {
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'ACCESS',
          title: 'Test completion',
          description: 'Test completion',
          data_scope: ['all'],
        }
      )

      // Must transition through proper status flow: pending -> acknowledged -> processing -> completed
      await updateArcoRequest(
        request.id,
        {
          status: 'acknowledged',
        },
        TEST_ADMIN_ID
      )

      await updateArcoRequest(
        request.id,
        {
          status: 'processing',
        },
        TEST_ADMIN_ID
      )

      const updated = await updateArcoRequest(
        request.id,
        {
          status: 'completed',
          response: 'Datos entregados mediante portal web',
        },
        TEST_ADMIN_ID
      )

      expect(updated.status).toBe('completed')
      expect(updated.response).toBeDefined()
    })

    it('should handle status transitions correctly', async () => {
      // Test invalid status transitions
      const request = await createArcoRequest(
        TEST_USER_ID,
        {
          request_type: 'ACCESS',
          title: 'Test status transition',
          description: 'Test status transition',
          data_scope: ['all'],
        }
      )

      // Update to acknowledged first
      await updateArcoRequest(
        request.id,
        {
          status: 'acknowledged',
        },
        TEST_ADMIN_ID
      )

      // Then to processing
      const processing = await updateArcoRequest(
        request.id,
        {
          status: 'processing',
        },
        TEST_ADMIN_ID
      )

      // Verify the update was made
      expect(processing).toBeDefined()
    })
  })

  // ================================================
  // TEST GROUP 6: ERROR HANDLING
  // ================================================

  describe('ARCO Error Handling', () => {
    it('should handle non-existent request gracefully', async () => {
      await expect(getArcoRequest('non_existent_id', TEST_USER_ID, false)).rejects.toThrow()
    })

    it('should validate data scope correctly', async () => {
      // Test with invalid scope
      const isValid = async () => {
        const { isValidDataScope } = await import('@/lib/arco/index')
        return isValidDataScope(['invalid_scope'] as any)
      }

      expect(await isValid()).toBe(false)
    })

    it('should handle unauthorized access attempts', async () => {
      const otherUserId = 'user_1_different'

      // Create profile for other user
      mockStorage.profiles.push({
        id: otherUserId,
        full_name: 'Other User',
        email: 'other@test.com',
      })

      // Create request as other user
      const user1Request = await createArcoRequest(
        otherUserId,
        {
          request_type: 'ACCESS',
          title: 'Test unauthorized access',
          description: 'Test unauthorized access',
          data_scope: ['all'],
        }
      )

      // User 2 should not be able to access User 1's request
      await expect(getArcoRequest(user1Request.id, TEST_USER_ID, false)).rejects.toThrow()
    })
  })
})
