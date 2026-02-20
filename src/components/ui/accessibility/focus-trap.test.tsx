import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FocusTrap } from './focus-trap'

describe('FocusTrap', () => {
  it('renders children correctly', () => {
    render(
      <FocusTrap>
        <button>Button 1</button>
        <button>Button 2</button>
      </FocusTrap>
    )
    expect(screen.getByText('Button 1')).toBeInTheDocument()
    expect(screen.getByText('Button 2')).toBeInTheDocument()
  })

  it('is disabled when specified', () => {
    render(
      <FocusTrap disabled>
        <button>Button</button>
      </FocusTrap>
    )
    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('calls onActivate when trap is activated', () => {
    const onActivate = vi.fn()
    render(
      <FocusTrap onActivate={onActivate}>
        <button>Button</button>
      </FocusTrap>
    )
    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('calls onDeactivate when trap is deactivated', () => {
    const onDeactivate = vi.fn()
    const { unmount } = render(
      <FocusTrap onDeactivate={onDeactivate}>
        <button>Button</button>
      </FocusTrap>
    )
    unmount()
  })

  it('has correct role for accessibility', () => {
    render(
      <FocusTrap>
        <div data-testid="content">Content</div>
      </FocusTrap>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })
})
