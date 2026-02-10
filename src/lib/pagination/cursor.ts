/**
 * Cursor encoding and decoding utilities
 * Uses base64 encoding for safe URL transmission
 */

import type { CursorData } from './types'

/**
 * Encode cursor data into a base64 string
 */
export function encodeCursor(data: CursorData): string {
  try {
    const jsonString = JSON.stringify(data)
    const base64 = Buffer.from(jsonString, 'utf-8').toString('base64')
    // Make URL safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  } catch (error) {
    throw new Error('Failed to encode cursor')
  }
}

/**
 * Decode a base64 cursor string into cursor data
 */
export function decodeCursor(cursor: string): CursorData {
  try {
    // Restore base64 padding
    let base64 = cursor.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }

    const jsonString = Buffer.from(base64, 'base64').toString('utf-8')
    const data = JSON.parse(jsonString) as CursorData

    if (!data.id) {
      throw new Error('Invalid cursor: missing id')
    }

    return data
  } catch (error) {
    throw new Error('Invalid cursor format')
  }
}

/**
 * Validate cursor format
 */
export function isValidCursor(cursor: string): boolean {
  try {
    decodeCursor(cursor)
    return true
  } catch {
    return false
  }
}

/**
 * Create a cursor from an item
 */
export function createCursor(id: string, createdAt?: string, additionalData?: Record<string, unknown>): string {
  const data: CursorData = {
    id,
    ...(createdAt && { created_at: createdAt }),
    ...additionalData,
  }
  return encodeCursor(data)
}

/**
 * Extract ID from cursor
 */
export function extractCursorId(cursor: string): string | null {
  try {
    const data = decodeCursor(cursor)
    return data.id
  } catch {
    return null
  }
}
