'use client'

import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'
import TrialBanner from '@/components/TrialBanner'
import { 
  LayoutDashboard, Calendar, MessageCircle, Pill, BarChart3, Bell, 
  FileText, MessageSquare, Code2, Star, Gift, User, ClipboardList,
  LogOut, Menu, X, Mail, ChevronDown, ChevronUp, Lock
} from 'lucide-react'

interface DoctorLayoutProps {
  children: ReactNode
  profile: { full_name: string; id?: string }
  isPending: boolean
  currentPath?: string
  pendingAppointments?: number
  doctorId?: string
}

export default function DoctorLayout({ children, profile, isPending, currentPath = '/doctor', pendingAppointments = 0, doctorId }: DoctorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toolsExpanded, setToolsExpanded] = useState(false)

  const primaryNav = [
    { name: 'Dashboard', href: '/doctor', icon: LayoutDashboard, enabled: true },
    { name: 'Citas', href: '/doctor/appointments', icon: ClipboardList, enabled: !isPending },
    { name: 'Consulta', href: '/doctor/chat', icon: MessageCircle, enabled: !isPending },
    { name: 'Recetas', href: '/doctor/pharmacy', icon: Pill, enabled: !isPending },
    { name: 'Perfil', href: '/doctor/profile', icon: User, enabled: true },
  ]

  const secondaryNav = [
    { name: 'Disponibilidad', href: '/doctor/availability', icon: Calendar, enabled: !isPending },
    { name: 'Análisis', href: '/doctor/analytics', icon: BarChart3, enabled: !isPending },
    { name: 'Recordatorios', href: '/doctor/reminders', icon: Bell, enabled: !isPending },
    { name: 'Formularios', href: '/doctor/intake-forms', icon: FileText, enabled: !isPending },
    { name: 'Preguntas', href: '/doctor/preguntas', icon: MessageSquare, enabled: !isPending },
    { name: 'Widget', href: '/doctor/widget', icon: Code2, enabled: !isPending },
    { name: 'Plan', href: '/doctor/subscription', icon: Star, enabled: true },
    { name: 'Referidos', href: '/doctor/referrals', icon: Gift, enabled: !isPending },
  ]

  const renderNavItem = (item: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; enabled: boolean }) => {
    const active = currentPath === item.href
    const disabled = !item.enabled

    return (
      <Link
        key={item.href}
        href={disabled ? '#' : item.href}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault()
          } else {
            setSidebarOpen(false)
          }
        }}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : disabled
              ? "text-muted-foreground/50 cursor-not-allowed"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span>{item.name}</span>
        {disabled && (
          <Lock className="w-4 h-4 ml-auto text-muted-foreground/50" />
        )}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="lg:hidden nav-sticky sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <DoctorMxLogo />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {!isPending && (
              <Link
                href="/doctor/appointments?status=pending_payment"
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                title="Citas pendientes"
              >
                <Bell className="w-5 h-5" />
                {pendingAppointments > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-destructive rounded-full">
                    {pendingAppointments > 99 ? '99+' : pendingAppointments}
                  </span>
                )}
              </Link>
            )}

            {isPending ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber/10 text-amber">
                En revisión
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[hsl(var(--trust-soft))] text-[hsl(var(--trust))]">
                Verificado
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-background sticky top-0 h-screen">
          <div className="p-[var(--space-4)]">
            <Link href="/" className="flex items-center gap-2.5">
              <DoctorMxLogo />
            </Link>
          </div>

          {isPending && (
            <div className="mx-3 mb-4 rounded-lg border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--brand-gold)/0.1)] p-3">
              <p className="text-xs font-semibold text-[hsl(var(--brand-gold))]">Perfil en revisión</p>
              <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">Tu cédula está siendo verificada. 24-48 horas.</p>
            </div>
          )}

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {primaryNav.map(renderNavItem)}

            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Más herramientas</span>
              {toolsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {toolsExpanded && (
              <div className="space-y-1">
                {secondaryNav.map(renderNavItem)}
              </div>
            )}
          </nav>

          <div className="p-[var(--space-4)] border-t border-border">
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">Doctor</p>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" type="submit" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>

        {/* Sidebar - Mobile (slides in) */}
        <aside
          className={cn(
            "fixed lg:hidden inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transform transition-transform duration-200 ease-in-out",
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-display font-semibold text-foreground">Menú</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isPending && (
            <div className="mx-3 mt-4 rounded-lg border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--brand-gold)/0.1)] p-3">
              <p className="text-xs font-semibold text-[hsl(var(--brand-gold))]">Perfil en revisión</p>
              <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">Tu cédula está siendo verificada. 24-48 horas.</p>
            </div>
          )}

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {primaryNav.map(renderNavItem)}

            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Más herramientas</span>
              {toolsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {toolsExpanded && (
              <div className="space-y-1">
                {secondaryNav.map(renderNavItem)}
              </div>
            )}
          </nav>

          <Separator />

          <div className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">¿Necesitas ayuda?</p>
            <a
              href="mailto:soporte@doctory.com"
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
            >
              <Mail className="w-4 h-4" />
              Contactar soporte
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {doctorId && !isPending && <TrialBanner doctorId={doctorId} />}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
