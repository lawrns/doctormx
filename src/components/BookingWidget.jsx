import { useState, useEffect } from 'react';
import Button from './ui/Button';
import Icon from './ui/Icon';
import Badge from './ui/Badge';
import Alert from './ui/Alert';

export default function BookingWidget({ doctor, onBookingComplete }) {
  const [selectedService, setSelectedService] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Services offered by the doctor
  const services = [
    { id: 'consultation', name: 'Consulta General', price: doctor.consultation_fees?.base_fee || 800 },
    { id: 'telemedicine', name: 'Consulta Telemedicina', price: doctor.consultation_fees?.telemedicine_fee || 640 },
    { id: 'followup', name: 'Consulta de Seguimiento', price: doctor.consultation_fees?.follow_up_fee || 500 }
  ];

  // Insurance providers
  const insuranceProviders = [
    'Particular',
    'IMSS',
    'ISSSTE',
    'Seguro Popular',
    'GNP',
    'AXA',
    'Metlife',
    'Zurich'
  ];

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          available: Math.random() > 0.3 // Simulate availability
        });
      }
    }
    
    return slots;
  };

  useEffect(() => {
    if (selectedDate) {
      setAvailableSlots(generateTimeSlots());
    }
  }, [selectedDate]);

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call the onBookingComplete callback
      if (onBookingComplete) {
        onBookingComplete({
          service: selectedService,
          insurance: selectedInsurance,
          isFirstVisit,
          date: selectedDate,
          time: selectedTime,
          doctor: doctor.full_name
        });
      }

      // Reset form
      setSelectedService('');
      setSelectedInsurance('');
      setIsFirstVisit(true);
      setSelectedDate('');
      setSelectedTime('');
      
    } catch (error) {
      setError('Error al agendar la cita. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-neutral-200">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">Agendar Cita</h3>
      
      {error && (
        <Alert variant="error" message={error} className="mb-4" />
      )}

      <div className="space-y-6">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">
            <Icon name="medical-symbol" size="sm" className="inline mr-2" />
            Servicio
          </label>
          <div className="space-y-2">
            {services.map((service) => (
              <label key={service.id} className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                <input
                  type="radio"
                  name="service"
                  value={service.id}
                  checked={selectedService === service.id}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <span className="font-medium text-neutral-900">{service.name}</span>
                  <span className="text-sm text-neutral-600 ml-2">${service.price} MXN</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Insurance Provider */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">
            <Icon name="shield-check" size="sm" className="inline mr-2" />
            Aseguradora
          </label>
          <select
            value={selectedInsurance}
            onChange={(e) => setSelectedInsurance(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Selecciona tu aseguradora</option>
            {insuranceProviders.map((provider) => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>

        {/* First Visit Question */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">
            ¿Es tu primera visita con este especialista?
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="firstVisit"
                checked={isFirstVisit}
                onChange={() => setIsFirstVisit(true)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-neutral-700">Sí, es mi primera visita</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="firstVisit"
                checked={!isFirstVisit}
                onChange={() => setIsFirstVisit(false)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-neutral-700">No, ya he consultado antes</span>
            </label>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">
            <Icon name="calendar-days" size="sm" className="inline mr-2" />
            Fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              <Icon name="clock" size="sm" className="inline mr-2" />
              Horario Disponible
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    selectedTime === slot.time
                      ? 'bg-primary-600 text-white border-primary-600'
                      : slot.available
                      ? 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Booking Summary */}
        {selectedService && selectedDate && selectedTime && (
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
            <h4 className="font-semibold text-primary-900 mb-2">Resumen de la Cita</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-700">Servicio:</span>
                <span className="font-medium text-primary-900">
                  {services.find(s => s.id === selectedService)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-700">Fecha:</span>
                <span className="font-medium text-primary-900">
                  {new Date(selectedDate).toLocaleDateString('es-MX')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-700">Hora:</span>
                <span className="font-medium text-primary-900">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-700">Precio:</span>
                <span className="font-medium text-primary-900">
                  ${services.find(s => s.id === selectedService)?.price} MXN
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Book Button */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleBooking}
          loading={loading}
          disabled={!selectedService || !selectedDate || !selectedTime}
          className="mt-6"
        >
          <Icon name="calendar-days" size="sm" className="mr-2" />
          {loading ? 'Agendando...' : 'Confirmar Cita'}
        </Button>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-4 text-xs text-neutral-500 pt-4 border-t border-neutral-200">
          <div className="flex items-center gap-1">
            <Icon name="shield-check" size="xs" />
            <span>Cita confirmada</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="clock" size="xs" />
            <span>Recordatorio automático</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="lock-closed" size="xs" />
            <span>Datos seguros</span>
          </div>
        </div>
      </div>
    </div>
  );
}
