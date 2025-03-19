import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, User, Search, Calendar, LogOut, 
  Leaf, MessageCircle, Video, ChevronDown, Globe
} from './icons/IconProvider';
import { SocialIcons } from './icons/IconProvider';
import { useAuth } from '../contexts/AuthContext';

// Define the type for navigation items
interface NavItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
  badge?: string;
}

function EnhancedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState('');
  const [language, setLanguage] = useState('es');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // To track current path
  
  // Initialize language from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);
  
  // Check if a path is active (either exact match or starts with for nested routes)
  const isActivePath = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };
  
  // Check if any item in a dropdown is active
  const isActiveDropdown = (items: NavItem[]): boolean => {
    return items.some(item => isActivePath(item.path));
  };
  
  const changeLanguage = (lang: string) => {
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

  // Navigation structure with icons
  const dropdownMenus: Record<string, NavItem[]> = {
    services: [
      { name: 'Buscar Médicos', path: '/buscar', icon: <Search size={16} className="mr-2" /> },
      { name: 'Evaluación de Síntomas', path: '/sintomas', icon: <SocialIcons.Medical size={16} className="mr-2" /> },
      { name: 'Telemedicina', path: '/telemedicina', icon: <Video size={16} className="mr-2" /> },
      { name: 'Medicina Alternativa', path: '/alternativa', icon: <Leaf size={16} className="mr-2" /> }
    ],
    community: [
      { name: 'Preguntas y Respuestas', path: '/comunidad/preguntas', icon: <MessageCircle size={16} className="mr-2" /> },
      { name: 'Junta Médica', path: '/doctor-board', icon: <SocialIcons.Users size={16} className="mr-2" /> },
      { name: 'Blog de Salud', path: '/blog', icon: <SocialIcons.Document size={16} className="mr-2" /> }
    ],
    about: [
      { name: 'Sobre Nosotros', path: '/acerca', icon: <SocialIcons.Info size={16} className="mr-2" /> },
      { name: 'Para Médicos', path: '/medicos/planes', icon: <SocialIcons.Doctor size={16} className="mr-2" /> },
      { name: 'Contacto', path: '/contacto', icon: <SocialIcons.Mail size={16} className="mr-2" /> },
      { name: 'Ayuda', path: '/ayuda', icon: <SocialIcons.Help size={16} className="mr-2" /> }
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
              {/* Main navigation items with active indicators */}
              <div className="relative group">
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors 
                    ${isActiveDropdown(dropdownMenus.services) 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'}`}
                  onMouseEnter={() => setIsDropdownOpen('services')}
                  onMouseLeave={() => setIsDropdownOpen('')}
                  aria-expanded={isDropdownOpen === 'services'}
                >
                  Servicios
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {/* Active indicator line */}
                {isActiveDropdown(dropdownMenus.services) && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
                )}
                
                {isDropdownOpen === 'services' && (
                  <div 
                    className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg py-2 mt-1 border border-gray-100"
                    onMouseEnter={() => setIsDropdownOpen('services')}
                    onMouseLeave={() => setIsDropdownOpen('')}
                  >
                    {dropdownMenus.services.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-2 text-sm 
                          ${isActivePath(item.path) 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'} transition-colors`}
                      >
                        {item.icon}
                        {item.name}
                        {item.badge && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors 
                    ${isActiveDropdown(dropdownMenus.community) 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'}`}
                  onMouseEnter={() => setIsDropdownOpen('community')}
                  onMouseLeave={() => setIsDropdownOpen('')}
                  aria-expanded={isDropdownOpen === 'community'}
                >
                  Comunidad
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {/* Active indicator line */}
                {isActiveDropdown(dropdownMenus.community) && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
                )}
                
                {isDropdownOpen === 'community' && (
                  <div 
                    className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg py-2 mt-1 border border-gray-100"
                    onMouseEnter={() => setIsDropdownOpen('community')}
                    onMouseLeave={() => setIsDropdownOpen('')}
                  >
                    {dropdownMenus.community.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-2 text-sm 
                          ${isActivePath(item.path) 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'} transition-colors`}
                      >
                        {item.icon}
                        {item.name}
                        {item.badge && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors 
                    ${isActiveDropdown(dropdownMenus.about) 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'}`}
                  onMouseEnter={() => setIsDropdownOpen('about')}
                  onMouseLeave={() => setIsDropdownOpen('')}
                  aria-expanded={isDropdownOpen === 'about'}
                >
                  Acerca
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {/* Active indicator line */}
                {isActiveDropdown(dropdownMenus.about) && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
                )}
                
                {isDropdownOpen === 'about' && (
                  <div 
                    className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg py-2 mt-1 border border-gray-100"
                    onMouseEnter={() => setIsDropdownOpen('about')}
                    onMouseLeave={() => setIsDropdownOpen('')}
                  >
                    {dropdownMenus.about.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-2 text-sm 
                          ${isActivePath(item.path) 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'} transition-colors`}
                      >
                        {item.icon}
                        {item.name}
                        {item.badge && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
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
              className={`inline-flex items-center px-4 py-2 rounded-lg ${
                isActivePath('/sintomas') 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } font-medium transition-colors`}
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
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
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
                  className={`flex items-center px-3 py-2 text-sm font-medium ${
                    isActivePath('/dashboard') 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  } transition-colors relative group`}
                >
                  <User size={18} className="mr-2" />
                  Mi cuenta
                  {isActivePath('/dashboard') && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
                  )}
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
                  className={`px-4 py-2 text-sm font-medium ${
                    isActivePath('/login') 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  } transition-colors`}
                >
                  Iniciar sesión
                </Link>
                <Link 
                  to="/registro"
                  className={`px-4 py-2 text-sm font-medium ${
                    isActivePath('/registro') 
                      ? 'text-white bg-blue-700' 
                      : 'text-white bg-blue-600 hover:bg-blue-700'
                  } rounded-lg transition-colors`}
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

      {/* Mobile menu with improved styling and active indicators */}
      {isMenuOpen && (
        <div className="lg:hidden overflow-y-auto max-h-[calc(100vh-4rem)] border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Doctor IA button for mobile */}
            <Link
              to="/sintomas"
              className={`flex items-center justify-center px-4 py-2 rounded-lg 
                ${isActivePath('/sintomas') 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                } font-medium transition-colors`}
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
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                    ${isActivePath(item.path) 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    } transition-colors`}
                  onClick={toggleMenu}
                >
                  {item.icon}
                  {item.name}
                  {item.badge && (
                    <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
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
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                    ${isActivePath(item.path) 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    } transition-colors`}
                  onClick={toggleMenu}
                >
                  {item.icon}
                  {item.name}
                  {item.badge && (
                    <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
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
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                    ${isActivePath(item.path) 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    } transition-colors`}
                  onClick={toggleMenu}
                >
                  {item.icon}
                  {item.name}
                  {item.badge && (
                    <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
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
                className={`flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium 
                  ${language === 'es' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  } transition-colors`}
              >
                <Globe size={16} className="mr-2" />
                Español (México)
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium 
                  ${language === 'en' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  } transition-colors`}
              >
                <Globe size={16} className="mr-2" />
                English
              </button>
            </div>
            
            {/* Auth buttons for mobile */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                      ${isActivePath('/dashboard') 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      } transition-colors`}
                    onClick={toggleMenu}
                  >
                    <User size={18} className="mr-2" />
                    Mi cuenta
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      toggleMenu();
                    }}
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut size={18} className="mr-2" />
                    Salir
                  </button>
                </div>
              ) : (
                <div className="px-3 space-y-2">
                  <Link
                    to="/login"
                    className={`block w-full px-4 py-2 text-center font-medium rounded-lg border transition-colors
                      ${isActivePath('/login')
                        ? 'text-blue-600 border-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 border-gray-300 hover:border-blue-600'
                      }`}
                    onClick={toggleMenu}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/registro"
                    className={`block w-full px-4 py-2 text-center text-white font-medium rounded-lg transition-colors
                      ${isActivePath('/registro')
                        ? 'bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                      }`}
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

export default EnhancedNavbar;