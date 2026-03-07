'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Home } from 'lucide-react'
import Link from 'next/link'
import { QuotaBanner } from '@/components/QuotaCounter'
import { WhatsAppShareCard } from '@/components/WhatsAppShare'
import { EmailCapture, EmailCaptureModal } from '@/components/EmailCapture'
import { PremiumUpgradeModal } from '@/components/PremiumUpgradeModal'
import PreConsultaChat from '@/components/PreConsultaChat'
import type { DoctorMatch } from '@/lib/ai/referral'

export default function AnonymousConsultaPage() {
  const [sessionId, setSessionId] = useState<string>('')
  const [quota, setQuota] = useState<{ used: number; limit: number; remaining: number } | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [referrals, setReferrals] = useState<DoctorMatch[]>([])

  // New states
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  useEffect(() => {
    // Generate or retrieve session ID
    const existingSession = localStorage.getItem('doctor_mx_session')
    if (existingSession) {
      setSessionId(existingSession)
      checkQuota(existingSession)
    } else {
      const newSession = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem('doctor_mx_session', newSession)
      setSessionId(newSession)
      checkQuota(newSession)
    }
  }, [])

  const checkQuota = async (sid: string) => {
    try {
      const res = await fetch('/api/ai/quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', sessionId: sid }),
      })
      const data = await res.json()
      if (data.success) {
        setQuota(data.quota)
      }
    } catch (error) {
      console.error('Error checking quota:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[hsl(var(--card)/0.85)] backdrop-blur-md border-b border-[hsl(var(--border))] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[hsl(var(--brand-ocean))] rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[hsl(var(--text-primary))]">Doctor.mx</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Inicio</span>
            </Link>
            {quota && (
              <div className="text-right">
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{quota.remaining} consultas gratis</p>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: quota.limit }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < quota.used ? 'bg-[hsl(var(--brand-ocean))]' : 'bg-[hsl(var(--border))]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Quota Banner */}
        {quota && <QuotaBanner used={quota.used} limit={quota.limit} />}

        {!isComplete && sessionId && (
          <PreConsultaChat
            isOpen={true}
            onCloseAction={() => undefined}
            onCompleteAction={(_, nextSummary, nextReferrals) => {
              setIsComplete(true)
              setSummary(nextSummary)
              setReferrals(nextReferrals || [])
              checkQuota(sessionId)
              setShowEmailCapture(true)
            }}
            mode="embedded"
            anonymous={true}
            initialSessionId={sessionId}
            showQuota={true}
          />
        )}

        {/* Results Section */}
        {isComplete && summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Summary Card */}
            <div className="bg-[hsl(var(--card))] rounded-2xl shadow-lg border border-[hsl(var(--border))] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-[hsl(var(--brand-ocean))]" />
                <h3 className="font-bold text-[hsl(var(--text-primary))]">Evaluación Completada</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--text-secondary))]">Nivel de urgencia:</span>
                  <span className="font-semibold text-[hsl(var(--brand-ocean))]">{summary.urgencyLevel || summary.urgency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--text-secondary))]">Especialidad sugerida:</span>
                  <span className="font-semibold">{summary.suggestedSpecialty || summary.specialty}</span>
                </div>
              </div>
            </div>

            {/* Referrals */}
            {referrals.length > 0 && (
              <div className="bg-[hsl(var(--card))] rounded-2xl shadow-lg border border-[hsl(var(--border))] p-6">
                <h3 className="font-bold text-[hsl(var(--text-primary))] mb-4">Doctores Recomendados</h3>
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div
                      key={referral.doctorId}
                      className="border border-[hsl(var(--border))] rounded-xl p-4 hover:shadow-md hover:border-[hsl(var(--border)/0.5)] transition-all"
                    >
                      <p className="font-semibold text-[hsl(var(--text-primary))]">{referral.doctor?.profile?.full_name}</p>
                      <p className="text-sm text-[hsl(var(--text-secondary))]">{referral.doctor?.specialties?.[0]?.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-[hsl(var(--text-primary))]">{referral.doctor?.rating_avg}</span>
                      </div>
                      <a
                        href={`/doctors/${referral.doctorId}`}
                        className="mt-3 inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        Agendar Cita
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp Share */}
            <WhatsAppShareCard
              patientName="Un usuario"
              symptoms="síntomas médicos"
              aiRecommendation={summary.suggestedSpecialty || summary.specialty}
            />

            {/* Email Capture (after 2nd consultation) */}
            {showEmailCapture && quota && quota.used >= 2 && quota.used < 5 && (
              <EmailCapture
                consultationNumber={quota.used}
                onDismiss={() => setShowEmailCapture(false)}
              />
            )}
          </motion.div>
        )}

        {/* Compliance Notice */}
        <div className="mt-6 text-center text-xs text-[hsl(var(--text-muted))]">
          <p>Servicio de orientación médica con IA. No sustituye la consulta presencial.</p>
          <p className="mt-1">En caso de emergencia, llama al 911.</p>
        </div>
      </main>

      {/* Modals */}
      {showEmailModal && (
        <EmailCaptureModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          consultationNumber={quota?.used || 0}
        />
      )}

      {showPremiumModal && (
        <PremiumUpgradeModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          consultationCount={quota?.used || 0}
        />
      )}
    </div>
  )
}
