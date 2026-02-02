'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LucideIcon, Sparkles, ArrowRight, Calendar, ClipboardList, FileText, Clock, User, Search, MessageSquare, Wallet } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  calendar: Calendar,
  clipboard: ClipboardList,
  file: FileText,
  clock: Clock,
  user: User,
  search: Search,
  message: MessageSquare,
  wallet: Wallet,
}

interface EmptyStateProps {
  iconName?: string
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
  variant?: 'default' | 'subtle' | 'ai'
}

export function EmptyState({
  iconName,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const isAI = variant === 'ai'
  const Icon = iconName ? iconMap[iconName] : null

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center rounded-[2.5rem] border transition-all duration-500",
      variant === 'subtle' ? "bg-transparent border-transparent" : "bg-white/50 backdrop-blur-sm border-neutral-100 shadow-sm",
      isAI ? "bg-neutral-900 border-white/10" : "",
      className
    )}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500",
          isAI ? "bg-blue-600/10 text-blue-400" : "bg-primary-50 text-primary-500"
        )}
      >
        {Icon ? <Icon className="w-10 h-10" /> : <Sparkles className="w-10 h-10" />}
      </motion.div>

      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "text-2xl font-bold mb-3 tracking-tight",
          isAI ? "text-white" : "text-neutral-900"
        )}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "text-lg mb-10 max-w-md mx-auto leading-relaxed",
          isAI ? "text-neutral-400" : "text-neutral-500"
        )}
      >
        {description}
      </motion.p>

      <div className="flex flex-col sm:flex-row gap-4">
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button className={cn(
                "h-12 px-8 rounded-xl font-semibold flex items-center gap-2 transition-all",
                isAI ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20" : "bg-primary-600 hover:bg-primary-700 text-white"
              )}>
                {action.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={action.onClick}
              className={cn(
                "h-12 px-8 rounded-xl font-semibold flex items-center gap-2 transition-all",
                isAI ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20" : "bg-primary-600 hover:bg-primary-700 text-white"
              )}
            >
              {action.label}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )
        )}

        {secondaryAction && (
          secondaryAction.href ? (
            <Link href={secondaryAction.href}>
              <Button variant="outline" className={cn(
                "h-12 px-8 rounded-xl font-semibold border-neutral-200 hover:bg-neutral-50 transition-all",
                isAI ? "border-white/10 text-white hover:bg-white/5" : ""
              )}>
                {secondaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className={cn(
                "h-12 px-8 rounded-xl font-semibold border-neutral-200 hover:bg-neutral-50 transition-all",
                isAI ? "border-white/10 text-white hover:bg-white/5" : ""
              )}
            >
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  )
}
