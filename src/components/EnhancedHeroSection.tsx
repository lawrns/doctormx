import React from 'react';
import { Link } from 'react-router-dom';

interface EnhancedHeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image?: string;
  imageAlt?: string;
  backgroundColor?: string;
  textColor?: string;
}

const EnhancedHeroSection: React.FC<EnhancedHeroSectionProps> = ({
  title = "Encuentra el médico ideal para ti",
  subtitle = "Conectamos pacientes con los mejores especialistas médicos de México. Agenda citas fácilmente y recibe atención de calidad.",
  ctaText = "Buscar médicos",
  ctaLink = "/search",
  secondaryCtaText = "¿Cómo funciona?",
  secondaryCtaLink = "/how-it-works",
  image = "/images/hero-doctor.webp",
  imageAlt = "Doctor con paciente",
  backgroundColor = "bg-gradient-to-r from-blue-50 to-indigo-50",
  textColor = "text-gray-800",
}) => {
  return (
    <section className={`${backgroundColor} py-16 md:py-24 overflow-hidden`}>
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-10 animate-slide-in-up">
          <h1 className={`text-4xl md:text-5xl font-bold leading-tight ${textColor} mb-6`}>
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to={ctaLink}
              className="btn btn-primary text-center px-8 py-3 rounded-lg text-lg font-medium"
            >
              {ctaText}
            </Link>
            <Link
              to={secondaryCtaLink}
              className="btn btn-outline text-center px-8 py-3 rounded-lg text-lg font-medium flex items-center justify-center"
            >
              {secondaryCtaText}
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          
          <div className="mt-12">
            <p className="text-sm text-gray-500 mb-3">Utilizado por profesionales de:</p>
            <div className="flex flex-wrap items-center space-x-6">
              <img src="/images/logos/hospital-logo-1.svg" alt="Hospital Logo" className="h-8 grayscale opacity-70" />
              <img src="/images/logos/hospital-logo-2.svg" alt="Hospital Logo" className="h-8 grayscale opacity-70" />
              <img src="/images/logos/hospital-logo-3.svg" alt="Hospital Logo" className="h-8 grayscale opacity-70" />
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 relative animate-fade-in">
          {/* Main image */}
          <div className="relative z-10 rounded-lg shadow-xl overflow-hidden max-w-md mx-auto">
            <img src={image} alt={imageAlt} className="w-full h-auto" />
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-1/4 -left-8 bg-white p-4 rounded-lg shadow-lg z-20 hidden md:block">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Cita confirmada</p>
                <p className="text-xs text-gray-500">Dr. García, 10:30 AM</p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-1/4 -right-4 bg-white p-4 rounded-lg shadow-lg z-20 hidden md:block">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-white" src="/images/avatar-1.jpg" alt="User" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="/images/avatar-2.jpg" alt="User" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="/images/avatar-3.jpg" alt="User" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">+2,500 usuarios</p>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-gray-500 ml-1">4.9/5 calificación</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 rounded-full opacity-20"></div>
          <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-indigo-200 rounded-full opacity-20"></div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;