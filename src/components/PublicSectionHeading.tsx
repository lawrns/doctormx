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
  align = 'left',
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
            'inline-flex items-center rounded-[8px] border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]',
            isDark
              ? 'border-border/30 bg-secondary/50 text-primary-foreground'
              : 'border-primary/20 bg-primary/5 text-primary',
          )}
        >
          {eyebrow}
        </span>
      ) : null}

      <h2
        className={cn(
          'section-headline text-balance',
          isDark ? 'text-foreground' : '',
          titleClassName,
        )}
      >
        {title}
        {accent ? (
          <span className={cn('block', isDark ? 'text-primary' : 'text-primary')}>
            {accent}
          </span>
        ) : null}
      </h2>

      {description ? (
        <p
          className={cn(
            'max-w-3xl text-base leading-7 sm:text-lg',
            isDark ? 'text-muted-foreground' : 'text-muted-foreground',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
