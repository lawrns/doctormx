'use client'

import Link from 'next/link'
import { ReactNode, useState } from 'react'

interface DoctorLayoutProps {
  children: ReactNode
  profile: { full_name: string }
  isPending: boolean
  currentPath?: string
  pendingAppointments?: number
}

export default function DoctorLayout({ children, profile, isPending, currentPath = '/doctor', pendingAppointments = 0 }: DoctorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Inicio', href: '/doctor', iconType: 'home', enabled: true },
    { name: 'Mi perfil', href: '/doctor/profile', iconType: 'user', enabled: true },
    { name: 'Consultas', href: '/doctor/appointments', iconType: 'clipboard', enabled: !isPending },
    { name: 'Disponibilidad', href: '/doctor/availability', iconType: 'calendar', enabled: !isPending },
    { name: 'Analytics', href: '/doctor/analytics', iconType: 'chart', enabled: !isPending },
    { name: 'Farmacia', href: '/doctor/pharmacy', iconType: 'pill', enabled: !isPending },
    { name: 'Seguimientos', href: '/doctor/followups', iconType: 'phone', enabled: !isPending },
    { name: 'Suscripción', href: '/doctor/subscription', iconType: 'star', enabled: !isPending },
    { name: 'Precios', href: '/doctor/pricing', iconType: 'currency', enabled: !isPending },
    { name: 'Finanzas', href: '/doctor/finances', iconType: 'wallet', enabled: !isPending },
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
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l-5-5A2 2 0 009 10.172V5L8 4z" /></svg>
      case 'phone':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
      case 'star':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
      case 'currency':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      case 'wallet':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
      default:
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="px-4 lg:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Abrir menú de navegación"
              aria-expanded={sidebarOpen}
              aria-controls="doctor-sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <Link
                href="/doctores"
                className="hidden md:inline-flex items-center gap-2 text-gray-600 hover:text-primary-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg"
                title="Ver sitio como paciente"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">Ver sitio como paciente</span>
              </Link>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Doctor.mx</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Notifications bell */}
            {!isPending && (
              <Link
                href="/doctor/appointments?status=pending_payment"
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={pendingAppointments > 0 ? `Citas pendientes: ${pendingAppointments}` : "Citas pendientes"}
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {pendingAppointments > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full" aria-hidden="true">
                    {pendingAppointments > 99 ? '99+' : pendingAppointments}
                  </span>
                )}
              </Link>
            )}

            {isPending ? (
              <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <span className="hidden sm:inline"></span>En revisión
              </span>
            ) : (
              <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="hidden sm:inline"></span>Verificado
              </span>
            )}
            <span className="hidden md:inline text-sm text-gray-600">{profile.full_name}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-red-600 hover:text-red-700" aria-label="Cerrar sesión">
                <span className="hidden sm:inline">Cerrar sesión</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Mobile (slides in) */}
        <aside
          id="doctor-sidebar"
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
            lg:transform-none lg:min-h-[calc(100vh-73px)]
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          aria-label="Navegación del doctor"
        >
          {/* Mobile sidebar header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b">
            <span className="font-semibold text-gray-900">Menú</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = currentPath === item.href
              const isDisabled = !item.enabled

              return (
                <Link
                  key={item.href}
                  href={isDisabled ? '#' : item.href}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault()
                    } else {
                      setSidebarOpen(false)
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-700'
                      : isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="flex-shrink-0">{getNavIcon(item.iconType)}</span>
                  <span>{item.name}</span>
                  {isDisabled && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Help section */}
          <div className="p-4 mt-8 border-t">
            <p className="text-xs font-medium text-gray-500 mb-2">¿Necesitas ayuda?</p>
            <a
              href="mailto:soporte@doctormx.com"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contactar soporte
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main id="main-content" className="flex-1 p-4 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
