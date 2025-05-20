import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, ChevronDown, ChevronRight, Clock, Filter, Info, MapPin, Search, Star, User, Video, X } from 'lucide-react';
import { motion } from 'framer-motion';
import analyticsService from '../../services/AnalyticsService';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  subspecialties?: string[];
  image: string;
  rating: number;
  reviewCount: number;
  address?: string;
  location?: string;
  distance?: string;
  price?: number;
  currency?: string;
  availableToday: boolean;
  availableSlots?: {
    date: string;
    slots: string[];
  }[];
  nextAvailable: string;
  acceptsInsurance: boolean;
  insuranceNetworks?: string[];
  languages?: string[];
  telehealth: boolean;
  inPerson: boolean;
  matchScore?: number;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface FollowUpSchedulerProps {
  symptomId?: string;
  symptomName?: string;
  recommendedSpecialties?: string[];
  urgency?: 'routine' | 'soon' | 'urgent' | 'emergency';
  searchRadius?: number;
  initialDoctors?: Doctor[];
  onScheduled?: (appointmentDetails: any) => void;
}

const FollowUpScheduler: React.FC<FollowUpSchedulerProps> = ({
  symptomId,
  symptomName,
  recommendedSpecialties = [],
  urgency = 'routine',
  searchRadius = 10,
  initialDoctors = [],
  onScheduled
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(recommendedSpecialties[0] || '');
  const [appointmentType, setAppointmentType] = useState<'any' | 'inperson' | 'telehealth'>('any');
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(initialDoctors);
  const [loading, setLoading] = useState(initialDoctors.length === 0);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [appointmentMethod, setAppointmentMethod] = useState<'inperson' | 'telehealth'>('inperson');
  const [showFilters, setShowFilters] = useState(false);
  const [datesForSelection, setDatesForSelection] = useState<{ date: string; label: string }[]>([]);
  const [nearbyLocations, setNearbyLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [insuranceFilter, setInsuranceFilter] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'any' | 'today' | 'thisWeek'>('any');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<'search' | 'select-time' | 'confirm'>('search');
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  
  // Fetch doctors based on specialty and other filters
  useEffect(() => {
    if (initialDoctors.length > 0) {
      setDoctors(initialDoctors);
      setFilteredDoctors(initialDoctors);
      setLoading(false);
      return;
    }
    
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        
        // Wait a moment to simulate loading
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data
        const mockDoctors: Doctor[] = [
          {
            id: '1',
            name: 'Dra. Ana García',
            specialty: 'Neurología',
            subspecialties: ['Cefaleas', 'Trastornos del sueño'],
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
            rating: 4.9,
            reviewCount: 124,
            address: 'Av. Insurgentes Sur 1862, Col. Florida, CDMX',
            location: 'Col. Florida, CDMX',
            distance: '3.2 km',
            price: 1200,
            currency: 'MXN',
            availableToday: true,
            availableSlots: [
              {
                date: '2025-03-16',
                slots: ['09:00', '10:30', '12:00', '16:30']
              },
              {
                date: '2025-03-17',
                slots: ['10:00', '11:30', '15:00', '17:30']
              }
            ],
            nextAvailable: 'Hoy, 15:30',
            acceptsInsurance: true,
            insuranceNetworks: ['AXA', 'GNP', 'Metlife'],
            languages: ['Español', 'Inglés'],
            telehealth: true,
            inPerson: true,
            matchScore: 95
          },
          {
            id: '2',
            name: 'Dr. Carlos Mendoza',
            specialty: 'Neurología',
            subspecialties: ['Epilepsia', 'Enfermedades neurodegenerativas'],
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
            rating: 4.8,
            reviewCount: 98,
            address: 'Av. Ejército Nacional 613, Col. Granada, CDMX',
            location: 'Col. Granada, CDMX',
            distance: '5.7 km',
            price: 1500,
            currency: 'MXN',
            availableToday: false,
            availableSlots: [
              {
                date: '2025-03-18',
                slots: ['11:00', '12:30', '16:00']
              },
              {
                date: '2025-03-19',
                slots: ['09:30', '14:00', '15:30', '17:00']
              }
            ],
            nextAvailable: 'Mañana, 10:00',
            acceptsInsurance: true,
            insuranceNetworks: ['AXA', 'Mapfre', 'BUPA'],
            languages: ['Español', 'Inglés', 'Francés'],
            telehealth: true,
            inPerson: true,
            matchScore: 88
          },
          {
            id: '3',
            name: 'Dra. María Rodríguez',
            specialty: 'Medicina General',
            image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
            rating: 4.7,
            reviewCount: 156,
            address: 'Calle Río Mixcoac 140, Col. Acacias, CDMX',
            location: 'Col. Acacias, CDMX',
            distance: '2.1 km',
            price: 800,
            currency: 'MXN',
            availableToday: true,
            availableSlots: [
              {
                date: '2025-03-16',
                slots: ['13:00', '14:30', '18:00']
              },
              {
                date: '2025-03-17',
                slots: ['09:00', '10:30', '12:00', '16:30', '18:00']
              }
            ],
            nextAvailable: 'Hoy, 13:00',
            acceptsInsurance: true,
            insuranceNetworks: ['GNP', 'Metlife', 'Seguros Monterrey'],
            languages: ['Español'],
            telehealth: true,
            inPerson: true,
            matchScore: 82
          },
          {
            id: '4',
            name: 'Dr. Alejandro Torres',
            specialty: 'Medicina Familiar',
            image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
            rating: 4.6,
            reviewCount: 112,
            address: 'Av. Universidad 1000, Col. Santa Cruz Atoyac, CDMX',
            location: 'Col. Santa Cruz Atoyac, CDMX',
            distance: '4.5 km',
            price: 700,
            currency: 'MXN',
            availableToday: true,
            availableSlots: [
              {
                date: '2025-03-16',
                slots: ['16:00', '17:30', '19:00']
              },
              {
                date: '2025-03-17',
                slots: ['10:00', '11:30', '12:30', '15:00', '16:30']
              }
            ],
            nextAvailable: 'Hoy, 16:00',
            acceptsInsurance: true,
            insuranceNetworks: ['AXA', 'GNP', 'BUPA'],
            languages: ['Español', 'Inglés'],
            telehealth: true,
            inPerson: true,
            matchScore: 78
          },
          {
            id: '5',
            name: 'Dra. Laura Vázquez',
            specialty: 'Medicina Interna',
            image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
            rating: 4.9,
            reviewCount: 87,
            address: 'Félix Cuevas 540, Col. Del Valle, CDMX',
            location: 'Col. Del Valle, CDMX',
            distance: '3.8 km',
            price: 1300,
            currency: 'MXN',
            availableToday: false,
            availableSlots: [
              {
                date: '2025-03-18',
                slots: ['09:30', '11:00', '12:30', '17:00']
              },
              {
                date: '2025-03-19',
                slots: ['10:00', '13:30', '15:00', '18:30']
              }
            ],
            nextAvailable: 'En 3 días',
            acceptsInsurance: true,
            insuranceNetworks: ['Mapfre', 'Metlife', 'GNP'],
            languages: ['Español', 'Inglés'],
            telehealth: true,
            inPerson: true,
            matchScore: 76
          }
        ];
        
        // Filter by specialty if provided
        let filtered = mockDoctors;
        if (selectedSpecialty) {
          filtered = mockDoctors.filter(doctor => 
            doctor.specialty === selectedSpecialty
          );
          
          // If no doctors found, show all
          if (filtered.length === 0) filtered = mockDoctors;
        }
        
        setDoctors(mockDoctors);
        setFilteredDoctors(filtered);
        
        // Extract nearby locations for filtering
        const locations = Array.from(new Set(mockDoctors.map(doctor => doctor.location))).filter(Boolean) as string[];
        setNearbyLocations(locations);
        
      } catch (error) {
        console.error('Error fetching doctors:', error);
        // Set some fallback data
        setDoctors([]);
        setFilteredDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, [initialDoctors.length, recommendedSpecialties]);
  
  // Apply filters
  useEffect(() => {
    let filtered = doctors;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(query) || 
        doctor.specialty.toLowerCase().includes(query) ||
        (doctor.subspecialties && doctor.subspecialties.some(sub => sub.toLowerCase().includes(query)))
      );
    }
    
    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }
    
    // Filter by appointment type
    if (appointmentType !== 'any') {
      filtered = filtered.filter(doctor => 
        appointmentType === 'telehealth' ? doctor.telehealth : doctor.inPerson
      );
    }
    
    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(doctor => doctor.location === selectedLocation);
    }
    
    // Filter by insurance
    if (insuranceFilter) {
      filtered = filtered.filter(doctor => 
        doctor.acceptsInsurance && 
        doctor.insuranceNetworks?.includes(insuranceFilter)
      );
    }
    
    // Filter by availability
    if (availabilityFilter !== 'any') {
      if (availabilityFilter === 'today') {
        filtered = filtered.filter(doctor => doctor.availableToday);
      } else if (availabilityFilter === 'thisWeek') {
        // In a real app, this would check for availability within the week
        filtered = filtered.filter(doctor => doctor.availableSlots && doctor.availableSlots.length > 0);
      }
    }
    
    // Filter by rating
    if (ratingFilter !== null) {
      filtered = filtered.filter(doctor => doctor.rating >= ratingFilter);
    }
    
    setFilteredDoctors(filtered);
  }, [
    doctors,
    searchQuery,
    selectedSpecialty,
    appointmentType,
    selectedLocation,
    insuranceFilter,
    availabilityFilter,
    ratingFilter
  ]);
  
  // Generate dates for selection when a doctor is selected
  useEffect(() => {
    if (selectedDoctor && selectedDoctor.availableSlots) {
      const today = new Date();
      const dates = selectedDoctor.availableSlots.map(slot => {
        const date = new Date(slot.date);
        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = new Date(today.getTime() + 86400000).toDateString() === date.toDateString();
        
        let label = date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
        if (isToday) label = 'Hoy, ' + label;
        if (isTomorrow) label = 'Mañana, ' + label;
        
        return { date: slot.date, label };
      });
      
      setDatesForSelection(dates);
      if (dates.length > 0) {
        setSelectedDate(dates[0].date);
      }
    }
  }, [selectedDoctor]);
  
  // Update available slots when date is selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const slot = selectedDoctor.availableSlots?.find(s => s.date === selectedDate);
      if (slot) {
        const timeSlots = slot.slots.map(time => ({
          id: `${selectedDate}-${time}`,
          time,
          available: true
        }));
        
        setAvailableSlots(timeSlots);
        
        // Clear selected slot if it's not available on the new date
        if (selectedSlot && !timeSlots.some(s => s.id === selectedSlot)) {
          setSelectedSlot('');
        }
      } else {
        setAvailableSlots([]);
        setSelectedSlot('');
      }
    }
  }, [selectedDoctor, selectedDate]);
  
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep('select-time');
    
    // Track doctor selection
    analyticsService.trackEvent('doctor_selection', {
      doctor_id: doctor.id,
      doctor_name: doctor.name,
      specialty: doctor.specialty,
      from_symptom_checker: true,
      symptom_id: symptomId
    });
  };
  
  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };
  
  const handleAppointmentMethodChange = (method: 'inperson' | 'telehealth') => {
    setAppointmentMethod(method);
  };
  
  const handleConfirmAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    
    // Format appointment details
    const slotTime = availableSlots.find(s => s.id === selectedSlot)?.time || '';
    const formattedDate = new Date(selectedDate).toLocaleDateString('es-MX', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    const details = {
      doctor: selectedDoctor,
      date: selectedDate,
      formattedDate,
      time: slotTime,
      method: appointmentMethod,
      symptomId,
      symptomName,
      appointmentId: `appt-${Date.now()}`,
      status: 'pendiente'
    };
    
    setAppointmentDetails(details);
    setCurrentStep('confirm');
    
    // Track appointment booking
    analyticsService.trackAppointmentBooking(
      selectedDoctor.id,
      appointmentMethod === 'telehealth' ? 'telemedicine' : 'in_person'
    );
    
    // Notify parent if callback is provided
    if (onScheduled) {
      onScheduled(details);
    }
  };
  
  const handleCompleteBooking = () => {
    // In a real app, this would finalize the booking in the backend
    
    // Redirect to appointments page
    navigate('/dashboard/citas');
  };
  
  const renderSearchStep = () => (
    <div>
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center mb-6">
          <div className="flex-1 mb-4 md:mb-0 md:mr-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar médicos por nombre o especialidad"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="appearance-none w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las especialidades</option>
                {recommendedSpecialties.map((specialty, index) => (
                  <option key={index} value={specialty}>{specialty}</option>
                ))}
                <option value="Neurología">Neurología</option>
                <option value="Medicina General">Medicina General</option>
                <option value="Medicina Familiar">Medicina Familiar</option>
                <option value="Medicina Interna">Medicina Interna</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={18} className="mr-2" />
              Filtros
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Appointment type filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de consulta
                </label>
                <div className="flex">
                  <button
                    onClick={() => setAppointmentType('any')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-l-md ${
                      appointmentType === 'any' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Cualquiera
                  </button>
                  <button
                    onClick={() => setAppointmentType('inperson')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium ${
                      appointmentType === 'inperson' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Presencial
                  </button>
                  <button
                    onClick={() => setAppointmentType('telehealth')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-r-md ${
                      appointmentType === 'telehealth' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Telemedicina
                  </button>
                </div>
              </div>
              
              {/* Location filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="appearance-none w-full pl-3 pr-10 py-1.5 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Cualquier ubicación</option>
                    {nearbyLocations.map((location, index) => (
                      <option key={index} value={location}>{location}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* Insurance filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seguro médico
                </label>
                <div className="relative">
                  <select
                    value={insuranceFilter}
                    onChange={(e) => setInsuranceFilter(e.target.value)}
                    className="appearance-none w-full pl-3 pr-10 py-1.5 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Cualquier seguro</option>
                    <option value="AXA">AXA</option>
                    <option value="GNP">GNP</option>
                    <option value="Metlife">Metlife</option>
                    <option value="Mapfre">Mapfre</option>
                    <option value="BUPA">BUPA</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* Availability filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponibilidad
                </label>
                <div className="flex">
                  <button
                    onClick={() => setAvailabilityFilter('any')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-l-md ${
                      availabilityFilter === 'any' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Cualquiera
                  </button>
                  <button
                    onClick={() => setAvailabilityFilter('today')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium ${
                      availabilityFilter === 'today' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => setAvailabilityFilter('thisWeek')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-r-md ${
                      availabilityFilter === 'thisWeek' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Esta semana
                  </button>
                </div>
              </div>
              
              {/* Rating filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calificación mínima
                </label>
                <div className="flex space-x-2">
                  {[null, 3, 4, 4.5].map((rating, index) => (
                    <button
                      key={index}
                      onClick={() => setRatingFilter(rating)}
                      className={`flex-1 px-3 py-1.5 text-sm font-medium border ${
                        ratingFilter === rating 
                          ? 'bg-blue-100 text-blue-800 border-blue-300' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } ${index === 0 ? 'rounded-l-md' : ''} ${index === 3 ? 'rounded-r-md' : ''}`}
                    >
                      {rating === null ? 'Todas' : `${rating}+`}
                      {rating !== null && <Star size={12} className="inline-block ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Clear filters button */}
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={() => {
                    setAppointmentType('any');
                    setSelectedLocation('');
                    setInsuranceFilter('');
                    setAvailabilityFilter('any');
                    setRatingFilter(null);
                    setSearchQuery('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {filteredDoctors.length} médicos disponibles
          </h2>
          
          {/* Sort options would go here */}
        </div>
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Buscando los mejores especialistas para ti...</p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow transition"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row">
                    {/* Doctor image and basic info */}
                    <div className="flex flex-col md:flex-row items-center md:space-x-4 mb-4 md:mb-0">
                      <div className="mb-4 md:mb-0">
                        <div className="relative">
                          <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-gray-200"
                          />
                          {doctor.availableToday && (
                            <div className="absolute -bottom-1 -right-1 bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded-full border border-white flex items-center">
                              <Clock size={12} className="mr-1" />
                              Hoy
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-gray-600">{doctor.specialty}</p>
                        
                        <div className="flex items-center mt-1">
                          <div className="flex items-center text-yellow-400">
                            <Star size={18} className="fill-current" />
                            <span className="text-gray-700 ml-1 font-medium">{doctor.rating}</span>
                          </div>
                          <span className="text-gray-500 ml-1">({doctor.reviewCount} reseñas)</span>
                        </div>
                        
                        {doctor.matchScore && (
                          <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <CheckCircle size={12} className="mr-1" />
                            {doctor.matchScore}% coincidencia con tus síntomas
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Divider for mobile */}
                    <div className="border-t border-gray-200 my-4 md:hidden"></div>
                    
                    {/* Middle section */}
                    <div className="md:ml-auto md:mr-6 mb-4 md:mb-0">
                      <div className="space-y-2">
                        {doctor.address && (
                          <div className="flex items-start text-gray-600 text-sm">
                            <MapPin size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{doctor.address}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar size={16} className="text-gray-400 mr-2" />
                          <span>Próxima cita: {doctor.nextAvailable}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600 text-sm">
                          <div className="flex space-x-2">
                            {doctor.inPerson && (
                              <span className="flex items-center">
                                <MapPin size={14} className="mr-1 text-blue-500" />
                                Presencial
                              </span>
                            )}
                            {doctor.telehealth && (
                              <span className="flex items-center">
                                <Video size={14} className="mr-1 text-green-500" />
                                Telemedicina
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price and button */}
                    <div className="md:ml-4 md:flex md:flex-col md:items-end md:justify-center">
                      {doctor.price && (
                        <div className="mb-3 text-right">
                          <p className="text-gray-900 font-semibold text-lg">
                            ${doctor.price} {doctor.currency}
                          </p>
                          <p className="text-xs text-gray-500">Consulta</p>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleDoctorSelect(doctor)}
                        className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                      >
                        <Calendar size={16} className="mr-2" />
                        Agendar Cita
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron médicos</h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar tus filtros de búsqueda o cambia la especialidad seleccionada.
            </p>
            <button
              onClick={() => {
                setAppointmentType('any');
                setSelectedLocation('');
                setInsuranceFilter('');
                setAvailabilityFilter('any');
                setRatingFilter(null);
                setSearchQuery('');
                setSelectedSpecialty('');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
  
  const renderTimeSelectionStep = () => {
    if (!selectedDoctor) return null;
    
    return (
      <div>
        <button
          onClick={() => setCurrentStep('search')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ChevronRight size={20} className="mr-1 transform rotate-180" />
          Volver a la búsqueda
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Doctor info card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <img
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedDoctor.name}</h3>
                  <p className="text-gray-600">{selectedDoctor.specialty}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                {selectedDoctor.address && (
                  <div className="flex items-start text-gray-600 text-sm">
                    <MapPin size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{selectedDoctor.address}</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600 text-sm">
                  <div className="flex space-x-2">
                    {selectedDoctor.inPerson && (
                      <span className="flex items-center">
                        <MapPin size={14} className="mr-1 text-blue-500" />
                        Presencial
                      </span>
                    )}
                    {selectedDoctor.telehealth && (
                      <span className="flex items-center">
                        <Video size={14} className="mr-1 text-green-500" />
                        Telemedicina
                      </span>
                    )}
                  </div>
                </div>
                
                {selectedDoctor.languages && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Idiomas:</span> {selectedDoctor.languages.join(', ')}
                  </div>
                )}
              </div>
              
              {selectedDoctor.price && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Precio de consulta:</span>
                    <span className="text-gray-900 font-semibold">${selectedDoctor.price} {selectedDoctor.currency}</span>
                  </div>
                  
                  {selectedDoctor.acceptsInsurance && (
                    <div className="mt-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="inline-block mr-1 text-green-500" />
                      Acepta seguros médicos
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Date and time selection */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona fecha y hora</h3>
              
              {/* Appointment type selection */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Tipo de consulta:</p>
                <div className="flex space-x-2">
                  {selectedDoctor.inPerson && (
                    <button
                      onClick={() => handleAppointmentMethodChange('inperson')}
                      className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
                        appointmentMethod === 'inperson'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <MapPin size={16} className="mr-2" />
                      Presencial
                    </button>
                  )}
                  
                  {selectedDoctor.telehealth && (
                    <button
                      onClick={() => handleAppointmentMethodChange('telehealth')}
                      className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
                        appointmentMethod === 'telehealth'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Video size={16} className="mr-2" />
                      Telemedicina
                    </button>
                  )}
                </div>
              </div>
              
              {/* Date selection */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Fecha:</p>
                <div className="flex flex-wrap gap-2">
                  {datesForSelection.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date.date)}
                      className={`py-2 px-3 rounded-md text-sm ${
                        selectedDate === date.date
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Time selection */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Hora:</p>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot.id)}
                        disabled={!slot.available}
                        className={`py-2 px-2 rounded-md text-sm font-medium ${
                          selectedSlot === slot.id
                            ? 'bg-blue-500 text-white'
                            : slot.available
                            ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-4 text-center">
                    No hay horarios disponibles para la fecha seleccionada.
                  </p>
                )}
              </div>
              
              {/* Confirmation button */}
              <div className="mt-8">
                <button
                  onClick={handleConfirmAppointment}
                  disabled={!selectedSlot}
                  className={`w-full py-2 px-4 rounded-md font-medium ${
                    selectedSlot
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderConfirmationStep = () => {
    if (!appointmentDetails || !selectedDoctor) return null;
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">¡Cita agendada con éxito!</h3>
            <p className="text-gray-600 mt-2">Tu consulta ha sido programada correctamente.</p>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <User size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Médico</p>
                  <p className="font-medium text-gray-900">{selectedDoctor.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium text-gray-900">{appointmentDetails.formattedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Hora</p>
                  <p className="font-medium text-gray-900">{appointmentDetails.time}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                {appointmentDetails.method === 'telehealth' ? (
                  <Video size={20} className="text-gray-400 mr-3" />
                ) : (
                  <MapPin size={20} className="text-gray-400 mr-3" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Tipo de consulta</p>
                  <p className="font-medium text-gray-900">
                    {appointmentDetails.method === 'telehealth' ? 'Telemedicina' : 'Presencial'}
                  </p>
                </div>
              </div>
              
              {appointmentDetails.method === 'inperson' && selectedDoctor.address && (
                <div className="flex items-start">
                  <MapPin size={20} className="text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium text-gray-900">{selectedDoctor.address}</p>
                  </div>
                </div>
              )}
              
              {symptomName && (
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Motivo de consulta</p>
                    <p className="font-medium text-gray-900">{symptomName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info size={20} className="text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Información importante</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Recibirás un correo electrónico con los detalles de tu cita y las instrucciones para conectarte 
                  {appointmentDetails.method === 'telehealth' ? ' a la videollamada' : ' o llegar al consultorio'}.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/citas')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Ver mis citas
          </button>
          
          <button
            onClick={handleCompleteBooking}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Completar
          </button>
        </div>
      </div>
    );
  };

  // Render the appropriate step
  return (
    <div>
      {currentStep === 'search' && renderSearchStep()}
      {currentStep === 'select-time' && renderTimeSelectionStep()}
      {currentStep === 'confirm' && renderConfirmationStep()}
    </div>
  );
};

export default FollowUpScheduler;