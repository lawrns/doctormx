/**
 * usePremiumAccess Hook
 * 
 * Hook reutilizable para verificar acceso a funciones premium.
 * Extraído de ClinicalCopilot.tsx para reuso en otros componentes.
 * 
 * @example
 * ```typescript
 * const { hasAccess, isLoading, showPaywall, checkAccess } = usePremiumAccess('clinical_copilot')
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/lib/observability/logger'

export interface PremiumAccessState {
  hasAccess: boolean
  isLoading: boolean
  showPaywall: boolean
  error: Error | null
}

export interface UsePremiumAccessReturn extends PremiumAccessState {
  checkAccess: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Verifica si el usuario tiene acceso a una función premium
 * 
 * @param feature - Identificador de la función (ej: 'clinical_copilot', 'advanced_analytics')
 * @param autoCheck - Si debe verificar automáticamente al montar (default: true)
 * @returns Estado del acceso y funciones de control
 */
export function usePremiumAccess(
  feature: string,
  autoCheck: boolean = true
): UsePremiumAccessReturn {
  const [state, setState] = useState<PremiumAccessState>({
    hasAccess: false,
    isLoading: autoCheck,
    showPaywall: false,
    error: null,
  })

  const checkAccess = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/premium/status?feature=${encodeURIComponent(feature)}`)
      
      if (!response.ok) {
        throw new Error(`Failed to check premium access: ${response.status}`)
      }

      const data = await response.json()
      
      setState({
        hasAccess: data.hasAccess ?? false,
        isLoading: false,
        showPaywall: !data.hasAccess && data.needsUpgrade,
        error: null,
      })
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      
      logger.error('Error checking premium access', { 
        error: err.message,
        feature 
      })

      setState({
        hasAccess: false,
        isLoading: false,
        showPaywall: false,
        error: err,
      })
    }
  }, [feature])

  // Auto-check on mount if enabled
  useEffect(() => {
    if (autoCheck) {
      checkAccess()
    }
  }, [autoCheck, checkAccess])

  // Refresh function (alias for checkAccess with better semantics)
  const refresh = useCallback(async () => {
    await checkAccess()
  }, [checkAccess])

  return {
    ...state,
    checkAccess,
    refresh,
  }
}

/**
 * Hook simplificado para verificación síncrona de acceso
 * Útil cuando solo necesitas saber si tiene acceso sin loading states
 * 
 * @param feature - Identificador de la función premium
 * @returns boolean indicando si tiene acceso
 */
export function useHasPremiumAccess(feature: string): boolean {
  const { hasAccess } = usePremiumAccess(feature)
  return hasAccess
}

/**
 * Hook para múltiples funciones premium
 * 
 * @param features - Array de identificadores de funciones
 * @returns Record con estado de cada función
 */
export function usePremiumFeatures(features: string[]): Record<string, boolean> {
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const checkAll = async () => {
      const results: Record<string, boolean> = {}

      await Promise.all(
        features.map(async (feature) => {
          try {
            const response = await fetch(`/api/premium/status?feature=${encodeURIComponent(feature)}`)
            const data = await response.json()
            results[feature] = data.hasAccess ?? false
          } catch {
            results[feature] = false
          }
        })
      )

      setAccessMap(results)
    }

    checkAll()
  }, [features])

  return accessMap
}
