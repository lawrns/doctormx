'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

const placeholderLogos = [
  { id: 1, label: 'Logo 1' },
  { id: 2, label: 'Logo 2' },
  { id: 3, label: 'Logo 3' },
  { id: 4, label: 'Logo 4' },
  { id: 5, label: 'Logo 5' },
]

export function PressSection() {
  const t = useTranslations('landing.press')

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          className="text-center"
        >
          <p className="text-sm text-text-muted font-medium mb-8">
            {t('recognizedIn')}
          </p>

          {/* Press/Trust Logos */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <span className="text-xs text-text-muted mr-2">{t('asSeenIn')}</span>
            {placeholderLogos.map((logo, index) => (
              <motion.div
                key={logo.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: [0, 0, 0.2, 1]
                }}
                className="w-[120px] h-[60px] bg-neutral-200/50 rounded-lg flex items-center justify-center"
              >
                <span className="text-xs text-text-muted font-medium">
                  {logo.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Key Differentiators */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-text-secondary"
          >
            {t('differentiators')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
