import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Image, Stethoscope, Calendar, Menu, X, User, LogOut, Globe } from 'lucide-react';
import Button from '../../components/ui/Button';

function AINavbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
            
            {/* Desktop navigation - simplified to only 3 main items */}
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
            </nav>
          </div>
          
          {/* Right section: Language and Auth */}
          <div className="flex items-center">
            {/* Desktop language selector */}
            <div className="hidden md:block relative mr-4">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center px-3 py-2 text-sm font-medium text-white/90 hover:text-brand-jade-200 transition-colors"
              >
                <Globe size={16} className="mr-2" />
                {language === 'es' ? 'ES' : 'EN'}
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
                    English (US)
                  </button>
                </div>
              )}
            </div>

            {/* Desktop auth section */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-brand-jade-200 transition-colors">
                    <User size={18} />
                    <span className="text-sm font-medium">Mi Cuenta</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mi Perfil
                    </Link>
                    <Link to="/appointments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mis Citas
                    </Link>
                    <Link to="/medical-history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Historial Médico
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-white hover:text-brand-jade-200 hover:bg-white/10">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-white text-brand-jade-600 hover:bg-brand-jade-50">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-white hover:text-brand-jade-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-brand-jade-600 border-t border-white/20">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Mobile auth section */}
            <div className="pt-4 border-t border-white/20">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-white/90 hover:bg-white/10 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={20} />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-white/90 hover:bg-white/10 hover:text-white w-full text-left"
                  >
                    <LogOut size={20} />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full text-white hover:text-brand-jade-200 hover:bg-white/10">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-white text-brand-jade-600 hover:bg-brand-jade-50">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile language selector */}
            <div className="pt-4 border-t border-white/20">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-white/70 mb-2">Idioma</p>
                <div className="space-y-1">
                  <button 
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${language === 'es' ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10'}`}
                    onClick={() => {
                      changeLanguage('es');
                      setIsMenuOpen(false);
                    }}
                  >
                    Español (México)
                  </button>
                  <button 
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${language === 'en' ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10'}`}
                    onClick={() => {
                      changeLanguage('en');
                      setIsMenuOpen(false);
                    }}
                  >
                    English (US)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default AINavbar;
