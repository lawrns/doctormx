import React from 'react';
import EnhancedSEO from './EnhancedSEO';

interface SpecialtyData {
  id: string;
  name: string;
  description: string;
  slug: string;
  relatedConditions?: string[];
  commonProcedures?: string[];
  faqs?: Array<{question: string; answer: string}>;
  image?: string;
  doctorCount?: number;
  averageRating?: number;
  averagePrice?: number;
  locationCounts?: Array<{location: string; count: number}>;
  locationSlug?: string;
  topDoctors?: Array<{id: string; name: string; rating: number}>;
}

interface SpecialtySEOProps {
  specialty: SpecialtyData;
  location?: {
    name: string;
    slug: string;
    state?: string;
  };
}

/**
 * Specialized SEO component for medical specialty pages
 * Optimized for specialty landing pages and specialty+location pages
 */
const SpecialtySEO: React.FC<SpecialtySEOProps> = ({ specialty, location }) => {
  // Build appropriate URL based on whether this is a specialty-only or specialty+location page
  const url = location 
    ? `/especialidad/${specialty.slug}/${location.slug}` 
    : `/especialidad/${specialty.slug}`;
  
  // Create optimized title
  const title = location 
    ? `Mejores ${specialty.name} en ${location.name} (${specialty.doctorCount || '10+'}+ Especialistas) | Doctor.mx`
    : `Mejores ${specialty.name} en México | Especialistas en ${specialty.name} | Doctor.mx`;
  
  // Create optimized meta description
  const description = location
    ? `Encuentra los mejores especialistas en ${specialty.name} en ${location.name}. ${specialty.doctorCount || 'Múltiples'} médicos disponibles, desde $${specialty.averagePrice || 500}. Calificación promedio ${specialty.averageRating || 4.5}/5. Agenda tu cita hoy.`
    : `Directorio de especialistas en ${specialty.name} en México. ${specialty.description.substring(0, 80)}... Encuentra al mejor especialista para tus necesidades y agenda tu cita online.`;
  
  // Generate breadcrumbs
  const breadcrumbs = location 
    ? [
        { name: 'Especialidades', url: '/especialidades' },
        { name: specialty.name, url: `/especialidad/${specialty.slug}` },
        { name: location.name, url: url }
      ]
    : [
        { name: 'Especialidades', url: '/especialidades' },
        { name: specialty.name, url: url }
      ];

  // Generate MedicalSpecialty Schema
  const specialtySchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalSpecialty',
    '@id': `https://doctor.mx${url}#specialty`,
    'name': specialty.name,
    'description': specialty.description,
    ...(specialty.image && { image: specialty.image }),
    'url': `https://doctor.mx${url}`
  };

  // Generate WebPage Schema with specialty details
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `https://doctor.mx${url}#webpage`,
    'name': title,
    'description': description,
    'url': `https://doctor.mx${url}`,
    'mainContentOfPage': {
      '@type': 'WebPageElement',
      'cssSelector': '.specialty-content'
    },
    'specialty': {
      '@type': 'MedicalSpecialty',
      'name': specialty.name
    },
    'about': {
      '@type': 'MedicalSpecialty',
      'name': specialty.name,
      'description': specialty.description
    }
  };

  // Generate HowTo Schema for finding the right specialist
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `https://doctor.mx${url}#howto`,
    'name': `Cómo encontrar un especialista en ${specialty.name}${location ? ` en ${location.name}` : ''}`,
    'description': `Guía paso a paso para encontrar al mejor especialista en ${specialty.name}${location ? ` en ${location.name}` : ''} para tus necesidades médicas`,
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Buscar especialista',
        'text': `Utiliza nuestra herramienta de búsqueda para filtrar por ${specialty.name}${location ? ` en ${location.name}` : ''}`
      },
      {
        '@type': 'HowToStep',
        'name': 'Revisar credenciales',
        'text': 'Verifica la formación, experiencia y reseñas de los especialistas'
      },
      {
        '@type': 'HowToStep',
        'name': 'Verificar disponibilidad',
        'text': 'Comprueba los horarios disponibles que se adapten a tu agenda'
      },
      {
        '@type': 'HowToStep',
        'name': 'Agendar cita',
        'text': 'Selecciona el horario y completa tu reserva en línea de forma segura'
      }
    ]
  };

  // Generate FAQ Schema - use provided FAQs or generate default ones
  const faqEntities = specialty.faqs ? specialty.faqs.map(faq => ({
    '@type': 'Question',
    'name': faq.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.answer
    }
  })) : [
    {
      '@type': 'Question',
      'name': `¿Qué es la especialidad de ${specialty.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': specialty.description.substring(0, 200)
      }
    },
    {
      '@type': 'Question',
      'name': `¿Cuándo debo consultar con un especialista en ${specialty.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': specialty.relatedConditions 
          ? `Es recomendable consultar con un especialista en ${specialty.name} si presentas condiciones como: ${specialty.relatedConditions.join(', ')}.`
          : `Consulta con tu médico general para determinar si necesitas una referencia a un especialista en ${specialty.name}.`
      }
    },
    {
      '@type': 'Question',
      'name': `¿Qué procedimientos realiza un especialista en ${specialty.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': specialty.commonProcedures
          ? `Los especialistas en ${specialty.name} comúnmente realizan: ${specialty.commonProcedures.join(', ')}.`
          : `Los especialistas en ${specialty.name} realizan diferentes procedimientos diagnósticos y terapéuticos según tus necesidades médicas específicas.`
      }
    },
    {
      '@type': 'Question',
      'name': location 
        ? `¿Cuánto cuesta una consulta con un especialista en ${specialty.name} en ${location.name}?`
        : `¿Cuánto cuesta una consulta con un especialista en ${specialty.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': specialty.averagePrice 
          ? `El precio promedio de una consulta con un especialista en ${specialty.name}${location ? ` en ${location.name}` : ''} es de $${specialty.averagePrice} MXN, aunque puede variar según el médico y su experiencia.`
          : `Los precios de consulta con especialistas en ${specialty.name} varían según la experiencia del médico y la ubicación. Consulta los perfiles individuales para obtener información precisa sobre los precios.`
      }
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://doctor.mx${url}#faq`,
    'mainEntity': faqEntities
  };

  // If location is provided, add local business listing schema
  const localBusinessSchema = location ? {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://doctor.mx${url}#localbusiness`,
    'name': `Especialistas en ${specialty.name} en ${location.name}`,
    'description': `Directorio de especialistas en ${specialty.name} disponibles en ${location.name}`,
    'url': `https://doctor.mx${url}`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': location.name,
      'addressRegion': location.state || 'MX',
      'addressCountry': 'MX'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '19.4326',
      'longitude': '-99.1332'
    },
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': `Servicios de ${specialty.name} en ${location.name}`,
      'itemListElement': [
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': `Consulta de ${specialty.name}`,
            ...(specialty.averagePrice && { 'price': specialty.averagePrice, 'priceCurrency': 'MXN' })
          }
        },
        ...(specialty.commonProcedures ? specialty.commonProcedures.slice(0, 3).map(procedure => ({
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': procedure
          }
        })) : [])
      ]
    }
  } : null;

  // Combine schemas appropriately
  const combinedSchema = [specialtySchema, webPageSchema, howToSchema, faqSchema];
  if (localBusinessSchema) {
    combinedSchema.push(localBusinessSchema);
  }

  return (
    <EnhancedSEO
      title={title}
      description={description}
      canonical={url}
      image={specialty.image || '/images/specialties/default-specialty.jpg'}
      schema={combinedSchema}
      type="article"
      keywords={`${specialty.name}, especialista, médico, doctor, ${location ? location.name + ', ' : ''}citas médicas, ${specialty.relatedConditions ? specialty.relatedConditions.join(', ') : ''}`}
      cityTarget={location?.name}
      stateTarget={location?.state}
      breadcrumbs={breadcrumbs}
      publishedTime="2023-01-01T12:00:00Z"
      modifiedTime={new Date().toISOString()}
      alternateLanguages={[
        { locale: 'es-mx', url: `https://doctor.mx${url}` }
      ]}
    />
  );
};

export default SpecialtySEO;