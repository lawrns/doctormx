'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { SupportLink } from '@/lib/support/types'

interface SupportActionCardsProps {
  links: SupportLink[]
  onNavigate?: (link: SupportLink) => void
}

export function SupportActionCards({ links, onNavigate }: SupportActionCardsProps) {
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
            onClick={() => onNavigate?.(link)}
            className="group flex items-center justify-between gap-3 rounded-[1.35rem] border border-slate-200/80 bg-white/92 px-4 py-3.5 text-sm text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/70"
          >
            <div className="min-w-0">
              <div className="font-medium text-slate-900">{link.label}</div>
              {link.description ? (
                <div className="mt-1 text-xs leading-5 text-slate-500">{link.description}</div>
              ) : null}
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-600" />
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
