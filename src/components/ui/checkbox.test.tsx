import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('renders with default props', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('renders unchecked by default', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('renders checked when checked prop is true', () => {
    render(<Checkbox checked readOnly />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('handles checked state changes', () => {
    const handleCheckedChange = vi.fn()
    render(<Checkbox onCheckedChange={handleCheckedChange} />)
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(handleCheckedChange).toHaveBeenCalledWith(true)
  })

  it('can be disabled', () => {
    render(<Checkbox disabled />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Checkbox className="custom-checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-checkbox')
  })

  it('has correct aria attributes', () => {
    render(<Checkbox aria-label="Accept terms" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-label', 'Accept terms')
  })

  it('renders with indeterminate state', () => {
    render(<Checkbox checked="indeterminate" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
  })
})
