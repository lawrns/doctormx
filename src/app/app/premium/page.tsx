'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PricingBadge, FeatureLimitIndicator } from '@/components/PricingBadge'
import { INDIVIDUAL_PREMIUM_FEATURES, type PremiumFeature, type SubscriptionTier } from '@/lib/premium-features-shared'
import { LoadingButton } from '@/components/LoadingButton'

interface PremiumFeatureCardProps {
  feature: PremiumFeature
  tier: SubscriptionTier
  onPurchase: (feature: PremiumFeature, type: 'single' | 'bundle') => void
  loading: boolean
}

function PremiumFeatureCard({ feature, tier, onPurchase, loading }: PremiumFeatureCardProps) {
  const featureConfig = INDIVIDUAL_PREMIUM_FEATURES[feature]
  const tierAccess = featureConfig.tierAccess[tier]
  const isIncluded = tierAccess.included
  const isUnlimited = tierAccess.limit === -1
  const canPurchase = !isIncluded && tier !== 'starter'

  const [usage, setUsage] = useState({ used: 0, limit: tierAccess.limit })
  const [loadingUsage, setLoadingUsage] = useState(true)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch(`/api/premium/status?feature=${feature}`)
        if (response.ok) {
          const data = await response.json()
          setUsage({ used: data.used, limit: data.limit })
        }
      } catch (error) {
        console.error('Error fetching usage:', error)
      } finally {
        setLoadingUsage(false)
      }
    }
    fetchUsage()
  }, [feature])

  const iconColors = {
    ai: 'from-blue-500 to-cyan-500',
    transcription: 'from-purple-500 to-pink-500',
    priority: 'from-amber-500 to-orange-500',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${iconColors[featureConfig.category]} flex items-center justify-center`}>
            <FeatureIcon category={featureConfig.category} />
          </div>
          {isIncluded ? (
            <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
              Incluido
            </span>
          ) : (
            <PricingBadge tier={tier} size="sm" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{featureConfig.nameEs}</h3>
        <p className="text-sm text-gray-600 mb-4">{featureConfig.descriptionEs}</p>

        {loadingUsage ? (
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse mb-4" />
        ) : isIncluded ? (
          <div className="mb-4">
            {isUnlimited ? (
              <div className="flex items-center gap-2 text-teal-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Ilimitado</span>
              </div>
            ) : (
              <FeatureLimitIndicator
                used={usage.used}
                limit={usage.limit}
                label="Usado este mes"
              />
            )}
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Uso único</span>
              <span className="text-lg font-bold text-gray-900">${featureConfig.singlePurchase.priceMXN} MXN</span>
            </div>
            <p className="text-xs text-gray-500">Por {featureConfig.singlePurchase.unit}</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Pack Mensual</span>
                <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                  -{featureConfig.monthlyBundle.savingsPercent}% OFF
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900">${featureConfig.monthlyBundle.priceMXN} MXN</span>
            </div>
            <p className="text-xs text-gray-500">
              {featureConfig.monthlyBundle.quantity} usos por mes
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        {isIncluded ? (
          <button
            disabled
            className="w-full py-2 px-4 bg-teal-50 text-teal-700 font-medium rounded-lg cursor-not-allowed"
          >
            Activado
          </button>
        ) : canPurchase ? (
          <div className="grid grid-cols-2 gap-3">
            <LoadingButton
              variant="secondary"
              onClick={() => onPurchase(feature, 'single')}
              isLoading={loading}
              className="text-sm"
            >
              Comprar Ahora
            </LoadingButton>
            <LoadingButton
              onClick={() => onPurchase(feature, 'bundle')}
              isLoading={loading}
              className="text-sm"
            >
              Pack Mensual
            </LoadingButton>
          </div>
        ) : (
          <a
            href="/app/premium/upgrade"
            className="block w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all text-center"
          >
            Upgrade a Pro
          </a>
        )}
      </div>
    </div>
  )
}

function FeatureIcon({ category }: { category: 'ai' | 'transcription' | 'priority' }) {
  const icons = {
    ai: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    transcription: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    priority: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  }
  return icons[category]
}

function TierComparison() {
  const tiers: SubscriptionTier[] = ['starter', 'pro', 'elite']
  const features = Object.keys(INDIVIDUAL_PREMIUM_FEATURES) as PremiumFeature[]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Característica</th>
            {tiers.map(tier => (
              <th key={tier} className="text-center py-3 px-4">
                <PricingBadge tier={tier} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map(feature => {
            const featureConfig = INDIVIDUAL_PREMIUM_FEATURES[feature]
            return (
              <tr key={feature} className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-700">{featureConfig.nameEs}</td>
                {tiers.map(tier => {
                  const access = featureConfig.tierAccess[tier]
                  return (
                    <td key={tier} className="text-center py-3 px-4">
                      {access.included ? (
                        access.limit === -1 ? (
                          <span className="inline-flex items-center gap-1 text-teal-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Ilimitado
                          </span>
                        ) : (
                          <span className="text-gray-600">{access.limit}/mes</span>
                        )
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function PremiumMarketplacePage() {
  const [supabase] = useState(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  })
  const [tier, setTier] = useState<SubscriptionTier>('starter')
  const [loading, setLoading] = useState(false)
  const [purchasingFeature, setPurchasingFeature] = useState<PremiumFeature | null>(null)

  useEffect(() => {
    if (!supabase) return

    const fetchTier = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        try {
          const response = await fetch('/api/premium/status')
          if (response.ok) {
            const data = await response.json()
            setTier(data.tier)
          }
        } catch (error) {
          console.error('Error fetching tier:', error)
        }
      }
    }
    fetchTier()
  }, [supabase])

  const handlePurchase = async (feature: PremiumFeature, type: 'single' | 'bundle') => {
    setLoading(true)
    setPurchasingFeature(feature)
    try {
      const response = await fetch('/api/premium/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, purchaseType: type }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        const error = await response.json()
        alert(error.error || 'Error al procesar la compra')
      }
    } catch (error) {
      console.error('Error purchasing:', error)
      alert('Error al procesar la compra')
    } finally {
      setLoading(false)
      setPurchasingFeature(null)
    }
  }

  const features = Object.keys(INDIVIDUAL_PREMIUM_FEATURES) as PremiumFeature[]

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Funcionalidades Premium de IA
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Desbloquea el poder de la inteligencia artificial para mejorar tu práctica médica.
            Compra funcionalidades individualmente o upgrade tu plan.
          </p>
        </div>

        {tier !== 'elite' && (
          <div className="mb-12 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">¿Quieres todas las funcionalidades?</h2>
                <p className="text-purple-100">
                  Upgrade a Elite para obtener acceso ilimitado a todas las funciones de IA
                </p>
              </div>
              <a
                href="/app/premium/upgrade"
                className="px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-colors"
              >
                Ver Planes
              </a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map(feature => (
            <PremiumFeatureCard
              key={feature}
              feature={feature}
              tier={tier}
              onPurchase={handlePurchase}
              loading={loading && purchasingFeature === feature}
            />
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Comparación por Plan</h2>
          </div>
          <TierComparison />
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            ¿Tienes preguntas sobre los planes premium?{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
