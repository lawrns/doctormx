import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from './popover'

describe('Popover', () => {
  it('renders trigger correctly', () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    )
    expect(screen.getByText('Open Popover')).toBeInTheDocument()
  })

  it('opens popover when trigger is clicked', async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )
    
    fireEvent.click(screen.getByText('Open'))
    
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  it('handles open state changes', () => {
    const onOpenChange = vi.fn()
    render(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )
    
    fireEvent.click(screen.getByText('Open'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('renders with default open', async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })
})

describe('PopoverContent', () => {
  it('renders with data attribute', async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent data-testid="popover-content">
          Content
        </PopoverContent>
      </Popover>
    )
    
    await waitFor(() => {
      const content = screen.getByTestId('popover-content')
      expect(content).toHaveAttribute('data-slot', 'popover-content')
    })
  })

  it('applies custom className', async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-popover">
          Content
        </PopoverContent>
      </Popover>
    )
    
    await waitFor(() => {
      // Popover is rendered in a portal, query by data-slot attribute
      const content = document.querySelector('[data-slot="popover-content"]')
      expect(content).toHaveClass('custom-popover')
    })
  })
})

describe('PopoverAnchor', () => {
  it('renders anchor correctly', () => {
    render(
      <Popover>
        <PopoverAnchor>
          <button>Anchor</button>
        </PopoverAnchor>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )
    expect(screen.getByText('Anchor')).toBeInTheDocument()
  })
})
