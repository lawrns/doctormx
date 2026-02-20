'use client'

import Link from 'next/link'
import { Home, Calendar, User, MessageCircle, Settings, LogOut, X } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
}

interface AppNavigationProps {
  currentPage?: string // Para resaltar la página activa
}

export default function AppNavigation({ currentPage = '/' }: AppNavigationProps) {
  const [userData, setUserData] = useState<{
    fullName: string | null
    unreadCount: number
  } | null>(null)

  // Simular carga de datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      // Aquí irías a buscar datos reales del usuario
      // Por ahora, usamos valores simulados para demo
      setUserData({
        fullName: 'Dr. Juan Pérez',
        unreadCount: 3
      })
    }

    fetchUserData()
  }, [])

  const mainNav: NavItem[] = [
    { href: '/app', icon: Home, label: 'Inicio' },
    { href: '/app/appointments', icon: Calendar, label: 'Mis Citas', badge: userData?.unreadCount },
    { href: '/app/ai-consulta', icon: MessageCircle, label: 'Consulta IA' },
    { href: '/app/followups', icon: User, label: 'Seguimientos' },
    { href: '/app/profile', icon: Settings, label: 'Mi Perfil' },
  ]

  const quickActions = [
    { label: 'Nueva Cita', href: '/doctores', primary: true },
    { label: 'Historial', href: '/app/data-rights', primary: false },
  ]

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const lastFocusableRef = useRef<HTMLButtonElement>(null)

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Focus trap for mobile menu
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMobileMenuOpen(false)
      return
    }
    
    if (e.key !== 'Tab') return

    const focusableElements = mobileMenuRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (!focusableElements || focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }, [])

  // Focus first element when menu opens
  useEffect(() => {
    if (mobileMenuOpen && firstFocusableRef.current) {
      setTimeout(() => firstFocusableRef.current?.focus(), 100)
    }
  }, [mobileMenuOpen])

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo y nombre de usuario */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600">Doctor.mx</span>
                <span className="hidden sm:inline text-sm text-gray-500">Telemedicina</span>
              </div>
            </Link>

            {/* Estado del usuario */}
            {userData ? (
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{userData.fullName}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>En línea</span>
                  </div>
                </div>

                <button 
                  className="relative p-2 rounded-full hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Configuración"
                >
                  {userData.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white" aria-hidden="true">
                      {userData.unreadCount}
                    </span>
                  )}
                  <Settings className="w-5 h-5 text-gray-600" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>

          {/* Navegación principal - links principales */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Navegación principal">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  currentPage === item.href
                    ? 'bg-primary-50 text-primary-700 border-primary-500'
                    : 'text-gray-700 hover:bg-gray-50 border-transparent'
                }`}
                aria-current={currentPage === item.href ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white" aria-hidden="true">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Acciones rápidas - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  action.primary
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {action.label}
              </Link>
            ))}
            
            {/* Botón de cerrar sesión - Desktop */}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 transition-colors min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </form>
          </div>

          {/* Menú móvil - hamburguesa */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu - Slide-in Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Mobile sidebar */}
          <div
            ref={mobileMenuRef}
            id="mobile-navigation-menu"
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden"
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación móvil"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link 
                href="/" 
                className="flex items-center gap-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">Doctor.mx</span>
              </Link>
              
              <button
                ref={firstFocusableRef}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* User info */}
            {userData && (
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {userData.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{userData.fullName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>En línea</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Menú de navegación">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors min-h-[44px] ${
                    currentPage === item.href
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-current={currentPage === item.href ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                    action.primary
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {action.label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="p-4 border-t border-gray-200">
              <form action="/auth/signout" method="post">
                <button
                  ref={lastFocusableRef}
                  type="submit"
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors min-h-[44px]"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                  Cerrar Sesión
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
