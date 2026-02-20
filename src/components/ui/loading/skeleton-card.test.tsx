import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonText,
} from './skeleton-card'

describe('SkeletonCard', () => {
  it('renders with default props', () => {
    const { container } = render(<SkeletonCard />)
    const card = container.firstChild
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('role', 'status')
  })

  it('renders with header', () => {
    const { container } = render(<SkeletonCard header />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with footer', () => {
    const { container } = render(<SkeletonCard footer />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with avatar', () => {
    const { container } = render(<SkeletonCard header avatar />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with custom lines count', () => {
    const { container } = render(<SkeletonCard lines={5} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    sizes.forEach(size => {
      const { container } = render(<SkeletonCard size={size} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = render(<SkeletonCard className="custom-card" />)
    expect(container.firstChild).toHaveClass('custom-card')
  })

  it('renders with custom aria-label', () => {
    const { container } = render(<SkeletonCard ariaLabel="Loading user data" />)
    expect(container.firstChild).toHaveAttribute('aria-label', 'Loading user data')
  })

  it('has sr-only text', () => {
    render(<SkeletonCard />)
    const srText = screen.getByText('Cargando...')
    expect(srText).toHaveClass('sr-only')
  })
})

describe('SkeletonList', () => {
  it('renders with default count', () => {
    const { container } = render(<SkeletonList />)
    expect(container.querySelector('.space-y-4')).toBeInTheDocument()
  })

  it('renders with custom count', () => {
    const { container } = render(<SkeletonList count={5} />)
    expect(container.querySelector('.space-y-4')).toBeInTheDocument()
  })

  it('passes props to SkeletonCard', () => {
    const { container } = render(<SkeletonList header lines={5} />)
    expect(container.querySelector('.space-y-4')).toBeInTheDocument()
  })
})

describe('SkeletonTable', () => {
  it('renders with default rows and cols', () => {
    const { container } = render(<SkeletonTable />)
    expect(container.querySelector('[aria-label="Cargando tabla..."]')).toBeInTheDocument()
  })

  it('renders with custom rows and cols', () => {
    const { container } = render(<SkeletonTable rows={3} cols={2} />)
    expect(container.querySelector('[aria-label="Cargando tabla..."]')).toBeInTheDocument()
  })

  it('has sr-only text', () => {
    render(<SkeletonTable />)
    const srText = screen.getByText('Cargando tabla...')
    expect(srText).toHaveClass('sr-only')
  })
})

describe('SkeletonAvatar', () => {
  it('renders with default props', () => {
    const { container } = render(<SkeletonAvatar />)
    expect(container.firstChild).toHaveAttribute('role', 'status')
    expect(container.firstChild).toHaveAttribute('aria-label', 'Cargando avatar...')
  })

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    sizes.forEach(size => {
      const { container } = render(<SkeletonAvatar size={size} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = render(<SkeletonAvatar className="custom-avatar" />)
    expect(container.firstChild).toHaveClass('custom-avatar')
  })
})

describe('SkeletonText', () => {
  it('renders with default props', () => {
    const { container } = render(<SkeletonText />)
    expect(container.firstChild).toHaveAttribute('role', 'status')
    expect(container.firstChild).toHaveAttribute('aria-label', 'Cargando texto...')
  })

  it('renders with custom lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<SkeletonText className="custom-text" />)
    expect(container.firstChild).toHaveClass('custom-text')
  })
})
