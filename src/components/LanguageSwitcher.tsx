'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { useState, useRef, useEffect } from 'react'

/**
 * LanguageSwitcher Component
 * 
 * Allows users to switch between supported locales.
 * Uses a dropdown menu with flag indicators.
 * 
 * @example
 * ```tsx
 * <LanguageSwitcher variant="dropdown" />
 * <LanguageSwitcher variant="buttons" />
 * ```
 */

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'minimal'
  className?: string
}

const localeNames: Record<string, string> = {
  es: 'Español',
  en: 'English',
}

const localeFlags: Record<string, string> = {
  es: '🇲🇽',
  en: '🇺🇸',
}

export function LanguageSwitcher({ 
  variant = 'dropdown',
  className = '' 
}: LanguageSwitcherProps) {
  const t = useTranslations('navigation')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: string) => {
    setIsOpen(false)
    router.replace(pathname, { locale: newLocale })
  }

  // Minimal variant - just shows current language
  if (variant === 'minimal') {
    return (
      <span className={`text-sm text-gray-500 ${className}`}>
        {localeFlags[locale]} {locale.toUpperCase()}
      </span>
    )
  }

  // Buttons variant - shows all options as buttons
  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {Object.keys(localeNames).map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${locale === loc 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
            aria-label={t('changeLanguage', { locale: localeNames[loc] })}
            aria-pressed={locale === loc}
          >
            <span className="mr-1.5">{localeFlags[loc]}</span>
            {loc.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  // Dropdown variant (default)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('changeLanguage')}
      >
        <span className="text-lg">{localeFlags[locale]}</span>
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          role="listbox"
          aria-label={t('selectLanguage')}
        >
          {Object.entries(localeNames).map(([loc, name]) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors
                ${locale === loc 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
              role="option"
              aria-selected={locale === loc}
            >
              <span className="text-lg">{localeFlags[loc]}</span>
              <span>{name}</span>
              {locale === loc && (
                <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * LanguageSwitcher for use in header/navigation
 * Pre-configured with appropriate styling
 */
export function HeaderLanguageSwitcher() {
  return (
    <LanguageSwitcher 
      variant="dropdown" 
      className="ml-4"
    />
  )
}

/**
 * LanguageSwitcher for use in footer
 */
export function FooterLanguageSwitcher() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Idioma / Language:</span>
      <LanguageSwitcher variant="buttons" />
    </div>
  )
}
