import React from 'react';

const TrustIndicators = ({ className = "" }) => {
  const trustMetrics = [
    {
      id: 'doctors',
      value: '500+',
      label: 'Doctores Verificados',
      icon: '👨‍⚕️',
      color: 'text-blue-600'
    },
    {
      id: 'patients',
      value: '10,000+',
      label: 'Pacientes Atendidos',
      icon: '👥',
      color: 'text-green-600'
    },
    {
      id: 'consultations',
      value: '50,000+',
      label: 'Consultas Realizadas',
      icon: '💬',
      color: 'text-purple-600'
    },
    {
      id: 'satisfaction',
      value: '4.8/5',
      label: 'Satisfacción del Paciente',
      icon: '⭐',
      color: 'text-yellow-600'
    },
    {
      id: 'response-time',
      value: '< 2 min',
      label: 'Tiempo de Respuesta',
      icon: '⚡',
      color: 'text-red-600'
    },
    {
      id: 'availability',
      value: '24/7',
      label: 'Disponibilidad',
      icon: '🕐',
      color: 'text-indigo-600'
    }
  ];

  const certifications = [
    {
      name: 'SEP',
      description: 'Secretaría de Educación Pública',
      verified: true
    },
    {
      name: 'COFEPRIS',
      description: 'Comisión Federal para la Protección contra Riesgos Sanitarios',
      verified: true
    },
    {
      name: 'ISO 27001',
      description: 'Gestión de Seguridad de la Información',
      verified: true
    }
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Confianza y Transparencia
        </h3>
        <p className="text-gray-600">
          Números que respaldan nuestra calidad y compromiso con la salud
        </p>
      </div>

      {/* Trust Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {trustMetrics.map((metric) => (
          <div key={metric.id} className="text-center">
            <div className={`text-2xl mb-1 ${metric.color}`}>
              {metric.icon}
            </div>
            <div className={`text-lg font-bold ${metric.color}`}>
              {metric.value}
            </div>
            <div className="text-xs text-gray-600">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Certificaciones y Aprobaciones
        </h4>
        <div className="flex flex-wrap justify-center gap-4">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-center bg-gray-50 rounded-lg px-4 py-2">
              <div className="flex-shrink-0 mr-2">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {cert.name}
                </div>
                <div className="text-xs text-gray-600">
                  {cert.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Statement */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <span className="text-blue-600 text-lg">🛡️</span>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-blue-900 mb-1">
              Compromiso con la Privacidad
            </h5>
            <p className="text-xs text-blue-800">
              Todos los datos médicos están protegidos bajo estrictos protocolos de seguridad 
              y cumplimiento con la normativa mexicana e internacional de protección de datos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustIndicators;

