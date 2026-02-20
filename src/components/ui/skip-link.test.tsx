import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkipLink, MainContent } from './skip-link'

describe('SkipLink', () => {
  it('renders with default props', () => {
    render(<SkipLink />)
    const link = screen.getByTestId('skip-link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#main-content')
    expect(link).toHaveTextContent('Saltar al contenido principal')
  })

  it('renders with custom target and label', () => {
    render(<SkipLink targetId="custom-content" label="Skip to content" />)
    const link = screen.getByTestId('skip-link')
    expect(link).toHaveAttribute('href', '#custom-content')
    expect(link).toHaveTextContent('Skip to content')
  })

  it('has sr-only class by default', () => {
    render(<SkipLink />)
    const link = screen.getByTestId('skip-link')
    expect(link).toHaveClass('sr-only')
  })

  it('becomes visible on focus', () => {
    render(<SkipLink />)
    const link = screen.getByTestId('skip-link')
    
    // Initially sr-only
    expect(link).toHaveClass('sr-only')
    
    // Focus the link
    fireEvent.focus(link)
    
    // Should have focus styles
    expect(link).toHaveClass('focus:not-sr-only')
  })

  it('has correct aria-label', () => {
    render(<SkipLink />)
    const link = screen.getByTestId('skip-link')
    expect(link).toHaveAttribute('aria-label', 'Saltar al contenido principal')
  })

  it('clicking scrolls to target and focuses it', () => {
    // Mock target element
    const mockTarget = document.createElement('div')
    mockTarget.id = 'main-content'
    document.body.appendChild(mockTarget)
    
    // Mock scrollIntoView and focus
    const scrollIntoViewMock = vi.fn()
    const focusMock = vi.fn()
    mockTarget.scrollIntoView = scrollIntoViewMock
    mockTarget.focus = focusMock
    
    render(<SkipLink />)
    const link = screen.getByTestId('skip-link')
    
    fireEvent.click(link)
    
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(focusMock).toHaveBeenCalledWith({ preventScroll: false })
    expect(mockTarget).toHaveAttribute('tabindex', '-1')
    
    // Cleanup
    document.body.removeChild(mockTarget)
  })
})

describe('MainContent', () => {
  it('renders with default id', () => {
    render(<MainContent>Test Content</MainContent>)
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-content')
    expect(main).toHaveTextContent('Test Content')
  })

  it('renders with custom id', () => {
    render(<MainContent id="custom-content">Test Content</MainContent>)
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'custom-content')
  })

  it('has correct aria-label', () => {
    render(<MainContent>Test Content</MainContent>)
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('aria-label', 'Contenido principal')
  })

  it('has tabindex -1 for focus management', () => {
    render(<MainContent>Test Content</MainContent>)
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('tabindex', '-1')
  })
})
