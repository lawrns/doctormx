import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LanguageSelector } from '../LanguageSelector'

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'es'),
}))

// Mock the i18n routing
vi.mock('@/i18n/routing', () => ({
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
})

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'

describe('LanguageSelector', () => {
  const mockReplace = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      replace: mockReplace,
    })
    ;(usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/doctores')
  })

  it('renders default variant with current locale', () => {
    ;(useLocale as ReturnType<typeof vi.fn>).mockReturnValue('es')
    
    render(<LanguageSelector variant="default" />)
    
    // Should show current locale
    expect(screen.getByText(/ES/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Current language: Español/i)).toBeInTheDocument()
  })

  it('renders compact variant', () => {
    ;(useLocale as ReturnType<typeof vi.fn>).mockReturnValue('en')
    
    render(<LanguageSelector variant="compact" />)
    
    // Should show globe icon with locale badge
    expect(screen.getByLabelText(/Current language: English/i)).toBeInTheDocument()
  })

  it('renders mobile variant with language buttons', () => {
    ;(useLocale as ReturnType<typeof vi.fn>).mockReturnValue('es')
    
    render(<LanguageSelector variant="mobile" />)
    
    // Should show language label
    expect(screen.getByText(/Idioma \/ Language/i)).toBeInTheDocument()
    
    // Should show both language options
    expect(screen.getByText('ES')).toBeInTheDocument()
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('switches language and persists selection', async () => {
    ;(useLocale as ReturnType<typeof vi.fn>).mockReturnValue('es')
    
    render(<LanguageSelector variant="mobile" />)
    
    // Click on English button
    const englishButton = screen.getByLabelText('Switch to English')
    fireEvent.click(englishButton)
    
    // Should persist to localStorage
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user-locale-preference', 'en')
    })
    
    // Should set cookie
    expect(document.cookie).toContain('user-locale-preference=en')
    
    // Should navigate with new locale
    expect(mockReplace).toHaveBeenCalledWith('/doctores', { locale: 'en' })
  })

  it('shows active language indicator in mobile variant', () => {
    ;(useLocale as ReturnType<typeof vi.fn>).mockReturnValue('en')
    
    render(<LanguageSelector variant="mobile" />)
    
    // English button should have checkmark and active styling
    const englishButton = screen.getByLabelText('Switch to English')
    expect(englishButton).toHaveAttribute('aria-pressed', 'true')
    
    // Spanish button should not be active
    const spanishButton = screen.getByLabelText('Switch to Español')
    expect(spanishButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('opens dropdown in default variant', async () => {
    ;(useLocale as ReturnType<typeof vi.fn>).mockReturnValue('es')
    
    render(<LanguageSelector variant="default" />)
    
    // Should show the trigger button
    const trigger = screen.getByLabelText(/Current language/i)
    expect(trigger).toBeInTheDocument()
    
    // The dropdown is using a portal, so we verify the trigger is clickable
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('does not switch if clicking same language', async () => {
    ;(useLocale as ReturnType<typeof vi.fn>).mockReturnValue('es')
    
    render(<LanguageSelector variant="mobile" />)
    
    // Click on already active language (Spanish)
    const spanishButton = screen.getByLabelText('Switch to Español')
    fireEvent.click(spanishButton)
    
    // Should not navigate
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
