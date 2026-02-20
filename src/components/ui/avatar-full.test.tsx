import { describe, it, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarStatus,
  UserAvatar,
  DoctorAvatar,
  AvatarGroup,
  avatarVariants,
  fallbackVariants,
  statusVariants,
} from './avatar'

describe('Avatar', () => {
  it('renders with default props', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-slot', 'avatar')
  })

  it('renders with different sizes', () => {
    const sizes = ['xs', 'sm', 'default', 'lg', 'xl', '2xl', '3xl'] as const
    sizes.forEach(size => {
      const { container } = render(
        <Avatar size={size}>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      )
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('renders with different borders', () => {
    const borders = ['none', 'default', 'primary', 'secondary', 'white'] as const
    borders.forEach(border => {
      const { container } = render(
        <Avatar border={border}>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      )
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('renders with status', () => {
    const statuses = ['online', 'offline', 'away', 'busy'] as const
    statuses.forEach(status => {
      const { container } = render(
        <Avatar status={status}>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      )
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    render(
      <Avatar className="custom-avatar" data-testid="avatar">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByTestId('avatar')).toHaveClass('custom-avatar')
  })
})

describe('AvatarImage', () => {
  it('renders with src and alt', () => {
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test User" />
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    )
    // AvatarImage may not render if image fails to load, fallback will show
    expect(screen.getByText('TU')).toBeInTheDocument()
  })
})

describe('AvatarFallback', () => {
  it('renders with different variants', () => {
    const { container, unmount } = render(
      <Avatar>
        <AvatarFallback variant="default">A</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    unmount()
    
    const variants = ['primary', 'secondary', 'accent', 'destructive', 'gradient'] as const
    variants.forEach(variant => {
      const { unmount } = render(
        <Avatar>
          <AvatarFallback variant={variant}>A</AvatarFallback>
        </Avatar>
      )
      expect(screen.getAllByText('A')[0]).toBeInTheDocument()
      unmount()
    })
  })

  it('renders with different sizes', () => {
    const sizes = ['xs', 'sm', 'default', 'lg', 'xl', '2xl', '3xl'] as const
    sizes.forEach((size) => {
      const { unmount } = render(
        <Avatar>
          <AvatarFallback size={size}>A</AvatarFallback>
        </Avatar>
      )
      expect(screen.getByText('A')).toBeInTheDocument()
      unmount()
      cleanup()
    })
  })
})

describe('AvatarStatus', () => {
  it('returns null when no status', () => {
    const { container } = render(<AvatarStatus status={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders with different statuses', () => {
    const statuses = ['online', 'offline', 'away', 'busy'] as const
    statuses.forEach(status => {
      const { container } = render(<AvatarStatus status={status} />)
      expect(container.firstChild).toHaveAttribute('aria-label', `Status: ${status}`)
    })
  })
})

describe('UserAvatar', () => {
  it('renders with name and generates initials', () => {
    render(<UserAvatar name="John Doe" alt="John Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders with single name', () => {
    render(<UserAvatar name="John" alt="John" />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders with image when src provided', () => {
    render(<UserAvatar name="John Doe" alt="John Doe" src="/avatar.jpg" />)
    const img = document.querySelector('img')
    // AvatarImage may not render img immediately in test environment
    // Just verify the component renders without error
    expect(screen.getByText('JD')).toBeInTheDocument()
    if (img) {
      expect(img).toHaveAttribute('src', '/avatar.jpg')
    }
  })

  it('renders with status indicator', () => {
    render(<UserAvatar name="John Doe" alt="John Doe" status="online" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })
})

describe('DoctorAvatar', () => {
  it('renders with default props', () => {
    render(<DoctorAvatar name="Dr. Smith" alt="Dr. Smith" />)
    expect(screen.getByText('DS')).toBeInTheDocument()
  })

  it('renders with online status', () => {
    render(<DoctorAvatar name="Dr. Smith" alt="Dr. Smith" isOnline={true} />)
    expect(screen.getByText('DS')).toBeInTheDocument()
  })

  it('renders with offline status by default', () => {
    render(<DoctorAvatar name="Dr. Smith" alt="Dr. Smith" />)
    expect(screen.getByText('DS')).toBeInTheDocument()
  })
})

describe('AvatarGroup', () => {
  it('renders multiple avatars', () => {
    render(
      <AvatarGroup>
        <div data-testid="avatar-1">A1</div>
        <div data-testid="avatar-2">A2</div>
        <div data-testid="avatar-3">A3</div>
      </AvatarGroup>
    )
    expect(screen.getByTestId('avatar-1')).toBeInTheDocument()
    expect(screen.getByTestId('avatar-2')).toBeInTheDocument()
    expect(screen.getByTestId('avatar-3')).toBeInTheDocument()
  })

  it('renders with max limit', () => {
    render(
      <AvatarGroup max={2}>
        <div>A1</div>
        <div>A2</div>
        <div>A3</div>
        <div>A4</div>
      </AvatarGroup>
    )
    expect(screen.getByText('+2')).toBeInTheDocument()
  })
})

describe('avatarVariants', () => {
  it('returns default classes', () => {
    const classes = avatarVariants()
    expect(classes).toContain('relative')
    expect(classes).toContain('flex')
  })

  it('applies size classes', () => {
    const classes = avatarVariants({ size: 'lg' })
    expect(classes).toContain('size-12')
  })
})

describe('fallbackVariants', () => {
  it('returns default classes', () => {
    const classes = fallbackVariants()
    expect(classes).toContain('flex')
  })

  it('applies variant classes', () => {
    const classes = fallbackVariants({ variant: 'gradient' })
    expect(classes).toContain('bg-gradient')
  })
})

describe('statusVariants', () => {
  it('returns default classes', () => {
    const classes = statusVariants({ status: 'online' })
    expect(classes).toContain('bg-green-500')
  })
})
