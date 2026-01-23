import React from 'react';
import { Award, GraduationCap, Shield, Calendar } from 'lucide-react';

const DoctorCredentials: React.FC = () => {
  const credentials = [
    {
      icon: GraduationCap,
      title: "Doctor en Medicina",
      institution: "Universidad Nacional Autónoma de México (UNAM)",
      year: "2015"
    },
    {
      icon: Award,
      title: "Especialidad en Medicina Familiar",
      institution: "Instituto Mexicano del Seguro Social (IMSS)",
      year: "2018"
    },
    {
      icon: Shield,
      title: "Cédula Profesional",
      institution: "Secretaría de Educación Pública",
      year: "12345678"
    },
    {
      icon: Calendar,
      title: "Certificación COFEPRIS",
      institution: "Comisión Federal para la Protección contra Riesgos Sanitarios",
      year: "Vigente 2024"
    }
  ];

  const memberships = [
    "Colegio Médico de México",
    "Asociación Mexicana de Medicina Familiar",
    "Sociedad Mexicana de Telemedicina",
    "Academia Nacional de Medicina de México"
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-emerald-200">
          <img
            src="/images/simeon.png"
            alt="Dr. Simeon Rodríguez"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Dr. Simeon Rodríguez
        </h3>
        <p className="text-emerald-600 font-medium">
          Medicina Familiar • 9 años de experiencia
        </p>
        <div className="flex justify-center items-center mt-2 space-x-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-yellow-400 text-lg">★</span>
          ))}
          <span className="ml-2 text-gray-600 text-sm">(4.9/5 • 2,847 reseñas)</span>
        </div>
      </div>

      {/* Credentials */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-900 text-lg border-b border-emerald-100 pb-2">
          Credenciales y Certificaciones
        </h4>
        {credentials.map((credential, index) => {
          const IconComponent = credential.icon;
          return (
            <div key={index} className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg">
              <IconComponent className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{credential.title}</h5>
                <p className="text-sm text-gray-600">{credential.institution}</p>
                <p className="text-xs text-emerald-600 font-medium">{credential.year}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Memberships */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-lg border-b border-emerald-100 pb-2">
          Membresías Profesionales
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {memberships.map((membership, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-gray-700">{membership}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Badge */}
      <div className="mt-6 pt-4 border-t border-emerald-100">
        <div className="flex items-center justify-center space-x-2 bg-emerald-100 rounded-lg py-3 px-4">
          <Shield className="w-5 h-5 text-emerald-700" />
          <span className="text-emerald-700 font-medium text-sm">
            ✓ Doctor verificado por COFEPRIS
          </span>
        </div>
      </div>
    </div>
  );
};

export default DoctorCredentials;