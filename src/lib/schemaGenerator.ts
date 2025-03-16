/**
 * Schema Generator Utility
 * 
 * This utility generates JSON-LD schema markup for different page types.
 */

// Base Organization Schema
export const getOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Doctor.mx',
    url: 'https://doctor.mx',
    logo: 'https://doctor.mx/Doctorlogo.png',
    sameAs: [
      'https://www.facebook.com/doctormx',
      'https://twitter.com/doctormx',
      'https://www.instagram.com/doctormx/'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+52-XXX-XXX-XXXX', // Replace with actual number
      contactType: 'customer service',
      availableLanguage: {
        '@type': 'Language',
        name: 'Spanish'
      }
    }
  };
};

// Doctor Profile Schema
export const getDoctorSchema = (doctor: any) => {
  if (!doctor) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: `${doctor.firstName} ${doctor.lastName}`,
    image: doctor.profileImage || 'https://doctor.mx/placeholders/doctor.png',
    description: doctor.bio || `${doctor.firstName} ${doctor.lastName} es un médico especialista en ${doctor.specialty}`,
    medicalSpecialty: doctor.specialty,
    memberOf: {
      '@type': 'Organization',
      name: 'Doctor.mx'
    },
    address: doctor.address ? {
      '@type': 'PostalAddress',
      addressLocality: doctor.address.city || 'Ciudad de México',
      addressRegion: doctor.address.state || 'CDMX',
      addressCountry: 'MX'
    } : undefined,
    telephone: doctor.phone,
    email: doctor.email,
    url: `https://doctor.mx/doctor/${doctor.id}`,
    availableService: {
      '@type': 'MedicalProcedure',
      name: doctor.services?.join(', ') || doctor.specialty
    },
    // If we have review data
    ...(doctor.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: doctor.averageRating,
        reviewCount: doctor.reviewCount
      }
    })
  };
};

// Medical Specialty Schema
export const getSpecialtySchema = (specialty: any) => {
  if (!specialty) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalSpecialty',
    name: specialty.name,
    description: specialty.description || `Encuentra especialistas en ${specialty.name} en Doctor.mx`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://doctor.mx/especialidades/${specialty.slug}`
    }
  };
};

// Medical Condition Schema
export const getMedicalConditionSchema = (condition: any) => {
  if (!condition) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: condition.name,
    description: condition.description,
    possibleTreatment: condition.treatments?.map((treatment: string) => ({
      '@type': 'MedicalTherapy',
      name: treatment
    })) || [],
    relevantSpecialty: condition.specialties?.map((specialty: string) => ({
      '@type': 'MedicalSpecialty',
      name: specialty
    })) || []
  };
};

// FAQ Schema
export const getFAQSchema = (questions: Array<{question: string, answer: string}>) => {
  if (!questions || questions.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  };
};

// Local Business Schema
export const getLocalBusinessSchema = (location: any) => {
  if (!location) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: location.name || 'Doctor.mx Consultorio',
    image: location.image || 'https://doctor.mx/Doctorlogo.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address,
      addressLocality: location.city,
      addressRegion: location.state,
      postalCode: location.zipCode,
      addressCountry: 'MX'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.latitude,
      longitude: location.longitude
    },
    telephone: location.phone,
    priceRange: '$$',
    openingHoursSpecification: location.hours?.map((hour: any) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hour.day,
      opens: hour.opens,
      closes: hour.closes
    })) || []
  };
};

export default {
  getOrganizationSchema,
  getDoctorSchema,
  getSpecialtySchema,
  getMedicalConditionSchema,
  getFAQSchema,
  getLocalBusinessSchema
};