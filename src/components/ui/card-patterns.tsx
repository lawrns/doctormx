import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from './card'
import { IconBadge } from './icon-badge'
import { SectionHeader } from './section-header'
import { Button } from './button'

type FeatureItem = {
  title: React.ReactNode
  body: React.ReactNode
  icon?: LucideIcon
}

export function FeatureGrid({
  items,
  columns = 'auto',
  className,
}: {
  items: FeatureItem[]
  columns?: 'auto' | 'three'
  className?: string
}) {
  return (
    <div
      className={cn(
        columns === 'auto'
          ? 'grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]'
          : 'grid gap-3 md:grid-cols-3',
        className
      )}
    >
      {items.map((item) => (
        <Card key={String(item.title)} variant="feature" density="compact">
          <div className="flex gap-3">
            {item.icon ? <IconBadge icon={item.icon} size="md" /> : null}
            <div>
              <h3 className="text-[15px] font-semibold leading-5 tracking-[-0.02em] text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{item.body}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function StepTimeline({
  eyebrow,
  title,
  body,
  steps,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  body?: React.ReactNode
  steps: FeatureItem[]
  className?: string
}) {
  return (
    <section className={cn('public-section', className)}>
      <div className="editorial-shell">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <SectionHeader eyebrow={eyebrow} title={title} className="lg:sticky lg:top-24">
            {body}
          </SectionHeader>
          <div className="divide-y divide-border overflow-hidden rounded-[var(--card-radius-hero)] border border-[var(--card-border)] bg-card shadow-[var(--card-shadow)]">
            {steps.map((step, index) => (
              <div key={String(step.title)} className="grid gap-3 p-4 sm:grid-cols-[2.75rem_1fr] sm:items-start">
                <p className="font-mono text-[11px] font-semibold text-primary">
                  {(index + 1).toString().padStart(2, '0')}
                </p>
                <div className="flex gap-3">
                  {step.icon ? <IconBadge icon={step.icon} size="md" /> : null}
                  <div>
                    <h3 className="text-base font-semibold leading-5 tracking-[-0.02em] text-foreground">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function CTABand({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  body?: React.ReactNode
  primary?: React.ReactElement
  secondary?: React.ReactElement
  className?: string
}) {
  return (
    <section className={cn('public-section-compact', className)}>
      <div className="editorial-shell">
        <Card variant="preview" density="comfortable">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <SectionHeader eyebrow={eyebrow} title={title} className="mb-0">
              {body}
            </SectionHeader>
            {(primary || secondary) ? (
              <div className="flex flex-wrap gap-3 lg:justify-end">
                {primary}
                {secondary}
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </section>
  )
}

export function TrustBar({
  items,
  dark = false,
  className,
}: {
  items: FeatureItem[]
  dark?: boolean
  className?: string
}) {
  return (
    <Card
      variant="chip"
      tone={dark ? 'dark' : 'light'}
      className={cn('grid gap-0 overflow-hidden p-0 sm:grid-cols-2 lg:grid-cols-5', className)}
    >
      {items.map((item) => (
        <div key={String(item.title)} className="flex items-center gap-2.5 border-b border-[var(--card-border)] px-3 py-2.5 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
          {item.icon ? <IconBadge icon={item.icon} size="sm" tone={dark ? 'dark' : 'light'} /> : null}
          <span>
            <span className={cn('block text-sm font-semibold leading-5', dark ? 'text-white' : 'text-foreground')}>{item.title}</span>
            <span className={cn('block text-[12px] leading-4', dark ? 'text-white/64' : 'text-muted-foreground')}>{item.body}</span>
          </span>
        </div>
      ))}
    </Card>
  )
}

export { SectionHeader, IconBadge, Card, Button }
