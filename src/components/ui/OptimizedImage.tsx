import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized Image Component
 * - Lazy loading with Intersection Observer
 * - Progressive loading with blur placeholder
 * - Responsive image sizing
 * - WebP format support with fallback
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Create a low-quality placeholder
  const defaultBlurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGZpbHRlciBpZD0iYSI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMiIvPjwvZmlsdGVyPjwvZGVmcz48cGF0aCBmaWxsPSIjZTBlN2ZmIiBkPSJNMCAwaDQwdjQwSDB6IiBmaWx0ZXI9InVybCgjYSkiLz48L3N2Zz4=';

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  // Generate srcSet for responsive images
  const generateSrcSet = (src: string) => {
    const baseSrc = src.replace(/\.[^.]+$/, '');
    const ext = src.match(/\.[^.]+$/)?.[0] || '';
    
    return `
      ${baseSrc}-320w${ext} 320w,
      ${baseSrc}-640w${ext} 640w,
      ${baseSrc}-768w${ext} 768w,
      ${baseSrc}-1024w${ext} 1024w,
      ${baseSrc}${ext} 1280w
    `.trim();
  };

  // Check WebP support
  const supportsWebP = () => {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
  };

  const imageSrc = isInView ? src : undefined;
  const shouldUseWebP = supportsWebP() && !src.endsWith('.webp');
  const webpSrc = shouldUseWebP ? src.replace(/\.[^.]+$/, '.webp') : src;

  if (error) {
    return (
      <div 
        className={cn(
          'bg-gray-200 flex items-center justify-center',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Error loading image</span>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <img
          src={blurDataURL || defaultBlurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {isInView && (
        <picture>
          {shouldUseWebP && (
            <source 
              type="image/webp" 
              srcSet={generateSrcSet(webpSrc)}
            />
          )}
          <source 
            srcSet={generateSrcSet(src)}
          />
          <img
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              className
            )}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        </picture>
      )}
    </div>
  );
};

// Preload critical images
export const preloadImage = (src: string) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};