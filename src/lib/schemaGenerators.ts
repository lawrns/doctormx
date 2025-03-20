/**
 * Utility functions for generating schema.org structured data
 * This helps standardize schema generation across the site
 */

// Base types for common entity properties
interface BaseEntity {
  name: string;
  image?: string;
  description?: string;
  url?: string;
}

// Doctor entity for schema generation
export interface DoctorEntity extends BaseEntity {
  specialty: string;
  subspecialty?: string;
  address: string;
  location: string;
  stateCode?: string;
  rating?: number;
  reviewCount?: number;
  price?: number;
  languages?: string[];
  services?: string[];
  insurances?: string[];
  schedule?: Record<string, { start: string; end: string } | null>;
}

// Medical specialty entity
export interface SpecialtyEntity extends BaseEntity {
  slug: string;
  relatedConditions?: string[];
  commonProcedures?: string[];
}

// Medical condition entity
export interface ConditionEntity extends BaseEntity {
  symptoms?: string[];
  treatments?: string[];
  specialties?: string[];
  causes?: string[];
}

// Location entity
export interface LocationEntity extends BaseEntity {
  stateCode?: string;
  coordinates?: { lat: number; lng: number };
}

/**
 * Generates standardized Physician schema for doctor profiles
 */
export function generateDoctorSchema(doctor: DoctorEntity, id: string): any {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': `https://doctor.mx/doctor/${id}#physician`,
    'name': doctor.name,
    'image': doctor.image,
    'description': doctor.description,
    'medicalSpecialty': doctor.specialty,
    'url': `https://doctor.mx/doctor/${id}`,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://doctor.mx/doctor/${id}`
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': doctor.address,
      'addressLocality': doctor.location,
      'addressRegion': doctor.stateCode || 'MX',
      'addressCountry': 'MX'
    }
  };

  // Add optional properties if available
  if (doctor.price) {
    schema['priceRange'] = `$${doctor.price}`;
    schema['currenciesAccepted'] = 'MXN';
  }

  if (doctor.languages && doctor.languages.length > 0) {
    schema['knowsLanguage'] = doctor.languages;
  }

  if (doctor.services && doctor.services.length > 0) {
    schema['availableService'] = doctor.services.map(service => ({
      '@type': 'MedicalProcedure',
      'name': service
    }));
  }

  if (doctor.rating && doctor.reviewCount) {
    schema['aggregateRating'] = {
      '@type': 'AggregateRating',
      'ratingValue': doctor.rating,
      'reviewCount': doctor.reviewCount,
      'bestRating': '5',
      'worstRating': '1'
    };
  }

  if (doctor.schedule) {
    schema['openingHoursSpecification'] = Object.entries(doctor.schedule)
      .filter(([_, hours]) => hours !== null)
      .map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': `https://schema.org/${day.charAt(0).toUpperCase() + day.slice(1)}`,
        'opens': hours.start,
        'closes': hours.end
      }));
  }

  if (doctor.insurances && doctor.insurances.length > 0) {
    schema['healthInsuranceAccepted'] = doctor.insurances.join(', ');
  }

  return schema;
}

/**
 * Generates standardized MedicalSpecialty schema
 */
export function generateSpecialtySchema(specialty: SpecialtyEntity, location?: string): any {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalSpecialty',
    'name': specialty.name,
    'description': specialty.description,
    'url': `https://doctor.mx/especialidad/${specialty.slug}${location ? '/' + location : ''}`
  };

  if (specialty.image) {
    schema['image'] = specialty.image;
  }

  return schema;
}

/**
 * Generates standardized MedicalCondition schema
 */
export function generateConditionSchema(condition: ConditionEntity): any {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    'name': condition.name,
    'description': condition.description
  };

  if (condition.image) {
    schema['image'] = condition.image;
  }

  if (condition.symptoms && condition.symptoms.length > 0) {
    schema['signOrSymptom'] = condition.symptoms.map(symptom => ({
      '@type': 'MedicalSymptom',
      'name': symptom
    }));
  }

  if (condition.treatments && condition.treatments.length > 0) {
    schema['possibleTreatment'] = condition.treatments.map(treatment => ({
      '@type': 'MedicalTherapy',
      'name': treatment
    }));
  }

  if (condition.specialties && condition.specialties.length > 0) {
    schema['relevantSpecialty'] = condition.specialties.map(specialty => ({
      '@type': 'MedicalSpecialty',
      'name': specialty
    }));
  }

  if (condition.causes && condition.causes.length > 0) {
    schema['cause'] = condition.causes.map(cause => ({
      '@type': 'MedicalCause',
      'name': cause
    }));
  }

  return schema;
}

/**
 * Generates standardized Place schema for location pages
 */
export function generateLocationSchema(location: LocationEntity): any {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    'name': location.name,
    'description': location.description
  };

  if (location.image) {
    schema['image'] = location.image;
  }

  if (location.url) {
    schema['url'] = location.url;
  }

  if (location.coordinates) {
    schema['geo'] = {
      '@type': 'GeoCoordinates',
      'latitude': location.coordinates.lat,
      'longitude': location.coordinates.lng
    };
  }

  if (location.stateCode) {
    schema['address'] = {
      '@type': 'PostalAddress',
      'addressLocality': location.name,
      'addressRegion': location.stateCode,
      'addressCountry': 'MX'
    };
  }

  return schema;
}

/**
 * Generates FAQ schema with standard formatting
 */
export function generateFAQSchema(faqs: Array<{question: string; answer: string}>): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

/**
 * Generates BreadcrumbList schema with standard formatting
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string; url: string}>): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Inicio',
        'item': 'https://doctor.mx'
      },
      ...breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 2,
        'name': crumb.name,
        'item': crumb.url.startsWith('http') ? crumb.url : `https://doctor.mx${crumb.url}`
      }))
    ]
  };
}

/**
 * Generates Website schema for the entire site
 */
export function generateWebsiteSchema(): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': 'https://doctor.mx',
    'name': 'Doctor.mx',
    'description': 'La plataforma líder de salud en México para encontrar médicos y agendar citas',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://doctor.mx/buscar?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generates Homepage schema for Doctor.mx
 * Includes WebSite, Organization, and specialized WebPage schemas
 */
export function generateHomePageSchema(): any {
  const dateIso = new Date().toISOString();
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Website schema
      {
        '@type': 'WebSite',
        '@id': 'https://doctor.mx/#website',
        'url': 'https://doctor.mx/',
        'name': 'Doctor.mx',
        'description': 'La plataforma líder de salud en México para encontrar médicos y agendar citas médicas',
        'publisher': {
          '@id': 'https://doctor.mx/#organization'
        },
        'potentialAction': [{
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': 'https://doctor.mx/buscar?q={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }],
        'inLanguage': 'es-MX'
      },
      // WebPage schema for the homepage
      {
        '@type': 'WebPage',
        '@id': 'https://doctor.mx/#webpage',
        'url': 'https://doctor.mx/',
        'name': 'Doctor.mx | Encuentra médicos, comunidades de pacientes y agenda citas en línea',
        'isPartOf': {
          '@id': 'https://doctor.mx/#website'
        },
        'about': {
          '@id': 'https://doctor.mx/#organization'
        },
        'description': 'La plataforma líder de salud en México para encontrar médicos, agendar citas, comunidades de pacientes y consultas por telemedicina',
        'datePublished': '2020-01-01T12:00:00+00:00',
        'dateModified': dateIso,
        'inLanguage': 'es-MX',
        'potentialAction': [{
          '@type': 'ReadAction',
          'target': ['https://doctor.mx/']
        }]
      },
      // Organization schema
      generateOrganizationSchema()
    ]
  };
}

/**
 * Generates Organization schema for Doctor.mx
 */
export function generateOrganizationSchema(): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'url': 'https://doctor.mx',
    'logo': 'https://doctor.mx/Doctorlogo.png',
    'name': 'Doctor.mx',
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+52-55-1234-5678',
      'contactType': 'customer service',
      'areaServed': 'MX',
      'availableLanguage': ['Spanish', 'English']
    },
    'sameAs': [
      'https://www.facebook.com/doctormx',
      'https://twitter.com/doctormx',
      'https://www.instagram.com/doctormx/',
      'https://www.linkedin.com/company/doctormx'
    ]
  };
}