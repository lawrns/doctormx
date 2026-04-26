'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LucideIcon, RefreshCw, AlertCircle, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorStateProps {
  icon?: LucideIcon
  title: string
  description: string
  error?: string | Error
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  showHome?: boolean
}

export function ErrorState({
  icon: Icon = AlertCircle,
  title,
  description,
  error,
  action,
  showHome = true,
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[12px] border border-border bg-card p-6 text-center shadow-[var(--card-shadow)]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-[8px] bg-rose-50 text-rose-500"
      >
        <Icon className="h-5 w-5" />
      </motion.div>

      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-2 text-[17px] font-semibold leading-6 tracking-[-0.02em] text-foreground"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mx-auto mb-5 max-w-md text-sm leading-6 text-muted-foreground"
      >
        {description}
      </motion.p>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-5 w-full max-w-lg rounded-[10px] border border-border bg-secondary/50 p-3"
        >
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Error Details</p>
          <p className="text-sm font-mono text-rose-600 break-all">{errorMessage}</p>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button className="flex h-10 min-w-[160px] items-center gap-2 rounded-[8px] bg-primary-600 text-white hover:bg-primary-700">
                <RefreshCw className="w-4 h-4" />
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button
              onClick={action.onClick}
              className="flex h-10 min-w-[160px] items-center gap-2 rounded-[8px] bg-primary-600 text-white hover:bg-primary-700"
            >
              <RefreshCw className="w-4 h-4" />
              {action.label}
            </Button>
          )
        )}

        {showHome && (
          <Link href="/">
            <Button variant="secondary" className="flex h-10 min-w-[160px] items-center gap-2 rounded-[8px] border-border hover:bg-secondary/50">
              <Home className="w-4 h-4" />
              Ir al inicio
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
