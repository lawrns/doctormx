import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Video, User, Plus, Filter,
  ChevronLeft, ChevronRight, Search, Phone, AlertCircle,
  CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage?: string;
  patientId: string;
  patientName: string;
  date: Date;
  time: string;
  duration: number; // minutes
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
  location?: {
    name: string;
    address: string;
    city: string;
  };
  videoLink?: string;
  cost: number;
  insuranceCoverage?: {
    provider: string;
    covered: boolean;
    amount: number;
  };
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Mock appointments data
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      doctorId: 'dr1',
      doctorName: 'Dra. María González',
      doctorSpecialty: 'Cardiología',
      patientId: user?.id || '',
      patientName: 'Tu',
      date: new Date('2024-03-20'),
      time: '10:00',
      duration: 30,
      type: 'video',
      status: 'confirmed',
      reason: 'Consulta de seguimiento - Presión arterial',
      videoLink: 'https://meet.doctormx.com/abc123',
      cost: 800,
      insuranceCoverage: {
        provider: 'IMSS',
        covered: true,
        amount: 800
      }
    },
    {
      id: '2',
      doctorId: 'dr2',
      doctorName: 'Dr. Carlos Mendoza',
      doctorSpecialty: 'Medicina General',
      patientId: user?.id || '',
      patientName: 'Carlos García Jr.',
      date: new Date('2024-03-22'),
      time: '16:30',
      duration: 45,
      type: 'in-person',
      status: 'scheduled',
      reason: 'Revisión general - Síntomas de gripe',
      location: {
        name: 'Hospital Ángeles',
        address: 'Av. Revolución 1234',
        city: 'CDMX'
      },
      cost: 1200
    }
  ]);

  const tabs = [
    { id: 'upcoming', label: 'Próximas' },
    { id: 'past', label: 'Pasadas' },
    { id: 'cancelled', label: 'Canceladas' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'scheduled': return Clock;
      case 'in-progress': return Loader2;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'phone': return Phone;
      default: return MapPin;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterSpecialty === 'all' || apt.doctorSpecialty === filterSpecialty;
    
    if (activeTab === 'upcoming') {
      return matchesSearch && matchesFilter && 
             ['scheduled', 'confirmed'].includes(apt.status) &&
             apt.date >= new Date();
    } else if (activeTab === 'past') {
      return matchesSearch && matchesFilter && 
             apt.status === 'completed';
    } else {
      return matchesSearch && matchesFilter && 
             apt.status === 'cancelled';
    }
  });

  const handleCancelAppointment = (appointmentId: string) => {
    if (window.confirm('¿Estás seguro de cancelar esta cita?')) {
      showToast('Cita cancelada exitosamente', 'info');
    }
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    navigate(`/appointments/${appointmentId}/reschedule`);
  };

  const handleJoinVideoCall = (videoLink: string) => {
    window.open(videoLink, '_blank');
  };

  return (
    <>
      <SEO 
        title="Mis Citas - DoctorMX"
        description="Gestiona tus citas médicas, consultas virtuales y seguimientos"
        keywords={['citas médicas', 'consultas virtuales', 'agendar cita doctor']}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
              
              <Button
                onClick={() => navigate('/appointments/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agendar Cita
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por doctor o motivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
            >
              <option value="all">Todas las especialidades</option>
              <option value="Medicina General">Medicina General</option>
              <option value="Cardiología">Cardiología</option>
              <option value="Pediatría">Pediatría</option>
              <option value="Ginecología">Ginecología</option>
              <option value="Dermatología">Dermatología</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointments List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => {
                  const StatusIcon = getStatusIcon(appointment.status);
                  const TypeIcon = getTypeIcon(appointment.type);
                  
                  return (
                    <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
                              <Badge className={getStatusColor(appointment.status)}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {appointment.status === 'confirmed' ? 'Confirmada' :
                                 appointment.status === 'scheduled' ? 'Agendada' :
                                 appointment.status === 'completed' ? 'Completada' :
                                 appointment.status === 'cancelled' ? 'Cancelada' : 
                                 'En progreso'}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600">{appointment.doctorSpecialty}</p>
                            
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                {appointment.date.toLocaleDateString('es-MX', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long'
                                })}
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2" />
                                {appointment.time} - {appointment.duration} minutos
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-600">
                                <TypeIcon className="w-4 h-4 mr-2" />
                                {appointment.type === 'video' ? 'Videoconsulta' :
                                 appointment.type === 'phone' ? 'Consulta telefónica' :
                                 appointment.location?.name}
                              </div>
                              
                              {appointment.patientName !== 'Tu' && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <User className="w-4 h-4 mr-2" />
                                  Paciente: {appointment.patientName}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700">Motivo:</p>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                            </div>
                            
                            {appointment.insuranceCoverage && (
                              <div className="mt-3 flex items-center text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                <span className="text-green-700">
                                  Cubierto por {appointment.insuranceCoverage.provider}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${appointment.cost} MXN
                          </p>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      {appointment.status === 'confirmed' && appointment.date >= new Date() && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                          {appointment.type === 'video' && appointment.videoLink && (
                            <Button
                              size="sm"
                              onClick={() => handleJoinVideoCall(appointment.videoLink!)}
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Unirse a videollamada
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRescheduleAppointment(appointment.id)}
                          >
                            Reagendar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })
              ) : (
                <Card className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tienes citas {activeTab === 'upcoming' ? 'próximas' : activeTab === 'past' ? 'pasadas' : 'canceladas'}</p>
                  {activeTab === 'upcoming' && (
                    <Button
                      className="mt-4"
                      onClick={() => navigate('/appointments/new')}
                    >
                      Agendar Primera Cita
                    </Button>
                  )}
                </Card>
              )}
            </div>

            {/* Calendar Widget */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Calendario</h3>
                
                {/* Simple Calendar */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-medium">
                      {selectedDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                      <div key={i} className="p-2 font-medium text-gray-600">
                        {day}
                      </div>
                    ))}
                    {/* Calendar days would go here */}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">Citas este mes</span>
                    <span className="text-lg font-bold text-blue-600">3</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-900">Completadas</span>
                    <span className="text-lg font-bold text-green-600">12</span>
                  </div>
                </div>

                {/* Next Appointment Reminder */}
                {filteredAppointments.length > 0 && activeTab === 'upcoming' && (
                  <Card className="mt-6 p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Próxima cita</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          {filteredAppointments[0].doctorName} - {' '}
                          {filteredAppointments[0].date.toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}