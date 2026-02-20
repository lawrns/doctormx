import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress } from './progress'

describe('Progress', () => {
  it('renders with default props', () => {
    render(<Progress value={50} data-testid="progress" />)
    const progress = screen.getByTestId('progress')
    expect(progress).toBeInTheDocument()
    expect(progress).toHaveAttribute('data-slot', 'progress')
  })

  it('renders with correct value', () => {
    render(<Progress value={75} data-testid="progress" />)
    const progress = screen.getByTestId('progress')
    expect(progress).toBeInTheDocument()
    const indicator = progress.querySelector('[data-slot="progress-indicator"]')
    expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' })
  })

  it('renders with 0 value', () => {
    render(<Progress value={0} data-testid="progress" />)
    const progress = screen.getByTestId('progress')
    expect(progress).toBeInTheDocument()
    const indicator = progress.querySelector('[data-slot="progress-indicator"]')
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' })
  })

  it('renders with max value', () => {
    render(<Progress value={100} data-testid="progress" />)
    const progress = screen.getByTestId('progress')
    expect(progress).toBeInTheDocument()
    const indicator = progress.querySelector('[data-slot="progress-indicator"]')
    expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' })
  })

  it('applies custom className', () => {
    render(<Progress value={50} className="custom-progress" data-testid="progress" />)
    const progress = screen.getByTestId('progress')
    expect(progress).toHaveClass('custom-progress')
  })

  it('handles indeterminate state', () => {
    render(<Progress data-testid="progress" />)
    const progress = screen.getByTestId('progress')
    expect(progress).toBeInTheDocument()
    const indicator = progress.querySelector('[data-slot="progress-indicator"]')
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' })
  })
})
