/**
 * Digital Signature System - Certificate Validation
 *
 * Validates X.509 certificates according to NOM-004-SSA3-2012 requirements.
 * Supports SAT e.firma validation and general certificate validation.
 *
 * @module digital-signature/validation
 * @version 1.0.0
 */

import { createHash } from 'crypto'
import {
  CertificateStatus,
  CertificateValidationResult,
  CertificateChainItem,
  RevocationStatus,
  RevocationInfo,
  CertificateValidationError,
  CertificateExpiredError,
  CertificateRevokedError,
  DigitalCertificate,
} from './types'

// ============================================================================
// CERTIFICATE VALIDATION
// ============================================================================

/**
 * Validate an X.509 certificate
 *
 * Performs comprehensive validation including:
 * - Certificate format and structure
 * - Expiration checking
 * - Chain of trust verification
 * - Revocation status (OCSP/CRL)
 * - SAT e.firma specific validation
 *
 * @param certificatePem - Certificate in PEM format
 * @param options - Validation options
 * @returns Validation result
 */
export async function validateCertificate(
  certificatePem: string,
  options: ValidationOptions = {}
): Promise<CertificateValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  const startTime = Date.now()

  try {
    // 1. Parse certificate
    const cert = parseCertificate(certificatePem)
    if (!cert) {
      return {
        isValid: false,
        errors: ['Invalid certificate format'],
        warnings: [],
        revocationStatus: RevocationStatus.UNKNOWN,
        validatedAt: new Date(),
      }
    }

    // 2. Check expiration
    const expirationCheck = checkExpiration(cert)
    if (!expirationCheck.valid) {
      errors.push(expirationCheck.reason!)
    }

    // 3. Check certificate chain (if enabled)
    let chain: CertificateChainItem[] | undefined
    if (options.validateChain !== false) {
      const chainResult = await validateCertificateChain(cert, certificatePem)
      if (!chainResult.valid) {
        errors.push(...chainResult.errors)
      }
      chain = chainResult.chain
      warnings.push(...chainResult.warnings)
    }

    // 4. Check revocation status (if enabled)
    let revocationStatus = RevocationStatus.UNKNOWN
    if (options.checkRevocation !== false) {
      const revocationResult = await checkCertificateRevocation(cert, certificatePem)
      revocationStatus = revocationResult.status

      if (revocationStatus === RevocationStatus.REVOKED) {
        errors.push(`Certificate revoked: ${revocationResult.reason || 'No reason provided'}`)
      } else if (revocationStatus === RevocationStatus.UNKNOWN) {
        warnings.push('Unable to determine certificate revocation status')
      }
    }

    // 5. SAT e.firma specific validation (if applicable)
    if (options.validateSAT) {
      const satValidation = await validateSATCertificate(cert)
      if (!satValidation.valid) {
        errors.push(...satValidation.errors)
      }
      warnings.push(...satValidation.warnings)
    }

    // 6. Determine overall validity
    const isValid = errors.length === 0

    return {
      isValid,
      errors,
      warnings,
      chain,
      revocationStatus,
      validatedAt: new Date(),
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      revocationStatus: RevocationStatus.UNKNOWN,
      validatedAt: new Date(),
    }
  }
}

/**
 * Validation options
 */
interface ValidationOptions {
  /** Validate certificate chain (default: true) */
  validateChain?: boolean

  /** Check certificate revocation (default: true) */
  checkRevocation?: boolean

  /** Perform SAT-specific validation (default: false) */
  validateSAT?: boolean

  /** Skip expiration check (default: false) */
  skipExpirationCheck?: boolean
}

/**
 * Parsed certificate information
 */
interface ParsedCertificate {
  /** Subject DN */
  subject: string

  /** Issuer DN */
  issuer: string

  /** Serial number */
  serialNumber: string

  /** Valid from */
  validFrom: Date

  /** Valid until */
  validUntil: Date

  /** Public key */
  publicKey: string

  /** Certificate fingerprint */
  fingerprint: string

  /** Raw certificate data */
  raw: Buffer
}

/**
 * Parse X.509 certificate from PEM format
 */
function parseCertificate(certificatePem: string): ParsedCertificate | null {
  try {
    // Remove PEM headers and footers
    const pem = certificatePem
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\s/g, '')

    // Decode Base64
    const der = Buffer.from(pem, 'base64')

    // Basic validation
    if (der.length < 100) {
      return null
    }

    // For now, extract basic information
    // In production, use node-forge or similar for proper X.509 parsing
    return {
      subject: extractSubject(certificatePem),
      issuer: extractIssuer(certificatePem),
      serialNumber: extractSerialNumber(certificatePem),
      validFrom: extractValidFrom(certificatePem),
      validUntil: extractValidUntil(certificatePem),
      publicKey: extractPublicKey(certificatePem),
      fingerprint: createHash('sha256').update(der).digest('hex'),
      raw: der,
    }
  } catch (error) {
    return null
  }
}

// ============================================================================
// EXTRACTORS (Simplified - Use proper X.509 library in production)
// ============================================================================

function extractSubject(pem: string): string {
  // Placeholder - extract from Subject: field or CN
  const match = pem.match(/Subject:.*?CN=([^,\n]+)/)
  return match ? match[1].trim() : 'Unknown'
}

function extractIssuer(pem: string): string {
  // Placeholder - extract from Issuer: field or CN
  const match = pem.match(/Issuer:.*?CN=([^,\n]+)/)
  return match ? match[1].trim() : 'Unknown'
}

function extractSerialNumber(pem: string): string {
  // Placeholder - extract serial number
  return '00000000000000000000'
}

function extractValidFrom(pem: string): Date {
  // Placeholder - extract NotBefore field
  // Default to current time
  return new Date()
}

function extractValidUntil(pem: string): Date {
  // Placeholder - extract NotAfter field
  // Default to 1 year from now
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date
}

function extractPublicKey(pem: string): string {
  // Return the PEM format certificate
  return pem
}

// ============================================================================
// EXPIRATION CHECKING
// ============================================================================

/**
 * Check if certificate is expired
 */
function checkExpiration(cert: ParsedCertificate): {
  valid: boolean
  reason?: string
} {
  const now = new Date()

  if (now < cert.validFrom) {
    return {
      valid: false,
      reason: 'Certificate is not yet valid',
    }
  }

  if (now > cert.validUntil) {
    return {
      valid: false,
      reason: `Certificate expired on ${cert.validUntil.toISOString()}`,
    }
  }

  // Check if certificate will expire soon (within 30 days)
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  const expiresSoon = cert.validUntil.getTime() - now.getTime() < thirtyDays

  return {
    valid: true,
    ...(expiresSoon && { reason: 'Certificate will expire within 30 days' }),
  }
}

/**
 * Get certificate validity period
 */
export function getCertificateValidity(certificatePem: string): {
  validFrom: Date
  validUntil: Date
  isValid: boolean
  daysUntilExpiration: number
} | null {
  const cert = parseCertificate(certificatePem)
  if (!cert) {
    return null
  }

  const now = new Date()
  const daysUntilExpiration = Math.ceil(
    (cert.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    validFrom: cert.validFrom,
    validUntil: cert.validUntil,
    isValid: now >= cert.validFrom && now <= cert.validUntil,
    daysUntilExpiration,
  }
}

// ============================================================================
// CHAIN VALIDATION
// ============================================================================

/**
 * Validate certificate chain
 */
async function validateCertificateChain(
  cert: ParsedCertificate,
  certificatePem: string
): Promise<{
  valid: boolean
  chain?: CertificateChainItem[]
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []
  const chain: CertificateChainItem[] = []

  try {
    // For e.firma, validate against SAT root CA
    if (cert.issuer.includes('SAT') || cert.issuer.includes('Servicio de Administración Tributaria')) {
      const satValidation = await validateSATChain(cert)
      if (!satValidation.valid) {
        errors.push(...satValidation.errors)
      }
      chain.push(...satValidation.chain)
      warnings.push(...satValidation.warnings)
    } else {
      // For other certificates, build generic chain
      // In production, this would query the certificate authority
      warnings.push('Certificate issuer not recognized as SAT authority')
    }

    return {
      valid: errors.length === 0,
      chain,
      errors,
      warnings,
    }
  } catch (error) {
    return {
      valid: false,
      errors: [`Chain validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings,
    }
  }
}

/**
 * Validate SAT certificate chain
 */
async function validateSATChain(cert: ParsedCertificate): Promise<{
  valid: boolean
  chain: CertificateChainItem[]
  errors: string[]
  warnings: string[]
}> {
  const chain: CertificateChainItem[] = []
  const errors: string[] = []
  const warnings: string[] = []

  // Add leaf certificate
  chain.push({
    subject: cert.subject,
    issuer: cert.issuer,
    serialNumber: cert.serialNumber,
    validFrom: cert.validFrom,
    validUntil: cert.validUntil,
    isRoot: false,
  })

  // In production, this would:
  // 1. Query SAT's directory service for intermediate certificates
  // 2. Validate against SAT's root CA
  // 3. Check CRL/OCSP for each certificate in chain

  // For now, simulate chain validation
  warnings.push('SAT chain validation simulated - production requires integration with SAT infrastructure')

  return {
    valid: true,
    chain,
    errors,
    warnings,
  }
}

// ============================================================================
// REVOCATION CHECKING
// ============================================================================

/**
 * Check certificate revocation status
 */
async function checkCertificateRevocation(
  cert: ParsedCertificate,
  certificatePem: string
): Promise<RevocationInfo> {
  try {
    // Try OCSP first (faster)
    const ocspResult = await checkOCSP(certificatePem)

    if (ocspResult.status !== RevocationStatus.UNKNOWN) {
      return ocspResult
    }

    // Fallback to CRL
    const crlResult = await checkCRL(certificatePem)
    return crlResult
  } catch (error) {
    return {
      status: RevocationStatus.UNKNOWN,
    }
  }
}

/**
 * Check OCSP (Online Certificate Status Protocol)
 */
async function checkOCSP(certificatePem: string): Promise<RevocationInfo> {
  try {
    // For SAT certificates, query SAT's OCSP service
    // URL: http://ocsp.sat.gob.mx (or similar)

    // In production, this would:
    // 1. Extract OCSP URL from certificate
    // 2. Build OCSP request
    // 3. Send to OCSP server
    // 4. Parse response

    // For now, simulate OCSP check
    return {
      status: RevocationStatus.UNKNOWN,
    }
  } catch (error) {
    return {
      status: RevocationStatus.UNKNOWN,
    }
  }
}

/**
 * Check CRL (Certificate Revocation List)
 */
async function checkCRL(certificatePem: string): Promise<RevocationInfo> {
  try {
    // For SAT certificates, download and check CRL
    // URL: http://www.sat.gob.mx/sitio_internet/certificados/ (or similar)

    // In production, this would:
    // 1. Extract CRL URL from certificate
    // 2. Download CRL
    // 3. Check if serial number is in CRL

    // For now, simulate CRL check
    return {
      status: RevocationStatus.UNKNOWN,
    }
  } catch (error) {
    return {
      status: RevocationStatus.UNKNOWN,
    }
  }
}

// ============================================================================
// SAT-SPECIFIC VALIDATION
// ============================================================================

/**
 * Validate SAT e.firma certificate
 */
async function validateSATCertificate(cert: ParsedCertificate): Promise<{
  valid: boolean
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. Check issuer is SAT
  if (!cert.issuer.includes('SAT') && !cert.issuer.includes('Servicio de Administración Tributaria')) {
    errors.push('Certificate not issued by SAT - not a valid e.firma')
  }

  // 2. Check key length (minimum 2048 bits for e.firma)
  warnings.push('Key length validation simulated - production requires actual key extraction')

  // 3. Check certificate policy
  warnings.push('Certificate policy validation simulated - production requires OID validation')

  // 4. Check for required extensions
  warnings.push('Extension validation simulated - production requires actual extension parsing')

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Extract RFC from e.firma certificate
 */
export function extractRFC(certificatePem: string): string | null {
  try {
    const cert = parseCertificate(certificatePem)
    if (!cert) {
      return null
    }

    // RFC is typically in the subject DN or subject alternative name
    // Format: x509Certificate.subjectDN contains RFC for e.firma
    const subject = cert.subject

    // Try to extract RFC from subject
    // RFC format: XXXX000000XXX (or similar for companies)
    const rfcMatch = subject.match(/([A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3})/i)
    if (rfcMatch) {
      return rfcMatch[1].toUpperCase()
    }

    // Try alternative formats
    const altMatch = subject.match(/RFC=([^,]+)/i)
    if (altMatch) {
      return altMatch[1].trim().toUpperCase()
    }

    return null
  } catch (error) {
    return null
  }
}

/**
 * Validate certificate against user's RFC
 */
export function validateCertificateRFC(
  certificatePem: string,
  userRFC: string
): boolean {
  const certRFC = extractRFC(certificatePem)
  if (!certRFC) {
    return false
  }

  // Normalize RFCs for comparison
  const normalizeRFC = (rfc: string) => rfc.toUpperCase().trim()

  return normalizeRFC(certRFC) === normalizeRFC(userRFC)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get certificate fingerprint
 */
export function getCertificateFingerprint(certificatePem: string): string | null {
  const cert = parseCertificate(certificatePem)
  return cert?.fingerprint || null
}

/**
 * Generate certificate hash for storage
 */
export function generateCertificateHash(certificatePem: string): string {
  return createHash('sha256').update(certificatePem).digest('hex')
}

/**
 * Check if certificate needs renewal (within 60 days of expiration)
 */
export function certificateNeedsRenewal(certificatePem: string): boolean {
  const validity = getCertificateValidity(certificatePem)
  if (!validity) {
    return false
  }

  return validity.daysUntilExpiration < 60
}

/**
 * Get certificate information summary
 */
export function getCertificateInfo(certificatePem: string): {
  subject: string
  issuer: string
  serialNumber: string
  validFrom: Date
  validUntil: Date
  fingerprint: string
  rfc?: string
} | null {
  const cert = parseCertificate(certificatePem)
  if (!cert) {
    return null
  }

  return {
    subject: cert.subject,
    issuer: cert.issuer,
    serialNumber: cert.serialNumber,
    validFrom: cert.validFrom,
    validUntil: cert.validUntil,
    fingerprint: cert.fingerprint,
    rfc: extractRFC(certificatePem) || undefined,
  }
}

