/**
 * Type Safety Tests for Branded Types
 *
 * These tests verify that branded types work correctly at compile time and runtime.
 */

import { describe, it, expect } from 'vitest'
import {
  toUserId,
  toDoctorId,
  toPatientId,
  toAppointmentId,
  toPaymentId,
  toPrescriptionId,
  toSpecialtyId,
  toConversationId,
  toMessageId,
  toAvailabilityRuleId,
  toFollowUpId,
  toSubscriptionId,
  isValidUUID,
  toUserIdSafe,
  toDoctorIdSafe,
  toPatientIdSafe,
  toAppointmentIdSafe,
  toPaymentIdSafe,
  toPrescriptionIdSafe,
  toSpecialtyIdSafe,
  toConversationIdSafe,
  toMessageIdSafe,
  toAvailabilityRuleIdSafe,
  toFollowUpIdSafe,
  toSubscriptionIdSafe,
  type UserId,
  type DoctorId,
  type PatientId,
  type AppointmentId,
  type PaymentId,
  type PrescriptionId,
  type SpecialtyId,
  type ConversationId,
  type MessageId,
  type AvailabilityRuleId,
  type FollowUpId,
  type SubscriptionId,
} from '../branded-types'

describe('Branded Types', () => {
  // Helper functions for type testing
  function processUserId(id: UserId): string {
    return id
  }

  function processDoctorId(id: DoctorId): string {
    return id
  }

  describe('ID Creation', () => {
    it('should create UserId correctly', () => {
      const userId = toUserId('user-123')
      expect(userId).toBe('user-123')
      expect(processUserId(userId)).toBe('user-123')
    })

    it('should create DoctorId correctly', () => {
      const doctorId = toDoctorId('doctor-456')
      expect(doctorId).toBe('doctor-456')
      expect(processDoctorId(doctorId)).toBe('doctor-456')
    })

    it('should create PatientId correctly', () => {
      const patientId = toPatientId('patient-789')
      expect(patientId).toBe('patient-789')
    })

    it('should create all ID types successfully', () => {
      const appointmentId = toAppointmentId('appointment-123')
      const paymentId = toPaymentId('payment-123')
      const prescriptionId = toPrescriptionId('prescription-123')
      const specialtyId = toSpecialtyId('specialty-123')
      const conversationId = toConversationId('conversation-123')
      const messageId = toMessageId('message-123')
      const availabilityRuleId = toAvailabilityRuleId('availability-rule-123')
      const followUpId = toFollowUpId('followup-123')
      const subscriptionId = toSubscriptionId('subscription-123')

      expect(appointmentId).toBe('appointment-123')
      expect(paymentId).toBe('payment-123')
      expect(prescriptionId).toBe('prescription-123')
      expect(specialtyId).toBe('specialty-123')
      expect(conversationId).toBe('conversation-123')
      expect(messageId).toBe('message-123')
      expect(availabilityRuleId).toBe('availability-rule-123')
      expect(followUpId).toBe('followup-123')
      expect(subscriptionId).toBe('subscription-123')
    })
  })

  describe('UUID Validation', () => {
    it('should validate correct UUID format', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000'
      expect(isValidUUID(validUUID)).toBe(true)
    })

    it('should reject invalid UUID format', () => {
      const invalidUUID = 'not-a-uuid'
      expect(isValidUUID(invalidUUID)).toBe(false)
    })

    it('should reject empty string', () => {
      expect(isValidUUID('')).toBe(false)
    })
  })

  describe('Safe Conversion Functions', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000'
    const invalidUUID = 'not-a-uuid'

    it('should convert valid UUID to UserId', () => {
      const safeUserId = toUserIdSafe(validUUID)
      expect(safeUserId).toBe(validUUID)
    })

    it('should return null for invalid UUID to UserId', () => {
      const invalidUserId = toUserIdSafe(invalidUUID)
      expect(invalidUserId).toBeNull()
    })

    it('should convert valid UUID to all ID types safely', () => {
      expect(toDoctorIdSafe(validUUID)).toBe(validUUID)
      expect(toPatientIdSafe(validUUID)).toBe(validUUID)
      expect(toAppointmentIdSafe(validUUID)).toBe(validUUID)
      expect(toPaymentIdSafe(validUUID)).toBe(validUUID)
      expect(toPrescriptionIdSafe(validUUID)).toBe(validUUID)
      expect(toSpecialtyIdSafe(validUUID)).toBe(validUUID)
      expect(toConversationIdSafe(validUUID)).toBe(validUUID)
      expect(toMessageIdSafe(validUUID)).toBe(validUUID)
      expect(toAvailabilityRuleIdSafe(validUUID)).toBe(validUUID)
      expect(toFollowUpIdSafe(validUUID)).toBe(validUUID)
      expect(toSubscriptionIdSafe(validUUID)).toBe(validUUID)
    })

    it('should return null for invalid UUID to all ID types', () => {
      expect(toDoctorIdSafe(invalidUUID)).toBeNull()
      expect(toPatientIdSafe(invalidUUID)).toBeNull()
      expect(toAppointmentIdSafe(invalidUUID)).toBeNull()
      expect(toPaymentIdSafe(invalidUUID)).toBeNull()
      expect(toPrescriptionIdSafe(invalidUUID)).toBeNull()
      expect(toSpecialtyIdSafe(invalidUUID)).toBeNull()
      expect(toConversationIdSafe(invalidUUID)).toBeNull()
      expect(toMessageIdSafe(invalidUUID)).toBeNull()
      expect(toAvailabilityRuleIdSafe(invalidUUID)).toBeNull()
      expect(toFollowUpIdSafe(invalidUUID)).toBeNull()
      expect(toSubscriptionIdSafe(invalidUUID)).toBeNull()
    })
  })

  describe('Type Assignability', () => {
    it('should allow branded types to be assigned to string', () => {
      function acceptsString(s: string): string {
        return s
      }

      const userId = toUserId('user-123')
      const doctorId = toDoctorId('doctor-456')
      const patientId = toPatientId('patient-789')

      expect(acceptsString(userId)).toBe('user-123')
      expect(acceptsString(doctorId)).toBe('doctor-456')
      expect(acceptsString(patientId)).toBe('patient-789')
    })
  })

  describe('Type Safety', () => {
    it('should maintain separate types for different IDs', () => {
      // This test verifies at runtime that the values are correct
      // TypeScript compilation ensures type safety at compile time
      const userId = toUserId('user-123')
      const doctorId = toDoctorId('doctor-456')
      
      // Values should be the strings passed in
      expect(userId).toBe('user-123')
      expect(doctorId).toBe('doctor-456')
      
      // Values should be different
      expect(userId).not.toBe(doctorId)
    })
  })
})
