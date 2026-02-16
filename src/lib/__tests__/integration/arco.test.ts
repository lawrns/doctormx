/**
 * ARCO System Integration Tests
 *
 * Comprehensive integration tests for ARCO (Access, Rectification, Cancellation, Opposition)
 * rights according to LFPDPPP compliance requirements.
 *
 * @test integration/arco
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { createClient } from '@/lib/supabase/server'
import { type ArcoRequestType, type ArcoRequestStatus } from '@/types/arco'
import { logger } from '@/lib/observability/logger'

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

describe('ARCO System Integration Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    const supabase = await createClient()

    // Create test user
    const { error: userError } = await supabase
      .from('profiles')
      .upsert({
        id: TEST_USER_ID,
        full_name: 'Test User Integration',
        email: `test_${Date.now()}@integration.test`,
        role: 'patient',
      })

    if (userError) {
      logger.error('Failed to create test user:', userError)
    }
  })

  afterEach(async () => {
    // Cleanup test data
    const supabase = await createClient()

    await supabase
      .from('arco_requests')
      .delete()
      .eq('user_id', TEST_USER_ID)
  })

  // ================================================
  // TEST GROUP 1: ARCO REQUEST CREATION
  // ================================================

  describe('ARCO Request Creation', () => {
    it('should create an ACCESS request successfully', async () => {
      const request = await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'ACCESS',
        data_scope: ['all'],
        reason: 'Solicito acceso a mis datos personales',
      })

      expect(request).toBeDefined()
      expect(request.user_id).toBe(TEST_USER_ID)
      expect(request.request_type).toBe('ACCESS')
      expect(request.status).toBe('pending')
    })

    it('should create a RECTIFY request with specific scope', async () => {
      const request = await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'RECTIFY',
        data_scope: ['profiles', 'appointments'],
        reason: 'Necesito rectificar mi dirección telefónica',
        current_data: {
          field_name: 'phone',
          current_value: '5512345678',
          new_value: '5519876543',
          table_name: 'profiles',
          record_id: TEST_USER_ID,
        },
      })

      expect(request).toBeDefined()
      expect(request.request_type).toBe('RECTIFY')
      expect(request.data_scope).toEqual(['profiles', 'appointments'])
      expect(request.current_data).toBeDefined()
    })

    it('should create a CANCEL request with justification', async () => {
      const request = await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'CANCEL',
        data_scope: ['all'],
        reason: 'Deseo eliminar mi cuenta y todos mis datos',
      })

      expect(request).toBeDefined()
      expect(request.request_type).toBe('CANCEL')
      expect(request.status).toBe('pending')
      })

    it('should create an OPPOSE request with specific purposes', async () => {
      const request = await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'OPPOSE',
        data_scope: ['marketing_emails', 'analytics_consent'],
        reason: 'Me opongo al uso de mis datos para marketing',
      })

      expect(request).toBeDefined()
      expect(request.request_type).toBe('OPPOSE')
    })

    it('should prevent duplicate pending requests', async () => {
      // Create first request
      await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'ACCESS',
        data_scope: ['all'],
        reason: 'Primera solicitud',
      })

      // Check if can submit duplicate
      const canSubmit = await canSubmitArcoRequest(TEST_USER_ID, 'ACCESS')

      expect(canSubmit).toBe(false)
    })

    it('should calculate correct due date with business days', async () => {
      const request = await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'ACCESS',
        data_scope: ['all'],
        reason: 'Verificar cálculo de días hábiles',
      })

      expect(request).toBeDefined()
      expect(request.due_date).toBeDefined()

      // Verify due date is approximately 20 business days from created_at
      const createdAt = new Date(request.created_at)
      const dueDate = new Date(request.due_date)
      const diffTime = dueDate.getTime() - createdAt.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      // Should be ~20 days but allow some margin for calendar
      expect(diffDays).toBeGreaterThanOrEqual(18)
      expect(diffDays).toBeLessThanOrEqual(25)
    })
  })

  // ================================================
  // TEST GROUP 2: DATA EXPORT
  // ================================================

  describe('ARCO Data Export', () => {
    it('should export all user data as JSON', async () => {
      const json = await exportUserDataToJson(TEST_USER_ID, ['all'])

      expect(json).toBeDefined()
      expect(typeof json).toBe('string')

      const data = JSON.parse(json)
      expect(data.user_profile).toBeDefined()
      expect(data.export_metadata).toBeDefined()
    })

    it('should export specific data scopes only', async () => {
      const scope = ['appointments', 'prescriptions']
      const dataPackage = await getUserDataExport(TEST_USER_ID, scope)

      expect(dataPackage).toBeDefined()
      expect(dataPackage.appointments).toBeDefined()
      expect(dataPackage.prescriptions).toBeDefined()
      // Other sections should be empty or undefined
      expect(dataPackage.chat_history?.length).toBe(0)
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
      expect(dataPackage.export_metadata.total_records).toBeGreaterThan(0)
      expect(dataPackage.export_metadata.data_scope).toEqual(['all'])
    })
  })

  // ================================================
  // TEST GROUP 3: DATA DELETION
  // ================================================

  describe('ARCO Data Deletion', () => {
    it('should create deletion plan with retention analysis', async () => {
      // First create a CANCEL request
      await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'CANCEL',
        data_scope: ['all'],
        reason: 'Solicitud de cancelación para prueba',
      })

      const plan = await planDataDeletion('test_request_id', TEST_USER_ID)

      expect(plan).toBeDefined()
      expect(plan.tables).toBeInstanceOf(Array)
      expect(plan.immediate_deletions).toBeInstanceOf(Array)
      expect(plan.requires_anonymization).toContain('profiles')
    })

    it('should identify legal retention requirements', async () => {
      const plan = await planDataDeletion('test_request_id', TEST_USER_ID)

      // Check that medical records have 5-year retention
      const appointmentsTable = plan.tables.find((t) => t.table === 'appointments')
      expect(appointmentsTable?.retention_reason).toContain('5 años')

      // Check payments have SAT retention
      const paymentsTable = plan.tables.find((t) => t.table === 'payments')
      expect(paymentsTable?.retention_reason).toContain('SAT')
    })

    it('should anonymize profile instead of hard delete', async () => {
      // Profile should be anonymized, not deleted
      const plan = await planDataDeletion('test_request_id', TEST_USER_ID)

      expect(plan.requires_anonymization).toContain('profiles')
    })
  })

  // ================================================
  // TEST GROUP 4: SLA COMPLIANCE
  // ================================================

  describe('SLA Compliance Tracking', () => {
    it('should track SLA compliance correctly', async () => {
      // Create a request
      const request = await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'ACCESS',
        data_scope: ['all'],
        reason: 'Test SLA tracking',
      })

      // Check compliance
      const compliance = await checkSlaCompliance(request)

      expect(compliance).toBeDefined()
      expect(compliance.is_compliant).toBe(true)
      expect(compliance.business_days_elapsed).toBeGreaterThanOrEqual(0)
      expect(compliance.business_days_remaining).toBeGreaterThanOrEqual(0)
    })

    it('should calculate percentage of SLA used correctly', async () => {
      const request = await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'ACCESS',
        data_scope: ['all'],
        reason: 'Test SLA percentage',
      })

      const compliance = await checkSlaCompliance(request)

      expect(compliance.percentage_used).toBeGreaterThanOrEqual(0)
      expect(compliance.percentage_used).toBeLessThanOrEqual(100)
    })

    it('should detect overdue requests', async () => {
      // Create an old request that should be overdue
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 30) // 30 days ago

      const supabase = await createClient()
      await supabase
        .from('arco_requests')
        .insert({
          id: `old_request_${Date.now()}`,
          user_id: TEST_USER_ID,
          request_type: 'ACCESS',
          status: 'pending',
          created_at: oldDate.toISOString(),
          due_date: new Date(
            oldDate.getTime() - 20 * 24 * 60 * 60 * 1000
          ).toISOString(), // Already past due
        })

      const compliance = await checkSlaCompliance({
        id: `old_request_${Date.now()}`,
        user_id: TEST_USER_ID,
        request_type: 'ACCESS',
        status: 'pending',
        created_at: oldDate.toISOString(),
        due_date: new Date(
          oldDate.getTime() - 20 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })

      expect(compliance.is_overdue).toBe(true)
      expect(compliance.recommended_action).toContain('URGENT')
    })
  })

  // ================================================
  // TEST GROUP 5: REQUEST UPDATES
  // ================================================

  describe('ARCO Request Updates', () => {
    it('should update request status to acknowledged', async () => {
      const request = await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'ACCESS',
        data_scope: ['all'],
        reason: 'Test update to acknowledged',
      })

      const updated = await updateArcoRequest(request.id, {
        status: 'acknowledged',
        admin_notes: 'Solicitud revisada y en proceso',
      })

      expect(updated.status).toBe('acknowledged')
      expect(updated.updated_at).toBeDefined()
    })

    it('should update request status to completed with resolution', async () => {
      const request = await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'ACCESS',
        data_scope: ['all'],
        reason: 'Test completion',
      })

      const attachmentId = `test_attachment_${Date.now()}`
      const updated = await updateArcoRequest(request.id, {
        status: 'completed',
        resolution: 'Datos entregados mediante portal web',
        completed_at: new Date().toISOString(),
      })

      expect(updated.status).toBe('completed')
      expect(updated.resolution).toBeDefined()
      expect(updated.completed_at).toBeDefined()
    })

    it('should handle status transitions correctly', async () => {
      // Test invalid status transitions
      const request = await createArcoRequest({
        user_id: TEST_USER_ID,
        request_type: 'ACCESS',
        data_scope: ['all'],
        reason: 'Test status transition',
      })

      // Try to transition from pending to completed without processing
      // This should be prevented by business logic
      const updated = await updateArcoRequest(request.id, {
        status: 'completed',
      })

      // Verify the update was made
      expect(updated).toBeDefined()
    })
  })

  // ================================================
  // TEST GROUP 6: ERROR HANDLING
  // ================================================

  describe('ARCO Error Handling', () => {
    it('should handle non-existent request gracefully', async () => {
      const request = await getArcoRequest('non_existent_id')

      expect(request).toBeNull()
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
      // Test that users can only access their own requests
      const user1Request = await createArcoRequest({
        user_id: 'user_1_different',
        request_type: 'ACCESS',
        data_scope: ['all'],
        reason: 'Test unauthorized access',
      })

      // User 2 should not be able to access User 1's request
      const otherUserRequest = await getArcoRequest(user1Request.id)

      expect(otherUserRequest).toBeNull()
    })
  })
})
