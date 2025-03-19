import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, addDays, startOfWeek, addWeeks, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from '../components/icons/IconProvider';
import { Button, Input, Select, Checkbox } from '../components/ui';
import { Modal } from '../components/modal';
import Breadcrumbs from '../components/Breadcrumbs';

// Mock doctor data (in a real app, this would come from an API)
const mockDoctor = {
  id: '1',
  name: 'Dra. Ana García',
  specialty: 'Medicina General',
  location: 'Ciudad de México',
  address: 'Av. Insurgentes Sur 1234, Col. Del Valle',
  rating: 4.9,
  reviewCount: 124,
  price: 800,
  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  availableToday: true,
  telemedicine: true
};

// Mock available time slots (in a real app, this would come from an API)
const generateMockTimeSlots = (date) => {
  const dayOfWeek = date.getDay();
  
  // Fewer slots on weekends
  const slotsCount = dayOfWeek === 0 ? 4 : dayOfWeek === 6 ? 8 : 12;
  
  // Start time (9 AM on weekdays, 10 AM on weekends)
  const startHour = dayOfWeek === 0 || dayOfWeek === 6 ? 10 : 9;
  
  const timeSlots = [];
  for (let i = 0; i < slotsCount; i++) {
    const hour = startHour + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const time = `${hour}:${minute}`;
    
    // Randomly mark some slots as unavailable
    const available = Math.random() > 0.3;
    
    timeSlots.push({
      time,
      available
    });
  }
  
  return timeSlots;
};

const EnhancedBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedConsultType, setSelectedConsultType] = useState('inperson');
  const [timeSlots, setTimeSlots] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [patientInfo, setPatientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: '',
    isFirstVisit: true,
    insurance: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});

  // Fetch doctor data
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setDoctor(mockDoctor);
      setLoading(false);
    }, 500);
  }, [id]);

  // Update available time slots when selected date changes
  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateMockTimeSlots(selectedDate));
    }
  }, [selectedDate]);

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeek, i);
    return {
      date,
      dayName: format(date, 'EEE', { locale: es }),
      dayNumber: format(date, 'd'),
      month: format(date, 'MMM', { locale: es })
    };
  });

  const handlePrevWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleConsultTypeChange = (type) => {
    setSelectedConsultType(type);
  };

  const handlePatientInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPatientInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is filled
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      if (!selectedTimeSlot) {
        alert('Por favor, selecciona un horario para tu cita.');
        return;
      }
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } else if (currentStep === 2) {
      // Validate form
      const newErrors = {};
      if (!patientInfo.firstName) newErrors.firstName = 'El nombre es requerido';
      if (!patientInfo.lastName) newErrors.lastName = 'El apellido es requerido';
      if (!patientInfo.email) newErrors.email = 'El correo electrónico es requerido';
      if (!patientInfo.phone) newErrors.phone = 'El teléfono es requerido';
      if (!patientInfo.reason) newErrors.reason = 'El motivo de la consulta es requerido';
      if (!patientInfo.acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      setShowConfirmModal(true);
    }
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    } else {
      navigate(-1);
    }
  };

  const handleConfirmBooking = () => {
    // In a real app, this would call an API to create the appointment
    setShowConfirmModal(false);
    setBookingSuccess(true);
    
    // Generate a random booking reference
    const reference = 'DOC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setBookingReference(reference);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Doctor no encontrado</h1>
        <p className="text-gray-600 mb-6">Lo sentimos, no pudimos encontrar el doctor que estás buscando.</p>
        <Button as="link" to="/buscar" variant="primary">
          Buscar otros médicos
        </Button>
      </div>
    );
  }

  // Content for booking success
  if (bookingSuccess) {
    return (
      <div className="bg-gray-50 py-8 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Cita agendada correctamente!</h1>
            <p className="text-gray-600 mb-8">Tu número de referencia es: <span className="font-bold text-blue-600">{bookingReference}</span></p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles de tu cita</h2>
              <div className="space-y-3">
                <div className="flex">
                  <div className="w-32 flex-shrink-0 font-medium text-gray-700">Médico:</div>
                  <div className="text-gray-900">{doctor.name}</div>
                </div>
                <div className="flex">
                  <div className="w-32 flex-shrink-0 font-medium text-gray-700">Fecha:</div>
                  <div className="text-gray-900">{format(selectedDate, 'EEEE d MMMM, yyyy', { locale: es })}</div>
                </div>
                <div className="flex">
                  <div className="w-32 flex-shrink-0 font-medium text-gray-700">Hora:</div>
                  <div className="text-gray-900">{selectedTimeSlot.time} hrs</div>
                </div>
                <div className="flex">
                  <div className="w-32 flex-shrink-0 font-medium text-gray-700">Tipo:</div>
                  <div className="text-gray-900">
                    {selectedConsultType === 'inperson' ? 'Consulta presencial' : 'Telemedicina'}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-32 flex-shrink-0 font-medium text-gray-700">Dirección:</div>
                  <div className="text-gray-900">
                    {selectedConsultType === 'inperson' ? doctor.address : 'Vía videoconferencia'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Instrucciones importantes</h2>
              <div className="space-y-2 text-gray-700">
                <p>• Hemos enviado los detalles de tu cita a tu correo electrónico.</p>
                <p>• Llega 15 minutos antes de tu cita o prepara tu dispositivo para la videollamada.</p>
                <p>• En caso de cancelación, por favor avisa con al menos 24 horas de anticipación.</p>
                
                {selectedConsultType === 'telemedicine' && (
                  <>
                    <p className="mt-4 font-medium">Para tu consulta por telemedicina:</p>
                    <p>• Recibirás un enlace por correo electrónico 15 minutos antes de tu cita.</p>
                    <p>• Asegúrate de tener una buena conexión a internet.</p>
                    <p>• Encuentra un lugar tranquilo y bien iluminado para tu consulta.</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button as="link" to={`/doctor/${doctor.id}`} variant="outline">
                Volver al perfil del médico
              </Button>
              <Button as="link" to="/" variant="primary">
                Ir al inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          className="mb-6" 
          customPaths={{
            "reservar": "Agendar cita",
            [id]: doctor.name
          }}
        />
        
        {/* Progress steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-3xl">
              <div className="relative">
                {/* Progress bar */}
                <div className="absolute top-5 w-full h-1 bg-gray-200">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: currentStep === 1 ? '50%' : '100%' }}
                  ></div>
                </div>
                
                {/* Steps */}
                <div className="relative flex justify-between">
                  <div className="text-center">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
                      currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      1
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-700">Seleccionar horario</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
                      currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      2
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-700">Datos del paciente</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
                      currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      3
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-700">Confirmación</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="md:w-3/5">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {/* Back button */}
              <button
                onClick={handleGoBack}
                className="p-4 text-gray-600 hover:text-gray-900 inline-flex items-center"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="text-sm font-medium">
                  {currentStep === 1 ? 'Volver al perfil' : 'Volver al paso anterior'}
                </span>
              </button>
              
              {/* Content for step 1: Select date and time */}
              {currentStep === 1 && (
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Agendar cita con {doctor.name}</h1>
                  
                  {/* Consultation type selector */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Tipo de consulta</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleConsultTypeChange('inperson')}
                        className={`p-4 rounded-lg border ${
                          selectedConsultType === 'inperson'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        } flex items-start`}
                      >
                        <MapPin size={20} className={`mr-3 flex-shrink-0 ${
                          selectedConsultType === 'inperson' ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <div className="text-left">
                          <div className={`font-medium ${
                            selectedConsultType === 'inperson' ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            Consulta presencial
                          </div>
                          <div className="text-sm text-gray-600">
                            Asiste al consultorio en {doctor.address}
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleConsultTypeChange('telemedicine')}
                        className={`p-4 rounded-lg border ${
                          selectedConsultType === 'telemedicine'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        } flex items-start`}
                        disabled={!doctor.telemedicine}
                      >
                        <Video size={20} className={`mr-3 flex-shrink-0 ${
                          selectedConsultType === 'telemedicine' ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <div className="text-left">
                          <div className={`font-medium ${
                            selectedConsultType === 'telemedicine' ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            Telemedicina
                          </div>
                          <div className="text-sm text-gray-600">
                            Consulta por videollamada desde cualquier lugar
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Calendar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Selecciona una fecha</h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={handlePrevWeek}
                          className="p-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                          aria-label="Semana anterior"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={handleNextWeek}
                          className="p-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                          aria-label="Semana siguiente"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
                      {weekDays.map(day => {
                        const isSelected = isSameDay(selectedDate, day.date);
                        const isToday = isSameDay(new Date(), day.date);
                        
                        return (
                          <button
                            key={day.date.toString()}
                            onClick={() => handleDateSelect(day.date)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : isToday
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-white hover:bg-gray-100 text-gray-700'
                            }`}
                            aria-pressed={isSelected}
                            aria-label={format(day.date, 'EEEE d MMMM', { locale: es })}
                          >
                            <span className="text-xs">{day.dayName}</span>
                            <span className="text-lg font-semibold my-1">{day.dayNumber}</span>
                            <span className="text-xs">{day.month}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Time slots */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Horarios disponibles
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        {format(selectedDate, 'EEEE d MMMM', { locale: es })}
                      </span>
                    </h2>
                    
                    {timeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {timeSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => slot.available && handleTimeSlotSelect(slot)}
                            disabled={!slot.available}
                            className={`py-3 px-4 rounded-lg text-center ${
                              selectedTimeSlot && selectedTimeSlot.time === slot.time
                                ? 'bg-blue-600 text-white'
                                : slot.available
                                  ? 'bg-white border border-gray-200 hover:border-blue-400 text-gray-700'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            aria-label={`Horario ${slot.time} ${slot.available ? 'disponible' : 'no disponible'}`}
                            aria-selected={selectedTimeSlot && selectedTimeSlot.time === slot.time}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <Clock size={24} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">No hay horarios disponibles para esta fecha</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Content for step 2: Patient information */}
              {currentStep === 2 && (
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Información del paciente</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nombre(s)"
                      name="firstName"
                      value={patientInfo.firstName}
                      onChange={handlePatientInfoChange}
                      error={errors.firstName}
                      required
                      fullWidth
                    />
                    
                    <Input
                      label="Apellido(s)"
                      name="lastName"
                      value={patientInfo.lastName}
                      onChange={handlePatientInfoChange}
                      error={errors.lastName}
                      required
                      fullWidth
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input
                      label="Correo electrónico"
                      type="email"
                      name="email"
                      value={patientInfo.email}
                      onChange={handlePatientInfoChange}
                      error={errors.email}
                      required
                      fullWidth
                    />
                    
                    <Input
                      label="Teléfono"
                      type="tel"
                      name="phone"
                      value={patientInfo.phone}
                      onChange={handlePatientInfoChange}
                      error={errors.phone}
                      required
                      fullWidth
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Input
                      label="Motivo de la consulta"
                      name="reason"
                      value={patientInfo.reason}
                      onChange={handlePatientInfoChange}
                      error={errors.reason}
                      required
                      fullWidth
                    />
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Checkbox
                        label="Es mi primera visita con este médico"
                        name="isFirstVisit"
                        checked={patientInfo.isFirstVisit}
                        onChange={handlePatientInfoChange}
                      />
                    </div>
                    
                    <Select
                      label="Seguro médico (opcional)"
                      name="insurance"
                      value={patientInfo.insurance}
                      onChange={handlePatientInfoChange}
                      options={[
                        { value: '', label: 'Selecciona tu seguro' },
                        { value: 'none', label: 'No tengo seguro / Pago directo' },
                        { value: 'gnp', label: 'GNP Seguros' },
                        { value: 'axa', label: 'AXA Seguros' },
                        { value: 'metlife', label: 'MetLife' },
                        { value: 'monterrey', label: 'Seguros Monterrey' },
                        { value: 'other', label: 'Otro' }
                      ]}
                      fullWidth
                    />
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <Checkbox
                      label={
                        <>
                          He leído y acepto los <a href="#" className="text-blue-600 hover:underline">términos y condiciones</a> y la <a href="#" className="text-blue-600 hover:underline">política de privacidad</a>
                        </>
                      }
                      name="acceptTerms"
                      checked={patientInfo.acceptTerms}
                      onChange={handlePatientInfoChange}
                      error={errors.acceptTerms}
                    />
                  </div>
                </div>
              )}
              
              <div className="px-6 pb-6">
                <Button
                  onClick={handleContinue}
                  variant="primary"
                  fullWidth
                >
                  {currentStep === 1 ? 'Continuar' : 'Confirmar cita'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="md:w-2/5">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de la cita</h2>
                
                <div className="flex items-center mb-4">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                    <p className="text-gray-600">{doctor.specialty}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Calendar size={18} className="text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 font-medium">
                        {selectedDate ? format(selectedDate, 'EEEE d MMMM, yyyy', { locale: es }) : 'Fecha no seleccionada'}
                      </p>
                      <p className="text-gray-600">
                        {selectedTimeSlot ? `${selectedTimeSlot.time} hrs` : 'Horario no seleccionado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    {selectedConsultType === 'inperson' ? (
                      <MapPin size={18} className="text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Video size={18} className="text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-gray-900 font-medium">
                        {selectedConsultType === 'inperson' ? 'Consulta presencial' : 'Telemedicina'}
                      </p>
                      <p className="text-gray-600">
                        {selectedConsultType === 'inperson' ? doctor.address : 'Vía videoconferencia'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles del pago</h2>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Precio de consulta</span>
                  <span className="text-gray-900">${doctor.price.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-medium text-gray-900">${doctor.price.toFixed(2)}</span>
                </div>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Info className="text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p className="mb-1">El pago se realizará directamente en el consultorio.</p>
                      <p>Métodos aceptados: efectivo, tarjetas, transferencias.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-blue-50">
                <div className="flex items-start">
                  <Shield size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Política de cancelación</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Puedes cancelar o reprogramar sin costo hasta 24 horas antes de tu cita. Cancela desde tu panel de usuario o contactando directamente al consultorio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar cita"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <AlertCircle size={24} className="text-blue-600 mr-3 flex-shrink-0" />
            <p className="text-blue-800">
              Por favor revisa que toda la información sea correcta antes de confirmar.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Información de la cita</h3>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Médico</p>
                  <p className="text-gray-900">{doctor.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Especialidad</p>
                  <p className="text-gray-900">{doctor.specialty}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-gray-900">{format(selectedDate, 'd MMMM, yyyy', { locale: es })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hora</p>
                  <p className="text-gray-900">{selectedTimeSlot.time} hrs</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="text-gray-900">
                    {selectedConsultType === 'inperson' ? 'Consulta presencial' : 'Telemedicina'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Costo</p>
                  <p className="text-gray-900">${doctor.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">Información del paciente</h3>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Nombre</p>
                  <p className="text-gray-900">{patientInfo.firstName} {patientInfo.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Correo</p>
                  <p className="text-gray-900">{patientInfo.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-gray-900">{patientInfo.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Motivo</p>
                  <p className="text-gray-900">{patientInfo.reason}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={() => setShowConfirmModal(false)}
              variant="outline"
              fullWidth
            >
              Revisar información
            </Button>
            
            <Button
              onClick={handleConfirmBooking}
              variant="primary"
              fullWidth
            >
              Confirmar cita
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedBookingPage;