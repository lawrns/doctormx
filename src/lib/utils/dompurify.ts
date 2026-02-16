/**
 * DOMPurify Server-Side Configuration
 *
 * This module provides a server-safe DOMPurify instance.
 * Uses JSDOM on server-side to create a window for DOMPurify.
 *
 * SERVER-ONLY: This file uses require('jsdom') which only works server-side.
 * Do not import this file in client components ('use client').
 *
 * Usage in Server Components:
 * ```tsx
 * import { purify } from '@/lib/utils/dompurify'
 * const clean = purify.sanitize(dirtyInput)
 * ```
 *
 * @module lib/utils/dompurify
 * @server-only
 */

import createDOMPurify from 'dompurify';

// Singleton pattern for DOMPurify instance
let purifyInstance: ReturnType<typeof createDOMPurify> | null = null;

/**
 * Get a DOMPurify instance configured for server-side use
 *
 * On first call, creates a JSDOM window and initializes DOMPurify.
 * Subsequent calls return the cached instance.
 *
 * @returns DOMPurify instance with sanitize method
 */
export function getDOMPurify(): ReturnType<typeof createDOMPurify> {
  if (purifyInstance) {
    return purifyInstance;
  }

  // Create JSDOM window for server-side DOMPurify
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { JSDOM } = require('jsdom');
  const window = new JSDOM('').window;
  purifyInstance = createDOMPurify(window);

  return purifyInstance;
}

// Export the singleton instance for convenience
export const purify = getDOMPurify();

/**
 * Sanitize HTML string to prevent XSS attacks
 *
 * @param dirty - The potentially dirty HTML string
 * @returns Clean HTML safe to render
 */
export function sanitize(dirty: string): string {
  return purify.sanitize(dirty);
}

/**
 * Sanitize HTML string for use in structured data (JSON-LD)
 *
 * @param dirty - The potentially dirty HTML string
 * @returns Clean HTML safe for JSON serialization
 */
export function sanitizeForStructuredData(dirty: string): string {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Strip all tags for structured data
    KEEP_CONTENT: true,
  });
}
