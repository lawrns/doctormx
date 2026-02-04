'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  containerClassName?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      id,
      label,
      description,
      checked,
      defaultChecked,
      onChange,
      disabled,
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className={cn('flex items-start gap-3', containerClassName)}>
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={switchId}
            ref={ref}
            className="peer sr-only"
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement
              if (!disabled) {
                input.checked = !input.checked
                input.dispatchEvent(new Event('change', { bubbles: true }))
              }
            }}
            className={cn(
              'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2',
              'relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ease-in-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              checked ? 'bg-blue-600' : 'bg-gray-300',
              'hover:opacity-90 transition-opacity',
              disabled && 'bg-gray-200',
              className
            )}
            aria-labelledby={label ? switchId : undefined}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                checked ? 'translate-x-6' : 'translate-x-0',
                disabled && 'bg-gray-400'
              )}
            />
          </button>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={switchId}
                className={cn(
                  'text-sm font-medium leading-none',
                  disabled ? 'text-gray-400' : 'text-gray-900',
                  'cursor-pointer'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
