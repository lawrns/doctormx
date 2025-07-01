import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Image, Stethoscope, Calendar, Menu, X, User, LogOut, Globe, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import LanguageSelector from '../../components/LanguageSelector';
import { useAuth } from '../../contexts/AuthContext';
import MegaMenu from '../../components/MegaMenu';

interface AINavbarProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

function AINavbar({ onSidebarToggle, isSidebarOpen }: AINavbarProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
          {/* Mobile menu toggle - Enhanced touch target */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-3 hover:bg-white/10 rounded-lg transition-colors text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? t('accessibility.closeMenu') : t('accessibility.openMenu')}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo and brand name in top-left - Always visible */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src="/Doctorlogo.png" alt="DoctorMX" className="h-7 sm:h-8 w-auto" />
            <span className="text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight">DoctorMX</span>
          </Link>
        </div>
        
        {/* Center section: Mega Menu and Quick access navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <MegaMenu />
          
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
          {/* Notifications - Enhanced touch target */}
          {isAuthenticated && (
            <button
              className="relative p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
              {/* Mobile login button - User icon only */}
              <Link to="/login" className="sm:hidden">
                <button className="p-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <User size={18} />
                </button>
              </Link>
              {/* Desktop login button - Text */}
              <Link to="/login" className="hidden sm:block">
                <button className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 min-h-[44px]">
                  {t('nav.login')}
                </button>
              </Link>
              {/* Register button - Fixed text confusion */}
              <Link to="/register">
                <Button size="sm" className="register-button-fix transition-transform duration-200 hover:scale-[1.02] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                  <span className="hidden sm:inline">{t('nav.register')}</span>
                  <span className="sm:hidden text-xs">{t('nav.register')}</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu - Optimized width for small screens */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="fixed right-0 top-0 h-full w-72 sm:w-80 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t('nav.features')}</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label={t('accessibility.closeMenu')}
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="p-4 space-y-2">
              {quickAccessItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="border-t pt-4 mt-4">
                <Link
                  to="/constitutional-analysis"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                >
                  <Brain size={20} />
                  <span>{t('nav.constitutionalAnalysis')}</span>
                </Link>
                <Link
                  to="/profile/progress"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                >
                  <Calendar size={20} />
                  <span>{t('nav.progressTracking')}</span>
                </Link>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">{t('accessibility.language')}</p>
                  <LanguageSelector />
                </div>
              </div>
              
              {!isAuthenticated && (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">
                      {t('nav.register')}
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default AINavbar; 