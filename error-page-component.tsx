'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { 
  AlertCircle, 
  ArrowLeft, 
  Home, 
  Search, 
  RefreshCw, 
  HelpCircle, 
  LayoutDashboard,
  Stethoscope,
  UserCircle,
  ShieldAlert,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/observability/logger'

export interface ErrorPageProps {
  /** Main error title displayed to the user */
  title: string
  /** Optional description text (default: generic error message) */
  description?: string
  /** The error object caught by the error boundary */
  error?: Error & { digest?: string }
  /** Reset function from error boundary to retry */
  reset?: () => void
  /** Visual variant for different contexts */
  variant?: 'default' | 'medical' | 'doctor-portal' | 'admin' | 'auth' | 'patient'
  /** Context name for logging */
  context?: string
  /** Custom primary action button */
  primaryAction?: {
    label: string
    href: string
    icon?: React.ReactNode
  }
  /** Custom secondary action button */
  secondaryAction?: {
    label: string
    href: string
    icon?: React.ReactNode
  }
  /** Whether to show the back to home link */
  showBackLink?: boolean
  /** Additional CSS classes */
  className?: string
}

const variantStyles = {
  default: {
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  medical: {
    iconColor: 'text-rose-600',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-200',
  },
  'doctor-portal': {
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  admin: {
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
  },
  auth: {
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
  },
  patient: {
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-200',
  },
}

const defaultDescriptions: Record<string, string> = {
  default: 'Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado. Por favor, intenta de nuevo o utiliza una de las siguientes opciones.',
  medical: 'Lo sentimos, ha ocurrido un error al procesar tu solicitud médica. Por favor, intenta de nuevo o contacta a soporte.',
  'doctor-portal': 'Lo sentimos, ha ocurrido un error al cargar el portal de médicos. Por favor, intenta de nuevo.',
  admin: 'Lo sentimos, ha ocurrido un error en el panel de administración. Por favor, intenta de nuevo.',
  auth: 'Lo sentimos, ha ocurrido un error al procesar tu autenticación. Por favor, intenta de nuevo.',
  patient: 'Lo sentimos, ha ocurrido un error al cargar tu información. Por favor, intenta de nuevo.',
}

export function ErrorPage({
  title,
  description,
  error,
  reset,
  variant = 'default',
  context = 'Error boundary',
  primaryAction,
  secondaryAction,
  showBackLink = true,
  className = '',
}: ErrorPageProps) {
  const styles = variantStyles[variant]
  const defaultDesc = defaultDescriptions[variant]

  useEffect(() => {
    if (error) {
      logger.error(`${context} caught error`, {
        message: error.message,
        digest: error.digest,
        variant,
        title,
      })
    }
  }, [error, context, variant, title])

  const renderActions = () => {
    const actions = []

    // Retry button
    if (reset) {
      actions.push(
        <Button 
          key="retry" 
          onClick={reset} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Intentar de nuevo
        </Button>
      )
    }

    // Custom primary action
    if (primaryAction) {
      actions.push(
        <Link key="primary" href={primaryAction.href}>
          <Button className="flex items-center gap-2">
            {primaryAction.icon || <Stethoscope className="w-4 h-4" />}
            {primaryAction.label}
          </Button>
        </Link>
      )
    }

    // Custom secondary action
    if (secondaryAction) {
      actions.push(
        <Link key="secondary" href={secondaryAction.href}>
          <Button variant="outline" className="flex items-center gap-2">
            {secondaryAction.icon || <FileText className="w-4 h-4" />}
            {secondaryAction.label}
          </Button>
        </Link>
      )
    }

    // Variant-specific default actions
    if (!primaryAction && !secondaryAction) {
      switch (variant) {
        case 'doctor-portal':
          actions.push(
            <Link key="dashboard" href="/doctor">
              <Button variant="outline" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>,
            <Link key="help" href="/help">
              <Button variant="outline" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Ayuda
              </Button>
            </Link>
          )
          break
        case 'admin':
          actions.push(
            <Link key="admin" href="/admin">
              <Button variant="outline" className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Panel Admin
              </Button>
            </Link>
          )
          break
        case 'auth':
          actions.push(
            <Link key="login" href="/auth/login">
              <Button variant="outline" className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Iniciar Sesión
              </Button>
            </Link>
          )
          break
        case 'patient':
          actions.push(
            <Link key="profile" href="/app/profile">
              <Button variant="outline" className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Mi Perfil
              </Button>
            </Link>
          )
          break
      }

      // Common actions for all variants
      actions.push(
        <Link key="home" href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Inicio
          </Button>
        </Link>,
        <Link key="doctors" href="/doctores">
          <Button className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Buscar Doctores
          </Button>
        </Link>
      )
    }

    return actions
  }

  return (
    <div className={`min-h-screen bg-neutral-50 flex items-center justify-center p-6 ${className}`}>
      <div className="max-w-2xl mx-auto w-full relative">
        {/* Back to Home */}
        {showBackLink && (
          <div className="absolute -top-16 left-0">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Inicio
            </Link>
          </div>
        )}

        {/* Error State */}
        <div className={`bg-white rounded-2xl shadow-lg p-8 sm:p-12 border ${styles.borderColor}`}>
          <div className="flex flex-col items-center justify-center text-center">
            <div className={`w-16 h-16 ${styles.bgColor} rounded-full flex items-center justify-center mb-6`}>
              <AlertCircle className={`w-8 h-8 ${styles.iconColor}`} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>

            <p className="text-gray-600 mb-8">
              {description || defaultDesc}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
              {renderActions()}
            </div>

            {/* Support Info */}
            {(variant === 'doctor-portal' || variant === 'admin') && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Si el problema persiste, contacta a nuestro equipo de soporte
                </p>
              </div>
            )}

            {/* Error Digest (for debugging) */}
            {error?.digest && process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 font-mono">
                  Error ID: {error.digest}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Default export for convenience
export default ErrorPage
