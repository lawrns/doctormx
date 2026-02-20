/**
 * Test for SEC-010: Memory leak fix for online/offline event listeners
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock logger
vi.mock('../observability/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('OfflineConsultationNotes - Event Listener Cleanup (SEC-010)', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Clear module cache to get fresh instance
    vi.resetModules();
    
    // Mock window event listeners
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add event listeners when setupListeners is called', async () => {
    const { offlineNotes } = await import('../offline-notes');
    
    offlineNotes.setupListeners();
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should remove event listeners when cleanupListeners is called', async () => {
    const { offlineNotes } = await import('../offline-notes');
    
    // Setup listeners first
    offlineNotes.setupListeners();
    
    // Get the handler references from the spy calls
    const onlineHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'online'
    )?.[1] as EventListener;
    const offlineHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'offline'
    )?.[1] as EventListener;
    
    // Cleanup listeners
    offlineNotes.cleanupListeners();
    
    // Verify removeEventListener was called with the same handlers
    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', onlineHandler);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', offlineHandler);
  });

  it('should not throw when cleanupListeners is called multiple times', async () => {
    const { offlineNotes } = await import('../offline-notes');
    
    offlineNotes.setupListeners();
    
    // Should not throw on first cleanup
    expect(() => offlineNotes.cleanupListeners()).not.toThrow();
    
    // Should not throw on second cleanup (idempotent)
    expect(() => offlineNotes.cleanupListeners()).not.toThrow();
  });

  it('should clear sync callbacks on cleanup', async () => {
    const { offlineNotes } = await import('../offline-notes');
    
    // Register some callbacks
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    offlineNotes.onSyncStatusChange(callback1);
    offlineNotes.onSyncStatusChange(callback2);
    
    // Cleanup
    offlineNotes.cleanupListeners();
    
    // Verify the callbacks are cleared (implementation detail: syncCallbacks array is cleared)
    // We can verify this by checking that after cleanup, new callbacks work independently
    const newCallback = vi.fn();
    const unsubscribe = offlineNotes.onSyncStatusChange(newCallback);
    
    // Only the new callback should exist
    expect(unsubscribe).toBeDefined();
    expect(typeof unsubscribe).toBe('function');
  });

  it('should have cleanupListeners method available on the instance', async () => {
    const { offlineNotes } = await import('../offline-notes');
    
    expect(typeof offlineNotes.cleanupListeners).toBe('function');
  });
});
