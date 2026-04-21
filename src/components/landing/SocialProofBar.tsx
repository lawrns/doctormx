'use client'

import { motion } from 'framer-motion'

const outlets = [
  { name: 'Forbes México', width: 'w-28' },
  { name: 'Expansión', width: 'w-24' },
  { name: 'El Financiero', width: 'w-28' },
  { name: 'TechCrunch', width: 'w-24' },
]

export function SocialProofBar() {
  return (
    <section className="border-y border-[#d4d9e3] bg-[#eef0f5] py-7">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#5c6783]">
          Reconocido por
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {outlets.map((outlet) => (
            <motion.span
              key={outlet.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className={`${outlet.width} select-none font-display text-lg font-bold tracking-tight text-[#0a1533]/25 grayscale transition-opacity hover:opacity-60 sm:text-xl`}
            >
              {outlet.name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}
