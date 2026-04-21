'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statCardVariants = cva(
  'bg-card rounded-xl border transition-all duration-200',
  {
    variants: {
      elevation: {
        none: 'border-border shadow-sm',
        sm: 'border-border shadow-md hover:shadow-lg',
        md: 'border-border shadow-lg hover:shadow-xl hover:-translate-y-1',
        lg: 'border-border shadow-xl hover:shadow-2xl hover:-translate-y-2',
      },
      borderColor: {
        primary: 'border-l-4 border-l-primary-500',
        success: 'border-l-4 border-l-success-500',
        warning: 'border-l-4 border-l-warning-500',
        info: 'border-l-4 border-l-info-500',
        neutral: '',
      },
    },
    defaultVariants: {
      elevation: 'sm',
      borderColor: 'neutral',
    },
  }
)

interface StatCardProps extends VariantProps<typeof statCardVariants> {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  format?: 'currency' | 'percentage' | 'number'
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = 'neutral',
  format = 'number',
  className,
  elevation = 'sm',
  borderColor = 'neutral',
}: StatCardProps) {
  const formattedValue = () => {
    if (typeof value === 'string') return value
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return new Intl.NumberFormat('es-MX').format(value)
    }
  }

  return (
    <div className={cn(statCardVariants({ elevation, borderColor }), 'p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{formattedValue()}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={clsx(
                  'inline-flex items-center text-sm font-medium',
                  trend === 'up' && 'text-primary',
                  trend === 'down' && 'text-red-600',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trend === 'up' && (
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {trend === 'down' && (
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {Math.abs(change).toFixed(1)}%
              </span>
              {changeLabel && <span className="text-sm text-muted-foreground">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-secondary rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

type SimpleStatCardProps = {
  label: string
  value: string | number
  icon: ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

export function SimpleStatCard({ label, value, icon, color = 'blue' }: SimpleStatCardProps) {
  const colors = {
    blue: 'bg-primary-100 text-primary-600',
    green: 'bg-success-100 text-success-600',
    purple: 'bg-primary-100 text-primary-600',
    orange: 'bg-warning-100 text-warning-600',
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function MetricCard({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export function EmptyMetricState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg className="w-16 h-16 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
