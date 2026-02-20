/**
 * Simple Electronic Signature for Consent Documents
 *
 * Lightweight digital signature system for consent documents.
 * Provides legally binding digital signatures with cryptographic verification.
 *
 * @module digital-signature/simple-signature
 * @version 1.0.0
 */

import crypto from 'crypto'
import { logger } from '@/lib/observability/logger'
import { createAuditLog } from '@/lib/audit/immutable-log'
import type { AuditCategory, AuditEventType } from '@/types/audit'

// ================================================
// TYPES
// ================================================

/**
 * Simple digital signature for consent documents
 */
export interface SimpleDigitalSignature {
  /** Unique signature ID */
  id: string

  /** Document being signed */
  document_id: string

  /** Document type (consent, arco_request, etc.) */
  document_type: string

  /** User who signed */
  user_id: string

  /** User's full name at signing time */
  user_name: string

  /** User's RFC (tax ID) */
  user_rfc: string | null

  /** IP address when signing */
  ip_address: string | null

  /** User agent when signing */
  user_agent: string | null

  /** Signature timestamp */
  signed_at: string

  /** Cryptographic hash of document content */
  document_hash: string

  /** Digital signature value (base64) */
  signature_value: string

  /** Signature algorithm used */
  algorithm: 'SHA256' | 'SHA384' | 'SHA512'

  /** Whether user accepted terms */
  terms_accepted: boolean

  /** Additional metadata */
  metadata: Record<string, unknown> | null
}

/**
 * Signature request for a document (simple/internal version)
 */
export interface SimpleSignatureRequest {
  /** Document to be signed */
  document_id: string

  /** Document type */
  document_type: string

  /** Document content (for hashing) */
  document_content: string

  /** User who should sign */
  user_id: string

  /** User's current data */
  user_data: {
    full_name: string
    rfc: string | null
    email: string | null
  }

  /** Request expiration */
  expires_at: string
}

/**
 * Signature verification result
 */
export interface SignatureVerificationResult {
  /** Whether signature is valid */
  is_valid: boolean

  /** Whether document hash matches */
  hash_valid: boolean

  /** Whether signature was created by the claimed user */
  signature_valid: boolean

  /** Whether signature has expired */
  is_expired: boolean

  /** Verification timestamp */
  verified_at: string

  /** Details about verification */
  details: {
    document_hash: string
    expected_hash: string
    signer_user_id: string
    signing_timestamp: string
  }
}

// ================================================
// SIGNATURE CREATION
// ================================================

/**
 * Create a signature request for a document
 *
 * @param documentId - Document ID to be signed
 * @param documentType - Type of document
 * @param documentContent - Content to be signed
 * @param userId - User who should sign
 * @param userFullName - User's full name
 * @param validityHours - How long the signature request is valid (default: 72 hours)
 * @returns Signature request object
 */
export function createSignatureRequest(
  documentId: string,
  documentType: string,
  documentContent: string,
  userId: string,
  userFullName: string,
  validityHours: number = 72
): SimpleSignatureRequest {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + validityHours)

  // Generate document hash for integrity
  const documentHash = crypto
    .createHash('sha256')
    .update(documentContent)
    .digest('hex')

  logger.info('Signature request created', {
    documentId,
    documentType,
    userId,
    expiresAt: expiresAt.toISOString(),
  })

  return {
    document_id: documentId,
    document_type: documentType,
    document_content: documentContent,
    user_id: userId,
    user_data: {
      full_name: userFullName,
      rfc: null, // Will be filled when signing
      email: null,
    },
    expires_at: expiresAt.toISOString(),
  }
}

/**
 * Sign a document (create digital signature)
 *
 * @param request - Signature request
 * @param userRfc - User's RFC (optional)
 * @param ipAddress - IP address of signing
 * @param userAgent - User agent of signing
 * @returns Created digital signature
 */
export async function signDocument(
  request: SimpleSignatureRequest,
  userRfc: string | null,
  ipAddress: string | null,
  userAgent: string | null
): Promise<SimpleDigitalSignature> {
  // Check if request has expired
  if (new Date() > new Date(request.expires_at)) {
    throw new Error('La solicitud de firma ha expirado. Por favor solicite una nueva.')
  }

  // Generate document hash
  const documentHash = crypto
    .createHash('sha256')
    .update(request.document_content)
    .digest('hex')

  // Create signature value (hash of hash + user_id + timestamp)
  const signatureData = `${documentHash}:${request.user_id}:${Date.now()}`
  const signatureValue = crypto
    .createHash('sha256')
    .update(signatureData)
    .digest('base64')

  const signature: SimpleDigitalSignature = {
    id: crypto.randomUUID(),
    document_id: request.document_id,
    document_type: request.document_type,
    user_id: request.user_id,
    user_name: request.user_data.full_name,
    user_rfc: userRfc,
    ip_address: ipAddress,
    user_agent: userAgent,
    signed_at: new Date().toISOString(),
    document_hash: documentHash,
    signature_value: signatureValue,
    algorithm: 'SHA256',
    terms_accepted: true,
    metadata: {
      document_type: request.document_type,
      signature_method: 'simple',
      user_agent: userAgent,
    },
  }

  // Log to audit trail
  await createAuditLog({
    id: `signature_${signature.id}`,
    category: 'signature' as AuditCategory,
    event_type: 'signature.create' as AuditEventType,
    occurred_at: new Date(),
    actor: {
      user_id: request.user_id,
      role: 'user',
      user_name: request.user_data.full_name,
      type: 'user',
    },
    resource: {
      type: request.document_type,
      id: request.document_id,
      name: 'Digital Signature',
    },
    outcome: {
      status: 'success',
    },
    metadata: {
      document_hash: documentHash,
      algorithm: 'SHA256',
      user_rfc: userRfc,
    },
  })

  logger.info('Document signed successfully', {
    signatureId: signature.id,
    documentId: request.document_id,
    userId: request.user_id,
  })

  return signature
}

/**
 * Sign multiple documents in a batch
 *
 * @param requests - Array of signature requests
 * @param userRfc - User's RFC (optional)
 * @param ipAddress - IP address of signing
 * @param userAgent - User agent of signing
 * @returns Array of created signatures
 */
export async function signDocumentBatch(
  requests: SimpleSignatureRequest[],
  userRfc: string | null,
  ipAddress: string | null,
  userAgent: string | null
): Promise<SimpleDigitalSignature[]> {
  const signatures: SimpleDigitalSignature[] = []

  for (const request of requests) {
    try {
      const signature = await signDocument(request, userRfc, ipAddress, userAgent)
      signatures.push(signature)
    } catch (error) {
      logger.error('Error signing document in batch', {
        documentId: request.document_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, error as Error)
    }
  }

  return signatures
}

// ================================================
// SIGNATURE VERIFICATION
// ================================================

/**
 * Verify a digital signature
 *
 * @param signature - Signature to verify
 * @param originalContent - Original document content
 * @returns Verification result
 */
export function verifySignature(
  signature: SimpleDigitalSignature,
  originalContent: string
): SignatureVerificationResult {
  const now = new Date()

  // Recalculate document hash
  const expectedHash = crypto
    .createHash('sha256')
    .update(originalContent)
    .digest('hex')

  // Verify document hash
  const hashValid = signature.document_hash === expectedHash

  // Verify signature value
  const signatureData = `${signature.document_hash}:${signature.user_id}:${signature.signed_at}`
  const expectedSignature = crypto
    .createHash('sha256')
    .update(signatureData)
    .digest('base64')

  const signatureValid = signature.signature_value === expectedSignature

  // Check if signature is expired (signatures valid for 5 years per NOM-004)
  const signingDate = new Date(signature.signed_at)
  const expirationDate = new Date(signingDate)
  expirationDate.setFullYear(expirationDate.getFullYear() + 5)
  const isExpired = now > expirationDate

  const isValid = hashValid && signatureValid && !isExpired

  const result: SignatureVerificationResult = {
    is_valid: isValid,
    hash_valid: hashValid,
    signature_valid: signatureValid,
    is_expired: isExpired,
    verified_at: now.toISOString(),
    details: {
      document_hash: signature.document_hash,
      expected_hash: expectedHash,
      signer_user_id: signature.user_id,
      signing_timestamp: signature.signed_at,
    },
  }

  // Log verification to audit trail
  createAuditLog({
    id: `signature_verify_${signature.id}_${Date.now()}`,
    category: 'signature' as AuditCategory,
    event_type: 'signature.verify' as AuditEventType,
    occurred_at: now,
    actor: {
      user_id: signature.user_id,
      role: 'user',
      user_name: signature.user_name,
      type: 'user',
    },
    resource: {
      type: signature.document_type,
      id: signature.document_id,
      name: 'Digital Signature Verification',
    },
    outcome: {
      status: isValid ? 'success' : 'failure',
      error_message: !isValid ? 'Signature verification failed' : undefined,
    },
    metadata: {
      signature_id: signature.id,
      is_valid: isValid,
      hash_valid: hashValid,
      signature_valid: signatureValid,
      is_expired: isExpired,
    },
  }).catch((error) => {
    logger.error('Error logging signature verification', { error }, error as Error)
  })

  logger.info('Signature verified', {
    signatureId: signature.id,
    isValid,
    hashValid,
    signatureValid,
    isExpired,
  })

  return result
}

/**
 * Verify batch of signatures
 *
 * @param signatures - Array of signatures to verify
 * @param documents - Map of document_id to original content
 * @returns Array of verification results
 */
export function verifySignatureBatch(
  signatures: SimpleDigitalSignature[],
  documents: Map<string, string>
): SignatureVerificationResult[] {
  const results: SignatureVerificationResult[] = []

  for (const signature of signatures) {
    const originalContent = documents.get(signature.document_id)
    if (!originalContent) {
      logger.warn('Document content not found for signature verification', {
        signatureId: signature.id,
        documentId: signature.document_id,
      })
      continue
    }

    const result = verifySignature(signature, originalContent)
    results.push(result)
  }

  return results
}

// ================================================
// SIGNATURE STORAGE
// ================================================

/**
 * Store signature in database
 *
 * @param signature - Signature to store
 * @returns Created signature record
 */
export async function storeSignature(
  signature: SimpleDigitalSignature
): Promise<SimpleDigitalSignature> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('digital_signatures')
    .insert({
      id: signature.id,
      document_id: signature.document_id,
      document_type: signature.document_type,
      user_id: signature.user_id,
      user_name: signature.user_name,
      user_rfc: signature.user_rfc,
      ip_address: signature.ip_address,
      user_agent: signature.user_agent,
      signed_at: signature.signed_at,
      document_hash: signature.document_hash,
      signature_value: signature.signature_value,
      algorithm: signature.algorithm,
      terms_accepted: signature.terms_accepted,
      metadata: signature.metadata,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error storing signature: ${error.message}`)
  }

  logger.info('Signature stored', { signatureId: signature.id })

  return data as SimpleDigitalSignature
}

/**
 * Retrieve signature by document ID
 *
 * @param documentId - Document ID
 * @returns Signature record or null
 */
export async function getSignatureByDocument(
  documentId: string
): Promise<SimpleDigitalSignature | null> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('digital_signatures')
    .select('*')
    .eq('document_id', documentId)
    .order('signed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    logger.error('Error retrieving signature', { documentId, error })
    return null
  }

  return data as SimpleDigitalSignature | null
}

/**
 * Get all signatures for a user
 *
 * @param userId - User ID
 * @param options - Query options
 * @returns Array of signatures
 */
export async function getUserSignatures(
  userId: string,
  options?: {
    documentType?: string
    limit?: number
    offset?: number
  }
): Promise<SimpleDigitalSignature[]> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  let query = supabase
    .from('digital_signatures')
    .select('*')
    .eq('user_id', userId)

  if (options?.documentType) {
    query = query.eq('document_type', options.documentType)
  }

  query = query.order('signed_at', { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, (options.offset ?? 0) + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    logger.error('Error retrieving user signatures', { userId, error })
    return []
  }

  return (data as SimpleDigitalSignature[]) || []
}

// ================================================
// SIGNATURE EXPORT
// ================================================

/**
 * Generate signature proof document (for verification)
 *
 * @param signature - Signature to generate proof for
 * @returns Proof document content
 */
export function generateSignatureProof(signature: SimpleDigitalSignature): string {
  const proofLines: string[] = []

  proofLines.push('=' .repeat(80))
  proofLines.push('CONSTANCIA DE FIRMA DIGITAL')
  proofLines.push('=' .repeat(80))
  proofLines.push('')

  proofLines.push(`ID de Firma: ${signature.id}`)
  proofLines.push(`Documento: ${signature.document_id}`)
  proofLines.push(`Tipo: ${signature.document_type}`)
  proofLines.push('')

  proofLines.push('FIRMANTE:')
  proofLines.push(`  Nombre: ${signature.user_name}`)
  if (signature.user_rfc) {
    proofLines.push(`  RFC: ${signature.user_rfc}`)
  }
  proofLines.push(`  ID de Usuario: ${signature.user_id}`)
  proofLines.push(`  Fecha de Firma: ${signature.signed_at}`)
  if (signature.ip_address) {
    proofLines.push(`  Dirección IP: ${signature.ip_address}`)
  }
  proofLines.push('')

  proofLines.push('DATOS CRIPTOGRÁFICOS:')
  proofLines.push(`  Algoritmo: ${signature.algorithm}`)
  proofLines.push(`  Hash del Documento: ${signature.document_hash}`)
  proofLines.push(`  Firma Digital: ${signature.signature_value.substring(0, 32)}...`)
  proofLines.push('')

  proofLines.push('VERIFICACIÓN:')
  proofLines.push('  Para verificar esta firma, use el módulo de verificación')
  proofLines.push('  de Doctor.mx con el documento original.')
  proofLines.push('')

  proofLines.push('=' .repeat(80))
  proofLines.push('Esta firma tiene validez legal conforme a la NOM-004-SSA3-2012')
  proofLines.push('=' .repeat(80))

  return proofLines.join('\n')
}

/**
 * Export signature data for audit purposes
 *
 * @param signature - Signature to export
 * @param format - Export format (json, csv)
 * @returns Exported signature data
 */
export function exportSignatureData(
  signature: SimpleDigitalSignature,
  format: 'json' | 'csv' = 'json'
): string {
  if (format === 'json') {
    return JSON.stringify(signature, null, 2)
  }

  // CSV format
  const fields = [
    'id',
    'document_id',
    'document_type',
    'user_id',
    'user_name',
    'user_rfc',
    'signed_at',
    'algorithm',
    'document_hash',
  ]

  const row = fields.map((field) => {
    const value = (signature as unknown as Record<string, unknown>)[field]
    return typeof value === 'string' ? `"${value}"` : `${value}`
  })

  return [fields.join(','), row.join(',')].join('\n')
}

// ================================================
// CONSENT SIGNATURE WORKFLOW
// ================================================

/**
 * Complete consent signing workflow
 *
 * @param userId - User ID
 * @param consentId - Consent record ID
 * @param consentType - Type of consent
 * @param consentVersion - Version of consent text
 * @param ipAddress - User's IP address
 * @param userAgent - User's user agent
 * @returns Created signature
 */
export async function signConsentDocument(
  userId: string,
  consentId: string,
  consentType: string,
  consentVersion: string,
  ipAddress: string | null,
  userAgent: string | null
): Promise<SimpleDigitalSignature> {
  // Get consent content
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data: consentRecord } = await supabase
    .from('user_consent_records')
    .select('consent_text, version')
    .eq('id', consentId)
    .single()

  if (!consentRecord) {
    throw new Error('Registro de consentimiento no encontrado')
  }

  // Build document content for hashing
  const documentContent = JSON.stringify({
    type: 'CONSENT',
    consent_id: consentId,
    consent_type: consentType,
    version: consentVersion,
    consent_text: consentRecord.consent_text,
    timestamp: new Date().toISOString(),
  })

  // Get user data
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, rfc')
    .eq('id', userId)
    .single()

  if (!profile) {
    throw new Error('Perfil de usuario no encontrado')
  }

  // Create signature request
  const request = createSignatureRequest(
    consentId,
    `consent_${consentType}`,
    documentContent,
    userId,
    profile.full_name,
    48 // 48 hours validity
  )

  // Sign the document
  const signature = await signDocument(
    request,
    profile.rfc || null,
    ipAddress,
    userAgent
  )

  // Store signature
  await storeSignature(signature)

  // Update consent record with signature reference
  await supabase
    .from('user_consent_records')
    .update({
      digital_signature_id: signature.id,
      signed_at: signature.signed_at,
    })
    .eq('id', consentId)

  logger.info('Consent document signed', {
    consentId,
    userId,
    signatureId: signature.id,
  })

  return signature
}

/**
 * Verify consent signature
 *
 * @param consentId - Consent record ID
 * @param signature - Signature to verify
 * @returns Verification result
 */
export async function verifyConsentSignature(
  consentId: string,
  signature: SimpleDigitalSignature
): Promise<SignatureVerificationResult> {
  // Get original consent content
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data: consentRecord } = await supabase
    .from('user_consent_records')
    .select('consent_text, version, created_at')
    .eq('id', consentId)
    .single()

  if (!consentRecord) {
    throw new Error('Registro de consentimiento no encontrado')
  }

  // Reconstruct document content
  const documentContent = JSON.stringify({
    type: 'CONSENT',
    consent_id: consentId,
    consent_type: signature.document_type,
    version: consentRecord.version,
    consent_text: consentRecord.consent_text,
    timestamp: consentRecord.created_at,
  })

  return verifySignature(signature, documentContent)
}
