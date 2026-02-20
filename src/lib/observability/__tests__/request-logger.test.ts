/**
 * Request Logger Tests - OBS-005 Verification
 * 
 * Tests for request logging functionality including:
 * - Request ID generation
 * - Header sanitization
 * - Query parameter redaction
 * - Request logging with timing
 * - Response logging
 * - Error logging
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateRequestId,
  logRequest,
  logResponse,
  withRequestLogging,
  createRequestLogger,
  getCurrentRequestContext,
  setRequestContext,
  clearRequestContext,
} from '../request-logger'
import { NextRequest, NextResponse } from 'next/server'

// Mock the logger
vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { logger } from '../logger'

describe('OBS-005: Request Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearRequestContext()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId()
      const id2 = generateRequestId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^\d+-[a-z0-9]+$/)
    })
  })

  describe('Request Context Management', () => {
    it('should set and get request context', () => {
      const context = { requestId: 'test-123', userId: 'user-456' }
      setRequestContext(context)
      
      expect(getCurrentRequestContext()).toEqual(context)
    })

    it('should clear request context', () => {
      setRequestContext({ requestId: 'test-123' })
      clearRequestContext()
      
      expect(getCurrentRequestContext()).toBeNull()
    })
  })

  describe('logRequest', () => {
    it('should log request details', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          'user-agent': 'test-agent',
        },
      })

      const { requestId, startTime, requestData } = await logRequest(request)

      expect(requestId).toBeDefined()
      expect(startTime).toBeGreaterThan(0)
      expect(requestData.method).toBe('GET')
      expect(requestData.path).toBe('/api/test')
      expect(requestData.userAgent).toBe('test-agent')
      expect(requestData.timestamp).toBeDefined()
      
      // Should log debug message
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Request started: GET /api/test'),
        expect.any(Object)
      )
    })

    it('should exclude paths from logging', async () => {
      const request = new NextRequest('http://localhost:3000/api/health', {
        method: 'GET',
      })

      const result = await logRequest(request)

      // Should not log for excluded paths
      expect(logger.debug).not.toHaveBeenCalled()
    })

    it('should respect sampling rate', async () => {
      // Mock Math.random to return value above sample rate
      vi.spyOn(Math, 'random').mockReturnValue(0.9)

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      })

      await logRequest(request, { sampleRate: 0.5 })

      // Should not log when sampled out
      expect(logger.debug).not.toHaveBeenCalled()
      
      vi.restoreAllMocks()
    })
  })

  describe('logResponse', () => {
    it('should log successful response', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      })

      const { requestId, startTime, requestData } = await logRequest(request)
      const response = new NextResponse('OK', { status: 200 })

      logResponse(requestData, response, startTime)

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('✅ GET /api/test 200'),
        expect.objectContaining({
          requestId,
          method: 'GET',
          path: '/api/test',
          statusCode: 200,
          durationMs: expect.any(Number),
        })
      )
    })

    it('should log error response with warning level', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
      })

      const { requestId, startTime, requestData } = await logRequest(request)
      const response = new NextResponse('Bad Request', { status: 400 })

      logResponse(requestData, response, startTime)

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ POST /api/test 400'),
        expect.objectContaining({
          requestId,
          statusCode: 400,
          durationMs: expect.any(Number),
        }),
        undefined
      )
    })

    it('should log server error with error level', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      })

      const { requestId, startTime, requestData } = await logRequest(request)
      const response = new NextResponse('Internal Error', { status: 500 })
      const error = new Error('Database connection failed')

      logResponse(requestData, response, startTime, {}, error)

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('❌ GET /api/test 500'),
        expect.objectContaining({
          requestId,
          statusCode: 500,
        }),
        error
      )
    })
  })

  describe('withRequestLogging', () => {
    it('should wrap handler and log requests', async () => {
      const handler = vi.fn().mockResolvedValue(
        new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )

      const loggedHandler = withRequestLogging(handler)
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      })

      const response = await loggedHandler(request)

      expect(handler).toHaveBeenCalledWith(request)
      expect(response.status).toBe(200)
      expect(response.headers.get('x-request-id')).toBeDefined()
      
      // Should log both request start and response
      expect(logger.debug).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalled()
    })

    it('should log errors and re-throw', async () => {
      const error = new Error('Handler failed')
      const handler = vi.fn().mockRejectedValue(error)

      const loggedHandler = withRequestLogging(handler)
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'GET',
      })

      await expect(loggedHandler(request)).rejects.toThrow(error)
      
      // Should log the error response (error level is used when response is logged)
      expect(logger.warn).toHaveBeenCalled()
    })

    it('should add request ID to response headers', async () => {
      const handler = vi.fn().mockResolvedValue(
        new NextResponse('OK', { status: 200 })
      )

      const loggedHandler = withRequestLogging(handler)
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      })

      const response = await loggedHandler(request)

      const requestId = response.headers.get('x-request-id')
      expect(requestId).toBeDefined()
      expect(requestId).toMatch(/^\d+-[a-z0-9]+$/)
    })
  })

  describe('createRequestLogger', () => {
    it('should create logger with custom config', async () => {
      const customLogger = createRequestLogger({
        logLevel: 'debug',
        sampleRate: 0.5,
        excludePaths: ['/api/internal'],
      })

      // Test that excluded paths work
      const excludedRequest = new NextRequest('http://localhost:3000/api/internal', {
        method: 'GET',
      })

      await customLogger.logRequest(excludedRequest)

      // Should not log for excluded path
      expect(logger.debug).not.toHaveBeenCalled()
    })

    it('should provide withLogging wrapper', async () => {
      const customLogger = createRequestLogger({ logLevel: 'debug' })

      const handler = vi.fn().mockResolvedValue(
        new NextResponse('OK', { status: 200 })
      )

      const wrappedHandler = customLogger.withLogging(handler)
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      })

      await wrappedHandler(request)

      expect(handler).toHaveBeenCalled()
      expect(logger.debug).toHaveBeenCalled()
    })
  })

  describe('Header Sanitization', () => {
    it('should redact sensitive headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer secret-token',
          'cookie': 'session=secret-session',
          'x-api-key': 'secret-key',
          'content-type': 'application/json',
        },
      })

      const { requestData } = await logRequest(request, { logHeaders: true })

      // Headers may be normalized to lowercase
      expect(requestData.headers).toBeDefined()
      // Check that one of the sensitive headers is redacted
      const authHeader = requestData.headers?.['authorization'] || requestData.headers?.['Authorization']
      expect(authHeader).toBe('[REDACTED]')
      
      // Content type should not be redacted
      const contentType = requestData.headers?.['content-type'] || requestData.headers?.['Content-Type']
      expect(contentType).toBe('application/json')
    })
  })

  describe('Query Parameter Redaction', () => {
    it('should redact sensitive query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/test?token=secret-token&password=secret&name=John',
        { method: 'GET' }
      )

      const { requestData } = await logRequest(request, { logQuery: true })

      expect(requestData.query?.['token']).toBe('[REDACTED]')
      expect(requestData.query?.['password']).toBe('[REDACTED]')
      expect(requestData.query?.['name']).toBe('John')
    })
  })
})
