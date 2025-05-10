import React from 'react';
import { 
  Sankey, Tooltip, ResponsiveContainer, Rectangle
} from 'recharts';

interface PatientFlowVisualizationProps {
  className?: string;
}

const PatientFlowVisualization: React.FC<PatientFlowVisualizationProps> = ({ className }) => {
  const data = {
    nodes: [
      { name: 'Síntomas' },
      { name: 'AI Doctor' },
      { name: 'Dermatología' },
      { name: 'Pediatría' },
      { name: 'Cardiología' },
      { name: 'Otras especialidades' },
      { name: 'Consulta virtual' },
      { name: 'Consulta presencial' }
    ],
    links: [
      { source: 0, target: 1, value: 100, label: '100% de pacientes' },
      { source: 1, target: 2, value: 30, label: '30% Dermatología' },
      { source: 1, target: 3, value: 25, label: '25% Pediatría' },
      { source: 1, target: 4, value: 20, label: '20% Cardiología' },
      { source: 1, target: 5, value: 25, label: '25% Otras especialidades' },
      { source: 2, target: 6, value: 15, label: '50% consulta virtual' },
      { source: 2, target: 7, value: 15, label: '50% consulta presencial' },
      { source: 3, target: 6, value: 10, label: '40% consulta virtual' },
      { source: 3, target: 7, value: 15, label: '60% consulta presencial' },
      { source: 4, target: 6, value: 5, label: '25% consulta virtual' },
      { source: 4, target: 7, value: 15, label: '75% consulta presencial' },
      { source: 5, target: 6, value: 10, label: '40% consulta virtual' },
      { source: 5, target: 7, value: 15, label: '60% consulta presencial' }
    ]
  };
  
  const CustomNode = ({ x, y, width, height, index, payload }: any) => {
    const colors = ['#1641B5', '#2962FF', '#5B86FF', '#60a5fa', '#93c5fd', '#60a5fa', '#10b981', '#f59e0b'];
    return (
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={colors[index]}
        fillOpacity="0.9"
      />
    );
  };
  
  const conversionData = [
    { category: 'Dermatología', rate: 65 },
    { category: 'Pediatría', rate: 72 },
    { category: 'Cardiología', rate: 58 },
    { category: 'Promedio', rate: 65 }
  ];
  
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Flujo de Pacientes</h2>
        <p className="text-sm text-gray-600">
          Visualización del flujo de pacientes desde síntomas hasta consultas médicas.
        </p>
      </div>
      
      <div className="p-4">
        <h3 className="text-md font-medium text-gray-800 mb-3">Flujo de Referencia</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={data}
              node={<CustomNode />}
              link={{ stroke: '#d1d5db' }}
              nodePadding={20}
              margin={{ top: 20, right: 10, bottom: 20, left: 10 }}
            >
              <Tooltip />
            </Sankey>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-md font-medium text-gray-800 mb-3">Tasas de Conversión</h3>
        <p className="text-sm text-gray-600 mb-4">
          Porcentaje de pacientes que convierten de consulta AI a consulta con médico real.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {conversionData.map((item) => (
            <div key={item.category} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">{item.category}</h4>
                <span className="text-lg font-semibold text-blue-600">{item.rate}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${item.rate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-md font-medium text-gray-800 mb-3">Principales Condiciones Referidas</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condición</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% de Referidos</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dermatitis</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dermatología</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Infección respiratoria</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Pediatría</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Hipertensión</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Cardiología</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientFlowVisualization;
