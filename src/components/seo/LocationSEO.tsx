import React from 'react';
import EnhancedSEO from './EnhancedSEO';

interface LocationData {
  id: string;
  name: string;
  stateCode?: string;
  stateName?: string;
  slug: string;
  description?: string;
  image?: string;
  doctorCount?: number;
  specialtyCount?: number;
  popularSpecialties?: Array<{name: string; slug: string; count: number}>;
  neighborhoods?: Array<{name: string; slug: string; doctorCount: number}>;
  coordinates?: {lat: number; lng: number};
  population?: number;
  faqs?: Array<{question: string; answer: string}>;
}

interface LocationSEOProps {
  location: LocationData;
  specialty?: {
    name: string;
    slug: string;
  };
}

/**
 * Specialized SEO component for location pages
 * Optimized for city directories and city+specialty combinations
 */
const LocationSEO: React.FC<LocationSEOProps> = ({ location, specialty }) => {
  // Build URL based on whether this is location-only or location+specialty
  const url = specialty 
    ? `/ubicacion/${location.slug}/${specialty.slug}` 
    : `/ubicacion/${location.slug}`;
  
  // Create optimized title
  const title = specialty 
    ? `Mejores ${specialty.name} en ${location.name} (${location.doctorCount || '10+'}+ Especialistas) | Doctor.mx`
    : `Médicos en ${location.name} | ${location.specialtyCount || '10+'}+ Especialidades | Doctor.mx`;
  
  // Create optimized meta description
  const baseDescription = location.description 
    ? location.description.substring(0, 100) 
    : `Directorio médico en ${location.name}, ${location.stateName || 'México'}.`;
  
  const description = specialty
    ? `Encuentra los mejores especialistas en ${specialty.name} en ${location.name}. ${location.doctorCount || 'Múltiples'} médicos disponibles para consulta presencial y telemedicina. Agenda tu cita hoy.`
    : `${baseDescription} Accede a ${location.doctorCount || 'cientos de'} médicos en ${location.specialtyCount || 'múltiples'} especialidades. Consulta presencial y telemedicina disponibles.`;
  
  // Generate breadcrumbs
  const breadcrumbs = specialty 
    ? [
        { name: 'Ubicaciones', url: '/ubicaciones' },
        { name: location.name, url: `/ubicacion/${location.slug}` },
        { name: specialty.name, url: url }
      ]
    : [
        { name: 'Ubicaciones', url: '/ubicaciones' },
        { name: location.name, url: url }
      ];

  // Generate Place Schema
  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    '@id': `https://doctor.mx${url}#place`,
    'name': location.name,
    'description': location.description || `Información sobre médicos y especialistas en ${location.name}.`,
    ...(location.coordinates && {
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': location.coordinates.lat,
        'longitude': location.coordinates.lng
      }
    }),
    'url': `https://doctor.mx${url}`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': location.name,
      'addressRegion': location.stateCode || 'MX',
      'addressCountry': 'MX'
    },
    ...(location.image && { 'image': location.image })
  };

  // Generate WebPage Schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `https://doctor.mx${url}#webpage`,
    'name': title,
    'description': description,
    'url': `https://doctor.mx${url}`,
    'lastReviewed': new Date().toISOString(),
    'mainContentOfPage': {
      '@type': 'WebPageElement',
      'cssSelector': '.location-content'
    },
    'about': {
      '@type': 'Place',
      'name': location.name
    }
  };

  // Generate ItemList for popular specialties in this location
  const specialtiesListSchema = location.popularSpecialties ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `https://doctor.mx${url}#specialtiesList`,
    'name': `Especialidades médicas populares en ${location.name}`,
    'itemListElement': location.popularSpecialties.map((spec, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'MedicalSpecialty',
        'name': spec.name,
        'url': `https://doctor.mx/especialidad/${spec.slug}/${location.slug}`
      }
    }))
  } : null;

  // Generate ItemList for neighborhoods in this location
  const neighborhoodsListSchema = location.neighborhoods ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `https://doctor.mx${url}#neighborhoodsList`,
    'name': `Zonas en ${location.name} con médicos disponibles`,
    'itemListElement': location.neighborhoods.map((neighborhood, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Place',
        'name': neighborhood.name,
        'url': `https://doctor.mx/ubicacion/${location.slug}/${neighborhood.slug}`
      }
    }))
  } : null;

  // Generate FAQ Schema
  const faqEntities = location.faqs ? location.faqs.map(faq => ({
    '@type': 'Question',
    'name': faq.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.answer
    }
  })) : [
    {
      '@type': 'Question',
      'name': specialty 
        ? `¿Cuáles son los mejores ${specialty.name} en ${location.name}?`
        : `¿Cómo encontrar médicos en ${location.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': specialty 
          ? `En Doctor.mx puedes encontrar los mejores especialistas en ${specialty.name} en ${location.name}, filtrados por calificación, experiencia y disponibilidad.`
          : `Doctor.mx te ofrece un directorio completo de médicos en ${location.name}, con opciones de filtrado por especialidad, ubicación, calificaciones y disponibilidad.`
      }
    },
    {
      '@type': 'Question',
      'name': specialty 
        ? `¿Cuánto cuesta una consulta con un ${specialty.name} en ${location.name}?`
        : `¿Qué especialidades médicas están disponibles en ${location.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': specialty 
          ? `Los precios de consulta con especialistas en ${specialty.name} en ${location.name} varían según la experiencia del médico y la ubicación específica. En Doctor.mx puedes comparar precios y servicios.`
          : location.popularSpecialties 
            ? `En ${location.name} encontrarás médicos de diversas especialidades como ${location.popularSpecialties.slice(0, 5).map(s => s.name).join(', ')}, entre otras.`
            : `En ${location.name} encontrarás médicos de diversas especialidades. Utiliza nuestros filtros para encontrar la especialidad que necesitas.`
      }
    },
    {
      '@type': 'Question',
      'name': `¿Puedo agendar una cita médica en línea en ${location.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': `Sí, en Doctor.mx puedes agendar citas médicas en línea con especialistas en ${location.name} de forma rápida y segura, eligiendo el horario que mejor se adapte a tus necesidades.`
      }
    },
    {
      '@type': 'Question',
      'name': `¿Hay médicos disponibles para telemedicina en ${location.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': `Sí, muchos médicos en ${location.name} ofrecen servicios de telemedicina. Puedes filtrar por esta opción en nuestra plataforma para consultas desde la comodidad de tu hogar.`
      }
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://doctor.mx${url}#faq`,
    'mainEntity': faqEntities
  };

  // Generate LocalBusiness Schema if a specialty is selected (more specific context)
  const localBusinessSchema = specialty ? {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://doctor.mx${url}#localbusiness`,
    'name': `${specialty.name} en ${location.name}`,
    'description': `Directorio de especialistas en ${specialty.name} disponibles en ${location.name}`,
    'url': `https://doctor.mx${url}`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': location.name,
      'addressRegion': location.stateCode || 'MX',
      'addressCountry': 'MX'
    },
    ...(location.coordinates && {
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': location.coordinates.lat,
        'longitude': location.coordinates.lng
      }
    }),
    'areaServed': {
      '@type': 'City',
      'name': location.name
    }
  } : null;

  // Combine schemas
  const combinedSchema = [placeSchema, webPageSchema, faqSchema];
  
  if (specialtiesListSchema) {
    combinedSchema.push(specialtiesListSchema);
  }
  
  if (neighborhoodsListSchema) {
    combinedSchema.push(neighborhoodsListSchema);
  }
  
  if (localBusinessSchema) {
    combinedSchema.push(localBusinessSchema);
  }

  return (
    <EnhancedSEO
      title={title}
      description={description}
      canonical={url}
      image={location.image || '/images/locations/default-location.jpg'}
      schema={combinedSchema}
      type="website"
      keywords={`médicos en ${location.name}, doctores ${location.name}, ${specialty ? specialty.name + ' en ' + location.name + ', ' : ''}citas médicas, especialistas, salud, telemedicina`}
      cityTarget={location.name}
      stateTarget={location.stateCode}
      breadcrumbs={breadcrumbs}
      alternateLanguages={[
        { locale: 'es-mx', url: `https://doctor.mx${url}` }
      ]}
    />
  );
};

export default LocationSEO;