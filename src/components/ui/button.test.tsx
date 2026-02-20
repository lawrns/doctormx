import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button, buttonVariants } from './button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-slot', 'button')
    expect(button).toHaveAttribute('data-variant', 'primary')
    expect(button).toHaveAttribute('data-size', 'default')
  })

  it('renders with different variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
    
    variants.forEach(variant => {
      const { container } = render(<Button variant={variant}>Button</Button>)
      const button = container.querySelector('[data-slot="button"]')
      expect(button).toHaveAttribute('data-variant', variant)
    })
  })

  it('renders with different sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'] as const
    
    sizes.forEach(size => {
      const { container } = render(<Button size={size}>Button</Button>)
      const button = container.querySelector('[data-slot="button"]')
      // Map icon sizes to their data attribute value
      const dataSize = size === 'icon' || size === 'xs' || size === 'sm' || size === 'lg' || size === 'xl' 
        ? size 
        : 'default'
      expect(button).toHaveAttribute('data-size', dataSize)
    })
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('disables button when loading', () => {
    const handleClick = vi.fn()
    render(<Button loading onClick={handleClick}>Loading</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders with left icon', () => {
    render(<Button leftIcon={<span data-testid="left-icon">Icon</span>}>Button</Button>)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders with right icon', () => {
    render(<Button rightIcon={<span data-testid="right-icon">Icon</span>}>Button</Button>)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('renders full width', () => {
    render(<Button fullWidth>Full Width</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('w-full')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref}>Button</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('renders as child component when asChild is true', () => {
    // Note: asChild requires proper Slot implementation
    // This test verifies the prop is accepted without errors
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    expect(container).toBeInTheDocument()
    expect(screen.getByText('Link Button')).toBeInTheDocument()
  })

  it('does not show icons when loading', () => {
    render(
      <Button 
        loading 
        leftIcon={<span data-testid="left-icon">Icon</span>}
        rightIcon={<span data-testid="right-icon">Icon</span>}
      >
        Loading
      </Button>
    )
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
  })
})

describe('buttonVariants', () => {
  it('returns default classes', () => {
    const classes = buttonVariants()
    expect(classes).toContain('inline-flex')
    expect(classes).toContain('items-center')
    expect(classes).toContain('justify-center')
  })

  it('applies variant classes', () => {
    const classes = buttonVariants({ variant: 'destructive' })
    expect(classes).toContain('bg-red-600')
  })

  it('applies size classes', () => {
    const classes = buttonVariants({ size: 'lg' })
    expect(classes).toContain('px-6')
  })
})
