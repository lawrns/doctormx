'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Sparkles, AlertCircle, Check } from 'lucide-react'
import { QuotaBanner } from '@/components/QuotaCounter'
import { WhatsAppShareCard } from '@/components/WhatsAppShare'
import { EmailCapture, EmailCaptureModal } from '@/components/EmailCapture'
import { PremiumUpgradeModal, QuotaExceededBanner } from '@/components/PremiumUpgradeModal'

export default function AnonymousConsultaPage() {
  const [sessionId, setSessionId] = useState<string>('')
  const [quota, setQuota] = useState<{ used: number; limit: number; remaining: number } | null>(null)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [referrals, setReferrals] = useState<any[]>([])

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

    // Add welcome message
    setMessages([
      {
        role: 'assistant',
        content: '¡Hola! Soy tu asistente médico IA. ¿Qué síntomas o preocupación de salud tienes hoy?',
      },
    ])
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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/preconsulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: [...messages, { role: 'user', content: userMessage }],
          anonymous: true,
        }),
      })

      const data = await res.json()

      if (data.error === 'quota_exceeded') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Has usado tus 5 consultas gratis. Regístrate para obtener más consultas o actualiza a Premium para consultas ilimitadas.',
          },
        ])
        setIsComplete(true)
        return
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])

      if (data.completed) {
        setIsComplete(true)
        setSummary(data.summary)
        setReferrals(data.referrals || [])
        if (data.quota) {
          setQuota(data.quota)

          // Show email capture after 2nd consultation (3 used means this is the 2nd complete)
          if (data.quota.used === 3) {
            setShowEmailCapture(true)
          }

          // Show premium modal after 5 consultations
          if (data.quota.remaining === 0) {
            setTimeout(() => setShowPremiumModal(true), 1000)
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Lo siento, hubo un error. Por favor intenta de nuevo.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Consulta Médica Gratis</h1>
              <p className="text-xs text-gray-500">IA • Confidencial • Sin registro</p>
            </div>
          </div>
          {quota && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{quota.remaining} consultas gratis</p>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: quota.limit }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < quota.used ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Quota Banner */}
        {quota && <QuotaBanner used={quota.used} limit={quota.limit} />}

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h2 className="font-bold">Dr. Simeon</h2>
                <p className="text-sm text-emerald-50">Asistente médico IA • En línea</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="p-6 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          {!isComplete && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Describe tus síntomas..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Enviar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {isComplete && summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-gray-900">Evaluación Completada</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel de urgencia:</span>
                  <span className="font-semibold text-emerald-600">{summary.urgency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Especialidad sugerida:</span>
                  <span className="font-semibold">{summary.specialty}</span>
                </div>
              </div>
            </div>

            {/* Referrals */}
            {referrals.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Doctores Recomendados</h3>
                <div className="space-y-4">
                  {referrals.map((referral: any) => (
                    <div
                      key={referral.doctorId}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <p className="font-semibold text-gray-900">{referral.doctor?.profile?.full_name}</p>
                      <p className="text-sm text-gray-600">{referral.doctor?.specialties?.[0]?.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-700">{referral.doctor?.rating_avg}</span>
                      </div>
                      <a
                        href={`/doctors/${referral.doctorId}`}
                        className="mt-3 inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all"
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
              aiRecommendation={summary.specialty}
            />

            {/* Email Capture (after 2nd consultation) */}
            {quota && quota.used >= 2 && quota.used < 5 && (
              <EmailCapture
                consultationNumber={quota.used}
                onDismiss={() => setShowEmailCapture(false)}
              />
            )}
          </motion.div>
        )}

        {/* Compliance Notice */}
        <div className="mt-6 text-center text-xs text-gray-500">
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
