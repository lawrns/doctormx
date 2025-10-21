import Icon from './Icon';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <Icon name="arrow-path" size={size} className="text-primary-600" />
    </div>
  );
}