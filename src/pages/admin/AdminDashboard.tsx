import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Stethoscope, FileText, Calendar, 
  TrendingUp, AlertTriangle, Activity, DollarSign,
  BarChart3, PieChart, Filter, RefreshCw, Download,
  Bell, Shield, Settings, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  doctors: {
    total: number;
    verified: number;
    pending: number;
    growth: number;
  };
  appointments: {
    total: number;
    today: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    growth: number;
    pendingPayments: number;
  };
  platform: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'doctor_verification' | 'appointment_booking' | 'payment' | 'system_alert';
  title: string;
  description: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'success';
  userId?: string;
  doctorId?: string;
}

interface PendingTask {
  id: string;
  type: 'doctor_verification' | 'user_report' | 'content_review' | 'payment_dispute';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: Date;
  createdAt: Date;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock data - in production this would come from APIs
  const [stats] = useState<DashboardStats>({
    users: {
      total: 15420,
      active: 8940,
      newToday: 124,
      growth: 12.5
    },
    doctors: {
      total: 2340,
      verified: 2180,
      pending: 45,
      growth: 8.2
    },
    appointments: {
      total: 8950,
      today: 156,
      completed: 8234,
      cancelled: 521
    },
    revenue: {
      total: 2450000,
      thisMonth: 450000,
      growth: 15.8,
      pendingPayments: 25000
    },
    platform: {
      uptime: 99.9,
      responseTime: 245,
      errorRate: 0.12,
      activeUsers: 1456
    }
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'doctor_verification',
      title: 'Nuevo médico verificado',
      description: 'Dr. María González completó su verificación',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      severity: 'success'
    },
    {
      id: '2',
      type: 'user_registration',
      title: 'Registro masivo de usuarios',
      description: '45 nuevos usuarios registrados en la última hora',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      severity: 'info'
    },
    {
      id: '3',
      type: 'system_alert',
      title: 'Pico de tráfico detectado',
      description: 'Tiempo de respuesta aumentado en 20%',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      severity: 'warning'
    },
    {
      id: '4',
      type: 'payment',
      title: 'Pago disputado',
      description: 'Usuario reporta problema con cita #8934',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      severity: 'error'
    }
  ]);

  const [pendingTasks] = useState<PendingTask[]>([
    {
      id: '1',
      type: 'doctor_verification',
      title: 'Verificar Dr. Carlos Mendoza',
      description: 'Documentos subidos hace 2 días',
      priority: 'high',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'user_report',
      title: 'Reporte de usuario inapropiado',
      description: 'Usuario reportado por múltiples doctores',
      priority: 'urgent',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'content_review',
      title: 'Revisar contenido educativo',
      description: '5 artículos pendientes de aprobación',
      priority: 'medium',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setLastRefresh(new Date());
    setTimeout(() => {
      setLoading(false);
      showToast('Dashboard actualizado', 'success');
    }, 1000);
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration': return Users;
      case 'doctor_verification': return Stethoscope;
      case 'appointment_booking': return Calendar;
      case 'payment': return DollarSign;
      case 'system_alert': return AlertTriangle;
      default: return Activity;
    }
  };

  const getActivityColor = (severity: RecentActivity['severity']) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getPriorityColor = (priority: PendingTask['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowth = (growth: number) => {
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-brand-jade-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Admin Dashboard - DoctorMX"
        description="Panel de administración para gestión de usuarios, doctores y sistema"
        keywords={['admin dashboard', 'panel administración', 'gestión sistema']}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
                <p className="text-sm text-gray-600">
                  Última actualización: {lastRefresh.toLocaleTimeString('es-MX')}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500 text-sm"
                >
                  <option value="24h">Últimas 24h</option>
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="90d">Últimos 90 días</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users Stats */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.users.total.toLocaleString()}</p>
                  <p className="text-sm text-green-600">{formatGrowth(stats.users.growth)} vs período anterior</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <span className="font-medium text-green-600">{stats.users.newToday}</span> nuevos hoy
              </div>
            </Card>

            {/* Doctors Stats */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Doctores Verificados</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.doctors.verified.toLocaleString()}</p>
                  <p className="text-sm text-green-600">{formatGrowth(stats.doctors.growth)} vs período anterior</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Stethoscope className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <span className="font-medium text-orange-600">{stats.doctors.pending}</span> pendientes verificación
              </div>
            </Card>

            {/* Appointments Stats */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.appointments.today}</p>
                  <p className="text-sm text-gray-600">de {stats.appointments.total.toLocaleString()} totales</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {((stats.appointments.completed / stats.appointments.total) * 100).toFixed(1)}% completadas
              </div>
            </Card>

            {/* Revenue Stats */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.revenue.thisMonth)}</p>
                  <p className="text-sm text-green-600">{formatGrowth(stats.revenue.growth)} vs mes anterior</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {formatCurrency(stats.revenue.pendingPayments)} pendientes
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* System Health */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Estado del Sistema</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiempo activo</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">{stats.platform.uptime}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiempo de respuesta</span>
                    <span className="text-sm font-medium">{stats.platform.responseTime}ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tasa de errores</span>
                    <span className="text-sm font-medium">{stats.platform.errorRate}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Usuarios activos</span>
                    <span className="text-sm font-medium">{stats.platform.activeUsers}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/admin/system')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Ver Sistema Completo
                  </Button>
                </div>
              </Card>

              {/* Pending Tasks */}
              <Card className="p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Tareas Pendientes</h3>
                  <Badge className="bg-red-100 text-red-800">
                    {pendingTasks.length}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {pendingTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                          {task.dueDate && (
                            <p className="text-xs text-orange-600 mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Vence: {task.dueDate.toLocaleDateString('es-MX')}
                            </p>
                          )}
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => navigate('/admin/tasks')}
                >
                  Ver Todas las Tareas
                </Button>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Actividad Reciente</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin/activity')}
                  >
                    Ver Todo
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.severity);
                    
                    return (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{activity.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {activity.timestamp.toLocaleString('es-MX')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => navigate('/admin/doctors')}
                  >
                    <UserCheck className="w-6 h-6 mb-2" />
                    <span className="text-sm">Verificar Doctores</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => navigate('/admin/users')}
                  >
                    <Users className="w-6 h-6 mb-2" />
                    <span className="text-sm">Gestionar Usuarios</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => navigate('/admin/content')}
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    <span className="text-sm">Revisar Contenido</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => navigate('/admin/reports')}
                  >
                    <BarChart3 className="w-6 h-6 mb-2" />
                    <span className="text-sm">Ver Reportes</span>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}