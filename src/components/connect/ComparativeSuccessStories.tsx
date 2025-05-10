import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { ArrowUpRight, Users, Calendar, Clock } from 'lucide-react';

interface ComparativeSuccessStoriesProps {
  className?: string;
}

const ComparativeSuccessStories: React.FC<ComparativeSuccessStoriesProps> = ({ className }) => {
  const comparisonData = [
    { name: 'Nuevos pacientes', before: 12, after: 28 },
    { name: 'Citas mensuales', before: 45, after: 72 },
    { name: 'Tasa de ocupación', before: 65, after: 92 },
    { name: 'No-shows', before: 18, after: 7 }
  ];
  
  const improvements = comparisonData.map(item => {
    let percentage = 0;
    if (item.name === 'No-shows') {
      percentage = ((item.before - item.after) / item.before) * 100;
    } else {
      percentage = ((item.after - item.before) / item.before) * 100;
    }
    return {
      ...item,
      improvement: Math.round(percentage)
    };
  });
  
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Historias de Éxito</h2>
        <p className="text-sm text-gray-600">
          Casos de estudio comparativos antes y después de usar Doctor.mx Connect.
        </p>
      </div>
      
      <div className="p-4">
        <h3 className="text-md font-medium text-gray-800 mb-3">Impacto en la Práctica Médica</h3>
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="before" name="Antes de Doctor.mx" fill="#94a3b8" />
              <Bar dataKey="after" name="Con Doctor.mx" fill="#2962FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {improvements.map((item) => (
            <div key={item.name} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-700">{item.name}</h4>
                <div className="flex items-center text-green-600">
                  <ArrowUpRight size={16} />
                  <span className="text-lg font-semibold ml-1">{item.improvement}%</span>
                </div>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-gray-500 text-sm">
                  Antes: <span className="font-medium">{item.before}</span>
                </div>
                <div className="text-blue-600 text-sm font-medium">
                  Ahora: <span className="font-medium">{item.after}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-md font-medium text-gray-800 mb-3">Testimonios de Médicos</h3>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">DR</span>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">Dra. Ramírez, Dermatóloga</h4>
              <p className="mt-1 text-sm text-gray-600">
                "Desde que me uní a Doctor.mx, he visto un incremento del 133% en nuevos pacientes. 
                La plataforma me ha permitido optimizar mi agenda y reducir tiempos muertos."
              </p>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Users size={14} className="mr-1" />
                <span className="mr-3">+28 pacientes/mes</span>
                <Calendar size={14} className="mr-1" />
                <span className="mr-3">92% ocupación</span>
                <Clock size={14} className="mr-1" />
                <span>-61% no-shows</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">JL</span>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">Dr. López, Pediatra</h4>
              <p className="mt-1 text-sm text-gray-600">
                "La calidad de los referidos es excepcional. Los pacientes llegan con un pre-diagnóstico 
                acertado y esto me permite ser más eficiente en cada consulta."
              </p>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Users size={14} className="mr-1" />
                <span className="mr-3">+22 pacientes/mes</span>
                <Calendar size={14} className="mr-1" />
                <span className="mr-3">85% ocupación</span>
                <Clock size={14} className="mr-1" />
                <span>-45% no-shows</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparativeSuccessStories;
