import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Star, Calendar, Video, Filter, ChevronDown, ChevronUp, X, Shield, Check, Users, Bookmark } from 'lucide-react';
import FilterChips from '../components/FilterChips';

// Mock data for doctors
const mockDoctors = [
  {
    id: '1',
    name: 'Dra. Ana García',
    specialty: 'Medicina General',
    location: 'Ciudad de México',
    address: 'Av. Insurgentes Sur 1234, Col. Del Valle',
    rating: 4.9,
    reviewCount: 124,
    price: 800,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    availableToday: true,
    telemedicine: true,
    languages: ['Español', 'Inglés'],
    education: 'Universidad Nacional Autónoma de México',
    experience: 12,
    isPremium: true,
    insurances: ['GNP', 'AXA', 'MetLife']
  },
  {
    id: '2',
    name: 'Dr. Carlos Mendoza',
    specialty: 'Pediatría',
    location: 'Ciudad de México',
    address: 'Av. Reforma 567, Col. Juárez',
    rating: 4.8,
    reviewCount: 98,
    price: 900,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    availableToday: false,
    telemedicine: true,
    languages: ['Español'],
    education: 'Universidad La Salle',
    experience: 8,
    isPremium: false,
    insurances: ['GNP', 'Seguros Monterrey']
  },
  {
    id: '3',
    name: 'Dra. Laura Sánchez',
    specialty: 'Ginecología',
    location: 'Guadalajara',
    address: 'Av. Chapultepec 890, Col. Americana',
    rating: 4.7,
    reviewCount: 156,
    price: 1000,
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    availableToday: true,
    telemedicine: true,
    languages: ['Español', 'Francés'],
    education: 'Universidad de Guadalajara',
    experience: 15,
    isPremium: true,
    insurances: ['AXA', 'Allianz', 'BUPA']
  },
  {
    id: '4',
    name: 'Dr. Miguel Ángel Torres',
    specialty: 'Dermatología',
    location: 'Monterrey',
    address: 'Av. Gonzalitos 123, Col. Mitras Centro',
    rating: 4.9,
    reviewCount: 87,
    price: 1200,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    availableToday: false,
    telemedicine: true,
    languages: ['Español', 'Inglés'],
    education: 'Tecnológico de Monterrey',
    experience: 10,
    isPremium: false,
    insurances: ['MetLife', 'GNP']
  },
  {
    id: '5',
    name: 'Dra. Patricia Ramírez',
    specialty: 'Psicología',
    location: 'Ciudad de México',
    address: 'Av. Universidad 456, Col. Narvarte',
    rating: 4.6,
    reviewCount: 112,
    price: 850,
    image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    availableToday: true,
    telemedicine: true,
    languages: ['Español'],
    education: 'Universidad Iberoamericana',
    experience: 7,
    isPremium: false,
    insurances: ['Seguros Monterrey']
  },
  {
    id: '6',
    name: 'Dr. Roberto Vázquez',
    specialty: 'Nutrición',
    location: 'Puebla',
    address: 'Blvd. Atlixco 3250, Col. Las Ánimas',
    rating: 4.8,
    reviewCount: 76,
    price: 700,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    availableToday: true,
    telemedicine: true,
    languages: ['Español', 'Inglés'],
    education: 'Universidad de las Américas Puebla',
    experience: 9,
    isPremium: false,
    insurances: ['AXA', 'GNP']
  },
  {
    id: '7',
    name: 'Dra. Sofía Martínez',
    specialty: 'Terapia de Lenguaje',
    location: 'Ciudad de México',
    address: 'Av. Coyoacán 1435, Col. Del Valle',
    rating: 4.9,
    reviewCount: 65,
    price: 850,
    image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    availableToday: false,
    telemedicine: true,
    languages: ['Español'],
    education: 'Universidad Nacional Autónoma de México',
    experience: 11,
    isPremium: true,
    insurances: ['MetLife', 'AXA']
  },
  {
    id: '8',
    name: 'Dr. Alejandro Herrera',
    specialty: 'Medicina Alternativa',
    location: 'Guadalajara',
    address: 'Av. México 3370, Col. Vallarta',
    rating: 4.7,
    reviewCount: 92,
    price: 750,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    availableToday: true,
    telemedicine: true,
    languages: ['Español', 'Inglés'],
    education: 'Universidad de Guadalajara',
    experience: 14,
    isPremium: false,
    insurances: ['BUPA']
  }
];

// Specialty options
const specialties = [
  { value: '', label: 'Todas las especialidades' },
  { value: 'medicina-general', label: 'Medicina General' },
  { value: 'pediatria', label: 'Pediatría' },
  { value: 'ginecologia', label: 'Ginecología' },
  { value: 'dermatologia', label: 'Dermatología' },
  { value: 'psicologia', label: 'Psicología' },
  { value: 'cardiologia', label: 'Cardiología' },
  { value: 'oftalmologia', label: 'Oftalmología' },
  { value: 'neurologia', label: 'Neurología' },
  { value: 'nutricion', label: 'Nutrición' },
  { value: 'terapia-lenguaje', label: 'Terapia de Lenguaje' },
  { value: 'medicina-alternativa', label: 'Medicina Alternativa' }
];

// Location options
const locations = [
  { value: '', label: 'Todas las ubicaciones' },
  { value: 'cdmx', label: 'Ciudad de México' },
  { value: 'guadalajara', label: 'Guadalajara' },
  { value: 'monterrey', label: 'Monterrey' },
  { value: 'puebla', label: 'Puebla' },
  { value: 'queretaro', label: 'Querétaro' }
];

// Insurance options
const insurances = [
  { value: '', label: 'Todos los seguros' },
  { value: 'gnp', label: 'GNP Seguros' },
  { value: 'axa', label: 'AXA Seguros' },
  { value: 'metlife', label: 'MetLife' },
  { value: 'monterrey', label: 'Seguros Monterrey' },
  { value: 'allianz', label: 'Allianz' },
  { value: 'bupa', label: 'BUPA' }
];

// Language options
const languages = [
  { value: '', label: 'Todos los idiomas' },
  { value: 'espanol', label: 'Español' },
  { value: 'ingles', label: 'Inglés' },
  { value: 'frances', label: 'Francés' },
  { value: 'portugues', label: 'Portugués' },
  { value: 'aleman', label: 'Alemán' }
];

function DoctorSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState(mockDoctors);
  const [filteredDoctors, setFilteredDoctors] = useState(mockDoctors);
  const [specialty, setSpecialty] = useState(searchParams.get('especialidad') || '');
  const [location, setLocation] = useState(searchParams.get('ubicacion') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('busqueda') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Array<{id: string, label: string, value: string}>>([]);
  const [sortOption, setSortOption] = useState('relevance');
  const [insurance, setInsurance] = useState('');
  const [language, setLanguage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [filters, setFilters] = useState({
    availableToday: searchParams.get('disponible') === 'true',
    telemedicine: searchParams.get('telemedicina') === 'true',
    minRating: Number(searchParams.get('calificacion')) || 0,
    maxPrice: Number(searchParams.get('precio_max')) || 5000,
    onlyPremium: false
  });

  // Simulate loading state with announced status for screen readers
  useEffect(() => {
    // Set page title for better accessibility
    document.title = 'Buscar Médicos | Doctor.mx';
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Announce to screen readers that content has loaded
      const announcer = document.getElementById('sr-announcer');
      if (announcer) {
        announcer.textContent = 'Resultados de búsqueda cargados';
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let results = doctors;
    const newActiveFilters = [];
    
    // Filter by specialty
    if (specialty) {
      const specialtyLabel = specialties.find(s => s.value === specialty)?.label || '';
      results = results.filter(doctor => 
        doctor.specialty.toLowerCase() === specialtyLabel.toLowerCase()
      );
      newActiveFilters.push({
        id: 'specialty',
        label: 'Especialidad',
        value: specialtyLabel
      });
    }
    
    // Filter by location
    if (location) {
      const locationLabel = locations.find(l => l.value === location)?.label || '';
      results = results.filter(doctor => 
        doctor.location.toLowerCase() === locationLabel.toLowerCase()
      );
      newActiveFilters.push({
        id: 'location',
        label: 'Ubicación',
        value: locationLabel
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
      newActiveFilters.push({
        id: 'search',
        label: 'Búsqueda',
        value: searchTerm
      });
    }
    
    // Filter by insurance
    if (insurance) {
      const insuranceLabel = insurances.find(i => i.value === insurance)?.label || '';
      results = results.filter(doctor => 
        doctor.insurances.some(ins => ins.toLowerCase().includes(insurance.toLowerCase()))
      );
      newActiveFilters.push({
        id: 'insurance',
        label: 'Seguro',
        value: insuranceLabel
      });
    }
    
    // Filter by language
    if (language) {
      const languageLabel = languages.find(l => l.value === language)?.label || '';
      results = results.filter(doctor => 
        doctor.languages.some(lang => lang.toLowerCase().includes(languageLabel.toLowerCase()))
      );
      newActiveFilters.push({
        id: 'language',
        label: 'Idioma',
        value: languageLabel
      });
    }
    
    // Apply additional filters
    if (filters.availableToday) {
      results = results.filter(doctor => doctor.availableToday);
      newActiveFilters.push({
        id: 'availableToday',
        label: 'Disponibilidad',
        value: 'Hoy'
      });
    }
    
    if (filters.telemedicine) {
      results = results.filter(doctor => doctor.telemedicine);
      newActiveFilters.push({
        id: 'telemedicine',
        label: 'Consulta',
        value: 'Telemedicina'
      });
    }
    
    if (filters.minRating > 0) {
      results = results.filter(doctor => doctor.rating >= filters.minRating);
      newActiveFilters.push({
        id: 'minRating',
        label: 'Calificación mínima',
        value: `${filters.minRating} estrellas`
      });
    }
    
    if (filters.maxPrice < 5000) {
      results = results.filter(doctor => doctor.price <= filters.maxPrice);
      newActiveFilters.push({
        id: 'maxPrice',
        label: 'Precio máximo',
        value: `$${filters.maxPrice}`
      });
    }
    
    if (filters.onlyPremium) {
      results = results.filter(doctor => doctor.isPremium);
      newActiveFilters.push({
        id: 'onlyPremium',
        label: 'Tipo de perfil',
        value: 'Premium'
      });
    }
    
    // Sort results
    if (sortOption === 'price_asc') {
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      results = [...results].sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      results = [...results].sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'relevance') {
      // For relevance, show premium doctors first, then sort by rating
      results = [...results].sort((a, b) => {
        if (a.isPremium && !b.isPremium) return -1;
        if (!a.isPremium && b.isPremium) return 1;
        return b.rating - a.rating;
      });
    }
    
    setFilteredDoctors(results);
    setActiveFilters(newActiveFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    if (specialty) params.set('especialidad', specialty);
    if (location) params.set('ubicacion', location);
    if (searchTerm) params.set('busqueda', searchTerm);
    if (insurance) params.set('seguro', insurance);
    if (language) params.set('idioma', language);
    if (filters.availableToday) params.set('disponible', 'true');
    if (filters.telemedicine) params.set('telemedicina', 'true');
    if (filters.minRating > 0) params.set('calificacion', filters.minRating.toString());
    if (filters.maxPrice < 5000) params.set('precio_max', filters.maxPrice.toString());
    if (sortOption !== 'relevance') params.set('orden', sortOption);
    
    setSearchParams(params, { replace: true });
    
  }, [doctors, specialty, location, searchTerm, insurance, language, filters, sortOption, setSearchParams]);

  // Initialize from URL params
  useEffect(() => {
    const especialidad = searchParams.get('especialidad');
    const ubicacion = searchParams.get('ubicacion');
    const busqueda = searchParams.get('busqueda');
    const seguro = searchParams.get('seguro');
    const idioma = searchParams.get('idioma');
    const disponible = searchParams.get('disponible') === 'true';
    const telemedicina = searchParams.get('telemedicina') === 'true';
    const calificacion = Number(searchParams.get('calificacion')) || 0;
    const precio_max = Number(searchParams.get('precio_max')) || 5000;
    const orden = searchParams.get('orden') || 'relevance';
    
    if (especialidad) setSpecialty(especialidad);
    if (ubicacion) setLocation(ubicacion);
    if (busqueda) setSearchTerm(busqueda);
    if (seguro) setInsurance(seguro);
    if (idioma) setLanguage(idioma);
    if (orden) setSortOption(orden);
    
    setFilters({
      availableToday: disponible,
      telemedicine: telemedicina,
      minRating: calificacion,
      maxPrice: precio_max,
      onlyPremium: false
    });
    
    // Show filters section if any advanced filter is active
    if (disponible || telemedicina || calificacion > 0 || precio_max < 5000 || seguro || idioma) {
      setShowFilters(true);
    }
  }, [searchParams]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRemoveFilter = (filterId) => {
    if (filterId === 'specialty') {
      setSpecialty('');
    } else if (filterId === 'location') {
      setLocation('');
    } else if (filterId === 'search') {
      setSearchTerm('');
    } else if (filterId === 'insurance') {
      setInsurance('');
    } else if (filterId === 'language') {
      setLanguage('');
    } else if (filterId === 'availableToday') {
      handleFilterChange('availableToday', false);
    } else if (filterId === 'telemedicine') {
      handleFilterChange('telemedicine', false);
    } else if (filterId === 'minRating') {
      handleFilterChange('minRating', 0);
    } else if (filterId === 'maxPrice') {
      handleFilterChange('maxPrice', 5000);
    } else if (filterId === 'onlyPremium') {
      handleFilterChange('onlyPremium', false);
    }
  };
  
  const handleClearAllFilters = () => {
    setSpecialty('');
    setLocation('');
    setSearchTerm('');
    setInsurance('');
    setLanguage('');
    setSortOption('relevance');
    setFilters({
      availableToday: false,
      telemedicine: false,
      minRating: 0,
      maxPrice: 5000,
      onlyPremium: false
    });
    setShowFilters(false);
  };
  
  // Function to show toast notifications
  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and filter section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Buscar médicos</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por nombre o especialidad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="input-field pl-10"
                  placeholder="Ej. Dr. García o Cardiología"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar por nombre o especialidad"
                  aria-describedby="search-description"
                />
                <span id="search-description" className="sr-only">Busque médicos por nombre, especialidad o enfermedad</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad
              </label>
              <select
                id="specialty"
                className="input-field"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                aria-label="Filtrar por especialidad"
              >
                {specialties.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <select
                id="location"
                className="input-field"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Filtrar por ubicación"
              >
                {locations.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-blue-600 font-medium"
              aria-expanded={showFilters}
              aria-controls="advanced-filters"
            >
              <Filter size={18} className="mr-2" />
              Filtros avanzados
              {showFilters ? <ChevronUp size={18} className="ml-1" /> : <ChevronDown size={18} className="ml-1" />}
            </button>
            
            <div>
              <label htmlFor="sort" className="text-sm font-medium text-gray-700 mr-2">
                Ordenar por:
              </label>
              <select
                id="sort"
                className="input-field inline-block w-auto"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="relevance">Relevancia</option>
                <option value="rating">Calificación</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>
          
          {showFilters && (
            <div id="advanced-filters" className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
              <div>
                <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 mb-1">
                  Seguro médico
                </label>
                <select
                  id="insurance"
                  className="input-field"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                >
                  {insurances.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma
                </label>
                <select
                  id="language"
                  className="input-field"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languages.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col justify-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded"
                    checked={filters.availableToday}
                    onChange={(e) => handleFilterChange('availableToday', e.target.checked)}
                    aria-label="Mostrar solo médicos disponibles hoy"
                  />
                  <span className="ml-2 text-sm text-gray-700">Disponible hoy</span>
                </label>
              </div>
              
              <div className="flex flex-col justify-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded"
                    checked={filters.telemedicine}
                    onChange={(e) => handleFilterChange('telemedicine', e.target.checked)}
                    aria-label="Mostrar solo médicos que ofrecen telemedicina"
                  />
                  <span className="ml-2 text-sm text-gray-700">Ofrece telemedicina</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calificación mínima
                </label>
                <select
                  className="input-field"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                  aria-label="Filtrar por calificación mínima"
                >
                  <option value="0">Cualquier calificación</option>
                  <option value="3">3 estrellas o más</option>
                  <option value="4">4 estrellas o más</option>
                  <option value="4.5">4.5 estrellas o más</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio máximo
                </label>
                <select
                  className="input-field"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                  aria-label="Filtrar por precio máximo"
                >
                  <option value="5000">Cualquier precio</option>
                  <option value="800">$800 o menos</option>
                  <option value="1000">$1,000 o menos</option>
                  <option value="1500">$1,500 o menos</option>
                </select>
              </div>
              
              <div className="flex flex-col justify-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded"
                    checked={filters.onlyPremium}
                    onChange={(e) => handleFilterChange('onlyPremium', e.target.checked)}
                    aria-label="Mostrar solo perfiles premium"
                  />
                  <span className="ml-2 text-sm text-gray-700">Solo perfiles premium</span>
                </label>
              </div>
            </div>
          )}
          
          {/* Active filters */}
          <FilterChips 
            filters={activeFilters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        </div>
        
        {/* Freemium model banner */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Encontrarás a miles de médicos porque todos pueden unirse sin costo.</span> Esto significa más opciones y especialidades para ti.
              </p>
            </div>
          </div>
        </div>
        
        {/* Quick filter chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            onClick={() => handleFilterChange('availableToday', true)}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200"
          >
            Disponible hoy
          </button>
          <button 
            onClick={() => handleFilterChange('telemedicine', true)}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200"
          >
            Telemedicina
          </button>
          <button 
            onClick={() => handleFilterChange('maxPrice', 1000)}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200"
          >
            Menos de $1,000
          </button>
        </div>

        {/* Results section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'médico encontrado' : 'médicos encontrados'}
          </h2>
          <p className="text-gray-600">
            {specialty && specialties.find(s => s.value === specialty)?.label}
            {specialty && location && ' en '}
            {location && locations.find(l => l.value === location)?.label}
          </p>
        </div>
        
        {/* Screen reader announcer */}
      <div id="sr-announcer" className="sr-only" aria-live="polite" aria-atomic="true"></div>
      
      {/* Doctor list */}
        {isLoading ? (
          // Skeleton loading state
          <div className="space-y-6 animate-pulse">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 flex justify-center mb-4 md:mb-0">
                    <div className="w-32 h-32 rounded-full bg-gray-200"></div>
                  </div>
                  <div className="md:w-2/4 md:pl-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="flex flex-wrap gap-2">
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="md:w-1/4 mt-4 md:mt-0">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map(doctor => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 flex justify-center mb-4 md:mb-0">
                        <div className="relative">
                          <img 
                            src={doctor.image} 
                            alt={doctor.name} 
                            className="w-32 h-32 rounded-full object-cover"
                            loading="lazy"
                            width="128"
                            height="128"
                            fetchpriority="high"
                            onError={(e) => {
                              e.currentTarget.src = '/public/doctor-placeholder.png';
                              e.currentTarget.onerror = null;
                            }}
                          />
                          {doctor.isPremium && (
                            <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              Premium
                            </div>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const savedDoctors = JSON.parse(localStorage.getItem('savedDoctors') || '[]');
                              if (!savedDoctors.includes(doctor.id)) {
                                savedDoctors.push(doctor.id);
                                localStorage.setItem('savedDoctors', JSON.stringify(savedDoctors));
                                displayToast('Médico guardado en favoritos');
                              } else {
                                displayToast('Médico ya está en favoritos');
                              }
                            }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm"
                            aria-label="Guardar médico"
                          >
                            <Bookmark size={16} className="text-gray-500 hover:text-blue-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="md:w-2/4 md:pl-6">
                        <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                        <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                        
                        <div className="flex items-center mt-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                fill={i < Math.floor(doctor.rating) ? "currentColor" : "none"}
                                className={i < Math.floor(doctor.rating) ? "" : "text-gray-300"}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-gray-600">{doctor.rating}</span>
                          <span className="ml-1 text-gray-500">({doctor.reviewCount} opiniones)</span>
                        </div>
                        
                        <div className="mt-3 flex items-start">
                          <MapPin size={16} className="text-gray-500 mt-0.5 mr-1 flex-shrink-0" />
                          <span className="text-gray-600">{doctor.address}</span>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {doctor.availableToday && (
                            <span className="badge badge-green">
                              <Calendar size={12} className="mr-1" />
                              Disponible hoy
                            </span>
                          )}
                          
                          {doctor.availableToday && (
                            <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium inline-flex items-center">
                              <Calendar size={12} className="mr-1" />
                              Primera cita disponible: Hoy 15:00
                            </div>
                          )}
                          
                          {doctor.telemedicine && (
                            <span className="badge badge-blue">
                              <Video size={12} className="mr-1" />
                              Telemedicina
                            </span>
                          )}
                          
                          <span className="badge badge-gray">
                            {doctor.experience} años de experiencia
                          </span>
                          
                          <span className="badge badge-gray flex items-center">
                            <span className="mr-1">⏱️</span>
                            Tiempo de espera aprox.: 
                            {parseInt(doctor.id.charAt(doctor.id.length - 1)) % 4 === 0 ? '10 min' :
                             parseInt(doctor.id.charAt(doctor.id.length - 1)) % 4 === 1 ? '20 min' :
                             parseInt(doctor.id.charAt(doctor.id.length - 1)) % 4 === 2 ? '30 min' :
                             '1 hora'}
                          </span>
                          
                          {doctor.availableToday && (
                            <div className="w-full mt-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium inline-flex items-center">
                              <Calendar size={12} className="mr-1" />
                              Primera cita disponible: Hoy 15:00
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Seguros:</span> {doctor.insurances.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Idiomas:</span> {doctor.languages.join(', ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="md:w-1/4 mt-4 md:mt-0 flex flex-col items-center md:items-end justify-between">
                        <div className="text-right">
                          <p className="text-gray-500 text-sm">Precio de consulta</p>
                          <p className="text-2xl font-bold text-gray-900">${doctor.price}</p>
                        </div>
                        
                        <div className="mt-4 w-full md:w-auto">
                          <Link 
                            to={`/reservar/${doctor.id}`}
                            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg mb-2"
                          >
                            Consultar disponibilidad
                          </Link>
                          <Link 
                            to={`/doctor/${doctor.id}`}
                            className="block w-full text-center btn-outline mb-2"
                          >
                            Ver perfil
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                    <Search size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-600 mb-4">No se encontraron médicos que coincidan con tu búsqueda.</p>
                  <button 
                    onClick={handleClearAllFilters}
                    className="btn-primary"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Pagination - would be implemented with real API */}
        {filteredDoctors.length > 0 && !isLoading && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Anterior</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                aria-current="page"
                className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                1
              </a>
              <a
                href="#"
                className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                2
              </a>
              <a
                href="#"
                className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                3
              </a>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
              <a
                href="#"
                className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                8
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Siguiente</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div 
          className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50"
          role="alert"
          aria-live="assertive">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default DoctorSearchPage;