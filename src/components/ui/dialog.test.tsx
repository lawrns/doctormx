import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog'

describe('Dialog', () => {
  it('renders trigger correctly', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>
    )
    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('opens dialog when trigger is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    
    fireEvent.click(screen.getByText('Open'))
    
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })
  })

  it('renders dialog content with data attributes', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent data-testid="dialog-content">
          Content
        </DialogContent>
      </Dialog>
    )
    
    await waitFor(() => {
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveAttribute('data-slot', 'dialog-content')
    })
  })
})

describe('DialogHeader', () => {
  it('renders correctly', () => {
    render(<DialogHeader>Header Content</DialogHeader>)
    const header = screen.getByText('Header Content')
    expect(header).toBeInTheDocument()
    expect(header).toHaveAttribute('data-slot', 'dialog-header')
  })
})

describe('DialogFooter', () => {
  it('renders correctly', () => {
    render(<DialogFooter>Footer Content</DialogFooter>)
    const footer = screen.getByText('Footer Content')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveAttribute('data-slot', 'dialog-footer')
  })
})

describe('DialogTitle', () => {
  it('renders correctly', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    
    await waitFor(() => {
      const title = screen.getByText('Title')
      expect(title).toBeInTheDocument()
    })
  })
})

describe('DialogDescription', () => {
  it('renders correctly', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    
    await waitFor(() => {
      const desc = screen.getByText('Description')
      expect(desc).toBeInTheDocument()
    })
  })
})

describe('DialogClose', () => {
  it('renders close button', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    
    await waitFor(() => {
      const closeButton = screen.getByLabelText('Cerrar diálogo')
      expect(closeButton).toBeInTheDocument()
    })
  })

  it('closes dialog when close button is clicked', async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    
    await waitFor(() => {
      const closeButton = screen.getByLabelText('Cerrar diálogo')
      fireEvent.click(closeButton)
    })
    
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('Complete Dialog', () => {
  it('renders a complete dialog', async () => {
    render(
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Body</div>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      expect(screen.getByText('Dialog Description')).toBeInTheDocument()
      expect(screen.getByText('Dialog Body')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })
  })
})
