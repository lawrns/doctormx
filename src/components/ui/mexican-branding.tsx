/**
 * Mexican Healthcare Branding Components for DoctorMX
 * Cultural elements, trust signals, and Mexican healthcare context
 */

import React from 'react';
import { Shield, Heart, Users, Award, Star, MapPin, Calendar, Clock } from '../ui/icons';

// Mexican flag colors and cultural elements
export const MexicanBranding = {
  colors: {
    green: '#006341',
    white: '#ffffff', 
    red: '#CE1126',
    gold: '#FFD700'
  },
  
  // Medical professionals' titles in Spanish
  titles: {
    doctor: 'Dr.',
    doctora: 'Dra.',
    licenciado: 'Lic.',
    maestro: 'Mtro.',
    especialista: 'Esp.'
  },
  
  // Mexican medical institutions
  institutions: {
    imss: 'Instituto Mexicano del Seguro Social',
    issste: 'Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
    sedena: 'Secretaría de la Defensa Nacional',
    semar: 'Secretaría de Marina',
    pemex: 'Petróleos Mexicanos',
    cfE: 'Comisión Federal de Electricidad'
  }
};

// Mexican Trust Badge Component
interface MexicanTrustBadgeProps {
  type: 'verified' | 'certified' | 'licensed' | 'approved';
  institution?: string;
  className?: string;
}

export const MexicanTrustBadge = ({ type, institution, className = '' }: MexicanTrustBadgeProps) => {
  const badgeConfig = {
    verified: {
      icon: <Shield className="w-4 h-4" />,
      text: 'Médico Verificado',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300'
    },
    certified: {
      icon: <Award className="w-4 h-4" />,
      text: 'Certificado Profesional',
      bgColor: 'bg-blue-100', 
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300'
    },
    licensed: {
      icon: <Shield className="w-4 h-4" />,
      text: 'Cédula Profesional',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-800', 
      borderColor: 'border-emerald-300'
    },
    approved: {
      icon: <Star className="w-4 h-4" />,
      text: 'Aprobado por COFEPRIS',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300'
    }
  };

  const config = badgeConfig[type];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} text-sm font-medium ${className}`}>
      {config.icon}
      <span>{config.text}</span>
      {institution && <span className="text-xs opacity-75">- {institution}</span>}
    </div>
  );
};

// Mexican Healthcare Metrics Component  
interface HealthcareMetricsProps {
  metrics: {
    consultations: number;
    satisfaction: number;
    experience: number;
    response: string;
  };
  className?: string;
}

export const MexicanHealthcareMetrics = ({ metrics, className = '' }: HealthcareMetricsProps) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-green-50 to-red-50 rounded-xl border border-green-200 ${className}`}>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-700">{metrics.consultations.toLocaleString('es-MX')}+</div>
        <div className="text-sm text-neutral-600">Consultas Realizadas</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-green-700">{metrics.satisfaction}%</div>
        <div className="text-sm text-neutral-600">Satisfacción</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-green-700">{metrics.experience}+</div>
        <div className="text-sm text-neutral-600">Años Experiencia</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-green-700">{metrics.response}</div>
        <div className="text-sm text-neutral-600">Tiempo Respuesta</div>
      </div>
    </div>
  );
};

// Mexican Doctor Profile Card
interface MexicanDoctorCardProps {
  doctor: {
    name: string;
    title: string;
    specialty: string;
    experience: number;
    rating: number;
    consultations: number;
    cedula: string;
    institution?: string;
    location: string;
    avatar?: string;
  };
  className?: string;
}

export const MexicanDoctorCard = ({ doctor, className = '' }: MexicanDoctorCardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-card hover:shadow-cardHover transition-all duration-300 overflow-hidden border-l-4 border-primary-500 ${className}`}>
      {/* Header with Mexican flag accent */}
      <div className="bg-gradient-to-r from-green-600 via-white to-red-600 h-2"></div>
      
      <div className="p-6">
        {/* Doctor info */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            {doctor.avatar ? (
              <img src={doctor.avatar} alt={`${doctor.title} ${doctor.name}`} className="w-full h-full rounded-full object-cover" />
            ) : (
              <Users className="w-8 h-8 text-primary-600" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-text-medical">{doctor.title} {doctor.name}</h3>
            <p className="text-primary-600 font-medium">{doctor.specialty}</p>
            <p className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {doctor.location}
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-4 space-y-2">
          <MexicanTrustBadge type="verified" institution={doctor.institution} />
          <div className="text-xs text-neutral-500">
            Cédula Profesional: {doctor.cedula}
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-semibold text-text-primary">{doctor.experience} años</div>
            <div className="text-xs text-neutral-600">Experiencia</div>
          </div>
          
          <div>
            <div className="font-semibold text-text-primary flex items-center justify-center gap-1">
              {doctor.rating} <Star className="w-3 h-3 text-yellow-500 fill-current" />
            </div>
            <div className="text-xs text-neutral-600">Calificación</div>
          </div>
          
          <div>
            <div className="font-semibold text-text-primary">{doctor.consultations}+</div>
            <div className="text-xs text-neutral-600">Consultas</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex gap-2">
          <button className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors">
            Consultar Ahora
          </button>
          <button className="px-4 py-2 border border-border-medium rounded-lg hover:bg-neutral-50 transition-colors">
            <Heart className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Mexican Medical Specialties Component
interface MexicanSpecialtiesProps {
  specialties: Array<{
    name: string;
    icon: React.ReactNode;
    count: number;
    available: boolean;
  }>;
  className?: string;
}

export const MexicanMedicalSpecialties = ({ specialties, className = '' }: MexicanSpecialtiesProps) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {specialties.map((specialty, index) => (
        <div key={index} className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
          specialty.available 
            ? 'border-primary-200 bg-primary-50 hover:border-primary-300 hover:shadow-md' 
            : 'border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed'
        }`}>
          <div className="flex flex-col items-center text-center gap-2">
            <div className={`p-2 rounded-full ${specialty.available ? 'bg-primary-100' : 'bg-neutral-100'}`}>
              {specialty.icon}
            </div>
            <h4 className="font-medium text-sm text-text-primary">{specialty.name}</h4>
            <p className="text-xs text-neutral-600">{specialty.count} especialistas</p>
            {specialty.available && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Disponible
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Mexican Healthcare Hours Component
export const MexicanHealthcareHours = ({ className = '' }: { className?: string }) => {
  const hours = [
    { day: 'Lunes - Viernes', hours: '8:00 AM - 10:00 PM' },
    { day: 'Sábados', hours: '9:00 AM - 8:00 PM' },
    { day: 'Domingos', hours: '10:00 AM - 6:00 PM' },
    { day: 'Emergencias', hours: '24/7' }
  ];

  return (
    <div className={`bg-white rounded-lg border border-border-light p-4 ${className}`}>
      <h3 className="font-semibold text-text-medical mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary-500" />
        Horarios de Atención
      </h3>
      
      <div className="space-y-2">
        {hours.map((schedule, index) => (
          <div key={index} className="flex justify-between items-center py-1">
            <span className="text-sm text-text-secondary">{schedule.day}</span>
            <span className="text-sm font-medium text-text-primary">{schedule.hours}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-2 bg-green-50 rounded-lg text-center">
        <p className="text-sm text-green-700">
          🇲🇽 Atención especializada para pacientes mexicanos
        </p>
      </div>
    </div>
  );
};

// Mexican Emergency Banner
export const MexicanEmergencyBanner = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`bg-red-600 text-white p-4 rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-red-600 font-bold text-lg">!</span>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold">¿Emergencia Médica?</h3>
          <p className="text-sm opacity-90">
            Llama inmediatamente al 911 o acude al hospital más cercano
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors">
            Llamar 911
          </button>
        </div>
      </div>
    </div>
  );
};

// Mexican Cultural Greetings
export const mexicanGreetings = {
  morning: ['¡Buenos días!', '¿Cómo amaneció?', '¡Que tenga buen día!'],
  afternoon: ['¡Buenas tardes!', '¿Cómo está?', '¡Que esté bien!'],
  evening: ['¡Buenas noches!', '¿Cómo le fue?', '¡Que descanse!'],
  formal: ['Es un placer atenderle', 'Estoy aquí para apoyarle', 'Me da mucho gusto saludarle'],
  medical: ['¿En qué puedo ayudarle hoy?', '¿Qué síntomas presenta?', '¿Cómo se ha sentido?']
};

export default {
  MexicanBranding,
  MexicanTrustBadge,
  MexicanHealthcareMetrics,
  MexicanDoctorCard,
  MexicanMedicalSpecialties,
  MexicanHealthcareHours,
  MexicanEmergencyBanner,
  mexicanGreetings
};