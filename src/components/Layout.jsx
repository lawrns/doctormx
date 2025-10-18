import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-medical-500 text-white shadow-sm transition-all duration-200 group-hover:shadow-brand group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M10 4h4a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2z"/>
        </svg>
      </span>
      <span className="text-xl font-semibold tracking-tight text-ink-primary transition-colors duration-200 group-hover:text-brand-600">doctor.mx</span>
    </Link>
  );
}

function MobileMenu({ isOpen, onClose }) {
  const { user, logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="fixed inset-0 bg-ink-primary/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-ink-border">
          <Logo />
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-ink-bg transition-colors" aria-label="Cerrar menú">
            <svg className="h-6 w-6 text-ink-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          {user ? (
            <div className="space-y-4">
              <div className="text-center py-4 border-b border-ink-border mb-4">
                <span className="text-sm text-ink-secondary">
                  Hola, {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="block w-full text-center text-ink-secondary hover:text-brand-600 transition-colors py-2.5 border border-ink-border rounded-xl hover:bg-ink-bg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                {isLoggingOut ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cerrando sesión...
                  </div>
                ) : (
                  'Cerrar Sesión'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link to="/login" className="block text-center text-ink-secondary hover:text-brand-600 transition-colors py-2.5 font-medium text-sm">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="block text-center text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transition-colors py-2.5 rounded-xl font-medium text-sm shadow-sm">
                Registrarse
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-ink-border space-y-3">
            <Link
              to="/doctor"
              className="block w-full text-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-semibold text-white shadow-brand transition-all duration-200 hover:shadow-lg"
            >
              Consultar ahora
            </Link>
            {user && (
              <Link
                to="/vision"
                className="block w-full text-center rounded-xl bg-gradient-to-r from-medical-500 to-medical-600 px-6 py-3.5 text-base font-semibold text-white shadow-brand transition-all duration-200 hover:shadow-lg"
              >
                Análisis de Imágenes
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-0.5 bg-ink-border z-50">
      <div
        className="h-full bg-gradient-to-r from-brand-500 to-medical-500 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <ScrollIndicator />

      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-sm border-b border-ink-border">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4 md:px-8">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/doctors" className="text-sm font-medium text-ink-secondary hover:text-brand-600 transition-colors">
              Doctores
            </Link>
            {user && (
              <>
                <Link to="/vision" className="text-sm font-medium text-ink-secondary hover:text-brand-600 transition-colors">
                  Análisis de Imágenes
                </Link>
                <Link to="/community" className="text-sm font-medium text-ink-secondary hover:text-brand-600 transition-colors">
                  Comunidad
                </Link>
                <Link to="/marketplace" className="text-sm font-medium text-ink-secondary hover:text-brand-600 transition-colors">
                  Marketplace
                </Link>
                <Link to="/gamification" className="text-sm font-medium text-ink-secondary hover:text-brand-600 transition-colors">
                  Gamificación
                </Link>
              </>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-sm font-medium text-ink-secondary hover:text-brand-600 transition-colors">
                  Mi Dashboard
                </Link>
                <span className="text-sm text-ink-secondary border-r border-ink-border pr-4">
                  Hola, {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center justify-center px-4 py-2 border border-ink-border text-sm font-medium rounded-lg text-ink-secondary hover:text-brand-600 hover:border-brand-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cerrando sesión...
                    </div>
                  ) : (
                    'Cerrar Sesión'
                  )}
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-ink-secondary hover:text-brand-600 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transition-all duration-200 shadow-sm">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-ink-bg transition-colors"
            aria-label="Abrir menú"
          >
            <svg className="h-6 w-6 text-ink-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-ink-border mt-16">
        <div className="mx-auto max-w-container px-6 py-8 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-ink-secondary text-center md:text-left">
              © 2025 Doctor.mx. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-sm text-ink-secondary">
              <div className="w-2 h-2 bg-medical-500 rounded-full animate-pulse"></div>
              <span>Sistema operativo</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
