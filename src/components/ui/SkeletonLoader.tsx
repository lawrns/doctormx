import React from 'react';

export interface SkeletonLoaderProps {
  type?: 'text' | 'circle' | 'rectangle' | 'avatar' | 'card' | 'button' | 'input' | 'doctor-card';
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
  className?: string;
}

/**
 * SkeletonLoader component for showing loading states
 * 
 * @param type - The type of skeleton loader to display
 * @param width - Width of the skeleton
 * @param height - Height of the skeleton
 * @param circle - Whether the skeleton should be a circle
 * @param count - Number of skeleton items to display
 * @param className - Additional CSS classes
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  width,
  height,
  circle = false,
  count = 1,
  className = '',
}) => {
  // Convert width and height to string with px if they are numbers
  const widthStyle = width ? (typeof width === 'number' ? `${width}px` : width) : undefined;
  const heightStyle = height ? (typeof height === 'number' ? `${height}px` : height) : undefined;

  // Base styles
  const baseStyle: React.CSSProperties = {
    width: widthStyle,
    height: heightStyle,
    borderRadius: circle ? '50%' : '0.25rem',
  };

  // Render different types of skeletons
  const renderSkeleton = () => {
    switch (type) {
      case 'circle':
        return (
          <div
            className={`animate-pulse bg-gray-200 rounded-full ${className}`}
            style={{ ...baseStyle, width: widthStyle || '2.5rem', height: heightStyle || '2.5rem' }}
          />
        );

      case 'avatar':
        return (
          <div className={`flex items-center space-x-4 ${className}`}>
            <div
              className="animate-pulse bg-gray-200 rounded-full"
              style={{ width: widthStyle || '3rem', height: heightStyle || '3rem' }}
            />
            <div className="space-y-2 flex-1">
              <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4" />
              <div className="animate-pulse h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        );

      case 'card':
        return (
          <div className={`animate-pulse bg-white rounded-lg shadow-sm p-6 ${className}`}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="rounded-full bg-gray-200 h-12 w-12" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="mt-4 flex justify-between">
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        );

      case 'doctor-card':
        return (
          <div className={`bg-white rounded-lg shadow-sm overflow-hidden p-6 ${className}`}>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 flex justify-center mb-4 md:mb-0">
                <div className="w-32 h-32 rounded-full bg-gray-200"></div>
              </div>
              <div className="md:w-2/4 md:pl-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="md:w-1/4 mt-4 md:mt-0">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        );

      case 'button':
        return (
          <div
            className={`animate-pulse bg-gray-200 rounded-md ${className}`}
            style={{ ...baseStyle, width: widthStyle || '6rem', height: heightStyle || '2.5rem' }}
          />
        );

      case 'input':
        return (
          <div
            className={`animate-pulse bg-gray-200 rounded-md ${className}`}
            style={{ ...baseStyle, width: widthStyle || '100%', height: heightStyle || '2.5rem' }}
          />
        );

      case 'rectangle':
        return (
          <div
            className={`animate-pulse bg-gray-200 rounded ${className}`}
            style={{ ...baseStyle, width: widthStyle || '100%', height: heightStyle || '1.5rem' }}
          />
        );

      case 'text':
      default:
        return (
          <div className={`space-y-2 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-4 bg-gray-200 rounded"
                style={{
                  ...baseStyle,
                  width: widthStyle || (i === count - 1 && count > 1 ? '80%' : '100%'),
                  height: heightStyle || '1rem',
                }}
              />
            ))}
          </div>
        );
    }
  };

  return renderSkeleton();
};

export default SkeletonLoader;