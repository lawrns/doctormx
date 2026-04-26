'use client'

import { ReactNode } from 'react'

type CardVariant = 'default' | 'elevated' | 'bordered' | 'ghost'

interface CardProps {
  children: ReactNode
  variant?: CardVariant
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

const variantClasses = {
  default: 'bg-card border border-border shadow-[0_1px_2px_rgba(15,37,95,0.04)]',
  elevated: 'bg-card border border-border shadow-[0_10px_28px_-22px_rgba(15,37,95,0.2)]',
  bordered: 'bg-card border border-border',
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
      className={`
        rounded-[var(--public-radius-card)]
        ${variantClasses[variant]}
        ${hover ? 'transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_10px_28px_-22px_rgba(15,37,95,0.2)]' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// Card Header
interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h3 className="font-display text-lg lg:text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  )
}

// Card Body
interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={className}>{children}</div>
}

// Card Footer
interface CardFooterProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right' | 'between'
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
}

export function CardFooter({ children, className = '', align = 'right' }: CardFooterProps) {
  return (
    <div
      className={`
        flex items-center gap-3 mt-4 pt-4 border-t border-border
        ${alignClasses[align]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// Stat Card - specialized card for stats
interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error'
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-[hsl(var(--surface-tint))] text-primary',
  success: 'bg-[hsl(var(--trust)/0.10)] text-[hsl(var(--trust))]',
  warning: 'bg-amber/10 text-amber',
  error: 'bg-destructive/10 text-destructive',
}

export function StatCard({ label, value, icon, trend, className = '', color = 'primary' }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {trend && (
            <div
              className={`
                flex items-center mt-2 text-sm font-medium
                ${trend.isPositive ? 'text-[#16a34a]' : 'text-[#dc2626]'}
              `}
            >
              {trend.isPositive ? (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>}
      </div>
    </Card>
  )
}
