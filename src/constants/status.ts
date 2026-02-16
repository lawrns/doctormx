/**
 * Status Constants - Doctor.mx
 *
 * Centralized status values for appointments, users, doctores,
 * and other entities across the platform.
 *
 * @module constants/status
 * @see {@link ../config/constants.ts} - Original source
 */

/**
 * Appointment lifecycle statuses
 * Tracks the state of a medical appointment from booking to completion
 */
export const APPOINTMENT_STATUS = {
  /** Appointment created but payment pending */
  PENDING_PAYMENT: 'pending_payment',
  /** Appointment confirmed and paid */
  CONFIRMED: 'confirmed',
  /** Appointment completed */
  COMPLETED: 'completed',
  /** Appointment cancelled by patient or doctor */
  CANCELLED: 'cancelled',
  /** Patient did not attend */
  NO_SHOW: 'no_show',
  /** Doctor did not attend */
  DOCTOR_NO_SHOW: 'doctor_no_show',
  /** Currently in progress */
  IN_PROGRESS: 'in_progress',
} as const

/**
 * Type for appointment status values
 */
export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS]

/**
 * Doctor verification statuses
 * Tracks the verification state of a doctor's profile
 */
export const DOCTOR_STATUS = {
  /** Profile created but not yet verified (can configure everything) */
  PENDING: 'pending',
  /** Verified and visible in directory */
  APPROVED: 'approved',
  /** Suspended by admin for review */
  SUSPENDED: 'suspended',
  /** Doctor has deactivated their account */
  INACTIVE: 'inactive',
  /** Under review for re-verification */
  UNDER_REVIEW: 'under_review',
} as const

/**
 * Type for doctor status values
 */
export type DoctorStatus = typeof DOCTOR_STATUS[keyof typeof DOCTOR_STATUS]

/**
 * Payment transaction statuses
 */
export const PAYMENT_STATUS = {
  /** Payment initiated but not completed */
  PENDING: 'pending',
  /** Payment successfully processed */
  COMPLETED: 'completed',
  /** Payment failed */
  FAILED: 'failed',
  /** Payment refunded */
  REFUNDED: 'refunded',
  /** Partial refund issued */
  PARTIALLY_REFUNDED: 'partially_refunded',
  /** Payment cancelled by user */
  CANCELLED: 'cancelled',
  /** Awaiting bank confirmation */
  PROCESSING: 'processing',
} as const

/**
 * Type for payment status values
 */
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

/**
 * User account statuses
 */
export const USER_STATUS = {
  /** Account active and in good standing */
  ACTIVE: 'active',
  /** Account temporarily suspended */
  SUSPENDED: 'suspended',
  /** Account deactivated by user */
  DEACTIVATED: 'deactivated',
  /** Account pending email verification */
  PENDING_VERIFICATION: 'pending_verification',
  /** Account requires admin review */
  UNDER_REVIEW: 'under_review',
} as const

/**
 * Type for user status values
 */
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS]

/**
 * Legacy STATUS export for backward compatibility
 * @deprecated Use specific status constants (APPOINTMENT_STATUS, DOCTOR_STATUS, etc.)
 */
export const STATUS = {
  APPOINTMENT: APPOINTMENT_STATUS,
  DOCTOR: DOCTOR_STATUS,
  PAYMENT: PAYMENT_STATUS,
  USER: USER_STATUS,
} as const
