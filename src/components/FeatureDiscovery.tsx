import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Brain, 
  Camera, 
  Beaker, 
  Heart, 
  TrendingUp, 
  Calendar,
  Stethoscope,
  FileText,
  Users,
  Shield
} from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  badge?: string;
}

const FeatureDiscovery: React.FC = () => {
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      title: t('home.discover.features.aiDoctor.title'),
      description: t('home.discover.features.aiDoctor.description'),
      icon: <Stethoscope className="w-6 h-6" />,
      path: '/doctor',
      color: 'bg-blue-500',
      badge: '24/7'
    },
    {
      title: t('home.discover.features.imageAnalysis.title'),
      description: t('home.discover.features.imageAnalysis.description'),
      icon: <Camera className="w-6 h-6" />,
      path: '/image-analysis',
      color: 'bg-purple-500',
      badge: 'AI'
    },
    {
      title: t('home.discover.features.labTests.title'),
      description: t('home.discover.features.labTests.description'),
      icon: <Beaker className="w-6 h-6" />,
      path: '/lab-testing',
      color: 'bg-green-500'
    },
    {
      title: t('home.discover.features.constitutional.title'),
      description: t('home.discover.features.constitutional.description'),
      icon: <Heart className="w-6 h-6" />,
      path: '/constitutional-analysis',
      color: 'bg-red-500'
    },
    {
      title: t('home.discover.features.progress.title'),
      description: t('home.discover.features.progress.description'),
      icon: <TrendingUp className="w-6 h-6" />,
      path: '/profile/progress',
      color: 'bg-yellow-500'
    },
    {
      title: t('home.discover.features.appointments.title'),
      description: t('home.discover.features.appointments.description'),
      icon: <Calendar className="w-6 h-6" />,
      path: '/appointments',
      color: 'bg-indigo-500'
    }
  ];

  const additionalFeatures = [
    {
      title: 'Protocolos de Tratamiento',
      icon: <FileText className="w-5 h-5" />,
      path: '/profile/protocols'
    },
    {
      title: 'Comunidad',
      icon: <Users className="w-5 h-5" />,
      path: '/community'
    },
    {
      title: 'Emergencias',
      icon: <Shield className="w-5 h-5" />,
      path: '/emergency'
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('home.discover.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('home.discover.subtitle')}
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.path}
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${feature.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  {feature.badge && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </Link>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Más Funciones
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {additionalFeatures.map((feature, index) => (
              <Link
                key={index}
                to={feature.path}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-gray-500">
                  {feature.icon}
                </div>
                <span className="text-gray-700 hover:text-blue-600 transition-colors">
                  {feature.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ¿No sabes por dónde empezar?
          </h3>
          <p className="text-blue-700 mb-4">
            Comienza con una consulta gratuita con nuestro Doctor IA
          </p>
          <Link to="/doctor">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Comenzar Consulta Gratuita
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeatureDiscovery;