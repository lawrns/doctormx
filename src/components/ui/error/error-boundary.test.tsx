import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  ErrorBoundary,
  withErrorBoundary,
  useErrorHandler,
  AsyncErrorBoundary,
  MedicalErrorBoundary,
  GlobalErrorBoundary,
} from './error-boundary'
import React from 'react'

// Test component that throws an error
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Normal content</div>
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders fallback when error occurs', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Algo inesperado ocurrió')).toBeInTheDocument()
    expect(onError).toHaveBeenCalled()
  })

  it('calls onReset when reset is triggered', () => {
    const onReset = vi.fn()
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    const button = screen.getByText('Recargar página')
    fireEvent.click(button)
    expect(onReset).toHaveBeenCalled()
  })

  it('renders with custom fallback', () => {
    const CustomFallback = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => (
      <div>
        Custom Error
        <button onClick={resetErrorBoundary}>Retry</button>
      </div>
    )
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
  })
})

describe('withErrorBoundary HOC', () => {
  it('wraps component with error boundary', () => {
    function TestComponent() {
      return <div>Test</div>
    }
    
    const WrappedComponent = withErrorBoundary(TestComponent)
    render(<WrappedComponent />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('has correct displayName', () => {
    function TestComponent() {
      return <div>Test</div>
    }
    TestComponent.displayName = 'TestComponent'
    
    const WrappedComponent = withErrorBoundary(TestComponent)
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)')
  })
})

describe('AsyncErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <AsyncErrorBoundary>
        <div>Child content</div>
      </AsyncErrorBoundary>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders fallback when error occurs', () => {
    render(
      <AsyncErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AsyncErrorBoundary>
    )
    expect(screen.getByText('Algo inesperado ocurrió')).toBeInTheDocument()
  })
})

describe('MedicalErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <MedicalErrorBoundary>
        <div>Medical content</div>
      </MedicalErrorBoundary>
    )
    expect(screen.getByText('Medical content')).toBeInTheDocument()
  })

  it('renders medical fallback when error occurs', () => {
    render(
      <MedicalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </MedicalErrorBoundary>
    )
    expect(screen.getByText('Lo sentimos, algo salió mal')).toBeInTheDocument()
    expect(screen.getByText('Intentar nuevamente')).toBeInTheDocument()
    expect(screen.getByText('soporte médico')).toBeInTheDocument()
  })

  it('calls onReset when retry is clicked', () => {
    const onReset = vi.fn()
    render(
      <MedicalErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </MedicalErrorBoundary>
    )
    const button = screen.getByText('Intentar nuevamente')
    fireEvent.click(button)
    expect(onReset).toHaveBeenCalled()
  })
})

describe('GlobalErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <GlobalErrorBoundary>
        <div>Global content</div>
      </GlobalErrorBoundary>
    )
    expect(screen.getByText('Global content')).toBeInTheDocument()
  })
})
