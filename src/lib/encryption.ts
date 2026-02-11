/**
 * Field-Level Encryption Service for Sensitive Medical Data
 * 
 * This module provides AES-256-GCM encryption for Protected Health Information (PHI)
 * in compliance with HIPAA security requirements.
 * 
 * Features:
 * - AES-256-GCM authenticated encryption
 * - HKDF-SHA256 key derivation
 * - Key rotation support with versioning
 * - Associated data for context binding
 * - Batch operations for database records
 * - Supabase integration helpers
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual, createHmac, hkdfSync, Cipher, Decipher } from 'crypto';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Structure representing encrypted data with all necessary metadata
 */
export interface EncryptedData {
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded initialization vector (12 bytes for GCM) */
  iv: string;
  /** Base64-encoded authentication tag (16 bytes for GCM) */
  tag: string;
  /** Key version for rotation support */
  version: number;
  /** Optional base64-encoded associated data */
  aad?: string;
}

/**
 * Configuration options for the encryption service
 */
export interface EncryptionConfig {
  /** Master key from environment (hex-encoded) */
  masterKey: string;
  /** Salt for key derivation (hex-encoded) */
  salt?: string;
  /** Current key version */
  currentVersion?: number;
  /** Previous keys for decryption of old data (version -> key mapping) */
  previousKeys?: Map<number, string>;
  /** Algorithm identifier */
  algorithm?: string;
}

/**
 * Options for field-level encryption operations
 */
export interface FieldEncryptionOptions {
  /** Fields to encrypt within an object */
  fields: string[];
  /** Optional associated data for context binding */
  associatedData?: string;
  /** Key version to use (defaults to current) */
  keyVersion?: number;
  /** Whether to allow decryption failures (returns null instead of throwing) */
  permissive?: boolean;
}

/**
 * Prescription data structure
 */
export interface PrescriptionData {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  prescribedBy: string;
  prescribedAt: string;
}

/**
 * Schema field definition for Supabase integration
 */
export interface SchemaField {
  name: string;
  type: string;
  encrypted?: boolean;
}

/**
 * Database record type
 */
export type DatabaseRecord = Record<string, unknown>;

// ============================================================================
// Constants
// ============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits for GCM
const KEY_LENGTH = 32; // 256 bits
const HKDF_INFO = 'doctory-medical-encryption-v1';
const DEFAULT_SALT = 'doctory-secure-medical-platform-salt-v1';

// ============================================================================
// Custom Errors
// ============================================================================

export class EncryptionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'EncryptionError';
    Object.setPrototypeOf(this, EncryptionError.prototype);
  }
}

export class DecryptionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'DecryptionError';
    Object.setPrototypeOf(this, DecryptionError.prototype);
  }
}

export class KeyRotationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'KeyRotationError';
    Object.setPrototypeOf(this, KeyRotationError.prototype);
  }
}

// ============================================================================
// Encryption Service Class
// ============================================================================

export class EncryptionService {
  private masterKey: Buffer;
  private salt: string;
  private currentVersion: number;
  private previousKeys: Map<number, Buffer>;
  private algorithm: string;

  constructor(config?: EncryptionConfig) {
    // Load master key from environment or config
    const masterKeyHex = config?.masterKey || process.env.ENCRYPTION_MASTER_KEY;
    
    if (!masterKeyHex) {
      throw new EncryptionError(
        'Master key not provided. Set ENCRYPTION_MASTER_KEY environment variable or pass in config.',
        'MISSING_MASTER_KEY'
      );
    }

    // Validate master key length (must be 64 hex chars = 32 bytes)
    if (!/^[a-f0-9]{64}$/i.test(masterKeyHex)) {
      throw new EncryptionError(
        'Master key must be a 64-character hex string (256 bits)',
        'INVALID_MASTER_KEY_FORMAT'
      );
    }

    this.masterKey = Buffer.from(masterKeyHex, 'hex');
    this.salt = config?.salt || DEFAULT_SALT;
    this.currentVersion = config?.currentVersion || 1;
    this.algorithm = config?.algorithm || ALGORITHM;
    this.previousKeys = new Map();

    // Load previous keys for rotation support
    if (config?.previousKeys) {
      for (const [version, keyHex] of config.previousKeys) {
        this.previousKeys.set(version, Buffer.from(keyHex, 'hex'));
      }
    }

    // Derive and store current key
    this.previousKeys.set(this.currentVersion, this.deriveKey(this.masterKey, this.currentVersion));
  }

  /**
   * Derive an encryption key using HKDF-SHA256
   */
  private deriveKey(masterKey: Buffer, version: number): Buffer {
    try {
      const info = Buffer.from(`${HKDF_INFO}:${version}`, 'utf8');
      const salt = Buffer.from(this.salt, 'utf8');
      
      const derivedKey = hkdfSync('sha256', masterKey, salt, info, KEY_LENGTH);
      return Buffer.from(derivedKey);
    } catch (error) {
      throw new EncryptionError(
        `Key derivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'KEY_DERIVATION_FAILED'
      );
    }
  }

  /**
   * Get the current encryption key
   */
  private getCurrentKey(): Buffer {
    const key = this.previousKeys.get(this.currentVersion);
    if (!key) {
      throw new EncryptionError('Current encryption key not found', 'KEY_NOT_FOUND');
    }
    return key;
  }

  /**
   * Get a specific key version
   */
  private getKey(version: number): Buffer {
    const key = this.previousKeys.get(version);
    if (!key) {
      throw new DecryptionError(`Key version ${version} not found`, 'KEY_VERSION_NOT_FOUND');
    }
    return key;
  }

  /**
   * Encrypt plaintext using AES-256-GCM
   * 
   * @param plaintext - The data to encrypt
   * @param associatedData - Optional context data for authentication
   * @returns EncryptedData object containing ciphertext, IV, tag, and version
   */
  encrypt(plaintext: string, associatedData?: string): EncryptedData {
    if (!plaintext) {
      throw new EncryptionError('Plaintext cannot be empty', 'EMPTY_PLAINTEXT');
    }

    try {
      // Generate cryptographically secure random IV
      const iv = randomBytes(IV_LENGTH);
      
      // Get current encryption key
      const key = this.getCurrentKey();
      
      // Create cipher
      const cipher = createCipheriv(this.algorithm, key, iv);

      // Set associated data if provided
      let aadBuffer: Buffer | undefined;
      if (associatedData) {
        aadBuffer = Buffer.from(associatedData, 'utf8');
        (cipher as Cipher & { setAAD?: (buffer: Buffer) => void }).setAAD?.(aadBuffer);
      }

      // Encrypt the plaintext
      const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

      // Get authentication tag (required for GCM mode)
      const tag = (cipher as Cipher & { getAuthTag?: () => Buffer }).getAuthTag?.();
      if (!tag) {
        throw new EncryptionError('Failed to get authentication tag', 'ENCRYPTION_FAILED');
      }

      return {
        ciphertext: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        version: this.currentVersion,
        aad: associatedData ? Buffer.from(associatedData).toString('base64') : undefined,
      };
    } catch (error) {
      if (error instanceof EncryptionError) throw error;
      throw new EncryptionError(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ENCRYPTION_FAILED'
      );
    }
  }

  /**
   * Decrypt ciphertext using AES-256-GCM
   * 
   * @param encrypted - EncryptedData object containing all decryption metadata
   * @returns Decrypted plaintext string
   */
  decrypt(encrypted: EncryptedData): string {
    if (!encrypted?.ciphertext || !encrypted?.iv || !encrypted?.tag) {
      throw new DecryptionError('Invalid encrypted data structure', 'INVALID_DATA_STRUCTURE');
    }

    try {
      // Get the appropriate key for this version
      const key = this.getKey(encrypted.version);
      
      // Decode components
      const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
      const iv = Buffer.from(encrypted.iv, 'base64');
      const tag = Buffer.from(encrypted.tag, 'base64');

      // Validate IV length
      if (iv.length !== IV_LENGTH) {
        throw new DecryptionError(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`, 'INVALID_IV_LENGTH');
      }

      // Validate tag length
      if (tag.length !== TAG_LENGTH) {
        throw new DecryptionError(`Invalid tag length: expected ${TAG_LENGTH}, got ${tag.length}`, 'INVALID_TAG_LENGTH');
      }

      // Create decipher
      const decipher = createDecipheriv(this.algorithm, key, iv);
      (decipher as Decipher & { setAuthTag?: (tag: Buffer) => void }).setAuthTag?.(tag);

      // Set associated data if present
      if (encrypted.aad) {
        const aad = Buffer.from(encrypted.aad, 'base64');
        (decipher as Decipher & { setAAD?: (buffer: Buffer) => void }).setAAD?.(aad);
      }

      // Decrypt
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      if (error instanceof DecryptionError) throw error;
      
      // Check if it's an authentication failure
      if (error instanceof Error && error.message.includes('Unsupported state or unable to authenticate data')) {
        throw new DecryptionError('Authentication failed - data may have been tampered with', 'AUTHENTICATION_FAILED');
      }
      
      throw new DecryptionError(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DECRYPTION_FAILED'
      );
    }
  }

  /**
   * Encrypt specific fields within an object
   * 
   * @param obj - The object containing fields to encrypt
   * @param fields - Array of field paths to encrypt (supports dot notation)
   * @returns New object with specified fields encrypted
   */
  encryptObject<T extends Record<string, unknown>>(obj: T, fields: string[]): T {
    if (!obj || typeof obj !== 'object') {
      throw new EncryptionError('Invalid object provided', 'INVALID_OBJECT');
    }

    if (!fields || fields.length === 0) {
      return { ...obj };
    }

    const result = { ...obj };

    for (const field of fields) {
      const value = this.getNestedValue(result, field);
      
      if (value !== undefined && value !== null) {
        if (typeof value !== 'string') {
          throw new EncryptionError(
            `Field "${field}" must be a string to encrypt, got ${typeof value}`,
            'INVALID_FIELD_TYPE'
          );
        }
        
        const encrypted = this.encrypt(value, `field:${field}`);
        this.setNestedValue(result, field, JSON.stringify(encrypted));
      }
    }

    return result;
  }

  /**
   * Decrypt specific fields within an object
   * 
   * @param obj - The object containing encrypted fields
   * @param fields - Array of field paths to decrypt (supports dot notation)
   * @returns New object with specified fields decrypted
   */
  decryptObject<T extends Record<string, unknown>>(obj: T, fields: string[]): T {
    if (!obj || typeof obj !== 'object') {
      throw new DecryptionError('Invalid object provided', 'INVALID_OBJECT');
    }

    if (!fields || fields.length === 0) {
      return { ...obj };
    }

    const result = { ...obj };

    for (const field of fields) {
      const value = this.getNestedValue(result, field);
      
      if (value !== undefined && value !== null) {
        if (typeof value !== 'string') {
          throw new DecryptionError(
            `Field "${field}" must be a string to decrypt, got ${typeof value}`,
            'INVALID_FIELD_TYPE'
          );
        }

        try {
          const encrypted: EncryptedData = JSON.parse(value);
          const decrypted = this.decrypt(encrypted);
          this.setNestedValue(result, field, decrypted);
        } catch (error) {
          if (error instanceof SyntaxError) {
            throw new DecryptionError(
              `Field "${field}" does not contain valid encrypted data`,
              'INVALID_ENCRYPTED_FORMAT'
            );
          }
          throw error;
        }
      }
    }

    return result;
  }

  /**
   * Rotate to a new encryption key
   * 
   * @param newMasterKey - New master key (hex-encoded)
   */
  rotateKey(newMasterKey: string): void {
    if (!newMasterKey || !/^[a-f0-9]{64}$/i.test(newMasterKey)) {
      throw new KeyRotationError(
        'New master key must be a 64-character hex string (256 bits)',
        'INVALID_KEY_FORMAT'
      );
    }

    try {
      // Store current key in previous keys map
      const currentKey = this.getCurrentKey();
      this.previousKeys.set(this.currentVersion, currentKey);

      // Increment version and set new key
      this.currentVersion += 1;
      this.masterKey = Buffer.from(newMasterKey, 'hex');
      
      const newKey = this.deriveKey(this.masterKey, this.currentVersion);
      this.previousKeys.set(this.currentVersion, newKey);
    } catch (error) {
      if (error instanceof KeyRotationError) throw error;
      throw new KeyRotationError(
        `Key rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ROTATION_FAILED'
      );
    }
  }

  // ============================================================================
  // Medical Data Specific Methods
  // ============================================================================

  /**
   * Encrypt Protected Health Information (PHI)
   * Uses patient ID as associated data for context binding
   * 
   * @param data - The PHI to encrypt
   * @param patientId - Patient identifier for context binding
   */
  encryptPHI(data: string, patientId?: string): EncryptedData {
    const aad = patientId ? `phi:patient:${patientId}` : 'phi:general';
    return this.encrypt(data, aad);
  }

  /**
   * Decrypt Protected Health Information (PHI)
   * 
   * @param encrypted - Encrypted PHI data
   */
  decryptPHI(encrypted: EncryptedData): string {
    return this.decrypt(encrypted);
  }

  /**
   * Encrypt diagnosis information
   * 
   * @param diagnosis - Diagnosis text to encrypt
   * @param patientId - Patient identifier for context binding
   */
  encryptDiagnosis(diagnosis: string, patientId?: string): EncryptedData {
    const aad = patientId ? `diagnosis:patient:${patientId}` : 'diagnosis:general';
    return this.encrypt(diagnosis, aad);
  }

  /**
   * Decrypt diagnosis information
   * 
   * @param encrypted - Encrypted diagnosis data
   */
  decryptDiagnosis(encrypted: EncryptedData): string {
    return this.decrypt(encrypted);
  }

  /**
   * Encrypt medical notes
   * 
   * @param notes - Medical notes to encrypt
   * @param consultationId - Consultation identifier for context binding
   */
  encryptNotes(notes: string, consultationId?: string): EncryptedData {
    const aad = consultationId ? `notes:consultation:${consultationId}` : 'notes:general';
    return this.encrypt(notes, aad);
  }

  /**
   * Decrypt medical notes
   * 
   * @param encrypted - Encrypted notes data
   */
  decryptNotes(encrypted: EncryptedData): string {
    return this.decrypt(encrypted);
  }

  /**
   * Encrypt prescription data
   * 
   * @param prescription - Prescription data object
   * @param patientId - Patient identifier for context binding
   */
  encryptPrescription(prescription: PrescriptionData, patientId?: string): EncryptedData {
    const prescriptionJson = JSON.stringify(prescription);
    const aad = patientId ? `prescription:patient:${patientId}` : 'prescription:general';
    return this.encrypt(prescriptionJson, aad);
  }

  /**
   * Decrypt prescription data
   * 
   * @param encrypted - Encrypted prescription data
   */
  decryptPrescription(encrypted: EncryptedData): PrescriptionData {
    const decrypted = this.decrypt(encrypted);
    return JSON.parse(decrypted) as PrescriptionData;
  }

  /**
   * Batch encrypt multiple records
   * 
   * @param records - Array of records to encrypt
   * @param fields - Fields to encrypt in each record
   * @returns Array of encrypted records
   */
  batchEncrypt<T extends DatabaseRecord>(records: T[], fields: string[]): T[] {
    return records.map(record => this.encryptObject(record, fields));
  }

  /**
   * Batch decrypt multiple records
   * 
   * @param records - Array of records to decrypt
   * @param fields - Fields to decrypt in each record
   * @returns Array of decrypted records
   */
  batchDecrypt<T extends DatabaseRecord>(records: T[], fields: string[]): T[] {
    return records.map(record => this.decryptObject(record, fields));
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get a nested value from an object using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      if (typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current;
  }

  /**
   * Set a nested value in an object using dot notation
   */
  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current: Record<string, unknown> = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Perform timing-safe comparison of two strings
   * Used for comparing authentication tags or hashes
   * 
   * @param a - First string to compare
   * @param b - Second string to compare
   * @returns true if strings are equal
   */
  timingSafeCompare(a: string, b: string): boolean {
    try {
      const bufA = Buffer.from(a, 'utf8');
      const bufB = Buffer.from(b, 'utf8');
      
      if (bufA.length !== bufB.length) {
        return false;
      }
      
      return timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  /**
   * Generate a secure random key
   * Useful for generating new master keys
   */
  generateKey(): string {
    return randomBytes(KEY_LENGTH).toString('hex');
  }

  /**
   * Get current key version
   */
  getCurrentVersion(): number {
    return this.currentVersion;
  }

  /**
   * Check if a value appears to be encrypted data
   */
  isEncrypted(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    
    try {
      const parsed = JSON.parse(value);
      return (
        typeof parsed === 'object' &&
        parsed !== null &&
        'ciphertext' in parsed &&
        'iv' in parsed &&
        'tag' in parsed &&
        'version' in parsed
      );
    } catch {
      return false;
    }
  }
}

// ============================================================================
// Integration Helpers
// ============================================================================

/**
 * Higher-order function for Supabase integration
 * Wraps a schema to automatically encrypt/decrypt specified fields
 * 
 * @example
 * ```typescript
 * const encryptedSchema = withEncryptedFields(patientSchema, ['ssn', 'medical_history']);
 * ```
 */
export function withEncryptedFields<T extends DatabaseRecord>(
  schema: T,
  fields: string[]
): {
  schema: T;
  encryptedFields: string[];
  encrypt: (data: DatabaseRecord) => DatabaseRecord;
  decrypt: (data: DatabaseRecord) => DatabaseRecord;
} {
  return {
    schema,
    encryptedFields: fields,
    encrypt: (data: DatabaseRecord) => encryptionService.encryptObject(data, fields),
    decrypt: (data: DatabaseRecord) => encryptionService.decryptObject(data, fields),
  };
}

/**
 * Creates a model with automatic encryption/decryption for specified fields
 * 
 * @example
 * ```typescript
 * const PatientModel = createEncryptedModel(['ssn', 'diagnosis', 'notes']);
 * const encrypted = PatientModel.encrypt({ ssn: '123-45-6789', diagnosis: 'Flu' });
 * const decrypted = PatientModel.decrypt(encrypted);
 * ```
 */
export function createEncryptedModel<T extends DatabaseRecord>(fields: string[]) {
  return {
    fields,
    
    /**
     * Encrypt specified fields in a record
     */
    encrypt(data: T): T {
      return encryptionService.encryptObject(data, fields);
    },

    /**
     * Decrypt specified fields in a record
     */
    decrypt(data: T): T {
      return encryptionService.decryptObject(data, fields);
    },

    /**
     * Encrypt multiple records
     */
    encryptMany(records: T[]): T[] {
      return encryptionService.batchEncrypt(records, fields);
    },

    /**
     * Decrypt multiple records
     */
    decryptMany(records: T[]): T[] {
      return encryptionService.batchDecrypt(records, fields);
    },

    /**
     * Check if a field is encrypted
     */
    isEncrypted(data: T, field: string): boolean {
      const value = data[field];
      return encryptionService.isEncrypted(value);
    },
  };
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global encryption service instance
 * Automatically initializes from environment variables
 */
export const encryptionService = new EncryptionService();

// ============================================================================
// Exports
// ============================================================================

export default encryptionService;

// Re-export types for convenience
export type { EncryptedData as defaultEncryptedData };

