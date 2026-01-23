import React from 'react';
import { Shield, Star, Users, Lock } from 'lucide-react';

const TrustBar: React.FC = () => {
  const trustMetrics = [
    {
      icon: Users,
      text: "10,000+ consultas realizadas",
      subtext: "Pacientes atendidos"
    },
    {
      icon: Star,
      text: "4.9/5",
      subtext: "Calificación promedio",
      showStars: true
    },
    {
      icon: Shield,
      text: "COFEPRIS",
      subtext: "Certificado oficial"
    },
    {
      icon: Lock,
      text: "SSL & HIPAA",
      subtext: "Datos protegidos"
    }
  ];

  const renderStars = () => {
    return (
      <div className="flex space-x-1 justify-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-yellow-400 text-yellow-400'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-emerald-50 border-t border-b border-emerald-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {trustMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800 text-sm lg:text-base">
                    {metric.text}
                  </span>
                </div>
                {metric.showStars && renderStars()}
                <span className="text-xs lg:text-sm text-emerald-600">
                  {metric.subtext}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Additional certification badges */}
        <div className="mt-4 pt-4 border-t border-emerald-200">
          <div className="flex justify-center items-center space-x-6 text-xs text-emerald-600">
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Colegio Médico de México</span>
            </span>
            <span className="flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Encriptación de extremo a extremo</span>
            </span>
            <span className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>Certificado ISO 27001</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustBar;