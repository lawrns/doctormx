'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSelector } from '@/components/LanguageSelector'

interface HeaderProps {
  variant?: 'default' | 'transparent'
  showAuth?: boolean
}

export function Header({ variant = 'default', showAuth = true }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/doctores', label: t('navigation.searchDoctors') },
    { href: '/app/second-opinion', label: t('navigation.aiConsultation') },
    { href: '/specialties', label: t('navigation.specialties') },
    { href: '/for-doctors', label: t('navigation.forDoctors') },
  ]

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
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
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
            <span className="text-xl font-bold text-gray-900">
              Doctor.mx
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Language Selector */}
          <div className="hidden md:flex items-center">
            <LanguageSelector variant="default" />
          </div>

          {/* Desktop Auth buttons */}
          {showAuth && (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {t('navigation.login')}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-primary-500 hover:bg-primary-600 text-sm font-medium">
                  {t('navigation.register')}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={mobileMenuOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <Menu className="w-6 h-6" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]" id="mobile-menu">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
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
                  <span className="text-lg font-bold text-gray-900">
                    Doctor.mx
                  </span>
                </SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col gap-2 mt-8">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors py-3 px-2 rounded-lg hover:bg-gray-50 min-h-[44px] flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              {/* Mobile Language Selector */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <LanguageSelector variant="mobile" />
              </div>

              {showAuth && (
                <div className="flex flex-col gap-3 mt-6">
                  <SheetClose asChild>
                    <Link href="/auth/login" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full text-base font-medium min-h-[44px]"
                      >
                        {t('navigation.login')}
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/auth/register" className="w-full">
                      <Button className="w-full bg-primary-500 hover:bg-primary-600 text-base font-medium min-h-[44px]">
                        {t('navigation.register')}
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Header
