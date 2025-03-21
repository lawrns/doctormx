import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import { 
  Card, 
  Button, 
  Badge,
  Input
} from '../../components/ui';
import { 
  Clock, 
  User, 
  Video, 
  ArrowRight, 
  Search, 
  Calendar, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  appointment: {
    id: string;
    scheduledTime: string;
    reason: string;
    status: 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'no-show' | 'cancelled';
    waitingSince?: Date;
  };
}

const WaitingRoomPage: React.FC = () => {
  const { doctorId } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [waitingPatients, setWaitingPatients] = useState<Patient[]>([]);
  const [upcomingPatients, setUpcomingPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Auto-refresh timer
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Fetch waiting room data
  useEffect(() => {
    const fetchWaitingRoomData = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          // Mock waiting patients
          const mockWaitingPatients: Patient[] = [
            {
              id: 'pat_1',
              name: 'María López García',
              age: 36,
              appointment: {
                id: 'app_1',
                scheduledTime: '10:00',
                reason: 'Control de diabetes e hipertensión',
                status: 'waiting',
                waitingSince: new Date(Date.now() - 15 * 60000) // 15 minutes ago
              }
            },
            {
              id: 'pat_2',
              name: 'Juan Rodríguez Vega',
              age: 42,
              appointment: {
                id: 'app_2',
                scheduledTime: '10:30',
                reason: 'Dolor de espalda persistente',
                status: 'waiting',
                waitingSince: new Date(Date.now() - 5 * 60000) // 5 minutes ago
              }
            }
          ];
          
          // Mock upcoming patients
          const mockUpcomingPatients: Patient[] = [
            {
              id: 'pat_3',
              name: 'Ana García Martínez',
              age: 28,
              appointment: {
                id: 'app_3',
                scheduledTime: '11:00',
                reason: 'Primera consulta - Cefalea',
                status: 'scheduled'
              }
            },
            {
              id: 'pat_4',
              name: 'Carlos Fernández Ruiz',
              age: 55,
              appointment: {
                id: 'app_4',
                scheduledTime: '11:30',
                reason: 'Seguimiento de tratamiento',
                status: 'scheduled'
              }
            },
            {
              id: 'pat_5',
              name: 'Laura Sánchez Pérez',
              age: 32,
              appointment: {
                id: 'app_5',
                scheduledTime: '12:00',
                reason: 'Revisión de exámenes',
                status: 'scheduled'
              }
            }
          ];
          
          setWaitingPatients(mockWaitingPatients);
          setUpcomingPatients(mockUpcomingPatients);
          setLastRefreshed(new Date());
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching waiting room data:', error);
        setLoading(false);
      }
    };
    
    fetchWaitingRoomData();
    
    // Set up auto-refresh timer
    const refreshTimer = setInterval(() => {
      if (autoRefresh) {
        fetchWaitingRoomData();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(refreshTimer);
    };
  }, [doctorId, autoRefresh]);
  
  // Filter patients based on search term
  const filteredWaitingPatients = waitingPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredUpcomingPatients = upcomingPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Start consultation with patient - FIXED: using React Router navigation
  const startConsultation = (patient: Patient, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Using React Router navigation instead of direct window location
      navigate(`/doctor-dashboard/telemedicine/consultation/${patient.appointment.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Error al iniciar la consulta. Por favor, inténtelo de nuevo.');
    }
  };
  
  // Send message to patient
  const sendMessage = (patient: Patient, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // In a real implementation, open a messaging interface
    alert(`Enviar mensaje a ${patient.name}`);
  };
  
  // Mark patient as no-show
  const markAsNoShow = (patient: Patient, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Update patient status
    const updatedWaitingPatients = waitingPatients.filter(p => p.id !== patient.id);
    
    // Add to upcoming with no-show status
    const updatedUpcomingPatients = [...upcomingPatients];
    const patientWithUpdatedStatus = {
      ...patient,
      appointment: {
        ...patient.appointment,
        status: 'no-show' as const
      }
    };
    updatedUpcomingPatients.push(patientWithUpdatedStatus);
    
    setWaitingPatients(updatedWaitingPatients);
    setUpcomingPatients(updatedUpcomingPatients);
    
    // In a real implementation, update in Supabase
  };
  
  // Calculate wait time
  const calculateWaitTime = (waitingSince: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - waitingSince.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };
  
  // Format time (24h to 12h)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="primary">En espera</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Programada</Badge>;
      case 'in-progress':
        return <Badge variant="info">En consulta</Badge>;
      case 'completed':
        return <Badge variant="success">Completada</Badge>;
      case 'no-show':
        return <Badge variant="danger">No asistió</Badge>;
      case 'cancelled':
        return <Badge variant="warning">Cancelada</Badge>;
      default:
        return null;
    }
  };
  
  // Manually refresh the data
  const refreshData = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    // In a real implementation, re-fetch the data
    setTimeout(() => {
      setLastRefreshed(new Date());
      setLoading(false);
    }, 500);
  };
  
  // Safely navigate to a route with error handling
  const safeNavigate = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Error de navegación. Por favor, inténtelo de nuevo.');
    }
  };
  
  return (
    <DashboardLayout title="Sala de Espera Virtual" loading={loading}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sala de Espera Virtual</h1>
          <p className="text-gray-500">Gestiona los pacientes esperando su consulta por telemedicina</p>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2 appearance-auto"
              style={{
                WebkitAppearance: 'checkbox',
                MozAppearance: 'checkbox',
                appearance: 'checkbox'
              }}
            />
            <label htmlFor="auto-refresh" className="text-sm text-gray-700">
              Actualización automática
            </label>
          </div>
          
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={refreshData}
          >
            Actualizar
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
        <div>
          Última actualización: {lastRefreshed.toLocaleTimeString()}
        </div>
        <div>
          {autoRefresh && (
            <div className="flex items-center">
              <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              Actualizando cada 30 segundos
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar paciente o motivo de consulta"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={16} />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Waiting Patients */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock size={20} className="text-blue-500 mr-2" />
            Pacientes en Espera 
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {filteredWaitingPatients.length}
            </span>
          </h2>
          
          {filteredWaitingPatients.length > 0 ? (
            <div className="space-y-4">
              {filteredWaitingPatients.map((patient) => (
                <Card key={patient.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-lg mr-3">
                        {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">{patient.name}</h3>
                        <div className="text-sm text-gray-500">
                          {patient.age} años · Cita: {formatTime(patient.appointment.scheduledTime)}
                        </div>
                        <div className="flex items-center mt-1">
                          {getStatusBadge(patient.appointment.status)}
                          
                          {patient.appointment.waitingSince && (
                            <span className="ml-2 text-sm text-gray-500 flex items-center">
                              <Clock size={14} className="mr-1" />
                              Esperando: {calculateWaitTime(patient.appointment.waitingSince)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        icon={<MessageSquare size={16} />}
                        onClick={(e) => sendMessage(patient, e)}
                      >
                        Mensaje
                      </Button>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Video size={16} />}
                        onClick={(e) => startConsultation(patient, e)}
                      >
                        Iniciar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Motivo de consulta:</div>
                        <p className="text-sm text-gray-700">{patient.appointment.reason}</p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        icon={<XCircle size={16} />}
                        onClick={(e) => markAsNoShow(patient, e)}
                      >
                        No asistió
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No hay pacientes en espera</h3>
              <p className="text-gray-500 mb-4">
                Los pacientes aparecerán aquí cuando se conecten a la sala de espera virtual.
              </p>
            </Card>
          )}
        </div>
        
        {/* Upcoming Appointments */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calendar size={20} className="text-purple-500 mr-2" />
            Próximas Citas
            <span className="ml-2 bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {filteredUpcomingPatients.length}
            </span>
          </h2>
          
          {filteredUpcomingPatients.length > 0 ? (
            <div className="space-y-4">
              {filteredUpcomingPatients.map((patient) => (
                <Card key={patient.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-lg mr-3">
                        {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">{patient.name}</h3>
                        <div className="text-sm text-gray-500">
                          {patient.age} años · Cita: {formatTime(patient.appointment.scheduledTime)}
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(patient.appointment.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex">
                      {patient.appointment.status === 'scheduled' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            icon={<MessageSquare size={16} />}
                            onClick={(e) => sendMessage(patient, e)}
                          >
                            Mensaje
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<ArrowRight size={16} />}
                            onClick={(e) => safeNavigate(`/doctor-dashboard/appointments/${patient.appointment.id}`, e)}
                          >
                            Detalles
                          </Button>
                        </>
                      )}
                      
                      {patient.appointment.status === 'no-show' && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Calendar size={16} />}
                          onClick={(e) => safeNavigate(`/doctor-dashboard/appointments/new?patientId=${patient.id}`, e)}
                        >
                          Reprogramar
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Motivo de consulta:</div>
                    <p className="text-sm text-gray-700">{patient.appointment.reason}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No hay citas próximas</h3>
              <p className="text-gray-500 mb-4">
                Las próximas citas programadas aparecerán aquí.
              </p>
              <Button
                variant="outline"
                icon={<Calendar size={16} />}
                onClick={(e) => safeNavigate('/doctor-dashboard/appointments', e)}
              >
                Ver agenda completa
              </Button>
            </Card>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <Card className="p-6 bg-blue-50">
          <div className="flex items-start">
            <Info size={24} className="text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Información sobre la Sala de Espera Virtual</h3>
              <p className="text-sm text-gray-700 mb-3">
                Los pacientes pueden unirse a la sala de espera virtual hasta 15 minutos antes de su cita programada. Usted recibirá una notificación cuando un paciente se una a la sala de espera.
              </p>
              <p className="text-sm text-gray-700">
                Los pacientes en espera pueden ver su posición en la cola y el tiempo estimado de espera. Puede enviarles mensajes para informarles sobre retrasos o proporcionar instrucciones.
              </p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg flex items-start">
                  <CheckCircle size={18} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Buenas prácticas</p>
                    <p className="text-xs text-gray-600">
                      Informe a los pacientes sobre posibles retrasos y mantenga la comunicación activa.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg flex items-start">
                  <AlertCircle size={18} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Precauciones</p>
                    <p className="text-xs text-gray-600">
                      No deje a un paciente esperando más de 15 minutos sin enviar una actualización.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaitingRoomPage;