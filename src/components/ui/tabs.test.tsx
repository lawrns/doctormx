import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

describe('Tabs', () => {
  it('renders with default props', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
  })

  it('shows default tab content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    )
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('renders with controlled value', () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <Tabs value="tab1" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    )
    
    // Verify component renders in controlled mode
    expect(container).toBeInTheDocument()
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
  })

  it('renders disabled tab', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const tab2 = screen.getByText('Tab 2')
    // Radix UI sets data-disabled as empty string when disabled
    expect(tab2).toHaveAttribute('data-disabled')
  })
})

describe('TabsList', () => {
  it('renders with data attribute', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const list = screen.getByTestId('tabs-list')
    expect(list).toHaveAttribute('data-slot', 'tabs-list')
  })
})

describe('TabsTrigger', () => {
  it('renders with data attribute', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="trigger">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const trigger = screen.getByTestId('trigger')
    expect(trigger).toHaveAttribute('data-slot', 'tabs-trigger')
  })

  it('shows active state', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const trigger = screen.getByRole('tab', { selected: true })
    expect(trigger).toBeInTheDocument()
  })
})

describe('TabsContent', () => {
  it('renders with data attribute', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content">Content</TabsContent>
      </Tabs>
    )
    const content = screen.getByTestId('content')
    expect(content).toHaveAttribute('data-slot', 'tabs-content')
  })
})
