import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Separator } from './separator'

describe('Separator', () => {
  it('renders with default props', () => {
    render(<Separator data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toBeInTheDocument()
  })

  it('renders horizontal separator by default', () => {
    render(<Separator data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('renders vertical separator', () => {
    render(<Separator orientation="vertical" data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveAttribute('data-orientation', 'vertical')
  })

  it('renders decorative separator', () => {
    render(<Separator decorative data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('applies custom className', () => {
    render(<Separator className="custom-separator" data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveClass('custom-separator')
  })

  it('has separator role when not decorative', () => {
    render(<Separator decorative={false} data-testid="separator" />)
    const separator = screen.getByRole('separator')
    expect(separator).toBeInTheDocument()
  })
})
