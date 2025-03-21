import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import { 
  Card, 
  Button, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Input,
  Badge
} from '../../components/ui';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Video, 
  MessageSquare, 
  MapPin, 
  FileText, 
  Info, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  MoreHorizontal,
  Edit,
  Trash,
  X,
  Check,
  ArrowRight,
  Mail,
  Calendar
} from 'lucide-react';
// Custom calendar implementation instead of react-calendar

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: Date;
  time: string;
  duration: number;
  type: 'presential' | 'telemedicine';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes: string;
}

const AppointmentsPage: React.FC = () => {
  const { doctorId } = useAuth();
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState('day');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Calendar view types
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDateForView, setSelectedDateForView] = useState<Date>(new Date());
  
  // Time slots
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];
  
  // Days of the week
  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  // Format date helpers
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };
  
  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          // Generate mock appointments for today and surrounding days
          const today = new Date();
          const mockAppointments: Appointment[] = [];
          
          // Past appointments (last 5 days)
          for (let i = 5; i >= 1; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            
            // Add 2-3 random appointments per day
            const count = Math.floor(Math.random() * 2) + 2;
            for (let j = 0; j < count; j++) {
              const hour = 8 + Math.floor(Math.random() * 10);
              mockAppointments.push({
                id: `app_past_${i}_${j}`,
                patientId: `pat_${100 + j}`,
                patientName: ['María López', 'Juan Pérez', 'Ana García', 'Carlos Rodríguez', 'Laura Martínez'][Math.floor(Math.random() * 5)],
                patientPhone: '+52 55 1234 5678',
                patientEmail: 'paciente@example.com',
                date: new Date(date),
                time: `${hour}:${Math.random() > 0.5 ? '00' : '30'}`,
                duration: 30,
                type: Math.random() > 0.3 ? 'presential' : 'telemedicine',
                status: Math.random() > 0.2 ? 'completed' : 'no-show',
                reason: 'Consulta de seguimiento',
                notes: 'Paciente con hipertensión controlada.'
              });
            }
          }
          
          // Today's appointments
          for (let j = 0; j < 5; j++) {
            const hour = 8 + Math.floor(Math.random() * 10);
            const minutes = Math.random() > 0.5 ? '00' : '30';
            const time = `${hour}:${minutes}`;
            const isPast = today.getHours() > hour || (today.getHours() === hour && today.getMinutes() > parseInt(minutes));
            
            mockAppointments.push({
              id: `app_today_${j}`,
              patientId: `pat_${200 + j}`,
              patientName: ['María López', 'Juan Pérez', 'Ana García', 'Carlos Rodríguez', 'Laura Martínez'][Math.floor(Math.random() * 5)],
              patientPhone: '+52 55 1234 5678',
              patientEmail: 'paciente@example.com',
              date: new Date(today),
              time: time,
              duration: 30,
              type: Math.random() > 0.3 ? 'presential' : 'telemedicine',
              status: isPast ? 'completed' : (Math.random() > 0.7 ? 'confirmed' : 'scheduled'),
              reason: Math.random() > 0.5 ? 'Consulta general' : 'Control de rutina',
              notes: ''
            });
          }
          
          // Future appointments (next 10 days)
          for (let i = 1; i <= 10; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            
            // Add 0-4 random appointments per day
            const count = Math.floor(Math.random() * 4);
            for (let j = 0; j < count; j++) {
              const hour = 8 + Math.floor(Math.random() * 10);
              mockAppointments.push({
                id: `app_future_${i}_${j}`,
                patientId: `pat_${300 + j}`,
                patientName: ['María López', 'Juan Pérez', 'Ana García', 'Carlos Rodríguez', 'Laura Martínez'][Math.floor(Math.random() * 5)],
                patientPhone: '+52 55 1234 5678',
                patientEmail: 'paciente@example.com',
                date: new Date(date),
                time: `${hour}:${Math.random() > 0.5 ? '00' : '30'}`,
                duration: 30,
                type: Math.random() > 0.3 ? 'presential' : 'telemedicine',
                status: Math.random() > 0.2 ? 'scheduled' : 'confirmed',
                reason: Math.random() > 0.5 ? 'Primera consulta' : 'Consulta de seguimiento',
                notes: ''
              });
            }
          }
          
          // If appointmentId is provided, find the appointment
          if (appointmentId) {
            const appointment = mockAppointments.find(app => app.id === appointmentId);
            if (appointment) {
              setSelectedAppointment(appointment);
              setSelectedDate(appointment.date);
            }
          }
          
          setAppointments(mockAppointments);
          filterAppointments(mockAppointments, selectedDate, searchTerm, statusFilter);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [doctorId, appointmentId]);
  
  // Filter appointments based on selected date, search term, and status
  const filterAppointments = (
    allAppointments: Appointment[],
    date: Date,
    search: string,
    status: string
  ) => {
    let filtered = allAppointments;
    
    // Filter by date if in day view
    if (view === 'day') {
      filtered = filtered.filter(app => 
        app.date.getDate() === date.getDate() &&
        app.date.getMonth() === date.getMonth() &&
        app.date.getFullYear() === date.getFullYear()
      );
    }
    
    // Filter by week if in week view
    if (view === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      filtered = filtered.filter(app => 
        app.date >= startOfWeek && app.date <= endOfWeek
      );
    }
    
    // Filter by month if in month view
    if (view === 'month') {
      filtered = filtered.filter(app => 
        app.date.getMonth() === date.getMonth() &&
        app.date.getFullYear() === date.getFullYear()
      );
    }
    
    // Filter by search term
    if (search) {
      const lowercaseSearch = search.toLowerCase();
      filtered = filtered.filter(app =>
        app.patientName.toLowerCase().includes(lowercaseSearch) ||
        app.reason.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(app => app.status === status);
    }
    
    // Sort by time
    filtered.sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    });
    
    setFilteredAppointments(filtered);
  };
  
  // Handle date change
  useEffect(() => {
    filterAppointments(appointments, selectedDateForView, searchTerm, statusFilter);
  }, [appointments, selectedDateForView, searchTerm, statusFilter, view]);
  
  // Change selected date for view
  const changeSelectedDate = (date: Date) => {
    setSelectedDateForView(date);
    setSelectedDate(date);
  };
  
  // Get week dates
  const getWeekDates = () => {
    const startOfWeek = new Date(selectedDateForView);
    startOfWeek.setDate(selectedDateForView.getDate() - selectedDateForView.getDay());
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    
    return weekDates;
  };
  
  // Navigate week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDateForView);
    newDate.setDate(selectedDateForView.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDateForView(newDate);
  };
  
  // Navigate month
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDateForView);
    newDate.setMonth(selectedDateForView.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDateForView(newDate);
  };
  
  // Get appointments for a specific time slot
  const getAppointmentsForTimeSlot = (date: Date, time: string) => {
    return filteredAppointments.filter(app => 
      app.date.getDate() === date.getDate() &&
      app.date.getMonth() === date.getMonth() &&
      app.date.getFullYear() === date.getFullYear() &&
      app.time === time
    );
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="info">Agendada</Badge>;
      case 'confirmed':
        return <Badge variant="primary">Confirmada</Badge>;
      case 'completed':
        return <Badge variant="success">Completada</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelada</Badge>;
      case 'no-show':
        return <Badge variant="danger">No asistió</Badge>;
      default:
        return null;
    }
  };
  
  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'presential':
        return <Badge variant="secondary">Presencial</Badge>;
      case 'telemedicine':
        return <Badge variant="info">Telemedicina</Badge>;
      default:
        return null;
    }
  };
  
  // Handle new appointment click
  const handleNewAppointment = () => {
    navigate('/doctor-dashboard/appointments/new');
  };
  
  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    navigate(`/doctor-dashboard/appointments/${appointment.id}`);
  };
  
  // Start consultation
  const handleStartConsultation = () => {
    if (selectedAppointment) {
      navigate(`/doctor-dashboard/telemedicine/consultation/${selectedAppointment.id}`);
    }
  };
  
  // Update appointment status
  const handleUpdateStatus = (status: Appointment['status']) => {
    if (selectedAppointment) {
      const updatedAppointment = { ...selectedAppointment, status };
      const updatedAppointments = appointments.map(app => 
        app.id === selectedAppointment.id ? updatedAppointment : app
      );
      
      setAppointments(updatedAppointments);
      setSelectedAppointment(updatedAppointment);
      
      // In a real implementation, update in Supabase
      // For now, just update local state
    }
  };
  
  // Format time with AM/PM
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${amPm}`;
  };
  
  // Navigate day
  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDateForView);
    newDate.setDate(selectedDateForView.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDateForView(newDate);
  };
  
  return (
    <DashboardLayout title="Citas" loading={loading}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda de Citas</h1>
          <p className="text-gray-500">Administra y organiza tus consultas médicas</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
          
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleNewAppointment}
          >
            Nueva Cita
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar paciente</label>
              <Input
                placeholder="Nombre o motivo de consulta"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="scheduled">Agendadas</option>
                <option value="confirmed">Confirmadas</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
                <option value="no-show">No asistió</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Limpiar
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar sidebar */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="custom-calendar">
              <div className="simple-calendar">
                <div className="calendar-header flex justify-between items-center mb-4">
                  <button onClick={() => {
                    const prevMonth = new Date(selectedDate);
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    changeSelectedDate(prevMonth);
                  }}>
                    <ChevronLeft size={16} />
                  </button>
                  <div className="text-center font-medium">
                    {selectedDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                  </div>
                  <button onClick={() => {
                    const nextMonth = new Date(selectedDate);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    changeSelectedDate(nextMonth);
                  }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
                    <div key={day} className="text-xs font-medium text-gray-500 p-2">{day}</div>
                  ))}
                  
                  {/* Calendar days would be generated here */}
                  {Array.from({ length: 35 }).map((_, index) => {
                    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), index - new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay() + 1);
                    const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const hasAppointment = appointments.some(app => 
                      app.date.getDate() === date.getDate() &&
                      app.date.getMonth() === date.getMonth() &&
                      app.date.getFullYear() === date.getFullYear()
                    );
                    
                    return (
                      <button 
                        key={index}
                        className={`p-2 rounded-full text-sm ${!isCurrentMonth ? 'text-gray-300' : ''} 
                          ${isToday ? 'border border-blue-500' : ''}
                          ${isSelected ? 'bg-blue-500 text-white' : ''}
                          ${hasAppointment && !isSelected ? 'bg-blue-100 text-blue-700 font-medium' : ''}`}
                        onClick={() => changeSelectedDate(date)}
                        disabled={!isCurrentMonth}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <h2 className="font-medium text-gray-700 mb-3">Próximas citas</h2>
            
            <div className="space-y-3">
              {appointments
                .filter(app => 
                  app.status !== 'completed' && 
                  app.status !== 'cancelled' && 
                  app.date >= new Date()
                )
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map(appointment => (
                  <div
                    key={appointment.id}
                    className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{appointment.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(appointment.date)} - {formatTime(appointment.time)}
                        </p>
                      </div>
                      {getTypeBadge(appointment.type)}
                    </div>
                  </div>
                ))}
              
              {appointments.filter(app => 
                app.status !== 'completed' && 
                app.status !== 'cancelled' && 
                app.date >= new Date()
              ).length === 0 && (
                <div className="text-center py-6">
                  <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No hay próximas citas</p>
                </div>
              )}
            </div>
          </Card>
          
          <Card className="p-4 bg-blue-50">
            <div className="flex items-start">
              <Info size={20} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Consejos para tu agenda</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Recuerda confirmar las citas un día antes para reducir las ausencias y mejorar la satisfacción del paciente.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 text-blue-600 p-0"
                >
                  Más información
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Appointments View */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            {/* View switcher */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-1">
                <Button
                  variant={view === 'day' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setView('day')}
                >
                  Día
                </Button>
                <Button
                  variant={view === 'week' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setView('week')}
                >
                  Semana
                </Button>
                <Button
                  variant={view === 'month' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setView('month')}
                >
                  Mes
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ChevronLeft size={16} />}
                  onClick={() => {
                    if (view === 'day') navigateDay('prev');
                    else if (view === 'week') navigateWeek('prev');
                    else navigateMonth('prev');
                  }}
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    setSelectedDateForView(today);
                    setSelectedDate(today);
                  }}
                >
                  Hoy
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ChevronRight size={16} />}
                  onClick={() => {
                    if (view === 'day') navigateDay('next');
                    else if (view === 'week') navigateWeek('next');
                    else navigateMonth('next');
                  }}
                />
              </div>
            </div>
            
            {/* Day view */}
            {view === 'day' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {formatDate(selectedDateForView)}
                </h2>
                
                <div className="space-y-2">
                  {timeSlots.map(time => {
                    const appointmentsForSlot = getAppointmentsForTimeSlot(selectedDateForView, time);
                    
                    return (
                      <div key={time} className="flex">
                        <div className="w-16 text-gray-500 py-2 text-right pr-4">
                          {formatTime(time)}
                        </div>
                        
                        <div className="flex-1 min-h-[60px] border-l border-gray-200 pl-4">
                          {appointmentsForSlot.length > 0 ? (
                            appointmentsForSlot.map(appointment => (
                              <div
                                key={appointment.id}
                                className={`p-3 mb-2 rounded-lg cursor-pointer ${
                                  appointment.type === 'telemedicine'
                                    ? 'bg-blue-50 border-l-4 border-blue-500'
                                    : 'bg-green-50 border-l-4 border-green-500'
                                }`}
                                onClick={() => handleAppointmentClick(appointment)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{appointment.patientName}</p>
                                    <p className="text-sm text-gray-600">{appointment.reason}</p>
                                  </div>
                                  {getStatusBadge(appointment.status)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div 
                              className="p-2 h-full min-h-[60px] border border-dashed border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition flex items-center justify-center"
                              onClick={() => {
                                const timeDate = new Date(selectedDateForView);
                                const [hours, minutes] = time.split(':').map(Number);
                                timeDate.setHours(hours, minutes);
                                navigate(`/doctor-dashboard/appointments/new?date=${timeDate.toISOString()}`);
                              }}
                            >
                              <p className="text-sm text-gray-400">Disponible</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Week view */}
            {view === 'week' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Semana del {formatShortDate(getWeekDates()[0])} al {formatShortDate(getWeekDates()[6])}
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                      <tr>
                        <th className="w-16"></th>
                        {getWeekDates().map((date, index) => (
                          <th 
                            key={index} 
                            className={`text-center p-2 ${
                              date.getDate() === new Date().getDate() &&
                              date.getMonth() === new Date().getMonth() &&
                              date.getFullYear() === new Date().getFullYear()
                                ? 'bg-blue-50'
                                : ''
                            }`}
                          >
                            <div className="font-medium">{daysOfWeek[index]}</div>
                            <div className="text-sm text-gray-500">{formatShortDate(date)}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.filter((_, i) => i % 2 === 0).map(time => (
                        <tr key={time} className="border-t border-gray-200">
                          <td className="text-right text-gray-500 p-2 align-top">{formatTime(time)}</td>
                          
                          {getWeekDates().map((date, index) => {
                            const appointmentsForSlot = getAppointmentsForTimeSlot(date, time);
                            const nextTimeSlot = timeSlots[timeSlots.indexOf(time) + 1];
                            const appointmentsForNextSlot = nextTimeSlot 
                              ? getAppointmentsForTimeSlot(date, nextTimeSlot)
                              : [];
                            
                            const allAppointments = [...appointmentsForSlot, ...appointmentsForNextSlot];
                            
                            return (
                              <td 
                                key={index} 
                                className={`border border-gray-100 p-1 align-top h-24 ${
                                  date.getDate() === new Date().getDate() &&
                                  date.getMonth() === new Date().getMonth() &&
                                  date.getFullYear() === new Date().getFullYear()
                                    ? 'bg-blue-50'
                                    : ''
                                }`}
                              >
                                {allAppointments.length > 0 ? (
                                  <div className="space-y-1">
                                    {allAppointments.map(appointment => (
                                      <div
                                        key={appointment.id}
                                        className={`p-2 text-xs rounded cursor-pointer ${
                                          appointment.type === 'telemedicine'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                        }`}
                                        onClick={() => handleAppointmentClick(appointment)}
                                      >
                                        <div className="font-medium">{appointment.time}</div>
                                        <div>{appointment.patientName}</div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div 
                                    className="h-full border border-dashed border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition"
                                    onClick={() => {
                                      const timeDate = new Date(date);
                                      const [hours, minutes] = time.split(':').map(Number);
                                      timeDate.setHours(hours, minutes);
                                      navigate(`/doctor-dashboard/appointments/new?date=${timeDate.toISOString()}`);
                                    }}
                                  ></div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Month view */}
            {view === 'month' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(selectedDateForView)}
                </h2>
                
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day, index) => (
                    <div key={index} className="text-center font-medium text-gray-700 p-2">
                      {day.slice(0, 3)}
                    </div>
                  ))}
                  
                  {Array.from({ length: 42 }).map((_, index) => {
                    const date = new Date(selectedDateForView.getFullYear(), selectedDateForView.getMonth(), 1);
                    date.setDate(index - (date.getDay() === 0 ? 0 : date.getDay()) + 1);
                    
                    const isCurrentMonth = date.getMonth() === selectedDateForView.getMonth();
                    const isToday = 
                      date.getDate() === new Date().getDate() &&
                      date.getMonth() === new Date().getMonth() &&
                      date.getFullYear() === new Date().getFullYear();
                    
                    const appointmentsForDay = appointments.filter(app => 
                      app.date.getDate() === date.getDate() &&
                      app.date.getMonth() === date.getMonth() &&
                      app.date.getFullYear() === date.getFullYear()
                    );
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] p-1 border ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${
                          isToday ? 'border-blue-500' : 'border-gray-200'
                        } rounded-lg cursor-pointer hover:border-blue-300 transition`}
                        onClick={() => {
                          setSelectedDateForView(new Date(date));
                          setSelectedDate(new Date(date));
                          setView('day');
                        }}
                      >
                        <div className={`text-right font-medium p-1 ${
                          isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          {date.getDate()}
                        </div>
                        
                        <div className="space-y-1">
                          {appointmentsForDay.slice(0, 3).map(appointment => (
                            <div
                              key={appointment.id}
                              className={`p-1 text-xs rounded ${
                                appointment.type === 'telemedicine'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {appointment.time} {appointment.patientName.split(' ')[0]}
                            </div>
                          ))}
                          
                          {appointmentsForDay.length > 3 && (
                            <div className="text-xs text-center text-gray-500">
                              +{appointmentsForDay.length - 3} más
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
          
          {/* Selected appointment details */}
          {selectedAppointment && (
            <Card className="p-6 mt-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedAppointment.patientName}</h2>
                  <div className="flex items-center mt-1">
                    <CalendarIcon size={16} className="text-gray-400 mr-1" />
                    <span className="text-gray-600 mr-3">
                      {formatDate(selectedAppointment.date)} - {formatTime(selectedAppointment.time)}
                    </span>
                    
                    {getTypeBadge(selectedAppointment.type)}
                    <span className="mx-2">•</span>
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit size={16} />}
                    onClick={() => navigate(`/doctor-dashboard/appointments/edit/${selectedAppointment.id}`)}
                  >
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<MoreHorizontal size={16} />}
                  >
                    Opciones
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Información del paciente</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <User size={16} className="text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-gray-500 text-sm">Nombre completo</p>
                        <p className="font-medium">{selectedAppointment.patientName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone size={16} className="text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-gray-500 text-sm">Teléfono</p>
                        <p className="font-medium">{selectedAppointment.patientPhone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail size={16} className="text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-gray-500 text-sm">Email</p>
                        <p className="font-medium">{selectedAppointment.patientEmail}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate(`/doctor-dashboard/patients/${selectedAppointment.patientId}`)}
                    >
                      Ver expediente completo
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Detalles de la cita</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FileText size={16} className="text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-gray-500 text-sm">Motivo de consulta</p>
                        <p className="font-medium">{selectedAppointment.reason}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock size={16} className="text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-gray-500 text-sm">Duración</p>
                        <p className="font-medium">{selectedAppointment.duration} minutos</p>
                      </div>
                    </div>
                    
                    {selectedAppointment.type === 'presential' && (
                      <div className="flex items-start">
                        <MapPin size={16} className="text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-sm">Ubicación</p>
                          <p className="font-medium">Consultorio 304, Torre Médica</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedAppointment.notes && (
                      <div className="flex items-start">
                        <Info size={16} className="text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-sm">Notas</p>
                          <p className="font-medium">{selectedAppointment.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-700 mb-3">Acciones</h3>
                
                <div className="flex flex-wrap gap-2">
                  {selectedAppointment.status === 'scheduled' && (
                    <>
                      <Button
                        variant="primary"
                        icon={<Check size={16} />}
                        onClick={() => handleUpdateStatus('confirmed')}
                      >
                        Confirmar cita
                      </Button>
                      
                      <Button
                        variant="outline"
                        icon={<X size={16} />}
                        onClick={() => handleUpdateStatus('cancelled')}
                      >
                        Cancelar cita
                      </Button>
                    </>
                  )}
                  
                  {selectedAppointment.status === 'confirmed' && (
                    <>
                      {selectedAppointment.type === 'telemedicine' ? (
                        <Button
                          variant="primary"
                          icon={<Video size={16} />}
                          onClick={handleStartConsultation}
                        >
                          Iniciar consulta
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          icon={<ArrowRight size={16} />}
                          onClick={() => navigate(`/doctor-dashboard/patients/${selectedAppointment.patientId}`)}
                        >
                          Iniciar atención
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        icon={<X size={16} />}
                        onClick={() => handleUpdateStatus('cancelled')}
                      >
                        Cancelar cita
                      </Button>
                      
                      <Button
                        variant="outline"
                        icon={<MessageSquare size={16} />}
                      >
                        Enviar mensaje
                      </Button>
                    </>
                  )}
                  
                  {(selectedAppointment.status === 'completed' || selectedAppointment.status === 'no-show') && (
                    <>
                      <Button
                        variant="outline"
                        icon={<FileText size={16} />}
                      >
                        Ver resumen
                      </Button>
                      
                      <Button
                        variant="outline"
                        icon={<Calendar size={16} />}
                        onClick={() => navigate('/doctor-dashboard/appointments/new?patientId=' + selectedAppointment.patientId)}
                      >
                        Agendar seguimiento
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .simple-calendar {
          width: 100%;
          max-width: 100%;
          background: white;
          font-family: inherit;
        }
        
        .simple-calendar button {
          transition: all 0.2s;
        }
        
        .simple-calendar button:hover:not(:disabled) {
          background-color: #f3f4f6;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AppointmentsPage;