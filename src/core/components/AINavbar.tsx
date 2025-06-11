import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Image, Stethoscope, Calendar, Menu, X, User, LogOut, Globe, Bell, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import LanguageSelector from '../../components/LanguageSelector';
import { useAuth } from '../../contexts/AuthContext';
import ServicesNav from '../../components/ServicesNav';

function AINavbar() {
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  
  const quickAccessItems = [
    { path: '/doctor', label: t('nav.aiDoctor'), icon: Stethoscope },
    { path: '/image-analysis', label: t('nav.imageAnalysis'), icon: Image },
    { path: '/lab-testing', label: t('nav.labTests'), icon: Calendar },
  ];

  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <header className="bg-[#006D77] shadow-sm sticky top-0 z-40 h-14 sm:h-16">
      <div className="flex items-center justify-between h-full px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left section: Logo and brand name */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            aria-label={isMobileMenuOpen ? t('accessibility.closeMenu') : t('accessibility.openMenu')}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {/* Logo and brand name in top-left */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src="/Doctorlogo.png" alt="DoctorMX" className="h-7 sm:h-8 w-auto" />
            <span className="text-base sm:text-lg font-bold text-white tracking-tight hidden xs:block">DoctorMX</span>
          </Link>
        </div>
        
        {/* Center section: Services Nav and Quick access navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <ServicesNav />
          
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
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {/* Auth section */}
          {isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <User size={16} />
                <span className="text-sm font-medium hidden sm:block">{t('nav.profile')}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-200">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {t('nav.profile')}
                </Link>
                <Link to="/medical-history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {t('nav.medicalHistory')}
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="hidden sm:block">
                <button className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                  {t('nav.login')}
                </button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="register-button-fix transition-transform duration-200 hover:scale-[1.02] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                  <span className="hidden sm:inline">{t('nav.register')}</span>
                  <span className="sm:hidden">{t('nav.login')}</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#006D77] shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {/* Services Dropdown Mobile */}
            <div className="border-t border-white/20 pt-2">
              <button
                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                className="w-full flex items-center justify-between text-white/90 hover:text-white py-2 text-sm font-medium"
              >
                <span>Servicios</span>
                <ChevronDown 
                  size={16} 
                  className={`transform transition-transform ${isServicesDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isServicesDropdownOpen && (
                <div className="mt-2 space-y-1 pl-4">
                  <Link to="/connect" className="block py-2 text-white/80 hover:text-white text-sm">
                    Conectar con Doctores
                  </Link>
                  <Link to="/lab-testing" className="block py-2 text-white/80 hover:text-white text-sm">
                    Análisis de Laboratorio
                  </Link>
                  <Link to="/constitutional-analysis" className="block py-2 text-white/80 hover:text-white text-sm">
                    Análisis Constitucional
                  </Link>
                  <Link to="/community" className="block py-2 text-white/80 hover:text-white text-sm">
                    Comunidad
                  </Link>
                  <Link to="/community/education" className="block py-2 text-white/80 hover:text-white text-sm">
                    Educación en Salud
                  </Link>
                </div>
              )}
            </div>
            
            {/* Quick Access Items Mobile */}
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-white/90 hover:text-white py-2 text-sm"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Auth Mobile */}
            {!isAuthenticated && (
              <div className="border-t border-white/20 pt-2 space-y-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/90 hover:text-white py-2 text-sm"
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/90 hover:text-white py-2 text-sm font-medium"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default AINavbar; 