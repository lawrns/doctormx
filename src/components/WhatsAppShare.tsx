'use client'

import { useState } from 'react'
import { Share2, MessageCircle, Check } from 'lucide-react'
import { Button } from './ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface WhatsAppShareProps {
  title?: string
  message?: string
  url?: string
  onShare?: () => void
}

export function WhatsAppShare({
  title = 'Compartir en WhatsApp',
  message = '¡Hola! Te recomiendo Doctor.mx - 5 consultas médicas gratis con IA. Es genial: ',
  url = 'https://doctor.mx',
  onShare,
}: WhatsAppShareProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    message + url
  )}`

  const handleShare = () => {
    window.open(shareUrl, '_blank')
    onShare?.()
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="relative">
      <Button
        onClick={handleShare}
        className="group relative bg-green-500 hover:bg-green-600 text-white font-medium shadow-lg shadow-green-500/30 transition-all"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="shared"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              ¡Compartido!
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {title}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Pulse effect */}
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-xl bg-green-400"
        aria-hidden="true"
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 1.2, opacity: 0 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    </div>
  )
}

interface WhatsAppShareCardProps {
  patientName?: string
  symptoms?: string
  aiRecommendation?: string
  onShare?: () => void
}

export function WhatsAppShareCard({
  patientName = 'Un paciente',
  symptoms = 'síntomas',
  aiRecommendation = 'consulta médica',
  onShare,
}: WhatsAppShareCardProps) {
  const [shared, setShared] = useState(false)

  const defaultText = `¡Hola! ${patientName} usó Doctor.mx para evaluar ${symptoms}. La IA recomendó ${aiRecommendation}. ¡Tienes 5 consultas gratis!`

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-foreground text-lg">
            ¿Conoces a alguien que necesite esto?
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Comparte tu resultado con familiares o amigos en WhatsApp
          </p>
        </div>
        <Share2 className="w-8 h-8 text-[hsl(var(--trust))]" />
      </div>

      <div className="bg-card rounded-xl p-4 mb-4 border border-green-100">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {defaultText}
        </p>
      </div>

      <WhatsAppShare
        title="Compartir en WhatsApp"
        message={defaultText + ' '}
        onShare={() => {
          setShared(true)
          onShare?.()
        }}
      />

      {shared && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center text-sm text-primary font-medium"
        >
          ¡Gracias por compartir! Ayudas a más personas a acceder a salud gratis.
        </motion.div>
      )}
    </div>
  )
}

/**
 * Floating WhatsApp share button for AI results
 */
export function FloatingWhatsAppShare({
  onClick,
}: {
  onClick?: () => void
}) {
  return (
    <motion.button
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl shadow-green-500/40 flex items-center justify-center transition-all"
      aria-label="Compartir en WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />

      {/* Pulse ring */}
      <motion.span
        className="absolute inset-0 rounded-full bg-green-400"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.button>
  )
}
