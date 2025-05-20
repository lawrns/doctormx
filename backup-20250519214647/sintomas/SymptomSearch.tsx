import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';

interface Symptom {
  id: string;
  name: string;
  bodyRegion?: string;
  commonNames?: string[];
  severity?: number;
}

interface SymptomSearchProps {
  onSelectSymptom: (symptom: Symptom) => void;
  placeholder?: string;
}

const SymptomSearch: React.FC<SymptomSearchProps> = ({
  onSelectSymptom,
  placeholder = 'Buscar síntomas...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock symptom data - in a real app this would come from an API
  const mockSymptoms: Symptom[] = [
    { 
      id: 'headache', 
      name: 'Dolor de cabeza', 
      bodyRegion: 'head',
      commonNames: ['cefalea', 'migraña', 'jaqueca'],
      severity: 3
    },
    { 
      id: 'sore_throat', 
      name: 'Dolor de garganta', 
      bodyRegion: 'neck',
      commonNames: ['faringitis', 'irritación de garganta'],
      severity: 2
    },
    { 
      id: 'cough', 
      name: 'Tos', 
      bodyRegion: 'chest',
      commonNames: ['tos seca', 'tos con flema', 'tos persistente'],
      severity: 2
    },
    { 
      id: 'fever', 
      name: 'Fiebre', 
      bodyRegion: 'general',
      commonNames: ['temperatura alta', 'calentura', 'hipertermia'],
      severity: 4
    },
    { 
      id: 'abdominal_pain', 
      name: 'Dolor abdominal', 
      bodyRegion: 'abdomen',
      commonNames: ['dolor de estómago', 'dolor de barriga', 'cólico'],
      severity: 3
    },
    { 
      id: 'back_pain', 
      name: 'Dolor de espalda', 
      bodyRegion: 'back',
      commonNames: ['lumbalgia', 'dolor lumbar', 'dolor de cintura'],
      severity: 3
    },
    { 
      id: 'dizziness', 
      name: 'Mareo', 
      bodyRegion: 'head',
      commonNames: ['vértigo', 'sensación de desmayo', 'desequilibrio'],
      severity: 3
    },
    { 
      id: 'nausea', 
      name: 'Náuseas', 
      bodyRegion: 'abdomen',
      commonNames: ['ganas de vomitar', 'malestar estomacal'],
      severity: 2
    },
    { 
      id: 'fatigue', 
      name: 'Fatiga', 
      bodyRegion: 'general',
      commonNames: ['cansancio', 'agotamiento', 'debilidad'],
      severity: 2
    },
    { 
      id: 'chest_pain', 
      name: 'Dolor en el pecho', 
      bodyRegion: 'chest',
      commonNames: ['dolor torácico', 'angina', 'opresión en el pecho'],
      severity: 5
    }
  ];

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter symptoms based on search term
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // In a real app, this would be an API call
    // Here we just simulate a small delay and filter the mock data
    const timeoutId = setTimeout(() => {
      const filtered = mockSymptoms.filter(symptom => {
        const termLower = searchTerm.toLowerCase();
        
        // Check main symptom name
        if (symptom.name.toLowerCase().includes(termLower)) {
          return true;
        }
        
        // Check common names/synonyms
        if (symptom.commonNames && symptom.commonNames.some(name => 
          name.toLowerCase().includes(termLower)
        )) {
          return true;
        }
        
        return false;
      });
      
      setResults(filtered);
      setIsLoading(false);
      setShowResults(true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectSymptom = (symptom: Symptom) => {
    setSearchTerm(symptom.name);
    setShowResults(false);
    onSelectSymptom(symptom);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="w-full" ref={searchRef}>
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
          <div className="pl-4 pr-2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            className="w-full py-3 px-1 focus:outline-none text-gray-700"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (searchTerm.length >= 2) {
                setShowResults(true);
              }
            }}
            aria-label="Buscar síntomas"
          />
          {searchTerm && (
            <button
              className="pr-4 pl-2 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
              aria-label="Limpiar búsqueda"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {showResults && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Buscando síntomas...
              </div>
            ) : results.length > 0 ? (
              <ul>
                {results.map((symptom) => (
                  <li key={symptom.id}>
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 flex justify-between items-center"
                      onClick={() => handleSelectSymptom(symptom)}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{symptom.name}</div>
                        {symptom.commonNames && symptom.commonNames.length > 0 && (
                          <div className="text-sm text-gray-500">
                            También conocido como: {symptom.commonNames.slice(0, 2).join(', ')}
                            {symptom.commonNames.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : searchTerm.length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                No se encontraron resultados para "{searchTerm}"
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomSearch;