/**
 * SEC-009: Metrics Cleanup Test
 * Verifies that setInterval is properly cleaned up to prevent memory leaks
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { startMetricsFlush, stopMetricsFlush, initMetrics } from '../metrics'

describe('SEC-009: Metrics Interval Cleanup', () => {
  beforeEach(() => {
    // Reset state before each test
    stopMetricsFlush()
  })

  afterEach(() => {
    // Ensure cleanup after each test
    stopMetricsFlush()
    vi.restoreAllMocks()
  })

  it('startMetricsFlush should return a cleanup function', () => {
    const cleanup = startMetricsFlush()
    
    expect(typeof cleanup).toBe('function')
    
    // Cleanup should not throw
    expect(() => cleanup()).not.toThrow()
  })

  it('initMetrics should return a cleanup function', () => {
    const cleanup = initMetrics()
    
    expect(typeof cleanup).toBe('function')
    
    // Cleanup should not throw
    expect(() => cleanup()).not.toThrow()
  })

  it('cleanup function should stop the interval', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    
    const cleanup = startMetricsFlush()
    cleanup()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('stopMetricsFlush should be idempotent (safe to call multiple times)', () => {
    startMetricsFlush()
    
    // Should not throw when called multiple times
    expect(() => {
      stopMetricsFlush()
      stopMetricsFlush()
      stopMetricsFlush()
    }).not.toThrow()
  })

  it('should handle SSR environment gracefully', () => {
    // Simulate SSR by temporarily removing setInterval
    const originalSetInterval = global.setInterval
    // @ts-expect-error - Simulating SSR
    global.setInterval = undefined
    
    const cleanup = startMetricsFlush()
    
    // Should return a no-op function in SSR
    expect(typeof cleanup).toBe('function')
    expect(() => cleanup()).not.toThrow()
    
    // Restore
    global.setInterval = originalSetInterval
  })
})
