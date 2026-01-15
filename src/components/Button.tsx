'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

const variantClasses = {
  primary: `
    bg-[var(--color-primary-600)] text-white shadow-sm
    hover:bg-[var(--color-primary-700)] hover:shadow-md
    active:bg-[var(--color-primary-800)]
    focus-ring
  `,
  secondary: `
    bg-white border border-[var(--border-default)] text-[var(--color-text-primary)]
    hover:border-[var(--border-hover)] hover:bg-[var(--color-neutral-50)]
    active:bg-[var(--color-neutral-100)]
  `,
  tertiary: `
    bg-transparent text-[var(--color-primary-600)]
    hover:bg-[var(--color-primary-50)]
    active:bg-[var(--color-primary-100)]
  `,
  ghost: `
    bg-transparent text-[var(--color-text-secondary)]
    hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-text-primary)]
  `,
  danger: `
    bg-[var(--color-error-500)] text-white shadow-sm
    hover:bg-[var(--color-error-600)] hover:shadow-md
    active:bg-[var(--color-error-700)]
    focus-ring
  `,
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={loading || disabled}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg interactive
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${(loading || disabled) ? 'opacity-50 cursor-not-allowed' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
}
