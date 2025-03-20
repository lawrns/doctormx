import React from 'react';
import EnhancedSEO from './EnhancedSEO';

interface ConditionData {
  id: string;
  name: string;
  description: string;
  slug: string;
  symptoms?: string[];
  causes?: string[];
  treatments?: string[];
  specialties?: string[];
  riskFactors?: string[];
  diagnosis?: string[];
  prevention?: string[];
  complications?: string[];
  relatedConditions?: string[];
  faqs?: Array<{question: string; answer: string}>;
  image?: string;
  prevalence?: string;
  severity?: string;
  affectedDemographics?: string;
  doctorCount?: number;
  medicalArticles?: Array<{title: string; url: string; author: string; date: string}>;
}

interface MedicalConditionSEOProps {
  condition: ConditionData;
  location?: {
    name: string;
    slug: string;
    state?: string;
  };
}

/**
 * Specialized SEO component for medical condition pages
 * Optimized for condition information and specialty matching
 */
const MedicalConditionSEO: React.FC<MedicalConditionSEOProps> = ({ condition, location }) => {
  // Build URL based on whether this is condition-only or condition+location
  const url = location 
    ? `/padecimiento/${condition.slug}/${location.slug}` 
    : `/padecimiento/${condition.slug}`;
  
  // Create optimized title
  const title = location 
    ? `${condition.name} - Médicos especialistas en ${location.name} | Doctor.mx`
    : `${condition.name} - Síntomas, Causas, Tratamientos y Especialistas | Doctor.mx`;
  
  // Create optimized meta description
  const baseDescription = `Información completa sobre ${condition.name}: ${condition.description.substring(0, 80)}...`;
  const specialtiesText = condition.specialties 
    ? `Consulta con especialistas en ${condition.specialties.slice(0, 2).join(' o ')}.` 
    : '';
  const symptomsText = condition.symptoms 
    ? `Síntomas: ${condition.symptoms.slice(0, 3).join(', ')}.` 
    : '';
  
  const description = location
    ? `${baseDescription} Encuentra médicos para ${condition.name} en ${location.name}. ${specialtiesText}`
    : `${baseDescription} ${symptomsText} ${specialtiesText} Agenda una cita hoy.`;
  
  // Generate breadcrumbs
  const breadcrumbs = location 
    ? [
        { name: 'Padecimientos', url: '/padecimientos' },
        { name: condition.name, url: `/padecimiento/${condition.slug}` },
        { name: location.name, url: url }
      ]
    : [
        { name: 'Padecimientos', url: '/padecimientos' },
        { name: condition.name, url: url }
      ];

  // Generate MedicalCondition Schema
  const conditionSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    '@id': `https://doctor.mx${url}#condition`,
    'name': condition.name,
    'description': condition.description,
    ...(condition.symptoms && {
      'signOrSymptom': condition.symptoms.map(symptom => ({
        '@type': 'MedicalSymptom',
        'name': symptom
      }))
    }),
    ...(condition.treatments && {
      'possibleTreatment': condition.treatments.map(treatment => ({
        '@type': 'MedicalTherapy',
        'name': treatment
      }))
    }),
    ...(condition.causes && {
      'cause': condition.causes.map(cause => ({
        '@type': 'MedicalCause',
        'name': cause
      }))
    }),
    ...(condition.riskFactors && {
      'riskFactor': condition.riskFactors
    }),
    ...(condition.specialties && {
      'relevantSpecialty': condition.specialties.map(specialty => ({
        '@type': 'MedicalSpecialty',
        'name': specialty
      }))
    }),
    ...(condition.relatedConditions && {
      'associatedPathophysiology': condition.relatedConditions.join(', ')
    }),
    ...(condition.prevalence && { 'epidemiology': condition.prevalence }),
    ...(condition.severity && { 'pathophysiology': `Severidad: ${condition.severity}` }),
    ...(condition.image && { 'image': condition.image })
  };

  // Generate WebPage Schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `https://doctor.mx${url}#webpage`,
    'name': title,
    'description': description,
    'url': `https://doctor.mx${url}`,
    'lastReviewed': new Date().toISOString(),
    'mainContentOfPage': {
      '@type': 'WebPageElement',
      'cssSelector': '.condition-content'
    },
    'about': {
      '@type': 'MedicalCondition',
      'name': condition.name
    }
  };

  // Generate FAQ Schema
  const faqEntities = condition.faqs ? condition.faqs.map(faq => ({
    '@type': 'Question',
    'name': faq.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.answer
    }
  })) : [
    {
      '@type': 'Question',
      'name': `¿Cuáles son los síntomas de ${condition.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': condition.symptoms 
          ? `Los síntomas comunes de ${condition.name} incluyen: ${condition.symptoms.join(', ')}.`
          : `Consulta la sección de síntomas para información detallada sobre ${condition.name}.`
      }
    },
    {
      '@type': 'Question',
      'name': `¿Qué especialista debo consultar para ${condition.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': condition.specialties 
          ? `Para ${condition.name}, es recomendable consultar con un especialista en ${condition.specialties.join(' o ')}.`
          : `En Doctor.mx puedes encontrar el especialista adecuado para tratar ${condition.name}.`
      }
    },
    {
      '@type': 'Question',
      'name': `¿Cuáles son los tratamientos para ${condition.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': condition.treatments 
          ? `Los tratamientos comunes para ${condition.name} incluyen: ${condition.treatments.join(', ')}.`
          : `Consulta con un especialista para conocer los tratamientos adecuados para ${condition.name}.`
      }
    },
    {
      '@type': 'Question',
      'name': `¿Cómo se previene ${condition.name}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': condition.prevention 
          ? `La prevención de ${condition.name} incluye: ${condition.prevention.join(', ')}.`
          : `Consulta con un médico para obtener recomendaciones personalizadas sobre la prevención de ${condition.name}.`
      }
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://doctor.mx${url}#faq`,
    'mainEntity': faqEntities
  };

  // Generate MedicalWebPage with HowTo for finding specialists
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `https://doctor.mx${url}#howto`,
    'name': `Cómo encontrar un especialista para ${condition.name}${location ? ` en ${location.name}` : ''}`,
    'description': `Pasos para encontrar y agendar una cita con un médico especialista en el tratamiento de ${condition.name}${location ? ` en ${location.name}` : ''}`,
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Identificar especialidad',
        'text': condition.specialties 
          ? `Para ${condition.name}, busca especialistas en ${condition.specialties.join(' o ')}`
          : `Identifica la especialidad médica adecuada para el tratamiento de ${condition.name}`
      },
      {
        '@type': 'HowToStep',
        'name': 'Usar el buscador de Doctor.mx',
        'text': `Utiliza nuestro buscador especializado para encontrar médicos que traten ${condition.name}${location ? ` en ${location.name}` : ''}`
      },
      {
        '@type': 'HowToStep',
        'name': 'Comparar opciones',
        'text': 'Revisa perfiles, experiencia, reseñas y precios para encontrar el médico adecuado'
      },
      {
        '@type': 'HowToStep',
        'name': 'Agendar cita',
        'text': 'Selecciona un horario disponible y reserva tu cita en línea de forma segura'
      }
    ]
  };

  // If there are medical articles, add those as references
  const medicalArticlesSchema = condition.medicalArticles && condition.medicalArticles.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `https://doctor.mx${url}#articlesList`,
    'name': `Artículos médicos sobre ${condition.name}`,
    'itemListElement': condition.medicalArticles.map((article, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'MedicalScholarlyArticle',
        'headline': article.title,
        'url': article.url,
        'author': {
          '@type': 'Person',
          'name': article.author
        },
        'datePublished': article.date,
        'about': {
          '@type': 'MedicalCondition',
          'name': condition.name
        }
      }
    }))
  } : null;

  // Combine schemas appropriately
  const combinedSchema = [conditionSchema, webPageSchema, howToSchema, faqSchema];
  if (medicalArticlesSchema) {
    combinedSchema.push(medicalArticlesSchema);
  }

  return (
    <EnhancedSEO
      title={title}
      description={description}
      canonical={url}
      image={condition.image || '/images/conditions/default-condition.jpg'}
      schema={combinedSchema}
      type="article"
      keywords={`${condition.name}, síntomas, tratamiento, causas, ${condition.specialties ? condition.specialties.join(', ') : 'especialistas'}, ${location ? location.name + ', ' : ''}salud, enfermedad, padecimiento`}
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

export default MedicalConditionSEO;