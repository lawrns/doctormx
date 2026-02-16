/**
 * Security Headers Test Suite
 * Tests that all required security headers are present in responses
 */

import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '../../src/middleware'

describe('Security Headers', () => {
  it('should include Content-Security-Policy header', async () => {
    const request = new NextRequest('http://localhost:3000/', {
      method: 'GET'
    })
    
    const response = await middleware(request)
    const csp = response.headers.get('content-security-policy')
    
    expect(csp).toBeTruthy()
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain('js.stripe.com')
  })

  it('should include Strict-Transport-Security header', async () => {
    const request = new NextRequest('http://localhost:3000/', {
      method: 'GET'
    })
    
    const response = await middleware(request)
    const hsts = response.headers.get('strict-transport-security')
    
    expect(hsts).toBeTruthy()
    expect(hsts).toContain('max-age=63072000')
    expect(hsts).toContain('includeSubDomains')
    expect(hsts).toContain('preload')
  })

  it('should include X-Frame-Options header', async () => {
    const request = new NextRequest('http://localhost:3000/', {
      method: 'GET'
    })
    
    const response = await middleware(request)
    const xFrame = response.headers.get('x-frame-options')
    
    expect(xFrame).toBe('DENY')
  })

  it('should include X-Content-Type-Options header', async () => {
    const request = new NextRequest('http://localhost:3000/', {
      method: 'GET'
    })
    
    const response = await middleware(request)
    const xContentType = response.headers.get('x-content-type-options')
    
    expect(xContentType).toBe('nosniff')
  })

  it('should include Referrer-Policy header', async () => {
    const request = new NextRequest('http://localhost:3000/', {
      method: 'GET'
    })
    
    const response = await middleware(request)
    const referrer = response.headers.get('referrer-policy')
    
    expect(referrer).toBe('strict-origin-when-cross-origin')
  })

  it('should include Permissions-Policy header', async () => {
    const request = new NextRequest('http://localhost:3000/', {
      method: 'GET'
    })
    
    const response = await middleware(request)
    const permissions = response.headers.get('permissions-policy')
    
    expect(permissions).toBeTruthy()
    expect(permissions).toContain('camera=(self)')
    expect(permissions).toContain('microphone=(self)')
  })

  it('should remove X-Powered-By header', async () => {
    const request = new NextRequest('http://localhost:3000/', {
      method: 'GET'
    })
    
    const response = await middleware(request)
    const poweredBy = response.headers.get('x-powered-by')
    
    expect(poweredBy).toBeNull()
  })

  it('should handle suspicious user agents', async () => {
    const request = new NextRequest('http://localhost:3000/wp-admin/config.php', {
      method: 'GET',
      headers: {
        'user-agent': 'sqlmap/1.0'
      }
    })
    
    const response = await middleware(request)
    
    // Should return 404 for suspicious paths
    expect(response.status).toBe(404)
  })
})

describe('Feature Flags', () => {
  it('should export required functions', async () => {
    const { isFeatureEnabled, requireFeature, getAllFlags, hasBetaAccess } = await import('../../src/lib/feature-flags')
    
    expect(typeof isFeatureEnabled).toBe('function')
    expect(typeof requireFeature).toBe('function')
    expect(typeof getAllFlags).toBe('function')
    expect(typeof hasBetaAccess).toBe('function')
  })
})

describe('Security Audit Logger', () => {
  it('should export required functions', async () => {
    const { 
      logSecurityEvent, 
      logAuthEvent, 
      logDataAccess, 
      detectSuspiciousActivity,
      getUserSecuritySummary 
    } = await import('../../src/lib/security/audit-logger')
    
    expect(typeof logSecurityEvent).toBe('function')
    expect(typeof logAuthEvent).toBe('function')
    expect(typeof logDataAccess).toBe('function')
    expect(typeof detectSuspiciousActivity).toBe('function')
    expect(typeof getUserSecuritySummary).toBe('function')
  })
})
