import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
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
              dueDate: new Date(Date.now() + 5 * 24 * 60 * 60000), // In 5 days
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
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [doctorId]);
  
  // Mark notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    setPendingTasks(pendingTasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Start telemedicine consultation
  const startTelemedicineConsultation = (appointmentId: string) => {
    navigate(`/doctor-dashboard/telemedicine/consultation/${appointmentId}`);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'Hoy';
    } else if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };
  
  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `Hace ${diffMins} minutos`;
    } else if (diffMins < 24 * 60) {
      const hours = Math.floor(diffMins / 60);
      return `Hace ${hours} horas`;
    } else {
      const days = Math.floor(diffMins / (60 * 24));
      return `Hace ${days} días`;
    }
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
        return <Bell size={16} className="text-gray-500" />;
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
        return <Circle size={16} className="text-gray-500" />;
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
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido de nuevo, {doctorName || 'Doctor'}!
            </h1>
            <p className="text-gray-500">
              {new Date().toLocaleDateString('es-MX', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Citas hoy</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayAppointments}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="text-blue-600" size={24} />
                </div>
              </div>
              
              <div className="mt-4 flex items-center text-sm">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-blue-600"
                  onClick={() => {
                    window.location.href = '/doctor-dashboard/appointments';
                  }}
                >
                  Ver agenda
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Mensajes pendientes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingMessages}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <MessageSquare className="text-green-600" size={24} />
                </div>
              </div>
              
              <div className="mt-4 flex items-center text-sm">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-green-600"
                  onClick={() => {
                    window.location.href = '/doctor-dashboard/messages';
                  }}
                >
                  Revisar mensajes
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pacientes totales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPatients}</p>
                </div>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="text-purple-600" size={24} />
                </div>
              </div>
              
              <div className="mt-4 flex items-center text-sm">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-purple-600"
                  onClick={() => {
                    window.location.href = '/doctor-dashboard/patients';
                  }}
                >
                  Ver pacientes
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ingresos mensuales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.monthlyRevenue)}</p>
                </div>
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <DollarSign className="text-yellow-600" size={24} />
                </div>
              </div>
              
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center text-green-600 mr-2">
                  <TrendingUp size={16} className="mr-1" />
                  {stats.percentChange}%
                </div>
                vs. mes anterior
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
              {/* Waiting Room */}
              {waitingRoomPatients.length > 0 && (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center">
                      <Clock size={18} className="text-red-500 mr-2" />
                      Sala de Espera Virtual
                    </h2>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                      window.location.href = '/doctor-dashboard/telemedicine/waiting-room';
                    }}
                    >
                      Ver todo
                    </Button>
                  </div>
                  
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium text-sm mr-3">
                          {waitingRoomPatients[0].patientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900">{waitingRoomPatients[0].patientName}</h3>
                          <p className="text-sm text-gray-500">
                            Esperando desde las {waitingRoomPatients[0].time}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Video size={16} />}
                        onClick={() => startTelemedicineConsultation(waitingRoomPatients[0].id)}
                      >
                        Iniciar consulta
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-1 text-center">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-gray-500"
                      onClick={() => {
                        window.location.href = '/doctor-dashboard/telemedicine/waiting-room';
                      }}
                    >
                      {waitingRoomPatients.length} paciente{waitingRoomPatients.length !== 1 ? 's' : ''} en espera
                    </Button>
                  </div>
                </Card>
              )}
              
              {/* Upcoming Appointments */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Calendar size={18} className="text-blue-500 mr-2" />
                    Próximas Citas
                  </h2>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = '/doctor-dashboard/appointments';
                    }}
                  >
                    Ver agenda completa
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map(appointment => (
                      <div 
                        key={appointment.id} 
                        className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => {
                          window.location.href = `/doctor-dashboard/appointments/${appointment.id}`;
                        }}
                      >
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                            {appointment.patientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                            <div className="flex items-center text-sm text-gray-500">
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
                              icon={<Video size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                startTelemedicineConsultation(appointment.id);
                              }}
                            >
                              Iniciar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No tienes citas próximas programadas</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                        window.location.href = '/doctor-dashboard/appointments';
                      }}
                      >
                        Ver agenda
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Pending Tasks */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Tareas Pendientes</h2>
                  
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Crear tarea
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {pendingTasks.filter(task => !task.completed).length > 0 ? (
                    pendingTasks
                      .filter(task => !task.completed)
                      .map(task => (
                        <div 
                          key={task.id} 
                          className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-start flex-1">
                            <div className="flex-shrink-0 mt-0.5 mr-3">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskCompletion(task.id)}
                                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0 appearance-auto"
                                style={{
                                  WebkitAppearance: 'checkbox',
                                  MozAppearance: 'checkbox',
                                  appearance: 'checkbox'
                                }}
                              />
                            </div>
                            
                            <div>
                              <div className="flex items-center">
                                {getTaskIcon(task.type)}
                                <h3 className="font-medium text-gray-900 ml-2">{task.title}</h3>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Clock size={14} className="mr-1" />
                                Vence: {formatDate(task.dueDate)}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            {getTaskPriorityBadge(task.priority)}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle size={48} className="mx-auto text-green-300 mb-3" />
                      <p className="text-gray-500">No tienes tareas pendientes</p>
                    </div>
                  )}
                </div>
                
                {pendingTasks.filter(task => task.completed).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-gray-500"
                    >
                      {pendingTasks.filter(task => task.completed).length} tarea{pendingTasks.filter(task => task.completed).length !== 1 ? 's' : ''} completada{pendingTasks.filter(task => task.completed).length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Notifications */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Bell size={18} className="text-yellow-500 mr-2" />
                    Notificaciones
                  </h2>
                  
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Ver todas
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border-l-4 ${
                          notification.read 
                            ? 'bg-gray-50 border-gray-300' 
                            : 'bg-blue-50 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5 mr-3">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-blue-800'}`}>
                                {notification.title}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.date)}
                              </span>
                            </div>
                            
                            <p className={`text-sm mt-1 ${notification.read ? 'text-gray-600' : 'text-blue-700'}`}>
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
                                    window.location.href = notification.action!.link;
                                  }}
                                >
                                  {notification.action.text}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No hay notificaciones recientes</p>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={<Calendar size={16} />}
                    onClick={() => {
                      window.location.href = '/doctor-dashboard/appointments/new';
                    }}
                  >
                    Agendar nueva cita
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={<Users size={16} />}
                    onClick={() => {
                      window.location.href = '/doctor-dashboard/patients/new';
                    }}
                  >
                    Registrar paciente
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={<FileText size={16} />}
                    onClick={() => {
                      window.location.href = '/doctor-dashboard/prescriptions/new';
                    }}
                  >
                    Crear receta
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={<Video size={16} />}
                    onClick={() => {
                      window.location.href = '/doctor-dashboard/telemedicine/waiting-room';
                    }}
                  >
                    Sala de espera virtual
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={<MessageSquare size={16} />}
                    onClick={() => {
                      window.location.href = '/doctor-dashboard/community';
                    }}
                  >
                    Comunidad médica
                  </Button>
                </div>
              </Card>
              
              {/* Tips */}
              <Card className="p-6 bg-blue-50">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Consejos para hoy</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
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
                        <span>Programa un tiempo para responder mensajes pendientes.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default DoctorDashboardHome;