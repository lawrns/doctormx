import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Switch } from './switch'

describe('Switch', () => {
  it('renders with default props', () => {
    render(<Switch />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toBeInTheDocument()
  })

  it('renders unchecked by default', () => {
    render(<Switch />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveAttribute('data-state', 'unchecked')
    expect(switchEl).not.toBeChecked()
  })

  it('renders checked when checked prop is true', () => {
    render(<Switch checked readOnly />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveAttribute('data-state', 'checked')
  })

  it('handles checked state changes', () => {
    const handleCheckedChange = vi.fn()
    render(<Switch onCheckedChange={handleCheckedChange} />)
    const switchEl = screen.getByRole('switch')
    fireEvent.click(switchEl)
    expect(handleCheckedChange).toHaveBeenCalledWith(true)
  })

  it('can be disabled', () => {
    render(<Switch disabled />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Switch className="custom-switch" />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveClass('custom-switch')
  })

  it('has correct aria attributes', () => {
    render(<Switch aria-label="Toggle feature" />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveAttribute('aria-label', 'Toggle feature')
  })
})
