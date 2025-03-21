import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Calendar, TrendingUp, Users, DollarSign, Clock, Percent, Download, ChevronDown } from 'lucide-react';
import { Card, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '../ui';
import { supabase } from '../../lib/supabase';

// Types
interface AnalyticsDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface AnalyticsDashboardProps {
  doctorId: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange?: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

// Mock data
const mockAppointmentsData: AnalyticsDataPoint[] = [
  { name: 'Ene', value: 12 },
  { name: 'Feb', value: 19 },
  { name: 'Mar', value: 15 },
  { name: 'Abr', value: 22 },
  { name: 'May', value: 18 },
  { name: 'Jun', value: 24 },
  { name: 'Jul', value: 28 },
  { name: 'Ago', value: 26 },
  { name: 'Sep', value: 21 },
  { name: 'Oct', value: 23 },
  { name: 'Nov', value: 25 },
  { name: 'Dic', value: 30 },
];

const mockRevenueData: AnalyticsDataPoint[] = [
  { name: 'Ene', value: 15000 },
  { name: 'Feb', value: 22000 },
  { name: 'Mar', value: 18500 },
  { name: 'Abr', value: 25000 },
  { name: 'May', value: 20000 },
  { name: 'Jun', value: 28000 },
  { name: 'Jul', value: 32000 },
  { name: 'Ago', value: 30000 },
  { name: 'Sep', value: 24000 },
  { name: 'Oct', value: 26500 },
  { name: 'Nov', value: 28500 },
  { name: 'Dic', value: 35000 },
];

const mockPatientSatisfactionData: AnalyticsDataPoint[] = [
  { name: 'Ene', value: 4.2 },
  { name: 'Feb', value: 4.3 },
  { name: 'Mar', value: 4.4 },
  { name: 'Abr', value: 4.5 },
  { name: 'May', value: 4.6 },
  { name: 'Jun', value: 4.7 },
  { name: 'Jul', value: 4.8 },
  { name: 'Ago', value: 4.8 },
  { name: 'Sep', value: 4.7 },
  { name: 'Oct', value: 4.8 },
  { name: 'Nov', value: 4.9 },
  { name: 'Dic', value: 4.9 },
];

const mockAppointmentTypeData: AnalyticsDataPoint[] = [
  { name: 'Presencial', value: 65 },
  { name: 'Telemedicina', value: 35 },
];

const mockPatientAcquisitionData: AnalyticsDataPoint[] = [
  { name: 'Doctoralia', value: 45 },
  { name: 'Sitio web', value: 20 },
  { name: 'Referidos', value: 25 },
  { name: 'Otros', value: 10 },
];

const mockNoShowRateData: AnalyticsDataPoint[] = [
  { name: 'Ene', value: 8 },
  { name: 'Feb', value: 7 },
  { name: 'Mar', value: 6 },
  { name: 'Abr', value: 5 },
  { name: 'May', value: 6 },
  { name: 'Jun', value: 4 },
  { name: 'Jul', value: 5 },
  { name: 'Ago', value: 4 },
  { name: 'Sep', value: 5 },
  { name: 'Oct', value: 4 },
  { name: 'Nov', value: 3 },
  { name: 'Dic', value: 2 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  doctorId,
  timeRange = 'month',
  onTimeRangeChange
}) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [appointmentsData, setAppointmentsData] = useState<AnalyticsDataPoint[]>([]);
  const [revenueData, setRevenueData] = useState<AnalyticsDataPoint[]>([]);
  const [patientSatisfactionData, setPatientSatisfactionData] = useState<AnalyticsDataPoint[]>([]);
  const [appointmentTypeData, setAppointmentTypeData] = useState<AnalyticsDataPoint[]>([]);
  const [patientAcquisitionData, setPatientAcquisitionData] = useState<AnalyticsDataPoint[]>([]);
  const [noShowRateData, setNoShowRateData] = useState<AnalyticsDataPoint[]>([]);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          setAppointmentsData(mockAppointmentsData);
          setRevenueData(mockRevenueData);
          setPatientSatisfactionData(mockPatientSatisfactionData);
          setAppointmentTypeData(mockAppointmentTypeData);
          setPatientAcquisitionData(mockPatientAcquisitionData);
          setNoShowRateData(mockNoShowRateData);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [doctorId, timeRange]);
  
  const handleTimeRangeChange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate KPIs
  const totalAppointments = appointmentsData.reduce((sum, item) => sum + item.value, 0);
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.value, 0);
  const averageSatisfaction = patientSatisfactionData.reduce((sum, item) => sum + item.value, 0) / patientSatisfactionData.length;
  const averageNoShowRate = noShowRateData.reduce((sum, item) => sum + item.value, 0) / noShowRateData.length;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Análisis de negocio</h2>
        
        <div className="flex space-x-3">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              icon={<Calendar size={16} />}
              iconPosition="right"
              className="flex items-center"
              onClick={() => {}}
            >
              {timeRange === 'week' && 'Esta semana'}
              {timeRange === 'month' && 'Este mes'}
              {timeRange === 'quarter' && 'Este trimestre'}
              {timeRange === 'year' && 'Este año'}
              <ChevronDown size={16} className="ml-2" />
            </Button>
            
            {/* Time range dropdown would go here */}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={() => {}}
          >
            Exportar
          </Button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total de citas</p>
              <p className="text-2xl font-bold">{totalAppointments}</p>
            </div>
            <div className="rounded-full bg-blue-50 p-2">
              <Calendar size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+12%</span>
            <span className="text-gray-500 ml-1">vs. periodo anterior</span>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ingresos</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="rounded-full bg-green-50 p-2">
              <DollarSign size={20} className="text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+8%</span>
            <span className="text-gray-500 ml-1">vs. periodo anterior</span>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Satisfacción</p>
              <p className="text-2xl font-bold">{averageSatisfaction.toFixed(1)}/5.0</p>
            </div>
            <div className="rounded-full bg-amber-50 p-2">
              <Users size={20} className="text-amber-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+0.2</span>
            <span className="text-gray-500 ml-1">vs. periodo anterior</span>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tasa de inasistencia</p>
              <p className="text-2xl font-bold">{averageNoShowRate.toFixed(1)}%</p>
            </div>
            <div className="rounded-full bg-red-50 p-2">
              <Clock size={20} className="text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp size={16} className="text-green-500 mr-1" transform="rotate(180)" />
            <span className="text-green-500 font-medium">-2.5%</span>
            <span className="text-gray-500 ml-1">vs. periodo anterior</span>
          </div>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="rounded-md">
            Visión general
          </TabsTrigger>
          <TabsTrigger value="appointments" className="rounded-md">
            Citas
          </TabsTrigger>
          <TabsTrigger value="revenue" className="rounded-md">
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="patients" className="rounded-md">
            Pacientes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Tendencia de citas</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointmentsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Citas" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Tendencia de ingresos</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Ingresos']} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Ingresos" 
                      fill="#82ca9d" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Tipos de citas</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {appointmentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} citas`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Origen de pacientes</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patientAcquisitionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {patientAcquisitionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} pacientes`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="appointments" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Tendencia de citas</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointmentsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Citas" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Tipos de citas</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={appointmentTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {appointmentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} citas`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Tasa de inasistencia</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={noShowRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Tasa de inasistencia']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Tasa de inasistencia" 
                        stroke="#ff7300" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Tendencia de ingresos</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Ingresos']} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Ingresos" 
                      fill="#82ca9d" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="patients" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Satisfacción de pacientes</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientSatisfactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Satisfacción" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Origen de pacientes</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patientAcquisitionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {patientAcquisitionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} pacientes`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;