import React from 'react';

const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    text: 'h-4',
    title: 'h-6',
    avatar: 'rounded-full',
    button: 'h-10',
    card: 'h-32',
    image: 'h-48',
    line: 'h-1',
  };
  
  const variantClasses = variants[variant] || variants.text;
  
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  
  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={style}
      {...props}
    />
  );
};

// Convenience components for common skeleton patterns
export const TextSkeleton = ({ lines = 1, className = '', ...props }) => (
  <div className={`space-y-2 ${className}`} {...props}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton key={index} variant="text" />
    ))}
  </div>
);

export const CardSkeleton = ({ className = '', ...props }) => (
  <div className={`p-6 border border-gray-200 rounded-lg ${className}`} {...props}>
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton variant="avatar" width="40px" height="40px" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="title" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4, className = '', ...props }) => (
  <div className={`space-y-3 ${className}`} {...props}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const ListSkeleton = ({ items = 5, className = '', ...props }) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        <Skeleton variant="avatar" width="40px" height="40px" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = ({ className = '', ...props }) => (
  <div className={`space-y-6 ${className}`} {...props}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <Skeleton variant="title" width="200px" />
      <Skeleton variant="button" width="120px" />
    </div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg">
          <Skeleton variant="text" width="60%" className="mb-2" />
          <Skeleton variant="title" width="40%" />
        </div>
      ))}
    </div>
    
    {/* Content Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

export default Skeleton;

