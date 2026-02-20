import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RadioGroup, RadioGroupItem } from './radio-group'

describe('RadioGroup', () => {
  it('renders with default props', () => {
    render(
      <RadioGroup defaultValue="1">
        <RadioGroupItem value="1" />
        <RadioGroupItem value="2" />
      </RadioGroup>
    )
    const radioGroup = screen.getByRole('radiogroup')
    expect(radioGroup).toBeInTheDocument()
  })

  it('renders radio items', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="1" />
        <RadioGroupItem value="2" />
      </RadioGroup>
    )
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
  })

  it('handles value changes', () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup onValueChange={onValueChange}>
        <RadioGroupItem value="1" />
        <RadioGroupItem value="2" />
      </RadioGroup>
    )
    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios[1])
    expect(onValueChange).toHaveBeenCalledWith('2')
  })

  it('can be disabled', () => {
    render(
      <RadioGroup disabled>
        <RadioGroupItem value="1" />
      </RadioGroup>
    )
    const radio = screen.getByRole('radio')
    expect(radio).toBeDisabled()
  })

  it('renders with default value selected', () => {
    render(
      <RadioGroup defaultValue="2">
        <RadioGroupItem value="1" />
        <RadioGroupItem value="2" />
      </RadioGroup>
    )
    const radios = screen.getAllByRole('radio')
    expect(radios[1]).toBeChecked()
  })

  it('renders controlled value', () => {
    render(
      <RadioGroup value="1">
        <RadioGroupItem value="1" />
        <RadioGroupItem value="2" />
      </RadioGroup>
    )
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toBeChecked()
  })
})

describe('RadioGroupItem', () => {
  it('renders with id', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="1" id="radio-1" />
      </RadioGroup>
    )
    const radio = screen.getByRole('radio')
    expect(radio).toHaveAttribute('id', 'radio-1')
  })

  it('renders with label', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="1" id="radio-1" />
        <label htmlFor="radio-1">Option 1</label>
      </RadioGroup>
    )
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="1" className="custom-radio" />
      </RadioGroup>
    )
    const radio = screen.getByRole('radio')
    expect(radio).toHaveClass('custom-radio')
  })

  it('can be disabled individually', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="1" />
        <RadioGroupItem value="2" disabled />
      </RadioGroup>
    )
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).not.toBeDisabled()
    expect(radios[1]).toBeDisabled()
  })
})
