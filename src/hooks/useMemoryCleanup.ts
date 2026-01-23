import { useEffect, useRef, useCallback } from 'react';

interface CleanupOptions {
  // Cleanup interval in milliseconds
  interval?: number;
  // Memory threshold in MB to trigger cleanup
  threshold?: number;
  // Enable console logging
  debug?: boolean;
}

/**
 * Hook for automatic memory cleanup
 * Helps prevent memory leaks in long-running components
 */
export const useMemoryCleanup = (
  cleanupFn?: () => void,
  options: CleanupOptions = {}
) => {
  const {
    interval = 60000, // 1 minute default
    threshold = 100,   // 100MB default threshold
    debug = false
  } = options;

  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const observersRef = useRef<Set<IntersectionObserver | MutationObserver>>(new Set());
  const eventListenersRef = useRef<Map<EventTarget, Map<string, EventListener>>>(new Map());

  // Get current memory usage (if available)
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize / 1048576, // Convert to MB
        totalJSHeapSize: memory.totalJSHeapSize / 1048576,
        jsHeapSizeLimit: memory.jsHeapSizeLimit / 1048576
      };
    }
    return null;
  }, []);

  // Log memory usage
  const logMemory = useCallback(() => {
    if (!debug) return;
    
    const memory = getMemoryUsage();
    if (memory) {
      console.log('[Memory]', {
        used: `${memory.usedJSHeapSize.toFixed(2)} MB`,
        total: `${memory.totalJSHeapSize.toFixed(2)} MB`,
        limit: `${memory.jsHeapSizeLimit.toFixed(2)} MB`,
        percentage: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)}%`
      });
    }
  }, [debug, getMemoryUsage]);

  // Register timer for cleanup
  const registerTimer = useCallback((timer: NodeJS.Timeout) => {
    timersRef.current.add(timer);
    return timer;
  }, []);

  // Register observer for cleanup
  const registerObserver = useCallback(<T extends IntersectionObserver | MutationObserver>(observer: T): T => {
    observersRef.current.add(observer);
    return observer;
  }, []);

  // Register event listener for cleanup
  const registerEventListener = useCallback((
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    target.addEventListener(type, listener, options);
    
    if (!eventListenersRef.current.has(target)) {
      eventListenersRef.current.set(target, new Map());
    }
    eventListenersRef.current.get(target)!.set(type, listener);
    
    return () => {
      target.removeEventListener(type, listener, options);
      const targetListeners = eventListenersRef.current.get(target);
      if (targetListeners) {
        targetListeners.delete(type);
        if (targetListeners.size === 0) {
          eventListenersRef.current.delete(target);
        }
      }
    };
  }, []);

  // Cleanup all registered resources
  const cleanup = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();

    // Disconnect all observers
    observersRef.current.forEach(observer => observer.disconnect());
    observersRef.current.clear();

    // Remove all event listeners
    eventListenersRef.current.forEach((listeners, target) => {
      listeners.forEach((listener, type) => {
        target.removeEventListener(type, listener);
      });
    });
    eventListenersRef.current.clear();

    // Call custom cleanup function
    cleanupFn?.();

    // Force garbage collection if available (Chrome DevTools)
    if (typeof (globalThis as any).gc === 'function') {
      (globalThis as any).gc();
    }

    if (debug) {
      console.log('[Memory] Cleanup completed');
      logMemory();
    }
  }, [cleanupFn, debug, logMemory]);

  // Periodic memory check and cleanup
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    if (interval > 0) {
      checkInterval = setInterval(() => {
        const memory = getMemoryUsage();
        
        if (memory && memory.usedJSHeapSize > threshold) {
          if (debug) {
            console.log(`[Memory] Threshold exceeded (${memory.usedJSHeapSize.toFixed(2)} MB > ${threshold} MB), triggering cleanup`);
          }
          cleanup();
        }
      }, interval);
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      cleanup();
    };
  }, [interval, threshold, cleanup, getMemoryUsage, debug]);

  return {
    registerTimer,
    registerObserver,
    registerEventListener,
    cleanup,
    getMemoryUsage,
    logMemory
  };
};

/**
 * Hook to clean up React refs
 */
export const useRefCleanup = <T extends HTMLElement>() => {
  const refs = useRef<Set<React.RefObject<T>>>(new Set());

  const registerRef = useCallback((ref: React.RefObject<T>) => {
    refs.current.add(ref);
    return ref;
  }, []);

  useEffect(() => {
    return () => {
      refs.current.forEach(ref => {
        if (ref.current) {
          // Clear any data attributes
          const element = ref.current;
          const attributes = element.getAttributeNames();
          attributes.forEach(attr => {
            if (attr.startsWith('data-')) {
              element.removeAttribute(attr);
            }
          });
        }
      });
      refs.current.clear();
    };
  }, []);

  return { registerRef };
};