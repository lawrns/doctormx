import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CookieConsent, WithdrawConsentButton } from '../CookieConsent';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: { reload: vi.fn() },
  writable: true,
});

describe('CookieConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show banner when no consent is stored', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<CookieConsent />);
    
    expect(screen.getByText('Tu privacidad importa')).toBeInTheDocument();
    expect(screen.getByLabelText('Aceptar todas las cookies')).toBeInTheDocument();
    expect(screen.getByLabelText('Rechazar cookies no esenciales')).toBeInTheDocument();
  });

  it('should not show banner when consent is already given', () => {
    const consent = JSON.stringify({
      essential: true,
      functional: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0',
    });
    localStorageMock.getItem.mockReturnValue(consent);
    
    render(<CookieConsent />);
    
    expect(screen.queryByText('Tu privacidad importa')).not.toBeInTheDocument();
  });

  it('should save all preferences when accepting all', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<CookieConsent />);
    
    const acceptAllButton = screen.getByLabelText('Aceptar todas las cookies');
    fireEvent.click(acceptAllButton);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cookie-consent-preferences',
        expect.stringContaining('"essential":true')
      );
    });
    
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.functional).toBe(true);
    expect(savedData.analytics).toBe(true);
    expect(savedData.marketing).toBe(true);
    expect(savedData.version).toBe('1.0');
  });

  it('should save only essential when rejecting all', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<CookieConsent />);
    
    const rejectButton = screen.getByLabelText('Rechazar cookies no esenciales');
    fireEvent.click(rejectButton);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cookie-consent-preferences',
        expect.stringContaining('"essential":true')
      );
    });
    
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.functional).toBe(false);
    expect(savedData.analytics).toBe(false);
    expect(savedData.marketing).toBe(false);
  });

  it('should allow toggling individual categories', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<CookieConsent />);
    
    // Toggle functional cookies
    const functionalCheckbox = screen.getByLabelText('Cookies Funcionales');
    fireEvent.click(functionalCheckbox);
    
    // Save preferences
    const saveButton = screen.getByLabelText('Guardar preferencias de cookies');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
    
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.functional).toBe(true);
    expect(savedData.analytics).toBe(false);
    expect(savedData.marketing).toBe(false);
  });

  it('should not allow toggling essential cookies', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<CookieConsent />);
    
    const essentialCheckbox = screen.getByLabelText('Cookies Esenciales');
    expect(essentialCheckbox).toBeDisabled();
  });

  it('should have proper accessibility attributes', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<CookieConsent />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'cookie-consent-title');
    
    expect(screen.getByLabelText('Aceptar todas las cookies')).toBeInTheDocument();
    expect(screen.getByLabelText('Rechazar cookies no esenciales')).toBeInTheDocument();
  });

  it('should link to cookie policy page', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<CookieConsent />);
    
    const policyLink = screen.getByText('Política de Cookies');
    expect(policyLink).toHaveAttribute('href', '/cookies');
  });
});

describe('WithdrawConsentButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show withdraw button when consent exists', () => {
    const consent = JSON.stringify({
      essential: true,
      functional: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0',
    });
    localStorageMock.getItem.mockReturnValue(consent);
    
    render(<WithdrawConsentButton />);
    
    expect(screen.getByLabelText('Retirar consentimiento de cookies')).toBeInTheDocument();
  });

  it('should show message when no consent exists', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<WithdrawConsentButton />);
    
    expect(screen.getByText(/No tienes consentimiento activo/i)).toBeInTheDocument();
  });

  it('should remove consent when clicking withdraw', async () => {
    const consent = JSON.stringify({
      essential: true,
      functional: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0',
    });
    localStorageMock.getItem.mockReturnValue(consent);
    
    render(<WithdrawConsentButton />);
    
    const withdrawButton = screen.getByLabelText('Retirar consentimiento de cookies');
    fireEvent.click(withdrawButton);
    
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent-preferences');
    });
    
    expect(window.location.reload).toHaveBeenCalled();
  });
});
