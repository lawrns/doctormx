import { cn } from '@/lib/utils'

type DoctorMxLogoProps = {
  className?: string
  markClassName?: string
  textClassName?: string
  inverted?: boolean
  showDescriptor?: boolean
}

export function DoctorMxLogo({
  className,
  markClassName,
  textClassName,
  inverted = false,
  showDescriptor = false,
}: DoctorMxLogoProps) {
  const textColor = inverted ? 'text-[#f7f8fb]' : 'text-ink'
  const descriptorColor = inverted ? 'text-[#f7f8fb]/55' : 'text-muted-foreground'

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={cn('h-9 w-9 shrink-0', markClassName)}
      >
        <rect x="1" y="1" width="36" height="36" rx="11" fill={inverted ? '#F7F8FB' : '#0A1533'} />
        <rect x="1" y="1" width="36" height="36" rx="11" stroke={inverted ? 'rgba(247,248,251,0.22)' : 'rgba(10,21,51,0.14)'} strokeWidth="2" />
        <path
          d="M13 10.5H19.4C25.15 10.5 29 14.02 29 19C29 23.98 25.15 27.5 19.4 27.5H13V10.5Z"
          stroke={inverted ? '#0A1533' : '#F7F8FB'}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M17.25 15.25H19.7C22.15 15.25 23.85 16.73 23.85 19C23.85 21.27 22.15 22.75 19.7 22.75H17.25V15.25Z"
          fill={inverted ? '#0A1533' : '#F7F8FB'}
          opacity="0.16"
        />
        <path d="M25.75 9.25V15.25" stroke="#00A878" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M22.75 12.25H28.75" stroke="#00A878" strokeWidth="2.1" strokeLinecap="round" />
        <circle cx="30" cy="28.25" r="2" fill="#00A878" />
      </svg>

      <span className="grid min-w-0 gap-0.5">
        <span
          className={cn(
            'whitespace-nowrap font-display text-[1.18rem] font-semibold leading-none tracking-[-0.035em]',
            textColor,
            textClassName
          )}
        >
          Doctor<span className="text-vital">.mx</span>
        </span>
        {showDescriptor ? (
          <span className={cn('hidden font-mono text-[9px] font-semibold uppercase leading-none tracking-[0.18em] sm:block', descriptorColor)}>
            Salud digital
          </span>
        ) : null}
      </span>
    </span>
  )
}
