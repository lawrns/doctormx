import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  borderRadius?: string | number;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  height,
  width,
  borderRadius = '0.375rem',
  animate = true,
}) => {
  return (
    <div
      className={`bg-gray-200 ${animate ? 'animate-pulse' : ''} ${className}`}
      style={{
        height,
        width,
        borderRadius,
      }}
    />
  );
};

interface SkeletonTextProps {
  className?: string;
  lines?: number;
  lineHeight?: string | number;
  animate?: boolean;
  spacing?: string | number;
  lastLineWidth?: string | number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  className = '',
  lines = 3,
  lineHeight = '1rem',
  animate = true,
  spacing = '0.75rem',
  lastLineWidth = '75%',
}) => {
  return (
    <div className={`space-y-[${spacing}] ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="w-full"
          height={lineHeight}
          animate={animate}
          width={index === lines - 1 && lastLineWidth ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
};

interface SkeletonCircleProps {
  className?: string;
  size?: string | number;
  animate?: boolean;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  className = '',
  size = '3rem',
  animate = true,
}) => {
  return (
    <Skeleton
      className={`rounded-full ${className}`}
      height={size}
      width={size}
      animate={animate}
      borderRadius="9999px"
    />
  );
};

interface SkeletonCardProps {
  className?: string;
  height?: string | number;
  animate?: boolean;
  hasImage?: boolean;
  imageHeight?: string | number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  height = 'auto',
  animate = true,
  hasImage = true,
  imageHeight = '12rem',
}) => {
  return (
    <div
      className={`bg-white shadow rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    >
      {hasImage && (
        <Skeleton
          className="w-full"
          height={imageHeight}
          animate={animate}
          borderRadius="0"
        />
      )}
      <div className="p-4 space-y-4">
        <Skeleton className="w-3/4" height="1.5rem" animate={animate} />
        <SkeletonText lines={2} animate={animate} />
        <div className="flex justify-between">
          <Skeleton className="w-1/4" height="1rem" animate={animate} />
          <Skeleton className="w-1/4" height="1rem" animate={animate} />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;