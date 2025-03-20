import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  ArrowRight,
  Check
} from '../components/icons/IconProvider';
import { Input, Button } from './ui';
import { Modal } from './modal';

// Specialty options for dropdown
const specialtyOptions = [
  { id: 'medicina-general', name: 'Medicina General', icon: '👨‍⚕️' },
  { id: 'pediatria', name: 'Pediatría', icon: '👶' },
  { id: 'ginecologia', name: 'Ginecólogo', icon: '👩‍⚕️' },
  { id: 'psicologia', name: 'Psicólogo', icon: '🧠' },
  { id: 'dermatologia', name: 'Dermatólogo', icon: '🧴' },
  { id: 'oftalmologia', name: 'Oftalmólogo', icon: '👁️' },
  { id: 'urologia', name: 'Urólogo', icon: '🚽' },
  { id: 'ortopedista', name: 'Ortopedista', icon: '🦴' },
  { id: 'otorrinolaringologo', name: 'Otorrinolaringólogo', icon: '👂' }
];

// Location options for dropdown
const locationOptions = [
  { id: 'cdmx', name: 'Ciudad de México' },
  { id: 'guadalajara', name: 'Guadalajara' },
  { id: 'puebla', name: 'Puebla' },
  { id: 'juarez', name: 'Juarez' },
  { id: 'tijuana', name: 'Tijuana' },
  { id: 'leon', name: 'León' },
  { id: 'monterrey', name: 'Monterrey' },
  { id: 'zapopan', name: 'Zapopan' },
  { id: 'nezahualcoyotl', name: 'Nezahualcóyotl' }
];

// Featured doctors data
const featuredDoctors = [
  {
    id: '1',
    name: 'Dra. Ana García',
    specialty: 'Medicina General',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    rating: 4.9,
    reviewCount: 124,
    price: 800
  },
  {
    id: '2',
    name: 'Dr. Carlos Mendoza',
    specialty: 'Pediatría',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    rating: 4.8,
    reviewCount: 98,
    price: 900
  },
  {
    id: '3',
    name: 'Dra. Laura Sánchez',
    specialty: 'Ginecología',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    rating: 4.7,
    reviewCount: 156,
    price: 1000
  }
];

interface EnhancedHeroSectionProps {
  userPreferences?: {
    recentSearches?: { specialty: string, location: string }[],
    lastVisitedDoctors?: string[]
  }
}

function EnhancedHeroSection({ userPreferences }: EnhancedHeroSectionProps = {}) {
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [abTestVariant, setAbTestVariant] = useState('');
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const specialtyInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Rotate featured doctors automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDoctorIndex((prevIndex) => (prevIndex + 1) % featuredDoctors.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Set A/B test variant and consider user preferences on component mount
  useEffect(() => {
    // Determine the variant (A or B) and store it
    let variant = 'A';
    
    // If user has previous searches, show the more direct search variant
    if (userPreferences?.recentSearches?.length > 0) {
      variant = 'A';  // Search-focused variant
      
      // Pre-fill search with most recent search if available
      const mostRecentSearch = userPreferences.recentSearches[0];
      if (mostRecentSearch) {
        const matchingSpecialty = specialtyOptions.find(
          spec => spec.name.toLowerCase().includes(mostRecentSearch.specialty.toLowerCase())
        );
        
        if (matchingSpecialty) {
          setSelectedSpecialty(matchingSpecialty.id);
          setSpecialtySearch(matchingSpecialty.name);
        }
        
        setLocationSearch(mostRecentSearch.location || '');
      }
    } else {
      // For new users or those without search history, randomize
      variant = Math.random() > 0.5 ? 'A' : 'B';
    }
    
    setAbTestVariant(variant);
  }, [userPreferences]);
  
  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (specialtyInputRef.current && !specialtyInputRef.current.contains(event.target as Node)) {
        setShowSpecialtyDropdown(false);
      }
      
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle specialty select
  const handleSpecialtySelect = (specialty) => {
    setSelectedSpecialty(specialty.id);
    setSpecialtySearch(specialty.name);
    setShowSpecialtyDropdown(false);
  };
  
  // Filter specialties based on search
  const filteredSpecialties = specialtySearch
    ? specialtyOptions.filter(specialty => 
        specialty.name.toLowerCase().includes(specialtySearch.toLowerCase())
      )
    : specialtyOptions;
  
  // Filter locations based on search
  const filteredLocations = locationSearch
    ? locationOptions.filter(location => 
        location.name.toLowerCase().includes(locationSearch.toLowerCase())
      )
    : locationOptions;
  
  // Handle search submission
  const handleSearch = () => {
    let searchParams = new URLSearchParams();
    
    if (selectedSpecialty) {
      searchParams.append('especialidad', selectedSpecialty);
    } else if (specialtySearch) {
      // If no specialty was selected from dropdown but user typed something
      searchParams.append('busqueda', specialtySearch);
    }
    
    if (locationSearch) {
      const matchingLocation = locationOptions.find(
        loc => loc.name.toLowerCase() === locationSearch.toLowerCase()
      );
      
      if (matchingLocation) {
        searchParams.append('ubicacion', matchingLocation.id);
      } else {
        searchParams.append('ubicacion_texto', locationSearch);
      }
    }
    
    navigate(`/buscar?${searchParams.toString()}`);
  };
  
  // Handle mouse move for dynamic gradient
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });
  };
  
  // Update gradient based on mouse position
  useEffect(() => {
    if (!heroRef.current) return;
    
    const gradientStyle = `
      radial-gradient(
        circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
        rgba(37, 99, 235, 0.9) 0%,
        rgba(29, 78, 216, 1) 50%,
        rgba(30, 64, 175, 1) 100%
      )
    `;
    
    heroRef.current.style.background = gradientStyle;
  }, [mousePosition]);

  return (
    <section 
      ref={heroRef}
      className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full"
          animate={{ 
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 20,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full"
          animate={{ 
            x: [0, -20, 0],
            y: [0, 20, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 15,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/4 w-32 h-32 bg-white opacity-5 rounded-full"
          animate={{ 
            y: [0, 30, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 10,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {abTestVariant === 'A' ? (
                'Encuentra al médico ideal para ti'
              ) : (
                'Atención médica de calidad al alcance de un clic'
              )}
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-6 text-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {abTestVariant === 'A' ? (
                'Agenda citas con los mejores especialistas en México o recibe atención médica en línea desde la comodidad de tu hogar.'
              ) : (
                'Más de 10,000 pacientes al mes confían en nosotros para conectar con médicos verificados y especialistas en todo México.'
              )}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 flex flex-wrap gap-2"
            >
              {['Médicos verificados', 'Agenda inmediata', 'Telemedicina 24/7'].map((feature, index) => (
                <div key={index} className="flex items-center bg-blue-700 bg-opacity-50 rounded-full px-3 py-1">
                  <Check size={16} className="text-blue-200 mr-1" />
                  <span className="text-sm text-blue-100">{feature}</span>
                </div>
              ))}
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col space-y-4">
                {/* Specialty Search */}
                <div className="relative" ref={specialtyInputRef}>
                  <Input
                    placeholder="Especialidad, enfermedad o nombre del médico"
                    value={specialtySearch}
                    onChange={(e) => {
                      setSpecialtySearch(e.target.value);
                      setShowSpecialtyDropdown(true);
                    }}
                    onFocus={() => setShowSpecialtyDropdown(true)}
                    leftIcon={<Search size={18} className="text-gray-400" />}
                    fullWidth
                    aria-label="Buscar especialidad o médico"
                  />
                  
                  {/* Specialty dropdown */}
                  {showSpecialtyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {filteredSpecialties.length > 0 ? (
                        <ul className="py-1">
                          {filteredSpecialties.map((specialty) => (
                            <li key={specialty.id}>
                              <button
                                type="button"
                                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                onClick={() => handleSpecialtySelect(specialty)}
                              >
                                <span className="mr-2">{specialty.icon}</span>
                                {specialty.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No se encontraron especialidades
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Recent searches suggestions - only shows if user has search history */}
                {userPreferences?.recentSearches?.length > 0 && !specialtySearch && !showSpecialtyDropdown && (
                  <div className="flex flex-wrap gap-1 -mt-2 mb-2">
                    <span className="text-xs text-gray-500">Búsquedas recientes:</span>
                    {userPreferences.recentSearches.slice(0, 3).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          // Find matching specialty and set it
                          const matchingSpecialty = specialtyOptions.find(
                            spec => spec.name.toLowerCase().includes(search.specialty.toLowerCase())
                          );
                          
                          if (matchingSpecialty) {
                            handleSpecialtySelect(matchingSpecialty);
                          } else {
                            setSpecialtySearch(search.specialty);
                          }
                          
                          // Set location if available
                          setLocationSearch(search.location || '');
                        }}
                        className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 text-gray-700 flex items-center"
                      >
                        <span>{search.specialty}</span>
                        {search.location && <span className="mx-1">•</span>}
                        {search.location && <span>{search.location}</span>}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Location Search */}
                <div className="relative" ref={locationInputRef}>
                  <Input
                    placeholder="Ciudad o colonia (opcional)"
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setShowLocationDropdown(true);
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    leftIcon={<MapPin size={18} className="text-gray-400" />}
                    fullWidth
                    aria-label="Seleccionar ubicación"
                  />
                  
                  {/* Location dropdown */}
                  {showLocationDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {filteredLocations.length > 0 ? (
                        <ul className="py-1">
                          {filteredLocations.map((location) => (
                            <li key={location.id}>
                              <button
                                type="button"
                                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  setLocationSearch(location.name);
                                  setShowLocationDropdown(false);
                                }}
                              >
                                <MapPin size={16} className="mr-2 text-gray-400" />
                                {location.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No se encontraron ubicaciones
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleSearch}
                  variant="primary"
                  fullWidth
                  icon={<Search size={18} />}
                >
                  {abTestVariant === 'A' ? 'Buscar médicos' : 'Encontrar médico'}
                </Button>
                
                <div className="text-center pt-2">
                  <Link to="/sintomas" className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center">
                    ¿No sabes qué especialista necesitas? Evalúa tus síntomas
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="hidden lg:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-800 opacity-20 rounded-lg"></div>
              
              {/* Main featured doctor card */}
              <motion.div 
                className="bg-white rounded-lg shadow-xl overflow-hidden transform"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                <div className="p-5">
                  <div className="flex items-start">
                    <img 
                      src={featuredDoctors[currentDoctorIndex].image} 
                      alt={featuredDoctors[currentDoctorIndex].name} 
                      className="w-20 h-20 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        {featuredDoctors[currentDoctorIndex].name}
                      </h3>
                      <p className="text-blue-600 font-medium text-sm">
                        {featuredDoctors[currentDoctorIndex].specialty}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400 mr-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{featuredDoctors[currentDoctorIndex].rating} ({featuredDoctors[currentDoctorIndex].reviewCount} opiniones)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Consulta desde</p>
                      <p className="text-xl font-bold text-gray-900">${featuredDoctors[currentDoctorIndex].price}</p>
                    </div>
                    <Button 
                      as="link"
                      to={`/doctor/${featuredDoctors[currentDoctorIndex].id}`}
                      variant="outline"
                      size="sm"
                    >
                      Ver perfil
                    </Button>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 h-1">
                  <motion.div 
                    className="bg-blue-600 h-1"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity,
                      repeatType: "loop" 
                    }}
                  />
                </div>
              </motion.div>
              
              {/* Doctor features list */}
              <div className="mt-6 bg-blue-700 bg-opacity-30 backdrop-blur-sm rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Por qué elegir Doctor.mx:</h3>
                <ul className="space-y-2">
                  {[
                    'Médicos verificados y certificados',
                    'Opiniones reales de pacientes',
                    'Agenda citas de inmediato',
                    'Consultas presenciales y telemedicina'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-blue-100">
                      <Check size={18} className="mr-2 text-blue-200 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default EnhancedHeroSection;