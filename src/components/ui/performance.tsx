/**
 * Performance-Optimized UI Components for DoctorMX
 * Loading states, lazy loading, and optimization patterns
 */

import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { Loader2, Heart, Activity, Brain, AlertCircle } from './icons';

// Medical-themed loading states
interface MedicalLoadingProps {
  type?: 'consultation' | 'analysis' | 'diagnosis' | 'prescription' | 'general';
  message?: string;
  className?: string;
}

export const MedicalLoadingSpinner = ({ 
  type = 'general', 
  message, 
  className = '' 
}: MedicalLoadingProps) => {
  const loadingConfig = {
    consultation: {
      icon: <Heart className="w-6 h-6 text-red-500 animate-pulse" />,
      color: 'text-red-500',
      defaultMessage: 'Iniciando consulta médica...'
    },
    analysis: {
      icon: <Activity className="w-6 h-6 text-primary-500 animate-pulse" />,
      color: 'text-primary-500', 
      defaultMessage: 'Analizando síntomas...'
    },
    diagnosis: {
      icon: <Brain className="w-6 h-6 text-purple-500 animate-pulse" />,
      color: 'text-purple-500',
      defaultMessage: 'Procesando diagnóstico...'
    },
    prescription: {
      icon: <AlertCircle className="w-6 h-6 text-green-500 animate-pulse" />,
      color: 'text-green-500',
      defaultMessage: 'Generando receta médica...'
    },
    general: {
      icon: <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />,
      color: 'text-primary-500',
      defaultMessage: 'Cargando...'
    }
  };

  const config = loadingConfig[type];

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="mb-4">
        {config.icon}
      </div>
      <p className={`text-sm font-medium ${config.color}`}>
        {message || config.defaultMessage}
      </p>
    </div>
  );
};

// Skeleton loading components
export const SkeletonText = ({ lines = 1, className = '' }: { lines?: number; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className="h-4 bg-neutral-200 rounded animate-pulse"
        style={{ width: `${Math.random() * 40 + 60}%` }}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`p-6 bg-white rounded-xl shadow-card ${className}`}>
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 bg-neutral-200 rounded-full animate-pulse" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-neutral-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-neutral-200 rounded animate-pulse w-full" />
          <div className="h-3 bg-neutral-200 rounded animate-pulse w-5/6" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonDoctorCard = ({ className = '' }: { className?: string }) => (
  <div className={`p-6 bg-white rounded-xl shadow-card border-l-4 border-neutral-200 ${className}`}>
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 bg-neutral-200 rounded-full animate-pulse" />
      <div className="flex-1">
        <div className="h-5 bg-neutral-200 rounded animate-pulse w-2/3 mb-2" />
        <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2 mb-1" />
        <div className="h-3 bg-neutral-200 rounded animate-pulse w-1/3" />
      </div>
    </div>
    
    <div className="mt-4 grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center">
          <div className="h-6 bg-neutral-200 rounded animate-pulse mb-1" />
          <div className="h-3 bg-neutral-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
    
    <div className="mt-6 flex gap-2">
      <div className="flex-1 h-10 bg-neutral-200 rounded-lg animate-pulse" />
      <div className="w-10 h-10 bg-neutral-200 rounded-lg animate-pulse" />
    </div>
  </div>
);

// Progressive image loading with medical context
interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  medicalType?: 'profile' | 'diagnostic' | 'facility' | 'general';
  onLoad?: () => void;
  onError?: () => void;
}

export const ProgressiveImage = ({ 
  src, 
  alt, 
  placeholderSrc,
  className = '',
  medicalType = 'general',
  onLoad,
  onError
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const defaultPlaceholders = {
    profile: '/images/doctor-placeholder.png',
    diagnostic: '/images/diagnostic-placeholder.png', 
    facility: '/images/facility-placeholder.png',
    general: '/images/placeholder.png'
  };

  if (hasError) {
    return (
      <div className={`bg-neutral-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">Imagen no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse">
          {placeholderSrc && (
            <img 
              src={placeholderSrc || defaultPlaceholders[medicalType]}
              alt={alt}
              className="w-full h-full object-cover opacity-50"
            />
          )}
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
};

// Lazy loading wrapper for components
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyWrapper = ({ children, fallback, className = '' }: LazyWrapperProps) => (
  <Suspense fallback={fallback || <MedicalLoadingSpinner />}>
    <div className={className}>
      {children}
    </div>
  </Suspense>
);

// Performance-optimized list with virtual scrolling simulation
interface VirtualizedListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  visibleCount?: number;
  className?: string;
}

export const VirtualizedList = ({ 
  items, 
  renderItem, 
  itemHeight = 80,
  visibleCount = 10,
  className = ''
}: VirtualizedListProps) => {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(visibleCount);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    const newEndIndex = Math.min(newStartIndex + visibleCount, items.length);
    
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [itemHeight, visibleCount, items.length]);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div 
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
      style={{ maxHeight: visibleCount * itemHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => 
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
};

// Debounced search input for performance
interface DebouncedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
}

export const DebouncedSearch = ({ 
  onSearch, 
  placeholder = 'Buscar...', 
  delay = 300,
  className = ''
}: DebouncedSearchProps) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay, onSearch]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 border border-border-light rounded-lg focus:border-border-focus focus:ring-2 focus:ring-border-focus focus:ring-opacity-20 outline-none transition-all duration-200 ${className}`}
    />
  );
};

// Optimized data table for medical records
interface OptimizedTableProps {
  data: any[];
  columns: Array<{
    key: string;
    header: string;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const OptimizedTable = ({ 
  data, 
  columns, 
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  className = ''
}: OptimizedTableProps) => {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-10 bg-neutral-200 rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border-light">
            {columns.map((column) => (
              <th key={column.key} className="text-left py-3 px-4 font-semibold text-text-secondary">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-border-light hover:bg-background-secondary transition-colors">
              {columns.map((column) => (
                <td key={column.key} className="py-3 px-4">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 100) { // Log slow components
        console.warn(`${componentName} took ${duration.toFixed(2)}ms to render`);
      }
    };
  }, [componentName]);
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    }, options);

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, callback, options]);

  return setRef;
};

export default {
  MedicalLoadingSpinner,
  SkeletonText,
  SkeletonCard,
  SkeletonDoctorCard,
  ProgressiveImage,
  LazyWrapper,
  VirtualizedList,
  DebouncedSearch,
  OptimizedTable,
  usePerformanceMonitor,
  useIntersectionObserver
};