import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundaryAdapter, DefaultErrorFallback } from './ErrorBoundaryAdapter'
import React from 'react'

// Test component that throws an error
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Normal content</div>
}

describe('ErrorBoundaryAdapter', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundaryAdapter>
        <div>Child content</div>
      </ErrorBoundaryAdapter>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('calls onError when error occurs', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundaryAdapter onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryAdapter>
    )
    expect(onError).toHaveBeenCalled()
  })

  it('calls onReset when reset is triggered', () => {
    const onReset = vi.fn()
    render(
      <ErrorBoundaryAdapter onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryAdapter>
    )
    const button = screen.getByText('Recargar página')
    button.click()
    expect(onReset).toHaveBeenCalled()
  })

  it('renders with custom fallback component', () => {
    const CustomFallback = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => (
      <div>
        Custom Fallback
        <button onClick={resetErrorBoundary}>Reset</button>
      </div>
    )
    render(
      <ErrorBoundaryAdapter fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryAdapter>
    )
    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
  })

  it('renders with custom fallback render function', () => {
    render(
      <ErrorBoundaryAdapter
        fallbackRender={({ resetErrorBoundary }) => (
          <div>
            Render Fallback
            <button onClick={resetErrorBoundary}>Reset</button>
          </div>
        )}
      >
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryAdapter>
    )
    expect(screen.getByText('Render Fallback')).toBeInTheDocument()
  })

  it('handles resetKeys', () => {
    const { rerender } = render(
      <ErrorBoundaryAdapter resetKeys={['key1']}>
        <div>Content</div>
      </ErrorBoundaryAdapter>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
    rerender(
      <ErrorBoundaryAdapter resetKeys={['key2']}>
        <div>Content</div>
      </ErrorBoundaryAdapter>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

describe('DefaultErrorFallback', () => {
  it('renders with error', () => {
    const error = new Error('Test error')
    const resetErrorBoundary = vi.fn()
    
    render(<DefaultErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />)
    
    expect(screen.getByText('Algo inesperado ocurrió')).toBeInTheDocument()
    expect(screen.getByText('Recargar página')).toBeInTheDocument()
  })

  it('handles string error', () => {
    const resetErrorBoundary = vi.fn()
    
    render(<DefaultErrorFallback error="String error" resetErrorBoundary={resetErrorBoundary} />)
    
    expect(screen.getByText('Algo inesperado ocurrió')).toBeInTheDocument()
  })

  it('calls resetErrorBoundary when retry is clicked', () => {
    const error = new Error('Test error')
    const resetErrorBoundary = vi.fn()
    
    render(<DefaultErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />)
    
    const button = screen.getByText('Recargar página')
    button.click()
    expect(resetErrorBoundary).toHaveBeenCalled()
  })
})
