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

import { LIMITS } from '@/lib/constants'

export const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: LIMITS.PAGINATION_DEFAULT_PAGE_SIZE,
  MAX_LIMIT: LIMITS.PAGINATION_MAX_LIMIT,
  MIN_LIMIT: LIMITS.PAGINATION_MIN_LIMIT,
}

