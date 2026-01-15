'use client'

import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { PricingBadge } from './PricingBadge'
import type { PremiumFeature, SubscriptionTier } from '@/lib/premium-features'

interface PremiumFeatureGateProps {
  feature: PremiumFeature
  children: React.ReactNode
  fallback?: React.ReactNode
  showUsage?: boolean
}

export function PremiumFeatureGate({
  feature,
  children,
  fallback,
  showUsage = true,
}: PremiumFeatureGateProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accessStatus, setAccessStatus] = useState<{
    hasAccess: boolean
    tier: SubscriptionTier
    tierName: string
    used: number
    limit: number | null
    remaining: number
    needsUpgrade: boolean
    upgradeTo?: SubscriptionTier
  } | null>(null)

  const checkAccess = async () => {
    try {
      const response = await fetch(`/api/premium/status?feature=${feature}`)
      if (response.ok) {
        const data = await response.json()
        setAccessStatus(data)
        if (!data.hasAccess && data.needsUpgrade) {
          setShowUpgradeModal(true)
        }
      }
    } catch (error) {
      console.error('Error checking premium access:', error)
    }
  }

  const handleUpgrade = async () => {
    if (!accessStatus?.upgradeTo) return

    setLoading(true)
    try {
      const response = await fetch('/api/premium/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: accessStatus.upgradeTo }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!accessStatus) {
    checkAccess()
  }

  if (accessStatus?.hasAccess) {
    return (
      <>
        {children}
        {showUsage && accessStatus.limit && (
          <div className="mt-2 text-xs text-gray-500">
            Usado: {accessStatus.used} / {accessStatus.limit}
          </div>
        )}
      </>
    )
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <>
      {accessStatus && (
        <div className="relative">
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium rounded-lg shadow-lg hover:from-amber-500 hover:to-orange-600 transition-all"
            >
              <PricingBadge tier="pro" />
              <span className="ml-2">Desbloquear</span>
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Desbloquear Funcionalidad Premium"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {accessStatus?.tier === 'starter' ? 'Upgrade a Pro' : 'Upgrade a Elite'}
            </h3>
            <p className="text-gray-600 mt-2">
              {accessStatus?.tier === 'starter'
                ? 'Esta funcionalidad está disponible para planes Pro y Elite'
                : 'Upgrade a Elite para obtener acceso completo'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Características incluidas:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {accessStatus?.upgradeTo === 'pro' && (
                <>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    5 análisis de imágenes IA por mes
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Chat extendido (500 mensajes)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    20 consultas IA premium por mes
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    WhatsApp ilimitado
                  </li>
                </>
              )}
              {accessStatus?.upgradeTo === 'elite' && (
                <>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Todo lo de Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium text-purple-700">Clinical Copilot AI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    10 análisis de imágenes IA por mes
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Listado prioritario (+50% visibilidad)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Distintivo "Doctor Elite"
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Acceso a API
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div>
              <p className="text-sm text-gray-600">Precio</p>
              <p className="text-2xl font-bold text-gray-900">
                {accessStatus?.upgradeTo === 'pro' ? '$499' : '$999'}
                <span className="text-sm font-normal text-gray-500">/mes</span>
              </p>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Upgrade Ahora'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Cancela cuando quieras. No hay compromisos a largo plazo.
          </p>
        </div>
      </Modal>
    </>
  )
}

export function PremiumFeatureBadge({
  size = 'md',
}: {
  feature?: PremiumFeature
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <PricingBadge tier="pro" size={size} />
    </span>
  )
}
