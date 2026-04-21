'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { sharedHeaderNavItems } from '@/lib/public-nav'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

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
          : 'bg-background/95 backdrop-blur-md border-b border-border',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 rounded focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2" aria-label="Doctor.mx - Inicio">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">
              Doctor.mx
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {sharedHeaderNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
              >
                {item.compactLabel}
              </Link>
            ))}
          </nav>

          {/* Auth buttons */}
          {showAuth && (
            <div className="flex items-center gap-3">
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
                  Registrarse
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2" aria-label="Abrir menú de navegación">
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
            </SheetTrigger>
            <SheetContent side="right" className="w-[88%] max-w-sm border-l border-border bg-background">
              <SheetHeader className="border-b border-border pb-4">
                <SheetTitle>Navegación</SheetTitle>
                <SheetDescription>Explora las principales rutas públicas de Doctor.mx.</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-2 px-4 pb-6">
                {sharedHeaderNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
                      {item.label}
                    </Link>
                  )
                })}
                {showAuth ? (
                  <div className="mt-4 grid gap-3 border-t border-border pt-4">
                    <Link href="/auth/login">
                      <Button variant="ghost" className="w-full justify-center">Iniciar sesión</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="w-full justify-center bg-primary hover:bg-primary/90">Registrarse</Button>
                    </Link>
                  </div>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Header
