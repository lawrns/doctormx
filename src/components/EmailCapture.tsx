'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Check, X } from 'lucide-react'

interface EmailCaptureProps {
  consultationNumber: number
  onEmailProvided?: (email: string) => void
  onDismiss?: () => void
}

export function EmailCapture({ consultationNumber, onEmailProvided, onDismiss }: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setSubmitted(true)
    onEmailProvided?.(email)

    // Store in localStorage for persistence
    localStorage.setItem('doctor_mx_email', email)
  }

  // Don't show if already submitted or email exists
  const existingEmail = typeof window !== 'undefined' ? localStorage.getItem('doctor_mx_email') : null
  if (existingEmail || submitted) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-primary/20 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">
                ¡No pierdas tu progreso!
              </h3>
              <p className="text-sm text-muted-foreground">
                Guarda tus consultas para acceder desde cualquier dispositivo
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Te quedan {5 - consultationNumber} consultas gratis. Regístrate para guardar tu historial.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Solo usaremos tu email para enviarte recordatorios de consultas. Sin spam.
            </p>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 bg-primary/5 border border-green-200 rounded-xl"
          >
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-800">¡Guardado!</p>
              <p className="text-sm text-green-700">Tu historial está seguro</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

interface EmailCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  consultationNumber: number
}

export function EmailCaptureModal({ isOpen, onClose, consultationNumber }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)

    // Call API to save email
    try {
      const res = await fetch('/api/anonymous/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consultationNumber }),
      })

      if (res.ok) {
        setSubmitted(true)
        localStorage.setItem('doctor_mx_email', email)

        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Error saving email:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        {!submitted ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">
                    Guarda tu progreso
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Consulta #{consultationNumber} de 5
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-muted-foreground">
                Te quedan <strong>{5 - consultationNumber} consultas gratis</strong>.
                Regístrate para guardar tu historial y acceder desde cualquier dispositivo.
              </p>

              <div className="bg-primary/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Check className="w-4 h-4" />
                  <span>Historial de consultas guardado</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Check className="w-4 h-4" />
                  <span>Acceso desde cualquier dispositivo</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Check className="w-4 h-4" />
                  <span>Recordatorios de salud</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={loading}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-border text-muted-foreground font-semibold rounded-xl hover:bg-secondary/50 transition-colors"
                  disabled={loading}
                >
                  Ahora no
                </button>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Guardando...' : 'Guardar mi progreso'}
                </button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Solo usaremos tu email para consultas. Sin spam.
              </p>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-xl mb-2">¡Guardado!</h3>
            <p className="text-muted-foreground mb-6">Tu historial está seguro</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Continuar
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
