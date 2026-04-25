'use client'

import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'
import TrialBanner from '@/components/TrialBanner'

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

  const navigation = [
    { name: 'Dashboard', href: '/doctor', iconType: 'home', enabled: true },
    { name: 'Citas', href: '/doctor/appointments', iconType: 'clipboard', enabled: !isPending },
    { name: 'Disponibilidad', href: '/doctor/availability', iconType: 'calendar', enabled: !isPending },
    { name: 'Consulta', href: '/doctor/chat', iconType: 'chat', enabled: !isPending },
    { name: 'Recetas', href: '/doctor/pharmacy', iconType: 'pill', enabled: !isPending },
    { name: 'Análisis', href: '/doctor/analytics', iconType: 'chart', enabled: !isPending },
    { name: 'Recordatorios', href: '/doctor/reminders', iconType: 'bell', enabled: !isPending },
    { name: 'Formularios', href: '/doctor/intake-forms', iconType: 'form', enabled: !isPending },
    { name: 'Preguntas', href: '/doctor/preguntas', iconType: 'question', enabled: !isPending },
    { name: 'Widget', href: '/doctor/widget', iconType: 'widget', enabled: !isPending },
    { name: 'Plan', href: '/doctor/subscription', iconType: 'star', enabled: true },
    { name: 'Referidos', href: '/doctor/referrals', iconType: 'gift', enabled: !isPending },
    { name: 'Perfil', href: '/doctor/profile', iconType: 'user', enabled: true },
  ]

  const getNavIcon = (iconType: string) => {
    const iconClass = "w-5 h-5"
    switch (iconType) {
      case 'home':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      case 'user':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      case 'clipboard':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
      case 'calendar':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      case 'chart':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      case 'pill':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
      case 'chat':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      case 'bell':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
      case 'form':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      case 'question':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m-7 5h8a4 4 0 004-4V7a4 4 0 00-4-4H8a4 4 0 00-4 4v10a4 4 0 004 4z" /></svg>
      case 'widget':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 8l-4 4 4 4" /></svg>
      case 'star':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
      case 'gift':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
      default:
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
    }
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
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
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
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-vital-soft text-vital">
                Verificado
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-background sticky top-0 h-screen">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2.5">
              <DoctorMxLogo />
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
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
                  <span className="flex-shrink-0">{getNavIcon(item.iconType)}</span>
                  <span>{item.name}</span>
                  {disabled && (
                    <svg className="w-4 h-4 ml-auto text-muted-foreground/50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">Doctor</p>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" type="submit" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
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
                  <span className="flex-shrink-0">{getNavIcon(item.iconType)}</span>
                  <span>{item.name}</span>
                  {disabled && (
                    <svg className="w-4 h-4 ml-auto text-muted-foreground/50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>
              )
            })}
          </nav>

          <Separator />

          <div className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">¿Necesitas ayuda?</p>
            <a
              href="mailto:soporte@doctory.com"
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
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
