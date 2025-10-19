import React from 'react';

const ComplianceBadges = ({ className = "" }) => {
  const complianceItems = [
    {
      id: 'nom-004',
      title: 'NOM-004-SSA3-2012',
      description: 'Recetas Electrónicas',
      icon: '📋',
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      verified: true
    },
    {
      id: 'nom-024',
      title: 'NOM-024-SSA3-2012',
      description: 'Telemedicina',
      icon: '💻',
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      verified: true
    },
    {
      id: 'lfpdppp',
      title: 'LFPDPPP',
      description: 'Protección de Datos',
      icon: '🛡️',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      verified: true
    },
    {
      id: 'cfdi',
      title: 'CFDI 4.0',
      description: 'Facturación Electrónica',
      icon: '🧾',
      color: 'bg-green-50 border-green-200 text-green-800',
      verified: true
    },
    {
      id: 'iso-27001',
      title: 'ISO 27001',
      description: 'Seguridad de la Información',
      icon: '🔒',
      color: 'bg-red-50 border-red-200 text-red-800',
      verified: true
    },
    {
      id: 'hipaa',
      title: 'HIPAA',
      description: 'Privacidad Médica',
      icon: '🏥',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      verified: true
    }
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-sm">✓</span>
          </div>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Certificaciones y Cumplimiento
          </h3>
          <p className="text-sm text-gray-600">
            Plataforma certificada y en cumplimiento con regulaciones mexicanas e internacionales
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {complianceItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center p-3 rounded-lg border ${item.color}`}
          >
            <div className="flex-shrink-0 mr-3">
              <span className="text-lg">{item.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <p className="text-sm font-medium truncate">
                  {item.title}
                </p>
                {item.verified && (
                  <span className="ml-2 text-xs text-green-600">✓</span>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">🔐</span>
          <span>
            Todos los datos médicos están encriptados y protegidos según estándares internacionales
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComplianceBadges;

