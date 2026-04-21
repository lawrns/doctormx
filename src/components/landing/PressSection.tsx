'use client'

import { motion } from 'framer-motion'

export function PressSection() {
  return (
    <section className="py-12 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          className="text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm text-text-secondary"
          >
            Más de 500 doctores verificados &bull; 10,000+ consultas &bull; 98% satisfacción &bull; Servicio 24/7
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
