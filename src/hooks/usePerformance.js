import { useEffect, useState, useCallback, useRef } from 'react';

// Hook for measuring component performance
export const usePerformance = (componentName) => {
  const [renderTime, setRenderTime] = useState(0);
  const [isSlowRender, setIsSlowRender] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration);
      
      if (duration > 16) { // More than one frame (60fps)
        setIsSlowRender(true);
        // Note: Performance warnings are logged via the logger in production
      }
    };
  }, [componentName]);

  return { renderTime, isSlowRender };
};

// Hook for debouncing expensive operations
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for throttling expensive operations
export const useThrottle = (callback, delay) => {
  const [isThrottled, setIsThrottled] = useState(false);
  const timeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useCallback((...args) => {
    if (!isThrottled) {
      callback(...args);
      setIsThrottled(true);
      
      timeoutRef.current = setTimeout(() => {
        setIsThrottled(false);
        timeoutRef.current = null;
      }, delay);
    }
  }, [callback, delay, isThrottled]);

  return throttledCallback;
};

// Hook for memoizing expensive calculations
export const useMemoizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

// Hook for lazy loading with intersection observer
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
};

// Hook for measuring bundle size impact
export const useBundleAnalyzer = () => {
  const [bundleInfo, setBundleInfo] = useState(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // In development, we can measure bundle impact
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        setBundleInfo({
          loadTime,
          timestamp: new Date().toISOString(),
        });
      };
    }
  }, []);

  return bundleInfo;
};

// Hook for optimizing re-renders
export const useOptimizedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const [isUpdating, setIsUpdating] = useState(false);
  const rafRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const optimizedSetState = useCallback((newState) => {
    if (!isUpdating) {
      setIsUpdating(true);
      rafRef.current = requestAnimationFrame(() => {
        setState(newState);
        setIsUpdating(false);
        rafRef.current = null;
      });
    }
  }, [isUpdating]);

  return [state, optimizedSetState];
};

// Hook for preloading resources
export const usePreload = (urls) => {
  const [loadedUrls, setLoadedUrls] = useState(new Set());

  useEffect(() => {
    const preloadPromises = urls.map(url => {
      return new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.onload = () => {
          setLoadedUrls(prev => new Set([...prev, url]));
          resolve();
        };
        link.onerror = resolve; // Still resolve on error to not block
        document.head.appendChild(link);
      });
    });

    Promise.all(preloadPromises);
  }, [urls]);

  return loadedUrls;
};

// Hook for measuring memory usage (development only)
export const useMemoryUsage = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const updateMemoryInfo = () => {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        });
      };

      updateMemoryInfo();
      const interval = setInterval(updateMemoryInfo, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  return memoryInfo;
};

export default {
  usePerformance,
  useDebounce,
  useThrottle,
  useMemoizedCallback,
  useIntersectionObserver,
  useBundleAnalyzer,
  useOptimizedState,
  usePreload,
  useMemoryUsage,
};
