import { useState, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * LazyImage component for optimized image loading
 * 
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Placeholder display during load
 * - Fade-in animation on load
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc = '/placeholders/image-placeholder.png',
  className = '',
  width,
  height
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Check if IntersectionObserver is available
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '200px' } // Start loading image when it's 200px from viewport
      );

      // Get the current element to observe
      const element = document.getElementById(`lazy-img-${src.replace(/[^a-zA-Z0-9]/g, '')}`);
      if (element) {
        observer.observe(element);
      }

      // Cleanup
      return () => {
        if (element) {
          observer.unobserve(element);
        }
        observer.disconnect();
      };
    } else {
      // Fallback for browsers without IntersectionObserver support
      setIsInView(true);
    }
  }, [src]);

  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div 
      id={`lazy-img-${src.replace(/[^a-zA-Z0-9]/g, '')}`}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder image */}
      {!isLoaded && (
        <img
          src={placeholderSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          width={width}
          height={height}
        />
      )}

      {/* Actual image (only load when in viewport) */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          loading="lazy"
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export default LazyImage;