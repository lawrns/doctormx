import { useState } from 'react';
import { AlertCircle, Search, Filter, ChevronDown, ChevronUp, Clock, Info, Shield, AlertTriangle, X } from 'lucide-react';

interface Dosage {
  form: string;
  strength: string;
  route: string;
  frequency: string;
  duration?: string;
  max_daily?: string;
  pediatric?: string;
  geriatric?: string;
}

interface SideEffect {
  name: string;
  frequency: 'common' | 'uncommon' | 'rare';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  seek_help?: boolean;
}

interface Interaction {
  substance: string;
  type: 'drug' | 'food' | 'herb' | 'condition';
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  effect: string;
}

interface Contraindication {
  condition: string;
  description: string;
  absolute: boolean;
}

interface MedicationData {
  id: string;
  name: string;
  generic_name: string;
  drug_class: string;
  prescription_required: boolean;
  description: string;
  primary_uses: string[];
  mechanism: string;
  dosages: Dosage[];
  side_effects: SideEffect[];
  interactions: Interaction[];
  contraindications: Contraindication[];
  pregnancy_category?: 'A' | 'B' | 'C' | 'D' | 'X';
  pregnancy_info?: string;
  breastfeeding_safe?: boolean;
  breastfeeding_info?: string;
  storage?: string;
  available_brands?: string[];
  important_notes?: string[];
}

interface MedicationInfoProps {
  medicationId?: string;
  medicationName?: string;
  useCase?: string;
  interactive?: boolean;
  showWarnings?: boolean;
}

// Sample data for common medications
const MEDICATIONS_DATA: MedicationData[] = [
  {
    id: 'ibuprofen',
    name: 'Ibuprofeno',
    generic_name: 'Ibuprofeno',
    drug_class: 'Antiinflamatorio no esteroideo (AINE)',
    prescription_required: false,
    description: 'El ibuprofeno es un medicamento antiinflamatorio no esteroideo (AINE) que se usa para reducir el dolor, la fiebre y la inflamación.',
    primary_uses: [
      'Dolor de cabeza',
      'Dolor muscular',
      'Dolor articular',
      'Fiebre',
      'Dolor menstrual',
      'Dolor dental',
      'Inflamación'
    ],
    mechanism: 'Inhibe la producción de prostaglandinas, sustancias que el cuerpo libera en respuesta a enfermedades y lesiones. Las prostaglandinas causan inflamación y hacen que las terminaciones nerviosas sean más sensibles al dolor.',
    dosages: [
      {
        form: 'Tableta',
        strength: '200mg, 400mg, 600mg, 800mg',
        route: 'Oral',
        frequency: 'Cada 4-6 horas según sea necesario',
        max_daily: '1200mg (sin receta) o 3200mg (con receta)',
        pediatric: 'Varía según el peso y la edad, consulte a un profesional de la salud',
        geriatric: 'Se recomienda comenzar con dosis más bajas'
      },
      {
        form: 'Suspensión',
        strength: '100mg/5mL',
        route: 'Oral',
        frequency: 'Cada 6-8 horas según sea necesario',
        pediatric: '5-10mg/kg cada 6-8 horas, no exceder 40mg/kg/día'
      }
    ],
    side_effects: [
      {
        name: 'Malestar estomacal',
        frequency: 'common',
        severity: 'mild',
        description: 'Puede causar dolor o malestar en el estómago.'
      },
      {
        name: 'Acidez',
        frequency: 'common',
        severity: 'mild',
        description: 'Sensación de ardor en la parte superior del estómago o en el pecho.'
      },
      {
        name: 'Náuseas',
        frequency: 'common',
        severity: 'mild',
        description: 'Sensación de malestar en el estómago con deseos de vomitar.'
      },
      {
        name: 'Mareos',
        frequency: 'uncommon',
        severity: 'mild',
        description: 'Sensación de aturdimiento o inestabilidad.'
      },
      {
        name: 'Reacción alérgica',
        frequency: 'rare',
        severity: 'severe',
        description: 'Erupción cutánea, picazón/hinchazón (especialmente de la cara/lengua/garganta), mareos intensos, dificultad para respirar.',
        seek_help: true
      },
      {
        name: 'Sangrado estomacal/intestinal',
        frequency: 'rare',
        severity: 'severe',
        description: 'Vómito con sangre, heces negras o sanguinolentas, dolor abdominal persistente.',
        seek_help: true
      }
    ],
    interactions: [
      {
        substance: 'Aspirina',
        type: 'drug',
        severity: 'moderate',
        effect: 'Puede aumentar el riesgo de efectos secundarios y disminuir la efectividad de la aspirina para protección cardíaca.'
      },
      {
        substance: 'Anticoagulantes (como warfarina)',
        type: 'drug',
        severity: 'major',
        effect: 'Puede aumentar el riesgo de sangrado.'
      },
      {
        substance: 'Diuréticos y medicamentos para la presión arterial',
        type: 'drug',
        severity: 'moderate',
        effect: 'Puede disminuir la efectividad de estos medicamentos y aumentar el riesgo de daño renal.'
      },
      {
        substance: 'Alcohol',
        type: 'food',
        severity: 'moderate',
        effect: 'Aumenta el riesgo de irritación y sangrado estomacal.'
      }
    ],
    contraindications: [
      {
        condition: 'Alergia a los AINE',
        description: 'No debe usarse si ha experimentado reacciones alérgicas a ibuprofeno, aspirina u otros AINE.',
        absolute: true
      },
      {
        condition: 'Último trimestre del embarazo',
        description: 'Puede causar problemas al bebé nonato o complicaciones durante el parto.',
        absolute: true
      },
      {
        condition: 'Úlcera péptica activa o sangrado gastrointestinal',
        description: 'Puede empeorar estas condiciones.',
        absolute: true
      },
      {
        condition: 'Enfermedad renal grave',
        description: 'Puede empeorar la función renal.',
        absolute: true
      },
      {
        condition: 'Insuficiencia cardíaca grave',
        description: 'Puede empeorar la condición.',
        absolute: true
      }
    ],
    pregnancy_category: 'C',
    pregnancy_info: 'No se recomienda durante el embarazo, especialmente en el último trimestre. Consulte a su médico.',
    breastfeeding_safe: true,
    breastfeeding_info: 'Pequeñas cantidades de ibuprofeno pueden pasar a la leche materna, pero generalmente se considera seguro en dosis recomendadas y uso a corto plazo.',
    storage: 'Almacenar a temperatura ambiente, lejos de la humedad y el calor.',
    available_brands: ['Advil', 'Motrin', 'Nurofen'],
    important_notes: [
      'Tomar con alimentos o leche para reducir la irritación estomacal.',
      'Use la dosis más baja efectiva durante el menor tiempo posible.',
      'Los adultos mayores tienen mayor riesgo de efectos secundarios graves.',
      'No usar con otros AINE sin consultar a un profesional de la salud.'
    ]
  },
  {
    id: 'acetaminophen',
    name: 'Paracetamol',
    generic_name: 'Acetaminofén',
    drug_class: 'Analgésico y antipirético',
    prescription_required: false,
    description: 'El paracetamol (acetaminofén) es un analgésico y antipirético que se utiliza para aliviar el dolor leve a moderado y reducir la fiebre.',
    primary_uses: [
      'Dolor de cabeza',
      'Dolor muscular',
      'Dolor de espalda',
      'Fiebre',
      'Dolor dental',
      'Dolor articular',
      'Resfriado común y gripe'
    ],
    mechanism: 'Se cree que actúa principalmente en el sistema nervioso central, inhibiendo la síntesis de prostaglandinas que son mediadores del dolor. También actúa como antipirético reduciendo la fiebre mediante acción en el centro regulador de la temperatura en el hipotálamo.',
    dosages: [
      {
        form: 'Tableta',
        strength: '500mg, 650mg',
        route: 'Oral',
        frequency: 'Cada 4-6 horas según sea necesario',
        max_daily: '4000mg (no exceder en adultos sanos), 3000mg para uso prolongado',
        geriatric: 'No exceder 3000mg al día'
      },
      {
        form: 'Jarabe',
        strength: '160mg/5mL',
        route: 'Oral',
        frequency: 'Cada 4-6 horas según sea necesario',
        pediatric: '10-15mg/kg cada 4-6 horas, no exceder 5 dosis en 24 horas'
      }
    ],
    side_effects: [
      {
        name: 'Reacción alérgica',
        frequency: 'rare',
        severity: 'severe',
        description: 'Erupción cutánea, urticaria, picazón, dificultad para respirar.',
        seek_help: true
      },
      {
        name: 'Daño hepático',
        frequency: 'rare',
        severity: 'severe',
        description: 'Con dosis excesivas. Puede manifestarse como náuseas, vómitos, pérdida de apetito, fatiga, dolor en la parte superior derecha del abdomen, orina oscura, coloración amarilla de la piel o los ojos.',
        seek_help: true
      }
    ],
    interactions: [
      {
        substance: 'Alcohol',
        type: 'food',
        severity: 'major',
        effect: 'El consumo regular de alcohol con paracetamol aumenta el riesgo de daño hepático.'
      },
      {
        substance: 'Warfarina',
        type: 'drug',
        severity: 'moderate',
        effect: 'El uso prolongado puede aumentar el efecto anticoagulante.'
      },
      {
        substance: 'Isoniazida',
        type: 'drug',
        severity: 'moderate',
        effect: 'Puede aumentar el riesgo de hepatotoxicidad.'
      }
    ],
    contraindications: [
      {
        condition: 'Enfermedad hepática grave',
        description: 'Puede empeorar la condición y aumentar el riesgo de daño hepático.',
        absolute: true
      },
      {
        condition: 'Alergia al paracetamol',
        description: 'No debe usarse en personas con hipersensibilidad conocida al paracetamol.',
        absolute: true
      }
    ],
    pregnancy_category: 'B',
    pregnancy_info: 'Generalmente considerado seguro para usar durante el embarazo cuando se toma según las indicaciones.',
    breastfeeding_safe: true,
    breastfeeding_info: 'Compatible con la lactancia cuando se usa en dosis recomendadas.',
    storage: 'Almacenar a temperatura ambiente, lejos de la humedad y el calor.',
    available_brands: ['Tylenol', 'Panadol', 'Tempra'],
    important_notes: [
      'No exceder la dosis recomendada, ya que puede causar daño hepático grave.',
      'Muchos medicamentos para el resfriado y la gripe también contienen paracetamol; tenga cuidado de no tomar más de un producto con paracetamol al mismo tiempo.',
      'Busque atención médica inmediata en caso de sobredosis, incluso si no hay síntomas, ya que el daño hepático puede no ser evidente de inmediato.'
    ]
  },
  {
    id: 'amoxicillin',
    name: 'Amoxicilina',
    generic_name: 'Amoxicilina',
    drug_class: 'Antibiótico, Penicilina',
    prescription_required: true,
    description: 'La amoxicilina es un antibiótico de la familia de las penicilinas usado para tratar una variedad de infecciones bacterianas.',
    primary_uses: [
      'Infecciones del oído medio',
      'Infecciones de garganta (faringitis estreptocócica)',
      'Sinusitis',
      'Infecciones del tracto respiratorio',
      'Infecciones del tracto urinario',
      'Ciertas infecciones de la piel'
    ],
    mechanism: 'Inhibe la formación de la pared celular bacteriana, lo que lleva a la lisis y muerte de las bacterias susceptibles.',
    dosages: [
      {
        form: 'Cápsula',
        strength: '250mg, 500mg',
        route: 'Oral',
        frequency: 'Cada 8 horas (tres veces al día)',
        duration: 'Generalmente 7-14 días, según la infección',
        pediatric: 'Basado en el peso del niño y el tipo de infección'
      },
      {
        form: 'Suspensión',
        strength: '125mg/5mL, 250mg/5mL',
        route: 'Oral',
        frequency: 'Cada 8 horas (tres veces al día)',
        duration: '7-14 días según la infección',
        pediatric: '20-90mg/kg/día dividido en 3 dosis, dependiendo de la infección'
      }
    ],
    side_effects: [
      {
        name: 'Diarrea',
        frequency: 'common',
        severity: 'mild',
        description: 'Deposiciones líquidas o sueltas.'
      },
      {
        name: 'Náuseas',
        frequency: 'common',
        severity: 'mild',
        description: 'Sensación de malestar estomacal con ganas de vomitar.'
      },
      {
        name: 'Vómitos',
        frequency: 'uncommon',
        severity: 'mild',
        description: 'Expulsión del contenido estomacal por la boca.'
      },
      {
        name: 'Erupción cutánea',
        frequency: 'uncommon',
        severity: 'moderate',
        description: 'Enrojecimiento, protuberancias o descamación de la piel.'
      },
      {
        name: 'Reacción alérgica',
        frequency: 'rare',
        severity: 'severe',
        description: 'Erupción, picazón/hinchazón (especialmente de la cara/lengua/garganta), mareos intensos, dificultad para respirar.',
        seek_help: true
      },
      {
        name: 'Diarrea severa (posible infección por C. difficile)',
        frequency: 'rare',
        severity: 'severe',
        description: 'Diarrea acuosa o sanguinolenta persistente, dolor abdominal, fiebre.',
        seek_help: true
      }
    ],
    interactions: [
      {
        substance: 'Anticonceptivos orales',
        type: 'drug',
        severity: 'moderate',
        effect: 'Puede reducir la eficacia de los anticonceptivos hormonales.'
      },
      {
        substance: 'Metotrexato',
        type: 'drug',
        severity: 'moderate',
        effect: 'Puede aumentar los niveles de metotrexato, incrementando sus efectos tóxicos.'
      },
      {
        substance: 'Probenecid',
        type: 'drug',
        severity: 'minor',
        effect: 'Aumenta los niveles de amoxicilina al reducir su eliminación renal.'
      },
      {
        substance: 'Allopurinol',
        type: 'drug',
        severity: 'moderate',
        effect: 'Puede aumentar la probabilidad de erupción cutánea.'
      }
    ],
    contraindications: [
      {
        condition: 'Alergia a penicilinas',
        description: 'No debe usarse en personas con antecedentes de reacción alérgica a cualquier penicilina.',
        absolute: true
      },
      {
        condition: 'Mononucleosis infecciosa',
        description: 'Mayor riesgo de erupción cutánea cuando se usa amoxicilina.',
        absolute: false
      },
      {
        condition: 'Insuficiencia renal grave',
        description: 'Puede requerir ajuste de dosis.',
        absolute: false
      }
    ],
    pregnancy_category: 'B',
    pregnancy_info: 'Generalmente considerado seguro para usar durante el embarazo cuando es necesario tratar una infección bacteriana.',
    breastfeeding_safe: true,
    breastfeeding_info: 'Compatible con la lactancia, aunque pequeñas cantidades pueden pasar a la leche materna.',
    storage: 'Cápsulas: Almacenar a temperatura ambiente. Suspensión: Refrigerar después de reconstituir y desechar después de 14 días.',
    available_brands: ['Amoxil', 'Trimox', 'Polymox'],
    important_notes: [
      'Complete el curso completo de tratamiento, incluso si los síntomas mejoran antes de terminarlo.',
      'Tome con o sin alimentos.',
      'La suspensión debe agitarse bien antes de cada dosis.',
      'Puede causar resultados falsos positivos en pruebas de glucosa en orina.',
      'Informe a su médico si sus síntomas no mejoran o empeoran después de unos días.'
    ]
  }
];

const MedicationInfo: React.FC<MedicationInfoProps> = ({
  medicationId,
  medicationName,
  useCase,
  interactive = true,
  showWarnings = true
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    dosage: false,
    side_effects: false,
    interactions: false,
    contraindications: false,
    special_populations: false,
    notes: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<MedicationData | null>(null);
  const [showInteractionWarning, setShowInteractionWarning] = useState(false);
  
  // Find medication by ID or name
  const findMedication = () => {
    if (medicationId) {
      return MEDICATIONS_DATA.find(med => med.id === medicationId);
    }
    
    if (medicationName) {
      return MEDICATIONS_DATA.find(
        med => med.name.toLowerCase() === medicationName.toLowerCase() ||
               med.generic_name.toLowerCase() === medicationName.toLowerCase() ||
               med.available_brands?.some(brand => brand.toLowerCase() === medicationName.toLowerCase())
      );
    }
    
    return null;
  };
  
  // Initialize selected medication
  useState(() => {
    const foundMedication = findMedication();
    if (foundMedication) {
      setSelectedMedication(foundMedication);
    }
  });
  
  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    const searchResults = MEDICATIONS_DATA.filter(med => 
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.available_brands?.some(brand => brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      med.primary_uses.some(use => use.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    if (searchResults.length === 1) {
      setSelectedMedication(searchResults[0]);
      setShowSearchResults(false);
      setSearchTerm('');
    } else if (searchResults.length > 1) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };
  
  const selectMedicationFromSearch = (medication: MedicationData) => {
    setSelectedMedication(medication);
    setShowSearchResults(false);
    setSearchTerm('');
  };
  
  const getSeverityBadge = (severity: 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'mild':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Leve</span>;
      case 'moderate':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Moderado</span>;
      case 'severe':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Grave</span>;
    }
  };
  
  const getFrequencyBadge = (frequency: 'common' | 'uncommon' | 'rare') => {
    switch (frequency) {
      case 'common':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Común</span>;
      case 'uncommon':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">Poco común</span>;
      case 'rare':
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">Raro</span>;
    }
  };
  
  const getInteractionSeverityBadge = (severity: 'minor' | 'moderate' | 'major' | 'contraindicated') => {
    switch (severity) {
      case 'minor':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Leve</span>;
      case 'moderate':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Moderada</span>;
      case 'major':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Grave</span>;
      case 'contraindicated':
        return <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Contraindicada</span>;
    }
  };
  
  const getInteractionTypeBadge = (type: 'drug' | 'food' | 'herb' | 'condition') => {
    switch (type) {
      case 'drug':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Medicamento</span>;
      case 'food':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Alimento</span>;
      case 'herb':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">Hierbas</span>;
      case 'condition':
        return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">Condición médica</span>;
    }
  };
  
  const getPregnancyCategoryBadge = (category?: 'A' | 'B' | 'C' | 'D' | 'X') => {
    if (!category) return null;
    
    switch (category) {
      case 'A':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Categoría A</span>;
      case 'B':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Categoría B</span>;
      case 'C':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Categoría C</span>;
      case 'D':
        return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">Categoría D</span>;
      case 'X':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Categoría X</span>;
    }
  };
  
  // In a real implementation, this would check interactions with medications in the user's profile
  const checkUserInteractions = (medication: MedicationData) => {
    // Mock implementation
    if (medication.id === 'ibuprofen') {
      return {
        hasInteractions: true,
        interactingMeds: ['warfarina', 'aspirina'],
        message: 'Este medicamento puede interactuar con medicamentos que ya está tomando. Consulte con su médico antes de usar.'
      };
    }
    
    return { hasInteractions: false };
  };
  
  if (!selectedMedication && !interactive) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center py-10">
          <p className="text-gray-500">No se encontró información para el medicamento especificado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-blue-900">
          {selectedMedication 
            ? `Información del Medicamento: ${selectedMedication.name}` 
            : 'Información de Medicamentos'
          }
        </h3>
      </div>

      {interactive && !selectedMedication && (
        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="medication-search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar medicamento
            </label>
            <div className="flex">
              <input
                type="text"
                id="medication-search"
                className="flex-1 rounded-l-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Nombre del medicamento o síntoma"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
              >
                <Search size={20} />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Busque por nombre de medicamento, ingrediente activo o condición que trata
            </p>
          </div>
          
          {showSearchResults && (
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-2">Resultados de búsqueda</h4>
              <div className="space-y-2">
                {MEDICATIONS_DATA.filter(med => 
                  med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  med.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  med.available_brands?.some(brand => brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  med.primary_uses.some(use => use.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map(medication => (
                  <button
                    key={medication.id}
                    onClick={() => selectMedicationFromSearch(medication)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900">{medication.name}</h5>
                        <p className="text-sm text-gray-600">{medication.generic_name}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        medication.prescription_required 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {medication.prescription_required ? 'Con receta' : 'Sin receta'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {medication.primary_uses.slice(0, 3).join(', ')}
                      {medication.primary_uses.length > 3 ? '...' : ''}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-base font-medium text-gray-900 mb-2">Medicamentos populares</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MEDICATIONS_DATA.map(medication => (
                <button
                  key={medication.id}
                  onClick={() => selectMedicationFromSearch(medication)}
                  className="text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <h5 className="font-medium text-gray-900">{medication.name}</h5>
                  <p className="text-xs text-gray-600">{medication.drug_class}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedMedication && (
        <div className="p-6">
          {/* Prescription warning */}
          {selectedMedication.prescription_required && showWarnings && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-md mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-purple-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-purple-800">
                    Este medicamento requiere receta médica. No se automedique y consulte siempre a un profesional de la salud.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Interaction warning */}
          {showWarnings && (
            <>
              {checkUserInteractions(selectedMedication).hasInteractions && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-800">
                        {checkUserInteractions(selectedMedication).message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Overview section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('overview')}
              className="flex justify-between items-center w-full text-left mb-2"
            >
              <h4 className="text-lg font-medium text-gray-900">Información General</h4>
              {expandedSections.overview ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSections.overview && (
              <div>
                <div className="mb-4">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Nombre genérico:</span>
                    <span className="ml-2 text-gray-600">{selectedMedication.generic_name}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Clase de medicamento:</span>
                    <span className="ml-2 text-gray-600">{selectedMedication.drug_class}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Requiere receta:</span>
                    <span className="ml-2 text-gray-600">{selectedMedication.prescription_required ? 'Sí' : 'No'}</span>
                  </div>
                  {selectedMedication.available_brands && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Marcas disponibles:</span>
                      <span className="ml-2 text-gray-600">{selectedMedication.available_brands.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4">{selectedMedication.description}</p>
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Usos principales:</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedMedication.primary_uses.map((use, index) => (
                      <li key={index} className="text-gray-600">{use}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Mecanismo de acción:</h5>
                  <p className="text-gray-600">{selectedMedication.mechanism}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Dosage section */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <button
              onClick={() => toggleSection('dosage')}
              className="flex justify-between items-center w-full text-left mb-2"
            >
              <h4 className="text-lg font-medium text-gray-900">Dosis y Administración</h4>
              {expandedSections.dosage ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSections.dosage && (
              <div>
                {selectedMedication.dosages.map((dosage, index) => (
                  <div key={index} className={index > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''}>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Forma: {dosage.form} ({dosage.strength})
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Vía de administración</p>
                        <p className="text-sm text-gray-700">{dosage.route}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Frecuencia</p>
                        <p className="text-sm text-gray-700">{dosage.frequency}</p>
                      </div>
                      {dosage.duration && (
                        <div>
                          <p className="text-xs text-gray-500">Duración típica</p>
                          <p className="text-sm text-gray-700">{dosage.duration}</p>
                        </div>
                      )}
                      {dosage.max_daily && (
                        <div>
                          <p className="text-xs text-gray-500">Dosis máxima diaria</p>
                          <p className="text-sm text-gray-700">{dosage.max_daily}</p>
                        </div>
                      )}
                      {dosage.pediatric && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-500">Dosis pediátrica</p>
                          <p className="text-sm text-gray-700">{dosage.pediatric}</p>
                        </div>
                      )}
                      {dosage.geriatric && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-500">Dosis geriátrica</p>
                          <p className="text-sm text-gray-700">{dosage.geriatric}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Side effects section */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <button
              onClick={() => toggleSection('side_effects')}
              className="flex justify-between items-center w-full text-left mb-2"
            >
              <h4 className="text-lg font-medium text-gray-900">Efectos Secundarios</h4>
              {expandedSections.side_effects ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSections.side_effects && (
              <div>
                {/* Warning for severe side effects */}
                {selectedMedication.side_effects.some(effect => effect.seek_help) && (
                  <div className="bg-red-50 p-3 rounded-lg mb-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm text-red-700">
                        Busque atención médica inmediata si experimenta alguno de los efectos secundarios graves marcados a continuación.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {selectedMedication.side_effects.map((effect, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg ${
                        effect.seek_help ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 mr-2">{effect.name}</span>
                          {effect.seek_help && (
                            <Shield className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex space-x-1">
                          {getSeverityBadge(effect.severity)}
                          {getFrequencyBadge(effect.frequency)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{effect.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Interactions section */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <button
              onClick={() => toggleSection('interactions')}
              className="flex justify-between items-center w-full text-left mb-2"
            >
              <h4 className="text-lg font-medium text-gray-900">Interacciones</h4>
              {expandedSections.interactions ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSections.interactions && (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Este medicamento puede interactuar con otras sustancias. Siempre informe a su médico sobre todos los medicamentos, suplementos y productos a base de hierbas que esté tomando.
                </p>
                
                <div className="space-y-3">
                  {selectedMedication.interactions.map((interaction, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">{interaction.substance}</span>
                        <div className="flex space-x-1">
                          {getInteractionTypeBadge(interaction.type)}
                          {getInteractionSeverityBadge(interaction.severity)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{interaction.effect}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Contraindications section */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <button
              onClick={() => toggleSection('contraindications')}
              className="flex justify-between items-center w-full text-left mb-2"
            >
              <h4 className="text-lg font-medium text-gray-900">Contraindicaciones</h4>
              {expandedSections.contraindications ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSections.contraindications && (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  No tome este medicamento si tiene alguna de las siguientes condiciones. Hable con su médico sobre alternativas más seguras.
                </p>
                
                <div className="space-y-3">
                  {selectedMedication.contraindications.map((contraindication, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg ${
                        contraindication.absolute ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">{contraindication.condition}</span>
                        {contraindication.absolute && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Absoluta</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{contraindication.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Special populations section */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <button
              onClick={() => toggleSection('special_populations')}
              className="flex justify-between items-center w-full text-left mb-2"
            >
              <h4 className="text-lg font-medium text-gray-900">Embarazo y Lactancia</h4>
              {expandedSections.special_populations ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSections.special_populations && (
              <div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium text-gray-900">Embarazo</h5>
                    {getPregnancyCategoryBadge(selectedMedication.pregnancy_category)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedMedication.pregnancy_info || 'No hay información disponible para el uso durante el embarazo.'}
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium text-gray-900">Lactancia</h5>
                    {selectedMedication.breastfeeding_safe !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedMedication.breastfeeding_safe
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedMedication.breastfeeding_safe ? 'Compatible' : 'No recomendado'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedMedication.breastfeeding_info || 'No hay información disponible para el uso durante la lactancia.'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Important notes section */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <button
              onClick={() => toggleSection('notes')}
              className="flex justify-between items-center w-full text-left mb-2"
            >
              <h4 className="text-lg font-medium text-gray-900">Notas Importantes</h4>
              {expandedSections.notes ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSections.notes && (
              <div>
                {selectedMedication.important_notes && selectedMedication.important_notes.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedMedication.important_notes.map((note, index) => (
                      <li key={index} className="flex items-start">
                        <Info size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{note}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No hay notas adicionales disponibles para este medicamento.</p>
                )}
                
                {selectedMedication.storage && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">Almacenamiento:</p>
                    <p className="text-sm text-gray-600">{selectedMedication.storage}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Disclaimer */}
          <div className="border-t border-gray-200 pt-6 text-xs text-gray-500">
            <p className="flex items-start">
              <AlertCircle size={14} className="mt-0.5 mr-1 flex-shrink-0" />
              La información proporcionada es sólo para fines educativos y no sustituye la atención médica profesional. 
              Consulte siempre a un profesional de la salud antes de tomar o cambiar cualquier medicamento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationInfo;