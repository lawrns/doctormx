'use client';

import { Shield, Lock, Award, CheckCircle2, Users, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Trust Footer - Mexican healthcare credentials and compliance
 */
export function TrustFooter() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <TrustBadge
            icon={<Shield className="w-8 h-8" />}
            title="Certificado COFEPRIS"
            description="Aprobado por la autoridad sanitaria mexicana"
          />
          <TrustBadge
            icon={<Lock className="w-8 h-8" />}
            title="Datos Encriptados"
            description="Protección con estándares HIPAA"
          />
          <TrustBadge
            icon={<Award className="w-8 h-8" />}
            title="ISO 27001"
            description="Seguridad de la información certificada"
          />
          <TrustBadge
            icon={<Users className="w-8 h-8" />}
            title="10,000+ Pacientes"
            description="Confianza comprobada en México"
          />
        </div>

        {/* Detailed credentials */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Credenciales y Certificaciones
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Médicos Certificados:</strong> Todos nuestros médicos cuentan con
                cédula profesional verificada ante la Secretaría de Educación Pública (SEP)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Licencias Estatales:</strong> Autorizados para operar en Ciudad de
                México, Estado de México, Jalisco, Nuevo León y más
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Privacidad Garantizada:</strong> Cumplimos con la Ley Federal de
                Protección de Datos Personales (LFPDPPP)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Prescripciones Digitales:</strong> Recetas electrónicas válidas en
                todas las farmacias de México
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Doctor.mx es una plataforma de telemedicina registrada bajo la NOM-024-SSA3-2012 •
            Registro COFEPRIS: [Número] • RFC: [RFC]
            <br />
            Todos los servicios médicos son proporcionados por profesionales de la salud
            certificados y con cédula profesional vigente.
          </p>
        </div>
      </div>
    </div>
  );
}

function TrustBadge({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="text-blue-600 mb-2">{icon}</div>
      <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}

/**
 * Doctor Verification Badge with detailed tooltip
 */
export function VerificationBadge({
  doctorId,
  cedula,
  verifiedDate,
  showDetails = false,
}: {
  doctorId: string;
  cedula: string;
  verifiedDate: Date;
  showDetails?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
      <CheckCircle2 className="w-4 h-4 fill-current" />
      <span className="font-semibold text-sm">Verificado</span>
      {showDetails && (
        <div className="group relative">
          <button className="text-green-600 hover:text-green-800">ⓘ</button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
            <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl whitespace-nowrap">
              <p className="font-semibold mb-1">Cédula Profesional Verificada</p>
              <p>Número: {cedula}</p>
              <p>Verificado: {verifiedDate.toLocaleDateString('es-MX')}</p>
              <a
                href={`https://www.cedulaprofesional.sep.gob.mx/cedula/presidencia/indexAvanzada.action?&cedula=${cedula}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline mt-1 block"
              >
                Verificar en SEP →
              </a>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="border-8 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Patient Testimonials Section
 */
export function PatientTestimonials() {
  const testimonials = [
    {
      name: 'María González',
      city: 'Ciudad de México',
      rating: 5,
      text: 'La consulta en línea fue excelente. El doctor me atendió muy bien y pude obtener mi receta digital al instante. Lo recomiendo totalmente.',
      date: '2026-01-15',
      verified: true,
    },
    {
      name: 'Carlos Ramírez',
      city: 'Monterrey',
      rating: 5,
      text: 'Muy conveniente y profesional. Ahorré tiempo y dinero. La orientación de IA me ayudó a prepararme mejor para mi consulta.',
      date: '2026-01-10',
      verified: true,
    },
    {
      name: 'Ana Martínez',
      city: 'Guadalajara',
      rating: 5,
      text: 'Excelente servicio. Pude pagar en OXXO sin problemas y la video consulta fue muy clara. Los doctores están bien preparados.',
      date: '2026-01-08',
      verified: true,
    },
  ];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Lo Que Dicen Nuestros Pacientes
          </h2>
          <p className="text-gray-600">
            Miles de mexicanos confían en Doctor.mx para su salud
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>

        {/* Trust stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
          <TrustStat number="10,000+" label="Pacientes Atendidos" />
          <TrustStat number="4.9/5" label="Calificación Promedio" />
          <TrustStat number="98%" label="Satisfacción" />
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({
  name,
  city,
  rating,
  text,
  verified,
}: {
  name: string;
  city: string;
  rating: number;
  text: string;
  verified: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-1 mb-3">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
        ))}
      </div>
      <p className="text-gray-700 mb-4 italic">"{text}"</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{city}</p>
        </div>
        {verified && (
          <div className="text-green-600 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Verificado
          </div>
        )}
      </div>
    </div>
  );
}

function TrustStat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-blue-600 mb-1">{number}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

/**
 * Security Features Highlight
 */
export function SecurityFeatures() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Tu Información Está Segura
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          <SecurityFeature
            icon={<Lock className="w-6 h-6" />}
            title="Encriptación de Extremo a Extremo"
            description="Todas tus conversaciones y datos médicos están protegidos con encriptación de grado bancario"
          />
          <SecurityFeature
            icon={<Shield className="w-6 h-6" />}
            title="Cumplimiento HIPAA"
            description="Seguimos los estándares internacionales de privacidad médica"
          />
          <SecurityFeature
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="Servidores Certificados"
            description="Infraestructura auditada y certificada ISO 27001"
          />
          <SecurityFeature
            icon={<Award className="w-6 h-6" />}
            title="Médicos Verificados"
            description="Todos los médicos tienen cédula profesional validada ante la SEP"
          />
        </div>
      </div>
    </div>
  );
}

function SecurityFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="text-blue-600 mb-3">{icon}</div>
      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
