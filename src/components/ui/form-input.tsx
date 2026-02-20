'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

// Input with form features (label, error, hint, icons)
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
  /** Accessible label override. Use when label is not descriptive enough */
  'aria-label'?: string
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
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
      required,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId()
    const hasError = !!error
    const hintId = hint ? `${inputId}-hint` : undefined
    const errorId = hasError ? `${inputId}-error` : undefined
    const requiredId = required ? `${inputId}-required` : undefined
    
    // Build aria-describedby with all relevant IDs
    const ariaDescribedBy = React.useMemo(() => {
      const ids: string[] = []
      if (hintId) ids.push(hintId)
      if (errorId) ids.push(errorId)
      if (requiredId) ids.push(requiredId)
      return ids.length > 0 ? ids.join(' ') : undefined
    }, [hintId, errorId, requiredId])

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && (
              <span 
                className="text-destructive ml-1" 
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
              "dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base",
              "shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            aria-invalid={hasError}
            aria-required={required}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Live region for error announcements */}
        {error && (
          <p 
            id={errorId} 
            className="mt-1 text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-muted-foreground">
            {hint}
          </p>
        )}
        
        {/* Hidden text for screen readers announcing required field */}
        {required && (
          <span id={requiredId} className="sr-only">
            Este campo es obligatorio
          </span>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

// Textarea with form features
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
  /** Accessible label override. Use when label is not descriptive enough */
  'aria-label'?: string
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    { 
      label, 
      error, 
      hint, 
      className = '', 
      containerClassName = '', 
      id, 
      required,
      'aria-label': ariaLabel,
      ...props 
    },
    ref
  ) => {
    const inputId = id || React.useId()
    const hasError = !!error
    const hintId = hint ? `${inputId}-hint` : undefined
    const errorId = hasError ? `${inputId}-error` : undefined
    const requiredId = required ? `${inputId}-required` : undefined
    
    // Build aria-describedby with all relevant IDs
    const ariaDescribedBy = React.useMemo(() => {
      const ids: string[] = []
      if (hintId) ids.push(hintId)
      if (errorId) ids.push(errorId)
      if (requiredId) ids.push(requiredId)
      return ids.length > 0 ? ids.join(' ') : undefined
    }, [hintId, errorId, requiredId])

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && (
              <span 
                className="text-destructive ml-1" 
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
            "dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base",
            "shadow-xs transition-[color,box-shadow] outline-none",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          aria-invalid={hasError}
          aria-required={required}
          aria-describedby={ariaDescribedBy}
          aria-label={ariaLabel}
          {...props}
        />

        {/* Live region for error announcements */}
        {error && (
          <p 
            id={errorId} 
            className="mt-1 text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-muted-foreground">
            {hint}
          </p>
        )}
        
        {/* Hidden text for screen readers announcing required field */}
        {required && (
          <span id={requiredId} className="sr-only">
            Este campo es obligatorio
          </span>
        )}
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

// FormSelect component for select inputs with accessibility features
export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      hint,
      className = '',
      containerClassName = '',
      id,
      required,
      options,
      placeholder,
      ...props
    },
    ref
  ) => {
    const selectId = id || React.useId()
    const hasError = !!error
    const hintId = hint ? `${selectId}-hint` : undefined
    const errorId = hasError ? `${selectId}-error` : undefined
    const requiredId = required ? `${selectId}-required` : undefined
    
    // Build aria-describedby with all relevant IDs
    const ariaDescribedBy = React.useMemo(() => {
      const ids: string[] = []
      if (hintId) ids.push(hintId)
      if (errorId) ids.push(errorId)
      if (requiredId) ids.push(requiredId)
      return ids.length > 0 ? ids.join(' ') : undefined
    }, [hintId, errorId, requiredId])

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && (
              <span 
                className="text-destructive ml-1" 
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          className={cn(
            "border-input bg-background text-foreground",
            "h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          aria-invalid={hasError}
          aria-required={required}
          aria-describedby={ariaDescribedBy}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Live region for error announcements */}
        {error && (
          <p 
            id={errorId} 
            className="mt-1 text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-muted-foreground">
            {hint}
          </p>
        )}
        
        {/* Hidden text for screen readers announcing required field */}
        {required && (
          <span id={requiredId} className="sr-only">
            Este campo es obligatorio
          </span>
        )}
      </div>
    )
  }
)

FormSelect.displayName = 'FormSelect'

// FormCheckbox component for checkbox inputs with accessibility features
export interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    {
      label,
      error,
      hint,
      className = '',
      containerClassName = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || React.useId()
    const hasError = !!error
    const hintId = hint ? `${checkboxId}-hint` : undefined
    const errorId = hasError ? `${checkboxId}-error` : undefined
    const requiredId = required ? `${checkboxId}-required` : undefined
    
    // Build aria-describedby with all relevant IDs
    const ariaDescribedBy = React.useMemo(() => {
      const ids: string[] = []
      if (hintId) ids.push(hintId)
      if (errorId) ids.push(errorId)
      if (requiredId) ids.push(requiredId)
      return ids.length > 0 ? ids.join(' ') : undefined
    }, [hintId, errorId, requiredId])

    return (
      <div className={cn("flex items-start gap-2", containerClassName)}>
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow",
            "focus-visible:ring-ring focus-visible:ring-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "accent-primary",
            className
          )}
          aria-invalid={hasError}
          aria-required={required}
          aria-describedby={ariaDescribedBy}
          {...props}
        />
        <div className="grid gap-1.5 leading-none">
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
              {required && (
                <span 
                  className="text-destructive ml-1" 
                  aria-hidden="true"
                >
                  *
                </span>
              )}
            </label>
          )}
          
          {/* Live region for error announcements */}
          {error && (
            <p 
              id={errorId} 
              className="text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}

          {hint && !error && (
            <p id={hintId} className="text-sm text-muted-foreground">
              {hint}
            </p>
          )}
          
          {/* Hidden text for screen readers announcing required field */}
          {required && (
            <span id={requiredId} className="sr-only">
              Este campo es obligatorio
            </span>
          )}
        </div>
      </div>
    )
  }
)

FormCheckbox.displayName = 'FormCheckbox'
