import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCookieConsent } from '../useCookieConsent';

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

describe('useCookieConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with no consent', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.hasConsent).toBe(false);
    expect(result.current.preferences).toBeNull();
  });

  it('should load existing consent from localStorage', async () => {
    const existingConsent = {
      essential: true,
      functional: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingConsent));
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.hasConsent).toBe(true);
    expect(result.current.preferences).toEqual(existingConsent);
  });

  it('should reject outdated consent versions', async () => {
    const outdatedConsent = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: '0.9', // Versión antigua
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(outdatedConsent));
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.hasConsent).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent-preferences');
  });

  it('should accept all cookies', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    act(() => {
      result.current.acceptAll();
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cookie-consent-preferences',
      expect.stringContaining('"essential":true')
    );
    
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.functional).toBe(true);
    expect(savedData.analytics).toBe(true);
    expect(savedData.marketing).toBe(true);
  });

  it('should reject all non-essential cookies', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    act(() => {
      result.current.rejectAll();
    });
    
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.essential).toBe(true);
    expect(savedData.functional).toBe(false);
    expect(savedData.analytics).toBe(false);
    expect(savedData.marketing).toBe(false);
  });

  it('should save custom preferences', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    act(() => {
      result.current.savePreferences({
        essential: true,
        functional: true,
        analytics: false,
        marketing: true,
      });
    });
    
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.essential).toBe(true);
    expect(savedData.functional).toBe(true);
    expect(savedData.analytics).toBe(false);
    expect(savedData.marketing).toBe(true);
  });

  it('should always keep essential cookies as true', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    act(() => {
      result.current.savePreferences({
        essential: false, // Intentar desactivar
        functional: true,
      });
    });
    
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.essential).toBe(true); // Siempre debe ser true
  });

  it('should update individual preferences', async () => {
    const existingConsent = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingConsent));
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    act(() => {
      result.current.updatePreference('analytics', true);
    });
    
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.analytics).toBe(true);
    expect(savedData.functional).toBe(false); // Sin cambios
  });

  it('should withdraw consent', async () => {
    const existingConsent = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingConsent));
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    act(() => {
      result.current.withdrawConsent();
    });
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent-preferences');
    expect(result.current.hasConsent).toBe(false);
    expect(result.current.preferences).toBeNull();
  });

  it('should check if category is allowed', async () => {
    const existingConsent = {
      essential: true,
      functional: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingConsent));
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.isAllowed('essential')).toBe(true);
    expect(result.current.isAllowed('functional')).toBe(true);
    expect(result.current.isAllowed('analytics')).toBe(false);
    expect(result.current.isAllowed('marketing')).toBe(false);
  });

  it('should always allow essential even without consent', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.isAllowed('essential')).toBe(true);
    expect(result.current.isAllowed('analytics')).toBe(false);
  });

  it('should get default preferences when no consent', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    const prefs = result.current.getPreferences();
    expect(prefs.essential).toBe(true);
    expect(prefs.functional).toBe(false);
    expect(prefs.analytics).toBe(false);
    expect(prefs.marketing).toBe(false);
    expect(prefs.version).toBe('1.0');
  });

  it('should include timestamp when saving', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    const before = new Date().toISOString();
    
    act(() => {
      result.current.acceptAll();
    });
    
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.timestamp).toBeDefined();
    expect(new Date(savedData.timestamp).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime());
  });
});
