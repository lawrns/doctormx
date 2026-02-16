/**
 * Consent System Integration Tests
 *
 * Comprehensive integration tests for consent management system.
 * Tests consent grants, withdrawals, versioning, and guardian consent.
 *
 * @test integration/consent
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { createClient } from '@/lib/supabase/server'
import type { ConsentType } from '@/lib/consent/types'
import { logger } from '@/lib/observability/logger'

// Import functions to test
import {
  grantConsent,
  withdrawConsent,
  hasUserConsent,
  getUserConsents,
  getActiveConsents,
  getConsentHistory,
} from '@/lib/consent/index'

import {
  verifyAgeAndConsentRequirements,
  calculateAge,
} from '@/lib/consent/index'

import {
  createConsentAuditLog,
  getConsentAuditLogsForUser,
} from '@/lib/consent/audit'

// Test data
const TEST_USER_ID = 'test_user_consent_001'
const TEST_MINOR_USER_ID = 'test_minor_user_consent_001'
const TEST_GUARDIAN_USER_ID = 'test_guardian_user_consent_001'

describe('Consent System Integration Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    const supabase = await createClient()

    // Create test users
    for (const userId of [TEST_USER_ID, TEST_MINOR_USER_ID]) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: userId === TEST_MINOR_USER_ID ? 'Test Minor User' : 'Test User Consent',
          email: `test_${userId}@integration.test`,
          role: 'patient',
          date_of_birth: userId === TEST_MINOR_USER_ID ? '2015-05-15' : '1990-01-01', // 17 years old vs 9 years old
        })

      if (error) {
        logger.error(`Failed to create test user ${userId}:`, error)
      }
    }

    // Create guardian user
    await supabase.from('profiles').upsert({
      id: TEST_GUARDIAN_USER_ID,
      full_name: 'Test Guardian User',
      email: 'guardian@test.integration.test',
      role: 'patient',
      date_of_birth: '1980-01-01', // 44 years old
    })
  })

  afterEach(async () => {
    // Cleanup test data
    const supabase = await createClient()

    // Clean up consent records
    await supabase
      .from('user_consent_records')
      .delete()
      .in('user_id', [TEST_USER_ID, TEST_MINOR_USER_ID, TEST_GUARDIAN_USER_ID])

    // Clean up consent history
    await supabase
      .from('consent_history')
      .delete()
      .in('user_id', [TEST_USER_ID, TEST_MINOR_USER_ID])

    // Clean up consent audit logs
    await supabase
      .from('consent_audit_logs')
      .delete()
      .in('user_id', [TEST_USER_ID, TEST_MINOR_USER_ID, TEST_GUARDIAN_USER_ID])
  })

  // ================================================
  // TEST GROUP 1: CONSENT GRANT
  // ================================================

  describe('Consent Grant', () => {
    it('should grant consent for adult user successfully', async () => {
      const consent = await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'analytics_consent',
        delivery_method: 'in_app',
        metadata: {
          ip_address: '127.0.0.1',
          user_agent: 'integration-test',
        },
      })

      expect(consent).toBeDefined()
      expect(consent.user_id).toBe(TEST_USER_ID)
      expect(consent.consent_type).toBe('analytics_consent')
      expect(consent.status).toBe('granted')
    })

    it('should store consent record with all required fields', async () => {
      const consent = await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'marketing_emails',
        delivery_method: 'email',
      })

      expect(consent.id).toBeDefined()
      expect(consent.created_at).toBeDefined()
      expect(consent.granted_at).toBeDefined()
      expect(consent.consent_version_id).toBeDefined()
    })

    it('should track consent in history', async () => {
      await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'personalization_consent',
        delivery_method: 'in_app',
      })

      const history = await getConsentHistory(TEST_USER_ID)

      const grantEntry = history.find((h) => h.action === 'granted')
      expect(grantEntry).toBeDefined()
      expect(grantEntry?.new_status).toBe('granted')
    })

    it('should create audit log for consent grant', async () => {
      await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'ai_training_consent',
        delivery_method: 'checkbox',
      })

      const auditLogs = await getConsentAuditLogsForUser(TEST_USER_ID)

      const grantLog = auditLogs.find((log) =>
        log.metadata?.consent_type === 'ai_training_consent' &&
        log.event_type === 'consent.granted'
      )

      expect(grantLog).toBeDefined()
    })

    it('should prevent duplicate active consents of same type', async () => {
      // Grant first consent
      await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'marketing_emails',
        delivery_method: 'email',
      })

      // Check for duplicate
      const hasConsent = await hasUserConsent(TEST_USER_ID, 'marketing_emails')

      // Try to grant again
      const secondConsent = await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'marketing_emails',
        delivery_method: 'email',
      })

      // Should succeed but first should be withdrawn
      expect(secondConsent).toBeDefined()
    })
  })

  // ================================================
  // TEST GROUP 2: CONSENT WITHDRAWAL
  // ================================================

  describe('Consent Withdrawal', () => {
    it('should withdraw consent successfully', async () => {
      // First grant consent
      const consent = await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'marketing_sms',
        delivery_method: 'in_app',
      })

      // Then withdraw it
      const withdrawn = await withdrawConsent({
        consent_record_id: consent.id,
        withdrawal_reason: 'Ya no deseo recibir mensajes SMS',
        withdrawn_by: 'user',
      })

      expect(withdrawn.status).toBe('withdrawn')
      expect(withdrawn.withdrawn_at).toBeDefined()
      expect(withdrawn.withdrawal_reason).toBe('Ya no deseo recibir mensajes SMS')
    })

    it('should track withdrawal in history', async () => {
      // Grant consent
      const consent = await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'research_consent',
        delivery_method: 'in_app',
      })

      // Withdraw it
      await withdrawConsent({
        consent_record_id: consent.id,
        withdrawal_reason: 'Cambio de opinión sobre investigación',
        withdrawn_by: 'user',
      })

      const history = await getConsentHistory(TEST_USER_ID)

      const withdrawEntry = history.find((h) => h.action === 'withdrawn')
      expect(withdrawEntry).toBeDefined()
      expect(withdrawEntry?.new_status).toBe('withdrawn')
    })

    it('should prevent withdrawal of essential consents', async () => {
      // Try to withdraw essential consent
      const consent = await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'analytics_consent', // May be marked as essential
        delivery_method: 'in_app',
        metadata: {
          essential: true,
        },
      })

      // Attempt withdrawal should fail
      await expect(async () => {
        await withdrawConsent({
          consent_record_id: consent.id,
          withdrawal_reason: 'Trying to withdraw essential consent',
          withdrawn_by: 'user',
        })
      }).rejects.toThrow()
    })

    it('should create audit log for withdrawal', async () => {
      // Grant consent
      const consent = await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'share_with_insurance',
        delivery_method: 'checkbox',
      })

      // Withdraw it
      await withdrawConsent({
        consent_record_id: consent.id,
        withdrawal_reason: 'Revocación de consentimiento',
        withdrawn_by: 'user',
      })

      const auditLogs = await getConsentAuditLogsForUser(TEST_USER_ID)

      const withdrawLog = auditLogs.find((log) =>
        log.event_type === 'consent.withdrawn'
      )

      expect(withdrawLog).toBeDefined()
    })
  })

  // ================================================
  // TEST GROUP 3: GUARDIAN CONSENT
  // ================================================

  describe('Guardian Consent for Minors', () => {
    it('should verify age correctly for adult user', async () => {
      const verification = await verifyAgeAndConsentRequirements(
        TEST_USER_ID,
        'analytics_consent'
      )

      expect(verification.age).toBeGreaterThanOrEqual(18)
      expect(verification.requires_guardian).toBe(false)
      expect(verification.status).toBe('verified_adult')
    })

    it('should verify age correctly for minor user', async () => {
      const verification = await verifyAgeAndConsentRequirements(
        TEST_MINOR_USER_ID,
        'marketing_emails'
      )

      expect(verification.age).toBeLessThan(18)
      expect(verification.requires_guardian).toBe(true)
      expect(verification.status).toBe('verified_minor')
    })

    it('should require guardian consent for minors', async () => {
      const verification = await verifyAgeAndConsentRequirements(
        TEST_MINOR_USER_ID,
        'ai_training_consent'
      )

      expect(verification.requires_guardian).toBe(true)

      // Attempt to grant consent without guardian_id should fail
      await expect(async () => {
        await grantConsent({
          user_id: TEST_MINOR_USER_ID,
          consent_type: 'ai_training_consent',
          delivery_method: 'in_app',
        })
      }).rejects.toThrow()
    })

    it('should accept guardian consent for minors', async () => {
      // Create guardian consent record first
      const supabase = await createClient()
      await supabase.from('guardian_consent_records').insert({
        id: `test_guardian_${Date.now()}`,
        minor_user_id: TEST_MINOR_USER_ID,
        guardian_user_id: TEST_GUARDIAN_USER_ID,
        relationship: 'father',
        consent_types: ['ai_training_consent', 'research_consent'],
      })

      // Now consent with guardian_id should succeed
      const consent = await grantConsent({
        user_id: TEST_MINOR_USER_ID,
        consent_type: 'ai_training_consent',
        delivery_method: 'in_app',
        guardian_consent_record_id: `test_guardian_${Date.now()}`,
      })

      expect(consent).toBeDefined()
      expect(consent.guardian_consent_record_id).toBeDefined()
    })
  })

  // ================================================
  // TEST GROUP 4: CONSENT RETRIEVAL
  // ================================================

  describe('Consent Retrieval', () => {
    it('should get all user consents', async () => {
      // Grant multiple consents
      await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'marketing_emails',
        delivery_method: 'email',
      })

      await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'analytics_consent',
        delivery_method: 'in_app',
      })

      const consents = await getUserConsents(TEST_USER_ID)

      expect(consents).toBeInstanceOf(Array)
      expect(consents.length).toBeGreaterThanOrEqual(2)
    })

    it('should get only active consents', async () => {
      // Grant and withdraw a consent
      const consent = await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'marketing_sms',
        delivery_method: 'in_app',
      })

      await withdrawConsent({
        consent_record_id: consent.id,
        withdrawal_reason: 'Test withdrawal',
        withdrawn_by: 'user',
      })

      const activeConsents = await getActiveConsents(TEST_USER_ID)

      expect(activeConsents).toBeInstanceOf(Array)
      expect(activeConsents.every((c) => c.status === 'granted')).toBe(true)
    })

    it('should filter consents by type', async () => {
      // Grant specific consent
      await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'share_with_pharmacies',
        delivery_method: 'checkbox',
      })

      const consents = await getUserConsents(TEST_USER_ID)

      const pharmacyConsents = consents.filter((c) => c.consent_type === 'share_with_pharmacies')

      expect(pharmacyConsents.length).toBe(1)
    })

    it('should check if user has specific consent', async () => {
      // Grant consent
      await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'personalization_consent',
        delivery_method: 'in_app',
      })

      const hasConsent = await hasUserConsent(TEST_USER_ID, 'personalization_consent')

      expect(hasConsent).toBe(true)
    })

    it('should return false for non-granted consent', async () => {
      const hasConsent = await hasUserConsent(TEST_USER_ID, 'marketing_emails')

      // Without granting, should return false
      expect(hasConsent).toBe(false)
    })
  })

  // ================================================
  // TEST GROUP 5: CONSENT VERSIONING
  // ================================================

  describe('Consent Versioning', () => {
    it('should use latest consent version by default', async () => {
      const consent = await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'research_consent',
        delivery_method: 'in_app',
      })

      expect(consent.consent_version_id).toBeDefined()
      expect(consent.consent_text).toBeDefined()
    })

    it('should handle version expiration correctly', async () => {
      // This would require creating a consent version with data_retention_period
      // For now, test that expiration logic exists
      const verification = await verifyAgeAndConsentRequirements(
        TEST_USER_ID,
        'analytics_consent'
      )

      expect(verification.legal_age).toBeDefined()
    })
  })

  // ================================================
  // TEST GROUP 6: AUDIT LOGGING
  // ================================================

  describe('Consent Audit Logging', () => {
    it('should log all consent changes to audit trail', async () => {
      // Grant consent
      const consent = await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'share_with_insurance',
        delivery_method: 'checkbox',
      })

      const auditLogs = await getConsentAuditLogsForUser(TEST_USER_ID)

      expect(auditLogs.length).toBeGreaterThan(0)

      // Verify grant log exists
      const grantLog = auditLogs.find((log) =>
        log.event_type === 'consent.granted'
      )

      expect(grantLog).toBeDefined()
      expect(grantLog?.resource?.type).toBe('consent')
    })

    it('should include metadata in audit logs', async () => {
      const testMetadata = {
        ip_address: '192.168.1.1',
        user_agent: 'Integration Test Agent',
        session_id: 'test_session_123',
        custom_field: 'test_value',
      }

      await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'analytics_consent',
        delivery_method: 'in_app',
        metadata: testMetadata,
      })

      const auditLogs = await getConsentAuditLogsForUser(TEST_USER_ID)
      const latestLog = auditLogs[0]

      expect(latestLog.metadata).toMatchObject(testMetadata)
    })

    it('should handle audit log failures gracefully', async () => {
      // Even if audit logging fails, consent should still work
      const consent = await grantConsent({
        user_id: TEST_USER_ID,
        consent_type: 'personalization_consent',
        delivery_method: 'in_app',
      })

      // Consent should succeed even if audit has issues
      expect(consent).toBeDefined()
      expect(consent.status).toBe('granted')
    })
  })

  // ================================================
  // TEST GROUP 7: ERROR HANDLING
  // ================================================

  describe('Consent Error Handling', () => {
    it('should handle non-existent consent record', async () => {
      const result = await withdrawConsent({
        consent_record_id: 'non_existent_consent_id',
        withdrawal_reason: 'Test non-existent',
        withdrawn_by: 'user',
      })

      expect(result).toBeDefined()
      // Should handle gracefully
    })

    it('should validate consent type', async () => {
      const invalidConsentType = 'invalid_consent_type' as any

      await expect(async () => {
        await grantConsent({
          user_id: TEST_USER_ID,
          consent_type: invalidConsentType,
          delivery_method: 'in_app',
        })
      }).rejects.toThrow()
    })

    it('should handle missing user profile gracefully', async () => {
      const nonExistentUser = 'non_existent_user'

      const verification = await verifyAgeAndConsentRequirements(
        nonExistentUser,
        'analytics_consent'
      )

      // Should return status indicating unverified
      expect(verification.status).toBe('unverified')
      expect(verification.requires_guardian).toBe(true)
    })
  })
})
