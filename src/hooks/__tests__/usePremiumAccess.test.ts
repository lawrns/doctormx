/**
 * usePremiumAccess Hook Tests
 * Using Factory Pattern for test data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePremiumAccess, useHasPremiumAccess, usePremiumFeatures } from '../usePremiumAccess'
import { UserFactory } from '@/lib/__tests__/factories'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock logger
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('HOOK: usePremiumAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Access Check', () => {
    it('should return initial loading state', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ hasAccess: true, needsUpgrade: false }),
      })

      const { result } = renderHook(() => usePremiumAccess('clinical_copilot'))

      expect(result.current.isLoading).toBe(true)
      expect(result.current.hasAccess).toBe(false)
      expect(result.current.showPaywall).toBe(false)
    })

    it('should detect premium access', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ hasAccess: true, needsUpgrade: false }),
      })

      const { result } = renderHook(() => usePremiumAccess('clinical_copilot'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasAccess).toBe(true)
      expect(result.current.showPaywall).toBe(false)
    })

    it('should detect no access and show paywall', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ hasAccess: false, needsUpgrade: true }),
      })

      const { result } = renderHook(() => usePremiumAccess('clinical_copilot'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasAccess).toBe(false)
      expect(result.current.showPaywall).toBe(true)
    })

    it('should detect no access without paywall (feature disabled)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ hasAccess: false, needsUpgrade: false }),
      })

      const { result } = renderHook(() => usePremiumAccess('beta_feature'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasAccess).toBe(false)
      expect(result.current.showPaywall).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => usePremiumAccess('clinical_copilot'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasAccess).toBe(false)
      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('Network error')
    })

    it('should handle non-OK responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const { result } = renderHook(() => usePremiumAccess('clinical_copilot'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasAccess).toBe(false)
      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('Manual Check', () => {
    it('should not auto-check when autoCheck is false', () => {
      const { result } = renderHook(() => usePremiumAccess('clinical_copilot', false))

      expect(result.current.isLoading).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should allow manual check', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ hasAccess: true, needsUpgrade: false }),
      })

      const { result } = renderHook(() => usePremiumAccess('clinical_copilot', false))

      expect(result.current.isLoading).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()

      // Trigger manual check
      await result.current.checkAccess()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/premium/status?feature=clinical_copilot')
      expect(result.current.hasAccess).toBe(true)
    })

    it('should refresh access status', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ hasAccess: false, needsUpgrade: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ hasAccess: true, needsUpgrade: false }),
        })

      const { result } = renderHook(() => usePremiumAccess('clinical_copilot'))

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false)
      })

      // User upgrades, refresh
      await result.current.refresh()

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(true)
      })
    })
  })

  describe('URL Encoding', () => {
    it('should properly encode feature names with special characters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ hasAccess: true, needsUpgrade: false }),
      })

      renderHook(() => usePremiumAccess('feature with spaces & symbols'))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/premium/status?feature=feature%20with%20spaces%20%26%20symbols'
        )
      })
    })
  })
})

describe('HOOK: useHasPremiumAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return boolean access status', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ hasAccess: true, needsUpgrade: false }),
    })

    const { result } = renderHook(() => useHasPremiumAccess('analytics'))

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })
})

describe('HOOK: usePremiumFeatures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should check multiple features', async () => {
    // Use mockImplementation to return different values based on feature
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('copilot') || url.includes('export')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ hasAccess: true, needsUpgrade: false }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ hasAccess: false, needsUpgrade: true }),
      })
    })

    const { result } = renderHook(() =>
      usePremiumFeatures(['copilot', 'analytics', 'export'])
    )

    await waitFor(() => {
      expect(Object.keys(result.current)).toHaveLength(3)
    })

    expect(result.current.copilot).toBe(true)
    expect(result.current.analytics).toBe(false)
    expect(result.current.export).toBe(true)
  })

  it('should handle failures gracefully', async () => {
    // All requests fail
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => usePremiumFeatures(['feature1', 'feature2']))

    await waitFor(() => {
      expect(Object.keys(result.current)).toHaveLength(2)
    })

    // All features should be false on failure
    expect(result.current.feature1).toBe(false)
    expect(result.current.feature2).toBe(false)
  })
})
