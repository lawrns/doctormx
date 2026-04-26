'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface AdminLinkCardProps {
  href: string
  label: string
  icon: LucideIcon
}

export function AdminLinkCard({ href, label, icon: Icon }: AdminLinkCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border-color))] bg-[hsl(var(--surface-card))] p-[var(--space-4)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all"
    >
      <Icon className="h-5 w-5 text-[hsl(var(--interactive))]" />
      <span className="text-sm font-medium text-[hsl(var(--ink))]">{label}</span>
    </Link>
  )
}
