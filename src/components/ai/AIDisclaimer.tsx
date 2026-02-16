'use client'

import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import * as React from 'react'

/**
 * AIDisclaimer Component - WCAG 2.1 AA Compliant
 *
 * Disclaimer obligatorio según norma Enero 2026 para asistentes de salud con IA.
 * Texto requerido: "Este asistente de salud utiliza inteligencia artificial
 * para ayudar a orientar sus síntomas. NO es un diagnóstico médico."
 *
 * @example
 * ```tsx
 * // Variante completa (default)
 * <AIDisclaimer />
 *
 * // Variante compacta
 * <AIDisclaimer variant="compact" />
 *
 * // Con clases adicionales
 * <AIDisclaimer className="mb-4" />
 * ```
 */

export interface AIDisclaimerProps {
  /**
   * Variante de visualización
   * - full: Muestra el disclaimer completo con ícono destacado
   * - compact: Versión más compacta para espacios reducidos
   */
  variant?: 'full' | 'compact'

  /**
   * Clases CSS adicionales
   */
  className?: string

  /**
   * ID para accesibilidad (para vincular con aria-describedby)
   */
  id?: string

  /**
   * Texto personalizado (por defecto usa el texto normado)
   * WARNING: Solo modificar si estás seguro de cumplir con la norma
   */
  text?: string
}

// Texto normado según reforma Enero 2026
const DEFAULT_DISCLAIMER_TEXT =
  'Este asistente de salud utiliza inteligencia artificial para ayudar a orientar sus síntomas. NO es un diagnóstico médico.'

export function AIDisclaimer({
  variant = 'full',
  className = '',
  id,
  text = DEFAULT_DISCLAIMER_TEXT,
}: AIDisclaimerProps) {
  // Configuración según variante
  const variantConfig = {
    full: {
      container: 'p-4 rounded-xl border',
      iconSize: 'h-5 w-5',
      textSize: 'text-sm',
      iconMargin: 'mb-2',
      textAlignment: 'text-center',
    },
    compact: {
      container: 'px-3 py-2 rounded-lg border',
      iconSize: 'h-4 w-4',
      textSize: 'text-xs',
      iconMargin: 'mr-2',
      textAlignment: 'text-left',
    },
  }

  const config = variantConfig[variant]

  return (
    <div
      id={id}
      className={cn(
        // Colores de alto contraste - WCAG 2.1 AA compliant
        'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900',
        // Texto de alto contraste
        'text-amber-800 dark:text-amber-200',
        // Configuración de variante
        config.container,
        className
      )}
      role="alert"
      aria-live="polite"
      aria-atomic
    >
      <div
        className={cn(
          'flex',
          variant === 'full' ? 'flex-col items-center justify-center' : 'flex-row items-center',
          config.textAlignment
        )}
      >
        {/* Icono de advertencia */}
        <div
          className={cn(
            'flex-shrink-0 text-amber-600 dark:text-amber-400',
            config.iconMargin
          )}
          aria-hidden="true"
        >
          <AlertTriangle className={config.iconSize} />
        </div>

        {/* Texto del disclaimer */}
        <p className={cn(config.textSize, 'leading-relaxed')}>
          <span className="font-semibold">Aviso:</span> {text}
        </p>
      </div>
    </div>
  )
}

/**
 * AIDisclaimerCompact - Versión compacta preconfigurada
 */
export function AIDisclaimerCompact(props: Omit<AIDisclaimerProps, 'variant'>) {
  return <AIDisclaimer {...props} variant="compact" />
}

/**
 * AIDisclaimerFull - Versión completa preconfigurada
 */
export function AIDisclaimerFull(props: Omit<AIDisclaimerProps, 'variant'>) {
  return <AIDisclaimer {...props} variant="full" />
}

/**
 * useAIDisclaimerId - Hook para generar IDs únicos
 * Útil cuando hay múltiples disclaimers en la misma página
 */
export function useAIDisclaimerId(prefix: string = 'ai-disclaimer') {
  const id = React.useId()
  return `${prefix}-${id}`
}

/**
 * withAIDisclaimer - HOC para agregar disclaimer a un componente
 */
export function withAIDisclaimer<P extends object>(
  Component: React.ComponentType<P>,
  disclaimerProps?: Omit<AIDisclaimerProps, 'id'>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <div>
      <Component {...props} />
      <AIDisclaimer {...disclaimerProps} />
    </div>
  )

  WrappedComponent.displayName = `withAIDisclaimer(${Component.displayName || Component.name})`

  return WrappedComponent
}
