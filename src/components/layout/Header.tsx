'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Logo } from '@/components/Logo'

interface HeaderProps {
  variant?: 'default' | 'transparent'
  showAuth?: boolean
}

export function Header({ variant = 'default', showAuth = true }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        variant === 'transparent' && !scrolled
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-100',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Logo size="md" />

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/doctors"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Buscar doctores
            </Link>
            <Link
              href="/app/second-opinion"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Consulta IA
            </Link>
            <Link
              href="/specialties"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Especialidades
            </Link>
            <Link
              href="/for-doctors"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Para doctores
            </Link>
          </nav>

          {/* Auth buttons */}
          {showAuth && (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-primary-500 hover:bg-primary-600 text-sm font-medium">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
