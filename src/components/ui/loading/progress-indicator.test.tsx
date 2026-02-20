import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressIndicator, useProgress, StepProgress, CircularProgress } from './progress-indicator'

describe('ProgressIndicator', () => {
  it('renders with default props', () => {
    render(<ProgressIndicator progress={50} message="Procesando" />)
    const indicator = screen.getByRole('progressbar')
    expect(indicator).toBeInTheDocument()
  })

  it('renders with correct progress value', () => {
    render(<ProgressIndicator progress={75} message="Cargando" />)
    const indicator = screen.getByRole('progressbar')
    expect(indicator).toHaveAttribute('aria-valuenow', '75')
  })

  it('renders with 0 progress', () => {
    render(<ProgressIndicator progress={0} message="Iniciando" />)
    const indicator = screen.getByRole('progressbar')
    expect(indicator).toHaveAttribute('aria-valuenow', '0')
  })

  it('renders with 100 progress', () => {
    render(<ProgressIndicator progress={100} message="Completado" isComplete />)
    const indicator = screen.getByRole('progressbar')
    expect(indicator).toHaveAttribute('aria-valuenow', '100')
  })

  it('renders with message', () => {
    render(<ProgressIndicator progress={50} message="Uploading..." />)
    expect(screen.getByText('Uploading...')).toBeInTheDocument()
  })

  it('renders percentage by default', () => {
    render(<ProgressIndicator progress={75} message="Cargando" />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('hides percentage when showPercentage is false', () => {
    render(<ProgressIndicator progress={75} message="Cargando" showPercentage={false} />)
    expect(screen.queryByText('75%')).not.toBeInTheDocument()
  })

  it('has correct aria attributes', () => {
    render(<ProgressIndicator progress={50} message="Cargando" />)
    const indicator = screen.getByRole('progressbar')
    expect(indicator).toHaveAttribute('aria-valuemin', '0')
    expect(indicator).toHaveAttribute('aria-valuemax', '100')
  })

  it('applies custom className', () => {
    render(<ProgressIndicator progress={50} message="Cargando" className="custom-indicator" />)
    const indicator = screen.getByRole('progressbar')
    expect(indicator).toHaveClass('custom-indicator')
  })

  it('renders indeterminate state', () => {
    render(<ProgressIndicator progress={0} message="Cargando" indeterminate />)
    const indicator = screen.getByRole('status')
    expect(indicator).toBeInTheDocument()
  })

  it('renders complete state', () => {
    render(<ProgressIndicator progress={100} message="Procesando" isComplete />)
    // In complete state, the message is replaced with completeMessage
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '100')
  })
})

describe('StepProgress', () => {
  const steps = [
    { id: '1', label: 'Step 1' },
    { id: '2', label: 'Step 2' },
    { id: '3', label: 'Step 3' },
  ]

  it('renders steps correctly', () => {
    render(<StepProgress steps={steps} currentStep={0} />)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.getByText('Step 2')).toBeInTheDocument()
    expect(screen.getByText('Step 3')).toBeInTheDocument()
  })

  it('marks current step correctly', () => {
    render(<StepProgress steps={steps} currentStep={1} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '2')
  })
})

describe('CircularProgress', () => {
  it('renders with progress value', () => {
    render(<CircularProgress progress={50} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toBeInTheDocument()
    expect(progressbar).toHaveAttribute('aria-valuenow', '50')
  })
})
