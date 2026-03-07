'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { SupportLink } from '@/lib/support/types'

interface SupportActionCardsProps {
  links: SupportLink[]
}

export function SupportActionCards({ links }: SupportActionCardsProps) {
  if (links.length === 0) {
    return null
  }

  return (
    <div className="grid gap-2.5">
      {links.map((link, index) => (
        <motion.div
          key={`${link.href}-${link.label}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.28 }}
        >
          <Link
            href={link.href}
            className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 shadow-[0_8px_26px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/70"
          >
            <span>{link.label}</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-600" />
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
