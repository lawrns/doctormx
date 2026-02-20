import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './tooltip'

describe('Tooltip', () => {
  it('renders trigger correctly', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('renders with defaultOpen', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    
    // With defaultOpen, the tooltip should be visible - use getAllByText since Radix renders it in multiple places
    const tooltips = screen.getAllByText('Tooltip text')
    expect(tooltips.length).toBeGreaterThan(0)
  })
})

describe('TooltipContent', () => {
  it('applies custom className', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent className="custom-tooltip">Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    
    // Query by data-slot to find the actual content element
    const content = document.querySelector('[data-slot="tooltip-content"]')
    expect(content).toHaveClass('custom-tooltip')
  })
})
