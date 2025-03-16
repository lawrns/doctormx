import React from 'react';
import SEO from './SEO';

interface MedicalConditionSEOProps {
  condition: {
    name: string;
    description: string;
    symptoms?: string[];
    treatments?: string[];
    specialties?: string[];
    image?: string;
  };
  url: string;
}

/**
 * Specialized SEO component for medical condition pages
 */
const MedicalConditionSEO: React.FC<MedicalConditionSEOProps> = ({ condition, url }) => {
  const title = `${condition.name} - Síntomas, tratamientos y especialistas | Doctor.mx`;
  const description = `Información sobre ${condition.name}: síntomas, tratamientos recomendados y especialistas en Doctor.mx. ${condition.description.substring(0, 100)}...`;

  // Generate MedicalCondition Schema
  const conditionSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: condition.name,
    description: condition.description,
    ...(condition.symptoms && {
      signOrSymptom: condition.symptoms.map(symptom => ({
        '@type': 'MedicalSymptom',
        name: symptom
      }))
    }),
    ...(condition.treatments && {
      possibleTreatment: condition.treatments.map(treatment => ({
        '@type': 'MedicalTherapy',
        name: treatment
      }))
    }),
    ...(condition.specialties && {
      relevantSpecialty: condition.specialties.map(specialty => ({
        '@type': 'MedicalSpecialty',
        name: specialty
      }))
    }),
    ...(condition.image && { image: condition.image })
  };

  // Generate FAQ Schema for common questions about the condition
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `¿Cuáles son los síntomas de ${condition.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: condition.symptoms 
            ? `Los síntomas comunes de ${condition.name} incluyen: ${condition.symptoms.join(', ')}.`
            : `Consulta la sección de síntomas para información detallada sobre ${condition.name}.`
        }
      },
      {
        '@type': 'Question',
        name: `¿Qué especialista debo consultar para ${condition.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: condition.specialties 
            ? `Para ${condition.name}, es recomendable consultar con un especialista en ${condition.specialties.join(' o ')}.`
            : `En Doctor.mx puedes encontrar el especialista adecuado para tratar ${condition.name}.`
        }
      },
      {
        '@type': 'Question',
        name: `¿Cuáles son los tratamientos para ${condition.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: condition.treatments 
            ? `Los tratamientos comunes para ${condition.name} incluyen: ${condition.treatments.join(', ')}.`
            : `Consulta con un especialista para conocer los tratamientos adecuados para ${condition.name}.`
        }
      }
    ]
  };

  return (
    <SEO
      title={title}
      description={description}
      canonical={url}
      image={condition.image || '/placeholders/condition-default.jpg'}
      schema={{
        '@context': 'https://schema.org',
        '@graph': [conditionSchema, faqSchema]
      }}
      type="article"
    />
  );
};

export default MedicalConditionSEO;