/**
 * Doctor.mx Editorial Design System Components
 * Not generic UI — these are the signature patterns that make the brand.
 */

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

/* ────────────────────────────
   Eyebrow — mono label with hairline
   ──────────────────────────── */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground',
        className
      )}
    >
      <span className="inline-block h-px w-6 bg-current" />
      {children}
    </span>
  )
}

/* ────────────────────────────
   ChapterHeader — editorial section header
   grid: 160px left column for number, 1fr for title+lead
   ──────────────────────────── */
export function ChapterHeader({
  number,
  title,
  lead,
  className,
}: {
  number: string
  title: ReactNode
  lead?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-[160px_1fr] gap-8 md:gap-16 mb-16 md:mb-20',
        className
      )}
    >
      <div className="pt-1">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-vital">
          {number}
        </span>
      </div>
      <div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
          {title}
        </h2>
        {lead && (
          <p className="font-serif text-lg md:text-xl italic text-foreground/80 leading-relaxed max-w-[52ch]">
            {lead}
          </p>
        )}
      </div>
    </div>
  )
}

/* ────────────────────────────
   HeroStat — display number + mono label
   ──────────────────────────── */
export function HeroStat({
  value,
  label,
  className,
}: {
  value: ReactNode
  label: string
  className?: string
}) {
  return (
    <div className={cn('flex items-baseline justify-between pb-4 border-b border-border/60', className)}>
      <span className="font-display text-4xl md:text-5xl font-light tracking-tight text-foreground">
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground text-right max-w-[180px]">
        {label}
      </span>
    </div>
  )
}

/* ────────────────────────────
   EditorialSection — chapter wrapper
   120px vertical padding, border-top separator
   ──────────────────────────── */
export function EditorialSection({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section
      id={id}
      className={cn('py-20 md:py-28 border-t border-border', className)}
    >
      {children}
    </section>
  )
}

/* ────────────────────────────
   ColorFeature — signature feature cards
   Cobalt variant has radial gradient glow
   ──────────────────────────── */
export function ColorFeature({
  variant = 'cobalt',
  label,
  title,
  value,
  children,
  className,
}: {
  variant?: 'cobalt' | 'vital' | 'coral'
  label: string
  title: ReactNode
  value?: string
  children?: ReactNode
  className?: string
}) {
  const variantClasses = {
    cobalt:
      'bg-cobalt-700 text-white relative overflow-hidden before:absolute before:-top-[40%] before:-right-[20%] before:w-[120%] before:h-[160%] before:rounded-full before:bg-[radial-gradient(circle,var(--cobalt-500)_0%,transparent_60%)] before:opacity-40',
    vital: 'bg-card text-foreground border border-border relative',
    coral: 'bg-coral text-white relative overflow-hidden',
  }

  return (
    <div
      className={cn(
        'aspect-[4/3] rounded-3xl p-8 md:p-10 flex flex-col justify-between',
        variantClasses[variant],
        className
      )}
    >
      <div className="relative z-10">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] opacity-70 mb-auto block">
          {label}
        </span>
        <h3 className="text-4xl md:text-5xl font-display font-bold mt-4">{title}</h3>
      </div>
      <div className="relative z-10 mt-4">
        {children}
        {value && (
          <span className="font-mono text-[13px] opacity-80 block mt-4">{value}</span>
        )}
      </div>
    </div>
  )
}

/* ────────────────────────────
   PulseDot — living indicator
   ──────────────────────────── */
export function PulseDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full bg-vital animate-pulse',
        className
      )}
    />
  )
}

/* ────────────────────────────
   PageHero — editorial hero block
   Not a generic centered block. Uses the full width,
   dramatic type, optional eyebrow, optional stat row.
   ──────────────────────────── */
export function PageHero({
  eyebrow,
  title,
  lead,
  stats,
  children,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  stats?: { value: ReactNode; label: string }[]
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('pt-24 md:pt-32 pb-16 md:pb-20', className)}>
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        {eyebrow && <Eyebrow className="mb-8">{eyebrow}</Eyebrow>}
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[0.95] mb-8 md:mb-12">
          {title}
        </h1>
        {lead && (
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 mt-12 pt-10 border-t border-border">
            <p className="font-serif text-xl md:text-2xl italic text-foreground/90 leading-relaxed max-w-[52ch]">
              {lead}
            </p>
            {stats && stats.length > 0 && (
              <div className="space-y-4">
                {stats.map((s, i) => (
                  <HeroStat key={i} value={s.value} label={s.label} />
                ))}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

/* ────────────────────────────
   SignatureCard — not a generic shadcn Card.
   Uses the design system's radius, shadow, border,
   and hover lift that the subagents missed.
   ──────────────────────────── */
export function SignatureCard({
  children,
  className,
  hover = true,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-2xl p-6 md:p-8',
        hover &&
          'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(15,37,95,0.15),0_6px_18px_-6px_rgba(15,37,95,0.08)] hover:border-ink/40',
        className
      )}
    >
      {children}
    </div>
  )
}
