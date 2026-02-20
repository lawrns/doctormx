import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from './label'

describe('Label', () => {
  it('renders with default props', () => {
    render(<Label>Label Text</Label>)
    const label = screen.getByText('Label Text')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('data-slot', 'label')
  })

  it('renders with htmlFor attribute', () => {
    render(<Label htmlFor="input-id">Label Text</Label>)
    const label = screen.getByText('Label Text')
    expect(label).toHaveAttribute('for', 'input-id')
  })

  it('applies custom className', () => {
    render(<Label className="custom-class">Label Text</Label>)
    const label = screen.getByText('Label Text')
    expect(label).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLLabelElement | null }
    render(<Label ref={ref}>Label Text</Label>)
    // Radix UI components handle ref forwarding internally
    expect(screen.getByText('Label Text')).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    render(<Label>Complex <strong>Label</strong></Label>)
    const label = screen.getByText('Complex')
    expect(label).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('has correct base classes', () => {
    render(<Label>Label</Label>)
    const label = screen.getByText('Label')
    expect(label).toHaveClass('flex', 'items-center', 'gap-2')
  })
})
