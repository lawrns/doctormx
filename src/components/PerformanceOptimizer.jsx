import { useEffect, useState } from 'react';

export default function PerformanceOptimizer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observers = [];

    // Preload critical images
    const preloadImages = [
      '/images/doctor.png',
      '/images/cellphone.png',
      '/images/simeon.webp',
      '/images/simeontest.webp'
    ];

    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Preload critical fonts
    const preloadFonts = [
      'Inter:wght@400;500;600;700',
      'Inter:wght@400;500;600;700&display=swap'
    ];

    preloadFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `https://fonts.googleapis.com/css2?family=${font}`;
      document.head.appendChild(link);
    });

    // Set up performance monitoring
    if ('performance' in window && 'PerformanceObserver' in window) {
      try {
        const performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              console.log('LCP:', entry.startTime);
            }
            if (entry.entryType === 'first-input') {
              console.log('FID:', entry.processingStart - entry.startTime);
            }
          }
        });

        performanceObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
        observers.push(performanceObserver);
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }

    // Lazy load non-critical components
    const lazyLoadComponents = () => {
      const elements = document.querySelectorAll('[data-lazy]');
      
      if ('IntersectionObserver' in window) {
        const intersectionObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target;
              const componentName = element.dataset.lazy;
              
              // Load component dynamically
              import(`../components/${componentName}.jsx`).then(module => {
                element.innerHTML = module.default;
              });
              
              intersectionObserver.unobserve(element);
            }
          });
        });

        elements.forEach(element => intersectionObserver.observe(element));
        observers.push(intersectionObserver);
      } else {
        // Fallback: load all components immediately if IntersectionObserver is not supported
        elements.forEach(element => {
          const componentName = element.dataset.lazy;
          import(`../components/${componentName}.jsx`).then(module => {
            element.innerHTML = module.default;
          });
        });
      }
    };

    // Run lazy loading after initial render
    setTimeout(lazyLoadComponents, 1000);

    // Show performance indicator in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }

    return () => {
      // Cleanup all observers
      observers.forEach(observer => {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect();
        }
      });
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 text-xs text-neutral-600">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
        <span>Performance Optimized</span>
      </div>
    </div>
  );
}
