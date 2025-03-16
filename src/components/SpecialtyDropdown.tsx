import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

type Specialty = {
  id: string;
  name: string;
  icon: string;
};

type SpecialtyDropdownProps = {
  specialties: Specialty[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (specialty: Specialty) => void;
  placeholder?: string;
  className?: string;
  showAllLink?: boolean;
};

function SpecialtyDropdown({
  specialties,
  value,
  onChange,
  onSelect,
  placeholder = "Buscar especialidad médica",
  className = '',
  showAllLink = true
}: SpecialtyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpecialties, setFilteredSpecialties] = useState<Specialty[]>(specialties);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter specialties based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = specialties.filter(specialty => 
        specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSpecialties(filtered);
    } else {
      setFilteredSpecialties(specialties);
    }
  }, [searchTerm, specialties]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onChange(value);
    if (value) {
      setIsOpen(true);
    }
  };
  
  const handleSpecialtySelect = (specialty: Specialty) => {
    onSelect(specialty);
    setSearchTerm('');
    setIsOpen(false);
  };
  
  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        
        <input
          type="text"
          className="input-field pl-10 pr-10 py-3 w-full text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="specialty-dropdown"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Clear input"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleDropdown}
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={isOpen ? "Close dropdown" : "Open dropdown"}
          >
            <ChevronDown
              size={18}
              className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div
          id="specialty-dropdown"
          className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-80 overflow-y-auto border border-gray-200 animate-fade-in"
          role="listbox"
        >
          {filteredSpecialties.length > 0 ? (
            <ul className="py-2">
              {filteredSpecialties.map((specialty) => (
                <li
                  key={specialty.id}
                  onClick={() => handleSpecialtySelect(specialty)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
                  role="option"
                  aria-selected={value === specialty.name}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xl">{specialty.icon}</span>
                    </div>
                    <span className="text-gray-900">{specialty.name}</span>
                  </div>
                  <span className="text-gray-400 text-sm">Especialidad</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No se encontraron especialidades
            </div>
          )}
          
          {showAllLink && (
            <div className="border-t border-gray-200 p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/especialidades';
                }}
                className="w-full text-center text-blue-600 hover:text-blue-800 py-2 font-medium"
              >
                Todas las especialidades
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SpecialtyDropdown;