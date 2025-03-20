import React from 'react';
import EnhancedSEO from './EnhancedSEO';

interface DoctorSchedule {
  [day: string]: { start: string; end: string } | null;
}

interface DoctorEducation {
  degree: string;
  institution: string;
  year: string;
}

interface DoctorReview {
  id: string;
  patient: string;
  date: string;
  rating: number;
  comment: string;
}

interface DoctorData {
  id: string;
  name: string;
  specialty: string;
  subspecialty?: string;
  location: string;
  address: string;
  citySlug?: string; // e.g. "ciudad-de-mexico"
  stateSlug?: string; // e.g. "df"
  rating: number;
  reviewCount: number;
  price: number;
  image: string;
  professionalStatement?: string;
  about: string;
  services: string[];
  insurances: string[];
  languages: string[];
  education: DoctorEducation[];
  experience: number;
  acceptsNewPatients?: boolean;
  gender?: string;
  schedule?: DoctorSchedule;
  reviews?: DoctorReview[];
  email?: string;
  phone?: string;
  website?: string;
  telemedicine?: boolean;
  consultationTypes?: string[];
  medicalLicense?: string;
  certifications?: string[];
  professionalAssociations?: string[];
  awards?: string[];
  publications?: string[];
}

interface DoctorSEOProps {
  doctor: DoctorData;
  url: string;
}

/**
 * Specialized SEO component for doctor profile pages
 * Includes structured data optimized for physician profiles in Google Search
 */
const DoctorSEO: React.FC<DoctorSEOProps> = ({ doctor, url }) => {
  // Format title for optimal SEO
  const title = `${doctor.name} - ${doctor.specialty} en ${doctor.location} | Doctor.mx`;
  
  // Create a compelling, keyword-rich meta description
  const description = `Consulta con ${doctor.name}, especialista en ${doctor.specialty} en ${doctor.location} con ${doctor.experience} años de experiencia y calificación de ${doctor.rating}/5 (${doctor.reviewCount} opiniones). ${doctor.telemedicine ? 'Ofrece telemedicina. ' : ''}${doctor.about.substring(0, 80)}...`;
  
  // Generate breadcrumbs for structured navigation
  const breadcrumbs = [
    { name: 'Médicos', url: '/medicos' },
    { name: doctor.specialty, url: `/especialidad/${encodeURIComponent(doctor.specialty.toLowerCase().replace(/ /g, '-'))}` },
    { name: doctor.location, url: `/ubicacion/${doctor.citySlug || encodeURIComponent(doctor.location.toLowerCase().replace(/ /g, '-'))}` },
    { name: doctor.name, url }
  ];

  // Format medical services as structured data
  const medicalServices = doctor.services.map(service => ({
    '@type': 'MedicalProcedure',
    'name': service
  }));

  // Format education as structured credentials
  const credentials = doctor.education.map(edu => ({
    '@type': 'EducationalOccupationalCredential',
    'credentialCategory': 'degree',
    'name': edu.degree,
    'recognizedBy': {
      '@type': 'Organization',
      'name': edu.institution
    },
    'dateCreated': edu.year
  }));

  // Format reviews as structured review data
  const structuredReviews = doctor.reviews ? doctor.reviews.map(review => ({
    '@type': 'Review',
    'author': {
      '@type': 'Person',
      'name': review.patient
    },
    'datePublished': review.date,
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': review.rating,
      'bestRating': '5',
      'worstRating': '1'
    },
    'reviewBody': review.comment
  })) : [];

  // Format opening hours for structured data
  const openingHours = doctor.schedule ? 
    Object.entries(doctor.schedule)
      .filter(([_, hours]) => hours !== null)
      .map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': `https://schema.org/${day.charAt(0).toUpperCase() + day.slice(1)}`,
        'opens': hours.start,
        'closes': hours.end
      })) : [];

  // Generate enhanced physician schema
  const physicianSchema = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': `https://doctor.mx${url}#physician`,
    'name': doctor.name,
    'image': doctor.image,
    'description': doctor.about,
    'medicalSpecialty': [
      {
        '@type': 'MedicalSpecialty',
        'name': doctor.specialty
      },
      ...(doctor.subspecialty ? [{
        '@type': 'MedicalSpecialty',
        'name': doctor.subspecialty
      }] : [])
    ],
    'url': `https://doctor.mx${url}`,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://doctor.mx${url}`
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': doctor.address,
      'addressLocality': doctor.location,
      'addressRegion': doctor.stateSlug?.toUpperCase() || 'MX',
      'addressCountry': 'MX'
    },
    'telephone': doctor.phone || '+52 55 1234 5678',
    'email': doctor.email || 'contacto@doctor.mx',
    'priceRange': `$${doctor.price}`,
    'currenciesAccepted': 'MXN',
    'paymentAccepted': 'Cash, Credit Card, Debit Card',
    'availableService': medicalServices,
    'openingHoursSpecification': openingHours,
    'healthInsuranceAccepted': doctor.insurances.join(', '),
    'knowsLanguage': doctor.languages,
    'gender': doctor.gender,
    'hasCredential': credentials,
    'memberOf': doctor.professionalAssociations ? doctor.professionalAssociations.map(association => ({
      '@type': 'Organization',
      'name': association
    })) : [],
    'workLocation': {
      '@type': 'MedicalClinic',
      'name': `Consultorio Dr. ${doctor.name.split(' ')[1] || ''}`,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': doctor.address,
        'addressLocality': doctor.location,
        'addressRegion': doctor.stateSlug?.toUpperCase() || 'MX',
        'addressCountry': 'MX'
      }
    }
  };

  // Add aggregate rating if there are reviews
  if (doctor.reviewCount > 0) {
    physicianSchema['aggregateRating'] = {
      '@type': 'AggregateRating',
      'ratingValue': doctor.rating,
      'reviewCount': doctor.reviewCount,
      'bestRating': '5',
      'worstRating': '1'
    };
  }

  // Add reviews if available
  if (structuredReviews.length > 0) {
    physicianSchema['review'] = structuredReviews;
  }

  // Generate FAQ Schema with common questions about the doctor
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': `¿Cuáles son las especialidades del ${doctor.name}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `${doctor.name} es especialista en ${doctor.specialty}${doctor.subspecialty ? ` con subespecialidad en ${doctor.subspecialty}` : ''}.`
        }
      },
      {
        '@type': 'Question',
        'name': `¿Dónde atiende el ${doctor.name}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `${doctor.name} atiende en ${doctor.address}, ${doctor.location}.${doctor.telemedicine ? ' También ofrece consultas por telemedicina.' : ''}`
        }
      },
      {
        '@type': 'Question',
        'name': `¿Cuál es el costo de la consulta con ${doctor.name}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `El costo de la consulta con ${doctor.name} es de $${doctor.price} MXN.`
        }
      },
      {
        '@type': 'Question',
        'name': `¿${doctor.name} acepta seguros médicos?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': doctor.insurances.length > 0 
            ? `Sí, ${doctor.name} acepta los siguientes seguros médicos: ${doctor.insurances.join(', ')}.` 
            : `Consulta directamente con ${doctor.name} sobre la aceptación de seguros médicos específicos.`
        }
      }
    ]
  };

  return (
    <EnhancedSEO
      title={title}
      description={description}
      canonical={url}
      image={doctor.image}
      schema={[physicianSchema, faqSchema]}
      type="profile"
      keywords={`${doctor.name}, ${doctor.specialty}, médico, doctor, especialista, ${doctor.location}, citas médicas`}
      cityTarget={doctor.location}
      stateTarget={doctor.stateSlug}
      breadcrumbs={breadcrumbs}
      alternateLanguages={[
        { locale: 'es-mx', url: `https://doctor.mx${url}` }
      ]}
    />
  );
};

export default DoctorSEO;