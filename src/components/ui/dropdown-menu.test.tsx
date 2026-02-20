import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu'

describe('DropdownMenu', () => {
  it('renders trigger correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
      </DropdownMenu>
    )
    expect(screen.getByText('Open Menu')).toBeInTheDocument()
  })

  it('opens menu when trigger is clicked', async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })
  })
})

describe('DropdownMenuItem', () => {
  it('handles click events', async () => {
    const handleSelect = vi.fn()
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleSelect}>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await waitFor(() => {
      const item = screen.getByText('Item')
      fireEvent.click(item)
    })
    
    expect(handleSelect).toHaveBeenCalled()
  })
})

describe('DropdownMenuLabel', () => {
  it('renders label correctly', async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Label')).toBeInTheDocument()
    })
  })
})

describe('DropdownMenuSeparator', () => {
  it('renders separator', async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSeparator data-testid="separator" />
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await waitFor(() => {
      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('data-slot', 'dropdown-menu-separator')
    })
  })
})

describe('DropdownMenuShortcut', () => {
  it('renders shortcut text', async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Item <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await waitFor(() => {
      expect(screen.getByText('⌘K')).toBeInTheDocument()
    })
  })
})

describe('DropdownMenuCheckboxItem', () => {
  it('renders checkbox item', async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>
            Checkbox Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Checkbox Item')).toBeInTheDocument()
    })
  })
})

describe('DropdownMenuRadioGroup', () => {
  it('renders radio items', async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="1">
            <DropdownMenuRadioItem value="1">Option 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="2">Option 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })
  })
})
