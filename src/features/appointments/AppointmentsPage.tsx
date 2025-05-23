import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, User, Phone, Video, 
  Plus, Filter, Search, CheckCircle, AlertTriangle,
  Edit, Trash2, MessageSquare, Star, Bell
} from 'lucide-react';

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  date: Date;
  duration: number;
  type: 'virtual' | 'in-person' | 'home-visit';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  location?: string;
  notes?: string;
  price: number;
  rating?: number;
}

const AppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'virtual' | 'in-person' | 'home-visit'>('all');

  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      doctorName: 'Dra. María González',
      doctorSpecialty: 'Cardiología',
      doctorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
      date: new Date(Date.now() + 86400000), // Tomorrow
      duration: 30,
      type: 'virtual',
      status: 'scheduled',
      notes: 'Control de presión arterial',
      price: 800
    },
    {
      id: '2',
      doctorName: 'Dr. Carlos Mendoza',
      doctorSpecialty: 'Dermatología',
      doctorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      duration: 45,
      type: 'in-person',
      status: 'scheduled',
      location: 'Av. Reforma 123, Col. Centro',
      notes: 'Revisión de lunares',
      price: 600
    },
    {
      id: '3',
      doctorName: 'Dra. Ana Rodríguez',
      doctorSpecialty: 'Pediatría',
      doctorImage: 'https://images.unsplash.com/photo-1594824541406-27717d7e3b59?w=300&h=300&fit=crop&crop=face',
      date: new Date(Date.now() - 86400000), // Yesterday
      duration: 30,
      type: 'virtual',
      status: 'completed',
      notes: 'Consulta pediátrica de rutina',
      price: 500,
      rating: 5
    }
  ]);

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.doctorSpecialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || apt.type === filterType;
    const matchesTab = 
      (activeTab === 'upcoming' && apt.status === 'scheduled' && apt.date > new Date()) ||
      (activeTab === 'past' && (apt.status === 'completed' || apt.date < new Date())) ||
      (activeTab === 'cancelled' && apt.status === 'cancelled');
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'rescheduled': return 'Reprogramada';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual': return <Video className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
      case 'home-visit': return <User className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'virtual': return 'Virtual';
      case 'in-person': return 'Presencial';
      case 'home-visit': return 'A domicilio';
      default: return type;
    }
  };

  const AppointmentCard: React.FC<{ appointment: Appointment; index: number }> = ({ appointment, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          <img 
            src={appointment.doctorImage} 
            alt={appointment.doctorName}
            className="w-full h-full object-cover"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
              }
            }}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
              <p className="text-brand-jade-600 font-medium">{appointment.doctorSpecialty}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span>{appointment.date.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="w-4 h-4" />
                <span>
                  {appointment.date.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} • {appointment.duration} min
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getTypeIcon(appointment.type)}
                <span>{getTypeLabel(appointment.type)}</span>
              </div>
            </div>

            <div>
              {appointment.location && (
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{appointment.location}</span>
                </div>
              )}
              {appointment.notes && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Motivo: </span>
                  {appointment.notes}
                </div>
              )}
              <div className="text-lg font-bold text-gray-900">
                ${appointment.price}
              </div>
            </div>
          </div>

          {appointment.rating && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Tu calificación:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < appointment.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {appointment.status === 'scheduled' && appointment.date > new Date() && (
              <>
                {appointment.type === 'virtual' && (
                  <button className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors text-sm">
                    <Video className="w-4 h-4 mr-2 inline" />
                    Unirse a consulta
                  </button>
                )}
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Edit className="w-4 h-4 mr-2 inline" />
                  Reprogramar
                </button>
                <button className="border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm">
                  <Trash2 className="w-4 h-4 mr-2 inline" />
                  Cancelar
                </button>
              </>
            )}
            
            {appointment.status === 'completed' && (
              <>
                <button className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors text-sm">
                  Ver Receta
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <MessageSquare className="w-4 h-4 mr-2 inline" />
                  Contactar Doctor
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Reservar Nuevamente
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Citas Médicas</h1>
            <p className="text-gray-600 mt-1">Gestiona tus citas médicas programadas y pasadas</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="text-sm">Recordatorios</span>
            </button>
            <button className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nueva Cita
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por doctor o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
          >
            <option value="all">Todos los tipos</option>
            <option value="virtual">Virtual</option>
            <option value="in-person">Presencial</option>
            <option value="home-visit">A domicilio</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'upcoming', label: 'Próximas', icon: Calendar, count: appointments.filter(a => a.status === 'scheduled' && a.date > new Date()).length },
            { id: 'past', label: 'Pasadas', icon: CheckCircle, count: appointments.filter(a => a.status === 'completed' || a.date < new Date()).length },
            { id: 'cancelled', label: 'Canceladas', icon: AlertTriangle, count: appointments.filter(a => a.status === 'cancelled').length }
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-brand-jade-500 text-brand-jade-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === id
                    ? 'bg-brand-jade-100 text-brand-jade-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === 'upcoming' ? 'No hay citas próximas' : 
                 activeTab === 'past' ? 'No hay citas pasadas' : 'No hay citas canceladas'}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'upcoming' ? 'Agenda tu primera cita médica' : 
                 activeTab === 'past' ? 'Tus citas completadas aparecerán aquí' : 'Las citas canceladas aparecerán aquí'}
              </p>
              {activeTab === 'upcoming' && (
                <button className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors">
                  Buscar Doctores
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage; 