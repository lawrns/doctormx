/**
 * Base Application Error Class
 * All custom errors in Doctor.mx extend from this base class
 */
export class AppError extends Error {
  /**
   * Creates a new application error
   * @param code - Unique error code for tracking (e.g., 'MED_001')
   * @param statusCode - HTTP status code for API responses
   * @param message - Error message (internal/developer-facing)
   * @param isOperational - Whether this is an expected operational error (true) or unexpected programming error (false)
   */
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts error to JSON for API responses
   */
  toJSON() {
    return {
      code: this.code,
      statusCode: this.statusCode,
      message: this.message,
      name: this.name
    };
  }
}

/**
 * Healthcare-specific Error Classes
 */

/**
 * General medical-related errors
 * Use for: Medical record issues, clinical data problems, etc.
 */
export class MedicalError extends AppError {
  constructor(
    code: string,
    message: string,
    isOperational = true
  ) {
    super(code, 500, message, isOperational);
    this.name = 'MedicalError';
  }
}

/**
 * Emergency detection errors
 * Use when: AI detects emergency symptoms, critical conditions, etc.
 */
export class EmergencyDetectedError extends AppError {
  constructor(
    code: string,
    message: string,
    public severity: 'low' | 'medium' | 'high' | 'critical' = 'high',
    public detectedSymptoms?: string[]
  ) {
    super(code, 422, message, true);
    this.name = 'EmergencyDetectedError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      severity: this.severity,
      detectedSymptoms: this.detectedSymptoms
    };
  }
}

/**
 * Prescription-related errors
 * Use for: Drug interactions, dosage issues, prescription generation problems
 */
export class PrescriptionError extends AppError {
  constructor(
    code: string,
    message: string,
    public drugName?: string,
    public interactionType?: 'drug-drug' | 'drug-allergy' | 'drug-condition' | 'dosage' | 'contraindication'
  ) {
    super(code, 422, message, true);
    this.name = 'PrescriptionError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      drugName: this.drugName,
      interactionType: this.interactionType
    };
  }
}

/**
 * Diagnosis-related errors
 * Use for: AI confidence issues, insufficient data, diagnosis conflicts
 */
export class DiagnosisError extends AppError {
  constructor(
    code: string,
    message: string,
    public confidence?: number,
    public alternativeDiagnoses?: string[]
  ) {
    super(code, 422, message, true);
    this.name = 'DiagnosisError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      confidence: this.confidence,
      alternativeDiagnoses: this.alternativeDiagnoses
    };
  }
}

/**
 * Appointment-related errors
 * Use for: Booking conflicts, availability issues, scheduling problems
 */
export class AppointmentError extends AppError {
  constructor(
    code: string,
    message: string,
    public doctorId?: string,
    public requestedTime?: string,
    public reason?: 'conflict' | 'unavailable' | 'past' | 'invalid'
  ) {
    super(code, 409, message, true);
    this.name = 'AppointmentError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      doctorId: this.doctorId,
      requestedTime: this.requestedTime,
      reason: this.reason
    };
  }
}

/**
 * Authentication errors
 * Use for: Login failures, session issues, token problems
 */
export class AuthenticationError extends AppError {
  constructor(
    code: string,
    message: string,
    isOperational = true
  ) {
    super(code, 401, message, isOperational);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization errors
 * Use for: Permission issues, role-based access control failures
 */
export class AuthorizationError extends AppError {
  constructor(
    code: string,
    message: string,
    public requiredRole?: string
  ) {
    super(code, 403, message, true);
    this.name = 'AuthorizationError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      requiredRole: this.requiredRole
    };
  }
}

/**
 * Validation errors
 * Use for: Input validation failures, schema validation issues
 */
export class ValidationError extends AppError {
  constructor(
    code: string,
    message: string,
    public field?: string,
    public validationErrors?: Array<{ field: string; message: string }>
  ) {
    super(code, 400, message, true);
    this.name = 'ValidationError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      validationErrors: this.validationErrors
    };
  }
}

/**
 * Not found errors
 * Use for: Resource not found (404)
 */
export class NotFoundError extends AppError {
  constructor(
    code: string,
    message: string,
    public resourceType?: string,
    public resourceId?: string
  ) {
    super(code, 404, message, true);
    this.name = 'NotFoundError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resourceType: this.resourceType,
      resourceId: this.resourceId
    };
  }
}

/**
 * Rate limiting errors
 * Use for: API rate limit exceeded
 */
export class RateLimitError extends AppError {
  constructor(
    code: string,
    message: string,
    public retryAfter?: number,
    public limit?: number
  ) {
    super(code, 429, message, true);
    this.name = 'RateLimitError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
      limit: this.limit
    };
  }
}

/**
 * External service errors
 * Use for: Third-party API failures (Stripe, OpenAI, etc.)
 */
export class ExternalServiceError extends AppError {
  constructor(
    code: string,
    message: string,
    public service?: string,
    public originalError?: Error
  ) {
    super(code, 502, message, true);
    this.name = 'ExternalServiceError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      service: this.service
    };
  }
}

/**
 * Consent errors
 * Use for: Privacy consent issues, GDPR/HIPAA compliance
 */
export class ConsentError extends AppError {
  constructor(
    code: string,
    message: string,
    public consentType?: string,
    public requiredVersion?: string
  ) {
    super(code, 403, message, true);
    this.name = 'ConsentError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      consentType: this.consentType,
      requiredVersion: this.requiredVersion
    };
  }
}

/**
 * Payment errors
 * Use for: Stripe/payment processing issues
 */
export class PaymentError extends AppError {
  constructor(
    code: string,
    message: string,
    public paymentIntentId?: string,
    public stripeCode?: string
  ) {
    super(code, 402, message, true);
    this.name = 'PaymentError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      paymentIntentId: this.paymentIntentId,
      stripeCode: this.stripeCode
    };
  }
}

/**
 * Video consultation errors
 * Use for: Video call setup, connection, or recording issues
 */
export class VideoConsultationError extends AppError {
  constructor(
    code: string,
    message: string,
    public roomUrl?: string,
    public issueType?: 'setup' | 'connection' | 'recording' | 'permissions'
  ) {
    super(code, 500, message, true);
    this.name = 'VideoConsultationError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      roomUrl: this.roomUrl,
      issueType: this.issueType
    };
  }
}

