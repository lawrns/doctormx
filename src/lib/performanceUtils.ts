/**
 * Performance Utilities
 * 
 * A collection of utilities to help optimize website performance.
 */

/**
 * Lazy loads scripts by dynamically creating script tags when needed
 * @param src Script source URL
 * @param callback Function to call when script is loaded
 * @param id Optional ID for the script tag
 */
export const loadScriptOnDemand = (src: string, callback?: () => void, id?: string): HTMLScriptElement => {
  const existingScript = id ? document.getElementById(id) as HTMLScriptElement : null;

  if (existingScript) {
    if (callback) callback();
    return existingScript;
  }

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  if (id) script.id = id;

  if (callback) {
    script.onload = () => {
      callback();
    };
  }

  document.body.appendChild(script);
  return script;
};

/**
 * Adds browser caching headers to the specified paths
 * This function should be used on the server-side to add caching headers
 */
export const getCacheControlHeaders = (path: string): { [key: string]: string } => {
  // Static assets - long cache time
  if (/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot|ico)$/.test(path)) {
    return {
      'Cache-Control': 'public, max-age=31536000, immutable' // 1 year
    };
  }

  // API responses - short cache time
  if (path.startsWith('/api/')) {
    return {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' // 1 minute, 5 minutes on CDN
    };
  }

  // Dynamic HTML pages - no cache
  if (path.endsWith('.html') || !path.includes('.')) {
    return {
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' // No browser cache, 1 minute on CDN
    };
  }

  // Default - moderate cache
  return {
    'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400' // 10 minutes, 1 hour on CDN
  };
};

/**
 * Prefetches critical resources when the browser is idle
 * @param urls Array of URLs to prefetch
 */
export const prefetchResources = (urls: string[]): void => {
  if ('requestIdleCallback' in window) {
    // @ts-ignore - TypeScript doesn't recognize requestIdleCallback
    window.requestIdleCallback(() => {
      urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    }, 2000); // 2 seconds delay
  }
};

/**
 * Tracks Core Web Vitals metrics
 * @returns Object with methods to log and retrieve performance metrics
 */
export const webVitalsMonitor = () => {
  const metrics: Record<string, any> = {};

  // Report metrics to analytics
  const reportMetric = (name: string, value: number) => {
    metrics[name] = value;
    
    // This would typically send the data to your analytics service
    // Example: analyticsService.trackEvent('web_vital', { name, value });
    console.log(`Web Vital: ${name} = ${value}`);
  };

  // Initialize CLS monitoring
  const initCLS = () => {
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];
    
    const entryHandler = (entry: any) => {
      if (!entry.hadRecentInput) {
        const firstEntry = clsEntries[0];
        const lastEntry = clsEntries[clsEntries.length - 1];
        
        // Only count if less than 1s or 5s gap between entries
        if (firstEntry && entry.startTime - lastEntry.startTime < 1000 && entry.startTime - firstEntry.startTime < 5000) {
          clsValue += entry.value;
        }
        
        clsEntries.push(entry);
      }
    };
    
    const observer = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach(entryHandler);
    });
    
    observer.observe({ type: 'layout-shift', buffered: true });
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportMetric('CLS', clsValue);
      }
    });
  };

  // Initialize LCP monitoring
  const initLCP = () => {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      reportMetric('LCP', lastEntry.startTime);
    });
    
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  };

  // Initialize FID monitoring
  const initFID = () => {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEventTiming;
        reportMetric('FID', fidEntry.processingStart - fidEntry.startTime);
      });
    });
    
    observer.observe({ type: 'first-input', buffered: true });
  };

  // Start monitoring if browser supports it
  if ('PerformanceObserver' in window) {
    if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      initCLS();
    }
    
    if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
      initLCP();
    }
    
    if (PerformanceObserver.supportedEntryTypes.includes('first-input')) {
      initFID();
    }
  }

  return {
    getMetrics: () => metrics
  };
};

export default {
  loadScriptOnDemand,
  getCacheControlHeaders,
  prefetchResources,
  webVitalsMonitor
};