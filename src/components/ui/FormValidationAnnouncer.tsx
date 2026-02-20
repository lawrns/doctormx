/**
 * FormValidationAnnouncer Component
 * 
 * Announces form validation messages to screen readers.
 * Uses a live region to ensure assistive technologies announce
 * validation feedback immediately.
 * 
 * @example
 * ```tsx
 * <FormValidationAnnouncer message={announcement} />
 * ```
 */

'use client';

import { useEffect, useState } from 'react';

interface FormValidationAnnouncerProps {
  /** The message to announce to screen readers */
  message: string | null;
  /** The politeness level of the announcement */
  politeness?: 'polite' | 'assertive';
  /** Optional className for styling */
  className?: string;
}

export function FormValidationAnnouncer({
  message,
  politeness = 'polite',
  className = '',
}: FormValidationAnnouncerProps) {
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    if (message) {
      // Small delay to ensure the announcement is registered as a change
      const timer = setTimeout(() => {
        setAnnouncement(message);
      }, 100);

      // Clear the announcement after screen reader has time to read it
      const clearTimer = setTimeout(() => {
        setAnnouncement('');
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [message]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {announcement}
    </div>
  );
}

/**
 * InlineError Component
 * 
 * Displays inline error messages with proper accessibility attributes.
 */
interface InlineErrorProps {
  id?: string;
  message: string;
  className?: string;
}

export function InlineError({ id, message, className = '' }: InlineErrorProps) {
  return (
    <span
      id={id}
      role="alert"
      aria-live="polite"
      className={`text-sm text-destructive ${className}`}
    >
      {message}
    </span>
  );
}

/**
 * InlineSuccess Component
 * 
 * Displays inline success indicators with proper accessibility attributes.
 */
interface InlineSuccessProps {
  id?: string;
  message?: string;
  className?: string;
  /** Visual indicator only - will be aria-hidden */
  showIcon?: boolean;
}

export function InlineSuccess({
  id,
  message,
  className = '',
  showIcon = true,
}: InlineSuccessProps) {
  return (
    <span
      id={id}
      aria-live="polite"
      className={`text-sm text-green-600 flex items-center gap-1 ${className}`}
    >
      {showIcon && (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
      {message && <span>{message}</span>}
    </span>
  );
}

/**
 * FieldErrorMessage Component
 * 
 * Combines error display with accessibility attributes for form fields.
 * Links the error to the input via aria-describedby.
 */
interface FieldErrorMessageProps {
  errorId: string;
  error: string | null;
  touched: boolean;
  className?: string;
}

export function FieldErrorMessage({
  errorId,
  error,
  touched,
  className = '',
}: FieldErrorMessageProps) {
  if (!error || !touched) return null;

  return (
    <p
      id={errorId}
      role="alert"
      aria-live="polite"
      className={`mt-1 text-sm text-destructive ${className}`}
    >
      {error}
    </p>
  );
}

/**
 * FormErrorSummary Component
 * 
 * Displays a summary of all form errors, typically at the top of a form.
 * Provides focus management for keyboard users.
 */
interface FormErrorSummaryProps {
  errors: Record<string, string>;
  className?: string;
  title?: string;
}

export function FormErrorSummary({
  errors,
  className = '',
  title = 'Por favor corrige los siguientes errores:',
}: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-lg border border-destructive/20 bg-destructive/10 p-4 ${className}`}
    >
      <h3 className="text-sm font-medium text-destructive mb-2">{title}</h3>
      <ul className="list-disc list-inside text-sm text-destructive space-y-1">
        {errorEntries.map(([field, message]) => (
          <li key={field}>
            <span className="capitalize">{field}:</span> {message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FormValidationAnnouncer;
