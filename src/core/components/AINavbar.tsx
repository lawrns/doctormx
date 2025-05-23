import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Image, Stethoscope, Calendar, Menu, X, User, LogOut, Globe, ChevronDown } from 'lucide-react';
import Button from '../../components/ui/Button';

function AINavbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [language, setLanguage] = useState('es');
  
  // Mock auth state - replace with actual auth context
  const isAuthenticated = false;
  
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    setShowLangMenu(false);
  };
  
  const primaryNavItems = [
    { path: '/doctor', label: 'Consulta Virtual', icon: Stethoscope },
    { path: '/image-analysis', label: 'Análisis de Imágenes', icon: Image },
    { path: '/lab-testing', label: 'Exámenes a Domicilio', icon: Calendar },
  ];
  
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
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    // Handle sign out - replace with actual auth logic
    console.log('Sign out');
  };
  
  return (
    <header className="bg-brand-jade-500 text-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <img src="/Doctorlogo.png" alt="DoctorMX" className="h-9 w-auto" />
              <Link to="/" className="text-xl font-bold text-white">
                Doctor<span className="text-brand-jade-200">MX</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="ml-8 hidden md:flex gap-8 text-base font-medium">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-white/90 hover:text-brand-jade-200'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Desktop dropdown menus */}
              <div className="relative group">
                <button
                  className="flex items-center px-3 py-2 text-sm font-medium text-white/90 hover:text-brand-jade-200 transition-colors"
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
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-jade-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  className="flex items-center px-3 py-2 text-sm font-medium text-white/90 hover:text-brand-jade-200 transition-colors"
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
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-jade-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  className="flex items-center px-3 py-2 text-sm font-medium text-white/90 hover:text-brand-jade-200 transition-colors"
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
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-jade-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>
          
          {/* Right section: Language, Auth, CTA */}
          <div className="flex items-center">
            {/* Desktop language selector */}
            <div className="hidden md:block relative mr-4">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center px-3 py-2 text-sm font-medium text-white/90 hover:text-brand-jade-200 transition-colors"
              >
                <Globe size={16} className="mr-2" />
                {language === 'es' ? 'ES' : 'EN'}
                <ChevronDown size={16} className="ml-1" />
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10">
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'es' ? 'text-brand-jade-600 bg-brand-jade-50' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => changeLanguage('es')}
                  >
                    Español (México)
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'text-brand-jade-600 bg-brand-jade-50' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => changeLanguage('en')}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Desktop auth buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center px-3 py-2 text-sm font-medium text-white/90 hover:text-brand-jade-200 transition-colors"
                >
                  <User size={18} className="mr-2" />
                  Mi cuenta
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white/90 hover:text-brand-jade-200 transition-colors"
                >
                  <LogOut size={18} className="mr-2" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-white/90 hover:text-brand-jade-200 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link 
                  to="/registro"
                  className="px-4 py-2 text-sm font-medium text-brand-jade-600 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}

            <div className="hidden md:block ml-4">
              <Link to="/doctor">
                <Button
                  size="sm"
                  variant="outline"
                  className="font-semibold text-white border-white bg-transparent hover:bg-white/20"
                >
                  Comenzar consulta
                </Button>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-brand-jade-600 focus:outline-none"
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
          <div className="md:hidden pb-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile CTA first */}
              <div className="flex flex-col space-y-2 mb-4">
                <Link
                  to="/doctor"
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-white text-brand-jade-600 font-medium hover:bg-gray-100 transition-colors"
                  onClick={toggleMenu}
                >
                  <Brain size={18} className="mr-2" />
                  Doctor IA
                  <span className="ml-2 text-xs bg-brand-jade-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                    ¡NUEVO!
                  </span>
                </Link>
              </div>

              {/* Quick Access Section */}
              <div className="py-2">
                <div className="px-3 text-xs font-semibold text-brand-jade-200 uppercase tracking-wider">
                  Acceso Rápido
                </div>
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-jade-600 text-white'
                          : 'text-white/90 hover:bg-brand-jade-600 hover:text-white'
                      }`}
                      onClick={toggleMenu}
                    >
                      <Icon size={20} className="mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              
              {/* Services Section */}
              <div className="py-2">
                <div className="px-3 text-xs font-semibold text-brand-jade-200 uppercase tracking-wider">
                  Servicios
                </div>
                {dropdownMenus.services.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/90 hover:bg-brand-jade-600 hover:text-white"
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Community Section */}
              <div className="py-2">
                <div className="px-3 text-xs font-semibold text-brand-jade-200 uppercase tracking-wider">
                  Comunidad
                </div>
                {dropdownMenus.community.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/90 hover:bg-brand-jade-600 hover:text-white"
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* About Section */}
              <div className="py-2">
                <div className="px-3 text-xs font-semibold text-brand-jade-200 uppercase tracking-wider">
                  Acerca
                </div>
                {dropdownMenus.about.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/90 hover:bg-brand-jade-600 hover:text-white"
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Language selector */}
              <div className="py-2">
                <div className="px-3 text-xs font-semibold text-brand-jade-200 uppercase tracking-wider">
                  Idioma
                </div>
                <button 
                  className={`w-full text-left px-3 py-2 text-base font-medium transition-colors ${language === 'es' ? 'text-white bg-brand-jade-600' : 'text-white/90 hover:bg-brand-jade-600'}`}
                  onClick={() => changeLanguage('es')}
                >
                  Español (México)
                </button>
                <button 
                  className={`w-full text-left px-3 py-2 text-base font-medium transition-colors ${language === 'en' ? 'text-white bg-brand-jade-600' : 'text-white/90 hover:bg-brand-jade-600'}`}
                  onClick={() => changeLanguage('en')}
                >
                  English
                </button>
              </div>

              {/* Mobile auth section */}
              <div className="pt-4 pb-3 border-t border-brand-jade-400">
                {isAuthenticated ? (
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white/90 hover:bg-brand-jade-600 hover:text-white"
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
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white/90 hover:bg-brand-jade-600 hover:text-white"
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
                      className="block w-full px-4 py-2 text-center text-white/90 hover:text-white font-medium border border-white/30 rounded-lg hover:border-white hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/registro"
                      className="block w-full px-4 py-2 text-center text-brand-jade-600 bg-white font-medium rounded-lg hover:bg-gray-100 transition-colors"
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
      </div>
    </header>
  );
}

export default AINavbar;
