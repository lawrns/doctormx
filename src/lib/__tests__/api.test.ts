/**
 * @vitest-environment happy-dom
 */

// ============================================================================
// CLIENT-SIDE API REQUEST HANDLER TESTS
// ============================================================================
// Comprehensive test suite for client-side API request functionality.
// Tests CSRF token inclusion, error handling, and convenience methods.
// ============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  apiRequest,
  get,
  post,
  put,
  patch,
  del,
  getCSRFToken,
  type APIError,
} from '../api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch as any

describe('Client-side API Request Handler', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getCSRFToken', () => {
    it('should return token from cookies', () => {
      document.cookie = 'csrf_token=test-token-123; other=value'

      const token = getCSRFToken()

      expect(token).toBe('test-token-123')
    })

    it('should return undefined when token not found', () => {
      document.cookie = 'other=value'

      const token = getCSRFToken()

      expect(token).toBeUndefined()
    })

    it('should return undefined when no cookies', () => {
      document.cookie = ''

      const token = getCSRFToken()

      expect(token).toBeUndefined()
    })
  })

  describe('apiRequest', () => {
    it('should make GET request without CSRF token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ data: 'test' }),
      })

      const result = await apiRequest('/api/test')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch.mock.calls[0][1].method).toBe('GET')
      expect(result.data).toEqual({ data: 'test' })
      expect(result.status).toBe(200)
    })

    it('should include CSRF token for POST requests', async () => {
      document.cookie = 'csrf_token=test-csrf-token'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers(),
        json: async () => ({ id: 1 }),
      })

      await apiRequest('/api/test', {
        method: 'POST',
        body: { name: 'test' },
      })

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs[1].headers['x-csrf-token']).toBe('test-csrf-token')
    })

    it('should stringify object bodies', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers(),
        json: async () => ({ id: 1 }),
      })

      await apiRequest('/api/test', {
        method: 'POST',
        body: { name: 'test', value: 123 },
      })

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs[1].body).toBe('{"name":"test","value":123}')
    })

    it('should handle FormData bodies', async () => {
      const formData = new FormData()
      formData.append('file', 'test')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers(),
        json: async () => ({ id: 1 }),
      })

      await apiRequest('/api/test', {
        method: 'POST',
        body: formData,
      })

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs[1].body).toBe(formData)
      expect(callArgs[1].headers['Content-Type']).toBeUndefined()
    })

    it('should throw error when CSRF token missing for POST', async () => {
      document.cookie = ''

      await expect(
        apiRequest('/api/test', {
          method: 'POST',
          body: { name: 'test' },
        })
      ).rejects.toThrow('CSRF token not found')
    })

    it('should skip CSRF when skipCSRF is true', async () => {
      document.cookie = ''
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers(),
        json: async () => ({ id: 1 }),
      })

      await apiRequest('/api/test', {
        method: 'POST',
        body: { name: 'test' },
        skipCSRF: true,
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Bad Request', message: 'Invalid input' }),
      })

      await expect(apiRequest('/api/test')).rejects.toThrow('Invalid input')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'))

      await expect(apiRequest('/api/test')).rejects.toThrow('Network error')
    })

    it('should handle timeout errors', async () => {
      mockFetch.mockImplementationOnce(() =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AbortError')), 31000)
        })
      )

      await expect(apiRequest('/api/test')).rejects.toThrow('Request timeout')
    })

    it('should support different response types', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: async () => 'plain text response',
      })

      const result = await apiRequest('/api/test', { responseType: 'text' })

      expect(result.data).toBe('plain text response')
    })

    it('should merge custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ data: 'test' }),
      })

      await apiRequest('/api/test', {
        headers: {
          'X-Custom-Header': 'custom-value',
          'Authorization': 'Bearer token',
        },
      })

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs[1].headers['X-Custom-Header']).toBe('custom-value')
      expect(callArgs[1].headers['Authorization']).toBe('Bearer token')
    })
  })

  describe('Convenience Methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ success: true }),
      })
    })

    it('get() should make GET request', async () => {
      await get('/api/test')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch.mock.calls[0][1].method).toBe('GET')
    })

    it('post() should make POST request', async () => {
      document.cookie = 'csrf_token=test-token'
      await post('/api/test', { name: 'test' })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch.mock.calls[0][1].method).toBe('POST')
    })

    it('put() should make PUT request', async () => {
      document.cookie = 'csrf_token=test-token'
      await put('/api/test', { name: 'test' })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch.mock.calls[0][1].method).toBe('PUT')
    })

    it('patch() should make PATCH request', async () => {
      document.cookie = 'csrf_token=test-token'
      await patch('/api/test', { name: 'test' })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch.mock.calls[0][1].method).toBe('PATCH')
    })

    it('del() should make DELETE request', async () => {
      document.cookie = 'csrf_token=test-token'
      await del('/api/test')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch.mock.calls[0][1].method).toBe('DELETE')
    })
  })

  describe('Error Handling', () => {
    it('should create proper APIError for HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Not Found', code: 'NOT_FOUND' }),
      })

      try {
        await apiRequest('/api/test')
        expect.fail('Should have thrown an error')
      } catch (error) {
        const apiError = error as APIError
        expect(apiError.message).toBe('Not Found')
        expect(apiError.status).toBe(404)
        expect(apiError.code).toBe('NOT_FOUND')
      }
    })

    it('should handle non-JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'Internal Server Error',
      })

      try {
        await apiRequest('/api/test')
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect((error as Error).message).toBe('Internal Server Error')
      }
    })

    it('should include response status in error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Unauthorized' }),
      })

      try {
        await apiRequest('/api/test')
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect((error as APIError).status).toBe(401)
      }
    })
  })

  describe('URL Handling', () => {
    it('should handle absolute URLs', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ data: 'test' }),
      })

      await get('https://api.example.com/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.any(Object)
      )
    })

    it('should handle relative URLs', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ data: 'test' }),
      })

      await get('/api/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.any(Object)
      )
    })
  })

  describe('CSRF Token Inclusion', () => {
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'] as const

    stateChangingMethods.forEach(method => {
      it(`should include CSRF token for ${method}`, async () => {
        document.cookie = 'csrf_token=test-token'
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({ success: true }),
        })

        await apiRequest('/api/test', { method })

        const callArgs = mockFetch.mock.calls[0]
        expect(callArgs[1].headers['x-csrf-token']).toBe('test-token')
      })
    })

    it('should not include CSRF token for GET', async () => {
      document.cookie = 'csrf_token=test-token'
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ success: true }),
      })

      await apiRequest('/api/test', { method: 'GET' })

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs[1].headers['x-csrf-token']).toBeUndefined()
    })

    it('should not include CSRF token for HEAD', async () => {
      document.cookie = 'csrf_token=test-token'
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ success: true }),
      })

      await apiRequest('/api/test', { method: 'HEAD' })

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs[1].headers['x-csrf-token']).toBeUndefined()
    })

    it('should handle case-insensitive method names', async () => {
      document.cookie = 'csrf_token=test-token'
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ success: true }),
      })

      await apiRequest('/api/test', { method: 'post' as any })

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs[1].headers['x-csrf-token']).toBe('test-token')
    })
  })
})
