import type { LucideIcon } from 'lucide-react'
import { BrainCircuit, Search, Stethoscope, UserPlus } from 'lucide-react'

export type PublicNavItem = {
  label: string
  compactLabel: string
  href: string
  icon?: LucideIcon
}

export const landingNavItems: PublicNavItem[] = [
  {
    label: 'Consulta IA médica',
    compactLabel: 'Consulta IA',
    href: '/ai-consulta',
    icon: BrainCircuit,
  },
  {
    label: 'Buscar doctores',
    compactLabel: 'Doctores',
    href: '/doctors',
    icon: Search,
  },
  {
    label: 'Soy doctor',
    compactLabel: 'Soy doctor',
    href: '/for-doctors',
    icon: UserPlus,
  },
]

export const sharedHeaderNavItems: PublicNavItem[] = [
  {
    label: 'Buscar doctores',
    compactLabel: 'Doctores',
    href: '/doctors',
    icon: Search,
  },
  {
    label: 'Consulta IA médica',
    compactLabel: 'Consulta IA',
    href: '/ai-consulta',
    icon: BrainCircuit,
  },
  {
    label: 'Especialidades médicas',
    compactLabel: 'Especialidades',
    href: '/specialties',
    icon: Stethoscope,
  },
  {
    label: 'Soy doctor',
    compactLabel: 'Soy doctor',
    href: '/for-doctors',
    icon: UserPlus,
  },
]
