/**
 * Structured Data Component
 *
 * Injects JSON-LD structured data for SEO using schema.org vocabulary.
 * Uses safe JSON serialization to prevent XSS vulnerabilities.
 *
 * SECURITY: All data is sanitized before injection using safeJsonLdRelaxed
 * which escapes HTML entities and sanitizes string values.
 *
 * @security-reviewed
 */

import { safeJsonLdRelaxed } from '@/lib/utils/safeStructuredData';

export function StructuredData() {
  // Static schema definitions - these are hardcoded and safe
  // but we still sanitize for defense-in-depth
  const medicalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'Doctor.mx',
    description:
      'Plataforma de telemedicina y consultas médicas en línea con doctores verificados en México',
    url: 'https://doctor.mx',
    logo: 'https://doctor.mx/logo.png',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MX',
    },
    areaServed: {
      '@type': 'Country',
      name: 'México',
    },
    priceRange: '$-$$',
    medicalSpecialty: [
      'GeneralPractice',
      'Cardiology',
      'Dermatology',
      'Pediatrics',
      'Psychiatry',
    ],
    availableService: {
      '@type': 'MedicalService',
      name: 'Consulta médica en línea',
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceType: 'OnlineService',
      },
    },
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Doctor.mx',
    url: 'https://doctor.mx',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://doctor.mx/doctores?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Doctor.mx',
    url: 'https://doctor.mx',
    logo: 'https://doctor.mx/logo.png',
    sameAs: [
      'https://facebook.com/doctormx',
      'https://twitter.com/doctormx',
      'https://instagram.com/doctormx',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+52-800-DOCTOR',
      contactType: 'customer service',
      availableLanguage: 'Spanish',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // SECURITY: Using safeJsonLdRelaxed to prevent XSS
        // Escapes </script> and sanitizes all string values
        dangerouslySetInnerHTML={{
          __html: safeJsonLdRelaxed(medicalBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdRelaxed(webSiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdRelaxed(organizationSchema),
        }}
      />
    </>
  );
}
