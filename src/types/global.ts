/**
 * Doctor.mx Global Type Definitions
 *
 * Single Source of Truth (SSOT) for shared types across the application.
 * This file consolidates duplicate type definitions and provides strict
 * alternatives to `any` usage.
 *
 * @module types/global
 * @description Unified types for Pharmacy, Consent, Appointment, and common utilities
 */

// ================================================
// UTILITY TYPES - Replacements for `any`
// ================================================

/**
 * Strict JSON value types - no `any` allowed
 */
export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonArray
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]

/**
 * Type for unknown record with string keys
 * Use this instead of `Record<string, any>`
 */
export type UnknownRecord = Record<string, unknown>

/**
 * Type for optional record values
 */
export type OptionalRecord<T = unknown> = Record<string, T | undefined>

/**
 * Database table names for type-safe queries
 * Replaces `table as any` patterns
 */
export type DatabaseTable =
  | 'profiles'
  | 'doctors'
  | 'specialties'
  | 'doctor_specialties'
  | 'doctor_subscriptions'
  | 'appointments'
  | 'payments'
  | 'prescriptions'
  | 'follow_up_schedules'
  | 'chat_conversations'
  | 'chat_messages'
  | 'chat_user_presence'
  | 'availability_rules'
  | 'availability_exceptions'
  | 'arco_requests'
  | 'arco_request_history'
  | 'arco_attachments'
  | 'arco_communications'
  | 'data_amendments'
  | 'data_deletions'
  | 'privacy_preferences'
  | 'consent_records'
  | 'consent_versions'
  | 'consent_history'
  | 'consent_audit_logs'
  | 'pharmacy_sponsors'
  | 'pharmacy_referrals'
  | 'pharmacy_commissions'
  | 'notification_logs'

/**
 * Type-safe table reference for Supabase queries
 */
export type TableReference<T extends DatabaseTable = DatabaseTable> = T

// ================================================
// API RESPONSE TYPES
// ================================================

/**
 * Standard API response structure
 */
export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMetadata
}

/**
 * API error details
 */
export interface ApiError {
  code: string
  message: string
  details?: UnknownRecord
  fieldErrors?: Record<string, string[]>
}

/**
 * API response metadata for pagination
 */
export interface ApiMetadata {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiMetadata
}

/**
 * API request context for logging and tracing
 */
export interface ApiRequestContext {
  requestId: string
  correlationId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

// ================================================
// PHARMACY TYPES - Unified
// ================================================

/**
 * Mexican pharmacy chains supported by the platform
 */
export enum PharmacyChain {
  GUADALAJARA = 'guadalajara',
  AHORRO = 'ahorro',
  SIMILARES = 'similares',
  BENAVIDES = 'benavides',
  SAN_PABLO = 'san_pablo',
  YZA = 'yza',
}

/**
 * Pharmacy order status
 */
export enum PharmacyOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Delivery type options
 */
export enum PharmacyDeliveryType {
  HOME_DELIVERY = 'home_delivery',
  PICKUP = 'pickup',
  EXPRESS = 'express',
}

/**
 * Payment methods for pharmacy orders
 */
export enum PharmacyPaymentMethod {
  CARD = 'card',
  CASH = 'cash',
  TRANSFER = 'transfer',
  INSURANCE = 'insurance',
}

/**
 * Product categories in pharmacy
 */
export enum PharmacyProductCategory {
  PRESCRIPTION = 'prescription',
  OTC = 'otc',
  SUPPLEMENT = 'supplement',
  PERSONAL_CARE = 'personal_care',
  MEDICAL_DEVICE = 'medical_device',
}

/**
 * Geographic coordinates
 */
export interface GeoCoordinates {
  latitude: number
  longitude: number
}

/**
 * Address structure for pharmacy operations
 */
export interface PharmacyAddress {
  street: string
  number: string
  apartment?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  coordinates?: GeoCoordinates
}

/**
 * Unified Pharmacy Sponsor type
 * Consolidates from: src/lib/pharmacy.ts, src/services/pharmacy-integration.ts
 */
export interface PharmacySponsor {
  id: string
  name: string
  slug: string
  contact_email: string
  contact_phone: string | null
  address: string | null
  city: string | null
  state: string | null
  neighborhood: string | null
  zip_code: string | null
  latitude: number | null
  longitude: number | null
  logo_url: string | null
  cover_image_url: string | null
  description: string | null
  phone: string | null
  website_url: string | null
  whatsapp_number: string | null
  offers_delivery: boolean | null
  offers_pickup: boolean | null
  delivery_radius_km: number | null
  delivery_time_hours: number | null
  minimum_order_cents: number | null
  discount_percentage: number | null
  doctory_discount_code: string | null
  commission_rate: number
  fixed_fee_cents: number
  referral_fee_cents: number
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  priority: number | null
  applied_at: string
  approved_at: string | null
  approved_by: string | null
  created_at: string
  updated_at: string | null
}

/**
 * Unified Pharmacy Referral type
 * Consolidates from: src/lib/pharmacy.ts
 */
export interface PharmacyReferral {
  id: string
  pharmacy_id: string
  referral_code: string
  prescription_id: string | null
  appointment_id: string
  patient_id: string
  doctor_id: string
  medications: string[] | null
  estimated_total_cents: number | null
  status: 'pending' | 'sent' | 'redeemed' | 'expired' | 'cancelled'
  sent_at: string | null
  redeemed_at: string | null
  redemption_confirmed_by: string | null
  created_at: string
  expires_at: string
  pharmacy?: PharmacySponsor
}

/**
 * Pharmacy commission record
 */
export interface PharmacyCommission {
  id: string
  referral_id: string
  pharmacy_id: string
  medication_total_cents: number | null
  commission_rate: number
  commission_amount_cents: number
  fixed_fee_cents: number
  total_payout_cents: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  paid_at: string | null
  period_start: string | null
  period_end: string | null
}

/**
 * Pharmacy recommendation for patients
 */
export interface PharmacyRecommendation {
  pharmacy: PharmacySponsor
  distanceKm: number | null
  estimatedPrice: number
  savingsVsAverage: number
  hasMedications: boolean
  matchScore: number
}

/**
 * Pharmacy match result
 */
export interface PharmacyMatch {
  pharmacy: PharmacySponsor
  estimatedTotal: number
  distance: number | null
  savings: number | null
  hasDelivery: boolean
  deliveryTime: number | null
  discountCode: string | null
  availability: number
}

/**
 * Pharmacy location filter
 */
export interface PharmacyLocationFilter {
  city?: string
  neighborhood?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
}

/**
 * Patient location for pharmacy matching
 */
export interface PatientLocation {
  latitude: number
  longitude: number
  city?: string
  state?: string
}

/**
 * Pharmacy product from API integration
 */
export interface PharmacyProduct {
  id: string
  pharmacyId: PharmacyChain
  name: string
  genericName?: string
  brand: string
  description: string
  category: PharmacyProductCategory
  subcategory?: string
  presentation: string
  dosage?: string
  quantity: string
  laboratory?: string
  images: string[]
  requiresPrescription: boolean
  price: {
    current: number
    original?: number
    discount?: number
    currency: string
  }
  stock: {
    available: boolean
    quantity: number
    lastUpdated: Date
  }
  rating?: {
    average: number
    count: number
  }
  delivery: {
    available: boolean
    estimatedTime: number
    cost: number
  }
  affiliateLink?: string
}

/**
 * Pharmacy configuration for integrations
 */
export interface PharmacyIntegrationConfig {
  id: PharmacyChain
  name: string
  displayName: string
  logoUrl: string
  website: string
  apiBaseUrl: string
  apiVersion: string
  affiliateProgram: {
    enabled: boolean
    commissionRate: number
    trackingParam: string
    baseUrl: string
  }
  features: {
    homeDelivery: boolean
    expressDelivery: boolean
    prescriptionUpload: boolean
    onlinePayment: boolean
    cashOnDelivery: boolean
    insuranceSupport: boolean
  }
  deliveryConfig: {
    baseDeliveryTime: number
    expressDeliveryTime: number
    baseCost: number
    expressCost: number
    freeDeliveryThreshold: number
    coverageRadiusKm: number
  }
  operatingHours: {
    open: string
    close: string
    open24Hours: boolean
  }
}

/**
 * Pharmacy error with metadata
 */
export interface PharmacyErrorMetadata {
  code: string
  pharmacyId?: PharmacyChain
  retryable: boolean
  statusCode?: number
}

// ================================================
// CONSENT TYPES - Unified
// ================================================

/**
 * Types of consent in the system
 */
export type ConsentType =
  | 'medical_treatment'
  | 'data_processing'
  | 'telemedicine'
  | 'recording'
  | 'ai_analysis'
  | 'data_sharing'
  | 'research'
  | 'marketing'
  | 'emergency_contact'
  | 'prescription_forwarding'

/**
 * Consent status values
 */
export type ConsentStatus = 'granted' | 'withdrawn' | 'expired' | 'revoked'

/**
 * Consent delivery methods
 */
export type ConsentDeliveryMethod =
  | 'electronic_signature'
  | 'click_wrap'
  | 'browse_wrap'
  | 'paper_form'
  | 'verbal'
  | 'implied'

/**
 * Consent categories
 */
export type ConsentCategory = 'essential' | 'functional' | 'analytical' | 'marketing' | 'legal'

/**
 * Age verification status
 */
export type AgeVerificationStatus = 'verified_adult' | 'verified_minor' | 'unverified' | 'guardian_required'

/**
 * Guardian relationship types
 */
export type GuardianRelationship = 'parent' | 'legal_guardian' | 'foster_parent' | 'grandparent' | 'other'

/**
 * Unified Consent Version type
 * Consolidates from: src/lib/consent/types.ts
 */
export interface ConsentVersion {
  id: string
  version: string // Semantic version (e.g., "1.0.0")
  consent_type: ConsentType
  title: string
  description: string
  legal_text: string
  privacy_policy_reference: string
  terms_of_service_reference: string
  effective_date: string
  deprecated_date: string | null
  required_for_new_users: boolean
  requires_re_consent: boolean
  category: ConsentCategory
  data_retention_period: string | null
  third_party_sharing: string[] | null
  age_restriction: {
    min_age?: number
    requires_guardian?: boolean
    guardian_consent_required?: boolean
  }
  created_at: string
  created_by: string
  metadata: UnknownRecord
}

/**
 * Unified Consent Record type
 * Consolidates from: src/lib/consent/types.ts, src/app/app/consent pages
 */
export interface ConsentRecord {
  id: string
  user_id: string
  consent_type: ConsentType
  consent_version_id: string
  status: ConsentStatus
  granted_at: string
  granted_from: string // IP address, device ID, etc.
  delivery_method: ConsentDeliveryMethod
  age_verification: AgeVerificationStatus
  date_of_birth: string | null
  guardian_consent_record_id: string | null
  guardian_relationship: GuardianRelationship | null
  guardian_name: string | null
  guardian_contact: string | null
  withdrawn_at: string | null
  withdrawn_by: 'user' | 'guardian' | 'admin' | null
  withdrawal_reason: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  metadata: UnknownRecord
}

/**
 * Guardian consent record
 */
export interface GuardianConsentRecord {
  id: string
  user_id: string
  guardian_user_id: string | null
  guardian_name: string
  guardian_relationship: GuardianRelationship
  guardian_contact: string
  guardian_identification: string | null
  verification_method: 'in_person' | 'video_call' | 'document_upload'
  verified_by: string | null
  verified_at: string | null
  verification_documents: string[]
  consent_scope: ConsentType[]
  limitations: string[] | null
  status: 'active' | 'inactive' | 'revoked' | 'expired'
  effective_date: string
  expiration_date: string | null
  created_at: string
  updated_at: string
  created_by: string
  metadata: UnknownRecord
}

/**
 * Unified Consent History Entry
 * Consolidates from: src/lib/consent/types.ts, consent pages
 */
export interface ConsentHistoryEntry {
  id: string
  consent_record_id: string
  user_id: string
  action: 'granted' | 'withdrawn' | 'modified' | 'expired' | 'revoked'
  old_status: ConsentStatus | null
  new_status: ConsentStatus
  old_consent_version_id: string | null
  new_consent_version_id: string
  changed_by: string
  changed_by_role: 'user' | 'guardian' | 'admin' | 'system'
  change_reason: string | null
  ip_address: string | null
  user_agent: string | null
  session_id: string | null
  previous_state: UnknownRecord | null
  new_state: UnknownRecord
  created_at: string
}

/**
 * Consent request for users
 */
export interface ConsentRequest {
  id: string
  user_id: string
  consent_type: ConsentType
  required_version_id: string
  request_reason: 'new_consent' | 'version_update' | 're_consent_required' | 'age_verification'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  requested_for: ConsentType[]
  delivery_method: 'in_app' | 'email' | 'sms' | 'push_notification'
  sent_at: string | null
  reminder_count: number
  last_reminder_at: string | null
  status: 'pending' | 'delivered' | 'viewed' | 'granted' | 'declined' | 'expired'
  responded_at: string | null
  response: UnknownRecord | null
  expires_at: string
  created_at: string
  created_by: string
  metadata: UnknownRecord
}

/**
 * Consent template
 */
export interface ConsentTemplate {
  id: string
  consent_type: ConsentType
  template_key: string
  title_template: string
  description_template: string
  legal_text_template: string
  required_placeholders: string[]
  language: string
  region: string | null
  is_active: boolean
  effective_date: string
  deprecated_date: string | null
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
}

/**
 * Consent audit event types
 */
export type ConsentAuditEventType =
  | 'consent_granted'
  | 'consent_withdrawn'
  | 'consent_expired'
  | 'consent_revoked'
  | 'consent_modified'
  | 'consent_requested'
  | 'consent_viewed'
  | 'consent_declined'
  | 'version_updated'
  | 'guardian_consent_added'
  | 'guardian_consent_removed'
  | 'bulk_consent_operation'
  | 'consent_export'
  | 'consent_import'

/**
 * Consent audit log entry
 */
export interface ConsentAuditLog {
  id: string
  event_type: ConsentAuditEventType
  user_id: string
  consent_type: ConsentType
  consent_record_id: string | null
  consent_request_id: string | null
  action: string
  action_result: 'success' | 'failure' | 'partial'
  error_message: string | null
  actor_user_id: string | null
  actor_role: string
  actor_ip_address: string | null
  actor_user_agent: string | null
  session_id: string | null
  request_id: string | null
  correlation_id: string | null
  before_state: UnknownRecord | null
  after_state: UnknownRecord | null
  data_changes: Record<string, { old: unknown; new: unknown }> | null
  occurred_at: string
  created_at: string
}

/**
 * Consent error codes
 */
export enum ConsentErrorCode {
  CONSENT_NOT_FOUND = 'CONSENT_NOT_FOUND',
  CONSENT_ALREADY_GRANTED = 'CONSENT_ALREADY_GRANTED',
  CONSENT_EXPIRED = 'CONSENT_EXPIRED',
  CONSENT_WITHDRAWN = 'CONSENT_WITHDRAWN',
  VERSION_NOT_FOUND = 'VERSION_NOT_FOUND',
  INVALID_VERSION = 'INVALID_VERSION',
  REQUIRES_GUARDIAN_CONSENT = 'REQUIRES_GUARDIAN_CONSENT',
  AGE_VERIFICATION_REQUIRED = 'AGE_VERIFICATION_REQUIRED',
  GUARDIAN_NOT_FOUND = 'GUARDIAN_NOT_FOUND',
  GUARDIAN_CONSENT_EXPIRED = 'GUARDIAN_CONSENT_EXPIRED',
  CANNOT_WITHDRAW_ESSENTIAL = 'CANNOT_WITHDRAW_ESSENTIAL',
  CANNOT_MODIFY_WITHDRAWN = 'CANNOT_MODIFY_WITHDRAWN',
  INVALID_CONSENT_TYPE = 'INVALID_CONSENT_TYPE',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
}

/**
 * Change between consent versions
 */
export interface ConsentVersionChange {
  field: string
  old_value: string | null
  new_value: string | null
  change_type: 'addition' | 'modification' | 'removal'
  significance: 'major' | 'minor'
}

/**
 * Version comparison result
 */
export interface ConsentVersionComparison {
  current_version: string
  new_version: string
  has_major_changes: boolean
  has_minor_changes: boolean
  changes: ConsentVersionChange[]
  requires_re_consent: boolean
}

/**
 * User consent summary
 */
export interface UserConsentSummary {
  user_id: string
  total_consents: number
  active_consents: number
  withdrawn_consents: number
  expired_consents: number
  pending_consents: number
  consents_by_type: Record<ConsentType, number>
  consents_by_category: Record<ConsentCategory, number>
  requires_attention: boolean
  last_updated: string
}

/**
 * Consent filter options
 */
export interface ConsentFilter {
  user_id?: string
  consent_type?: ConsentType
  status?: ConsentStatus
  category?: ConsentCategory
  date_from?: string
  date_to?: string
  include_expired?: boolean
  include_withdrawn?: boolean
  version_id?: string
}

// ================================================
// APPOINTMENT TYPES - Unified
// ================================================

/**
 * Appointment status values
 */
export type AppointmentStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'refunded'

/**
 * Appointment type (delivery mode)
 */
export type AppointmentDeliveryType = 'in_person' | 'video'

/**
 * Video call status
 */
export type VideoCallStatus = 'pending' | 'ready' | 'in_progress' | 'completed' | 'missed'

/**
 * Unified Appointment type
 * Consolidates from: src/types/index.ts, src/types/database.ts, components
 */
export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  service_id: string | null
  start_ts: string
  end_ts: string
  status: AppointmentStatus
  appointment_type: AppointmentDeliveryType
  video_status: VideoCallStatus
  video_room_url: string | null
  video_room_id: string | null
  video_started_at: string | null
  video_ended_at: string | null
  consultation_notes: string | null
  cancellation_reason: string | null
  cancelled_by: string | null
  reason_for_visit: string | null
  notes: string | null
  created_at: string
  updated_at?: string
}

/**
 * Appointment with related doctor information
 */
export interface AppointmentWithDoctor extends Appointment {
  doctor: {
    id: string
    specialty: string | null
    price_cents: number
    currency: string
    rating: number | null
    profile: {
      id: string
      full_name: string
      photo_url: string | null
    }
  }
}

/**
 * Appointment with patient information
 */
export interface AppointmentWithPatient extends Appointment {
  patient: {
    id: string
    full_name: string
    email: string
    phone: string | null
    photo_url: string | null
  }
}

/**
 * Appointment with full relations
 */
export interface AppointmentWithRelations extends Appointment {
  doctor: AppointmentWithDoctor['doctor']
  patient: AppointmentWithPatient['patient']
  payment?: {
    id: string
    amount_cents: number
    currency: string
    status: string
  }
  prescription?: {
    id: string
    medications: JsonValue
    pdf_url: string | null
  }
}

/**
 * Appointment slot for booking
 */
export interface AppointmentSlot {
  id: string
  doctor_id: string
  start_time: string
  end_time: string
  is_available: boolean
  reason_unavailable?: string
}

/**
 * Appointment metrics for analytics
 */
export interface AppointmentMetrics {
  total: number
  completed: number
  cancelled: number
  no_show: number
  pending: number
  average_duration_minutes: number
  revenue_cents: number
}

// ================================================
// USER & PROFILE TYPES
// ================================================

/**
 * User roles in the system
 */
export type UserRole = 'patient' | 'doctor' | 'admin'

/**
 * Unified Profile type
 */
export interface UserProfile {
  id: string
  role: UserRole
  full_name: string
  email: string | null
  phone: string | null
  photo_url: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  created_at: string
  updated_at?: string
}

// ================================================
// PAYMENT TYPES
// ================================================

/**
 * Payment status values
 */
export type PaymentStatus = 'requires_action' | 'pending' | 'paid' | 'failed' | 'refunded'

/**
 * Payment providers
 */
export type PaymentProvider = 'stripe' | 'openpay' | 'mercadopago'

/**
 * Unified Payment type
 */
export interface Payment {
  id: string
  appointment_id: string
  amount_cents: number
  currency: string
  status: PaymentStatus
  provider: PaymentProvider
  provider_ref: string
  fee_cents: number
  net_cents: number
  payment_method: string | null
  created_at: string
  updated_at?: string
}

// ================================================
// PRESCRIPTION TYPES
// ================================================

/**
 * Medication in a prescription
 */
export interface PrescriptionMedication {
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: string
  instructions?: string
}

/**
 * Unified Prescription type
 */
export interface Prescription {
  id: string
  appointment_id: string
  doctor_id: string
  patient_id: string
  medications: PrescriptionMedication[]
  notes: string | null
  pdf_url: string | null
  created_at: string
  updated_at?: string
}

// ================================================
// NOTIFICATION TYPES
// ================================================

/**
 * Notification channels
 */
export type NotificationChannel = 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app'

/**
 * Notification status
 */
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read'

/**
 * Unified notification log
 */
export interface NotificationLog {
  id: string
  user_id: string
  channel: NotificationChannel
  template: string
  status: NotificationStatus
  message_body: string | null
  metadata: UnknownRecord
  sent_at: string | null
  delivered_at: string | null
  read_at: string | null
  created_at: string
}

// ================================================
// STRIPE WEBHOOK TYPES
// ================================================

/**
 * Stripe subscription metadata
 */
export interface StripeSubscriptionMetadata {
  doctor_id?: string
  [key: string]: string | undefined
}

/**
 * Stripe subscription with typed metadata
 */
export interface StripeSubscription {
  id: string
  metadata: StripeSubscriptionMetadata
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  status: string
}

/**
 * Stripe invoice
 */
export interface StripeInvoice {
  id: string
  subscription: string | null
  amount_due: number
  customer: string
  status: string
}
