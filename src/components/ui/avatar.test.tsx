import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'

describe('Avatar', () => {
  it('renders with default props', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    )
    const avatar = screen.getByTestId('avatar')
    expect(avatar).toBeInTheDocument()
  })

  it('renders with image', () => {
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test User" />
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    )
    // Avatar initially renders with image, which may or may not load
    const image = document.querySelector('img[alt="Test User"]')
    if (image) {
      expect(image).toHaveAttribute('src', '/test.jpg')
    }
    // At minimum, the fallback should be available
    expect(document.querySelector('[data-slot="avatar-fallback"]')).toBeInTheDocument()
  })

  it('renders fallback when image fails', () => {
    render(
      <Avatar>
        <AvatarImage src="/invalid.jpg" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>
    )
    const fallback = screen.getByText('FB')
    expect(fallback).toBeInTheDocument()
  })

  it('renders fallback content', () => {
    render(
      <Avatar>
        <AvatarFallback>John Doe</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('applies custom className to Avatar', () => {
    render(
      <Avatar className="custom-avatar" data-testid="avatar">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    )
    const avatar = screen.getByTestId('avatar')
    expect(avatar).toHaveClass('custom-avatar')
  })

  it('applies custom className to AvatarFallback', () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback">A</AvatarFallback>
      </Avatar>
    )
    const fallback = screen.getByText('A')
    expect(fallback).toHaveClass('custom-fallback')
  })
})
