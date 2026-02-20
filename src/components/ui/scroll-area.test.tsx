import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScrollArea, ScrollBar } from './scroll-area'

describe('ScrollArea', () => {
  it('renders with default props', () => {
    render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <ScrollArea className="custom-scroll-area">
        <div>Content</div>
      </ScrollArea>
    )
    const scrollArea = document.querySelector('.custom-scroll-area')
    expect(scrollArea).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    render(
      <ScrollArea>
        <div data-testid="child">Child Content</div>
      </ScrollArea>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders with ScrollBar', () => {
    render(
      <ScrollArea>
        <div>Content</div>
        <ScrollBar />
      </ScrollArea>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders horizontal ScrollBar', () => {
    render(
      <ScrollArea>
        <div>Content</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

describe('ScrollBar', () => {
  it('exports ScrollBar component', () => {
    // ScrollBar is used internally by ScrollArea
    expect(ScrollBar).toBeDefined()
  })
})
