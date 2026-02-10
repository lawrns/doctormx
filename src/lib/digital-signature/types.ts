/**
 * Digital Signature System - Type Definitions
 *
 * Implements NOM-004-SSA3-2012 compliant digital signatures for medical records.
 * Supports SAT e.firma integration and general X.509 certificates.
 *
 * @module digital-signature/types
 * @version 1.0.0
 */

// ============================================================================
// CERTIFICATE TYPES
// ============================================================================

/**
 * Supported certificate types for digital signatures
 */
export enum CertificateType {
  /** SAT e.firma (Firma Electrónica Avanzada) - Highest legal validity */
  E_FIRMA = 'e.firma',

  /** Commercial certificate authority */
  COMMERCIAL = 'commercial',

  /** Internal/testing certificate */
  INTERNAL = 'internal',
}

/**
 * Certificate status according to validation and revocation checks
 */
export enum CertificateStatus {
  /** Certificate is valid and active */
  ACTIVE = 'active',

  /** Certificate has been revoked */
  REVOKED = 'revoked',

  /** Certificate has passed expiration date */
  EXPIRED = 'expired',

  /** Certificate validation is pending */
  PENDING = 'pending',
}

/**
 * Digital certificate data structure
 */
export interface DigitalCertificate {
  /** Unique identifier */
  id: string

  /** User who owns this certificate */
  userId: string

  /** Type of certificate */
  certificateType: CertificateType

  /** Certificate number (e.g., RFC for e.firma) */
  certificateNumber: string

  /** Distinguished Name of issuer */
  issuerDN: string

  /** Distinguished Name of subject */
  subjectDN: string

  /** Certificate serial number */
  serialNumber: string

  /** Validity period start */
  validFrom: Date

  /** Validity period end */
  validUntil: Date

  /** Public key (PEM format) */
  publicKey: string

  /** Full certificate in PEM format (optional, stored with consent) */
  certificatePem?: string

  /** Current status */
  status: CertificateStatus

  /** Reason for revocation (if applicable) */
  revocationReason?: string

  /** When certificate was revoked */
  revokedAt?: Date

  /** Creation timestamp */
  createdAt: Date

  /** Last update timestamp */
  updatedAt: Date
}

/**
 * Certificate validation result
 */
export interface CertificateValidationResult {
  /** Whether certificate is valid */
  isValid: boolean

  /** Validation errors (if any) */
  errors: string[]

  /** Validation warnings */
  warnings: string[]

  /** Certificate chain (if validated) */
  chain?: CertificateChainItem[]

  /** Revocation status */
  revocationStatus: RevocationStatus

  /** Timestamp of validation */
  validatedAt: Date
}

/**
 * Certificate chain information
 */
export interface CertificateChainItem {
  /** Subject DN */
  subject: string

  /** Issuer DN */
  issuer: string

  /** Serial number */
  serialNumber: string

  /** Validity period */
  validFrom: Date
  validUntil: Date

  /** Whether this is the root CA */
  isRoot: boolean
}

/**
 * Certificate revocation status
 */
export enum RevocationStatus {
  /** Certificate is not revoked */
  GOOD = 'good',

  /** Certificate is revoked */
  REVOKED = 'revoked',

  /** Unable to determine revocation status */
  UNKNOWN = 'unknown',
}

/**
 * Revocation information
 */
export interface RevocationInfo {
  /** Revocation status */
  status: RevocationStatus

  /** Revocation time (if revoked) */
  revokedAt?: Date

  /** Revocation reason (if revoked) */
  reason?: string

  /** CRL number (if from CRL) */
  crlNumber?: string

  /** OCSP response (if from OCSP) */
  ocspResponse?: string
}

// ============================================================================
// SIGNATURE TYPES
// ============================================================================

/**
 * Supported signature formats
 */
export enum SignatureFormat {
  /** CMS Advanced Electronic Signature - Basic */
  CADES_B = 'CAdES-B',

  /** CMS Advanced Electronic Signature - Timestamped */
  CADES_T = 'CAdES-T',

  /** XML Advanced Electronic Signature */
  XADES = 'XAdES',

  /** PDF Advanced Electronic Signature */
  PADES = 'PAdES',
}

/**
 * Document types that can be signed
 */
export enum DocumentType {
  /** SOAP consultation note */
  SOAP_CONSULTATION = 'soap_consultation',

  /** Medical prescription */
  PRESCRIPTION = 'prescription',

  /** Medical certificate (sick leave, etc.) */
  MEDICAL_CERTIFICATE = 'medical_certificate',

  /** Medical order */
  MEDICAL_ORDER = 'medical_order',

  /** Clinical note */
  CLINICAL_NOTE = 'clinical_note',
}

/**
 * Signature verification status
 */
export enum VerificationStatus {
  /** Verification pending */
  PENDING = 'pending',

  /** Signature is valid */
  VALID = 'valid',

  /** Signature is invalid */
  INVALID = 'invalid',

  /** Document has been tampered with */
  TAMPERED = 'tampered',

  /** Certificate has been revoked */
  REVOKED = 'revoked',

  /** Certificate has expired */
  EXPIRED = 'expired',
}

/**
 * Digital signature data structure
 */
export interface DigitalSignature {
  /** Unique identifier */
  id: string

  /** Type of document signed */
  documentType: DocumentType

  /** ID of the signed document */
  documentId: string

  /** Document version */
  documentVersion: number

  /** Certificate used for signing */
  certificateId: string

  /** User who signed */
  signerUserId: string

  /** Full name of signer */
  signerName: string

  /** Role of signer */
  signerRole: 'doctor' | 'admin'

  /** Signature value (Base64 encoded) */
  signatureValue: string

  /** Signature algorithm used (e.g., RSA-SHA256) */
  signatureAlgorithm: string

  /** Signature format */
  signatureFormat: SignatureFormat

  /** When signature was created */
  signedAt: Date

  /** RFC 3161 timestamp token */
  timestampToken?: string

  /** Current verification status */
  verificationStatus: VerificationStatus

  /** Verification details */
  verificationDetails?: SignatureVerificationDetails

  /** Hash of signed data */
  signingDigest?: string

  /** IP address of signer */
  ipAddress?: string

  /** User agent of signer */
  userAgent?: string

  /** Creation timestamp */
  createdAt: Date
}

/**
 * Signature verification details
 */
export interface SignatureVerificationDetails {
  /** Whether signature is cryptographically valid */
  signatureValid: boolean

  /** Whether certificate was valid at signing time */
  certificateValid: boolean

  /** Whether document hash matches */
  hashMatches: boolean

  /** Whether timestamp is valid */
  timestampValid?: boolean

  /** Certificate chain validation */
  chainValid: boolean

  /** Verification timestamp */
  verifiedAt: Date

  /** Any verification errors */
  errors?: string[]

  /** Any verification warnings */
  warnings?: string[]
}

/**
 * Signature request payload
 */
export interface SignatureRequest {
  /** Document to sign */
  documentType: DocumentType

  /** Document ID */
  documentId: string

  /** Document content to sign */
  documentContent: string | Record<string, any>

  /** Certificate ID to use */
  certificateId: string

  /** User requesting signature */
  userId: string

  /** Signature format */
  signatureFormat?: SignatureFormat

  /** Whether to include timestamp */
  includeTimestamp?: boolean

  /** Client context */
  context?: {
    ipAddress?: string
    userAgent?: string
  }
}

/**
 * Signature response
 */
export interface SignatureResponse {
  /** Created signature */
  signature: DigitalSignature

  /** Whether signature was successful */
  success: boolean

  /** Error message (if failed) */
  error?: string

  /** Verification URL */
  verificationUrl?: string
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

/**
 * Audit event types for signature operations
 */
export enum AuditEventType {
  /** Document created */
  CREATE = 'create',

  /** Document signed */
  SIGN = 'sign',

  /** Signature verified */
  VERIFY = 'verify',

  /** Document amended */
  AMEND = 'amend',

  /** Document accessed */
  ACCESS = 'access',

  /** Certificate uploaded */
  CERTIFICATE_UPLOAD = 'certificate_upload',

  /** Certificate validated */
  CERTIFICATE_VALIDATE = 'certificate_validate',

  /** Certificate expired */
  CERTIFICATE_EXPIRE = 'certificate_expire',

  /** Certificate revoked */
  CERTIFICATE_REVOKE = 'certificate_revoke',

  /** Compliance check */
  COMPLIANCE_CHECK = 'compliance_check',

  /** Compliance failed */
  COMPLIANCE_FAIL = 'compliance_fail',

  /** Compliance passed */
  COMPLIANCE_PASS = 'compliance_pass',
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  /** Unique identifier */
  id: string

  /** Event type */
  eventType: AuditEventType

  /** Event timestamp */
  eventTimestamp: Date

  /** Document reference (if applicable) */
  documentType?: DocumentType
  documentId?: string
  documentVersion?: number

  /** Signature reference (if applicable) */
  signatureId?: string

  /** Certificate reference (if applicable) */
  certificateId?: string

  /** User context */
  userId?: string
  userRole?: string
  userName?: string

  /** Event data */
  eventData?: Record<string, any>

  /** IP address */
  ipAddress?: string

  /** User agent */
  userAgent?: string

  /** Whether event was NOM-004 compliant */
  nom004Compliant?: boolean

  /** Compliance notes */
  complianceNotes?: string

  /** Whether operation was successful */
  success: boolean

  /** Error message (if failed) */
  errorMessage?: string
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

/**
 * NOM-004 compliance status
 */
export enum NOM004ComplianceStatus {
  /** Fully compliant */
  COMPLIANT = 'compliant',

  /** Mostly compliant with minor issues */
  MOSTLY_COMPLIANT = 'mostly_compliant',

  /** Partially compliant with significant issues */
  PARTIALLY_COMPLIANT = 'partially_compliant',

  /** Not compliant */
  NON_COMPLIANT = 'non_compliant',
}

/**
 * NOM-004 compliance check result
 */
export interface NOM004ComplianceResult {
  /** Overall compliance status */
  status: NOM004ComplianceStatus

  /** Compliance score (0-100) */
  score: number

  /** Individual check results */
  checks: ComplianceCheck[]

  /** Recommendations for improvement */
  recommendations: string[]

  /** Check timestamp */
  checkedAt: Date
}

/**
 * Individual compliance check
 */
export interface ComplianceCheck {
  /** Check name */
  name: string

  /** Check weight (0-1) */
  weight: number

  /** Whether check passed */
  passed: boolean

  /** Check description */
  description?: string

  /** Evidence */
  evidence?: string[]
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

/**
 * Certificate provider interface
 */
export interface CertificateProvider {
  /** Provider name */
  name: string

  /** Validate a certificate */
  validateCertificate(certificate: string): Promise<CertificateValidationResult>

  /** Check certificate revocation status */
  checkRevocation(certificate: string): Promise<RevocationInfo>

  /** Get certificate chain */
  getCertificateChain(certificate: string): Promise<CertificateChainItem[]>
}

/**
 * Timestamp authority interface
 */
export interface TimestampAuthority {
  /** Request timestamp for a hash */
  requestTimestamp(hash: Buffer): Promise<string>

  /** Verify timestamp token */
  verifyTimestamp(token: string): Promise<boolean>
}

/**
 * Signature policy configuration
 */
export interface SignaturePolicy {
  /** Policy name */
  name: string

  /** Applicable document types */
  documentTypes: DocumentType[]

  /** Required signature level */
  requiredSignatureLevel: 'advanced' | 'qualified'

  /** Allowed certificate types */
  allowedCertificateTypes: CertificateType[]

  /** Minimum key length */
  minKeyLength: number

  /** Allowed algorithms */
  allowedAlgorithms: string[]

  /** Whether timestamp is required */
  requireTimestamp: boolean

  /** Whether OCSP check is required */
  requireOCSPCheck: boolean

  /** Whether CRL check is required */
  requireCRLCheck: boolean

  /** NOM-004 compliance flag */
  nom004Compliant: boolean

  /** LFEA compliance flag */
  lfeaCompliant: boolean

  /** Whether policy is active */
  isActive: boolean

  /** Policy effective date */
  effectiveDate: Date

  /** Policy expiry date */
  expiryDate?: Date
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Base error class for digital signature operations
 */
export class DigitalSignatureError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'DigitalSignatureError'
  }
}

/**
 * Certificate validation error
 */
export class CertificateValidationError extends DigitalSignatureError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CERTIFICATE_VALIDATION_ERROR', details)
    this.name = 'CertificateValidationError'
  }
}

/**
 * Signature generation error
 */
export class SignatureGenerationError extends DigitalSignatureError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'SIGNATURE_GENERATION_ERROR', details)
    this.name = 'SignatureGenerationError'
  }
}

/**
 * Signature verification error
 */
export class SignatureVerificationError extends DigitalSignatureError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'SIGNATURE_VERIFICATION_ERROR', details)
    this.name = 'SignatureVerificationError'
  }
}

/**
 * Certificate expired error
 */
export class CertificateExpiredError extends CertificateValidationError {
  constructor(details?: Record<string, any>) {
    super('Certificate has expired', details)
    this.name = 'CertificateExpiredError'
  }
}

/**
 * Certificate revoked error
 */
export class CertificateRevokedError extends CertificateValidationError {
  constructor(details?: Record<string, any>) {
    super('Certificate has been revoked', details)
    this.name = 'CertificateRevokedError'
  }
}
