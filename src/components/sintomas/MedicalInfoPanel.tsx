import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, BookOpen, AlertTriangle, Info, Link } from 'lucide-react';

interface MedicalTerm {
  term: string;
  definition: string;
}

interface RelatedCondition {
  name: string;
  description: string;
  probability?: 'high' | 'medium' | 'low';
  link?: string;
}

interface MedicalResource {
  title: string;
  description: string;
  url: string;
  type: 'article' | 'video' | 'tool' | 'organization';
}

interface MedicalInfoPanelProps {
  symptomId: string;
  symptomName: string;
  medicalTerms?: MedicalTerm[];
  relatedConditions?: RelatedCondition[];
  preventionTips?: string[];
  resources?: MedicalResource[];
  warningMessage?: string;
}

const MedicalInfoPanel: React.FC<MedicalInfoPanelProps> = ({
  symptomId,
  symptomName,
  medicalTerms = [],
  relatedConditions = [],
  preventionTips = [],
  resources = [],
  warningMessage
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'terms': true,
    'conditions': true,
    'prevention': false,
    'resources': false
  });

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Clinical information by symptom type
  const getSymptomInfo = () => {
    switch (symptomId) {
      case 'headache':
        return {
          description: 'El dolor de cabeza es uno de los síntomas más comunes que experimentan las personas. Puede variar desde una molestia leve hasta un dolor intenso y debilitante. Los dolores de cabeza pueden ocurrir en diferentes partes de la cabeza y pueden tener diversas causas.',
          anatomy: 'Los dolores de cabeza pueden involucrar los nervios, vasos sanguíneos, músculos del cuello y cabeza, y las meninges (membranas que cubren el cerebro y la médula espinal).'
        };
      case 'chest_pain':
        return {
          description: 'El dolor torácico o de pecho puede manifestarse como presión, opresión, dolor punzante o ardor en el pecho. Aunque puede causar alarma por su posible relación con problemas cardíacos, muchas causas de dolor torácico no son graves.',
          anatomy: 'El dolor puede originarse en estructuras como el corazón, pulmones, esófago, músculos, costillas o nervios de la región torácica.'
        };
      case 'abdominal_pain':
        return {
          description: 'El dolor abdominal es cualquier dolor que se siente entre el pecho y la ingle. Puede manifestarse como un dolor sordo, punzante, calambres o sensación de hinchazón, y puede variar desde leve hasta severo.',
          anatomy: 'El abdomen contiene órganos importantes como el estómago, intestinos, hígado, vesícula biliar, páncreas y órganos reproductivos en las mujeres.'
        };
      case 'back_pain':
        return {
          description: 'El dolor de espalda es un malestar que puede sentirse en cualquier parte de la espalda, desde el cuello hasta la región lumbar. Puede ser constante o aparecer repentinamente, y variar de intensidad.',
          anatomy: 'La espalda está formada por una compleja estructura de músculos, ligamentos, tendones, discos y vértebras que trabajan juntos para soportar el cuerpo y permitir el movimiento.'
        };
      default:
        return {
          description: `${symptomName} es un síntoma que puede indicar diversas condiciones médicas. Es importante monitorizar su frecuencia, intensidad y factores desencadenantes.`,
          anatomy: 'Los síntomas pueden involucrar diferentes sistemas del cuerpo y pueden variar en intensidad y duración.'
        };
    }
  };

  const symptomInfo = getSymptomInfo();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-blue-50 p-6 border-b border-blue-100">
        <h3 className="text-xl font-semibold text-blue-900 mb-2">{symptomName}</h3>
        <p className="text-blue-800">{symptomInfo.description}</p>
      </div>

      {warningMessage && (
        <div className="bg-amber-50 p-4 border-b border-amber-100">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-amber-800">{warningMessage}</p>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Anatomical Information */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Información Anatómica</h4>
          <p className="text-gray-700 mb-4">{symptomInfo.anatomy}</p>
        </div>

        {/* Medical Terms */}
        {medicalTerms.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('terms')}
              className="flex items-center justify-between w-full text-left mb-2"
            >
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <BookOpen size={18} className="mr-2 text-blue-600" />
                Terminología Médica
              </h4>
              {expandedSections.terms ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSections.terms && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <dl className="space-y-2">
                  {medicalTerms.map((term, index) => (
                    <div key={index} className={index > 0 ? "pt-2 border-t border-gray-200" : ""}>
                      <dt className="font-medium text-gray-900">{term.term}</dt>
                      <dd className="text-gray-700">{term.definition}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}

        {/* Related Conditions */}
        {relatedConditions.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('conditions')}
              className="flex items-center justify-between w-full text-left mb-2"
            >
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <Link size={18} className="mr-2 text-blue-600" />
                Condiciones Relacionadas
              </h4>
              {expandedSections.conditions ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSections.conditions && (
              <div className="space-y-3 mb-4">
                {relatedConditions.map((condition, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">{condition.name}</h5>
                      {condition.probability && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          condition.probability === 'high' 
                            ? 'bg-red-100 text-red-800'
                            : condition.probability === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {condition.probability === 'high' ? 'Común' : 
                           condition.probability === 'medium' ? 'Moderada' : 'Menos común'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{condition.description}</p>
                    {condition.link && (
                      <a 
                        href={condition.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        Más información <ExternalLink size={14} className="ml-1" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prevention Tips */}
        {preventionTips.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('prevention')}
              className="flex items-center justify-between w-full text-left mb-2"
            >
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <Info size={18} className="mr-2 text-blue-600" />
                Consejos de Prevención
              </h4>
              {expandedSections.prevention ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSections.prevention && (
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <ul className="space-y-2">
                  {preventionTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2"></span>
                      <span className="text-green-800">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('resources')}
              className="flex items-center justify-between w-full text-left mb-2"
            >
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <ExternalLink size={18} className="mr-2 text-blue-600" />
                Recursos Adicionales
              </h4>
              {expandedSections.resources ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSections.resources && (
              <div className="space-y-3 mb-4">
                {resources.map((resource, index) => (
                  <a 
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {resource.type === 'article' && (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen size={16} className="text-blue-600" />
                          </div>
                        )}
                        {resource.type === 'video' && (
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                          </div>
                        )}
                        {resource.type === 'tool' && (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                          </div>
                        )}
                        {resource.type === 'organization' && (
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">{resource.title}</h5>
                        <p className="text-gray-700 text-sm">{resource.description}</p>
                        <div className="mt-1 text-blue-600 hover:text-blue-800 text-sm flex items-center">
                          Visitar recurso <ExternalLink size={14} className="ml-1" />
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-200">
          <p>
            Esta información es de carácter educativo y no sustituye el consejo médico profesional.
          </p>
        </div>
      </div>
    </div>
  );
};

// Example medical terms, conditions, and resources by symptom type
export const getMedicalInfo = (symptomId: string, symptomName: string) => {
  let medicalTerms: MedicalTerm[] = [];
  let relatedConditions: RelatedCondition[] = [];
  let preventionTips: string[] = [];
  let resources: MedicalResource[] = [];
  let warningMessage: string | undefined;

  switch(symptomId) {
    case 'headache':
      medicalTerms = [
        { term: 'Cefalea', definition: 'Término médico para el dolor de cabeza.' },
        { term: 'Migraña', definition: 'Tipo de cefalea que puede causar dolor intenso o pulsátil, a menudo en un lado de la cabeza.' },
        { term: 'Cefalea tensional', definition: 'El tipo más común de dolor de cabeza, caracterizado por dolor sordo, de presión o de banda apretada.' },
        { term: 'Aura', definition: 'Síntomas neurológicos, como destellos de luz o entumecimiento, que pueden preceder a una migraña.' }
      ];
      
      relatedConditions = [
        { 
          name: 'Migraña', 
          description: 'Dolor de cabeza intenso, generalmente unilateral, pulsátil, que puede estar acompañado de náuseas, vómitos y sensibilidad a la luz y sonido.',
          probability: 'high',
          link: 'https://www.mayoclinic.org/es-es/diseases-conditions/migraine-headache/symptoms-causes/syc-20360201'
        },
        { 
          name: 'Cefalea tensional', 
          description: 'Dolor de cabeza bilateral, no pulsátil, descrito como una presión o tensión alrededor de la cabeza. Suele estar relacionado con el estrés y la tensión muscular.',
          probability: 'high',
          link: 'https://www.mayoclinic.org/es-es/diseases-conditions/tension-headache/symptoms-causes/syc-20353977'
        },
        { 
          name: 'Sinusitis', 
          description: 'Inflamación de los senos paranasales que puede causar dolor facial, congestión nasal y secreción nasal.',
          probability: 'medium',
          link: 'https://www.mayoclinic.org/es-es/diseases-conditions/sinusitis/symptoms-causes/syc-20377580'
        },
        { 
          name: 'Cefalea en racimos', 
          description: 'Dolor intenso, penetrante, generalmente detrás o alrededor de un ojo, que ocurre en ciclos o racimos.',
          probability: 'low',
          link: 'https://www.mayoclinic.org/es-es/diseases-conditions/cluster-headache/symptoms-causes/syc-20352080'
        }
      ];
      
      preventionTips = [
        'Mantener un horario regular de sueño',
        'Mantenerse hidratado bebiendo suficiente agua',
        'Practicar técnicas de manejo del estrés como la meditación o el yoga',
        'Hacer ejercicio regularmente',
        'Evitar desencadenantes conocidos como ciertos alimentos o bebidas',
        'Limitar el consumo de cafeína y alcohol',
        'Mantener una postura adecuada, especialmente al usar computadoras'
      ];
      
      resources = [
        {
          title: 'Guía sobre dolores de cabeza - Mayo Clinic',
          description: 'Información detallada sobre tipos, causas y tratamientos de dolores de cabeza.',
          url: 'https://www.mayoclinic.org/es-es/diseases-conditions/headache/symptoms-causes/syc-20372037',
          type: 'article'
        },
        {
          title: 'Sociedad Española de Neurología',
          description: 'Recursos y directrices sobre manejo de cefaleas y migrañas.',
          url: 'https://www.sen.es/profesional/guias-y-protocolos',
          type: 'organization'
        },
        {
          title: 'Aplicación de seguimiento de dolores de cabeza',
          description: 'Herramienta para registrar y analizar tus dolores de cabeza y posibles desencadenantes.',
          url: 'https://www.migrainebuddy.com/',
          type: 'tool'
        }
      ];

      warningMessage = 'Busca atención médica inmediata si experimentas un dolor de cabeza repentino e intenso ("el peor dolor de cabeza de tu vida"), acompañado de fiebre, rigidez de cuello, confusión, convulsiones, visión doble, debilidad, entumecimiento o dificultad para hablar.';
      break;
      
    case 'chest_pain':
      medicalTerms = [
        { term: 'Angina de pecho', definition: 'Dolor o molestia en el pecho debido a la reducción temporal del flujo sanguíneo al músculo cardíaco.' },
        { term: 'Infarto de miocardio', definition: 'Término médico para un ataque cardíaco, donde el flujo sanguíneo a una parte del corazón se bloquea.' },
        { term: 'Costocondritis', definition: 'Inflamación del cartílago que une las costillas al esternón.' },
        { term: 'Reflujo gastroesofágico', definition: 'Afección en la que el ácido del estómago fluye de regreso al esófago, causando irritación.' }
      ];
      
      relatedConditions = [
        { 
          name: 'Enfermedad coronaria', 
          description: 'Estrechamiento de las arterias coronarias que suministran sangre al corazón, que puede causar angina (dolor de pecho).',
          probability: 'medium',
          link: 'https://www.mayoclinic.org/es-es/diseases-conditions/coronary-artery-disease/symptoms-causes/syc-20350613'
        },
        { 
          name: 'Reflujo gastroesofágico (ERGE)', 
          description: 'Condición en la que el ácido del estómago fluye de regreso al esófago, causando irritación y a veces dolor similar al cardíaco.',
          probability: 'high',
          link: 'https://www.mayoclinic.org/es-es/diseases-conditions/gerd/symptoms-causes/syc-20361940'
        },
        { 
          name: 'Costocondritis', 
          description: 'Inflamación del cartílago que une las costillas al esternón, causando dolor en el pecho que puede empeorar con la respiración profunda.',
          probability: 'medium',
          link: 'https://www.mayoclinic.org/es-es/diseases-conditions/costochondritis/symptoms-causes/syc-20371175'
        },
        { 
          name: 'Ansiedad', 
          description: 'Los ataques de pánico y la ansiedad pueden manifestarse como dolor o presión en el pecho, palpitaciones y dificultad para respirar.',
          probability: 'high',
          link: 'https://www.mayoclinic.org/es-es/diseases-conditions/anxiety/symptoms-causes/syc-20350961'
        }
      ];
      
      preventionTips = [
        'Mantener una dieta saludable baja en grasas saturadas y rica en frutas, verduras y granos enteros',
        'Realizar actividad física regular según las recomendaciones de su médico',
        'Mantener un peso saludable',
        'Evitar el tabaco y limitar el consumo de alcohol',
        'Controlar el estrés con técnicas de relajación',
        'Para el reflujo, evitar comer antes de acostarse y elevar la cabecera de la cama',
        'Controlar condiciones como hipertensión, diabetes y colesterol alto'
      ];
      
      resources = [
        {
          title: 'Fundación Española del Corazón',
          description: 'Información sobre salud cardiovascular, prevención y tratamiento de enfermedades cardíacas.',
          url: 'https://fundaciondelcorazon.com/',
          type: 'organization'
        },
        {
          title: 'Cómo reconocer un ataque cardíaco - Video educativo',
          description: 'Signos y síntomas de un ataque cardíaco y cuándo buscar ayuda médica.',
          url: 'https://www.youtube.com/watch?v=t7wmPWTnDbE',
          type: 'video'
        },
        {
          title: 'American Heart Association - Herramienta de evaluación de riesgo cardíaco',
          description: 'Calculadora para estimar su riesgo de enfermedad cardiovascular.',
          url: 'https://www.heart.org/en/health-topics/heart-attack/understand-your-risks-to-prevent-a-heart-attack',
          type: 'tool'
        }
      ];

      warningMessage = 'Si experimentas dolor en el pecho intenso, presión, opresión o dolor que se irradia al brazo, mandíbula o espalda, especialmente si está acompañado de dificultad para respirar, náuseas o sudoración, busca atención médica de emergencia inmediatamente. Podría ser un signo de un ataque cardíaco.';
      break;
      
    // Add more cases for other symptom types...
      
    default:
      medicalTerms = [
        { term: 'Síntoma', definition: 'Una alteración física o mental que indica la presencia de una enfermedad o condición.' },
        { term: 'Signos vitales', definition: 'Mediciones de las funciones corporales básicas, como temperatura, presión arterial, pulso y frecuencia respiratoria.' },
        { term: 'Agudo', definition: 'Síntoma que aparece repentinamente y suele ser severo pero de corta duración.' },
        { term: 'Crónico', definition: 'Síntoma que persiste durante un largo período de tiempo, generalmente más de tres meses.' }
      ];
      
      relatedConditions = [
        { 
          name: 'Condiciones comunes', 
          description: 'Diversas condiciones pueden manifestarse con este síntoma. Es importante consultar con un profesional para un diagnóstico adecuado.',
          probability: 'medium'
        }
      ];
      
      preventionTips = [
        'Mantener un estilo de vida saludable con ejercicio regular',
        'Alimentación equilibrada rica en frutas, verduras y granos enteros',
        'Dormir suficientes horas (7-8 horas para un adulto)',
        'Manejo adecuado del estrés',
        'Evitar el tabaco y limitar el consumo de alcohol'
      ];
      
      resources = [
        {
          title: 'Organización Mundial de la Salud',
          description: 'Recursos y guías sobre salud y bienestar general.',
          url: 'https://www.who.int/es',
          type: 'organization'
        },
        {
          title: 'MedlinePlus - Biblioteca Nacional de Medicina de EE.UU.',
          description: 'Información confiable y actualizada sobre enfermedades, condiciones y bienestar.',
          url: 'https://medlineplus.gov/spanish/',
          type: 'article'
        }
      ];
  }

  return {
    symptomId,
    symptomName,
    medicalTerms,
    relatedConditions,
    preventionTips,
    resources,
    warningMessage
  };
};

export default MedicalInfoPanel;