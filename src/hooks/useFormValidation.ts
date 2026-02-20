/**
 * useFormValidation Hook
 * 
 * Provides real-time form validation with accessibility features:
 * - Validation on blur
 * - Clear error messages
 * - Screen reader announcements
 * - Success indicators
 * - Focus management to errors
 * 
 * @example
 * ```tsx
 * const { errors, touched, validateField, getFieldProps, announceError } = useFormValidation({
 *   schema: loginSchema,
 *   values: { email, password }
 * });
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';

export type ValidationMode = 'onBlur' | 'onChange' | 'onSubmit';

export interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  values: T;
  mode?: ValidationMode;
  debounceMs?: number;
}

export interface FieldValidationState {
  error: string | null;
  touched: boolean;
  valid: boolean;
  validating: boolean;
}

export interface UseFormValidationReturn<T> {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  validFields: Record<string, boolean>;
  validating: Record<string, boolean>;
  validateField: (fieldName: keyof T) => Promise<boolean>;
  validateAll: () => Promise<boolean>;
  clearError: (fieldName: keyof T) => void;
  clearAllErrors: () => void;
  setFieldTouched: (fieldName: keyof T, touched: boolean) => void;
  getFieldProps: (fieldName: keyof T) => {
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
    'aria-errormessage': string | undefined;
    onBlur: () => void;
  };
  getErrorProps: (fieldName: keyof T) => {
    id: string;
    role: 'alert';
    'aria-live': 'polite';
  } | null;
  getSuccessProps: (fieldName: keyof T) => {
    id: string;
    'aria-live': 'polite';
    'aria-label': string;
  } | null;
  focusFirstError: (formRef: React.RefObject<HTMLFormElement | null>) => void;
  announcement: string | null;
  isValid: boolean;
}

export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  values,
  mode = 'onBlur',
  debounceMs = 300,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validFields, setValidFields] = useState<Record<string, boolean>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const debounceTimer = useRef<Record<string, NodeJS.Timeout>>({});

  // Generate unique IDs for accessibility
  const formId = useRef(`form-${Math.random().toString(36).substr(2, 9)}`);

  // Clear announcement after screen reader has time to read it
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  const announceError = useCallback((fieldName: string, message: string) => {
    setAnnouncement(`Error en ${String(fieldName)}: ${message}`);
  }, []);

  const announceSuccess = useCallback((fieldName: string) => {
    setAnnouncement(`${String(fieldName)} válido`);
  }, []);

  const validateField = useCallback(async (fieldName: keyof T): Promise<boolean> => {
    const key = String(fieldName);
    
    // Clear any existing debounce timer for this field
    if (debounceTimer.current[key]) {
      clearTimeout(debounceTimer.current[key]);
    }

    setValidating(prev => ({ ...prev, [key]: true }));

    return new Promise((resolve) => {
      debounceTimer.current[key] = setTimeout(async () => {
        try {
          // Create a partial schema for single field validation
          const partialSchema = z.object({
            [key]: (schema as z.ZodObject<Record<string, z.ZodType<unknown>>>).shape[key]
          });
          
          await partialSchema.parseAsync({ [key]: values[key] });
          
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[key];
            return newErrors;
          });
          setValidFields(prev => ({ ...prev, [key]: true }));
          announceSuccess(key);
          resolve(true);
        } catch (error) {
          if (error instanceof z.ZodError) {
            const fieldError = error.issues.find(e => e.path[0] === key);
            if (fieldError) {
              setErrors(prev => ({ ...prev, [key]: fieldError.message }));
              setValidFields(prev => ({ ...prev, [key]: false }));
              announceError(key, fieldError.message);
              resolve(false);
            } else {
              resolve(true);
            }
          } else {
            resolve(false);
          }
        } finally {
          setValidating(prev => ({ ...prev, [key]: false }));
        }
      }, debounceMs);
    });
  }, [schema, values, debounceMs, announceError, announceSuccess]);

  const validateAll = useCallback(async (): Promise<boolean> => {
    try {
      await schema.parseAsync(values);
      setErrors({});
      setValidFields(
        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        const newValidFields: Record<string, boolean> = {};
        
        error.issues.forEach((err) => {
          const key = String(err.path[0]);
          newErrors[key] = err.message;
        });

        // Mark fields without errors as valid
        Object.keys(values).forEach((key) => {
          newValidFields[key] = !newErrors[key];
        });

        setErrors(newErrors);
        setValidFields(newValidFields);

        // Announce first error
        const firstError = error.issues[0];
        if (firstError) {
          announceError(String(firstError.path[0]), firstError.message);
        }

        return false;
      }
      return false;
    }
  }, [schema, values, announceError]);

  const clearError = useCallback((fieldName: keyof T) => {
    const key = String(fieldName);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setValidFields({});
  }, []);

  const setFieldTouched = useCallback((fieldName: keyof T, isTouched: boolean) => {
    const key = String(fieldName);
    setTouched(prev => ({ ...prev, [key]: isTouched }));
    
    if (isTouched && mode === 'onBlur') {
      validateField(fieldName);
    }
  }, [mode, validateField]);

  const getFieldProps = useCallback((fieldName: keyof T) => {
    const key = String(fieldName);
    const hasError = !!errors[key] && touched[key];
    
    return {
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${formId.current}-${key}-error` : undefined,
      'aria-errormessage': hasError ? `${formId.current}-${key}-error` : undefined,
      onBlur: () => setFieldTouched(fieldName, true),
    };
  }, [errors, touched, setFieldTouched]);

  const getErrorProps = useCallback((fieldName: keyof T) => {
    const key = String(fieldName);
    if (!errors[key] || !touched[key]) return null;
    
    return {
      id: `${formId.current}-${key}-error`,
      role: 'alert' as const,
      'aria-live': 'polite' as const,
    };
  }, [errors, touched]);

  const getSuccessProps = useCallback((fieldName: keyof T) => {
    const key = String(fieldName);
    if (!validFields[key] || errors[key] || !touched[key]) return null;
    
    return {
      id: `${formId.current}-${key}-success`,
      'aria-live': 'polite' as const,
      'aria-label': `${key} es válido`,
    };
  }, [validFields, errors, touched]);

  const focusFirstError = useCallback((formRef: React.RefObject<HTMLFormElement | null>) => {
    if (!formRef.current || Object.keys(errors).length === 0) return;

    const firstErrorKey = Object.keys(errors)[0];
    const errorElement = formRef.current.querySelector(
      `[name="${firstErrorKey}"], [id="${firstErrorKey}"]`
    ) as HTMLElement | null;

    if (errorElement) {
      errorElement.focus();
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errors]);

  const isValid = Object.keys(errors).length === 0 && Object.keys(validFields).length > 0;

  return {
    errors,
    touched,
    validFields,
    validating,
    validateField,
    validateAll,
    clearError,
    clearAllErrors,
    setFieldTouched,
    getFieldProps,
    getErrorProps,
    getSuccessProps,
    focusFirstError,
    announcement,
    isValid,
  };
}

export default useFormValidation;
