import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EnhancedNavbar } from '../index';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock the AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    signOut: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const renderNavbar = () => {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <EnhancedNavbar />
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('EnhancedNavbar', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders the logo and brand name', () => {
    renderNavbar();
    expect(screen.getByText('Doctor.mx')).toBeInTheDocument();
  });

  it('renders the main navigation items', () => {
    renderNavbar();
    expect(screen.getByText('Buscar Médicos')).toBeInTheDocument();
    expect(screen.getByText('Especialidades')).toBeInTheDocument();
    expect(screen.getByText('Servicios')).toBeInTheDocument();
    expect(screen.getByText('Para Doctores')).toBeInTheDocument();
    expect(screen.getByText('Comunidad')).toBeInTheDocument();
  });

  it('renders the Doctor IA button', () => {
    renderNavbar();
    expect(screen.getByText('Doctor IA')).toBeInTheDocument();
    expect(screen.getByText('¡NUEVO!')).toBeInTheDocument();
  });

  it('toggles mobile menu when menu button is clicked', () => {
    renderNavbar();
    
    // Menu should be hidden initially
    expect(screen.queryByText('Telemedicina')).not.toBeVisible();
    
    // Click menu button
    const menuButton = screen.getByLabelText('Abrir menú');
    fireEvent.click(menuButton);
    
    // Menu should be visible now
    expect(screen.queryAllByText('Iniciar sesión')[0]).toBeVisible();
  });

  it('shows language selector when clicked', () => {
    renderNavbar();
    
    // Language options should be hidden initially
    expect(screen.queryByText('Español (México)')).not.toBeVisible();
    
    // Click language button (ES)
    const languageButton = screen.getByText('ES');
    fireEvent.click(languageButton);
    
    // Language options should be visible
    expect(screen.getByText('Español (México)')).toBeVisible();
    expect(screen.getByText('English')).toBeVisible();
  });

  it('changes language when a language option is clicked', () => {
    renderNavbar();
    
    // Click language button
    const languageButton = screen.getByText('ES');
    fireEvent.click(languageButton);
    
    // Click English option
    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);
    
    // Language should be changed to EN
    expect(screen.getByText('EN')).toBeInTheDocument();
    
    // Should store preference in localStorage
    expect(localStorageMock.getItem('preferredLanguage')).toBe('en');
  });
});
