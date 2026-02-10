/**
 * Pagination types for cursor-based pagination
 */

export interface PaginationParams {
  cursor?: string | null
  limit?: number
  direction?: 'forward' | 'backward'
}

export interface PaginationMeta {
  next_cursor: string | null
  prev_cursor: string | null
  has_more: boolean
  has_prev: boolean
  total_count?: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

export interface CursorData {
  id: string
  created_at?: string
  [key: string]: unknown
}

export const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
}
