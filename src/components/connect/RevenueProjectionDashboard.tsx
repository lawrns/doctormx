import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line
} from 'recharts';

interface RevenueProjectionDashboardProps {
  className?: string;
}

const RevenueProjectionDashboard: React.FC<RevenueProjectionDashboardProps> = ({ className }) => {
  const [specialty, setSpecialty] = useState('Todas');
  const [location, setLocation] = useState('Todas');
  const [availability, setAvailability] = useState('Todas');
  
  const specialtyOptions = ['Todas', 'Dermatología', 'Pediatría', 'Cardiología', 'Neurología', 'Ginecología'];
  const locationOptions = ['Todas', 'Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro'];
  const availabilityOptions = ['Todas', 'Tiempo completo', 'Medio tiempo', 'Fines de semana'];
  
  const revenueData = [
    { name: 'Ene', revenue: 2500, patients: 25 },
    { name: 'Feb', revenue: 3200, patients: 32 },
    { name: 'Mar', revenue: 4100, patients: 41 },
    { name: 'Abr', revenue: 5000, patients: 50 },
    { name: 'May', revenue: 4800, patients: 48 },
    { name: 'Jun', revenue: 5800, patients: 58 },
  ];
  
  const specialtyData = [
    { name: 'Dermatología', revenue: 6800 },
    { name: 'Pediatría', revenue: 5400 },
    { name: 'Cardiología', revenue: 8200 },
    { name: 'Neurología', revenue: 7600 },
    { name: 'Ginecología', revenue: 6100 },
  ];
  
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Proyección de Ingresos</h2>
        <p className="text-sm text-gray-600">
          Proyecciones de ingresos mensuales basadas en su especialidad y disponibilidad.
        </p>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
          <select
            className="block w-full p-2 border border-gray-300 rounded-md"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            {specialtyOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <select
            className="block w-full p-2 border border-gray-300 rounded-md"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {locationOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
          <select
            className="block w-full p-2 border border-gray-300 rounded-md"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            {availabilityOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-md font-medium text-gray-800 mb-3">Ingresos mensuales proyectados</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenueData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Ingresos (MXN)" stroke="#2962FF" activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="patients" name="Pacientes" stroke="#5B86FF" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-md font-medium text-gray-800 mb-3">Ingresos por especialidad</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={specialtyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" name="Ingresos (MXN)" fill="#2962FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueProjectionDashboard;
