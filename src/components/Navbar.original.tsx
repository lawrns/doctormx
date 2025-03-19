import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, User, Search, Calendar, LogOut, 
  Leaf, MessageCircle, Video, ChevronDown, Globe
} from '../components/icons/IconProvider';
import { SocialIcons } from '../components/icons/IconProvider';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState('');
  const [language, setLanguage] = useState('es');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Initialize language from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);
  
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    setShowLangMenu(false);
    // In a real implementation, this would trigger i18n library
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dropdownMenus = {
    services: [
      { name: 'Buscar Médicos', path: '/buscar' },
      { name: 'Evaluación de Síntomas', path: '/sintomas' },
      { name: 'Telemedicina', path: '/telemedicina' },
      { name: 'Medicina Alternativa', path: '/alternativa' }
    ],
    community: [
      { name: 'Preguntas y Respuestas', path: '/comunidad/preguntas' },
      { name: 'Junta Médica', path: '/doctor-board' },
      { name: 'Blog de Salud', path: '/blog' }
    ],
    about: [
      { name: 'Sobre Nosotros', path: '/acerca' },
      { name: 'Para Médicos', path: '/medicos/planes' },
      { name: 'Contacto', path: '/contacto' },
      { name: 'Ayuda', path: '/ayuda' }
    ]
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Logo and main navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src="/Doctorlogo.png" alt="Doctor.mx Logo" className="h-8 w-auto" />
              <span className="text-blue-600 font-bold text-xl ml-2">Doctor.mx</span>
            </Link>

            <div className="hidden lg:flex lg:items-center lg:space-x-6">
              {/* Main navigation items */}
              <div className="relative group">
                <button
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onMouseEnter={() => setIsDropdownOpen('services')}
                  onMouseLeave={() => setIsDropdownOpen('')}
                >
                  Servicios
                  <ChevronDown size={16} className="ml-1" />
                </button>
                {isDropdownOpen === 'services' && (
                  <div 
                    className="absolute top-full left-0 w-56 bg-white rounded-lg shadow-lg py-2 mt-1"
                    onMouseEnter={() => setIsDropdownOpen('services')}
                    onMouseLeave={() => setIsDropdownOpen('')}
                  >
                    {dropdownMenus.services.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onMouseEnter={() => setIsDropdownOpen('community')}
                  onMouseLeave={() => setIsDropdownOpen('')}
                >
                  Comunidad
                  <ChevronDown size={16} className="ml-1" />
                </button>
                {isDropdownOpen === 'community' && (
                  <div 
                    className="absolute top-full left-0 w-56 bg-white rounded-lg shadow-lg py-2 mt-1"
                    onMouseEnter={() => setIsDropdownOpen('community')}
                    onMouseLeave={() => setIsDropdownOpen('')}
                  >
                    {dropdownMenus.community.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onMouseEnter={() => setIsDropdownOpen('about')}
                  onMouseLeave={() => setIsDropdownOpen('')}
                >
                  Acerca
                  <ChevronDown size={16} className="ml-1" />
                </button>
                {isDropdownOpen === 'about' && (
                  <div 
                    className="absolute top-full left-0 w-56 bg-white rounded-lg shadow-lg py-2 mt-1"
                    onMouseEnter={() => setIsDropdownOpen('about')}
                    onMouseLeave={() => setIsDropdownOpen('')}
                  >
                    {dropdownMenus.about.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right section: Doctor IA, language selector, and auth buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Link
              to="/sintomas"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              <SocialIcons.Brain size={18} className="mr-2" />
              Doctor IA
              <span className="ml-2 text-xs bg-white text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                ¡NUEVO!
              </span>
            </Link>
            
            {/* Language selector */}
            <div className="relative ml-4">
              <button 
                className="flex items-center text-gray-700 hover:text-gray-900"
                onClick={() => setShowLangMenu(!showLangMenu)}
                aria-expanded={showLangMenu}
                aria-haspopup="true"
              >
                <Globe size={18} className="mr-1" />
                <span className="uppercase text-sm">{language}</span>
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10">
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'es' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => changeLanguage('es')}
                  >
                    Español (México)
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => changeLanguage('en')}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User size={18} className="mr-2" />
                  Mi cuenta
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <LogOut size={18} className="mr-2" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link 
                  to="/registro"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Doctor IA button for mobile */}
            <Link
              to="/sintomas"
              className="flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium"
              onClick={toggleMenu}
            >
              <SocialIcons.Brain size={18} className="mr-2" />
              Doctor IA
              <span className="ml-2 text-xs bg-white text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                ¡NUEVO!
              </span>
            </Link>

            {/* Services Section */}
            <div className="py-2">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Servicios
              </div>
              {dropdownMenus.services.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Community Section */}
            <div className="py-2">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Comunidad
              </div>
              {dropdownMenus.community.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* About Section */}
            <div className="py-2">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Acerca
              </div>
              {dropdownMenus.about.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Language selector for mobile */}
            <div className="py-2 border-t border-gray-200">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Idioma
              </div>
              <button
                onClick={() => changeLanguage('es')}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${language === 'es' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                Español (México)
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${language === 'en' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                English
              </button>
            </div>
            
            {/* Auth buttons for mobile */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={toggleMenu}
                  >
                    <div className="flex items-center">
                      <User size={18} className="mr-2" />
                      Mi cuenta
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      toggleMenu();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <LogOut size={18} className="mr-2" />
                      Salir
                    </div>
                  </button>
                </div>
              ) : (
                <div className="px-3 space-y-2">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-2 text-center text-gray-700 hover:text-blue-600 font-medium border border-gray-300 rounded-lg hover:border-blue-600 transition-colors"
                    onClick={toggleMenu}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="block w-full px-4 py-2 text-center text-white bg-blue-600 font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={toggleMenu}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;