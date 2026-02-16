/**
 * Validation Module Barrel Export
 * 
 * Centralized exports for all validation functions and schemas.
 * 
 * @example
 * ```ts
 * import { validateCURP, validateRFC, doctorOnboardingSchema } from '@/lib/validation'
 * ```
 */

// Mexican healthcare identifiers validation
export {
  // Core validators
  validateCURP,
  validateRFC,
  validateCedulaProfesional,
  validateNSS,
  validatePhoneNumber,
  validateMexicanIdentifiers,
  // Types
  type ValidationResult,
} from './mexican-validators'

// Zod schemas for API validation
export {
  doctorOnboardingSchema,
  appointmentSchema,
  prescriptionSchema,
  doctorVerificationSchema,
  paymentIntentSchema,
  profileUpdateSchema,
  secondOpinionSchema,
  chatMessageSchema,
  validateBody,
  // Types
  type DoctorOnboardingInput,
  type AppointmentInput,
  type PrescriptionInput,
  type DoctorVerificationInput,
  type PaymentIntentInput,
  type ProfileUpdateInput,
  type SecondOpinionInput,
  type ChatMessageInput,
} from './schemas'
