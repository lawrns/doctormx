import { ChevronLeft, ChevronRight, Calendar, FileText, FileText, Calendar, FileText, Check, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
// Import each icon individually to prevent issues
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Clock from 'lucide-react/dist/esm/icons/clock';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Users from 'lucide-react/dist/esm/icons/users';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Check from 'lucide-react/dist/esm/icons/check';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import { format, addDays, startOfWeek, addWeeks, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  price: number;
  image: string;
}

interface AppointmentSchedulerProps {
  doctorId: string;
  onAppointmentBooked: (appointmentDetails: any) => void;
}

const EnhancedAppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ 
  doctorId,
  onAppointmentBooked
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'telemedicine'>('in-person');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [insurance, setInsurance] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<number>(0);
  
  // Load doctor information
  useEffect(() => {
    // In a real app, this would be an API call
    // Simulating data fetch
    setTimeout(() => {
      setDoctor({
        id: doctorId,
        name: 'Dra. Ana García',
        specialty: 'Medicina General',
        price: 800,
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      });
      
      // Simulate recent appointment data
      setRecentAppointments(Math.floor(Math.random() * 5) + 2);
    }, 500);
  }, [doctorId]);

  // Generate available slots for the selected date
  useEffect(() => {
    if (!selectedDate) return;
    
    // In a real app, this would be an API call to get available slots
    // for the specific doctor and date
    
    // Simulate loading
    setAvailableSlots([]);
    
    // Simulate API delay
    setTimeout(() => {
      const slots: TimeSlot[] = [];
      const startHour = 9; // 9 AM
      const endHour = 18; // 6 PM
      
      for (let hour = startHour; hour < endHour; hour++) {
        // Add two slots per hour (on the hour and half past)
        slots.push({
          time: `${hour}:00`,
          available: Math.random() > 0.3 // 70% chance of being available
        });
        
        slots.push({
          time: `${hour}:30`,
          available: Math.random() > 0.3
        });
      }
      
      setAvailableSlots(slots);
    }, 300);
  }, [selectedDate]);

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handlePrevWeek = () => {
    // Don't allow going to past weeks
    if (currentWeekStart >= new Date()) {
      setCurrentWeekStart(addWeeks(currentWeekStart, -1));
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time selection when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !appointmentType) {
      setBookingError('Por favor selecciona todos los campos requeridos');
      return;
    }
    
    setBookingInProgress(true);
    setBookingError(null);
    
    try {
      // In a real app, this would be an API call to create the appointment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create appointment details
      const appointmentDetails = {
        doctorId,
        doctorName: doctor?.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        type: appointmentType,
        insurance,
        paymentMethod,
        notes,
        createdAt: new Date().toISOString()
      };
      
      // Save to local storage for demo
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      appointments.push(appointmentDetails);
      localStorage.setItem('appointments', JSON.stringify(appointments));
      
      // Call the success callback
      onAppointmentBooked(appointmentDetails);
    } catch (error) {
      setBookingError('Hubo un error al agendar tu cita. Por favor intenta nuevamente.');
    } finally {
      setBookingInProgress(false);
    }
  };

  // Generate week days for calendar
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Render the week calendar
  const renderWeekCalendar = () => {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevWeek}
            className="p-1 rounded-full bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Semana anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-gray-700 dark:text-gray-300 font-medium">
            {format(currentWeekStart, 'MMMM yyyy', { locale: es })}
          </div>
          <button
            onClick={handleNextWeek}
            className="p-1 rounded-full bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Semana siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((date, index) => {
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
            const dayName = format(date, 'EEE', { locale: es });
            const dayNumber = format(date, 'd');
            const isToday = isSameDay(date, new Date());
            
            return (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : isToday
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-pressed={isSelected}
                aria-label={`${dayName} ${dayNumber}`}
              >
                <span className="text-xs uppercase">{dayName}</span>
                <span className="font-medium">{dayNumber}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render time slots
  const renderTimeSlots = () => {
    if (availableSlots.length === 0) {
      return (
        <div className="flex justify-center items-center h-40 bg-gray-50 dark:bg-dark-border rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {availableSlots.map((slot, index) => (
          <button
            key={index}
            disabled={!slot.available}
            onClick={() => slot.available && handleTimeSelect(slot.time)}
            className={`py-2 px-3 rounded-lg text-center text-sm transition-colors ${
              selectedTime === slot.time
                ? 'bg-blue-600 text-white'
                : slot.available
                  ? 'bg-white dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : 'bg-gray-100 dark:bg-dark-border text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            aria-pressed={selectedTime === slot.time}
            aria-disabled={!slot.available}
          >
            {slot.time}
          </button>
        ))}
      </div>
    );
  };

  // Render appointment type selection
  const renderAppointmentTypeSelection = () => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Tipo de consulta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setAppointmentType('in-person')}
            className={`p-4 rounded-lg border-2 flex items-start ${
              appointmentType === 'in-person'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:border-blue-500'
                : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card'
            }`}
            aria-pressed={appointmentType === 'in-person'}
          >
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className={`h-5 w-5 rounded-full border-2 mr-2 flex items-center justify-center ${
                  appointmentType === 'in-person'
                    ? 'border-blue-600 dark:border-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {appointmentType === 'in-person' && (
                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500"></div>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Consulta Presencial</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Asiste al consultorio del médico para tu cita en persona
              </p>
            </div>
          </button>
          
          <button
            onClick={() => setAppointmentType('telemedicine')}
            className={`p-4 rounded-lg border-2 flex items-start ${
              appointmentType === 'telemedicine'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:border-blue-500'
                : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card'
            }`}
            aria-pressed={appointmentType === 'telemedicine'}
          >
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className={`h-5 w-5 rounded-full border-2 mr-2 flex items-center justify-center ${
                  appointmentType === 'telemedicine'
                    ? 'border-blue-600 dark:border-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {appointmentType === 'telemedicine' && (
                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500"></div>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Telemedicina</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consulta en línea desde la comodidad de tu hogar u oficina
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  };

  // Render patient information form
  const renderPatientInfoForm = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Información del paciente</h2>
        
        <div>
          <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Seguro médico (opcional)
          </label>
          <select
            id="insurance"
            value={insurance || ''}
            onChange={(e) => setInsurance(e.target.value || null)}
            className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300"
          >
            <option value="">No usar seguro</option>
            <option value="gnp">GNP Seguros</option>
            <option value="axa">AXA Seguros</option>
            <option value="metlife">MetLife</option>
            <option value="monterrey">Seguros Monterrey</option>
            <option value="allianz">Allianz</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="payment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Método de pago
          </label>
          <select
            id="payment"
            value={paymentMethod || ''}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300"
            required
          >
            <option value="">Seleccionar método de pago</option>
            <option value="credit_card">Tarjeta de crédito/débito</option>
            <option value="cash">Efectivo (en consultorio)</option>
            <option value="transfer">Transferencia bancaria</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas para el médico (opcional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 resize-none"
            placeholder="Síntomas, preguntas o información relevante para el médico"
          ></textarea>
        </div>
      </div>
    );
  };

  // Render confirmation step
  const renderConfirmation = () => {
    if (!doctor || !selectedDate || !selectedTime) return null;
    
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Confirma tu cita</h2>
        
        {/* Doctor info */}
        <div className="flex items-center p-4 bg-gray-50 dark:bg-dark-border rounded-lg">
          <img 
            src={doctor.image} 
            alt={doctor.name} 
            className="w-16 h-16 rounded-full mr-4 object-cover"
          />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{doctor.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{doctor.specialty}</p>
          </div>
        </div>
        
        {/* Appointment details */}
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-dark-border rounded-lg">
          <div className="flex items-start">
            <Calendar size={20} className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: es })}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Fecha de la cita</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock size={20} className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{selectedTime} hrs</p>
              <p className="text-gray-600 dark:text-gray-400">Hora de la cita</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <CreditCard size={20} className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {paymentMethod === 'credit_card' ? 'Tarjeta de crédito/débito' :
                 paymentMethod === 'cash' ? 'Efectivo (en consultorio)' :
                 paymentMethod === 'transfer' ? 'Transferencia bancaria' : 'No seleccionado'}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Método de pago</p>
            </div>
          </div>
          
          {insurance && (
            <div className="flex items-start">
              <FileText size={20} className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {insurance === 'gnp' ? 'GNP Seguros' :
                   insurance === 'axa' ? 'AXA Seguros' :
                   insurance === 'metlife' ? 'MetLife' :
                   insurance === 'monterrey' ? 'Seguros Monterrey' :
                   insurance === 'allianz' ? 'Allianz' : ''}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Seguro médico</p>
              </div>
            </div>
          )}
          
          {notes && (
            <div className="flex items-start">
              <FileText size={20} className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Notas:</p>
                <p className="text-gray-600 dark:text-gray-400">{notes}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Price */}
        <div className="border-t border-gray-200 dark:border-dark-border pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700 dark:text-gray-300">Total a pagar:</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">${doctor.price}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {appointmentType === 'in-person' 
              ? 'Pago en consultorio el día de tu cita' 
              : 'Se procesará el pago al confirmar la cita'}
          </p>
        </div>
        
        {/* Terms */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            Al confirmar, aceptas nuestros <a href="/terminos" className="text-blue-600 dark:text-blue-400 hover:underline">Términos y Condiciones</a> y <a href="/privacidad" className="text-blue-600 dark:text-blue-400 hover:underline">Política de Privacidad</a>.
          </p>
        </div>
      </div>
    );
  };

  // Render progress bar
  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-500 dark:text-gray-400'
            }`}>
              <Calendar size={16} />
            </div>
            <div className={`ml-2 ${
              currentStep >= 1 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
            }`}>
              Fecha y hora
            </div>
          </div>
          
          <div className={`flex-1 mx-4 h-1 ${
            currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-dark-border'
          }`}></div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-500 dark:text-gray-400'
            }`}>
              <FileText size={16} />
            </div>
            <div className={`ml-2 ${
              currentStep >= 2 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
            }`}>
              Datos
            </div>
          </div>
          
          <div className={`flex-1 mx-4 h-1 ${
            currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-dark-border'
          }`}></div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-500 dark:text-gray-400'
            }`}>
              <Check size={16} />
            </div>
            <div className={`ml-2 ${
              currentStep >= 3 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
            }`}>
              Confirmar
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render urgency indicator
  const renderUrgencyIndicator = () => {
    if (!recentAppointments || recentAppointments < 2) return null;
    
    return (
      <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 dark:border-amber-500 p-4 rounded-r-lg mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Users className="h-5 w-5 text-amber-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <span className="font-medium">Alta demanda:</span> {recentAppointments} personas han reservado cita con este médico en las últimas 24 horas.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6">
      {renderProgressBar()}
      
      {/* Doctor header - always visible */}
      {doctor && (
        <div className="flex items-center p-4 bg-gray-50 dark:bg-dark-border rounded-lg mb-6">
          <img 
            src={doctor.image} 
            alt={doctor.name} 
            className="w-16 h-16 rounded-full mr-4 object-cover"
          />
          <div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100">{doctor.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{doctor.specialty}</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">${doctor.price}</p>
          </div>
        </div>
      )}
      
      {renderUrgencyIndicator()}
      
      {/* Error message */}
      {bookingError && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-r-lg mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{bookingError}</p>
            </div>
          </div>
        </div>
      )}
      
      {currentStep === 1 && (
        <>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Selecciona fecha y hora</h2>
          
          {renderWeekCalendar()}
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Horarios disponibles para el {format(selectedDate, 'EEEE d MMMM', { locale: es })}
          </h3>
          
          {renderTimeSlots()}
          
          {renderAppointmentTypeSelection()}
          
          <div className="mt-8 text-right">
            <button
              onClick={handleNextStep}
              disabled={!selectedDate || !selectedTime}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
      
      {currentStep === 2 && (
        <>
          {renderPatientInfoForm()}
          
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevStep}
              className="px-6 py-2 bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Anterior
            </button>
            
            <button
              onClick={handleNextStep}
              disabled={!paymentMethod}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
      
      {currentStep === 3 && (
        <>
          {renderConfirmation()}
          
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevStep}
              className="px-6 py-2 bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Anterior
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={bookingInProgress}
              className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors ${
                bookingInProgress ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {bookingInProgress ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Procesando...
                </span>
              ) : (
                'Confirmar cita'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedAppointmentScheduler;
