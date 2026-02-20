import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from './select'

describe('Select', () => {
  it('renders with default props', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('opens select when trigger is clicked', async () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Option 1</SelectItem>
          <SelectItem value="2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )
    
    fireEvent.click(screen.getByTestId('trigger'))
    
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })
  })

  it('handles value changes', async () => {
    const onValueChange = vi.fn()
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )
    
    fireEvent.click(screen.getByTestId('trigger'))
    
    await waitFor(() => {
      const option = screen.getByText('Option 1')
      fireEvent.click(option)
    })
    
    expect(onValueChange).toHaveBeenCalledWith('1')
  })

  it('renders disabled select', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
    )
    const trigger = screen.getByRole('combobox')
    // Radix UI sets data-disabled as an empty string when disabled (presence of attribute means disabled)
    expect(trigger).toHaveAttribute('data-disabled')
  })
})

describe('SelectGroup', () => {
  it('renders group with label', async () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group Label</SelectLabel>
            <SelectItem value="1">Item 1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Group Label')).toBeInTheDocument()
    })
  })
})

describe('SelectSeparator', () => {
  it('renders separator', async () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Item 1</SelectItem>
          <SelectSeparator />
          <SelectItem value="2">Item 2</SelectItem>
        </SelectContent>
      </Select>
    )
    
    await waitFor(() => {
      const separator = document.querySelector('[data-slot="select-separator"]')
      expect(separator).toBeInTheDocument()
    })
  })
})
