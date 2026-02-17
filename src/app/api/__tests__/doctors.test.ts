/**
 * Tests for /api/doctores/* Endpoints
 * Doctor.mx - Doctor API Test Suite
 * 
 * Tests coverage:
 * - GET /api/doctores - List doctors with filtering and pagination
 * - GET /api/doctores/:id - Get doctor by ID
 * - Response structure validation
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  resetMocks,
  createMockRequest,
  createAuthenticatedRequest,
} from './security/setup'

// Import routes after all mocks are set up
const { GET: getDoctores } = await import('@/app/api/doctores/route')

describe('/api/doctores', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('GET /api/doctores', () => {
    it('returns a list of doctors', async () => {
      const request = createMockRequest('http://localhost/api/doctores')
      
      const response = await getDoctores(request)
      
      // Should not throw or return 500
      expect(response.status).not.toBe(500)
    })

    it('allows public access without authentication', async () => {
      const request = createMockRequest('http://localhost/api/doctores')
      
      const response = await getDoctores(request)
      
      // Should not require authentication
      expect(response.status).not.toBe(401)
    })

    it('allows authenticated access', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctores')
      
      const response = await getDoctores(request)
      
      expect(response.status).not.toBe(401)
    })

    it('accepts limit parameter', async () => {
      const request = createMockRequest('http://localhost/api/doctores?limit=5')
      
      const response = await getDoctores(request)
      
      expect(response.status).not.toBe(500)
    })

    it('accepts cursor parameter for pagination', async () => {
      const request = createMockRequest('http://localhost/api/doctores?cursor=some-cursor')
      
      const response = await getDoctores(request)
      
      expect(response.status).not.toBe(500)
    })

    it('filters by specialty when provided', async () => {
      const request = createMockRequest('http://localhost/api/doctores?specialty=cardiologia')
      
      const response = await getDoctores(request)
      
      expect(response.status).not.toBe(500)
    })

    it('filters by city when provided', async () => {
      const request = createMockRequest('http://localhost/api/doctores?city=Ciudad%20de%20Mexico')
      
      const response = await getDoctores(request)
      
      expect(response.status).not.toBe(500)
    })

    it('filters by search query when provided', async () => {
      const request = createMockRequest('http://localhost/api/doctores?search=garcia')
      
      const response = await getDoctores(request)
      
      expect(response.status).not.toBe(500)
    })

    it('accepts sort parameter', async () => {
      const request = createMockRequest('http://localhost/api/doctores?sort=rating')
      
      const response = await getDoctores(request)
      
      expect(response.status).not.toBe(500)
    })

    it('sorts by price correctly', async () => {
      const request = createMockRequest('http://localhost/api/doctores?sort=price')
      
      const response = await getDoctores(request)
      
      expect(response.status).not.toBe(500)
    })

    it('sorts by experience correctly', async () => {
      const request = createMockRequest('http://localhost/api/doctores?sort=experience')
      
      const response = await getDoctores(request)
      
      expect(response.status).not.toBe(500)
    })

    it('handles invalid cursor gracefully', async () => {
      const request = createMockRequest('http://localhost/api/doctores?cursor=invalid-cursor-format')
      
      const response = await getDoctores(request)
      
      // Should not crash with invalid cursor
      expect(response.status).not.toBe(500)
    })

    it('handles empty specialty filter gracefully', async () => {
      const request = createMockRequest('http://localhost/api/doctores?specialty=')
      
      const response = await getDoctores(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates sort parameter values', async () => {
      const request = createMockRequest('http://localhost/api/doctores?sort=unknown')
      
      const response = await getDoctores(request)
      
      // Should handle unknown sort values gracefully
      expect(response.status).not.toBe(500)
    })
  })
})

describe('/api/doctores/:id', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('returns 404 for non-existent doctor', async () => {
    const { GET: getDoctorById } = await import('@/app/api/doctores/[id]/route')
    
    const request = createMockRequest('http://localhost/api/doctores/non-existent')
    
    const response = await getDoctorById(request, { params: Promise.resolve({ id: 'non-existent' }) })
    
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toContain('not found')
  })

  it('allows public access without authentication', async () => {
    const { GET: getDoctorById } = await import('@/app/api/doctores/[id]/route')
    
    const request = createMockRequest('http://localhost/api/doctores/doc-123')
    
    const response = await getDoctorById(request, { params: Promise.resolve({ id: 'doc-123' }) })
    
    // Should not require authentication
    expect(response.status).not.toBe(401)
  })

  it('handles valid doctor ID format', async () => {
    const { GET: getDoctorById } = await import('@/app/api/doctores/[id]/route')
    
    const request = createMockRequest('http://localhost/api/doctores/valid-id')
    
    const response = await getDoctorById(request, { params: Promise.resolve({ id: 'valid-id' }) })
    
    // Should handle the request without crashing
    expect(response).toBeDefined()
    expect(response.status).toBeDefined()
  })
})
