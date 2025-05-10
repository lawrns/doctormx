import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import SpecialtyDropdown from './SpecialtyDropdown';
import LocationDropdown from './LocationDropdown';
import AnimatedVerificationBadge from './AnimatedVerificationBadge';
import FeaturedDoctorCarousel from './FeaturedDoctorCarousel';

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

interface DynamicHeroSectionProps {
  userPreferences?: {
    recentSearches?: { specialty: string, location: string }[],
    lastVisitedDoctors?: string[]
  }
}

function DynamicHeroSection({ userPreferences }: DynamicHeroSectionProps = {}) {
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [abTestVariant, setAbTestVariant] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Set A/B test variant and consider user preferences on component mount
  useEffect(() => {
    // Set page title for better SEO and accessibility
    document.title = 'Doctor.mx - Encuentra al médico ideal para ti';
    
    // Determine the variant (A or B) and store it
    // We now weigh the decision based on user activity if available
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
    
    // Track impression for analytics with enhanced data
    const trackAbTestImpression = (variant) => {
      // In a real implementation, this would send to analytics
      console.log(`AB Test impression: Hero Variant ${variant}`);
      
      // Enhanced analytics data
      const analyticsData = {
        variant,
        hasSearchHistory: Boolean(userPreferences?.recentSearches?.length),
        hasVisitedDoctors: Boolean(userPreferences?.lastVisitedDoctors?.length),
        timestamp: new Date().toISOString(),
        sessionId: localStorage.getItem('sessionId') || 'new-session'
      };
      
      // Store in localStorage for debugging
      localStorage.setItem('heroVariantShown', variant);
      localStorage.setItem('heroImpressionData', JSON.stringify(analyticsData));
    };
    
    trackAbTestImpression(variant);
  }, [userPreferences]);
  
  const handleSpecialtySelect = (specialty) => {
    setSelectedSpecialty(specialty.id);
    setSpecialtySearch(specialty.name);
  };
  
  const handleSearch = () => {
    // Track click for A/B test
    const trackAbTestClick = () => {
      // In a real implementation, this would send to analytics
      console.log(`AB Test click: Hero Variant ${abTestVariant}`);
      
      // Store in localStorage for debugging
      const clicks = JSON.parse(localStorage.getItem('heroVariantClicks') || '{}');
      clicks[abTestVariant] = (clicks[abTestVariant] || 0) + 1;
      localStorage.setItem('heroVariantClicks', JSON.stringify(clicks));
    };
    
    trackAbTestClick();
    
    let searchParams = new URLSearchParams();
    
    if (selectedSpecialty) {
      searchParams.append('especialidad', selectedSpecialty);
    }
    
    if (locationSearch) {
      searchParams.append('ubicacion', locationSearch);
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
        rgba(41, 98, 255, 0.9) 0%,
        rgba(22, 65, 181, 1) 50%,
        rgba(13, 41, 122, 1) 100%
      )
    `;
    
    heroRef.current.style.background = gradientStyle;
  }, [mousePosition]);

  return (
    <section 
      ref={heroRef}
      className="bg-gradient-to-r from-primary-blue to-primary-blue-dark text-white py-16 relative overflow-hidden"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div>
            <motion.div className="flex items-center mb-4">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold"
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
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="ml-4 flex items-center bg-white/10 rounded-full px-2 py-1"
              >
                <img src="/mexico-flag.png" alt="Mexico" className="h-5 w-auto mr-1" />
                <span className="text-xs font-medium">Hecho en México</span>
              </motion.div>
            </motion.div>
            
            <motion.p 
              className="text-xl mb-4"
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
              className="mb-8"
            >
              <AnimatedVerificationBadge />
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col space-y-4">
                <SpecialtyDropdown 
                  specialties={specialtyOptions}
                  value={specialtySearch}
                  onChange={setSpecialtySearch}
                  onSelect={handleSpecialtySelect}
                  placeholder="Especialidad, enfermedad o nombre"
                  aria-label="Selecciona una especialidad o enfermedad"
                  aria-describedby="specialty-search-description"
                />
                <div id="specialty-search-description" className="sr-only">
                  Busca por especialidad médica como Cardiología, o por síntoma como dolor de cabeza
                </div>
                
                {/* Recent searches suggestions - only shows if user has search history */}
                {userPreferences?.recentSearches?.length > 0 && !specialtySearch && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-2">
                    <p className="text-xs text-gray-500 mb-2">Búsquedas recientes:</p>
                    <div className="flex flex-wrap gap-1">
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
                  </div>
                )}
                
                <LocationDropdown 
                  locations={locationOptions}
                  value={locationSearch}
                  onChange={setLocationSearch}
                  placeholder="Ciudad o colonia"
                />
                
                <motion.button 
                  onClick={handleSearch}
                  className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-primary-blue text-white font-medium rounded-md hover:bg-primary-blue-dark transition-colors shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Search size={18} className="mr-2" />
                  {abTestVariant === 'A' ? 'Buscar' : 'Encontrar médico'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="hidden md:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FeaturedDoctorCarousel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default DynamicHeroSection;
