import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  sizes?: string;
  priority?: boolean;
  blurDataURL?: string;
}

/**
 * Enhanced LazyImage component optimized for Mexican mobile networks
 * 
 * Features:
 * - WebP format with PNG/JPG fallbacks
 * - Responsive srcSet for different screen densities
 * - Blur placeholder for smoother loading experience
 * - Lazy loading with IntersectionObserver
 * - Optimized for 3G networks
 * - Mexican cultural context awareness
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc = '/images/doctor-placeholder.png',
  className = '',
  width,
  height,
  sizes = '100vw',
  priority = false,
  blurDataURL
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const [imageSrc, setImageSrc] = useState(priority ? src : '');
  const [hasWebPSupport, setHasWebPSupport] = useState<boolean | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check WebP support
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, 1, 1);
        const dataURL = canvas.toDataURL('image/webp');
        setHasWebPSupport(dataURL.indexOf('data:image/webp') === 0);
      } else {
        setHasWebPSupport(false);
      }
    };
    checkWebPSupport();
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsInView(true);
              setImageSrc(src);
              observer.disconnect();
            }
          });
        },
        { 
          rootMargin: '300px', // Start loading earlier for 3G networks
          threshold: 0.1
        }
      );

      const element = imgRef.current?.parentElement;
      if (element) {
        observer.observe(element);
      }

      return () => {
        if (element) {
          observer.unobserve(element);
        }
        observer.disconnect();
      };
    } else {
      // Fallback for older browsers
      setIsInView(true);
      setImageSrc(src);
    }
  }, [src, priority]);

  // Generate responsive srcSet
  const generateSrcSet = (baseSrc: string) => {
    const extension = baseSrc.split('.').pop();
    const baseName = baseSrc.replace(`.${extension}`, '');
    
    if (hasWebPSupport) {
      return `${baseName}.webp 1x, ${baseName}@2x.webp 2x`;
    }
    return `${baseSrc} 1x, ${baseName}@2x.${extension} 2x`;
  };

  // Handle image load with performance monitoring
  const handleImageLoad = () => {
    setIsLoaded(true);
    // Track load time for Mexican network performance monitoring
    if (window.performance && window.performance.now) {
      const loadTime = window.performance.now();
      console.debug(`[DoctorMX] Image loaded in ${loadTime.toFixed(2)}ms:`, src);
    }
  };

  // Handle image error with fallback
  const handleImageError = () => {
    if (hasWebPSupport && imageSrc.includes('.webp')) {
      // Fallback to original format if WebP fails
      const fallbackSrc = src.replace('.webp', '.png').replace('.webp', '.jpg');
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Blur placeholder for smooth loading */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Standard placeholder */}
      {!blurDataURL && !isLoaded && (
        <div className="absolute inset-0 bg-emerald-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Main image with WebP support and responsive srcSet */}
      {(isInView || priority) && imageSrc && (
        <picture>
          {hasWebPSupport !== false && (
            <source
              srcSet={generateSrcSet(imageSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp'))}
              sizes={sizes}
              type="image/webp"
            />
          )}
          <img
            ref={imgRef}
            src={imageSrc}
            srcSet={generateSrcSet(imageSrc)}
            sizes={sizes}
            alt={alt}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            width={width}
            height={height}
            style={{
              filter: isLoaded ? 'none' : 'blur(0px)',
            }}
          />
        </picture>
      )}
    </div>
  );
};

export default LazyImage;