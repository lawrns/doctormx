import { Calendar, Video } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Import icons individually to prevent 'Clock is not defined' error
import Clock from 'lucide-react/dist/esm/icons/clock';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import { format, addDays } from '../utils/dateHelpers';
import { formatSpanishDate } from '../utils/dateHelpers';
import ProgressSteps from '../components/ProgressSteps';

// Mock doctor data
const mockDoctor = {
  id: '1',
  name: 'Dra. Ana García',
  specialty: 'Medicina General',
  location: 'Ciudad de México',
  address: 'Av. Insurgentes Sur 1234, Col. Del Valle',
  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
  price: 800,
  telemedicine: true,
  schedule: {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' },
    wednesday: { start: '09:00', end: '18:00' },
    thursday: { start: '09:00', end: '18:00' },
    friday: { start: '09:00', end: '14:00' },
    saturday: { start: '10:00', end: '14:00' },
    sunday: null
  }
};

// Define booking steps
const bookingSteps = [
  { id: 1, label: 'Fecha y hora' },
  { id: 2, label: 'Detalles' },
  { id: 3, label: 'Pago' }
];

function BookingPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [reason, setReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [step, setStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingError, setBookingError] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formHasBeenTouched, setFormHasBeenTouched] = useState(false);

  // Fetch doctor data
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setDoctor(mockDoctor);
      setLoading(false);
    }, 500);
  }, [doctorId]);
  
  // Add back-button protection for forms
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formHasBeenTouched) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Los cambios no se guardarán.';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formHasBeenTouched]);

  // Generate mock available slots for the selected date
  useEffect(() => {
    if (!doctor) return;
    
    const dayOfWeek = formatSpanishDate(selectedDate, 'EEEE').toLowerCase();
    const scheduleKey = dayOfWeek.toLowerCase();
    
    if (!doctor.schedule[scheduleKey]) {
      setAvailableSlots([]);
      return;
    }
    
    const { start, end } = doctor.schedule[scheduleKey];
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      // Add two slots per hour (on the hour and half past)
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    
    // Randomly mark some slots as unavailable
    const availableSlots = slots.map(slot => ({
      time: slot,
      available: Math.random() > 0.3 // 70% chance of being available
    }));
    
    setAvailableSlots(availableSlots);
    setSelectedTime(null); // Reset selected time when date changes
  }, [selectedDate, doctor]);

  // Generate next 14 days for date selection
  const next14Days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  const validateStep = () => {
    const errors = {};
    
    if (step === 1 && !selectedTime) {
      errors.time = 'Por favor selecciona un horario para tu cita';
    }
    
    if (step === 2 && !reason.trim()) {
      errors.reason = 'Por favor indica el motivo de tu consulta';
    }
    
    if (step === 3 && paymentMethod === 'card') {
      if (!cardDetails.cardNumber.trim()) {
        errors.cardNumber = 'Por favor ingresa el número de tarjeta';
      } else if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
        errors.cardNumber = 'El número de tarjeta debe tener 16 dígitos';
      }
      
      if (!cardDetails.expiry.trim()) {
        errors.expiry = 'Por favor ingresa la fecha de expiración';
      } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        errors.expiry = 'Formato inválido (MM/AA)';
      }
      
      if (!cardDetails.cvv.trim()) {
        errors.cvv = 'Por favor ingresa el código de seguridad';
      } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        errors.cvv = 'El CVV debe tener 3 o 4 dígitos';
      }
      
      if (!cardDetails.cardName.trim()) {
        errors.cardName = 'Por favor ingresa el nombre en la tarjeta';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep()) return;
    
    if (step === 1 && selectedTime) {
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2 && reason.trim()) {
      setStep(3);
      window.scrollTo(0, 0);
    } else if (step === 3) {
      // Check if user is authenticated before final booking
      if (!isAuthenticated) {
        // Redirect to login with return URL
        navigate(`/login?redirect=${encodeURIComponent(`/reservar/${doctorId}`)}&step=final`);
        return;
      }
      
      // Simulate booking process
      setLoading(true);
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        setLoading(false);
        if (success) {
          setBookingComplete(true);
        } else {
          setBookingError(true);
        }
        window.scrollTo(0, 0);
      }, 1500);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const formatDateForDisplay = (date) => {
    return formatSpanishDate(date, "EEEE d 'de' MMMM");
  };
  
  const handleCardNumberChange = (e) => {
    // Format card number with spaces every 4 digits
    let value = e.target.value.replace(/\s/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Add spaces every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    
    setCardDetails({
      ...cardDetails,
      cardNumber: value
    });
  };
  
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    setCardDetails({
      ...cardDetails,
      expiry: value
    });
  };
  
  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    setCardDetails({
      ...cardDetails,
      cvv: value
    });
  };

  if (loading && !bookingComplete && !bookingError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor && !bookingComplete && !bookingError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Médico no encontrado</h1>
        <p className="text-gray-600 mb-6">Lo sentimos, no pudimos encontrar el médico que estás buscando.</p>
        <button 
          onClick={() => navigate('/buscar')}
          className="btn-primary"
        >
          Buscar otros médicos
        </button>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Cita confirmada!</h1>
            <p className="text-gray-600 mb-6">
              Tu cita con {doctor.name} ha sido agendada para el {formatDateForDisplay(selectedDate)} a las {selectedTime}.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                  <p className="text-gray-600">{doctor.specialty}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar size={18} className="text-gray-500 mr-2" />
                  <span className="text-gray-700">{formatDateForDisplay(selectedDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={18} className="text-gray-500 mr-2" />
                  <span className="text-gray-700">{selectedTime}</span>
                </div>
                <div className="flex items-center">
                  {appointmentType === 'telemedicine' ? (
                    <>
                      <Video size={18} className="text-gray-500 mr-2" />
                      <span className="text-gray-700">Consulta por telemedicina</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={18} className="text-gray-500 mr-2" />
                      <span className="text-gray-700">{doctor.address}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Hemos enviado los detalles de tu cita a tu correo electrónico. También recibirás un recordatorio 24 horas antes de tu cita.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
              >
                Ver mis citas
              </button>
              <button 
                onClick={() => navigate('/')}
                className="btn-outline"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bookingError) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al agendar la cita</h1>
            <p className="text-gray-600 mb-6">
              Lo sentimos, ha ocurrido un error al intentar agendar tu cita. Por favor, inténtalo de nuevo más tarde.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => {
                  setBookingError(false);
                  setStep(1);
                }}
                className="btn-primary"
              >
                Intentar de nuevo
              </button>
              <button 
                onClick={() => navigate('/')}
                className="btn-outline"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Agendar cita</h1>
          <p className="text-gray-600">Completa los siguientes pasos para agendar tu cita con {doctor.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Progress steps */}
              <div className="p-4 border-b border-gray-200">
                <ProgressSteps steps={bookingSteps} currentStep={step} />
              </div>

              {/* Step content */}
              <div className="p-6">
                {step === 1 && (
                  <div className="animate-fade-in">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Selecciona fecha y hora</h2>
                    
                    {/* Date selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {next14Days.map((date, index) => {
                          const isSelected = selectedDate.toDateString() === date.toDateString();
                          const dayName = formatSpanishDate(date, 'EEE');
                          const dayNumber = format(date, 'd');
                          
                          return (
                            <button
                            key={index}
                            onClick={() => {
                              setSelectedDate(date);
                            setFormHasBeenTouched(true);
                            }}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                              isSelected 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                                aria-label={`Seleccionar fecha: ${formatSpanishDate(date, 'EEEE d MMMM')}`}
                                aria-pressed={isSelected}
                              >
                              <span className="text-xs uppercase">{dayName}</span>
                              <span className="font-medium">{dayNumber}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDateForDisplay(selectedDate)}
                      </p>
                    </div>
                    
                    {/* Time selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora
                      </label>
                      {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableSlots.map((slot, index) => (
                            <button
                              key={index}
                              disabled={!slot.available}
                              onClick={() => { 
                                if (slot.available) {
                                  setSelectedTime(slot.time);
                                  setFormHasBeenTouched(true);
                                }
                              }}
                              className={`py-2 px-3 rounded-lg text-center text-sm ${
                                selectedTime === slot.time
                                  ? 'bg-blue-600 text-white'
                                  : slot.available
                                    ? 'bg-white hover:bg-gray-100 text-gray-700'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                              aria-label={`Seleccionar hora: ${slot.time}`}
                              aria-pressed={selectedTime === slot.time}
                              aria-disabled={!slot.available}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                          No hay horarios disponibles para esta fecha
                        </p>
                      )}
                    </div>
                    
                    {formErrors.time && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.time}</p>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-fade-in">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles de la cita</h2>
                    
                    {/* Appointment type */}
                    {doctor.telemedicine && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de consulta
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setAppointmentType('in-person')}
                            className={`flex items-center p-4 border rounded-lg ${
                              appointmentType === 'in-person'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-300 bg-white hover:bg-gray-50'
                            }`}
                            aria-pressed={appointmentType === 'in-person'}
                          >
                            <MapPin size={24} className={appointmentType === 'in-person' ? 'text-blue-600' : 'text-gray-500'} />
                            <div className="ml-4 text-left">
                              <h3 className={`font-medium ${appointmentType === 'in-person' ? 'text-blue-600' : 'text-gray-900'}`}>
                                Presencial
                              </h3>
                              <p className="text-sm text-gray-500">
                                Visita al consultorio
                              </p>
                            </div>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setAppointmentType('telemedicine')}
                            className={`flex items-center p-4 border rounded-lg ${
                              appointmentType === 'telemedicine'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-300 bg-white hover:bg-gray-50'
                            }`}
                            aria-pressed={appointmentType === 'telemedicine'}
                          >
                            <Video size={24} className={appointmentType === 'telemedicine' ? 'text-blue-600' : 'text-gray-500'} />
                            <div className="ml-4 text-left">
                              <h3 className={`font-medium ${appointmentType === 'telemedicine' ? 'text-blue-600' : 'text-gray-900'}`}>
                                Telemedicina
                              </h3>
                              <p className="text-sm text-gray-500">
                                Consulta por videollamada
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Reason for visit */}
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                        Motivo de la consulta
                      </label>
                      <textarea
                        id="reason"
                        rows={4}
                        className={`input-field ${formErrors.reason ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Describe brevemente el motivo de tu consulta"
                        value={reason}
                        onChange={(e) => {
                          setReason(e.target.value);
                          setFormHasBeenTouched(true);
                        }}
                        aria-describedby="reason-error"
                      ></textarea>
                      {formErrors.reason ? (
                        <p id="reason-error" className="mt-2 text-sm text-red-600">{formErrors.reason}</p>
                      ) : (
                        <p className="text-sm text-gray-500 mt-2">
                          Esta información ayudará al médico a prepararse para tu consulta.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-fade-in">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Método de pago</h2>
                    
                    <div className="mb-6">
                      <div className="grid grid-cols-1 gap-4">
                        <label className={`flex items-center p-4 border rounded-lg ${
                          paymentMethod === 'card'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 bg-white'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            className="h-4 w-4 text-blue-600"
                          />
                          <div className="ml-4 flex items-center">
                            <CreditCard size={20} className="text-gray-500 mr-2" />
                            <span className="font-medium text-gray-900">Tarjeta de crédito o débito</span>
                          </div>
                        </label>
                        
                        <label className={`flex items-center p-4 border rounded-lg ${
                          paymentMethod === 'cash'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 bg-white'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={() => setPaymentMethod('cash')}
                            className="h-4 w-4 text-blue-600"
                          />
                          <div className="ml-4">
                            <span className="font-medium text-gray-900">Pago en consultorio</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    {paymentMethod === 'card' && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-600 mb-4">
                          Se realizará un cargo de ${doctor.price} a tu tarjeta para confirmar la cita.
                        </p>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                              Número de tarjeta
                            </label>
                            <input
                              type="text"
                              id="cardNumber"
                              className={`input-field ${formErrors.cardNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                              placeholder="1234 5678 9012 3456"
                              value={cardDetails.cardNumber}
                              onChange={handleCardNumberChange}
                              aria-describedby="cardNumber-error"
                            />
                            {formErrors.cardNumber && (
                              <p id="cardNumber-error" className="mt-1 text-sm text-red-600">{formErrors.cardNumber}</p>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de expiración
                              </label>
                              <input
                                type="text"
                                id="expiry"
                                className={`input-field ${formErrors.expiry ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="MM/AA"
                                value={cardDetails.expiry}
                                onChange={handleExpiryChange}
                                aria-describedby="expiry-error"
                              />
                              {formErrors.expiry && (
                                <p id="expiry-error" className="mt-1 text-sm text-red-600">{formErrors.expiry}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                                CVV
                              </label>
                              <input
                                type="text"
                                id="cvv"
                                className={`input-field ${formErrors.cvv ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="123"
                                value={cardDetails.cvv}
                                onChange={handleCvvChange}
                                aria-describedby="cvv-error"
                              />
                              {formErrors.cvv && (
                                <p id="cvv-error" className="mt-1 text-sm text-red-600">{formErrors.cvv}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre en la tarjeta
                            </label>
                            <input
                              type="text"
                              id="cardName"
                              className={`input-field ${formErrors.cardName ? 'border-red-500 focus:ring-red-500' : ''}`}
                              placeholder="Juan Pérez"
                              value={cardDetails.cardName}
                              onChange={(e) => setCardDetails({...cardDetails, cardName: e.target.value})}
                              aria-describedby="cardName-error"
                            />
                            {formErrors.cardName && (
                              <p id="cardName-error" className="mt-1 text-sm text-red-600">{formErrors.cardName}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Política de cancelación</h3>
                      <p className="text-sm text-gray-600">
                        Puedes cancelar o reprogramar tu cita hasta 24 horas antes sin costo. Las cancelaciones con menos de 24 horas de anticipación pueden estar sujetas a un cargo.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className={`btn-outline ${step === 1 ? 'invisible' : ''}`}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={step === 1 && !selectedTime || step === 2 && !reason.trim()}
                  className={`btn-primary ${
                    (step === 1 && !selectedTime) || (step === 2 && !reason.trim())
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {step === 3 ? 'Confirmar cita' : 'Continuar'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de la cita</h2>
              
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                  <p className="text-gray-600">{doctor.specialty}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {selectedDate && (
                  <div className="flex items-center">
                    <Calendar size={18} className="text-gray-500 mr-2" />
                    <span className="text-gray-700">{formatDateForDisplay(selectedDate)}</span>
                  </div>
                )}
                
                {selectedTime && (
                  <div className="flex items-center">
                    <Clock size={18} className="text-gray-500 mr-2" />
                    <span className="text-gray-700">{selectedTime}</span>
                  </div>
                )}
                
                {step >= 2 && (
                  <div className="flex items-center">
                    {appointmentType === 'telemedicine' ? (
                      <>
                        <Video size={18} className="text-gray-500 mr-2" />
                        <span className="text-gray-700">Consulta por telemedicina</span>
                      </>
                    ) : (
                      <>
                        <MapPin size={18} className="text-gray-500 mr-2" />
                        <span className="text-gray-700">{doctor.address}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Precio de consulta</span>
                  <span className="font-medium text-gray-900">${doctor.price}</span>
                </div>
                
                <div className="flex justify-between font-medium text-lg mt-4">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">${doctor.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;