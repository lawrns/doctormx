import React from 'react';

const SecurityBadges = ({ className = "" }) => {
  const securityFeatures = [
    {
      id: 'encryption',
      title: 'Encriptación End-to-End',
      description: 'Todos los datos médicos están encriptados',
      icon: '🔐',
      status: 'active'
    },
    {
      id: 'ssl',
      title: 'SSL/TLS 1.3',
      description: 'Conexiones seguras certificadas',
      icon: '🔒',
      status: 'active'
    },
    {
      id: 'backup',
      title: 'Backup Automático',
      description: 'Respaldo diario de datos críticos',
      icon: '💾',
      status: 'active'
    },
    {
      id: 'monitoring',
      title: 'Monitoreo 24/7',
      description: 'Vigilancia continua de seguridad',
      icon: '👁️',
      status: 'active'
    },
    {
      id: 'compliance',
      title: 'Auditoría Regular',
      description: 'Evaluaciones de seguridad periódicas',
      icon: '📊',
      status: 'active'
    },
    {
      id: 'access-control',
      title: 'Control de Acceso',
      description: 'Autenticación de dos factores',
      icon: '🔑',
      status: 'active'
    }
  ];

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">🛡️</span>
          </div>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Seguridad y Protección de Datos
          </h3>
          <p className="text-sm text-gray-600">
            Implementamos las mejores prácticas de seguridad para proteger tu información médica
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityFeatures.map((feature) => (
          <div
            key={feature.id}
            className="flex items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex-shrink-0 mr-3">
              <span className="text-lg">{feature.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {feature.title}
                </p>
                <span className={`ml-2 w-2 h-2 rounded-full ${
                  feature.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                }`}></span>
              </div>
              <p className="text-xs text-gray-600 truncate">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">🏆</span>
            <span>Certificado por autoridades de salud mexicanas</span>
          </div>
          <div className="text-xs text-blue-600 font-medium">
            Última actualización: {new Date().toLocaleDateString('es-MX')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityBadges;

