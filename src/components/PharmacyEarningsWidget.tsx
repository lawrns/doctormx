'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/observability/logger'

interface EarningsData {
  totalReferrals: number
  redeemedReferrals: number
  pendingReferrals: number
  totalReferralFees: number
  totalCommissions: number
  platformFees: number
  netEarnings: number
  formatted: {
    totalReferralFees: string
    totalCommissions: string
    platformFees: string
    netEarnings: string
  }
}

interface Referral {
  id: string
  referral_code: string
  status: string
  created_at: string
  pharmacy_name: string | null
  medications_summary: string | null
  estimated_total_cents: number | null
}

export default function PharmacyEarningsWidget() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEarnings() {
      try {
        const response = await fetch('/api/pharmacy/earnings')
        if (response.ok) {
          const data = await response.json()
          setEarnings(data.earnings)
          setReferrals(data.recentReferrals || [])
        }
      } catch (error) {
        logger.error('Error fetching earnings', { error: error instanceof Error ? error.message : String(error) })
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!earnings) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-ink-primary flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ganancias de Farmacias
        </h3>
        <Link
          href="/doctor/pharmacy"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Ver detalles →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-secondary-50 rounded-xl p-4">
          <p className="text-sm text-ink-muted">Total Ganancias</p>
          <p className="text-xl font-bold text-ink-primary">{earnings.formatted.netEarnings}</p>
        </div>
        <div className="bg-primary-50 rounded-xl p-4">
          <p className="text-sm text-ink-muted">Referidos Canjeados</p>
          <p className="text-xl font-bold text-primary-600">{earnings.redeemedReferrals}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4">
          <p className="text-sm text-ink-muted">Pendientes</p>
          <p className="text-xl font-bold text-yellow-600">{earnings.pendingReferrals}</p>
        </div>
        <div className="bg-teal-50 rounded-xl p-4">
          <p className="text-sm text-ink-muted">Tarifa Fija (50 MXN)</p>
          <p className="text-xl font-bold text-teal-600">{earnings.totalReferralFees / 50}</p>
        </div>
      </div>

      {referrals.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-ink-muted mb-3">Referidos Recientes</h4>
          <div className="space-y-2">
            {referrals.slice(0, 5).map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-primary">
                      {referral.pharmacy_name || 'Farmacia'}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {referral.medications_summary || 'Sin medicamentos'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    referral.status === 'redeemed'
                      ? 'bg-teal-50 text-teal-700'
                      : referral.status === 'sent'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {referral.status === 'redeemed' ? 'Canjeado' :
                     referral.status === 'sent' ? 'Enviado' :
                     referral.status === 'pending' ? 'Pendiente' : referral.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
