/**
 * Database Type Definitions
 *
 * These types represent the database schema with proper relations and type safety.
 * They align with the Supabase migrations and provide type-safe database operations.
 */

import type {
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

/**
 * Base database row type with common fields
 */
export type DatabaseRow = {
  id: string
  created_at: string
  updated_at?: string
}

// ================================================
// ENUM TYPES
// ================================================

export type UserRole = 'patient' | 'doctor' | 'admin'
export type DoctorStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended'
export type AppointmentStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'refunded'
export type PaymentStatus = 'requires_action' | 'pending' | 'paid' | 'failed' | 'refunded'
export type ChatMessageType = 'text' | 'image' | 'file'
export type ChatSenderType = 'patient' | 'doctor'
export type VideoStatus = 'pending' | 'ready' | 'in_progress' | 'completed' | 'missed'

// ================================================
// CORE TABLES
// ================================================

/**
 * Profiles table - extends auth.users
 */
export interface ProfileRow extends DatabaseRow {
  id: string // UUID
  role: UserRole
  full_name: string
  phone: string | null
  photo_url: string | null
}

/**
 * Specialties table
 */
export interface SpecialtyRow extends DatabaseRow {
  id: string // UUID
  name: string
  slug: string
  description: string | null
  icon: string | null
}

/**
 * Doctors table
 */
export interface DoctorRow extends DatabaseRow {
  id: string // UUID - references profiles(id)
  status: DoctorStatus
  bio: string | null
  languages: string[]
  license_number: string | null
  years_experience: number | null
  city: string | null
  state: string | null
  country: string
  price_cents: number
  currency: string
  video_enabled: boolean
  accepts_insurance: boolean
  rating_avg: number
  rating_count: number
}

/**
 * Doctor Specialties junction table (many-to-many)
 */
export interface DoctorSpecialtyRow {
  doctor_id: string // UUID
  specialty_id: string // UUID
}

/**
 * Doctor Subscriptions table
 */
export interface DoctorSubscriptionRow extends DatabaseRow {
  id: string // UUID
  doctor_id: string // UUID
  plan_name: string
  plan_price_cents: number
  status: string
  current_period_start: string
  current_period_end: string
}

// ================================================
// APPOINTMENTS & PAYMENTS
// ================================================

/**
 * Appointments table
 */
export interface AppointmentRow extends DatabaseRow {
  id: string // UUID
  doctor_id: string // UUID
  patient_id: string // UUID
  start_ts: string
  end_ts: string
  status: AppointmentStatus
  reason_for_visit: string | null
  notes: string | null
  video_room_url?: string | null
  appointment_type?: 'in_person' | 'video'
  video_status?: VideoStatus
  video_room_id?: string | null
  video_started_at?: string | null
  video_ended_at?: string | null
  consultation_notes?: string | null
  cancellation_reason?: string | null
  cancelled_by?: string | null
}

/**
 * Payments table
 */
export interface PaymentRow extends DatabaseRow {
  id: string // UUID
  appointment_id: string // UUID
  amount_cents: number
  currency: string
  status: PaymentStatus
  payment_method: string | null
  stripe_payment_intent_id: string | null
  provider: 'stripe' | 'openpay' | 'mercadopago'
  provider_ref: string
  fee_cents: number
  net_cents: number
}

// ================================================
// MEDICAL RECORDS
// ================================================

/**
 * Prescriptions table
 */
export interface PrescriptionRow extends DatabaseRow {
  id: string // UUID
  appointment_id: string // UUID
  doctor_id: string // UUID
  patient_id: string // UUID
  medications: unknown // JSONB
  notes: string | null
  pdf_url: string | null
}

/**
 * Follow-up Schedules table
 */
export interface FollowUpRow extends DatabaseRow {
  id: string // UUID
  appointment_id: string // UUID
  scheduled_for: string
  status: string
  notes: string | null
}

// ================================================
// CHAT SYSTEM
// ================================================

/**
 * Chat Conversations table
 */
export interface ChatConversationRow extends DatabaseRow {
  id: string // UUID
  patient_id: string // UUID
  doctor_id: string // UUID
  appointment_id: string | null
  last_message_preview: string | null
  last_message_at: string | null
  is_archived: boolean
}

/**
 * Chat Messages table
 */
export interface ChatMessageRow extends DatabaseRow {
  id: string // UUID
  conversation_id: string // UUID
  sender_id: string // UUID
  sender_type: ChatSenderType
  content: string
  message_type: ChatMessageType
  attachment_url: string | null
  attachment_name: string | null
  attachment_type: string | null
  read_at: string | null
}

/**
 * Chat User Presence table
 */
export interface ChatUserPresenceRow extends DatabaseRow {
  id: string // UUID
  user_id: string // UUID
  conversation_id: string | null
  status: 'online' | 'away' | 'offline'
  last_seen_at: string
}

// ================================================
// AVAILABILITY
// ================================================

/**
 * Availability Rules table
 */
export interface AvailabilityRuleRow extends DatabaseRow {
  id: string // UUID
  doctor_id: string // UUID
  day_of_week: number
  start_time: string
  end_time: string
  slot_minutes: number
  buffer_minutes: number
}

/**
 * Availability Exceptions table
 */
export interface AvailabilityExceptionRow extends DatabaseRow {
  id: string // UUID
  doctor_id: string // UUID
  start_ts: string
  end_ts: string
  is_available: boolean
  reason: string | null
}

// ================================================
// RELATION TYPES (JOINS)
// ================================================

/**
 * Profile with relations
 */
export interface ProfileWithRelations extends ProfileRow {
  doctor?: DoctorRow & {
    specialties?: Array<SpecialtyRow>
    subscription?: DoctorSubscriptionRow
  }
}

/**
 * Doctor with profile and relations
 */
export interface DoctorWithRelations {
  id: string
  profile: ProfileRow
  status: DoctorStatus
  bio: string | null
  languages: string[]
  license_number: string | null
  years_experience: number | null
  city: string | null
  state: string | null
  country: string
  price_cents: number
  currency: string
  rating_avg: number
  rating_count: number
  specialties?: Array<SpecialtyRow>
  subscription?: DoctorSubscriptionRow
}

/**
 * Appointment with relations
 */
export interface AppointmentWithRelations extends AppointmentRow {
  doctor: DoctorWithRelations
  patient: ProfileRow
  payment?: PaymentRow
  prescription?: PrescriptionRow
}

/**
 * Payment with appointment relation
 */
export interface PaymentWithRelations extends PaymentRow {
  appointment: AppointmentRow
}

/**
 * Conversation with relations
 */
export interface ConversationWithRelations extends ChatConversationRow {
  patient: ProfileRow
  doctor: DoctorWithRelations
  appointment?: AppointmentRow
  messages?: Array<ChatMessageRow>
}

// ================================================
// INSERT TYPES (for creating new records)
// ================================================

/**
 * Insert type for Profile (excludes id and timestamps)
 */
export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'>

/**
 * Insert type for Doctor
 */
export type DoctorInsert = Omit<
  DoctorRow,
  'created_at' | 'updated_at' | 'rating_avg' | 'rating_count'
>

/**
 * Insert type for Appointment
 */
export type AppointmentInsert = Omit<
  AppointmentRow,
  'id' | 'created_at' | 'updated_at'
>

/**
 * Insert type for Payment
 */
export type PaymentInsert = Omit<
  PaymentRow,
  'id' | 'created_at' | 'updated_at'
>

/**
 * Insert type for Prescription
 */
export type PrescriptionInsert = Omit<
  PrescriptionRow,
  'id' | 'created_at' | 'updated_at'
>

/**
 * Insert type for ChatConversation
 */
export type ChatConversationInsert = Omit<
  ChatConversationRow,
  'id' | 'created_at' | 'updated_at'
>

/**
 * Insert type for ChatMessage
 */
export type ChatMessageInsert = Omit<
  ChatMessageRow,
  'id' | 'created_at' | 'updated_at'
>

// ================================================
// UPDATE TYPES (for updating existing records)
// ================================================

/**
 * Update type for Profile (all fields optional)
 */
export type ProfileUpdate = Partial<Omit<ProfileRow, 'id' | 'created_at'>>

/**
 * Update type for Doctor
 */
export type DoctorUpdate = Partial<
  Omit<DoctorRow, 'id' | 'created_at' | 'rating_avg' | 'rating_count'>
>

/**
 * Update type for Appointment
 */
export type AppointmentUpdate = Partial<Omit<AppointmentRow, 'id' | 'created_at'>>

/**
 * Update type for Payment
 */
export type PaymentUpdate = Partial<Omit<PaymentRow, 'id' | 'created_at'>>

// ================================================
// DATABASE RESPONSE TYPES
// ================================================

/**
 * Supabase query response with data
 */
export type DbResponse<T> = {
  data: T | null
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
  } | null
}

/**
 * Supabase query response with array of data
 */
export type DbListResponse<T> = {
  data: T[] | null
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
  } | null
}

// ================================================
// TABLE NAME CONSTANTS
// ================================================

export const TABLES = {
  PROFILES: 'profiles',
  DOCTORS: 'doctors',
  SPECIALTIES: 'specialties',
  DOCTOR_SPECIALTIES: 'doctor_specialties',
  DOCTOR_SUBSCRIPTIONS: 'doctor_subscriptions',
  APPOINTMENTS: 'appointments',
  PAYMENTS: 'payments',
  PRESCRIPTIONS: 'prescriptions',
  FOLLOW_UPS: 'follow_up_schedules',
  CHAT_CONVERSATIONS: 'chat_conversations',
  CHAT_MESSAGES: 'chat_messages',
  CHAT_USER_PRESENCE: 'chat_user_presence',
  AVAILABILITY_RULES: 'availability_rules',
  AVAILABILITY_EXCEPTIONS: 'availability_exceptions',
  // ARCO System Tables
  ARCO_REQUESTS: 'arco_requests',
  ARCO_REQUEST_HISTORY: 'arco_request_history',
  ARCO_ATTACHMENTS: 'arco_attachments',
  ARCO_COMMUNICATIONS: 'arco_communications',
  DATA_AMENDMENTS: 'data_amendments',
  DATA_DELETIONS: 'data_deletions',
  PRIVACY_PREFERENCES: 'privacy_preferences',
} as const

export type TableName = typeof TABLES[keyof typeof TABLES]

// ================================================
// ARCO SYSTEM TYPES (LFPDPPP Compliance)
// ================================================

/**
 * ARCO Request Types - Derechos ARCO
 */
export type ArcoRequestType = 'ACCESS' | 'RECTIFY' | 'CANCEL' | 'OPPOSE'

/**
 * ARCO Request Status
 */
export type ArcoRequestStatus =
  | 'pending'
  | 'acknowledged'
  | 'processing'
  | 'info_required'
  | 'escalated'
  | 'completed'
  | 'denied'
  | 'cancelled'

/**
 * Escalation Levels for ARCO requests
 */
export type EscalationLevel = 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4'

/**
 * ARCO Priority Levels
 */
export type ArcoPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * Communication Channels
 */
export type CommunicationChannel = 'email' | 'phone' | 'portal' | 'mail' | 'sms'

/**
 * Communication Direction
 */
export type CommunicationDirection = 'incoming' | 'outgoing'

/**
 * Deletion Types
 */
export type DeletionType = 'hard_delete' | 'anonymize' | 'soft_delete'

/**
 * ARCO Requests table
 */
export interface ArcoRequestRow extends DatabaseRow {
  id: string
  user_id: string
  request_type: ArcoRequestType
  status: ArcoRequestStatus
  title: string
  description: string
  data_scope: string[]
  specific_records: string[] | null
  justification: string | null
  submitted_via: string
  ip_address: string | null
  user_agent: string | null
  assigned_to: string | null
  escalation_level: EscalationLevel
  priority: ArcoPriority
  acknowledged_at: string | null
  due_date: string
  completed_at: string | null
  response: string | null
  denial_reason: string | null
  denial_legal_basis: string | null
  last_reminder_at: string | null
  metadata: Record<string, unknown>
}

/**
 * Privacy Preferences table
 */
export interface PrivacyPreferencesRow extends DatabaseRow {
  id: string
  user_id: string
  marketing_emails: boolean
  marketing_sms: boolean
  marketing_push: boolean
  analytics_consent: boolean
  personalization_consent: boolean
  research_consent: boolean
  share_with_insurance: boolean
  share_with_pharmacies: boolean
  share_with_labs: boolean
  ai_training_consent: boolean
  voice_recording_consent: boolean
  consent_version: string
  last_consent_update: string
}
