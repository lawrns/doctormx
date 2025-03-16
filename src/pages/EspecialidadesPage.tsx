import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';

// Specialty categories
const specialtyCategories = [
  {
    id: 'general',
    name: 'Medicina General',
    description: 'Atención médica primaria para pacientes de todas las edades',
    specialties: [
      { id: 'medicina-general', name: 'Medicina General', icon: '👨‍⚕️' },
      { id: 'medicina-familiar', name: 'Medicina Familiar', icon: '👨‍👩‍👧‍👦' },
      { id: 'medicina-interna', name: 'Medicina Interna', icon: '🫀' }
    ]
  },
  {
    id: 'pediatria',
    name: 'Pediatría',
    description: 'Especialidades enfocadas en la salud de niños y adolescentes',
    specialties: [
      { id: 'pediatria', name: 'Pediatría General', icon: '👶' },
      { id: 'neonatologia', name: 'Neonatología', icon: '👼' },
      { id: 'pediatria-desarrollo', name: 'Pediatría del Desarrollo', icon: '🧒' }
    ]
  },
  {
    id: 'salud-mental',
    name: 'Salud Mental',
    description: 'Especialidades para el cuidado de la salud mental y emocional',
    specialties: [
      { id: 'psicologia', name: 'Psicología', icon: '🧠' },
      { id: 'psiquiatria', name: 'Psiquiatría', icon: '💭' },
      { id: 'neuropsicologia', name: 'Neuropsicología', icon: '🔍' },
      { id: 'terapia-familiar', name: 'Terapia Familiar', icon: '👨‍👩‍👧' }
    ]
  },
  {
    id: 'especialidades-quirurgicas',
    name: 'Especialidades Quirúrgicas',
    description: 'Especialidades médicas enfocadas en procedimientos quirúrgicos',
    specialties: [
      { id: 'cirugia-general', name: 'Cirugía General', icon: '🔪' },
      { id: 'traumatologia', name: 'Traumatología', icon: '🦴' },
      { id: 'cirugia-plastica', name: 'Cirugía Plástica', icon: '✂️' },
      { id: 'oftalmologia', name: 'Oftalmología', icon: '👁️' },
      { id: 'otorrinolaringologia', name: 'Otorrinolaringología', icon: '👂' }
    ]
  },
  {
    id: 'salud-mujer',
    name: 'Salud de la Mujer',
    description: 'Especialidades dedicadas a la salud femenina',
    specialties: [
      { id: 'ginecologia', name: 'Ginecología', icon: '👩‍⚕️' },
      { id: 'obstetricia', name: 'Obstetricia', icon: '🤰' },
      { id: 'mastologia', name: 'Mastología', icon: '🎗️' },
      { id: 'reproduccion-asistida', name: 'Reproducción Asistida', icon: '👶' }
    ]
  },
  {
    id: 'especialidades-medicas',
    name: 'Especialidades Médicas',
    description: 'Especialidades para el diagnóstico y tratamiento de enfermedades específicas',
    specialties: [
      { id: 'cardiologia', name: 'Cardiología', icon: '❤️' },
      { id: 'dermatologia', name: 'Dermatología', icon: '🧴' },
      { id: 'endocrinologia', name: 'Endocrinología', icon: '⚗️' },
      { id: 'gastroenterologia', name: 'Gastroenterología', icon: '🍽️' },
      { id: 'neurologia', name: 'Neurología', icon: '🧬' },
      { id: 'neumologia', name: 'Neumología', icon: '🫁' },
      { id: 'reumatologia', name: 'Reumatología', icon: '🦿' },
      { id: 'urologia', name: 'Urología', icon: '🚽' }
    ]
  },
  {
    id: 'medicina-preventiva',
    name: 'Medicina Preventiva',
    description: 'Especialidades enfocadas en la prevención de enfermedades',
    specialties: [
      { id: 'nutricion', name: 'Nutrición', icon: '🥗' },
      { id: 'medicina-deportiva', name: 'Medicina Deportiva', icon: '🏃‍♂️' },
      { id: 'geriatria', name: 'Geriatría', icon: '👴' }
    ]
  },
  {
    id: 'odontologia',
    name: 'Odontología',
    description: 'Especialidades para el cuidado de la salud bucal',
    specialties: [
      { id: 'odontologia-general', name: 'Odontología General', icon: '🦷' },
      { id: 'ortodoncia', name: 'Ortodoncia', icon: '😁' },
      { id: 'odontopediatria', name: 'Odontopediatría', icon: '👶' },
      { id: 'periodoncia', name: 'Periodoncia', icon: '🦷' }
    ]
  }
];

// All specialties flattened for search
const allSpecialties = specialtyCategories.flatMap(category => 
  category.specialties.map(specialty => ({
    ...specialty,
    category: category.name
  }))
);

function EspecialidadesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Filter specialties based on search term
  const filteredSpecialties = searchTerm
    ? allSpecialties.filter(specialty => 
        specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialty.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Especialidades Médicas</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra el especialista adecuado para tus necesidades de salud entre nuestra amplia red de profesionales médicos.
          </p>
        </div>
        
        {/* Search section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10 py-4 text-lg"
              placeholder="Buscar especialidad médica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar especialidad médica"
            />
          </div>
          
          {/* Search results */}
          {searchTerm && (
            <div className="mt-4 bg-white rounded-lg shadow-sm overflow-hidden">
              <h2 className="sr-only">Resultados de búsqueda</h2>
              {filteredSpecialties.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredSpecialties.map(specialty => (
                    <li key={specialty.id}>
                      <Link 
                        to={`/buscar?especialidad=${specialty.id}`}
                        className="block hover:bg-gray-50 p-4"
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{specialty.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{specialty.name}</p>
                            <p className="text-sm text-gray-500">{specialty.category}</p>
                          </div>
                          <ChevronRight size={20} className="text-gray-400" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No se encontraron especialidades que coincidan con "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Categories section */}
        <div className="space-y-8">
          {specialtyCategories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
                onClick={() => toggleCategory(category.id)}
                aria-expanded={expandedCategory === category.id}
                aria-controls={`category-${category.id}`}
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                  <p className="text-gray-600 mt-1">{category.description}</p>
                </div>
                <div className={`transition-transform duration-200 ${expandedCategory === category.id ? 'rotate-180' : ''}`}>
                  <ChevronRight size={24} className="transform rotate-90 text-gray-400" />
                </div>
              </button>
              
              <div 
                id={`category-${category.id}`}
                className={`overflow-hidden transition-all duration-300 ${
                  expandedCategory === category.id ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="p-6 pt-0 border-t border-gray-200">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {category.specialties.map(specialty => (
                      <li key={specialty.id}>
                        <Link 
                          to={`/buscar?especialidad=${specialty.id}`}
                          className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-2xl mr-3">{specialty.icon}</span>
                          <span className="font-medium text-gray-900">{specialty.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA section */}
        <div className="mt-16 bg-blue-600 rounded-lg shadow-sm p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">¿No encuentras la especialidad que buscas?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Contamos con una amplia red de especialistas en constante crecimiento. Si no encuentras la especialidad que necesitas, contáctanos y te ayudaremos a encontrar al profesional adecuado.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/contacto"
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Contactar soporte
            </Link>
            <Link 
              to="/buscar"
              className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar médicos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EspecialidadesPage;