'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface Language {
  code: string
  label: string
  flag: string
}

const languages: Language[] = [
  { code: 'es', label: 'Español', flag: '🇲🇽' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
]

const LOCALE_STORAGE_KEY = 'user-locale-preference'

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'mobile'
  className?: string
}

export function LanguageSelector({ 
  variant = 'default', 
  className 
}: LanguageSelectorProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load persisted preference on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && stored !== locale && languages.some(l => l.code === stored)) {
      // If stored locale differs from current, we could auto-switch here
      // But for now we just respect the URL locale
    }
  }, [locale])

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) {
      setOpen(false)
      return
    }

    // Persist selection
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    
    // Also set a cookie for server-side detection
    document.cookie = `${LOCALE_STORAGE_KEY}=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`

    // Navigate to the same page with new locale
    router.replace(pathname, { locale: newLocale })
    setOpen(false)
  }

  const currentLanguage = languages.find(l => l.code === locale) || languages[0]

  if (!mounted) {
    // Return a placeholder to prevent layout shift
    return (
      <div className={cn(
        "flex items-center gap-2 opacity-50",
        variant === 'compact' && "h-9 w-9",
        variant === 'mobile' && "w-full justify-between",
        className
      )}>
        <Globe className="h-4 w-4" />
        {variant !== 'compact' && <span>ES</span>}
      </div>
    )
  }

  // Mobile variant - shows as a button group instead of dropdown
  if (variant === 'mobile') {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Idioma / Language
          </span>
          <div className="flex gap-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  locale === language.code
                    ? "bg-primary-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                aria-pressed={locale === language.code}
                aria-label={`Switch to ${language.label}`}
              >
                <span className="text-lg" aria-hidden="true">{language.flag}</span>
                <span>{language.code.toUpperCase()}</span>
                {locale === language.code && (
                  <Check className="h-4 w-4 ml-1" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Compact variant - just shows the code with globe icon
  if (variant === 'compact') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9 relative", className)}
            aria-label={`Current language: ${currentLanguage.label}. Click to change language.`}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
              {locale.toUpperCase()}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                "flex items-center justify-between cursor-pointer",
                locale === language.code && "bg-primary-50 text-primary-600"
              )}
              role="option"
              aria-selected={locale === language.code}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">{language.flag}</span>
                <span className="text-sm">{language.label}</span>
              </div>
              {locale === language.code && (
                <Check className="h-4 w-4 text-primary-600" aria-hidden="true" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Default variant - shows full language name with dropdown
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 px-3 py-2 h-10 font-medium",
            "hover:bg-gray-100 transition-colors",
            className
          )}
          aria-label={`Current language: ${currentLanguage.label}. Click to change language.`}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="text-lg" aria-hidden="true">{currentLanguage.flag}</span>
          <span className="text-sm uppercase tracking-wide">{locale.toUpperCase()}</span>
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-200",
              open && "rotate-180"
            )} 
            aria-hidden="true" 
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              locale === language.code && "bg-primary-50 text-primary-600"
            )}
            role="option"
            aria-selected={locale === language.code}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">{language.flag}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{language.label}</span>
                <span className="text-xs text-gray-400">
                  {language.code === 'es' ? 'México' : 'United States'}
                </span>
              </div>
            </div>
            {locale === language.code && (
              <Check className="h-4 w-4 text-primary-600 ml-2" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSelector
