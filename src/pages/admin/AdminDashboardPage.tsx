import { useState } from 'react';
import { 
  Users, Calendar, TrendingUp, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';

function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('today');

  const stats = [
    {
      name: 'Citas totales',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: Calendar
    },
    {
      name: 'Nuevos pacientes',
      value: '245',
      change: '+8.2%',
      trend: 'up',
      icon: Users
    },
    {
      name: 'Ingresos',
      value: '$45,678',
      change: '+23.1%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      name: 'Cancelaciones',
      value: '23',
      change: '-5.4%',
      trend: 'down',
      icon: AlertCircle
    }
  ];

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bienvenido al panel de administración</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-auto"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="year">Este año</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className={`flex items-center ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight size={20} className="mr-1" />
                ) : (
                  <ArrowDownRight size={20} className="mr-1" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <h3 className="text-gray-500 text-sm">{stat.name}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Feed */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Actividad reciente</h2>
            <Activity size={20} className="text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {/* Activity items would go here */}
            <p className="text-gray-500 text-center py-4">
              Cargando actividad...
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Acciones rápidas</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Verificar médicos</h3>
              <p className="text-sm text-gray-500">3 pendientes</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <Calendar className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Gestionar citas</h3>
              <p className="text-sm text-gray-500">12 para hoy</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <AlertCircle className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Soporte</h3>
              <p className="text-sm text-gray-500">5 tickets abiertos</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Ver reportes</h3>
              <p className="text-sm text-gray-500">Actualizado hace 2h</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;