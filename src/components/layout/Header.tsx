'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { sharedHeaderNavItems } from '@/lib/public-nav'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'

interface HeaderProps {
  variant?: 'default' | 'transparent'
  showAuth?: boolean
}

export function Header({ variant = 'default', showAuth = true }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [menuOpen])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        variant === 'transparent' && !scrolled
          ? 'bg-transparent'
          : 'bg-background/95 backdrop-blur-md border-b border-border',
        scrolled && 'shadow-[0_8px_24px_-22px_rgba(15,37,95,0.18)]'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link
            href="/"
            className="rounded-lg transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
            aria-label="Doctor.mx - Inicio"
          >
            <DoctorMxLogo showDescriptor />
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {sharedHeaderNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-[8px] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
              >
                {item.compactLabel}
              </Link>
            ))}
          </nav>

          {/* Auth buttons */}
          {showAuth && (
            <div className="hidden items-center gap-3 lg:flex">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                >
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-primary hover:bg-primary/90 text-sm font-medium focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="rounded-[8px] p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 lg:hidden"
            aria-label={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={menuOpen}
            aria-controls="mobile-public-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-public-nav"
        className={cn(
          'lg:hidden',
          menuOpen ? 'block' : 'hidden'
        )}
      >
        <div className="border-t border-border bg-background px-4 py-4 shadow-[0_18px_40px_-28px_rgba(15,37,95,0.32)]">
          <div className="mb-4 border-b border-border pb-3">
            <p className="text-sm font-semibold tracking-tight text-foreground">Navegación</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Rutas públicas principales de Doctor.mx.
            </p>
          </div>
          <nav className="flex flex-col gap-2">
            {sharedHeaderNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-[8px] px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
                  {item.label}
                </Link>
              )
            })}
            {showAuth ? (
              <div className="mt-3 grid gap-3 border-t border-border pt-4">
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-center">Iniciar sesión</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full justify-center bg-primary hover:bg-primary/90">Crear cuenta</Button>
                </Link>
              </div>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
