// Configuración centralizada - Principio 5: Todo debe poder cambiar

export const APPOINTMENT_CONFIG = {
  DURATION_MINUTES: 30,
  MAX_ADVANCE_DAYS: 30,
  SLOT_INTERVAL_MINUTES: 30,
  PRE_CONSULTATION_ACCESS_MINUTES: 10,
} as const

export const SPECIALTIES = [
  { slug: 'general', name: 'Medicina General' },
  { slug: 'pediatria', name: 'Pediatría' },
  { slug: 'ginecologia', name: 'Ginecología' },
  { slug: 'dermatologia', name: 'Dermatología' },
  { slug: 'cardiologia', name: 'Cardiología' },
  { slug: 'psicologia', name: 'Psicología' },
  { slug: 'nutricion', name: 'Nutrición' },
] as const

export const PAYMENT_CONFIG = {
  CURRENCY: 'MXN',
  MIN_PRICE_CENTS: 10000, // $100 MXN
  MAX_PRICE_CENTS: 500000, // $5,000 MXN
  DEFAULT_PRICE_CENTS: 50000, // $500 MXN
} as const

export const VIDEO_CONFIG = {
  PROVIDER: 'jitsi', // 'jitsi' | 'daily'
  JITSI_DOMAIN: 'meet.jit.si',
} as const

export const STATUS = {
  APPOINTMENT: {
    PENDING_PAYMENT: 'pending_payment',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  DOCTOR: {
    PENDING: 'pending',      // No verificado (puede configurar todo)
    APPROVED: 'approved',    // Verificado (visible en catálogo)
    SUSPENDED: 'suspended',  // Suspendido por admin
  },
} as const
