'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/observability/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error Boundary for SOAP components
 * Catches JavaScript errors in child component tree and displays fallback UI
 */
export class SOAPErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    // Call optional error handler prop
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to logger in development
    if (process.env.NODE_ENV === 'development') {
      logger.error('SOAP Error Boundary caught an error', { error: error.message });
      logger.error('Component stack', { componentStack: errorInfo.componentStack });
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
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
                Error en consulta SOAP
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
              </p>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                    Detalles del error (solo en desarrollo)
                  </summary>
                  <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 rounded text-xs overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
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
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 */
export function withSOAPErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ReactNode
): React.FC<P> {
  const displayName =
    (WrappedComponent.displayName || WrappedComponent.name) ?? 'Component';

  const ComponentWithErrorBoundary: React.FC<P> = (props) => {
    return (
      <SOAPErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </SOAPErrorBoundary>
    );
  };

  ComponentWithErrorBoundary.displayName = `withSOAPErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}
