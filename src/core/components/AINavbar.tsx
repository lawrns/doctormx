import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Image, Stethoscope, Calendar, Menu, X } from 'lucide-react';
import Button from '../../components/ui/Button';

function AINavbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/doctor', label: 'Consulta Virtual', icon: Stethoscope },
    { path: '/analisis-imagenes', label: 'Análisis de Imágenes', icon: Image },
    { path: '/lab-testing', label: 'Exámenes a Domicilio', icon: Calendar },
  ];
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="bg-brand-jade-500 text-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <img src="/Doctorlogo.png" alt="DoctorMX" className="h-9 w-auto" />
              <Link to="/" className="text-xl font-bold text-white">
                Doctor<span className="text-brand-jade-200">MX</span>
              </Link>
            </div>
            <nav className="ml-8 hidden md:flex gap-8 text-base font-medium">
              {navItems.map((item) => {
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
          
          <div className="flex items-center">
            <div className="hidden md:block">
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
              {navItems.map((item) => {
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
              
              <div className="pt-2 mt-2 border-t border-brand-jade-400">
                <Link
                  to="/doctor"
                  className="flex items-center justify-center px-3 py-2 mt-1 rounded-md text-base font-bold bg-white text-brand-jade-600 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  <Stethoscope size={20} className="mr-2" />
                  Comenzar consulta
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default AINavbar;
