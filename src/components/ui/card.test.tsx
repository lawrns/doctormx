import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card'

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card Content</Card>)
    const card = screen.getByText('Card Content')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('data-slot', 'card')
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Card</Card>)
    const card = screen.getByText('Card')
    expect(card).toHaveClass('custom-class')
  })
})

describe('CardHeader', () => {
  it('renders correctly', () => {
    render(<CardHeader>Header Content</CardHeader>)
    const header = screen.getByText('Header Content')
    expect(header).toBeInTheDocument()
    expect(header).toHaveAttribute('data-slot', 'card-header')
  })

  it('applies custom className', () => {
    render(<CardHeader className="custom-header">Header</CardHeader>)
    const header = screen.getByText('Header')
    expect(header).toHaveClass('custom-header')
  })
})

describe('CardTitle', () => {
  it('renders correctly', () => {
    render(<CardTitle>Title</CardTitle>)
    const title = screen.getByText('Title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveAttribute('data-slot', 'card-title')
  })
})

describe('CardDescription', () => {
  it('renders correctly', () => {
    render(<CardDescription>Description</CardDescription>)
    const desc = screen.getByText('Description')
    expect(desc).toBeInTheDocument()
    expect(desc).toHaveAttribute('data-slot', 'card-description')
  })
})

describe('CardAction', () => {
  it('renders correctly', () => {
    render(<CardAction>Action</CardAction>)
    const action = screen.getByText('Action')
    expect(action).toBeInTheDocument()
    expect(action).toHaveAttribute('data-slot', 'card-action')
  })
})

describe('CardContent', () => {
  it('renders correctly', () => {
    render(<CardContent>Content</CardContent>)
    const content = screen.getByText('Content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveAttribute('data-slot', 'card-content')
  })
})

describe('CardFooter', () => {
  it('renders correctly', () => {
    render(<CardFooter>Footer</CardFooter>)
    const footer = screen.getByText('Footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveAttribute('data-slot', 'card-footer')
  })
})

describe('Complete Card', () => {
  it('renders a complete card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })
})
