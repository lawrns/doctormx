import React from 'react';
import SEO from './SEO';

interface SpecialtySEOProps {
  specialty: {
    name: string;
    description: string;
    relatedConditions?: string[];
    commonProcedures?: string[];
    image?: string;
    slug: string;
  };
}

/**
 * Specialized SEO component for medical specialty pages
 */
const SpecialtySEO: React.FC<SpecialtySEOProps> = ({ specialty }) => {
  const title = `${specialty.name} - Encuentra especialistas en ${specialty.name} | Doctor.mx`;
  const description = `Consulta con los mejores especialistas en ${specialty.name} en Doctor.mx. ${specialty.description.substring(0, 100)}...`;
  const url = `/especialidades/${specialty.slug}`;

  // Generate MedicalSpecialty Schema
  const specialtySchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalSpecialty',
    name: specialty.name,
    description: specialty.description,
    ...(specialty.image && { image: specialty.image }),
    url: `https://doctor.mx${url}`
  };

  // Generate WebPage Schema with specialty details
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: title,
    description: description,
    url: `https://doctor.mx${url}`,
    mainContentOfPage: {
      '@type': 'WebPageElement',
      cssSelector: '.specialty-content'
    },
    specialty: {
      '@type': 'MedicalSpecialty',
      name: specialty.name
    }
  };

  // Generate HowTo Schema for finding the right specialist
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Cómo encontrar un especialista en ${specialty.name}`,
    description: `Guía paso a paso para encontrar al mejor especialista en ${specialty.name} para tus necesidades médicas`,
    step: [
      {
        '@type': 'HowToStep',
        name: 'Buscar especialista',
        text: `Utiliza nuestra herramienta de búsqueda para filtrar por ${specialty.name}`
      },
      {
        '@type': 'HowToStep',
        name: 'Revisar credenciales',
        text: 'Verifica la formación, experiencia y reseñas de los especialistas'
      },
      {
        '@type': 'HowToStep',
        name: 'Agendar cita',
        text: 'Elige el horario disponible que mejor se adapte a tus necesidades'
      }
    ]
  };

  // Generate FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `¿Qué es la especialidad de ${specialty.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: specialty.description.substring(0, 200)
        }
      },
      {
        '@type': 'Question',
        name: `¿Cuándo debo consultar con un especialista en ${specialty.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: specialty.relatedConditions 
            ? `Es recomendable consultar con un especialista en ${specialty.name} si presentas condiciones como: ${specialty.relatedConditions.join(', ')}.`
            : `Consulta con tu médico general para determinar si necesitas una referencia a un especialista en ${specialty.name}.`
        }
      },
      {
        '@type': 'Question',
        name: `¿Qué procedimientos realiza un especialista en ${specialty.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: specialty.commonProcedures
            ? `Los especialistas en ${specialty.name} comúnmente realizan: ${specialty.commonProcedures.join(', ')}.`
            : `Los especialistas en ${specialty.name} realizan diferentes procedimientos diagnósticos y terapéuticos según tus necesidades médicas específicas.`
        }
      }
    ]
  };

  return (
    <SEO
      title={title}
      description={description}
      canonical={url}
      image={specialty.image || '/placeholders/specialty-default.jpg'}
      schema={{
        '@context': 'https://schema.org',
        '@graph': [specialtySchema, webPageSchema, howToSchema, faqSchema]
      }}
      type="article"
    />
  );
};

export default SpecialtySEO;