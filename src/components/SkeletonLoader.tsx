import React from 'react';

interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = 'h-4',
  width = 'w-full',
  className = '',
  rounded = 'md',
}) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-dark-border animate-pulse ${height} ${width} rounded-${rounded} ${className}`}
      aria-hidden="true"
    />
  );
};

export const DoctorCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm overflow-hidden p-6" aria-hidden="true">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 flex justify-center mb-4 md:mb-0">
          <Skeleton height="h-32" width="w-32" rounded="full" />
        </div>
        <div className="md:w-2/4 md:pl-6">
          <Skeleton height="h-6" width="w-3/4" className="mb-2" />
          <Skeleton height="h-4" width="w-1/2" className="mb-3" />
          <Skeleton height="h-4" width="w-1/4" className="mb-3" />
          <Skeleton height="h-4" width="w-2/3" className="mb-3" />
          <div className="flex flex-wrap gap-2">
            <Skeleton height="h-6" width="w-24" />
            <Skeleton height="h-6" width="w-24" />
          </div>
        </div>
        <div className="md:w-1/4 mt-4 md:mt-0">
          <Skeleton height="h-4" width="w-1/2" className="mb-2" />
          <Skeleton height="h-8" width="w-3/4" className="mb-4" />
          <Skeleton height="h-10" width="w-full" className="mb-2" />
          <Skeleton height="h-10" width="w-full" />
        </div>
      </div>
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6 mb-8" aria-hidden="true">
      {/* Header section */}
      <div className="flex flex-col md:flex-row mb-8">
        <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
          <Skeleton height="h-40" width="w-40" rounded="full" />
        </div>
        <div className="md:w-2/4 md:pl-6">
          <Skeleton height="h-8" width="w-3/4" className="mb-2" />
          <Skeleton height="h-6" width="w-1/2" className="mb-4" />
          <Skeleton height="h-4" width="w-full" className="mb-3" />
          <Skeleton height="h-4" width="w-full" className="mb-3" />
          <div className="flex flex-wrap gap-2 mt-4">
            <Skeleton height="h-8" width="w-28" className="rounded-full" />
            <Skeleton height="h-8" width="w-28" className="rounded-full" />
          </div>
        </div>
        <div className="md:w-1/4 flex flex-col items-center">
          <Skeleton height="h-6" width="w-full" className="mb-2" />
          <Skeleton height="h-10" width="w-full" className="mb-4" />
          <Skeleton height="h-12" width="w-full" className="rounded-lg" />
        </div>
      </div>
      
      {/* Content sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Skeleton height="h-8" width="w-1/4" className="mb-4" />
          <Skeleton height="h-4" width="w-full" className="mb-2" />
          <Skeleton height="h-4" width="w-full" className="mb-2" />
          <Skeleton height="h-4" width="w-3/4" className="mb-8" />
          
          <Skeleton height="h-8" width="w-1/4" className="mb-4" />
          <div className="grid grid-cols-2 gap-2 mb-8">
            <Skeleton height="h-6" width="w-full" className="mb-2" />
            <Skeleton height="h-6" width="w-full" className="mb-2" />
            <Skeleton height="h-6" width="w-full" className="mb-2" />
            <Skeleton height="h-6" width="w-full" className="mb-2" />
          </div>
        </div>
        
        <div>
          <Skeleton height="h-8" width="w-1/2" className="mb-4" />
          <Skeleton height="h-40" width="w-full" className="rounded-lg mb-6" />
          <Skeleton height="h-8" width="w-1/2" className="mb-4" />
          <Skeleton height="h-40" width="w-full" className="rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const SearchResultsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(count)].map((_, index) => (
        <DoctorCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default {
  Skeleton,
  DoctorCardSkeleton,
  ProfileSkeleton,
  SearchResultsSkeleton,
};
