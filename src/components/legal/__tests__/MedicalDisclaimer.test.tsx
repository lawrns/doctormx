/**
 * Medical Disclaimer Component Tests
 * 
 * @module legal/__tests__/MedicalDisclaimer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MedicalDisclaimer, CompactMedicalDisclaimer } from '../MedicalDisclaimer'

describe('MedicalDisclaimer', () => {
  const mockOnAcknowledge = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the main disclaimer text', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      expect(screen.getByText(/Aviso Médico Importante/i)).toBeInTheDocument()
      expect(screen.getByText(/Descargo de Responsabilidad Médica/i)).toBeInTheDocument()
    })

    it('should display the required Spanish disclaimer text', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      expect(screen.getByText(/NO proporciona diagnóstico médico/i)).toBeInTheDocument()
      expect(screen.getByText(/llame al 911/i)).toBeInTheDocument()
      expect(screen.getByText(/vaya a urgencias inmediatamente/i)).toBeInTheDocument()
    })

    it('should render capabilities section', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      expect(screen.getByText(/Lo que esta herramienta PUEDE hacer/i)).toBeInTheDocument()
      expect(screen.getByText(/Recopilar información sobre sus síntomas/i)).toBeInTheDocument()
    })

    it('should render limitations section', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      expect(screen.getByText(/Lo que esta herramienta NO PUEDE hacer/i)).toBeInTheDocument()
      expect(screen.getByText(/Diagnosticar condiciones médicas/i)).toBeInTheDocument()
      expect(screen.getByText(/Reemplazar la consulta con un médico profesional/i)).toBeInTheDocument()
    })

    it('should render emergency information when showEmergencyInfo is true', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} showEmergencyInfo={true} />)
      
      expect(screen.getByText(/En caso de emergencia/i)).toBeInTheDocument()
      expect(screen.getByText(/911/)).toBeInTheDocument()
    })

    it('should not render emergency information when showEmergencyInfo is false', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} showEmergencyInfo={false} />)
      
      expect(screen.queryByText(/En caso de emergencia/i)).not.toBeInTheDocument()
    })
  })

  describe('Acknowledgment Behavior', () => {
    it('should disable continue button when checkbox is not checked', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      const continueButton = screen.getByRole('button', { name: /Continuar/i })
      expect(continueButton).toBeDisabled()
    })

    it('should enable continue button when checkbox is checked', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      
      const continueButton = screen.getByRole('button', { name: /Continuar/i })
      expect(continueButton).toBeEnabled()
    })

    it('should not require acknowledgment when requireAcknowledgment is false', () => {
      render(
        <MedicalDisclaimer 
          onAcknowledge={mockOnAcknowledge} 
          requireAcknowledgment={false} 
        />
      )
      
      const continueButton = screen.getByRole('button', { name: /Continuar/i })
      expect(continueButton).toBeEnabled()
    })

    it('should display acknowledgment checkbox with legal text', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByText(/Entiendo y acepto/i)).toBeInTheDocument()
      expect(screen.getByText(/He leído y comprendo que esta herramienta no proporciona diagnóstico médico/i)).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onAcknowledge with timestamp when continue is clicked', async () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      
      const continueButton = screen.getByRole('button', { name: /Continuar/i })
      fireEvent.click(continueButton)
      
      await waitFor(() => {
        expect(mockOnAcknowledge).toHaveBeenCalledOnce()
        expect(mockOnAcknowledge).toHaveBeenCalledWith(expect.any(String))
      })
      
      // Verify timestamp is a valid ISO string
      const timestamp = mockOnAcknowledge.mock.calls[0][0]
      expect(() => new Date(timestamp)).not.toThrow()
    })

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <MedicalDisclaimer 
          onAcknowledge={mockOnAcknowledge} 
          onCancel={mockOnCancel}
        />
      )
      
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i })
      fireEvent.click(cancelButton)
      
      expect(mockOnCancel).toHaveBeenCalledOnce()
    })

    it('should not call onAcknowledge if checkbox is not checked', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      const continueButton = screen.getByRole('button', { name: /Continuar/i })
      expect(continueButton).toBeDisabled()
      
      // Even if we try to click (bypassing disabled), it shouldn't work
      fireEvent.click(continueButton)
      expect(mockOnAcknowledge).not.toHaveBeenCalled()
    })

    it('should show loading state when submitting', async () => {
      // Create a delayed promise to simulate async operation
      mockOnAcknowledge.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      
      const continueButton = screen.getByRole('button', { name: /Continuar/i })
      fireEvent.click(continueButton)
      
      // Button should show loading state
      expect(continueButton).toBeDisabled()
    })
  })

  describe('Privacy and Compliance', () => {
    it('should display privacy notice', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      expect(screen.getByText(/Protección de Datos/i)).toBeInTheDocument()
      expect(screen.getByText(/Ley Federal de Protección de Datos/i)).toBeInTheDocument()
    })

    it('should display timestamp recording notice', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      expect(screen.getByText(/Este reconocimiento será registrado con fecha y hora/i)).toBeInTheDocument()
    })

    it('should have links to terms and privacy pages', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      const termsLink = screen.getByRole('link', { name: /Términos de Servicio/i })
      const privacyLink = screen.getByRole('link', { name: /Política de Privacidad/i })
      
      expect(termsLink).toHaveAttribute('href', '/terms')
      expect(privacyLink).toHaveAttribute('href', '/privacy')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'medical-disclaimer-ack')
    })

    it('should have clickable label for checkbox', () => {
      render(<MedicalDisclaimer onAcknowledge={mockOnAcknowledge} />)
      
      const label = screen.getByText(/Entiendo y acepto/i)
      expect(label.closest('label')).toBeInTheDocument()
    })
  })
})

describe('CompactMedicalDisclaimer', () => {
  const mockOnAcknowledge = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render compact version with essential elements', () => {
    render(
      <CompactMedicalDisclaimer 
        onAcknowledge={mockOnAcknowledge}
        onCancel={mockOnCancel}
      />
    )
    
    expect(screen.getByText(/Aviso Importante/i)).toBeInTheDocument()
    expect(screen.getByText(/NO proporciona diagnóstico médico/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should be more compact than full version', () => {
    const { container: compactContainer } = render(
      <CompactMedicalDisclaimer 
        onAcknowledge={mockOnAcknowledge}
        onCancel={mockOnCancel}
      />
    )
    
    // Compact version should not have certain elements
    expect(screen.queryByText(/Lo que esta herramienta PUEDE hacer/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Lo que esta herramienta NO PUEDE hacer/i)).not.toBeInTheDocument()
  })
})
