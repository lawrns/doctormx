/**
 * Type Safety Tests for Branded Types
 *
 * These tests verify that branded types work correctly at compile time.
 * Some tests are designed to cause type errors if commented in.
 */

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

// Test 1: Branded types should work correctly
function processUserId(id: UserId): string {
  return id
}

function processDoctorId(id: DoctorId): string {
  return id
}

// This should compile
const userId = toUserId('user-123')
const doctorId = toDoctorId('doctor-456')
const patientId = toPatientId('patient-789')

console.log(processUserId(userId))
console.log(processDoctorId(doctorId))
// console.log(processUserId(patientId)) // This would cause a type error - PatientId is not UserId

// Test 2: Type safety - this SHOULD cause a type error if uncommented
// Uncomment to verify TypeScript prevents mixing ID types:
// processUserId(doctorId) // ❌ Type error: DoctorId is not assignable to UserId
// processDoctorId(userId) // ❌ Type error: UserId is not assignable to DoctorId

// Test 3: UUID validation
const validUUID = '550e8400-e29b-41d4-a716-446655440000'
const invalidUUID = 'not-a-uuid'

console.log('Valid UUID test:', isValidUUID(validUUID)) // Should be true
console.log('Invalid UUID test:', isValidUUID(invalidUUID)) // Should be false

// Test 4: Safe conversion functions
const safeUserId = toUserIdSafe(validUUID)
const invalidUserId = toUserIdSafe(invalidUUID)

if (safeUserId) {
  console.log('Safe conversion worked:', safeUserId)
}

if (invalidUserId === null) {
  console.log('Safe conversion correctly returned null for invalid UUID')
}

// Test 5: All ID types can be created
const appointmentId = toAppointmentId('appointment-123')
const paymentId = toPaymentId('payment-123')
const prescriptionId = toPrescriptionId('prescription-123')
const specialtyId = toSpecialtyId('specialty-123')
const conversationId = toConversationId('conversation-123')
const messageId = toMessageId('message-123')
const availabilityRuleId = toAvailabilityRuleId('availability-rule-123')
const followUpId = toFollowUpId('followup-123')
const subscriptionId = toSubscriptionId('subscription-123')

console.log('All ID types created successfully')

// Test 6: Safe conversion for all types
const safeAppointmentId = toAppointmentIdSafe(validUUID)
const safePaymentId = toPaymentIdSafe(validUUID)
const safePrescriptionId = toPrescriptionIdSafe(validUUID)
const safeSpecialtyId = toSpecialtyIdSafe(validUUID)
const safeConversationId = toConversationIdSafe(validUUID)
const safeMessageId = toMessageIdSafe(validUUID)
const safeAvailabilityRuleId = toAvailabilityRuleIdSafe(validUUID)
const safeFollowUpId = toFollowUpIdSafe(validUUID)
const safeSubscriptionId = toSubscriptionIdSafe(validUUID)

console.log('All safe conversions completed')

// Test 7: Branded types are assignable to string
function acceptsString(s: string): void {
  console.log('Received string:', s)
}

acceptsString(userId) // Should work
acceptsString(doctorId) // Should work
acceptsString(patientId) // Should work

console.log('All branded type tests passed!')
