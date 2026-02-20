import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'

describe('Pagination', () => {
  it('renders with default props', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveAttribute('aria-label', 'pagination')
  })

  it('applies custom className', () => {
    render(
      <Pagination className="custom-pagination">
        <PaginationContent />
      </Pagination>
    )
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('custom-pagination')
  })
})

describe('PaginationContent', () => {
  it('renders content correctly', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>Item</PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    expect(screen.getByText('Item')).toBeInTheDocument()
  })
})

describe('PaginationItem', () => {
  it('renders item correctly', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>Item</PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    expect(screen.getByText('Item')).toBeInTheDocument()
  })
})

describe('PaginationLink', () => {
  it('renders link correctly', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/page/1">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    const link = screen.getByText('1')
    expect(link).toHaveAttribute('href', '/page/1')
  })

  it('renders active link', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink isActive href="#">
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    const link = screen.getByText('1')
    expect(link).toHaveAttribute('aria-current', 'page')
  })

  it('handles click events', () => {
    const onClick = vi.fn()
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" onClick={onClick}>
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    fireEvent.click(screen.getByText('1'))
    expect(onClick).toHaveBeenCalled()
  })
})

describe('PaginationPrevious', () => {
  it('renders previous link', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationPrevious href="#" />
        </PaginationContent>
      </Pagination>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'Go to previous page')
  })

  it('renders with custom className', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationPrevious href="#" className="custom-prev" />
        </PaginationContent>
      </Pagination>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveClass('custom-prev')
  })
})

describe('PaginationNext', () => {
  it('renders next link', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationNext href="#" />
        </PaginationContent>
      </Pagination>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'Go to next page')
  })
})

describe('PaginationEllipsis', () => {
  it('renders ellipsis', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationEllipsis />
        </PaginationContent>
      </Pagination>
    )
    expect(screen.getByText('More pages')).toBeInTheDocument()
  })
})

describe('Complete Pagination', () => {
  it('renders complete pagination', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
