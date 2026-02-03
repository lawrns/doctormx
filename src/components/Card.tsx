import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'elevated' | 'bordered' | 'ghost'

interface CardProps {
  children: ReactNode
  variant?: CardVariant
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

const variantClasses = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white shadow-md',
  bordered: 'bg-white border-2 border-gray-200',
  ghost: 'bg-transparent border border-transparent',
}

const paddingClasses = {
  none: '',
  sm: 'p-3 lg:p-4',
  md: 'p-4 lg:p-6',
  lg: 'p-6 lg:p-8',
}

export function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg',
        variantClasses[variant],
        hover && 'transition-shadow hover:shadow-md',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children?: ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export function CardHeader({ children, title, subtitle, className = '' }: CardHeaderProps) {
  if (children) {
    return <div className={cn('mb-4', className)}>{children}</div>
  }
  
  return (
    <div className={cn('mb-4', className)}>
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={className}>{children}</div>
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={cn('mt-4 pt-4 border-t border-gray-100', className)}>{children}</div>
}

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ title, value, icon, trend, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm mt-1',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
