import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { 
  Stethoscope, Camera, Beaker, Heart, TrendingUp, Calendar,
  Brain, FileText, Users, Shield, Pill, Building, Video
} from 'lucide-react';

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

const ServicesNav: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuCategories: MenuCategory[] = [
    {
      title: 'Consultas Médicas',
      items: [
        {
          label: 'Doctor IA',
          path: '/doctor',
          icon: <Stethoscope className="w-5 h-5" />,
          description: 'Consulta médica instantánea 24/7',
          badge: 'Gratis'
        },
        {
          label: 'Consulta Instantánea',
          path: '/consultation/instant',
          icon: <Video className="w-5 h-5" />,
          description: 'Doctor real en menos de 30 segundos',
          badge: '$50 MXN'
        },
        {
          label: 'Citas Médicas',
          path: '/appointments',
          icon: <Calendar className="w-5 h-5" />,
          description: 'Agenda con profesionales certificados'
        },
        {
          label: 'Emergencias',
          path: '/emergency',
          icon: <Shield className="w-5 h-5" />,
          description: 'Protocolo de emergencias y contactos',
          badge: '911'
        }
      ]
    },
    {
      title: 'Análisis y Diagnóstico',
      items: [
        {
          label: 'Análisis de Imagen',
          path: '/image-analysis',
          icon: <Camera className="w-5 h-5" />,
          description: 'Diagnóstico visual con IA'
        },
        {
          label: 'Laboratorio',
          path: '/lab-testing',
          icon: <Beaker className="w-5 h-5" />,
          description: 'Interpreta tus análisis'
        },
        {
          label: 'Análisis Constitucional',
          path: '/constitutional-analysis',
          icon: <Heart className="w-5 h-5" />,
          description: 'Descubre tu tipo constitucional'
        }
      ]
    },
    {
      title: 'Seguimiento y Progreso',
      items: [
        {
          label: 'Mi Progreso',
          path: '/profile/progress',
          icon: <TrendingUp className="w-5 h-5" />,
          description: 'Monitorea tu salud'
        },
        {
          label: 'Protocolos',
          path: '/profile/protocols',
          icon: <FileText className="w-5 h-5" />,
          description: 'Tratamientos personalizados'
        },
        {
          label: 'Historial Médico',
          path: '/medical-history',
          icon: <Brain className="w-5 h-5" />,
          description: 'Tu historia clínica digital'
        }
      ]
    },
    {
      title: 'Recursos',
      items: [
        {
          label: 'Recetas',
          path: '/prescriptions',
          icon: <Pill className="w-5 h-5" />,
          description: 'Gestiona tus medicamentos'
        },
        {
          label: 'Farmacias',
          path: '/ai/pharmacies',
          icon: <Building className="w-5 h-5" />,
          description: 'Encuentra farmacias cercanas'
        },
        {
          label: 'Comunidad',
          path: '/community',
          icon: <Users className="w-5 h-5" />,
          description: 'Conecta con otros usuarios'
        }
      ]
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <span className="font-medium">Servicios</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[280px] sm:w-[400px] lg:w-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[calc(100vh-100px)] overflow-hidden">
          <div className="p-3 sm:p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

              {menuCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wider">
                    {category.title}
                  </h3>
                  <ul className="space-y-1">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <Link
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors group"
                        >
                          <div className="text-gray-400 group-hover:text-[#006D77]">
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700 group-hover:text-[#006D77]">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded flex-shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4 col-span-1 sm:col-span-2">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link
                  to="/doctor"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-[#006D77] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#005B66] active:bg-[#004B55] transition-colors text-center text-sm font-medium"
                >
                  Consulta Gratuita con IA
                </Link>
                <div className="flex gap-2 sm:gap-3">
                  <Link
                    to="/help"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-700 text-sm text-center"
                  >
                    Ayuda
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-700 text-sm text-center"
                  >
                    Precios
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesNav;