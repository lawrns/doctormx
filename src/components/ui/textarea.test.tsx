import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders with default props', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter text" />)
    const textarea = screen.getByPlaceholderText('Enter text')
    expect(textarea).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Textarea onChange={handleChange} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'test value' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(<Textarea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('custom-class')
  })

  it('renders with rows attribute', () => {
    render(<Textarea rows={5} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('renders with default value', () => {
    render(<Textarea defaultValue="default text" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('default text')
  })

  it('handles focus and blur events', () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    render(<Textarea onFocus={onFocus} onBlur={onBlur} />)
    const textarea = screen.getByRole('textbox')
    
    fireEvent.focus(textarea)
    expect(onFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(textarea)
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('renders with name attribute', () => {
    render(<Textarea name="test-textarea" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('name', 'test-textarea')
  })

  it('renders with id attribute', () => {
    render(<Textarea id="test-id" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('id', 'test-id')
  })
})
