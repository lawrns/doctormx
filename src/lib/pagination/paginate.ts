/**
 * Pagination helper functions
 */

import type { PaginationParams, PaginationMeta, PaginatedResult } from './types'
import { PAGINATION_DEFAULTS } from './types'

/**
 * Parse and validate pagination parameters from a request
 */
export function parsePaginationParams(searchParams: URLSearchParams): Required<Omit<PaginationParams, 'direction'>> & { direction: PaginationParams['direction'] } {
  const rawCursor = searchParams.get('cursor')
  const rawLimit = searchParams.get('limit')
  const rawDirection = searchParams.get('direction')

  let cursor: string | null = null
  if (rawCursor) {
    cursor = rawCursor
  }

  let limit = PAGINATION_DEFAULTS.DEFAULT_LIMIT
  if (rawLimit) {
    const parsedLimit = parseInt(rawLimit, 10)
    if (!isNaN(parsedLimit)) {
      limit = Math.min(
        Math.max(parsedLimit, PAGINATION_DEFAULTS.MIN_LIMIT),
        PAGINATION_DEFAULTS.MAX_LIMIT
      )
    }
  }

  const direction: PaginationParams['direction'] =
    rawDirection === 'backward' ? 'backward' : 'forward'

  return { cursor, limit, direction }
}

/**
 * Create pagination metadata for a result set
 */
export function createPaginationMeta(params: {
  itemsReturned: number
  limit: number
  hasMore: boolean
  nextCursor?: string | null
  prevCursor?: string | null
  totalCount?: number
}): PaginationMeta {
  const { itemsReturned, limit, hasMore, nextCursor, prevCursor, totalCount } = params

  return {
    next_cursor: hasMore ? (nextCursor ?? null) : null,
    prev_cursor: prevCursor ?? null,
    has_more: hasMore,
    has_prev: Boolean(prevCursor),
    total_count: totalCount,
    limit,
  }
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(params: {
  data: T[]
  meta: PaginationMeta
}): PaginatedResult<T> {
  return {
    data: params.data,
    meta: params.meta,
  }
}

/**
 * Build pagination response with next cursor
 */
export function buildPaginatedResponse<T>(params: {
  data: T[]
  limit: number
  totalCount?: number
  getNextCursor: (item: T) => string | null
  getPrevCursor?: (item: T) => string | null
}): PaginatedResult<T> {
  const { data, limit, totalCount, getNextCursor, getPrevCursor } = params

  const hasMore = data.length === limit
  const nextCursor = hasMore && data.length > 0 ? getNextCursor(data[data.length - 1]) : null
  const prevCursor = getPrevCursor && data.length > 0 ? getPrevCursor(data[0]) : null

  return createPaginatedResponse({
    data,
    meta: createPaginationMeta({
      itemsReturned: data.length,
      limit,
      hasMore,
      nextCursor: nextCursor ?? undefined,
      prevCursor: prevCursor ?? undefined,
      totalCount,
    }),
  })
}

/**
 * Extract limit from pagination params with defaults
 */
export function getLimit(limit?: number): number {
  if (limit === undefined) {
    return PAGINATION_DEFAULTS.DEFAULT_LIMIT
  }

  return Math.min(
    Math.max(limit, PAGINATION_DEFAULTS.MIN_LIMIT),
    PAGINATION_DEFAULTS.MAX_LIMIT
  )
}

/**
 * Calculate range for offset-based pagination (legacy support)
 */
export function calculateOffset(page: number, limit: number): number {
  const pageNumber = Math.max(1, page)
  return (pageNumber - 1) * limit
}
