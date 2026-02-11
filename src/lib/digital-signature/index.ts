/**
 * Digital Signature System - Main Entry Point
 *
 * NOM-004-SSA3-2012 compliant digital signatures for medical records.
 * Supports SAT e.firma integration and general X.509 certificates.
 *
 * @module digital-signature
 * @version 1.0.0
 *
 * Features:
 * - Certificate validation and storage
 * - Digital signature creation and verification
 * - SAT e.firma integration
 * - NOM-004 compliance tracking
 * - Comprehensive audit logging
 * - Timestamp authority integration
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Certificate Types
  DigitalCertificate,
  CertificateValidationResult,
  CertificateChainItem,
  RevocationInfo,

  // Signature Types
  DigitalSignature,
  SignatureVerificationDetails,
  SignatureRequest,
  SignatureResponse,

  // Audit Types
  AuditLogEntry,

  // Compliance Types
  NOM004ComplianceResult,
  ComplianceCheck,

  // Integration Types
  CertificateProvider,
  TimestampAuthority,
  SignaturePolicy,
} from './types'

// ============================================================================
// ENUM EXPORTS
// ============================================================================

export {
  // Certificate Enums
  CertificateType,
  CertificateStatus,
  RevocationStatus,

  // Signature Enums
  SignatureFormat,
  DocumentType,
  VerificationStatus,

  // Audit Enums
  AuditEventType,

  // Compliance Enums
  NOM004ComplianceStatus,
} from './types'

// ============================================================================
// ERROR EXPORTS
// ============================================================================

export {
  DigitalSignatureError,
  CertificateValidationError,
  SignatureGenerationError,
  SignatureVerificationError,
  CertificateExpiredError,
  CertificateRevokedError,
} from './types'

// ============================================================================
// VALIDATION EXPORTS
// ============================================================================

export {
  validateCertificate,
  getCertificateValidity,
  extractRFC,
  validateCertificateRFC,
  getCertificateFingerprint,
  generateCertificateHash,
  certificateNeedsRenewal,
  getCertificateInfo,
} from './validation'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * NOM-004-SSA3-2012 requirements for digital signatures
 */
export const NOM004_REQUIREMENTS = {
  /** Minimum key length (bits) */
  MIN_KEY_LENGTH: 2048,

  /** Allowed signature algorithms */
  ALLOWED_ALGORITHMS: [
    'RSA-SHA256',
    'RSA-SHA384',
    'RSA-SHA512',
    'ECDSA-SHA256',
    'ECDSA-SHA384',
    'ECDSA-SHA512',
  ],

  /** Required signature formats */
  REQUIRED_FORMATS: ['CAdES-B', 'CAdES-T'],

  /** Certificate validity period (maximum) */
  MAX_VALIDITY_YEARS: 4,

  /** Timestamp requirements */
  TIMESTAMP_REQUIRED: true,

  /** OCSP/CRL checking requirement */
  REVOCATION_CHECK_REQUIRED: true,
} as const

/**
 * SAT e.firma specific requirements
 */
export const E_FIRMA_REQUIREMENTS = {
  /** SAT certificate issuer CN patterns */
  SAT_ISSUER_PATTERNS: [
    'SAT',
    'Servicio de Administración Tributaria',
  ],

  /** Required certificate extensions */
  REQUIRED_EXTENSIONS: [
    'Authority Information Access',
    'CRL Distribution Points',
    'Subject Key Identifier',
    'Authority Key Identifier',
  ],

  /** Certificate policy OID for e.firma */
  CERTIFICATE_POLICY_OID: '2.16.840.1.113733.1.7.23.6',

  /** SAT OCSP service URL */
  SAT_OCSP_URL: 'http://ocsp.sat.gob.mx',

  /** SAT CRL service URL */
  SAT_CRL_URL: 'http://www.sat.gob.mx/sitio_internet/certificados/',
} as const

/**
 * Signature policy defaults
 */
export const DEFAULT_SIGNATURE_POLICY = {
  name: 'NOM-004 Basic',
  documentTypes: ['soap_consultation', 'prescription', 'medical_certificate'] as string[],
  requiredSignatureLevel: 'advanced',
  allowedCertificateTypes: ['e.firma', 'commercial'] as string[],
  minKeyLength: 2048,
  allowedAlgorithms: ['RSA-SHA256', 'ECDSA-SHA256'],
  requireTimestamp: true,
  requireOCSPCheck: true,
  requireCRLCheck: false,
  nom004Compliant: true,
  lfeaCompliant: true,
  isActive: true,
} as const

/**
 * Document type mappings for signature requirements
 */
export const DOCUMENT_SIGNATURE_REQUIREMENTS: Record<
  string,
  { requiresTimestamp: boolean; minKeyLength: number; allowedTypes: string[] }
> = {
  soap_consultation: {
    requiresTimestamp: true,
    minKeyLength: 2048,
    allowedTypes: ['e.firma', 'commercial'] as string[],
  },
  prescription: {
    requiresTimestamp: true,
    minKeyLength: 2048,
    allowedTypes: ['e.firma', 'commercial'] as string[],
  },
  medical_certificate: {
    requiresTimestamp: true,
    minKeyLength: 2048,
    allowedTypes: ['e.firma'] as string[],
  },
  medical_order: {
    requiresTimestamp: true,
    minKeyLength: 2048,
    allowedTypes: ['e.firma', 'commercial'] as string[],
  },
  clinical_note: {
    requiresTimestamp: false,
    minKeyLength: 2048,
    allowedTypes: ['e.firma', 'commercial', 'internal'] as string[],
  },
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================>

/**
 * Check if a document type requires digital signature according to NOM-004
 */
export function requiresDigitalSignature(documentType: string): boolean {
  return Object.keys(DOCUMENT_SIGNATURE_REQUIREMENTS).includes(documentType)
}

/**
 * Get signature requirements for a document type
 */
export function getSignatureRequirements(documentType: string) {
  return DOCUMENT_SIGNATURE_REQUIREMENTS[documentType] || null
}

/**
 * Check if certificate type is allowed for document type
 */
export function isCertificateTypeAllowed(
  certificateType: string,
  documentType: string
): boolean {
  const requirements = DOCUMENT_SIGNATURE_REQUIREMENTS[documentType]
  if (!requirements) {
    return false
  }
  return requirements.allowedTypes.includes(certificateType)
}

/**
 * Validate signature format against NOM-004 requirements
 */
export function isValidSignatureFormat(format: string): boolean {
  return NOM004_REQUIREMENTS.REQUIRED_FORMATS.includes(format as any)
}

/**
 * Check if signature algorithm is allowed
 */
export function isAllowedAlgorithm(algorithm: string): boolean {
  return NOM004_REQUIREMENTS.ALLOWED_ALGORITHMS.includes(algorithm as any)
}

/**
 * Get certificate type display name (Spanish)
 */
export function getCertificateTypeName(type: string): string {
  const names: Record<string, string> = {
    e_firma: 'e.firma (Firma Electrónica Avanzada SAT)',
    commercial: 'Certificado Comercial',
    internal: 'Certificado Interno',
  }
  return names[type] || type
}

/**
 * Get verification status display name (Spanish)
 */
export function getVerificationStatusName(status: string): string {
  const names: Record<string, string> = {
    pending: 'Pendiente de verificación',
    valid: 'Válido',
    invalid: 'Inválido',
    tampered: 'Documento alterado',
    revoked: 'Certificado revocado',
    expired: 'Certificado expirado',
  }
  return names[status] || status
}

/**
 * Get document type display name (Spanish)
 */
export function getDocumentTypeName(type: string): string {
  const names: Record<string, string> = {
    soap_consultation: 'Nota de Consulta SOAP',
    prescription: 'Receta Médica',
    medical_certificate: 'Certificado Médico',
    medical_order: 'Orden Médica',
    clinical_note: 'Nota Clínica',
  }
  return names[type] || type
}

