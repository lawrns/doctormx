import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from './alert'

describe('Alert', () => {
  it('renders with default props', () => {
    render(<Alert>Alert message</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveAttribute('data-slot', 'alert')
  })

  it('renders with default variant', () => {
    render(<Alert>Default Alert</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('bg-card')
  })

  it('renders with destructive variant', () => {
    render(<Alert variant="destructive">Destructive Alert</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('text-destructive')
  })

  it('applies custom className', () => {
    render(<Alert className="custom-alert">Alert</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-alert')
  })

  it('renders children correctly', () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})

describe('AlertTitle', () => {
  it('renders correctly', () => {
    render(<AlertTitle>Alert Title</AlertTitle>)
    const title = screen.getByText('Alert Title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveAttribute('data-slot', 'alert-title')
  })

  it('applies custom className', () => {
    render(<AlertTitle className="custom-title">Title</AlertTitle>)
    const title = screen.getByText('Title')
    expect(title).toHaveClass('custom-title')
  })
})

describe('AlertDescription', () => {
  it('renders correctly', () => {
    render(<AlertDescription>Alert Description</AlertDescription>)
    const desc = screen.getByText('Alert Description')
    expect(desc).toBeInTheDocument()
    expect(desc).toHaveAttribute('data-slot', 'alert-description')
  })

  it('applies custom className', () => {
    render(<AlertDescription className="custom-desc">Description</AlertDescription>)
    const desc = screen.getByText('Description')
    expect(desc).toHaveClass('custom-desc')
  })
})

describe('Complete Alert', () => {
  it('renders a complete alert with icon', () => {
    render(
      <Alert>
        <svg data-testid="alert-icon" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This is a warning message</AlertDescription>
      </Alert>
    )
    
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
    expect(screen.getByText('Warning')).toBeInTheDocument()
    expect(screen.getByText('This is a warning message')).toBeInTheDocument()
  })
})
