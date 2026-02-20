/**
 * Mock utilities for next/headers
 * 
 * Use these mocks in API route tests to avoid "headers was called outside a request scope" errors.
 * 
 * Example usage:
 * ```ts
 * import { mockHeaders, mockCookies } from '@/lib/__tests__/mocks/next-headers'
 * 
 * vi.mock('next/headers', () => ({
 *   headers: mockHeaders,
 *   cookies: mockCookies,
 * }))
 * ```
 */

import { vi } from 'vitest'

/**
 * Mock function for headers() from next/headers
 * Returns a mock headers object with a get() method
 */
export const mockHeadersGet = vi.fn()

export const mockHeaders = vi.fn(() => 
  Promise.resolve({
    get: mockHeadersGet,
    entries: vi.fn().mockReturnValue([]),
    getSetCookie: vi.fn().mockReturnValue([]),
    has: vi.fn().mockReturnValue(false),
    keys: vi.fn().mockReturnValue([]),
    values: vi.fn().mockReturnValue([]),
    forEach: vi.fn(),
    [Symbol.iterator]: vi.fn().mockReturnValue([][Symbol.iterator]()),
  })
)

/**
 * Mock function for cookies() from next/headers
 * Returns a mock cookies object with getAll(), set(), and get() methods
 */
export const mockCookiesGetAll = vi.fn((): Array<{ name: string; value: string }> => [])
export const mockCookiesSet = vi.fn()
export const mockCookiesGet = vi.fn()

export const mockCookies = vi.fn(() =>
  Promise.resolve({
    getAll: mockCookiesGetAll,
    set: mockCookiesSet,
    get: mockCookiesGet,
    has: vi.fn().mockReturnValue(false),
    delete: vi.fn(),
  })
)

/**
 * Setup function to configure default mock behaviors
 * Call this in beforeEach to reset mocks
 */
export function setupNextHeadersMocks() {
  mockHeadersGet.mockReturnValue(null)
  mockCookiesGetAll.mockReturnValue([])
  mockCookiesGet.mockReturnValue(null)
}

/**
 * Helper to mock authentication cookie
 */
export function mockAuthCookie(token: string = 'mock-token') {
  mockCookiesGetAll.mockReturnValue([
    { name: 'sb-token', value: token },
  ])
}

/**
 * Helper to mock specific header
 */
export function mockHeader(name: string, value: string | null) {
  mockHeadersGet.mockImplementation((headerName: string) => {
    if (headerName.toLowerCase() === name.toLowerCase()) return value
    return null
  })
}
