// Badge component for status indicators
type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

type BadgeProps = {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-primary/10 text-primary',
  neutral: 'bg-secondary text-foreground',
}

export function Badge({ children, variant = 'neutral', size = 'sm', className }: BadgeProps) {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles} ${className || ''}`}>
      {children}
    </span>
  )
}

// Helper to map appointment status to badge variant
export function getAppointmentBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending_payment':
      return 'warning'
    case 'completed':
      return 'info'
    case 'cancelled':
    case 'no_show':
    case 'refunded':
      return 'error'
    default:
      return 'neutral'
  }
}

export function getAppointmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending_payment: 'Pago pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
    no_show: 'No asistió',
    refunded: 'Reembolsada',
  }
  return labels[status] || status
}
