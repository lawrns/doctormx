import { cn } from '@/lib/utils'

type PublicSectionHeadingProps = {
  eyebrow?: string
  title: string
  accent?: string
  description?: string
  align?: 'left' | 'center'
  theme?: 'light' | 'dark'
  className?: string
  titleClassName?: string
}

export function PublicSectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = 'center',
  theme = 'light',
  className,
  titleClassName,
}: PublicSectionHeadingProps) {
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'public-heading-stack',
        align === 'center' ? 'text-center items-center' : 'text-left items-start',
        'flex flex-col',
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]',
            isDark
              ? 'border-white/15 bg-white/10 text-sky-100'
              : 'border-blue-100 bg-blue-50 text-blue-700',
          )}
        >
          {eyebrow}
        </span>
      ) : null}

      <h2
        className={cn(
          'section-headline text-balance',
          isDark ? 'text-white' : '',
          titleClassName,
        )}
      >
        {title}
        {accent ? (
          <span className={cn('block', isDark ? 'text-sky-300' : 'text-[hsl(var(--brand-ocean))]')}>
            {accent}
          </span>
        ) : null}
      </h2>

      {description ? (
        <p
          className={cn(
            'max-w-3xl text-base leading-7 sm:text-lg',
            isDark ? 'text-slate-200/90' : 'text-slate-600',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
