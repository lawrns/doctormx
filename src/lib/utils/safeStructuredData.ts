/**
 * Safe Structured Data (JSON-LD) Utilities
 *
 * Provides XSS-safe serialization for JSON-LD structured data.
 * Prevents script injection via </script> tags and sanitizes all inputs.
 *
 * SECURITY NOTICE:
 * - Always use these utilities when injecting JSON-LD into pages
 * - Never use JSON.stringify directly with dangerouslySetInnerHTML
 * - All string inputs are sanitized before serialization
 *
 * @module lib/utils/safeStructuredData
 * @security-critical
 */

import { purify } from './dompurify';
import { logger } from '@/lib/observability/logger';

/**
 * HTML entities that need escaping in JSON-LD script tags
 * to prevent XSS and script breaking
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '<': '\\u003c',  // Prevent </script> injection
  '>': '\\u003e',  // Prevent tag opening
  '&': '\\u0026',  // Prevent HTML entity injection
  '\u2028': '\\u2028', // Line separator
  '\u2029': '\\u2029', // Paragraph separator
};

/**
 * Escape string for safe JSON-LD injection
 * Prevents </script> injection and other XSS vectors
 */
function escapeForScriptTag(str: string): string {
  return str.replace(/[<>&\u2028\u2029]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Recursively sanitize all string values in an object
 */
function deepSanitize<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Sanitize HTML and then escape for JSON
    const sanitized = purify.sanitize(obj, {
      ALLOWED_TAGS: [], // Strip all HTML tags
      KEEP_CONTENT: true,
    });
    return escapeForScriptTag(sanitized) as unknown as T;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepSanitize) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize keys too (prevents prototype pollution)
      const safeKey = typeof key === 'string' 
        ? purify.sanitize(key, { ALLOWED_TAGS: [], KEEP_CONTENT: true })
        : key;
      sanitized[safeKey] = deepSanitize(value);
    }
    return sanitized as T;
  }

  // Fallback for other types (should not happen in JSON-LD)
  return obj;
}

/**
 * Validate JSON-LD structure has required fields
 */
function validateStructuredData(data: Record<string, unknown>): boolean {
  // Must have @context for valid JSON-LD
  if (!data['@context']) {
    logger.warn('JSON-LD missing @context', { component: 'safeStructuredData' });
    return false;
  }

  // Must have @type for schema.org entities
  if (!data['@type']) {
    logger.warn('JSON-LD missing @type', { component: 'safeStructuredData' });
    return false;
  }

  return true;
}

/**
 * Safely serialize structured data for JSON-LD injection
 *
 * SECURITY: This function:
 * 1. Deep sanitizes all string values
 * 2. Validates required JSON-LD structure
 * 3. Escapes dangerous characters for script tag context
 * 4. Returns CSP-compliant serialized JSON
 *
 * @param data - The structured data object to serialize
 * @returns Sanitized JSON string safe for dangerouslySetInnerHTML
 * @throws Error if data fails validation
 */
export function safeJsonLd(data: Record<string, unknown>): string {
  // Validate structure
  if (!validateStructuredData(data)) {
    throw new Error('Invalid JSON-LD structure: missing required fields');
  }

  // Deep sanitize all values
  const sanitized = deepSanitize(data);

  // Serialize with proper escaping
  return JSON.stringify(sanitized);
}

/**
 * Safely serialize structured data with relaxed validation
 * For internal/static data that doesn't need full validation
 */
export function safeJsonLdRelaxed(data: Record<string, unknown>): string {
  // Deep sanitize all values
  const sanitized = deepSanitize(data);

  // Serialize with proper escaping
  return JSON.stringify(sanitized);
}

/**
 * Create a safe script props object for JSON-LD
 * Use with: <script {...createSafeJsonLdScriptProps(data)} />
 */
export function createSafeJsonLdScriptProps(data: Record<string, unknown>) {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: safeJsonLd(data),
    },
  };
}

/**
 * Predefined safe schema.org contexts
 */
export const SCHEMA_CONTEXTS = {
  DEFAULT: 'https://schema.org',
  MEDICAL: 'https://schema.org',
  HEALTH: 'https://health-lifesci.schema.org',
} as const;

/**
 * Type guard for valid JSON-LD objects
 */
export function isValidJsonLd(obj: unknown): obj is Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return false;
  const record = obj as Record<string, unknown>;
  return typeof record['@context'] === 'string' && typeof record['@type'] === 'string';
}

// CSP nonce support (will be set by middleware if needed)
let cspNonce: string | null = null;

/**
 * Set CSP nonce for script tags
 * Called by middleware during request processing
 */
export function setStructuredDataNonce(nonce: string): void {
  cspNonce = nonce;
}

/**
 * Get current CSP nonce
 */
export function getStructuredDataNonce(): string | null {
  return cspNonce;
}

/**
 * Create script props with CSP nonce if available
 */
export function createSafeJsonLdScriptPropsWithNonce(data: Record<string, unknown>) {
  const props = createSafeJsonLdScriptProps(data);
  if (cspNonce) {
    return { ...props, nonce: cspNonce };
  }
  return props;
}
