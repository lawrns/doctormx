'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error): void {
    if (this.props.onError) {
      this.props.onError(error)
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught an error:', error)
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className="p-6 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20 dark:border-red-800"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle
                className="h-6 w-6 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Algo sali&oacute; mal
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                Ocurri&oacute; un error inesperado. Por favor, intenta de nuevo.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                    Detalles del error (solo en desarrollo)
                  </summary>
                  <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 rounded text-xs overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              <div className="mt-4">
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                >
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Intentar de nuevo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ReactNode
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'

  const ComponentWithErrorBoundary: React.FC<P> = (props) => {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`

  return ComponentWithErrorBoundary
}
