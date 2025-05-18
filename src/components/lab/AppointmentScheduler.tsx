import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, isBefore, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { fetchAvailability, createLabRequest, scheduleLabAppointment, AvailabilitySlot } from '../../services/labTestingService';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';

interface AppointmentData {
  date: string;
  time: string;
  address: string;
  zipCode: string;
}

interface TestRequestData {
  tests: string[];
  instructions: string;
}

interface Props {
  testData: TestRequestData;
  onScheduled: (data: AppointmentData, requestId: string) => void;
  initialData?: AppointmentData | null;
}

const AppointmentScheduler: React.FC<Props> = ({ testData, onScheduled, initialData }) => {
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [zipCode, setZipCode] = useState(initialData?.zipCode || '');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [requestId, setRequestId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAvailability()
      .then((data) => setAvailability(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !address || !zipCode) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      let reqId = requestId;
      
      // If we don't have a request ID yet, create the test request
      if (!reqId) {
        try {
          const requestResponse = await createLabRequest(
            testData.tests,
            testData.instructions + (additionalInstructions ? `\nInstrucciones adicionales: ${additionalInstructions}` : '')
          );
          reqId = requestResponse.id;
          setRequestId(reqId);
        } catch (err: any) {
          console.error('Error creating lab request:', err);
          throw new Error(`Error creating lab request: ${err.message}`);
        }
      }
      
      // Schedule the appointment
      try {
        const fullAddress = `${address}${zipCode ? `, CP ${zipCode}` : ''}${additionalInstructions ? `. ${additionalInstructions}` : ''}`;
        await scheduleLabAppointment(date, time, fullAddress);
      } catch (err: any) {
        console.error('Error scheduling appointment:', err);
        throw new Error(`Error scheduling appointment: ${err.message}`);
      }
      
      const appointmentData: AppointmentData = {
        date,
        time,
        address,
        zipCode
      };
      
      onScheduled(appointmentData, reqId!);
    } catch (err: any) {
      console.error('Error in appointment process:', err);
      setError(err.message || 'Ha ocurrido un error. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper functions for calendar
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    
    // Don't allow navigating to past months
    if (prevMonth.getMonth() >= new Date().getMonth() || 
        prevMonth.getFullYear() > new Date().getFullYear()) {
      setCurrentMonth(prevMonth);
    }
  };
  
  const isDateAvailable = (dateStr: string) => {
    return availability.some(slot => slot.date === dateStr && slot.slots.length > 0);
  };
  
  const getTimeSlotsForDate = (dateStr: string) => {
    const slot = availability.find(slot => slot.date === dateStr);
    return slot ? slot.slots : [];
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Add empty slots for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Don't allow selecting dates in the past
      const isPast = isBefore(date, new Date()) && !isSameDay(date, new Date());
      const isAvailable = !isPast && isDateAvailable(dateStr);
      
      days.push({
        date,
        dateStr,
        isAvailable,
        isPast
      });
    }
    
    return days;
  };
  
  const days = generateCalendarDays();
  
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3 w-full">
            <div className="h-40 bg-gray-200 rounded w-full"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !date && !time) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 font-medium">
          Error al cargar disponibilidad: {error}
        </p>
        <p className="text-gray-600 mt-2">
          Por favor, intenta de nuevo más tarde o contacta a soporte.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar section */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-brand-jade-600" />
            Selecciona fecha
          </h3>
          
          {/* Month navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h4 className="text-lg font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h4>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-sm font-medium py-2">
                {day}
              </div>
            ))}
            {days.map((day, i) => (
              <div key={i} className="aspect-w-1 aspect-h-1">
                {day ? (
                  <button
                    type="button"
                    onClick={() => day.isAvailable && setDate(day.dateStr)}
                    disabled={!day.isAvailable}
                    className={`w-full h-full flex items-center justify-center rounded-md text-sm
                      ${day.isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                      ${day.isAvailable ? 'hover:bg-brand-jade-50 cursor-pointer' : 'cursor-not-allowed'}
                      ${date === day.dateStr ? 'bg-brand-jade-600 text-white hover:bg-brand-jade-700' : ''}
                    `}
                  >
                    {day.date.getDate()}
                  </button>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Time selection */}
          {date && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-brand-jade-600" />
                Selecciona hora
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {getTimeSlotsForDate(date).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`py-2 px-4 border rounded-md text-center
                      ${time === slot 
                        ? 'bg-brand-jade-600 text-white border-brand-jade-600' 
                        : 'border-gray-300 hover:bg-brand-jade-50'
                      }
                    `}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Address section */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-brand-jade-600" />
            Dirección para la visita
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección completa
              </label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, colonia, municipio, estado"
                className="w-full"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código postal
              </label>
              <Input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                placeholder="05000"
                maxLength={5}
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instrucciones para llegar (opcional)
              </label>
              <Textarea
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="Ej. Edificio azul, 3er piso, departamento 302, tocar el timbre..."
                className="w-full"
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      {date && time && address && (
        <div className="bg-brand-jade-50 p-4 rounded-lg border border-brand-jade-100">
          <h3 className="font-medium text-brand-jade-800 mb-2">Resumen de tu cita:</h3>
          <div className="space-y-2 text-gray-700">
            <p className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-brand-jade-600" />
              Fecha: <span className="font-medium ml-1">
                {format(parseISO(date), 'EEEE d', { locale: es })} de {format(parseISO(date), 'MMMM yyyy', { locale: es })}
              </span>
            </p>
            <p className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-brand-jade-600" />
              Hora: <span className="font-medium ml-1">{time}</span>
            </p>
            <p className="flex items-start">
              <MapPin className="w-4 h-4 mr-2 mt-1 text-brand-jade-600" />
              Dirección: <span className="font-medium ml-1">{address}, CP {zipCode}</span>
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Un técnico certificado llegará a tu domicilio en la fecha y hora programada. 
            Por favor, asegúrate de seguir las instrucciones de preparación para cada examen seleccionado.
          </p>
        </div>
      )}
      
      {/* Submit button */}
      <button
        type="submit"
        disabled={!date || !time || !address || !zipCode || isSubmitting}
        className={`w-full py-3 rounded-md font-medium ${
          !date || !time || !address || !zipCode || isSubmitting
            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
            : 'bg-brand-jade-600 hover:bg-brand-jade-700 text-white'
        }`}
      >
        {isSubmitting ? 'Agendando...' : 'Confirmar cita'}
      </button>
      
      {(!date || !time || !address || !zipCode) && (
        <p className="text-amber-600 text-sm text-center">
          Por favor completa todos los campos para continuar.
        </p>
      )}
    </form>
  );
};

export default AppointmentScheduler;