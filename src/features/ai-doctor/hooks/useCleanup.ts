import { useEffect, useRef, useCallback } from 'react';

interface CleanupHookReturn {
  addCleanup: (cleanupFn: () => void) => void;
  addTimeout: (callback: () => void, delay: number) => NodeJS.Timeout;
  addInterval: (callback: () => void, delay: number) => NodeJS.Interval;
  clearManagedTimeout: (timeoutId: NodeJS.Timeout) => void;
  clearManagedInterval: (intervalId: NodeJS.Interval) => void;
  cleanup: () => void;
  addPromiseCleanup: (promise: Promise<any>) => void;
  addEventListenerCleanup: (element: HTMLElement, event: string, handler: EventListener) => void;
}

export function useCleanup(): CleanupHookReturn {
  const cleanupFunctions = useRef<Array<() => void>>([]);
  const timeouts = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervals = useRef<Set<NodeJS.Interval>>(new Set());
  const promises = useRef<Set<Promise<any>>>(new Set());
  const abortControllers = useRef<Set<AbortController>>(new Set());

  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctions.current.push(cleanupFn);
  }, []);

  const addTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeoutId = setTimeout(() => {
      timeouts.current.delete(timeoutId);
      try {
        callback();
      } catch (error) {
        console.warn('Timeout callback failed:', error);
      }
    }, delay);
    timeouts.current.add(timeoutId);
    return timeoutId;
  }, []);

  const addInterval = useCallback((callback: () => void, delay: number): NodeJS.Interval => {
    const intervalId = setInterval(() => {
      try {
        callback();
      } catch (error) {
        console.warn('Interval callback failed:', error);
      }
    }, delay);
    intervals.current.add(intervalId);
    return intervalId;
  }, []);

  const clearManagedTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    if (timeouts.current.has(timeoutId)) {
      clearTimeout(timeoutId);
      timeouts.current.delete(timeoutId);
    }
  }, []);

  const clearManagedInterval = useCallback((intervalId: NodeJS.Interval) => {
    if (intervals.current.has(intervalId)) {
      clearInterval(intervalId);
      intervals.current.delete(intervalId);
    }
  }, []);

  const addPromiseCleanup = useCallback((promise: Promise<any>) => {
    promises.current.add(promise);
    
    // Create an abort controller for this promise
    const controller = new AbortController();
    abortControllers.current.add(controller);
    
    promise
      .finally(() => {
        promises.current.delete(promise);
        abortControllers.current.delete(controller);
      })
      .catch(() => {
        // Ignore promise rejection - we just want to track completion
      });
  }, []);

  const addEventListenerCleanup = useCallback((element: HTMLElement, event: string, handler: EventListener) => {
    element.addEventListener(event, handler);
    addCleanup(() => {
      element.removeEventListener(event, handler);
    });
  }, [addCleanup]);

  const cleanup = useCallback(() => {
    // Clear all timeouts
    timeouts.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    timeouts.current.clear();

    // Clear all intervals
    intervals.current.forEach(intervalId => {
      clearInterval(intervalId);
    });
    intervals.current.clear();

    // Abort any pending promises
    abortControllers.current.forEach(controller => {
      try {
        controller.abort();
      } catch (error) {
        console.warn('Failed to abort controller:', error);
      }
    });
    abortControllers.current.clear();
    promises.current.clear();

    // Run all custom cleanup functions
    cleanupFunctions.current.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    addCleanup,
    addTimeout,
    addInterval,
    clearManagedTimeout,
    clearManagedInterval,
    cleanup,
    addPromiseCleanup,
    addEventListenerCleanup
  };
}