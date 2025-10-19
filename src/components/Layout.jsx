import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GamificationHeader from './GamificationHeader';
import Icon from './ui/Icon';
import SkipLink from './ui/SkipLink';
import Announcer from './ui/Announcer';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-lg group-hover:bg-primary-600 transition-colors">
        <Icon name="heart" size="lg" color="white" />
      </div>
      <span className="text-xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">Doctor.mx</span>
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
    <div 
      className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación móvil"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <Logo />
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors" aria-label="Cerrar menú">
            <Icon name="x-mark" size="lg" color="gray" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {user ? (
            <div className="space-y-4">
              <div className="text-center py-4 border-b border-neutral-200 mb-4">
                <span className="text-sm text-secondary-600">
                  Hola, {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="block w-full text-center text-secondary-600 hover:text-primary-600 transition-colors py-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                {isLoggingOut ? (
                  <div className="flex items-center justify-center">
                    <Icon name="clock" size="sm" className="animate-spin -ml-1 mr-3" />
                    Cerrando sesión...
                  </div>
                ) : (
                  'Cerrar Sesión'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link to="/login" className="block text-center text-secondary-600 hover:text-primary-600 transition-colors py-2.5 font-medium text-sm">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="block text-center text-white bg-primary-500 hover:bg-primary-600 transition-colors py-2.5 rounded-lg font-medium text-sm">
                Registrarse
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-neutral-200 space-y-3">
            <Link
              to="/doctor"
              className="block w-full text-center rounded-lg bg-primary-500 hover:bg-primary-600 px-6 py-3 text-base font-semibold text-white transition-colors"
            >
              Consultar ahora
            </Link>
            {user && (
              <>
                <Link
                  to="/vision"
                  className="block w-full text-center rounded-lg bg-accent-500 hover:bg-accent-600 px-6 py-3 text-base font-semibold text-white transition-colors"
                >
                  Análisis de Imágenes
                </Link>
                <Link
                  to="/ai-referrals"
                  className="block w-full text-center rounded-lg bg-secondary-600 hover:bg-secondary-700 px-6 py-3 text-base font-semibold text-white transition-colors"
                >
                  Referencias IA
                </Link>
                {user.role === 'doctor' && (
                  <Link
                    to="/doctor-panel"
                    className="block w-full text-center rounded-lg bg-primary-600 hover:bg-primary-700 px-6 py-3 text-base font-semibold text-white transition-colors"
                  >
                    Panel Doctor
                  </Link>
                )}
              </>
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
    <div className="fixed top-0 left-0 w-full h-0.5 bg-neutral-200 z-50">
      <div
        className="h-full bg-primary-500 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}

export default function Layout({ children, variant = 'app' }) {
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
    <div className="min-h-screen bg-neutral-50 overflow-x-hidden">
      <SkipLink />
      <ScrollIndicator />

      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm" role="banner">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8" role="navigation" aria-label="Navegación principal">
              {variant === 'marketing' ? (
                <>
                  <Link to="/doctors" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                    Doctores
                  </Link>
                  <Link to="/doctor" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                    Consultar IA
                  </Link>
                  <Link to="/connect" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                    Para Doctores
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/doctors" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                    Doctores
                  </Link>
                  {user && (
                    <>
                      <Link to="/vision" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                        Análisis de Imágenes
                      </Link>
                      <Link to="/ai-referrals" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                        Referencias IA
                      </Link>
                      <Link to="/community" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                        Comunidad
                      </Link>
                      <Link to="/marketplace" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                        Marketplace
                      </Link>
                      <Link to="/gamification" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                        Gamificación
                      </Link>
                      {user.role === 'doctor' && (
                        <Link to="/doctor-panel" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                          Panel Doctor
                        </Link>
                      )}
                    </>
                  )}
                </>
              )}
            </nav>

            {/* Right side - Auth */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <>
                  <GamificationHeader />
                  <Link to="/dashboard" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                    Mi Dashboard
                  </Link>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-neutral-900">
                        {user.user_metadata?.full_name || user.email}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="inline-flex items-center px-3 py-2 border border-neutral-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Cerrando...
                        </div>
                      ) : (
                        'Cerrar Sesión'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-label="Abrir menú de navegación"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Icon name="bars-3" size="lg" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main content */}
      <main id="main-content" className="flex-1" role="main">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200" role="contentinfo">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-secondary-500 text-center md:text-left">
              © 2025 Doctor.mx. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-sm text-secondary-500">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span>Sistema operativo</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
