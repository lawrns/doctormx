/**
 * Branded Types for Type-Safe IDs
 *
 * These types prevent mixing up different entity IDs at compile time.
 * For example, you cannot accidentally pass a UserId where a DoctorId is expected.
 */

/**
 * Base branded type for all entity IDs
 */
type BrandedId<T extends string> = string & { readonly __brand: unique symbol; readonly __type: T }

/**
 * Entity ID Types
 */
export type UserId = BrandedId<'UserId'>
export type DoctorId = BrandedId<'DoctorId'>
export type PatientId = BrandedId<'PatientId'>
export type AppointmentId = BrandedId<'AppointmentId'>
export type PaymentId = BrandedId<'PaymentId'>
export type PrescriptionId = BrandedId<'PrescriptionId'>
export type SpecialtyId = BrandedId<'SpecialtyId'>
export type ConversationId = BrandedId<'ConversationId'>
export type MessageId = BrandedId<'MessageId'>
export type AvailabilityRuleId = BrandedId<'AvailabilityRuleId'>
export type FollowUpId = BrandedId<'FollowUpId'>
export type SubscriptionId = BrandedId<'SubscriptionId'>

/**
 * Helper function to create a UserId from a string
 * Use this when you have a string that you know is a valid UserId
 */
export function toUserId(id: string): UserId {
  return id as UserId
}

/**
 * Helper function to create a DoctorId from a string
 */
export function toDoctorId(id: string): DoctorId {
  return id as DoctorId
}

/**
 * Helper function to create a PatientId from a string
 */
export function toPatientId(id: string): PatientId {
  return id as PatientId
}

/**
 * Helper function to create an AppointmentId from a string
 */
export function toAppointmentId(id: string): AppointmentId {
  return id as AppointmentId
}

/**
 * Helper function to create a PaymentId from a string
 */
export function toPaymentId(id: string): PaymentId {
  return id as PaymentId
}

/**
 * Helper function to create a PrescriptionId from a string
 */
export function toPrescriptionId(id: string): PrescriptionId {
  return id as PrescriptionId
}

/**
 * Helper function to create a SpecialtyId from a string
 */
export function toSpecialtyId(id: string): SpecialtyId {
  return id as SpecialtyId
}

/**
 * Helper function to create a ConversationId from a string
 */
export function toConversationId(id: string): ConversationId {
  return id as ConversationId
}

/**
 * Helper function to create a MessageId from a string
 */
export function toMessageId(id: string): MessageId {
  return id as MessageId
}

/**
 * Helper function to create an AvailabilityRuleId from a string
 */
export function toAvailabilityRuleId(id: string): AvailabilityRuleId {
  return id as AvailabilityRuleId
}

/**
 * Helper function to create a FollowUpId from a string
 */
export function toFollowUpId(id: string): FollowUpId {
  return id as FollowUpId
}

/**
 * Helper function to create a SubscriptionId from a string
 */
export function toSubscriptionId(id: string): SubscriptionId {
  return id as SubscriptionId
}

/**
 * Type guard to check if a string is a valid UUID format
 * This is a runtime check that can be used before casting to a branded type
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Safe conversion from string to UserId
 * Returns null if the string is not a valid UUID
 */
export function toUserIdSafe(id: string): UserId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toUserId(id)
}

/**
 * Safe conversion from string to DoctorId
 */
export function toDoctorIdSafe(id: string): DoctorId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toDoctorId(id)
}

/**
 * Safe conversion from string to PatientId
 */
export function toPatientIdSafe(id: string): PatientId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toPatientId(id)
}

/**
 * Safe conversion from string to AppointmentId
 */
export function toAppointmentIdSafe(id: string): AppointmentId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toAppointmentId(id)
}

/**
 * Safe conversion from string to PaymentId
 */
export function toPaymentIdSafe(id: string): PaymentId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toPaymentId(id)
}

/**
 * Safe conversion from string to PrescriptionId
 */
export function toPrescriptionIdSafe(id: string): PrescriptionId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toPrescriptionId(id)
}

/**
 * Safe conversion from string to SpecialtyId
 */
export function toSpecialtyIdSafe(id: string): SpecialtyId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toSpecialtyId(id)
}

/**
 * Safe conversion from string to ConversationId
 */
export function toConversationIdSafe(id: string): ConversationId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toConversationId(id)
}

/**
 * Safe conversion from string to MessageId
 */
export function toMessageIdSafe(id: string): MessageId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toMessageId(id)
}

/**
 * Safe conversion from string to AvailabilityRuleId
 */
export function toAvailabilityRuleIdSafe(id: string): AvailabilityRuleId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toAvailabilityRuleId(id)
}

/**
 * Safe conversion from string to FollowUpId
 */
export function toFollowUpIdSafe(id: string): FollowUpId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toFollowUpId(id)
}

/**
 * Safe conversion from string to SubscriptionId
 */
export function toSubscriptionIdSafe(id: string): SubscriptionId | null {
  if (!isValidUUID(id)) {
    return null
  }
  return toSubscriptionId(id)
}
