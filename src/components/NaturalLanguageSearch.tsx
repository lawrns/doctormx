import { useState, useEffect, useRef } from 'react';
import { Search, Mic, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Example of natural language processing for medical search queries
const processNaturalLanguageQuery = (query: string) => {
  // This is a simplified example. In a real implementation, 
  // this would use a more sophisticated NLP approach or API

  const lowercaseQuery = query.toLowerCase();
  const result: {
    specialty?: string;
    location?: string;
    insurance?: string;
    language?: string;
    isUrgent?: boolean;
    availableToday?: boolean;
    telemedicine?: boolean;
  } = {};

  // Extract specialty
  const specialtyKeywords = {
    'cardiólogo': 'cardiologia',
    'cardiología': 'cardiologia',
    'corazón': 'cardiologia',
    'pediatra': 'pediatria',
    'niños': 'pediatria',
    'dermatólogo': 'dermatologia',
    'piel': 'dermatologia',
    'psicólogo': 'psicologia',
    'salud mental': 'psicologia',
    'ginecólogo': 'ginecologia',
    'mujer': 'ginecologia',
    'oftalmólogo': 'oftalmologia',
    'ojos': 'oftalmologia',
    'visión': 'oftalmologia',
    'ortopedista': 'ortopedia',
    'huesos': 'ortopedia',
    'traumatólogo': 'ortopedia',
    'dentista': 'odontologia',
    'dientes': 'odontologia'
  };

  // Check for specialty keywords
  for (const [keyword, specialty] of Object.entries(specialtyKeywords)) {
    if (lowercaseQuery.includes(keyword)) {
      result.specialty = specialty;
      break;
    }
  }

  // Extract location
  const locationKeywords = {
    'cdmx': 'cdmx',
    'ciudad de méxico': 'cdmx',
    'df': 'cdmx',
    'guadalajara': 'guadalajara',
    'monterrey': 'monterrey',
    'puebla': 'puebla'
  };

  // Check for location keywords
  for (const [keyword, location] of Object.entries(locationKeywords)) {
    if (lowercaseQuery.includes(keyword)) {
      result.location = location;
      break;
    }
  }

  // Check for insurance
  const insuranceKeywords = ['gnp', 'axa', 'metlife', 'seguros monterrey', 'allianz'];
  for (const insurance of insuranceKeywords) {
    if (lowercaseQuery.includes(insurance)) {
      result.insurance = insurance;
      break;
    }
  }

  // Check for languages
  const languageKeywords = {
    'inglés': 'ingles',
    'español': 'espanol',
    'francés': 'frances',
    'alemán': 'aleman'
  };

  for (const [keyword, language] of Object.entries(languageKeywords)) {
    if (lowercaseQuery.includes(keyword)) {
      result.language = language;
      break;
    }
  }

  // Check for urgency
  if (lowercaseQuery.includes('urgente') || 
      lowercaseQuery.includes('emergencia') ||
      lowercaseQuery.includes('hoy mismo')) {
    result.isUrgent = true;
    result.availableToday = true;
  }

  // Check for availability today
  if (lowercaseQuery.includes('disponible hoy') || 
      lowercaseQuery.includes('para hoy') ||
      lowercaseQuery.includes('cita hoy')) {
    result.availableToday = true;
  }

  // Check for telemedicine
  if (lowercaseQuery.includes('telemedicina') || 
      lowercaseQuery.includes('virtual') ||
      lowercaseQuery.includes('en línea') ||
      lowercaseQuery.includes('videollamada') ||
      lowercaseQuery.includes('remoto')) {
    result.telemedicine = true;
  }

  return result;
};

// Example suggestions based on partial input
const getSuggestions = (input: string) => {
  const suggestions = [
    'Cardiólogo cerca de mí',
    'Pediatra disponible hoy',
    'Dermatólogo que hable inglés',
    'Ginecóloga en Ciudad de México',
    'Psicólogo con telemedicina',
    'Dentista que acepte GNP',
    'Oftalmólogo urgente',
    'Médico general en Guadalajara'
  ];

  if (!input) return suggestions;

  return suggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(input.toLowerCase())
  );
};

interface NaturalLanguageSearchProps {
  onSearch: (params: any) => void;
  className?: string;
  placeholder?: string;
}

const NaturalLanguageSearch: React.FC<NaturalLanguageSearchProps> = ({ 
  onSearch,
  className = '',
  placeholder = '¿Qué médico estás buscando? Ej. "Cardiólogo cerca de mí"'
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Update suggestions as user types
    if (query) {
      setSuggestions(getSuggestions(query));
    } else {
      setSuggestions(getSuggestions(''));
    }
  }, [query]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Process the natural language query
    const searchParams = processNaturalLanguageQuery(query);
    
    // Track this search in history
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    searchHistory.unshift({
      query,
      specialty: searchParams.specialty || '',
      location: searchParams.location || '',
      timestamp: new Date().toISOString()
    });
    // Limit history to 10 items
    if (searchHistory.length > 10) {
      searchHistory.pop();
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

    // Call onSearch with the processed parameters
    onSearch(searchParams);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Lo sentimos, el reconocimiento de voz no está disponible en este navegador.');
      return;
    }

    setIsListening(true);

    // @ts-ignore - WebkitSpeechRecognition is not in TypeScript's lib
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'es-MX';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setQuery(speechResult);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    const searchParams = processNaturalLanguageQuery(suggestion);
    
    // Track this search in history
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    searchHistory.unshift({
      query: suggestion,
      specialty: searchParams.specialty || '',
      location: searchParams.location || '',
      timestamp: new Date().toISOString()
    });
    if (searchHistory.length > 10) searchHistory.pop();
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

    onSearch(searchParams);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search 
              size={20} 
              className="text-gray-400 dark:text-gray-500" 
              aria-hidden="true" 
            />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="block w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
            aria-label="Búsqueda en lenguaje natural"
            autoComplete="off"
          />
          
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-12 px-2 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label="Borrar búsqueda"
            >
              <X size={18} />
            </button>
          )}
          
          <button
            type="button"
            onClick={startListening}
            disabled={isListening}
            className={`absolute inset-y-0 right-0 px-3 flex items-center ${
              isListening 
                ? 'text-blue-600 dark:text-blue-400 animate-pulse' 
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
            }`}
            aria-label={isListening ? 'Escuchando...' : 'Buscar por voz'}
          >
            <Mic size={20} />
          </button>
        </div>
        
        <button
          type="submit"
          className="hidden"
          aria-label="Buscar"
        />
      </form>
      
      {/* Search suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-2 animate-slide-up"
        >
          <p className="px-4 py-1 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
            Sugerencias de búsqueda
          </p>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-border flex items-center justify-between text-gray-700 dark:text-dark-text"
                >
                  <div className="flex items-center">
                    <Search size={16} className="text-gray-400 dark:text-gray-500 mr-2" />
                    {suggestion}
                  </div>
                  <ArrowRight size={16} className="text-gray-400 dark:text-gray-500" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Voice input indicator */}
      {isListening && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card rounded-lg p-8 shadow-xl max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Mic size={40} className="text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2">Escuchando...</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Habla claramente para buscar un médico
            </p>
            <button
              onClick={() => setIsListening(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NaturalLanguageSearch;
