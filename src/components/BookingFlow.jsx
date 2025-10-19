import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';
import { useAuth } from '../contexts/AuthContext';

export default function BookingFlow({ 
  doctorId, 
  referralId, 
  onBookingComplete, 
  onClose 
}) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingData, setBookingData] = useState({
    duration: 30,
    type: 'consultation',
    notes: '',
    patientInfo: {
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: ''
    }
  });

  const steps = [
    { id: 1, title: 'Seleccionar Fecha', description: 'Elige el día para tu cita' },
    { id: 2, title: 'Seleccionar Hora', description: 'Elige el horario disponible' },
    { id: 3, title: 'Confirmar Datos', description: 'Revisa y confirma tu información' },
    { id: 4, title: 'Confirmación', description: 'Cita agendada exitosamente' }
  ];

  useEffect(() => {
    if (selectedDate && step === 2) {
      loadAvailableSlots();
    }
  }, [selectedDate, step]);

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/doctors/${doctorId}/slots/${selectedDate}`);
      if (response.ok) {
        const slots = await response.json();
        setAvailableSlots(slots);
      } else {
        throw new Error('Error al cargar horarios disponibles');
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      toast.error('Error al cargar horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(2);
  };

  const handleTimeSelect = (timeSlot) => {
    setSelectedTime(timeSlot);
    setStep(3);
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralId,
          doctorId,
          patientId: user?.id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          duration: bookingData.duration,
          type: bookingData.type,
          notes: bookingData.notes,
          patientInfo: bookingData.patientInfo
        })
      });

      if (response.ok) {
        const booking = await response.json();
        setStep(4);
        toast.success('¡Cita agendada exitosamente!');
        
        if (onBookingComplete) {
          onBookingComplete(booking);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al agendar la cita');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const formatTimeSlot = (timeSlot) => {
    return timeSlot.replace(':', 'h');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (step === 4) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Cita Confirmada!</h3>
          <p className="text-gray-600 mb-6">
            Tu cita ha sido agendada exitosamente para el{' '}
            <span className="font-semibold">{formatDate(selectedDate)}</span> a las{' '}
            <span className="font-semibold">{formatTimeSlot(selectedTime)}</span>
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Hora:</span>
              <span className="font-medium">{formatTimeSlot(selectedTime)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Duración:</span>
              <span className="font-medium">{bookingData.duration} minutos</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-medium capitalize">{bookingData.type}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              📧 Recibirás un recordatorio por email 24 horas antes de tu cita.
              <br />
              📱 También te enviaremos un recordatorio por WhatsApp 2 horas antes.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Entendido
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Agendar Cita</h2>
            <p className="text-gray-600">Paso {step} de 3</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.slice(0, 3).map((stepItem, index) => (
            <div key={stepItem.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepItem.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepItem.id}
              </div>
              <div className="ml-2 hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{stepItem.title}</p>
                <p className="text-xs text-gray-500">{stepItem.description}</p>
              </div>
              {index < 2 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  step > stepItem.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona una fecha</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {generateDateOptions().map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(date).toLocaleDateString('es-MX', { weekday: 'short' })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Horarios disponibles para {formatDate(selectedDate)}
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSelect(slot.timeSlot)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {formatTimeSlot(slot.timeSlot)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {slot.duration} min
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Seleccionar otra fecha
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirma tus datos</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Detalles de la cita</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium">{formatTimeSlot(selectedTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">{bookingData.duration} minutos</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de consulta
                </label>
                <select
                  value={bookingData.type}
                  onChange={(e) => setBookingData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="consultation">Consulta General</option>
                  <option value="follow_up">Seguimiento</option>
                  <option value="emergency">Urgencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe brevemente el motivo de tu consulta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de contacto (opcional)
                </label>
                <input
                  type="tel"
                  value={bookingData.patientInfo.phone}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    patientInfo: { ...prev.patientInfo, phone: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+52 55 1234 5678"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Agendando...' : 'Confirmar Cita'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
