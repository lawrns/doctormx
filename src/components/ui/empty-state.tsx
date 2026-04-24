import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Card } from './card'
import { IconBadge } from './icon-badge'

type EmptyStateAction = {
  label: string
  href?: string
  onClick?: () => void
  variant?: React.ComponentProps<typeof Button>['variant']
}

type EmptyStateProps = {
  icon?: LucideIcon
  title: React.ReactNode
  description: React.ReactNode
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  tone?: 'default' | 'subtle' | 'danger' | 'ai'
  layout?: 'center' | 'row'
  className?: string
  children?: React.ReactNode
}

function EmptyStateActionButton({ action, fallbackVariant }: { action: EmptyStateAction; fallbackVariant: EmptyStateAction['variant'] }) {
  const button = (
    <Button
      type="button"
      variant={action.variant || fallbackVariant}
      onClick={action.onClick}
      className="h-10 rounded-[8px]"
    >
      {action.label}
    </Button>
  )

  if (!action.href) return button

  return (
    <Button asChild variant={action.variant || fallbackVariant} className="h-10 rounded-[8px]">
      <a href={action.href}>{action.label}</a>
    </Button>
  )
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  secondaryAction,
  tone = 'default',
  layout = 'center',
  className,
  children,
}: EmptyStateProps) {
  const isDanger = tone === 'danger'
  const isRow = layout === 'row'

  return (
    <Card
      variant="state"
      tone={tone === 'subtle' ? 'ghost' : tone === 'ai' ? 'tint' : 'light'}
      className={cn(
        'flex gap-3 border-[hsl(var(--foreground)/0.07)] shadow-none',
        isRow ? 'items-start text-left' : 'flex-col items-center justify-center',
        isDanger && 'border-destructive/20 bg-destructive/5',
        className
      )}
    >
      <IconBadge icon={isDanger ? AlertCircle : Icon} size="lg" className={cn(isDanger && 'bg-destructive/10 text-destructive')} />
      <div className={cn('min-w-0', isRow ? 'flex-1' : 'max-w-md')}>
        <h2 className="text-[17px] font-semibold leading-6 tracking-[-0.02em] text-foreground">{title}</h2>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
        {children}
        {(action || secondaryAction) && (
          <div className={cn('mt-4 flex flex-col gap-2 sm:flex-row', !isRow && 'justify-center')}>
            {action ? <EmptyStateActionButton action={action} fallbackVariant="default" /> : null}
            {secondaryAction ? <EmptyStateActionButton action={secondaryAction} fallbackVariant="outline" /> : null}
          </div>
        )}
      </div>
    </Card>
  )
}
