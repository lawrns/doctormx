import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Video, MapPin, MoreVertical, Calendar } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Button } from '../ui';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  patient: {
    id: string;
    name?: string;
    email?: string;
  };
  location_type: 'in_person' | 'telemedicine';
  status: 'scheduled' | 'completed' | 'cancelled';
  title?: string;
  description?: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
  showActions?: boolean;
  compact?: boolean;
}

// Fallback date formatting functions if utils aren't available
const fallbackFormatDate = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

const fallbackFormatTime = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const AppointmentList: React.FC<AppointmentListProps> = ({ 
  appointments, 
  showActions = false,
  compact = false
}) => {
  const navigate = useNavigate();
  
  // Use provided format functions or fallbacks
  const formatDateFn = formatDate || fallbackFormatDate;
  const formatTimeFn = formatTime || fallbackFormatTime;
  
  if (appointments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
        No hay citas programadas
      </div>
    );
  }
  
  const handleStartConsultation = (appointmentId: string) => {
    navigate(`/telemedicina/consulta/appointment-${appointmentId}`);
  };
  
  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <div 
          key={appointment.id} 
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="bg-white p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  {appointment.patient?.name || appointment.patient?.email || 'Paciente'}
                </h3>
                
                {!compact && (
                  <p className="text-sm text-gray-500 mt-1">
                    {appointment.title || (appointment.location_type === 'telemedicine' ? 'Consulta virtual' : 'Consulta presencial')}
                  </p>
                )}
              </div>
              
              {!compact && (
                <div className="flex items-start">
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.location_type === 'telemedicine' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {appointment.location_type === 'telemedicine' ? 'Telemedicina' : 'Presencial'}
                  </span>
                  
                  <button className="ml-2 text-gray-400 hover:text-gray-500">
                    <MoreVertical size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={16} className="mr-1 text-gray-400" />
                {formatDateFn(appointment.start_time)}
              </div>
              
              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                <Clock size={16} className="mr-1 text-gray-400" />
                {formatTimeFn(appointment.start_time)}
              </div>
            </div>
            
            {!compact && appointment.location_type === 'in_person' && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <MapPin size={16} className="mr-1 text-gray-400" />
                Av. Insurgentes Sur 1234, Col. Del Valle
              </div>
            )}
            
            {showActions && (
              <div className="mt-4 flex justify-end space-x-3">
                {appointment.location_type === 'telemedicine' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    icon={<Video size={16} />}
                    onClick={() => handleStartConsultation(appointment.id)}
                  >
                    Iniciar consulta
                  </Button>
                )}
                
                <Button variant="outline" size="sm">
                  Ver detalles
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentList;