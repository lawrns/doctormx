'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface DoctorLayoutProps {
  children: ReactNode
  profile: { full_name: string }
  isPending: boolean
  currentPath?: string
}

export default function DoctorLayout({ children, profile, isPending, currentPath = '/doctor' }: DoctorLayoutProps) {
  const navigation = [
    { name: 'Inicio', href: '/doctor', icon: '🏠', enabled: true },
    { name: 'Mi perfil', href: '/doctor/profile', icon: '👤', enabled: true },
    { name: 'Disponibilidad', href: '/doctor/availability', icon: '📅', enabled: true },
    { name: 'Consultas', href: '/doctor/appointments', icon: '🩺', enabled: !isPending },
    { name: 'Finanzas', href: '/doctor/finances', icon: '💰', enabled: !isPending },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Doctory</h1>
          <div className="flex items-center gap-4">
            {isPending ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⏳ En revisión
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Verificado
              </span>
            )}
            <span className="text-sm text-gray-600">{profile.full_name}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-red-600 hover:text-red-700">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = currentPath === item.href
              const isDisabled = !item.enabled

              return (
                <Link
                  key={item.href}
                  href={isDisabled ? '#' : item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-700'
                      : isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  onClick={(e) => isDisabled && e.preventDefault()}
                >
                  <span className="text-xl">{item.icon}</span>
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
              href="mailto:soporte@doctory.com"
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
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
