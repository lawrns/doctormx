import { useState } from 'react';
import { Calendar, Video, Clock, MapPin, Check, AlertCircle } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  available: {
    today: boolean;
    nextAvailable: string;
    slots: {
      date: string;
      times: string[];
    }[];
  };
  location: string;
  telemedicine: boolean;
  rating: number;
}

interface FollowUpProps {
  recommendedSpecialty?: string;
  urgencyLevel?: 'routine' | 'soon' | 'urgent' | 'emergency';
  doctors?: Doctor[];
  onBookAppointment?: (doctorId: string, appointmentDetails: any) => void;
  symptomName?: string;
}

const FollowUp: React.FC<FollowUpProps> = ({
  recommendedSpecialty = 'Medicina General',
  urgencyLevel = 'routine',
  doctors = [],
  onBookAppointment,
  symptomName
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'telemedicine'>('in-person');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Generate the next 7 days for date selection
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 
          ? 'Hoy' 
          : i === 1 
          ? 'Mañana' 
          : date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      });
    }
    
    return dates;
  };

  // Get available time slots for selected date and doctor
  const getAvailableTimeSlots = () => {
    if (!selectedDoctor || !selectedDate) return [];
    
    const doctor = doctors.find(doc => doc.id === selectedDoctor);
    if (!doctor) return [];
    
    const dateSlot = doctor.available.slots.find(slot => slot.date === selectedDate);
    return dateSlot ? dateSlot.times : [];
  };

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    
    setBookingInProgress(true);
    
    // In a real app, this would call an API to book the appointment
    setTimeout(() => {
      if (onBookAppointment) {
        onBookAppointment(selectedDoctor, {
          date: selectedDate,
          time: selectedTime,
          type: appointmentType,
          specialty: recommendedSpecialty,
          symptom: symptomName
        });
      }
      
      setConfirmed(true);
      setBookingInProgress(false);
    }, 1500);
  };

  const getUrgencyMessage = () => {
    switch(urgencyLevel) {
      case 'emergency':
        return {
          message: 'Busque atención médica inmediatamente o llame a emergencias.',
          color: 'text-red-700 bg-red-50 border-red-200'
        };
      case 'urgent':
        return {
          message: 'Se recomienda atención médica en las próximas 24-48 horas.',
          color: 'text-amber-700 bg-amber-50 border-amber-200'
        };
      case 'soon':
        return {
          message: 'Se recomienda consultar con un médico en la próxima semana.',
          color: 'text-blue-700 bg-blue-50 border-blue-200'
        };
      default:
        return {
          message: 'Puede agendar una cita médica cuando le sea conveniente.',
          color: 'text-green-700 bg-green-50 border-green-200'
        };
    }
  };

  // If booking is confirmed, show confirmation message
  if (confirmed) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-green-50 border-b border-green-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-green-900 flex items-center">
            <Check size={20} className="mr-2" />
            Cita Confirmada
          </h3>
        </div>
        
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">¡Cita agendada con éxito!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Tu cita ha sido confirmada. Hemos enviado los detalles a tu correo electrónico.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-4">Detalles de la cita</h4>
            
            <div className="space-y-3">
              <div className="flex">
                <Calendar className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium">Fecha y hora</p>
                  <p className="text-gray-600">
                    {new Date(selectedDate!).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })} a las {selectedTime}
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mr-3 flex-shrink-0">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <div>
                  <p className="font-medium">Doctor</p>
                  <p className="text-gray-600">
                    {doctors.find(doc => doc.id === selectedDoctor)?.name} ({recommendedSpecialty})
                  </p>
                </div>
              </div>
              
              <div className="flex">
                {appointmentType === 'in-person' ? (
                  <MapPin className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                ) : (
                  <Video className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">Tipo de consulta</p>
                  <p className="text-gray-600">
                    {appointmentType === 'in-person' 
                      ? `Presencial - ${doctors.find(doc => doc.id === selectedDoctor)?.location}` 
                      : 'Telemedicina - Videoconsulta'}
                  </p>
                </div>
              </div>
              
              {symptomName && (
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mr-3 flex-shrink-0">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                  <div>
                    <p className="font-medium">Motivo</p>
                    <p className="text-gray-600">{symptomName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Si necesitas modificar o cancelar tu cita, puedes hacerlo hasta 24 horas antes a través de tu perfil o llamando a nuestro centro de atención.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-blue-900 flex items-center">
          <Calendar size={20} className="mr-2" />
          Agendar Consulta de Seguimiento
        </h3>
      </div>
      
      <div className="p-6">
        <div className={`p-4 rounded-lg border mb-6 ${getUrgencyMessage().color}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p>
                <strong>Nivel de atención recomendado:</strong> {getUrgencyMessage().message}
              </p>
            </div>
          </div>
        </div>
        
        {doctors.length > 0 ? (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona un especialista
              </label>
              <div className="space-y-3">
                {doctors.map(doctor => (
                  <div
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={`cursor-pointer border rounded-lg p-4 transition ${
                      selectedDoctor === doctor.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="h-12 w-12 rounded-full object-cover border border-gray-200"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-gray-900">{doctor.name}</h4>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        
                        <div className="flex items-center mt-1">
                          <div className="flex items-center text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={i < Math.floor(doctor.rating) ? "fill-current" : "stroke-current"}
                                width="12"
                                height="12"
                                viewBox="0 0 16 16"
                              >
                                <path d="M8 1.5l2.47 5.48 5.53.47-4.1 3.77 1.33 5.28L8 12.86l-5.23 3.64 1.33-5.28L0 7.45l5.53-.47L8 1.5z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-xs text-gray-500">{doctor.rating}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 text-right">
                        <div className="text-sm text-gray-500 flex items-center justify-end">
                          <Clock size={14} className="mr-1" />
                          {doctor.available.today ? 'Disponible hoy' : doctor.available.nextAvailable}
                        </div>
                        <div className="flex items-center mt-1 justify-end">
                          {doctor.telemedicine && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                              Telemedicina
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedDoctor && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de consulta
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setAppointmentType('in-person')}
                      className={`flex-1 flex items-center justify-center p-3 border rounded-lg ${
                        appointmentType === 'in-person'
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <MapPin size={20} className="mr-2" />
                      Presencial
                    </button>
                    <button
                      onClick={() => setAppointmentType('telemedicine')}
                      disabled={!doctors.find(d => d.id === selectedDoctor)?.telemedicine}
                      className={`flex-1 flex items-center justify-center p-3 border rounded-lg ${
                        doctors.find(d => d.id === selectedDoctor)?.telemedicine
                          ? appointmentType === 'telemedicine'
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Video size={20} className="mr-2" />
                      Telemedicina
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona una fecha
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {getDateOptions().map(date => (
                      <button
                        key={date.value}
                        onClick={() => {
                          setSelectedDate(date.value);
                          setSelectedTime(null);
                        }}
                        className={`p-2 border rounded-lg text-center ${
                          selectedDate === date.value
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="block text-sm">{date.label}</span>
                        <span className="block text-xs text-gray-500">{
                          date.label === 'Hoy' || date.label === 'Mañana' 
                            ? new Date(date.value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                            : ''
                        }</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {selectedDate && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecciona una hora
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {getAvailableTimeSlots().length > 0 ? (
                        getAvailableTimeSlots().map(time => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-2 border rounded-lg text-center ${
                              selectedTime === time
                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {time}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-4 text-gray-500">
                          <p>No hay horarios disponibles para esta fecha.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedDoctor && selectedDate && selectedTime && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleBookAppointment}
                      disabled={bookingInProgress}
                      className={`px-4 py-2 rounded-md text-white ${
                        bookingInProgress
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {bookingInProgress ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </span>
                      ) : (
                        'Confirmar cita'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mx-auto mb-3">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <h4 className="text-gray-700 font-medium mb-2">No hay especialistas disponibles</h4>
            <p className="text-gray-500">
              No encontramos especialistas disponibles en este momento para la especialidad de {recommendedSpecialty}.
            </p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Buscar otros especialistas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUp;