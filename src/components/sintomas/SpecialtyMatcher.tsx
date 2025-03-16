import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock } from 'lucide-react';

interface Specialty {
  id: string;
  name: string;
  description: string;
  matchScore: number;
  commonConditions: string[];
  availability?: 'high' | 'medium' | 'low';
  waitTime?: string;
}

interface SpecialtyMatcherProps {
  searchTerm?: string;
  recommendedSpecialties?: string[];
  onSelectSpecialty: (specialtyId: string) => void;
  maxResults?: number;
}

const SpecialtyMatcher: React.FC<SpecialtyMatcherProps> = ({
  searchTerm = '',
  recommendedSpecialties = [],
  onSelectSpecialty,
  maxResults = 5
}) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterByAvailability, setFilterByAvailability] = useState(false);

  // This would usually fetch from an API
  useEffect(() => {
    setLoading(true);
    
    // Mock specialties data
    const mockSpecialties: Specialty[] = [
      {
        id: 'general-medicine',
        name: 'Medicina General',
        description: 'Atención médica integral para diversas condiciones y derivación a especialistas.',
        matchScore: recommendedSpecialties.includes('Medicina General') ? 95 : 75,
        commonConditions: ['Infecciones', 'Resfriados', 'Gripe', 'Dolor general', 'Revisiones de salud'],
        availability: 'high',
        waitTime: '0-2 días'
      },
      {
        id: 'cardiology',
        name: 'Cardiología',
        description: 'Especialidad médica que se ocupa de las enfermedades del corazón y del sistema circulatorio.',
        matchScore: recommendedSpecialties.includes('Cardiología') ? 98 : 40,
        commonConditions: ['Hipertensión', 'Arritmias', 'Insuficiencia cardíaca', 'Dolor torácico'],
        availability: 'medium',
        waitTime: '5-7 días'
      },
      {
        id: 'neurology',
        name: 'Neurología',
        description: 'Especialidad que trata los trastornos del sistema nervioso, incluyendo cerebro y médula espinal.',
        matchScore: recommendedSpecialties.includes('Neurología') ? 98 : 35,
        commonConditions: ['Migrañas', 'Epilepsia', 'Alzheimer', 'Parkinson', 'Dolor de cabeza'],
        availability: 'low',
        waitTime: '7-14 días'
      },
      {
        id: 'gastroenterology',
        name: 'Gastroenterología',
        description: 'Especialidad que se ocupa de las enfermedades del sistema digestivo.',
        matchScore: recommendedSpecialties.includes('Gastroenterología') ? 98 : 30,
        commonConditions: ['Reflujo', 'Úlceras', 'Síndrome de intestino irritable', 'Enfermedad inflamatoria intestinal'],
        availability: 'medium',
        waitTime: '3-7 días'
      },
      {
        id: 'dermatology',
        name: 'Dermatología',
        description: 'Especialidad que trata las enfermedades de la piel, cabello y uñas.',
        matchScore: recommendedSpecialties.includes('Dermatología') ? 98 : 25,
        commonConditions: ['Acné', 'Eccema', 'Psoriasis', 'Infecciones de la piel', 'Lunares'],
        availability: 'high',
        waitTime: '1-3 días'
      },
      {
        id: 'orthopedics',
        name: 'Traumatología',
        description: 'Especialidad que se ocupa de lesiones y enfermedades del sistema musculoesquelético.',
        matchScore: recommendedSpecialties.includes('Traumatología') ? 98 : 20,
        commonConditions: ['Fracturas', 'Esguinces', 'Artritis', 'Dolor de espalda', 'Lesiones deportivas'],
        availability: 'medium',
        waitTime: '2-5 días'
      },
      {
        id: 'ent',
        name: 'Otorrinolaringología',
        description: 'Especialidad que trata las enfermedades del oído, nariz y garganta.',
        matchScore: recommendedSpecialties.includes('Otorrinolaringología') ? 98 : 15,
        commonConditions: ['Sinusitis', 'Alergias', 'Problemas de audición', 'Infecciones de garganta'],
        availability: 'medium',
        waitTime: '4-7 días'
      }
    ];
    
    setSpecialties(mockSpecialties);
    
    // Apply initial filtering
    applyFilters(mockSpecialties, searchTerm, recommendedSpecialties, filterByAvailability);
    
    setLoading(false);
  }, [searchTerm, recommendedSpecialties, filterByAvailability]);

  const applyFilters = (
    allSpecialties: Specialty[],
    search: string,
    recommended: string[],
    byAvailability: boolean
  ) => {
    let filtered = [...allSpecialties];
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        specialty => 
          specialty.name.toLowerCase().includes(searchLower) ||
          specialty.description.toLowerCase().includes(searchLower) ||
          specialty.commonConditions.some(condition => 
            condition.toLowerCase().includes(searchLower)
          )
      );
    }
    
    // Prioritize recommended specialties
    filtered.sort((a, b) => b.matchScore - a.matchScore);
    
    // Filter by availability if needed
    if (byAvailability) {
      filtered = filtered.filter(specialty => 
        specialty.availability === 'high' || specialty.availability === 'medium'
      );
    }
    
    // Limit results
    filtered = filtered.slice(0, maxResults);
    
    setFilteredSpecialties(filtered);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-900">Especialidades Médicas</h3>
        
        <button
          onClick={() => setFilterByAvailability(!filterByAvailability)}
          className={`flex items-center text-sm px-2 py-1 rounded ${
            filterByAvailability 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Filter size={14} className="mr-1" />
          Mayor disponibilidad
        </button>
      </div>
      
      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar por especialidad o síntoma..."
            value={searchTerm}
            onChange={(e) => applyFilters(specialties, e.target.value, recommendedSpecialties, filterByAvailability)}
          />
        </div>
      </div>
      
      {/* Results */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="py-4 px-4 text-center text-gray-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] mb-2"></div>
            <p>Cargando especialidades...</p>
          </div>
        ) : filteredSpecialties.length > 0 ? (
          filteredSpecialties.map((specialty) => (
            <div
              key={specialty.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition"
              onClick={() => onSelectSpecialty(specialty.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-gray-900">{specialty.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  specialty.matchScore >= 90 
                    ? 'bg-green-100 text-green-800' 
                    : specialty.matchScore >= 70
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {specialty.matchScore}% coincidencia
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{specialty.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {specialty.commonConditions.slice(0, 3).map((condition, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                    {condition}
                  </span>
                ))}
                {specialty.commonConditions.length > 3 && (
                  <span className="text-gray-500 text-xs">
                    +{specialty.commonConditions.length - 3} más
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-xs text-gray-500 space-x-4">
                {specialty.availability && (
                  <span className="flex items-center">
                    <MapPin size={12} className="mr-1" />
                    Disponibilidad: 
                    <span className={`ml-1 ${
                      specialty.availability === 'high' 
                        ? 'text-green-600' 
                        : specialty.availability === 'medium'
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}>
                      {specialty.availability === 'high' ? 'Alta' : 
                       specialty.availability === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </span>
                )}
                
                {specialty.waitTime && (
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    Tiempo de espera: {specialty.waitTime}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 px-4 text-center">
            <p className="text-gray-500 mb-1">No se encontraron especialidades.</p>
            <p className="text-sm text-gray-400">Intenta con otro término de búsqueda o quita los filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialtyMatcher;
