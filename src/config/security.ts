/**
 * Security Configuration
 * Centralized security settings and constants
 */

// API Rate Limiting
export const RATE_LIMITS = {
  AI_QUERIES: {
    perMinute: 10,
    perHour: 100,
    perDay: 500
  },
  IMAGE_ANALYSIS: {
    perMinute: 5,
    perHour: 30,
    perDay: 100
  },
  AUTHENTICATION: {
    loginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minutes
  }
};

// Security Headers
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Data Retention Policies
export const DATA_RETENTION = {
  MEDICAL_RECORDS: 7 * 365, // 7 years (Mexican law requirement)
  AI_CONVERSATIONS: 90,      // 90 days
  TEMPORARY_DATA: 24 * 7,    // 7 days
  AUDIT_LOGS: 365           // 1 year
};

// Encryption Standards
export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'AES-256-GCM',
  KEY_LENGTH: 256,
  SALT_ROUNDS: 10,
  PBKDF2_ITERATIONS: 100000
};

// Session Configuration
export const SESSION_CONFIG = {
  DURATION: 30 * 60 * 1000,        // 30 minutes
  REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh when 5 minutes remaining
  ABSOLUTE_TIMEOUT: 8 * 60 * 60 * 1000 // 8 hours absolute max
};

// Medical Data Classification
export const DATA_CLASSIFICATION = {
  PUBLIC: 'public',           // General health information
  PRIVATE: 'private',         // Personal but non-medical
  SENSITIVE: 'sensitive',     // Medical conditions, prescriptions
  CRITICAL: 'critical'        // Mental health, HIV status, genetic data
};

// Audit Events
export const AUDIT_EVENTS = {
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  MEDICAL_RECORD_ACCESS: 'medical.record.access',
  MEDICAL_RECORD_UPDATE: 'medical.record.update',
  AI_CONSULTATION: 'ai.consultation',
  PRESCRIPTION_CREATED: 'prescription.created',
  EMERGENCY_ESCALATION: 'emergency.escalation',
  DATA_EXPORT: 'data.export',
  SECURITY_ALERT: 'security.alert'
};

// IP Whitelist/Blacklist
export const IP_RESTRICTIONS = {
  WHITELIST_ENABLED: false,
  WHITELIST: [],
  BLACKLIST_ENABLED: true,
  BLACKLIST: []
};

// Content Validation Rules
export const VALIDATION_RULES = {
  MAX_MESSAGE_LENGTH: 5000,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  PROHIBITED_CONTENT: [
    'script', 'javascript:', 'onerror', 'onload', 'onclick',
    '<iframe', '<object', '<embed', '<link', '<meta'
  ]
};