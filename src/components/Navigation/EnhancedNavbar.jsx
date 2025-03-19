import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const EnhancedNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    // Optionally redirect after logout
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-30 bg-white transition-all duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center" aria-label="Doctor.mx Home">
          <img src="/logo.svg" alt="Doctor.mx" className="h-10 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          <NavLink 
            to="/" 
            className={({ isActive }) => `text-gray-700 hover:text-blue-600 transition-colors ${
              isActive ? 'font-semibold text-blue-600' : ''
            }`}
            end
          >
            Inicio
          </NavLink>
          <NavLink 
            to="/search" 
            className={({ isActive }) => `text-gray-700 hover:text-blue-600 transition-colors ${
              isActive ? 'font-semibold text-blue-600' : ''
            }`}
          >
            Buscar Médicos
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => `text-gray-700 hover:text-blue-600 transition-colors ${
              isActive ? 'font-semibold text-blue-600' : ''
            }`}
          >
            Acerca de
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => `text-gray-700 hover:text-blue-600 transition-colors ${
              isActive ? 'font-semibold text-blue-600' : ''
            }`}
          >
            Contacto
          </NavLink>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative group">
              <button 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <img 
                  src={currentUser?.profileImage || '/default-avatar.png'} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <span>{currentUser?.name || 'Usuario'}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mi Perfil
                </Link>
                <Link 
                  to="/appointments" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mis Citas
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMenuOpen ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-white overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-screen shadow-lg' : 'max-h-0'
        }`}
      >
        <div className="container mx-auto px-4 py-2 space-y-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => `block py-2 text-gray-700 ${
              isActive ? 'font-semibold text-blue-600' : ''
            }`}
            end
          >
            Inicio
          </NavLink>
          <NavLink 
            to="/search" 
            className={({ isActive }) => `block py-2 text-gray-700 ${
              isActive ? 'font-semibold text-blue-600' : ''
            }`}
          >
            Buscar Médicos
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => `block py-2 text-gray-700 ${
              isActive ? 'font-semibold text-blue-600' : ''
            }`}
          >
            Acerca de
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => `block py-2 text-gray-700 ${
              isActive ? 'font-semibold text-blue-600' : ''
            }`}
          >
            Contacto
          </NavLink>
          
          <div className="pt-4 border-t border-gray-200">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={currentUser?.profileImage || '/default-avatar.png'} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                  <span className="font-medium">{currentUser?.name || 'Usuario'}</span>
                </div>
                <Link 
                  to="/profile" 
                  className="block py-2 text-gray-700"
                >
                  Mi Perfil
                </Link>
                <Link 
                  to="/appointments" 
                  className="block py-2 text-gray-700"
                >
                  Mis Citas
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/login" 
                  className="text-blue-600 font-medium py-2"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-center"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default EnhancedNavbar;