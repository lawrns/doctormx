import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { z } from 'zod'
import { useFormValidation } from '../useFormValidation'

const testSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  name: z.string().min(2, 'Mínimo 2 caracteres').optional(),
})

type TestFormData = z.infer<typeof testSchema>

describe('useFormValidation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  it('initializes with empty errors and touched states', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: '', password: '' },
      })
    )

    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
    expect(result.current.validFields).toEqual({})
  })

  it('validates field on blur with mode onBlur', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: 'invalid', password: '' },
        mode: 'onBlur',
        debounceMs: 0,
      })
    )

    // Simulate blur
    act(() => {
      result.current.setFieldTouched('email', true)
    })

    vi.advanceTimersByTime(50)

    await waitFor(() => {
      expect(result.current.errors.email).toBe('Email inválido')
      expect(result.current.touched.email).toBe(true)
    })
  })

  it('validates field correctly when valid', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: 'test@example.com', password: '123456' },
        debounceMs: 0,
      })
    )

    await act(async () => {
      const isValid = await result.current.validateField('email')
      expect(isValid).toBe(true)
    })

    expect(result.current.validFields.email).toBe(true)
    expect(result.current.errors.email).toBeUndefined()
  })

  it('validates all fields with validateAll', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: 'invalid', password: '123' },
        debounceMs: 0,
      })
    )

    let isValid: boolean = false
    await act(async () => {
      isValid = await result.current.validateAll()
    })

    expect(isValid).toBe(false)
    expect(result.current.errors.email).toBeDefined()
    expect(result.current.errors.password).toBeDefined()
  })

  it('returns isValid true when all fields are valid', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: 'test@example.com', password: '123456' },
        debounceMs: 0,
      })
    )

    await act(async () => {
      await result.current.validateAll()
    })

    expect(result.current.isValid).toBe(true)
  })

  it('clears specific field error with clearError', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: 'test@example.com', password: '' },
      })
    )

    // First set an error manually
    act(() => {
      result.current.setFieldTouched('email', true)
    })

    act(() => {
      result.current.clearError('email')
    })

    expect(result.current.errors.email).toBeUndefined()
  })

  it('clears all errors with clearAllErrors', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: '', password: '' },
      })
    )

    act(() => {
      result.current.setFieldTouched('email', true)
      result.current.setFieldTouched('password', true)
    })

    act(() => {
      result.current.clearAllErrors()
    })

    expect(result.current.errors).toEqual({})
  })

  it('provides correct field props with getFieldProps', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: '', password: '' },
      })
    )

    const fieldProps = result.current.getFieldProps('email')

    expect(fieldProps['aria-invalid']).toBe(false)
    expect(typeof fieldProps.onBlur).toBe('function')
  })

  it('provides correct error props when error exists', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: 'invalid', password: '' },
        debounceMs: 0,
      })
    )

    await act(async () => {
      result.current.setFieldTouched('email', true)
    })

    vi.advanceTimersByTime(50)

    await waitFor(() => {
      const errorProps = result.current.getErrorProps('email')
      expect(errorProps).not.toBeNull()
      expect(errorProps?.role).toBe('alert')
      expect(errorProps?.['aria-live']).toBe('polite')
    })
  })

  it('returns null for error props when no error', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: '', password: '' },
      })
    )

    const errorProps = result.current.getErrorProps('email')
    expect(errorProps).toBeNull()
  })

  it('provides correct success props when field is valid', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: 'test@example.com', password: '' },
        debounceMs: 0,
      })
    )

    await act(async () => {
      result.current.setFieldTouched('email', true)
      await result.current.validateField('email')
    })

    vi.advanceTimersByTime(50)

    await waitFor(() => {
      const successProps = result.current.getSuccessProps('email')
      expect(successProps).not.toBeNull()
      expect(successProps?.['aria-live']).toBe('polite')
    })
  })

  it('announces validation errors', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: 'invalid', password: '' },
        debounceMs: 0,
      })
    )

    await act(async () => {
      result.current.setFieldTouched('email', true)
    })

    vi.advanceTimersByTime(100)

    await waitFor(() => {
      expect(result.current.announcement).toContain('Error')
    })
  })

  it('announces validation success', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: 'test@example.com', password: '' },
        debounceMs: 0,
      })
    )

    await act(async () => {
      result.current.setFieldTouched('email', true)
      await result.current.validateField('email')
    })

    vi.advanceTimersByTime(100)

    await waitFor(() => {
      expect(result.current.announcement).toContain('válido')
    })
  })

  it('focuses first error field with focusFirstError', async () => {
    const focusMock = vi.fn()
    const scrollIntoViewMock = vi.fn()
    
    const mockElement = {
      focus: focusMock,
      scrollIntoView: scrollIntoViewMock,
    } as unknown as HTMLElement

    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: 'invalid', password: '' },
        debounceMs: 0,
      })
    )

    const mockFormRef = {
      current: {
        querySelector: vi.fn().mockReturnValue(mockElement),
      } as unknown as HTMLFormElement,
    }

    // Set up error state by validating
    await act(async () => {
      result.current.setFieldTouched('email', true)
      await result.current.validateField('email')
    })

    vi.advanceTimersByTime(50)

    await waitFor(() => {
      expect(result.current.errors.email).toBeDefined()
    })

    act(() => {
      result.current.focusFirstError(mockFormRef)
    })

    expect(focusMock).toHaveBeenCalled()
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
  })

  it('handles optional fields correctly', async () => {
    // Create schema with truly optional field (no min length validation when empty)
    const optionalSchema = z.object({
      email: z.string().email(),
      name: z.string().optional(),
    })
    
    const { result } = renderHook(() =>
      useFormValidation({
        schema: optionalSchema,
        values: { email: 'test@example.com', name: '' },
        debounceMs: 0,
      })
    )

    await act(async () => {
      // Validate all to check that optional empty field doesn't cause validation errors
      const isValid = await result.current.validateAll()
      expect(isValid).toBe(true)
    })
  })

  it('debounces validation calls', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        values: { email: 'test@example.com', password: '' },
        debounceMs: 300,
      })
    )

    // Multiple rapid calls
    act(() => {
      result.current.validateField('email')
      result.current.validateField('email')
      result.current.validateField('email')
    })

    // Should still be validating
    expect(result.current.validating.email).toBe(true)

    // Advance timers
    vi.advanceTimersByTime(400)

    await waitFor(() => {
      expect(result.current.validating.email).toBe(false)
    })
  })
})
