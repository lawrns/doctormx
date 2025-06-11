import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
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

const MegaMenu: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-1 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <span className="font-medium">Servicios</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            onMouseEnter={() => setIsOpen(false)}
          />
          
          {/* Mega Menu */}
          <div 
            className="absolute left-0 top-full mt-2 w-screen max-w-6xl bg-white rounded-xl shadow-2xl z-50 p-6"
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {menuCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                    {category.title}
                  </h3>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <Link
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="text-gray-500 group-hover:text-blue-600 mt-0.5">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 group-hover:text-blue-600">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">
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
            <div className="mt-6 pt-6 border-t flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to="/help"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Centro de Ayuda
                </Link>
                <Link
                  to="/pricing"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Precios
                </Link>
              </div>
              <Link
                to="/doctor"
                onClick={() => setIsOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Consulta Gratuita
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MegaMenu;