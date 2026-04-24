import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type IconBadgeProps = {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark'
  className?: string
}

const sizeMap = {
  sm: 'h-6 w-6 [&_svg]:h-3.5 [&_svg]:w-3.5',
  md: 'h-8 w-8 [&_svg]:h-4 [&_svg]:w-4',
  lg: 'h-10 w-10 [&_svg]:h-5 [&_svg]:w-5',
}

export function IconBadge({ icon: Icon, size = 'md', tone = 'light', className }: IconBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[8px]',
        sizeMap[size],
        tone === 'dark' ? 'bg-white/10 text-[#8fc4ff]' : 'bg-[hsl(var(--surface-tint))] text-primary',
        className
      )}
      aria-hidden="true"
    >
      <Icon />
    </span>
  )
}
