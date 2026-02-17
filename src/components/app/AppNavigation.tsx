'use client'

import Link from 'next/link'
import { Home, Calendar, User, MessageCircle, Settings, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

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

  return (
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
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{userData.fullName}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>En línea</span>
                </div>
              </div>

              <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                {userData.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {userData.unreadCount}
                  </span>
                )}
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="flex items-center">
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
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.href
                  ? 'bg-primary-50 text-primary-700 border-primary-500'
                  : 'text-gray-700 hover:bg-gray-50 border-transparent'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div className="flex items-center gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                action.primary
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {action.label}
            </Link>
          ))}
        </div>

        {/* Menú móvil - hamburguesa */}
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Botón de cerrar sesión */}
      <form action="/auth/signout" method="post" className="hidden md:flex">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
          <svg className="w-4 h-4 sm:hidden text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m0 0l-4-4m4 4h4m0 0v12h4m-4m4 4h4m0 0v12h4m4 4h4m4 0z" />
          </svg>
        </button>
      </form>
    </nav>
  )
}
