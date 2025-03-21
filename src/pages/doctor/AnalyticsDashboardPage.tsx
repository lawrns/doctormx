import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  ChevronDown, 
  Filter, 
  Download, 
  BarChart2, 
  PieChart,
  LineChart as LineChartIcon,
  Map,
  HelpCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsePieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const AnalyticsDashboardPage: React.FC = () => {
  const { doctorId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Stats data
  const [stats, setStats] = useState({
    patients: {
      total: 0,
      new: 0,
      returnRate: 0
    },
    appointments: {
      total: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0
    },
    revenue: {
      total: 0,
      average: 0,
      outstanding: 0
    },
    performance: {
      appointmentDuration: 0,
      satisfactionRate: 0,
      responseTime: 0
    }
  });
  
  // Chart data
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
  const [patientDemographics, setPatientDemographics] = useState<any[]>([]);
  const [appointmentStatusData, setAppointmentStatusData] = useState<any[]>([]);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from an API or Supabase
        // For now, use mock data
        setTimeout(() => {
          // Mock stats data
          const mockStats = {
            patients: {
              total: 128,
              new: 15,
              returnRate: 78
            },
            appointments: {
              total: 96,
              completed: 82,
              cancelled: 8,
              noShow: 6
            },
            revenue: {
              total: 76800,
              average: 800,
              outstanding: 4800
            },
            performance: {
              appointmentDuration: 28,
              satisfactionRate: 92,
              responseTime: 3.5
            }
          };
          
          // Mock revenue data (last 12 months)
          const mockRevenueData = [
            { name: 'Mar', revenue: 62400 },
            { name: 'Abr', revenue: 68000 },
            { name: 'May', revenue: 72000 },
            { name: 'Jun', revenue: 65600 },
            { name: 'Jul', revenue: 68800 },
            { name: 'Ago', revenue: 74400 },
            { name: 'Sep', revenue: 70400 },
            { name: 'Oct', revenue: 72800 },
            { name: 'Nov', revenue: 69600 },
            { name: 'Dic', revenue: 60000 },
            { name: 'Ene', revenue: 72000 },
            { name: 'Feb', revenue: 76800 }
          ];
          
          // Mock appointments data (last 12 months)
          const mockAppointmentsData = [
            { name: 'Mar', completed: 68, cancelled: 7, noShow: 5 },
            { name: 'Abr', completed: 72, cancelled: 6, noShow: 4 },
            { name: 'May', completed: 75, cancelled: 8, noShow: 7 },
            { name: 'Jun', completed: 70, cancelled: 5, noShow: 5 },
            { name: 'Jul', completed: 73, cancelled: 6, noShow: 3 },
            { name: 'Ago', completed: 78, cancelled: 7, noShow: 5 },
            { name: 'Sep', completed: 74, cancelled: 8, noShow: 6 },
            { name: 'Oct', completed: 76, cancelled: 5, noShow: 4 },
            { name: 'Nov', completed: 73, cancelled: 7, noShow: 5 },
            { name: 'Dic', completed: 65, cancelled: 10, noShow: 8 },
            { name: 'Ene', completed: 75, cancelled: 6, noShow: 4 },
            { name: 'Feb', completed: 82, cancelled: 8, noShow: 6 }
          ];
          
          // Mock patient demographics data
          const mockPatientDemographics = [
            { name: '18-24', value: 8 },
            { name: '25-34', value: 22 },
            { name: '35-44', value: 28 },
            { name: '45-54', value: 24 },
            { name: '55-64', value: 15 },
            { name: '65+', value: 3 }
          ];
          
          // Mock appointment status data
          const mockAppointmentStatusData = [
            { name: 'Completadas', value: 82 },
            { name: 'Canceladas', value: 8 },
            { name: 'No asistió', value: 6 }
          ];
          
          setStats(mockStats);
          setRevenueData(mockRevenueData);
          setAppointmentsData(mockAppointmentsData);
          setPatientDemographics(mockPatientDemographics);
          setAppointmentStatusData(mockAppointmentStatusData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [doctorId, selectedPeriod]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  return (
    <DashboardLayout title="Análisis" loading={loading}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Analítico</h1>
          <p className="text-gray-500">Monitorea y analiza el rendimiento de tu práctica médica</p>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative">
            <button
              className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
              onClick={() => setSelectedPeriod(selectedPeriod === 'month' ? 'year' : 'month')}
            >
              <Calendar size={16} className="mr-2" />
              {selectedPeriod === 'month' ? 'Este mes' : 'Este año'}
              <ChevronDown size={16} className="ml-2" />
            </button>
          </div>
          
          <Button
            variant="outline"
            icon={<Filter size={16} />}
          >
            Filtros
          </Button>
          
          <Button
            variant="outline"
            icon={<Download size={16} />}
          >
            Exportar
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="patients">
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="appointments">
            Citas
          </TabsTrigger>
          <TabsTrigger value="revenue">
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="performance">
            Rendimiento
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-500 text-sm font-medium">Pacientes totales</div>
                  <div className="text-3xl font-bold mt-2">{stats.patients.total}</div>
                  <div className="flex items-center mt-2 text-green-600 text-sm font-medium">
                    <TrendingUp size={16} className="mr-1" />
                    +{stats.patients.new} nuevos este mes
                  </div>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-500 text-sm font-medium">Citas</div>
                  <div className="text-3xl font-bold mt-2">{stats.appointments.completed}/{stats.appointments.total}</div>
                  <div className="flex items-center mt-2 text-green-600 text-sm font-medium">
                    <TrendingUp size={16} className="mr-1" />
                    {Math.round((stats.appointments.completed / stats.appointments.total) * 100)}% completadas
                  </div>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <Calendar className="text-green-600" size={24} />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-500 text-sm font-medium">Ingresos</div>
                  <div className="text-3xl font-bold mt-2">{formatCurrency(stats.revenue.total)}</div>
                  <div className="flex items-center mt-2 text-yellow-600 text-sm font-medium">
                    <Clock size={16} className="mr-1" />
                    {formatCurrency(stats.revenue.outstanding)} pendientes
                  </div>
                </div>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <CreditCard className="text-purple-600" size={24} />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-500 text-sm font-medium">Satisfacción</div>
                  <div className="text-3xl font-bold mt-2">{stats.performance.satisfactionRate}%</div>
                  <div className="flex items-center mt-2 text-green-600 text-sm font-medium">
                    <TrendingUp size={16} className="mr-1" />
                    +3% vs mes pasado
                  </div>
                </div>
                <div className="bg-red-100 p-2 rounded-lg">
                  <Zap className="text-red-600" size={24} />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Ingresos mensuales</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500"
                    icon={<HelpCircle size={16} />}
                  />
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Ingresos']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Ingresos"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Estado de citas</h2>
              </div>
              
              <div className="h-60 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsePieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} citas`, '']} />
                    <Legend />
                  </RechartsePieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <div className="text-sm font-medium text-gray-500">Completadas</div>
                    <div className="text-lg font-semibold text-blue-600">{stats.appointments.completed}</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded-md">
                    <div className="text-sm font-medium text-gray-500">Canceladas</div>
                    <div className="text-lg font-semibold text-yellow-600">{stats.appointments.cancelled}</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded-md">
                    <div className="text-sm font-medium text-gray-500">No asistió</div>
                    <div className="text-lg font-semibold text-red-600">{stats.appointments.noShow}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Citas por mes</h2>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={appointmentsData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Completadas" dataKey="completed" stackId="a" fill="#4ADE80" />
                    <Bar name="Canceladas" dataKey="cancelled" stackId="a" fill="#FBBF24" />
                    <Bar name="No asistió" dataKey="noShow" stackId="a" fill="#F87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Demografía de pacientes</h2>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={patientDemographics}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar name="Pacientes por edad" dataKey="value" fill="#8884D8" label={{ position: 'right', fill: '#666' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Métricas de rendimiento</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="text-blue-600 font-semibold text-2xl mb-2">{stats.performance.appointmentDuration} min</div>
                  <div className="text-gray-500 text-sm text-center">Duración promedio de consulta</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="text-green-600 font-semibold text-2xl mb-2">{stats.performance.satisfactionRate}%</div>
                  <div className="text-gray-500 text-sm text-center">Índice de satisfacción</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="text-purple-600 font-semibold text-2xl mb-2">{stats.performance.responseTime} hrs</div>
                  <div className="text-gray-500 text-sm text-center">Tiempo de respuesta promedio</div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Patients Tab */}
        <TabsContent value="patients">
          <div className="text-center py-10">
            <BarChart2 size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Análisis detallado de pacientes</h3>
            <p className="text-gray-500 max-w-lg mx-auto">
              Esta sección mostrará un análisis detallado de la demografía de pacientes, patrones de retención y distribución geográfica.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              icon={<Map size={16} />}
            >
              Ver informe completo
            </Button>
          </div>
        </TabsContent>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <div className="text-center py-10">
            <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Análisis detallado de citas</h3>
            <p className="text-gray-500 max-w-lg mx-auto">
              Esta sección mostrará un análisis detallado de las citas, incluyendo tendencias, tipos de consulta y patrones de cancelación.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              icon={<LineChartIcon size={16} />}
            >
              Ver informe completo
            </Button>
          </div>
        </TabsContent>
        
        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <div className="text-center py-10">
            <CreditCard size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Análisis detallado de ingresos</h3>
            <p className="text-gray-500 max-w-lg mx-auto">
              Esta sección mostrará un análisis detallado de los ingresos, incluyendo fuentes, tendencias y proyecciones.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              icon={<PieChart size={16} />}
            >
              Ver informe completo
            </Button>
          </div>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="text-center py-10">
            <Zap size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Análisis detallado de rendimiento</h3>
            <p className="text-gray-500 max-w-lg mx-auto">
              Esta sección mostrará métricas detalladas de rendimiento, incluyendo tiempo de respuesta, duración de consultas y satisfacción del paciente.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              icon={<BarChart2 size={16} />}
            >
              Ver informe completo
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AnalyticsDashboardPage;