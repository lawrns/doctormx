/**
 * Database Table Constants - Doctor.mx
 *
 * Centralized table names for Supabase database operations.
 * Using constants prevents typos and enables IDE autocomplete.
 *
 * @module constants/database
 * @see {@link ../types/database.ts} - Original source
 */

/**
 * Database table names
 * All table names used in the Doctor.mx Supabase database
 */
export const TABLES = {
  // User & Profile Tables
  /** User profiles and personal information */
  PROFILES: 'profiles',

  // Doctor Tables
  /** Doctor profiles and credentials */
  DOCTORS: 'doctors',
  /** Available medical specialties */
  SPECIALTIES: 'specialties',
  /** Junction table for doctor-specialty relationships */
  DOCTOR_SPECIALTIES: 'doctor_specialties',
  /** Doctor subscription plans and status */
  DOCTOR_SUBSCRIPTIONS: 'doctor_subscriptions',

  // Appointment Tables
  /** Medical appointments between patients and doctors */
  APPOINTMENTS: 'appointments',

  // Payment Tables
  /** Payment transactions and history */
  PAYMENTS: 'payments',

  // Medical Records Tables
  /** Medical prescriptions */
  PRESCRIPTIONS: 'prescriptions',
  /** Follow-up schedules after consultations */
  FOLLOW_UPS: 'follow_up_schedules',

  // Chat Tables
  /** Chat conversation containers */
  CHAT_CONVERSATIONS: 'chat_conversations',
  /** Individual chat messages */
  CHAT_MESSAGES: 'chat_messages',
  /** User presence status in chats */
  CHAT_USER_PRESENCE: 'chat_user_presence',

  // Availability Tables
  /** Recurring availability rules for doctors */
  AVAILABILITY_RULES: 'availability_rules',
  /** One-time availability exceptions */
  AVAILABILITY_EXCEPTIONS: 'availability_exceptions',

  // ARCO Rights System Tables (Data Protection)
  /** ARCO rights requests (Access, Rectification, Cancellation, Opposition) */
  ARCO_REQUESTS: 'arco_requests',
  /** History log for ARCO request status changes */
  ARCO_REQUEST_HISTORY: 'arco_request_history',
  /** Attachments to ARCO requests */
  ARCO_ATTACHMENTS: 'arco_attachments',
  /** Communications related to ARCO requests */
  ARCO_COMMUNICATIONS: 'arco_communications',
  /** Data amendment records */
  DATA_AMENDMENTS: 'data_amendments',
  /** Data deletion requests and execution log */
  DATA_DELETIONS: 'data_deletions',
  /** User privacy preferences */
  PRIVACY_PREFERENCES: 'privacy_preferences',
} as const

/**
 * Type for all table names
 * Enables type-safe table references
 */
export type TableName = typeof TABLES[keyof typeof TABLES]

/**
 * User-related tables
 * Tables that contain user data subject to data protection regulations
 */
export const USER_DATA_TABLES: readonly TableName[] = [
  TABLES.PROFILES,
  TABLES.DOCTORS,
  TABLES.APPOINTMENTS,
  TABLES.PRESCRIPTIONS,
  TABLES.CHAT_CONVERSATIONS,
  TABLES.CHAT_MESSAGES,
  TABLES.PAYMENTS,
  TABLES.FOLLOW_UPS,
] as const

/**
 * ARCO-related tables
 * Tables used for data protection (LFPDPPP) compliance
 */
export const ARCO_TABLES: readonly TableName[] = [
  TABLES.ARCO_REQUESTS,
  TABLES.ARCO_REQUEST_HISTORY,
  TABLES.ARCO_ATTACHMENTS,
  TABLES.ARCO_COMMUNICATIONS,
  TABLES.DATA_AMENDMENTS,
  TABLES.DATA_DELETIONS,
  TABLES.PRIVACY_PREFERENCES,
] as const

/**
 * Check if a table contains user data (subject to ARCO rights)
 * @param tableName - Name of the table to check
 * @returns True if the table contains user data
 */
export function isUserDataTable(tableName: TableName): boolean {
  return USER_DATA_TABLES.includes(tableName)
}

/**
 * Check if a table is part of the ARCO system
 * @param tableName - Name of the table to check
 * @returns True if the table is part of the ARCO system
 */
export function isArcoTable(tableName: TableName): boolean {
  return ARCO_TABLES.includes(tableName)
}
