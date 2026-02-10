/**
 * Doctor.mx Type Definitions
 *
 * This is the main type export file that re-exports all types from the
 * enhanced type definition modules.
 *
 * Type categories:
 * - Branded types: Type-safe IDs that prevent mixing different entity IDs
 * - Error types: Discriminated unions for comprehensive error handling
 * - Database types: Type-safe database row types with proper relations
 * - Application types: High-level domain models
 */

// ================================================
// BRANDED TYPES - Type-safe IDs
// ================================================
export type {
  UserId,
  DoctorId,
  PatientId,
  AppointmentId,
  PaymentId,
  PrescriptionId,
  SpecialtyId,
  ConversationId,
  MessageId,
  AvailabilityRuleId,
  FollowUpId,
  SubscriptionId,
} from './branded-types'

export {
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
} from './branded-types'

// ================================================
// ERROR TYPES - Discriminated unions for errors
// ================================================
export type {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  DatabaseError,
  NetworkError,
  HealthcareError,
  PaymentError,
  RateLimitError,
  ConfigurationError,
  VideoCallError,
  FileUploadError,
} from './error-types'

export {
  isValidationError,
  isAuthError,
  isNotFoundError,
  isDatabaseError,
  isNetworkError,
  isHealthcareError,
  isPaymentError,
  isRateLimitError,
  isConfigurationError,
  isVideoCallError,
  isFileUploadError,
  createValidationError,
  createAuthError,
  createNotFoundError,
  createDatabaseError,
  createNetworkError,
  createHealthcareError,
  createPaymentError,
  createRateLimitError,
  createConfigurationError,
  createVideoCallError,
  createFileUploadError,
  handleError,
  getUserMessage,
  withErrorHandling,
} from './error-types'

// ================================================
// DATABASE TYPES - Schema-aligned types
// ================================================
export type {
  DatabaseRow,
  ProfileRow,
  SpecialtyRow,
  DoctorRow,
  DoctorSpecialtyRow,
  DoctorSubscriptionRow,
  AppointmentRow,
  PaymentRow,
  PrescriptionRow,
  FollowUpRow,
  ChatConversationRow,
  ChatMessageRow,
  ChatUserPresenceRow,
  AvailabilityRuleRow,
  AvailabilityExceptionRow,
  ProfileWithRelations,
  DoctorWithRelations,
  AppointmentWithRelations,
  PaymentWithRelations,
  ConversationWithRelations,
  ProfileInsert,
  DoctorInsert,
  AppointmentInsert,
  PaymentInsert,
  PrescriptionInsert,
  ChatConversationInsert,
  ChatMessageInsert,
  ProfileUpdate,
  DoctorUpdate,
  AppointmentUpdate,
  PaymentUpdate,
  DbResponse,
  DbListResponse,
  TableName,
  UserRole,
  DoctorStatus,
  AppointmentStatus,
  PaymentStatus,
  ChatMessageType,
  ChatSenderType,
  VideoStatus,
} from './database'

export { TABLES } from './database'

// ================================================
// LEGACY ENUM TYPES (kept for backward compatibility)
// ================================================
export type AppointmentType = 'in_person' | 'video'

// ================================================
// APPLICATION TYPES - High-level domain models
// ================================================

/**
 * Profile - User profile in the application
 * Uses branded ID types for type safety
 */
export interface Profile {
  id: string
  role: 'patient' | 'doctor' | 'admin'
  full_name: string
  email?: string
  phone: string | null
  photo_url: string | null
  created_at: string
}

/**
 * Doctor - Doctor profile with related information
 */
export interface Doctor {
  id: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended'
  specialty?: string
  bio: string | null
  languages: string[]
  license_number: string | null
  years_experience: number | null
  city: string | null
  state: string | null
  country: string
  price_cents: number
  currency: string
  rating?: number
  total_reviews?: number
  profile: Profile
}

/**
 * Specialty - Medical specialty
 */
export interface Specialty {
  id: string
  name: string
  slug: string
}

/**
 * Appointment - Patient appointment with a doctor
 */
export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  service_id: string | null
  start_ts: string
  end_ts: string
  status:
    | 'pending_payment'
    | 'confirmed'
    | 'cancelled'
    | 'completed'
    | 'no_show'
    | 'refunded'
  appointment_type?: AppointmentType
  video_status?: 'pending' | 'ready' | 'in_progress' | 'completed' | 'missed'
  video_room_url?: string | null
  video_room_id?: string | null
  video_started_at?: string | null
  video_ended_at?: string | null
  consultation_notes?: string | null
  cancellation_reason: string | null
  cancelled_by: string | null
  created_at: string
  doctor?: Doctor
}

/**
 * Payment - Payment for an appointment
 */
export interface Payment {
  id: string
  appointment_id: string
  provider: 'stripe' | 'openpay' | 'mercadopago'
  provider_ref: string
  amount_cents: number
  currency: string
  status: 'requires_action' | 'pending' | 'paid' | 'failed' | 'refunded'
  fee_cents: number
  net_cents: number
}

/**
 * ChatConversation - Chat conversation between patient and doctor
 */
export interface ChatConversation {
  id: string
  patient_id: string
  doctor_id: string
  appointment_id: string | null
  last_message_preview: string | null
  last_message_at: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
}

/**
 * ChatMessage - Message in a chat conversation
 */
export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: 'patient' | 'doctor'
  content: string
  message_type: 'text' | 'image' | 'file'
  attachment_url: string | null
  attachment_name: string | null
  attachment_type: string | null
  read_at: string | null
  created_at: string
}

/**
 * ChatUserPresence - User presence status in chat
 */
export interface ChatUserPresence {
  id: string
  user_id: string
  conversation_id: string | null
  status: 'online' | 'away' | 'offline'
  last_seen_at: string
  created_at: string
  updated_at: string
}
