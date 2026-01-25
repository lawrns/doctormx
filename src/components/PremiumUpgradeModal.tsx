'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Check, ArrowRight, Sparkles, Zap, Shield, Clock } from 'lucide-react'
import Link from 'next/link'

interface PremiumUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  consultationCount: number
}

export function PremiumUpgradeModal({ isOpen, onClose, consultationCount }: PremiumUpgradeModalProps) {
  if (!isOpen) return null

  const plans = [
    {
      name: 'Básico',
      price: 'Gratis',
      period: '',
      features: [
        '5 consultas mensuales',
        'Historial guardado',
        'Recomendaciones de doctores',
      ],
      cta: 'Plan actual',
      disabled: true,
      color: 'gray',
    },
    {
      name: 'Premium',
      price: '$199',
      period: '/mes',
      features: [
        'Consultas ilimitadas con IA',
        'Análisis de resultados de laboratorio',
        'Segunda opinión médica',
        'Historial completo ilimitado',
        'Prioridad en respuestas',
        'Soporte prioritario',
      ],
      cta: 'Empezar Premium',
      popular: true,
      color: 'emerald',
    },
    {
      name: 'Familia',
      price: '$499',
      period: '/mes',
      features: [
        'Todo lo de Premium',
        'Hasta 5 miembros de familia',
        'Perfil médico compartido',
        'Alertas de salud familiar',
        'Descuentos en consultas',
      ],
      cta: 'Elegir Familia',
      color: 'blue',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute text-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              ¡Has usado tus 5 consultas gratis!
            </h2>
            <p className="text-blue-50 text-lg">
              Actualiza a Premium para continuar accediendo a salud ilimitada
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Why Upgrade */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 text-xl mb-4 text-center">
              ¿Por qué actualizar a Premium?
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: Zap,
                  title: 'Consultas Ilimitadas',
                  description: 'Sin límite de consultas con IA médica',
                },
                {
                  icon: Shield,
                  title: 'Segunda Opinión',
                  description: 'Opiniones de especialistas certificados',
                },
                {
                  icon: Clock,
                  title: 'Respuestas Rápidas',
                  description: 'Prioridad en todas tus consultas',
                },
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <benefit.icon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border-2 p-6 ${
                  plan.popular
                    ? 'border-blue-500 shadow-xl shadow-blue-500/20'
                    : 'border-gray-200'
                } ${plan.disabled ? 'opacity-60' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      MÁS POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h4 className="font-bold text-gray-900 text-2xl mb-2">{plan.name}</h4>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.disabled ? '#' : '/auth/register?plan=' + plan.name.toLowerCase()}
                  onClick={plan.disabled ? (e) => e.preventDefault() : undefined}
                >
                  <button
                    disabled={plan.disabled}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.disabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : plan.color === 'emerald'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg'
                        : plan.color === 'blue'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {plan.cta}
                    {!plan.disabled && <ArrowRight className="w-4 h-4 inline ml-2" />}
                  </button>
                </Link>
              </div>
            ))}
          </div>

          {/* Close Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Continuar con el plan gratis
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

interface QuotaExceededBannerProps {
  onUpgrade: () => void
}

export function QuotaExceededBanner({ onUpgrade }: QuotaExceededBannerProps) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              ¡Has usado tus 5 consultas gratis!
            </h3>
            <p className="text-gray-600 text-sm">
              Actualiza a Premium para continuar accediendo a consultas ilimitadas
            </p>
          </div>
        </div>
        <button
          onClick={onUpgrade}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all flex items-center gap-2"
        >
          <Crown className="w-4 h-4" />
          Actualizar a Premium
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
