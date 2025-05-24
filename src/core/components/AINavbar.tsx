import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Image, Stethoscope, Calendar, Menu, X, User, LogOut, Globe, Bell } from 'lucide-react';
import Button from '../../components/ui/Button';

interface AINavbarProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

function AINavbar({ onSidebarToggle, isSidebarOpen }: AINavbarProps) {
  const location = useLocation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [language, setLanguage] = useState('es');
  
  // Mock auth state - replace with actual auth context
  const isAuthenticated = false;
  
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    setShowLangMenu(false);
  };
  
  const quickAccessItems = [
    { path: '/doctor', label: 'Consulta Virtual', icon: Stethoscope },
    { path: '/image-analysis', label: 'Análisis de Imágenes', icon: Image },
    { path: '/lab-testing', label: 'Exámenes a Domicilio', icon: Calendar },
  ];

  const handleSignOut = async () => {
    // Handle sign out - replace with actual auth logic
    console.log('Sign out');
  };
  
  return (
    <header className="bg-[#006D77] shadow-sm sticky top-0 z-40 h-16">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section: Logo and brand name */}
        <div className="flex items-center gap-4">
          {/* Sidebar toggle - only show if sidebar functionality is provided */}
          {onSidebarToggle && (
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          
          {/* Logo and brand name in top-left */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/Doctorlogo.png" alt="DoctorMX" className="h-8 w-auto" />
            <span className="text-lg font-bold text-white tracking-tight">DoctorMX</span>
          </Link>
        </div>
        
        {/* Center section: Quick access navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                aria-label={item.label}
              >
                <Icon size={16} />
                <span className="hidden xl:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Right section: Notifications, Language, Auth */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          {isAuthenticated && (
            <button 
              className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Notificaciones"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}
          
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center px-2 py-1 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Cambiar idioma"
              aria-expanded={showLangMenu}
            >
              <Globe size={16} className="mr-1" />
              <span className="text-xs uppercase tracking-wider">
                {language === 'es' ? 'ES' : 'EN'}
              </span>
            </button>
            
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <button 
                  className={`w-full text-left px-4 py-2 text-sm ${language === 'es' ? 'text-[#006D77] bg-[#D0F0EF]' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => changeLanguage('es')}
                >
                  Español (México)
                </button>
                <button 
                  className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'text-[#006D77] bg-[#D0F0EF]' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => changeLanguage('en')}
                >
                  English (US)
                </button>
              </div>
            )}
          </div>

          {/* Auth section */}
          {isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <User size={16} />
                <span className="text-sm font-medium hidden sm:block">Mi Cuenta</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-200">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Mi Perfil
                </Link>
                <Link to="/medical-history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Historial Médico
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
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
            <div className="flex items-center gap-2">
              <Link to="/login">
                <button className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                  Iniciar Sesión
                </button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-white text-[#006D77] hover:bg-gray-50 transition-transform duration-200 hover:scale-[1.02]">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AINavbar; 