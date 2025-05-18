import { Link, useLocation } from 'react-router-dom';
import { Brain, Image, Stethoscope, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';

function AINavbar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/doctor', label: 'Consulta Virtual', icon: Stethoscope },
    { path: '/analisis-imagenes', label: 'Análisis de Imágenes', icon: Image },
    { path: '/lab-testing', label: 'Exámenes a Domicilio', icon: Calendar },
  ];
  
  return (
    <header className="bg-brand-jade-500 text-white shadow-sm sticky top-0 z-10">
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
          
          <div>
            <Link to="/doctor">
              <Button 
                size="sm"
                variant="outline"
                className="font-semibold text-white border-white hover:bg-brand-jade-600"
              >
                Comenzar consulta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AINavbar;
