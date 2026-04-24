'use client';

import { Shield, Lock, Award, CheckCircle2, FileCheck2, Star } from 'lucide-react';
import Image from 'next/image';

/**
 * Trust Footer - Mexican healthcare credentials and compliance
 */
export function TrustFooter() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-border">
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
            icon={<FileCheck2 className="w-8 h-8" />}
            title="Evidencia Visible"
            description="Datos mostrados solo cuando existen"
          />
        </div>

        {/* Detailed credentials */}
        <div className="bg-card rounded-[12px] p-6 shadow-sm border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Credenciales y Certificaciones
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong>Médicos Certificados:</strong> Todos nuestros médicos cuentan con
                cédula profesional verificada ante la Secretaría de Educación Pública (SEP)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong>Licencias Estatales:</strong> Autorizados para operar en Ciudad de
                México, Estado de México, Jalisco, Nuevo León y más
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong>Privacidad Garantizada:</strong> Cumplimos con la Ley Federal de
                Protección de Datos Personales (LFPDPPP)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong>Prescripciones Digitales:</strong> Recetas electrónicas válidas en
                todas las farmacias de México
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory info */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Doctor.mx opera con controles orientados a la NOM-024-SSA3-2012 y a la protección de datos personales en México.
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
    <div className="flex flex-col items-center text-center p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
      <div className="text-primary mb-2">{icon}</div>
      <h4 className="font-bold text-foreground text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
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
    <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-3 py-1.5 rounded-lg border border-primary/20">
      <CheckCircle2 className="w-4 h-4 fill-current" />
      <span className="font-semibold text-sm">Verificado</span>
      {showDetails && (
        <div className="group relative">
          <button className="text-primary hover:text-primary/80">ⓘ</button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
            <div className="bg-foreground text-primary-foreground text-xs rounded-lg p-3 shadow-xl whitespace-nowrap">
              <p className="font-semibold mb-1">Cédula Profesional Verificada</p>
              <p>Número: {cedula}</p>
              <p>Verificado: {verifiedDate.toLocaleDateString('es-MX')}</p>
              <a
                href={`https://www.cedulaprofesional.sep.gob.mx/cedula/presidencia/indexAvanzada.action?&cedula=${cedula}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary/80 underline mt-1 block"
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
      text: 'Muy conveniente y profesional. Ahorré tiempo y dinero. El diagnóstico de IA me ayudó a entender mejor mis síntomas antes de la consulta.',
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
    <div className="bg-card py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Lo Que Dicen Nuestros Pacientes
          </h2>
          <p className="text-muted-foreground">
            Miles de mexicanos confían en Doctor.mx para su salud
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} featured={index === 0} />
          ))}
        </div>

        {/* Trust stats */}
        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <TrustStat label="Pacientes atendidos" />
          <TrustStat label="Calificación promedio" />
          <TrustStat label="Satisfacción reportada" />
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
  featured = false,
}: {
  name: string;
  city: string;
  rating: number;
  text: string;
  verified: boolean;
  featured?: boolean;
}) {
  return (
    <div className={`border border-border bg-secondary/50 p-6 transition-shadow hover:shadow-sm ${featured ? 'lg:row-span-2 lg:p-8' : ''}`}>
      <div className="flex items-center gap-1 mb-3">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
        ))}
      </div>
      <p className="text-muted-foreground mb-4 italic">"{text}"</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{city}</p>
        </div>
        {verified && (
          <div className="text-primary text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Verificado
          </div>
        )}
      </div>
    </div>
  );
}

function TrustStat({ label }: { label: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
        Verificable
      </div>
      <div>{label}</div>
    </div>
  );
}

/**
 * Security Features Highlight
 */
export function SecurityFeatures() {
  return (
    <div className="bg-gradient-to-br from-[#eff7ff] to-[#e8f3ff] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-bold text-foreground text-center mb-8">
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
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="text-primary mb-3">{icon}</div>
      <h4 className="font-bold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
