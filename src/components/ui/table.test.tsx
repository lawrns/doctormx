import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table'

describe('Table', () => {
  it('renders with default props', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Table className="custom-table">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const table = screen.getByRole('table')
    expect(table).toHaveClass('custom-table')
  })

  it('has correct wrapper structure', () => {
    const { container } = render(
      <Table>
        <TableBody />
      </Table>
    )
    expect(container.querySelector('[class*="relative"]')).toBeInTheDocument()
  })
})

describe('TableHeader', () => {
  it('renders header correctly', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    expect(screen.getByText('Header')).toBeInTheDocument()
  })
})

describe('TableBody', () => {
  it('renders body correctly', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Body Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByText('Body Cell')).toBeInTheDocument()
  })
})

describe('TableFooter', () => {
  it('renders footer correctly', () => {
    render(
      <Table>
        <TableBody />
        <TableFooter>
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})

describe('TableHead', () => {
  it('renders head cell correctly', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })
})

describe('TableRow', () => {
  it('renders row correctly', () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="row">
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const row = screen.getByTestId('row')
    expect(row).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Table>
        <TableBody>
          <TableRow className="custom-row" data-testid="row">
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const row = screen.getByTestId('row')
    expect(row).toHaveClass('custom-row')
  })
})

describe('TableCell', () => {
  it('renders cell correctly', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByText('Cell Content')).toBeInTheDocument()
  })
})

describe('TableCaption', () => {
  it('renders caption correctly', () => {
    render(
      <Table>
        <TableCaption>Table Caption</TableCaption>
        <TableBody />
      </Table>
    )
    expect(screen.getByText('Table Caption')).toBeInTheDocument()
  })
})

describe('Complete Table', () => {
  it('renders complete table structure', () => {
    render(
      <Table>
        <TableCaption>User List</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total: 1 user</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
    
    expect(screen.getByText('User List')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Total: 1 user')).toBeInTheDocument()
  })
})
