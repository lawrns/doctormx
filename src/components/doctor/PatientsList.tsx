import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '../ui';
import { User, Calendar, FileText, AlertCircle, MessageCircle, Clock } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  lastVisit?: Date | null;
  status?: 'new' | 'follow-up' | 'lab' | 'regular';
  statusText?: string;
  email?: string;
  phone?: string;
  diagnosis?: string;
  nextAppointment?: Date | null;
}

interface PatientsListProps {
  patients: Patient[];
  variant?: 'default' | 'activity';
  showActions?: boolean;
}

const PatientsList: React.FC<PatientsListProps> = ({ 
  patients, 
  variant = 'default',
  showActions = false
}) => {
  const navigate = useNavigate();
  
  if (patients.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
        No hay pacientes para mostrar
      </div>
    );
  }
  
  // Activity view (for dashboard)
  if (variant === 'activity') {
    return (
      <div className="space-y-3">
        {patients.map((patient) => (
          <div 
            key={patient.id} 
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                  
                  {patient.status && (
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        patient.status === 'new' 
                          ? 'bg-blue-100 text-blue-800' 
                          : patient.status === 'follow-up'
                            ? 'bg-yellow-100 text-yellow-800'
                            : patient.status === 'lab'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {patient.status === 'new' && 'Nuevo'}
                      {patient.status === 'follow-up' && 'Seguimiento'}
                      {patient.status === 'lab' && 'Resultados'}
                      {patient.status === 'regular' && 'Regular'}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mt-1">
                  {patient.statusText || (
                    patient.lastVisit 
                      ? `Última visita: ${formatDistance(patient.lastVisit, new Date(), { locale: es, addSuffix: true })}` 
                      : 'Sin visitas previas'
                  )}
                </p>
                
                <div className="mt-2 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="xs"
                    onClick={() => navigate(`/doctor-dashboard/patients/${patient.id}`)}
                  >
                    Ver detalles
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="xs"
                    onClick={() => navigate(`/doctor-dashboard/appointments/new?patientId=${patient.id}`)}
                  >
                    Agendar cita
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Default view (full patient list)
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paciente
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Última visita
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            {showActions && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500">
                      {patient.email || 'Sin correo'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {patient.lastVisit 
                    ? format(patient.lastVisit, 'PPP', { locale: es })
                    : 'Sin visitas previas'}
                </div>
                {patient.diagnosis && (
                  <div className="text-sm text-gray-500">{patient.diagnosis}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    patient.status === 'new' 
                      ? 'bg-blue-100 text-blue-800' 
                      : patient.status === 'follow-up'
                        ? 'bg-yellow-100 text-yellow-800'
                        : patient.status === 'lab'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {patient.status === 'new' && 'Nuevo paciente'}
                  {patient.status === 'follow-up' && 'Seguimiento pendiente'}
                  {patient.status === 'lab' && 'Resultados pendientes'}
                  {patient.status === 'regular' && 'Regular'}
                  {!patient.status && 'Sin estado'}
                </span>
                
                {patient.nextAppointment && (
                  <div className="text-sm text-gray-500 mt-1 flex items-center">
                    <Calendar size={14} className="mr-1" />
                    Próxima cita: {format(patient.nextAppointment, 'PPP', { locale: es })}
                  </div>
                )}
              </td>
              
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="xs"
                      icon={<FileText size={14} />}
                      onClick={() => navigate(`/doctor-dashboard/patients/${patient.id}`)}
                    >
                      Expediente
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="xs"
                      icon={<Calendar size={14} />}
                      onClick={() => navigate(`/doctor-dashboard/appointments/new?patientId=${patient.id}`)}
                    >
                      Agendar
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="xs"
                      icon={<MessageCircle size={14} />}
                      onClick={() => navigate(`/telemedicina/consulta/new?patientId=${patient.id}`)}
                    >
                      Consulta
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsList;