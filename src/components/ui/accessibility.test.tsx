import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './input'
import { Textarea } from './textarea'
import { Checkbox } from './checkbox'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Switch } from './switch'
import { Button } from './button'
import { FormInput, FormTextarea, FormSelect, FormCheckbox } from './form-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select'

describe('Accessibility - Form Inputs', () => {
  describe('Input', () => {
    it('renders with aria-label', () => {
      render(<Input aria-label="Email address" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', 'Email address')
    })

    it('renders with aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="help-text" />
          <p id="help-text">Enter your email</p>
        </>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('renders with descriptionId and errorId', () => {
      render(
        <>
          <Input descriptionId="desc-id" errorId="err-id" />
          <p id="desc-id">Description</p>
          <p id="err-id">Error message</p>
        </>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'desc-id err-id')
    })

    it('renders with aria-invalid', () => {
      render(<Input aria-invalid={true} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('prefers explicit aria-describedby over descriptionId/errorId', () => {
      render(<Input aria-describedby="custom-id" descriptionId="desc-id" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'custom-id')
    })
  })

  describe('Textarea', () => {
    it('renders with aria-label', () => {
      render(<Textarea aria-label="Comments" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-label', 'Comments')
    })

    it('renders with aria-describedby', () => {
      render(
        <>
          <Textarea descriptionId="help-text" />
          <p id="help-text">Maximum 500 characters</p>
        </>
      )
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('renders with aria-invalid', () => {
      render(<Textarea aria-invalid={true} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Checkbox', () => {
    it('renders with aria-label', () => {
      render(<Checkbox aria-label="Accept terms" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-label', 'Accept terms')
    })

    it('renders with aria-describedby', () => {
      render(
        <>
          <Checkbox descriptionId="help-text" />
          <p id="help-text">You must accept to continue</p>
        </>
      )
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('renders with errorId for error message', () => {
      render(
        <>
          <Checkbox errorId="error-text" />
          <p id="error-text">This field is required</p>
        </>
      )
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-describedby', 'error-text')
    })
  })

  describe('RadioGroup', () => {
    it('renders radio group with proper roles', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="1" aria-label="Option 1" />
          <RadioGroupItem value="2" aria-label="Option 2" />
        </RadioGroup>
      )
      const radioGroup = screen.getByRole('radiogroup')
      expect(radioGroup).toBeInTheDocument()
      const radios = screen.getAllByRole('radio')
      expect(radios).toHaveLength(2)
    })

    it('renders radio items with aria-describedby', () => {
      render(
        <>
          <RadioGroup>
            <RadioGroupItem value="1" descriptionId="desc-1" />
          </RadioGroup>
          <p id="desc-1">First option description</p>
        </>
      )
      const radio = screen.getByRole('radio')
      expect(radio).toHaveAttribute('aria-describedby', 'desc-1')
    })
  })

  describe('Switch', () => {
    it('renders with aria-label', () => {
      render(<Switch aria-label="Enable notifications" />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveAttribute('aria-label', 'Enable notifications')
    })

    it('renders with aria-describedby', () => {
      render(
        <>
          <Switch descriptionId="help-text" />
          <p id="help-text">Turn on to receive updates</p>
        </>
      )
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('toggles checked state', () => {
      render(<Switch />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveAttribute('aria-checked', 'false')
    })
  })
})

describe('Accessibility - Button', () => {
  it('renders with aria-label for icon-only button', () => {
    render(
      <Button size="icon" aria-label="Close dialog">
        <span>X</span>
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Close dialog' })
    expect(button).toHaveAttribute('aria-label', 'Close dialog')
  })

  it('renders regular button with text', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
  })

  it('passes aria-label through to button element', () => {
    render(<Button aria-label="Submit form">Submit</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })
})

describe('Accessibility - Form Components', () => {
  describe('FormInput', () => {
    it('links label to input via htmlFor', () => {
      render(<FormInput label="Email" id="email" />)
      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('id', 'email')
    })

    it('renders required indicator with hidden accessible text', () => {
      render(<FormInput label="Email" required />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-required', 'true')
      // Check for the sr-only required text in aria-describedby
      const describedBy = input.getAttribute('aria-describedby')
      expect(describedBy).toContain('required')
    })

    it('links error message via aria-describedby', () => {
      render(<FormInput label="Email" error="Invalid email" />)
      const input = screen.getByLabelText('Email')
      const describedBy = input.getAttribute('aria-describedby')
      expect(describedBy).toContain('error')
      
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Invalid email')
    })

    it('links hint text via aria-describedby when no error', () => {
      render(<FormInput label="Email" hint="We will never share your email" />)
      const input = screen.getByLabelText('Email')
      const describedBy = input.getAttribute('aria-describedby')
      expect(describedBy).toContain('hint')
    })

    it('sets aria-invalid when there is an error', () => {
      render(<FormInput label="Email" error="Invalid email" />)
      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('supports custom aria-label', () => {
      render(<FormInput aria-label="Enter your email address" />)
      const input = screen.getByLabelText('Enter your email address')
      expect(input).toBeInTheDocument()
    })

    it('hides icons from screen readers', () => {
      render(
        <FormInput 
          label="Search" 
          leftIcon={<span data-testid="left-icon">🔍</span>}
          rightIcon={<span data-testid="right-icon">✕</span>}
        />
      )
      const leftIcon = screen.getByTestId('left-icon').parentElement
      const rightIcon = screen.getByTestId('right-icon').parentElement
      expect(leftIcon).toHaveAttribute('aria-hidden', 'true')
      expect(rightIcon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('FormTextarea', () => {
    it('links label to textarea via htmlFor', () => {
      render(<FormTextarea label="Comments" id="comments" />)
      const textarea = screen.getByLabelText('Comments')
      expect(textarea).toHaveAttribute('id', 'comments')
    })

    it('renders required field correctly', () => {
      render(<FormTextarea label="Comments" required />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-required', 'true')
    })

    it('announces errors via live region', () => {
      render(<FormTextarea label="Comments" error="Comments are required" />)
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('FormSelect', () => {
    it('links label to select via htmlFor', () => {
      render(
        <FormSelect 
          label="Country" 
          id="country" 
          options={[{ value: 'us', label: 'United States' }]} 
        />
      )
      const select = screen.getByLabelText('Country')
      expect(select).toHaveAttribute('id', 'country')
    })

    it('renders required field correctly', () => {
      render(
        <FormSelect 
          label="Country" 
          required 
          options={[{ value: 'us', label: 'United States' }]} 
        />
      )
      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('aria-required', 'true')
    })

    it('links error message via aria-describedby', () => {
      render(
        <FormSelect 
          label="Country" 
          error="Please select a country" 
          options={[{ value: 'us', label: 'United States' }]} 
        />
      )
      const select = screen.getByLabelText('Country')
      const describedBy = select.getAttribute('aria-describedby')
      expect(describedBy).toContain('error')
    })
  })

  describe('FormCheckbox', () => {
    it('links label to checkbox via htmlFor', () => {
      render(<FormCheckbox label="Accept terms" id="terms" />)
      const checkbox = screen.getByLabelText('Accept terms')
      expect(checkbox).toHaveAttribute('id', 'terms')
    })

    it('renders required field correctly', () => {
      render(<FormCheckbox label="Accept terms" required />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-required', 'true')
    })
  })
})

describe('Accessibility - Select (Radix)', () => {
  it('renders select trigger with aria-label', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Select a fruit">
          <SelectValue placeholder="Select fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-label', 'Select a fruit')
  })

  it('links error message via aria-describedby', () => {
    render(
      <Select>
        <SelectTrigger errorId="select-error">
          <SelectValue placeholder="Select fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-describedby', 'select-error')
  })

  it('hides decorative icons from screen readers', () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    )
    // Check that chevron icon has aria-hidden
    const chevron = container.querySelector('[data-slot="select-trigger"] svg')
    expect(chevron).toHaveAttribute('aria-hidden', 'true')
  })
})
