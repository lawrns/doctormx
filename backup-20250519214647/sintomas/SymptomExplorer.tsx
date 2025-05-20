import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ChevronRight, Map, Tag, Clock, AlertCircle, ThumbsUp, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Symptom {
  id: string;
  name: string;
  description: string;
  bodyRegion: string;
  severity: 'low' | 'moderate' | 'high';
  commonCauses: string[];
  whenToSeek: string;
  tags: string[];
}

interface SymptomCategory {
  id: string;
  name: string;
  description: string;
  symptoms: Symptom[];
  icon: React.ReactNode;
}

interface SymptomExplorerProps {
  initialCategory?: string;
  onSelectSymptom?: (symptom: Symptom) => void;
}

const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'head_neck',
    name: 'Cabeza y Cuello',
    description: 'Síntomas relacionados con la cabeza, cara, ojos, oídos, nariz, boca y cuello.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"></circle>
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"></path>
    </svg>,
    symptoms: [
      {
        id: 'headache',
        name: 'Dolor de cabeza',
        description: 'Dolor o molestia en cualquier parte de la cabeza o el cuero cabelludo',
        bodyRegion: 'head',
        severity: 'moderate',
        commonCauses: ['Tensión', 'Estrés', 'Migraña', 'Sinusitis', 'Deshidratación'],
        whenToSeek: 'Busque atención médica si el dolor es intenso y repentino, si viene acompañado de fiebre alta, rigidez de cuello, confusión o después de un golpe en la cabeza.',
        tags: ['dolor', 'neurologico', 'común']
      },
      {
        id: 'sore_throat',
        name: 'Dolor de garganta',
        description: 'Dolor, irritación o sensación de rasguño en la garganta que puede empeorar al tragar',
        bodyRegion: 'neck',
        severity: 'low',
        commonCauses: ['Infección viral', 'Infección bacteriana', 'Alergias', 'Sequedad del aire', 'Reflujo ácido'],
        whenToSeek: 'Busque atención médica si tiene dificultad para respirar o tragar, si el dolor es severo o persiste más de una semana, o si viene acompañado de fiebre alta.',
        tags: ['dolor', 'infección', 'común']
      },
      {
        id: 'dizziness',
        name: 'Mareos',
        description: 'Sensación de aturdimiento, debilidad o inestabilidad que puede incluir vértigo (sensación de que todo gira)',
        bodyRegion: 'head',
        severity: 'moderate',
        commonCauses: ['Problemas del oído interno', 'Bajada de presión arterial', 'Anemia', 'Efectos secundarios de medicamentos', 'Deshidratación'],
        whenToSeek: 'Busque atención médica si los mareos son recurrentes, si ocurren con dolores de cabeza graves, alteraciones visuales, confusión o problemas para hablar.',
        tags: ['neurologico', 'equilibrio', 'sensacion']
      }
    ]
  },
  {
    id: 'chest',
    name: 'Pecho y Respiración',
    description: 'Síntomas relacionados con el pecho, corazón, pulmones y respiración.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>,
    symptoms: [
      {
        id: 'chest_pain',
        name: 'Dolor de pecho',
        description: 'Sensación de dolor, presión, opresión o ardor en el pecho, que puede irradiarse a hombros, brazos, cuello o mandíbula',
        bodyRegion: 'chest',
        severity: 'high',
        commonCauses: ['Problemas cardíacos', 'Reflujo ácido', 'Ansiedad', 'Problemas musculares', 'Problemas pulmonares'],
        whenToSeek: 'El dolor de pecho puede ser signo de un problema grave. Busque atención médica de emergencia si es intenso, repentino o va acompañado de presión, sudoración o dificultad para respirar.',
        tags: ['dolor', 'cardio', 'emergencia']
      },
      {
        id: 'shortness_of_breath',
        name: 'Dificultad para respirar',
        description: 'Sensación de falta de aire, respiración dificultosa o incapacidad para respirar profundamente',
        bodyRegion: 'chest',
        severity: 'high',
        commonCauses: ['Asma', 'Ansiedad', 'Infecciones respiratorias', 'Problemas cardíacos', 'EPOC'],
        whenToSeek: 'Busque atención médica de emergencia si la dificultad respiratoria es grave, aparece repentinamente, o viene acompañada de dolor en el pecho, mareos o labios azulados.',
        tags: ['respiratorio', 'emergencia', 'común']
      },
      {
        id: 'cough',
        name: 'Tos',
        description: 'Expulsión repentina y a menudo repetitiva de aire de los pulmones, que puede ser seca o productiva (con flema)',
        bodyRegion: 'chest',
        severity: 'moderate',
        commonCauses: ['Infecciones respiratorias', 'Asma', 'Alergias', 'Reflujo ácido', 'Irritación de vías respiratorias'],
        whenToSeek: 'Busque atención médica si la tos persiste más de 3 semanas, si hay sangre en la flema, si está acompañada de fiebre alta o dificultad para respirar.',
        tags: ['respiratorio', 'común', 'infección']
      }
    ]
  },
  {
    id: 'abdominal',
    name: 'Abdomen y Digestivo',
    description: 'Síntomas relacionados con el estómago, intestinos, hígado, páncreas y sistema digestivo.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 15.5L7 13.5L5.5 12L7 10.5L6.5 8.5L8.5 8L9.5 6.5L11 7L12.5 5.5L14 7L15.5 6.5L16.5 8L18.5 8.5L18 10.5L19.5 12L18 13.5L18.5 15.5L16.5 16L15.5 17.5L14 16.5L12.5 18L11 16.5L9.5 17.5L8.5 16L6.5 15.5Z"></path>
    </svg>,
    symptoms: [
      {
        id: 'abdominal_pain',
        name: 'Dolor abdominal',
        description: 'Dolor o molestia que se siente en el área entre el pecho y la ingle',
        bodyRegion: 'abdomen',
        severity: 'moderate',
        commonCauses: ['Indigestión', 'Gastritis', 'Síndrome del intestino irritable', 'Gases', 'Estreñimiento'],
        whenToSeek: 'Busque atención médica si el dolor es intenso y repentino, si persiste más de unas horas, si está acompañado de vómitos con sangre o heces negras/con sangre.',
        tags: ['dolor', 'digestivo', 'común']
      },
      {
        id: 'nausea',
        name: 'Náuseas y vómitos',
        description: 'Sensación de malestar en el estómago con deseo de vomitar, o expulsión forzada del contenido del estómago por la boca',
        bodyRegion: 'abdomen',
        severity: 'moderate',
        commonCauses: ['Gastroenteritis', 'Intoxicación alimentaria', 'Migraña', 'Embarazo', 'Efectos secundarios de medicamentos'],
        whenToSeek: 'Busque atención médica si los vómitos persisten más de 24 horas, si hay sangre en el vómito, si está acompañado de fiebre alta o dolor abdominal intenso.',
        tags: ['digestivo', 'común', 'malestar']
      },
      {
        id: 'diarrhea',
        name: 'Diarrea',
        description: 'Deposiciones sueltas o acuosas, generalmente frecuentes',
        bodyRegion: 'abdomen',
        severity: 'moderate',
        commonCauses: ['Infección viral o bacteriana', 'Intoxicación alimentaria', 'Intolerancias alimentarias', 'Efectos secundarios de medicamentos', 'Síndrome del intestino irritable'],
        whenToSeek: 'Busque atención médica si la diarrea persiste más de 2 días, si hay sangre en las heces, si está acompañada de fiebre alta o signos de deshidratación grave.',
        tags: ['digestivo', 'común', 'infección']
      }
    ]
  },
  {
    id: 'back_joint',
    name: 'Espalda y Articulaciones',
    description: 'Síntomas relacionados con la espalda, articulaciones, músculos, huesos y sistema musculoesquelético.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5L17.5 17.5"></path>
      <path d="M6.5 17.5L17.5 6.5"></path>
      <circle cx="6.5" cy="6.5" r="3.5"></circle>
      <circle cx="17.5" cy="6.5" r="3.5"></circle>
      <circle cx="6.5" cy="17.5" r="3.5"></circle>
      <circle cx="17.5" cy="17.5" r="3.5"></circle>
    </svg>,
    symptoms: [
      {
        id: 'back_pain',
        name: 'Dolor de espalda',
        description: 'Dolor en cualquier parte de la espalda, desde el cuello hasta la región lumbar',
        bodyRegion: 'back',
        severity: 'moderate',
        commonCauses: ['Mala postura', 'Tensión muscular', 'Hernia de disco', 'Artritis', 'Lesiones'],
        whenToSeek: 'Busque atención médica si el dolor es intenso y no mejora con descanso, si se irradia a las piernas, o si está acompañado de entumecimiento, debilidad o problemas para controlar vejiga o intestinos.',
        tags: ['dolor', 'musculoesquelético', 'común']
      },
      {
        id: 'joint_pain',
        name: 'Dolor articular',
        description: 'Dolor, rigidez o hinchazón en una o más articulaciones',
        bodyRegion: 'joints',
        severity: 'moderate',
        commonCauses: ['Artritis', 'Lesiones', 'Gota', 'Bursitis', 'Enfermedades autoinmunes'],
        whenToSeek: 'Busque atención médica si hay hinchazón significativa, enrojecimiento o calor en la articulación, si el dolor es intenso, o si impide el movimiento normal.',
        tags: ['dolor', 'musculoesquelético', 'inflamación']
      },
      {
        id: 'muscle_pain',
        name: 'Dolor muscular',
        description: 'Dolor o molestia que afecta a uno o varios músculos del cuerpo',
        bodyRegion: 'muscles',
        severity: 'low',
        commonCauses: ['Sobresfuerzo', 'Tensión', 'Lesiones', 'Infecciones virales', 'Deshidratación'],
        whenToSeek: 'Busque atención médica si el dolor es intenso y aparece sin motivo aparente, si está acompañado de hinchazón o enrojecimiento, o si persiste por más de una semana.',
        tags: ['dolor', 'musculoesquelético', 'común']
      }
    ]
  },
  {
    id: 'general',
    name: 'Síntomas Generales',
    description: 'Síntomas que afectan a todo el cuerpo o que no están localizados en un área específica.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10"></path>
      <path d="M12 20V4"></path>
      <path d="M6 20v-6"></path>
    </svg>,
    symptoms: [
      {
        id: 'fever',
        name: 'Fiebre',
        description: 'Temperatura corporal elevada por encima de lo normal (generalmente por encima de 38°C)',
        bodyRegion: 'general',
        severity: 'moderate',
        commonCauses: ['Infecciones', 'Inflamación', 'Reacciones a medicamentos', 'Enfermedades autoinmunes', 'Cáncer'],
        whenToSeek: 'Busque atención médica si la fiebre supera los 39.4°C, si persiste más de tres días, o si está acompañada de dolor de cabeza intenso, rigidez de cuello, dificultad respiratoria o sarpullido.',
        tags: ['infección', 'común', 'inflamación']
      },
      {
        id: 'fatigue',
        name: 'Fatiga',
        description: 'Sensación de cansancio extremo, falta de energía o agotamiento que no mejora con el descanso',
        bodyRegion: 'general',
        severity: 'moderate',
        commonCauses: ['Estrés', 'Falta de sueño', 'Anemia', 'Depresión', 'Condiciones crónicas'],
        whenToSeek: 'Busque atención médica si la fatiga es severa, aparece repentinamente sin causa aparente, o interfiere significativamente con sus actividades diarias durante más de dos semanas.',
        tags: ['común', 'bienestar', 'energía']
      },
      {
        id: 'weight_changes',
        name: 'Cambios de peso no intencionales',
        description: 'Aumento o pérdida significativa de peso sin cambios en la dieta o actividad física',
        bodyRegion: 'general',
        severity: 'moderate',
        commonCauses: ['Trastornos hormonales', 'Problemas digestivos', 'Depresión', 'Estrés', 'Cáncer'],
        whenToSeek: 'Busque atención médica si pierde más del 5% de su peso corporal en un período de 6-12 meses sin causa aparente, especialmente si se acompaña de fatiga, cambios en los hábitos intestinales o fiebre.',
        tags: ['metabólico', 'hormonal', 'nutrición']
      }
    ]
  }
];

const SymptomExplorer: React.FC<SymptomExplorerProps> = ({ 
  initialCategory, 
  onSelectSymptom 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [selectedBodyRegion, setSelectedBodyRegion] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  
  const handleSelectSymptom = (symptom: Symptom) => {
    setSelectedSymptom(symptom);
    if (onSelectSymptom) {
      onSelectSymptom(symptom);
    }
  };
  
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSymptom(null);
  };
  
  const handleToggleBodyRegion = (region: string) => {
    setSelectedBodyRegion(selectedBodyRegion === region ? null : region);
  };
  
  const handleToggleSeverity = (severity: string) => {
    setSelectedSeverity(selectedSeverity === severity ? null : severity);
  };
  
  const handleToggleTag = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };
  
  const handleBackToList = () => {
    setSelectedSymptom(null);
  };
  
  // Get all available tags across all symptoms
  const getAllTags = (): string[] => {
    const tagsSet = new Set<string>();
    
    SYMPTOM_CATEGORIES.forEach(category => {
      category.symptoms.forEach(symptom => {
        symptom.tags.forEach(tag => tagsSet.add(tag));
      });
    });
    
    return Array.from(tagsSet).sort();
  };
  
  // Get all available body regions
  const getBodyRegions = (): {id: string; name: string}[] => {
    return [
      { id: 'head', name: 'Cabeza' },
      { id: 'neck', name: 'Cuello' },
      { id: 'chest', name: 'Pecho' },
      { id: 'abdomen', name: 'Abdomen' },
      { id: 'back', name: 'Espalda' },
      { id: 'joints', name: 'Articulaciones' },
      { id: 'muscles', name: 'Músculos' },
      { id: 'general', name: 'General' }
    ];
  };
  
  // Filter symptoms based on search query and filters
  const getFilteredSymptoms = (): Symptom[] => {
    let filteredSymptoms: Symptom[] = [];
    
    // If a category is selected, get symptoms from that category
    if (selectedCategory) {
      const category = SYMPTOM_CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        filteredSymptoms = [...category.symptoms];
      }
    } else {
      // Otherwise get all symptoms
      filteredSymptoms = SYMPTOM_CATEGORIES.flatMap(category => category.symptoms);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredSymptoms = filteredSymptoms.filter(symptom => 
        symptom.name.toLowerCase().includes(query) || 
        symptom.description.toLowerCase().includes(query) ||
        symptom.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply body region filter
    if (selectedBodyRegion) {
      filteredSymptoms = filteredSymptoms.filter(symptom => 
        symptom.bodyRegion === selectedBodyRegion
      );
    }
    
    // Apply severity filter
    if (selectedSeverity) {
      filteredSymptoms = filteredSymptoms.filter(symptom => 
        symptom.severity === selectedSeverity
      );
    }
    
    // Apply tag filters
    if (selectedTags.length > 0) {
      filteredSymptoms = filteredSymptoms.filter(symptom => 
        selectedTags.every(tag => symptom.tags.includes(tag))
      );
    }
    
    return filteredSymptoms;
  };
  
  // Get current category
  const getCurrentCategory = () => {
    if (!selectedCategory) return null;
    return SYMPTOM_CATEGORIES.find(c => c.id === selectedCategory) || null;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Explorador de Síntomas</h3>
        <p className="text-gray-600">
          Explore información sobre síntomas comunes, sus posibles causas y cuándo buscar atención médica.
        </p>
      </div>
      
      {selectedSymptom ? (
        <div>
          <button 
            onClick={handleBackToList}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Volver a la lista
          </button>
          
          <div className="bg-blue-50 rounded-t-lg p-6 border-b border-blue-100">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">{selectedSymptom.name}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSymptom.tags.map(tag => (
                <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-blue-800">{selectedSymptom.description}</p>
          </div>
          
          <div className="p-6 space-y-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Causas Comunes
              </h3>
              <ul className="ml-6 space-y-2">
                {selectedSymptom.commonCauses.map((cause, index) => (
                  <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-1 text-blue-500">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <AlertCircle size={20} className="mr-2 text-amber-500" />
                Cuándo Buscar Atención Médica
              </h3>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-amber-800">{selectedSymptom.whenToSeek}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <ThumbsUp size={20} className="mr-2 text-green-600" />
                Recomendaciones Generales
              </h3>
              <div className="bg-green-50 rounded-lg p-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-1 text-green-600">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span className="text-green-800">Lleve un registro de sus síntomas, incluyendo cuándo comenzaron, qué los mejora o empeora y cualquier otro síntoma asociado.</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-1 text-green-600">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span className="text-green-800">Comparta esta información con su médico para ayudar en el diagnóstico y tratamiento.</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-1 text-green-600">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span className="text-green-800">No se automedique sin consultar a un profesional de la salud.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="p-6 text-center text-sm text-gray-500">
            <p>
              Esta información es de carácter educativo y no sustituye la consulta médica profesional.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 relative">
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar síntomas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 border ${showFilters ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} rounded-lg flex items-center`}
                aria-label="Toggle filters"
              >
                <Filter size={18} className="mr-1" />
                <span className="text-sm">Filtros</span>
              </button>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  aria-label="Grid view"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Map size={16} className="mr-1" />
                        Región del cuerpo
                      </h4>
                      <div className="space-y-2">
                        {getBodyRegions().map(region => (
                          <label key={region.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedBodyRegion === region.id}
                              onChange={() => handleToggleBodyRegion(region.id)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{region.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        Severidad
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSeverity === 'low'}
                            onChange={() => handleToggleSeverity('low')}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Baja</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSeverity === 'moderate'}
                            onChange={() => handleToggleSeverity('moderate')}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Moderada</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSeverity === 'high'}
                            onChange={() => handleToggleSeverity('high')}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Alta</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Tag size={16} className="mr-1" />
                        Etiquetas comunes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {getAllTags().map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleToggleTag(tag)}
                            className={`px-2 py-1 rounded-full text-xs ${
                              selectedTags.includes(tag)
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedBodyRegion(null);
                        setSelectedSeverity(null);
                        setSelectedTags([]);
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`py-2 px-4 border-b-2 whitespace-nowrap ${
                    selectedCategory === null
                      ? 'border-blue-500 text-blue-600 font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Todos
                </button>
                
                {SYMPTOM_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleSelectCategory(category.id)}
                    className={`py-2 px-4 border-b-2 whitespace-nowrap flex items-center ${
                      selectedCategory === category.id
                        ? 'border-blue-500 text-blue-600 font-medium'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {getCurrentCategory() && (
            <div className="mb-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-1">{getCurrentCategory()?.name}</h3>
              <p className="text-blue-700 text-sm">{getCurrentCategory()?.description}</p>
            </div>
          )}
          
          <div className="mb-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredSymptoms().map(symptom => (
                  <div
                    key={symptom.id}
                    className="border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleSelectSymptom(symptom)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{symptom.name}</h3>
                        <div className={`w-2 h-2 rounded-full ${
                          symptom.severity === 'high' ? 'bg-red-500' :
                          symptom.severity === 'moderate' ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}></div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{symptom.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {symptom.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {symptom.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{symptom.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                      <span>{symptom.bodyRegion}</span>
                      <div className="flex items-center text-blue-600">
                        <Eye size={12} className="mr-1" />
                        Ver detalles
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {getFilteredSymptoms().map(symptom => (
                  <div
                    key={symptom.id}
                    className="border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleSelectSymptom(symptom)}
                  >
                    <div className="p-4 flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-start">
                          <div className={`w-2 h-2 rounded-full mt-2 mr-2 ${
                            symptom.severity === 'high' ? 'bg-red-500' :
                            symptom.severity === 'moderate' ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}></div>
                          <div>
                            <h3 className="font-medium text-gray-900">{symptom.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{symptom.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {symptom.tags.map(tag => (
                                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center">
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {getFilteredSymptoms().length === 0 && (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 mb-4">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron síntomas</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  No encontramos síntomas que coincidan con tu búsqueda. Intenta cambiar tus criterios de búsqueda o filtros.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBodyRegion(null);
                    setSelectedSeverity(null);
                    setSelectedTags([]);
                    setSelectedCategory(null);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SymptomExplorer;