'use client'

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
          >
            {label}
            {props.required && <span className="text-[var(--color-error-500)] ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              block w-full rounded-lg border interactive
              ${leftIcon ? 'pl-10' : 'px-4'}
              ${rightIcon ? 'pr-10' : 'px-4'}
              py-2.5 text-base body-text
              ${hasError
                ? 'border-[var(--color-error-300)] focus:border-[var(--color-error-500)] focus:ring-2 focus:ring-[rgba(239,68,68,0.15)]'
                : 'border-[var(--border-default)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[rgba(99,102,241,0.1)]'
              }
              placeholder:text-[var(--color-text-muted)]
              focus:outline-none focus-ring
              disabled:bg-[var(--color-surface-elevated)]
              disabled:text-[var(--color-text-muted)]
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-[var(--color-error-500)]">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-sm text-[var(--color-text-muted)]">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', containerClassName = '', id, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
          >
            {label}
            {props.required && <span className="text-[var(--color-error-500)] ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-lg border interactive
            px-4 py-3 text-base body-text
            ${hasError
              ? 'border-[var(--color-error-300)] focus:border-[var(--color-error-500)] focus:ring-2 focus:ring-[rgba(239,68,68,0.15)]'
              : 'border-[var(--border-default)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[rgba(99,102,241,0.1)]'
            }
            focus:outline-none focus-ring
            disabled:bg-[var(--color-surface-elevated)]
            disabled:text-[var(--color-text-muted)]
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-[var(--color-error-500)]">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-sm text-[var(--color-text-muted)]">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
