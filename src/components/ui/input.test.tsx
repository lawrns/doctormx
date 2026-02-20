import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './input'

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-slot', 'input')
  })

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
  })

  it('renders with different types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url']
    
    types.forEach(type => {
      const { container } = render(<Input type={type} />)
      const input = container.querySelector(`input[type="${type}"]`)
      expect(input).toBeInTheDocument()
    })
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('handles focus and blur events', () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    render(<Input onFocus={onFocus} onBlur={onBlur} />)
    const input = screen.getByRole('textbox')
    
    fireEvent.focus(input)
    expect(onFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('renders with default value', () => {
    render(<Input defaultValue="default text" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('default text')
  })

  it('renders with controlled value', () => {
    render(<Input value="controlled value" readOnly />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('controlled value')
  })

  it('has correct aria attributes when invalid', () => {
    render(<Input aria-invalid="true" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders with name attribute', () => {
    render(<Input name="test-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('name', 'test-input')
  })

  it('renders with id attribute', () => {
    render(<Input id="test-id" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('id', 'test-id')
  })
})
