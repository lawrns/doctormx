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
            className="group flex items-center justify-between gap-3 rounded-[1.35rem] border border-border/80 bg-card/92 px-4 py-3.5 text-sm text-foreground shadow-[0_10px_30px_hsl(var(--shadow-color)/0.06)] transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5"
          >
            <div className="min-w-0">
              <div className="font-medium text-foreground">{link.label}</div>
              {link.description ? (
                <div className="mt-1 text-xs leading-5 text-muted-foreground">{link.description}</div>
              ) : null}
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
