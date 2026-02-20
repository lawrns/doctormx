import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from './sheet'

describe('Sheet', () => {
  it('renders trigger correctly', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
      </Sheet>
    )
    expect(screen.getByText('Open Sheet')).toBeInTheDocument()
  })

  it('opens sheet when trigger is clicked', async () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Sheet Title</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    
    fireEvent.click(screen.getByText('Open'))
    
    await waitFor(() => {
      expect(screen.getByText('Sheet Title')).toBeInTheDocument()
    })
  })

  it('closes sheet when close button is clicked', async () => {
    const onOpenChange = vi.fn()
    render(
      <Sheet onOpenChange={onOpenChange}>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    
    fireEvent.click(screen.getByText('Open'))
    
    await waitFor(() => {
      const closeButton = screen.getByLabelText('Cerrar panel')
      fireEvent.click(closeButton)
    })
    
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('SheetContent', () => {
  it('renders with data attribute', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent data-testid="sheet-content">
          Content
        </SheetContent>
      </Sheet>
    )
    
    await waitFor(() => {
      const content = screen.getByTestId('sheet-content')
      expect(content).toHaveAttribute('data-slot', 'sheet-content')
    })
  })

  it('applies side classes', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="left" data-testid="sheet-content">
          Content
        </SheetContent>
      </Sheet>
    )
    
    await waitFor(() => {
      const content = screen.getByTestId('sheet-content')
      expect(content).toHaveClass('inset-y-0')
    })
  })
})

describe('SheetHeader', () => {
  it('renders correctly', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetHeader>Header Content</SheetHeader>
        </SheetContent>
      </Sheet>
    )
    
    await waitFor(() => {
      const header = screen.getByText('Header Content')
      expect(header).toHaveAttribute('data-slot', 'sheet-header')
    })
  })
})

describe('SheetFooter', () => {
  it('renders correctly', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetFooter>Footer Content</SheetFooter>
        </SheetContent>
      </Sheet>
    )
    
    await waitFor(() => {
      const footer = screen.getByText('Footer Content')
      expect(footer).toHaveAttribute('data-slot', 'sheet-footer')
    })
  })
})

describe('SheetTitle', () => {
  it('renders correctly', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument()
    })
  })
})

describe('SheetDescription', () => {
  it('renders correctly', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })
})

describe('Complete Sheet', () => {
  it('renders a complete sheet', async () => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <div>Sheet Body</div>
          <SheetFooter>
            <button>Action</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Sheet Title')).toBeInTheDocument()
      expect(screen.getByText('Sheet Description')).toBeInTheDocument()
      expect(screen.getByText('Sheet Body')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })
  })
})
