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
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-card/50 backdrop-blur-sm rounded-3xl border border-border shadow-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-500"
      >
        <Icon className="w-10 h-10" />
      </motion.div>

      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-foreground mb-3"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed"
      >
        {description}
      </motion.p>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 p-4 bg-secondary/50 rounded-xl border border-border w-full max-w-lg"
        >
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Error Details</p>
          <p className="text-sm font-mono text-rose-600 break-all">{errorMessage}</p>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button className="bg-primary-600 hover:bg-primary-700 text-white min-w-[160px] h-12 rounded-xl flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button
              onClick={action.onClick}
              className="bg-primary-600 hover:bg-primary-700 text-white min-w-[160px] h-12 rounded-xl flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {action.label}
            </Button>
          )
        )}

        {showHome && (
          <Link href="/">
            <Button variant="outline" className="min-w-[160px] h-12 rounded-xl flex items-center gap-2 border-border hover:bg-secondary/50">
              <Home className="w-4 h-4" />
              Ir al inicio
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
