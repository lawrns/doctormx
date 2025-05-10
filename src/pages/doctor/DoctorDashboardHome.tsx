// Doctor Dashboard Home with blue color scheme and Doctor Connect Promo
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import DoctorConnectPromo from '../../components/doctor/DoctorConnectPromo';
import { 
  Card, 
  Button, 
  Badge
} from '../../components/ui';
import { 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  DollarSign,
  TrendingUp,
  Video,
  FileText,
  ChevronRight,
  Bell,
  CheckCircle,
  AlertCircle,
  Star,
  Phone,
  Check,
  Circle
} from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: Date;
  time: string;
  type: 'presential' | 'telemedicine';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
}

interface Notification {
  id: string;
  type: 'appointment' | 'message' | 'review' | 'system';
  title: string;
  content: string;
  date: Date;
  read: boolean;
  action?: {
    text: string;
    link: string;
  };
}

interface PendingTask {
  id: string;
  type: 'prescription' | 'followup' | 'document' | 'other';
  title: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface DashboardStats {
  todayAppointments: number;
  pendingMessages: number;
  totalPatients: number;
  monthlyRevenue: number;
  percentChange: number;
}

const DoctorDashboardHome: React.FC = () => {
  const { doctorId, doctorName } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [waitingRoomPatients, setWaitingRoomPatients] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          // Mock stats
          const mockStats: DashboardStats = {
            todayAppointments: 8,
            pendingMessages: 3,
            totalPatients: 128,
            monthlyRevenue: 25600,
            percentChange: 12.5
          };
          
          // Mock upcoming appointments
          const mockUpcomingAppointments: Appointment[] = [
            {
              id: 'app_1',
              patientName: 'María López',
              patientId: 'pat_1',
              date: new Date(new Date().setHours(new Date().getHours() + 1)),
              time: '10:30',
              type: 'presential',
              status: 'confirmed'
            },
            {
              id: 'app_2',
              patientName: 'Juan Rodríguez',
              patientId: 'pat_2',
              date: new Date(new Date().setHours(new Date().getHours() + 3)),
              time: '12:00',
              type: 'telemedicine',
              status: 'confirmed'
            },
            {
              id: 'app_3',
              patientName: 'Ana García',
              patientId: 'pat_3',
              date: new Date(new Date().setHours(new Date().getHours() + 5)),
              time: '14:30',
              type: 'presential',
              status: 'scheduled'
            }
          ];
          
          // Mock waiting room patients
          const mockWaitingRoomPatients: Appointment[] = [
            {
              id: 'app_4',
              patientName: 'Roberto Sánchez',
              patientId: 'pat_4',
              date: new Date(),
              time: '09:30',
              type: 'telemedicine',
              status: 'confirmed'
            }
          ];
          
          // Mock notifications
          const mockNotifications: Notification[] = [
            {
              id: 'notif_1',
              type: 'appointment',
              title: 'Nueva cita programada',
              content: 'El paciente Carlos Pérez ha agendado una cita para mañana a las 11:00.',
              date: new Date(Date.now() - 30 * 60000), // 30 minutes ago
              read: false,
              action: {
                text: 'Ver detalles',
                link: '/doctor-dashboard/appointments'
              }
            },
            {
              id: 'notif_2',
              type: 'message',
              title: 'Nuevo mensaje',
              content: 'Has recibido un nuevo mensaje de Ana García sobre su tratamiento.',
              date: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
              read: false,
              action: {
                text: 'Leer mensaje',
                link: '/doctor-dashboard/messages'
              }
            },
            {
              id: 'notif_3',
              type: 'review',
              title: 'Nueva opinión',
              content: 'Has recibido una nueva opinión de 5 estrellas. "Excelente atención, muy profesional..."',
              date: new Date(Date.now() - 1 * 24 * 60 * 60000), // 1 day ago
              read: true,
              action: {
                text: 'Ver opinión',
                link: '/doctor-dashboard/reviews'
              }
            }
          ];
          
          // Mock pending tasks
          const mockPendingTasks: PendingTask[] = [
            {
              id: 'task_1',
              type: 'prescription',
              title: 'Renovar receta para María López',
              dueDate: new Date(Date.now() + 1 * 24 * 60 * 60000), // Tomorrow
              priority: 'high',
              completed: false
            },
            {
              id: 'task_2',
              type: 'followup',
              title: 'Llamada de seguimiento con Juan Rodríguez',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60000), // In 2 days
              priority: 'medium',
              completed: false
            },
            {
              id: 'task_3',
              type: 'document',
              title: 'Completar informe médico para seguro',
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60000), // In 3 days
              priority: 'low',
              completed: false
            }
          ];
          
          setStats(mockStats);
          setUpcomingAppointments(mockUpcomingAppointments);
          setWaitingRoomPatients(mockWaitingRoomPatients);
          setNotifications(mockNotifications);
          setPendingTasks(mockPendingTasks);
          setLoading(false);
        }, 1500); // Simulate loading delay
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [doctorId]);
  
  // Mark notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };
  
  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    setPendingTasks(prev => 
      prev.map(task => task.id === id ? { ...task, completed: !task.completed } : task)
    );
  };
  
  // Start telemedicine consultation
  const startTelemedicineConsultation = (appointmentId: string) => {
    navigate(`/doctor-dashboard/telemedicine/consultation/${appointmentId}`);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    if (dateToCheck.getTime() === today.getTime()) {
      return 'Hoy';
    }
    
    if (dateToCheck.getTime() === tomorrow.getTime()) {
      return 'Mañana';
    }
    
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short'
    });
  };
  
  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    if (diffMins < 60) {
      return `Hace ${diffMins} minutos`;
    }
    
    if (diffHours < 24) {
      return `Hace ${diffHours} horas`;
    }
    
    return `Hace ${diffDays} días`;
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar size={16} className="text-blue-500" />;
      case 'message':
        return <MessageSquare size={16} className="text-green-500" />;
      case 'review':
        return <Star size={16} className="text-yellow-500" />;
      case 'system':
        return <Bell size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-blue-500" />;
    }
  };
  
  // Get task icon
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'prescription':
        return <FileText size={16} className="text-blue-500" />;
      case 'followup':
        return <Phone size={16} className="text-green-500" />;
      case 'document':
        return <FileText size={16} className="text-purple-500" />;
      default:
        return <Circle size={16} className="text-blue-500" />;
    }
  };
  
  // Get task priority badge
  const getTaskPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger">Alta</Badge>;
      case 'medium':
        return <Badge variant="warning">Media</Badge>;
      case 'low':
        return <Badge variant="info">Baja</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <DashboardLayout loading={loading}>
      {stats && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-900">
              ¡Bienvenido de nuevo, {doctorName || 'Doctor'}!
            </h1>
            <p className="text-blue-500">
              {new Date().toLocaleDateString('es-MX', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric'
              })}
            </p>
          </div>
          
          {/* Main dashboard layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Today's appointments */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-blue-100 mr-4">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-500">Citas hoy</p>
                      <h3 className="text-2xl font-bold text-blue-900">{stats?.todayAppointments || 0}</h3>
                    </div>
                  </div>
                </div>
                
                {/* Pending messages */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-blue-100 mr-4">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-500">Mensajes pendientes</p>
                      <h3 className="text-2xl font-bold text-blue-900">{stats?.pendingMessages || 0}</h3>
                    </div>
                  </div>
                </div>
                
                {/* Total patients */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-blue-100 mr-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-500">Total pacientes</p>
                      <h3 className="text-2xl font-bold text-blue-900">{stats?.totalPatients || 0}</h3>
                    </div>
                  </div>
                </div>
                
                {/* Monthly revenue */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-blue-100 mr-4">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-500">Ingresos mensuales</p>
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold text-blue-900">
                          ${stats?.monthlyRevenue.toLocaleString() || 0}
                        </h3>
                        <span className="ml-2 flex items-center text-sm font-medium text-blue-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {stats?.percentChange}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Waiting room */}
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-blue-200 bg-blue-50">
                  <h2 className="text-lg font-medium text-blue-800">Sala de espera</h2>
                </div>
                {waitingRoomPatients.length > 0 ? (
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                          {waitingRoomPatients[0].patientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-blue-900">{waitingRoomPatients[0].patientName}</h3>
                          <p className="text-sm text-blue-500">
                            Esperando desde las {waitingRoomPatients[0].time}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => startTelemedicineConsultation(waitingRoomPatients[0].id)}
                      >
                        <Video size={16} className="mr-1" />
                        Iniciar consulta
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Video size={48} className="mx-auto text-blue-300 mb-3" />
                    <p className="text-blue-500">No hay pacientes en sala de espera</p>
                  </div>
                )}
              </div>
              
              {/* Upcoming appointments */}
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-blue-200 flex justify-between items-center bg-blue-50">
                  <h2 className="text-lg font-medium text-blue-800">Próximas citas</h2>
                  <a href="/doctor-dashboard/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                    Ver todas
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
                <div className="p-4">
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingAppointments.map(appointment => (
                        <div 
                          key={appointment.id} 
                          className="flex justify-between items-start p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer"
                          onClick={() => {
                            navigate(`/doctor-dashboard/appointments/${appointment.id}`);
                          }}
                        >
                          <div className="flex items-start">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                              {appointment.patientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            
                            <div>
                              <h3 className="font-medium text-blue-900">{appointment.patientName}</h3>
                              <div className="flex items-center text-sm text-blue-500">
                                <Clock size={14} className="mr-1" />
                                {formatDate(appointment.date)} - {appointment.time}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Badge 
                              variant={appointment.type === 'telemedicine' ? 'info' : 'secondary'}
                              className="mr-2"
                            >
                              {appointment.type === 'telemedicine' ? 'Telemedicina' : 'Presencial'}
                            </Badge>
                            
                            {appointment.type === 'telemedicine' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startTelemedicineConsultation(appointment.id);
                                }}
                              >
                                <Video size={14} className="mr-1" />
                                Iniciar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar size={48} className="mx-auto text-blue-300 mb-3" />
                      <p className="text-blue-500">No tienes citas próximas programadas</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          navigate('/doctor-dashboard/appointments');
                        }}
                      >
                        Ver agenda
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Pending tasks */}
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-blue-200 flex justify-between items-center bg-blue-50">
                  <h2 className="text-lg font-medium text-blue-800">Tareas pendientes</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {pendingTasks.filter(t => !t.completed).length} pendientes
                  </span>
                </div>
                <div className="p-4">
                  {pendingTasks.filter(task => !task.completed).length > 0 ? (
                    <div className="space-y-3">
                      {pendingTasks
                        .filter(task => !task.completed)
                        .map(task => (
                          <div 
                            key={task.id} 
                            className="flex justify-between items-start p-3 bg-blue-50 rounded-lg"
                          >
                            <div className="flex items-start flex-1">
                              <div className="flex-shrink-0 mt-0.5 mr-3">
                                {getTaskIcon(task.type)}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h3 className="font-medium text-blue-900 mr-2">{task.title}</h3>
                                  {getTaskPriorityBadge(task.priority)}
                                </div>
                                
                                <div className="flex items-center text-sm text-blue-500 mt-1">
                                  <Calendar size={14} className="mr-1" />
                                  Vence: {formatDate(task.dueDate)}
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleTaskCompletion(task.id)}
                            >
                              Completar
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle size={48} className="mx-auto text-blue-300 mb-3" />
                      <p className="text-blue-500">No tienes tareas pendientes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column - 1/3 width */}
            <div className="space-y-6">
              {/* Doctor Connect Program Promo */}
              <DoctorConnectPromo />
              
              {/* Notifications */}
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-blue-200 flex justify-between items-center bg-blue-50">
                  <h2 className="text-lg font-medium text-blue-800">Notificaciones</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {notifications.filter(n => !n.read).length} nuevas
                  </span>
                </div>
                <div className="p-4">
                  {notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 rounded-lg border-l-4 ${
                            notification.read 
                              ? 'bg-blue-50 border-blue-300' 
                              : 'bg-blue-100 border-blue-500'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5 mr-3">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h3 className={`font-medium ${notification.read ? 'text-blue-700' : 'text-blue-900'}`}>
                                  {notification.title}
                                </h3>
                                <span className="text-xs text-blue-500">
                                  {formatTimeAgo(notification.date)}
                                </span>
                              </div>
                              
                              <p className={`text-sm mt-1 ${notification.read ? 'text-blue-500' : 'text-blue-700'}`}>
                                {notification.content}
                              </p>
                              
                              {notification.action && (
                                <div className="mt-2">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-blue-600"
                                    onClick={() => {
                                      markNotificationAsRead(notification.id);
                                      navigate(notification.action!.link);
                                    }}
                                  >
                                    {notification.action.text}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Bell size={48} className="mx-auto text-blue-300 mb-3" />
                      <p className="text-blue-500">No hay notificaciones recientes</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tips */}
              <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">Consejos para hoy</h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li className="flex items-start">
                        <Check size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Confirma tus citas del día siguiente para reducir inasistencias.</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Recuerda actualizar los expedientes después de cada consulta.</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Programa tiempo para revisar resultados de laboratorio pendientes.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default DoctorDashboardHome;
// Updated on Sat May 10 11:04:38 CST 2025
