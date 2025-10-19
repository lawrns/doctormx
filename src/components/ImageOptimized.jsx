import React, { useState, useRef, useEffect } from 'react';

const ImageOptimized = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  lazy = true,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={hasError ? placeholder : src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={lazy ? 'lazy' : 'eager'}
          {...props}
        />
      )}
    </div>
  );
};

// Optimized avatar component
export const OptimizedAvatar = ({ 
  src, 
  alt, 
  size = 40, 
  className = '',
  ...props 
}) => {
  return (
    <ImageOptimized
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      {...props}
    />
  );
};

// Optimized card image component
export const OptimizedCardImage = ({ 
  src, 
  alt, 
  className = '',
  ...props 
}) => {
  return (
    <ImageOptimized
      src={src}
      alt={alt}
      width="100%"
      height={200}
      className={`object-cover ${className}`}
      {...props}
    />
  );
};

// Optimized hero image component
export const OptimizedHeroImage = ({ 
  src, 
  alt, 
  className = '',
  ...props 
}) => {
  return (
    <ImageOptimized
      src={src}
      alt={alt}
      width="100%"
      height={400}
      className={`object-cover ${className}`}
      lazy={false}
      {...props}
    />
  );
};

export default ImageOptimized;

