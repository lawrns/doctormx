/**
 * LanguageSwitcher Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSwitcher } from '../LanguageSwitcher'

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'es',
  useTranslations: () => (key: string) => key,
}))

// Mock routing
vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Dropdown Variant', () => {
    it('should render dropdown button', () => {
      render(<LanguageSwitcher variant="dropdown" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should open dropdown on click', () => {
      render(<LanguageSwitcher variant="dropdown" />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      // Should show listbox
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should have correct accessibility attributes', () => {
      render(<LanguageSwitcher variant="dropdown" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveAttribute('aria-haspopup', 'listbox')
    })
  })

  describe('Buttons Variant', () => {
    it('should render all locale buttons', () => {
      render(<LanguageSwitcher variant="buttons" />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Minimal Variant', () => {
    it('should render without buttons', () => {
      render(<LanguageSwitcher variant="minimal" />)
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
