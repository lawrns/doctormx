import React, { useState, useEffect } from 'react';
import { Calendar, ArrowUp, ArrowDown, Minus, BarChart2, List, Clock, Filter } from 'lucide-react';

interface SymptomRecord {
  id: string;
  date: Date;
  symptomId: string;
  symptomName: string;
  severity: number; // 1-10
  duration: string;
  factors: {
    triggers?: string[];
    relievers?: string[];
  };
  notes: string;
}

interface SymptomHistoryProps {
  symptomId?: string;
  symptomName?: string;
  initialRecords?: SymptomRecord[];
  onViewDetails?: (recordId: string) => void;
}

const SymptomHistory: React.FC<SymptomHistoryProps> = ({
  symptomId,
  symptomName = 'síntoma',
  initialRecords,
  onViewDetails
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('chart');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [records, setRecords] = useState<SymptomRecord[]>([]);
  
  // Load records from localStorage or use initialRecords
  useEffect(() => {
    if (initialRecords && initialRecords.length > 0) {
      setRecords(initialRecords);
      return;
    }
    
    // Try to load from localStorage
    try {
      const savedRecords = localStorage.getItem('symptom_history');
      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords);
        
        // Filter by symptomId if provided
        const filteredRecords = symptomId 
          ? parsedRecords.filter((r: any) => r.symptomId === symptomId)
          : parsedRecords;
          
        // Convert date strings to Date objects
        const processedRecords = filteredRecords.map((record: any) => ({
          ...record,
          date: new Date(record.date)
        }));
        
        setRecords(processedRecords);
      } else if (!initialRecords) {
        // If no records found, generate sample data
        setRecords(generateSampleData(symptomId, symptomName));
      }
    } catch (error) {
      console.error('Error loading symptom history:', error);
      // Fallback to sample data
      setRecords(generateSampleData(symptomId, symptomName));
    }
  }, [initialRecords, symptomId, symptomName]);
  
  // Generate sample data for demonstration
  const generateSampleData = (id?: string, name?: string): SymptomRecord[] => {
    const currentDate = new Date();
    const sampleRecords: SymptomRecord[] = [];
    
    // Generate records for the last 30 days
    for (let i = 30; i >= 0; i -= 2) {
      const recordDate = new Date();
      recordDate.setDate(currentDate.getDate() - i);
      
      // Create a pattern of severity
      let severity = 5;
      if (i > 25) severity = 7;  // Higher at first
      else if (i > 15) severity = 5;  // Moderate in the middle
      else if (i > 5) severity = 4;   // Slightly better
      else severity = 3;  // Improving towards the end
      
      // Add some randomness
      severity += Math.floor(Math.random() * 3) - 1;
      severity = Math.max(1, Math.min(10, severity)); // Keep within 1-10 range
      
      sampleRecords.push({
        id: `sample-${i}`,
        date: recordDate,
        symptomId: id || 'headache',
        symptomName: name || 'Dolor de cabeza',
        severity,
        duration: i > 20 ? '2-4 horas' : '1-2 horas',
        factors: {
          triggers: i > 15 ? ['Estrés', 'Falta de sueño'] : ['Estrés'],
          relievers: ['Descanso', 'Analgésicos']
        },
        notes: i > 15 
          ? 'Dolor intenso que interfiere con actividades diarias' 
          : 'Mejorando con el tratamiento'
      });
    }
    
    return sampleRecords;
  };
  
  // Filter records based on time range
  const getFilteredRecords = () => {
    const currentDate = new Date();
    let cutoffDate = new Date();
    
    if (timeRange === 'week') {
      cutoffDate.setDate(currentDate.getDate() - 7);
    } else if (timeRange === 'month') {
      cutoffDate.setMonth(currentDate.getMonth() - 1);
    } else if (timeRange === 'year') {
      cutoffDate.setFullYear(currentDate.getFullYear() - 1);
    }
    
    return records
      .filter(record => record.date >= cutoffDate)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date (newest first)
  };
  
  const filteredRecords = getFilteredRecords();
  
  // Calculate trends
  const calculateTrends = () => {
    if (filteredRecords.length < 2) return { trend: 'stable', severityChange: 0 };
    
    // Get average of first 3 and last 3 records
    const firstRecords = filteredRecords.slice(-3); // Oldest 3 (after sorting)
    const lastRecords = filteredRecords.slice(0, 3); // Newest 3
    
    const firstAvg = firstRecords.reduce((sum, record) => sum + record.severity, 0) / firstRecords.length;
    const lastAvg = lastRecords.reduce((sum, record) => sum + record.severity, 0) / lastRecords.length;
    
    const severityChange = firstAvg - lastAvg;
    
    if (severityChange > 1) return { trend: 'improving', severityChange };
    if (severityChange < -1) return { trend: 'worsening', severityChange: Math.abs(severityChange) };
    return { trend: 'stable', severityChange: 0 };
  };
  
  const { trend, severityChange } = calculateTrends();
  
  // Function to render the trend chart
  const renderChart = () => {
    if (filteredRecords.length === 0) return null;
    
    // Sort by date (oldest first) for chart
    const sortedRecords = [...filteredRecords].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate chart dimensions
    const width = 100;
    const height = 50;
    const padding = 5;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    // Calculate points for the line
    const points = sortedRecords.map((record, index) => {
      const x = padding + (index / (sortedRecords.length - 1)) * graphWidth;
      // Invert y-axis so higher severity shows higher on the graph (lower y-value)
      const y = padding + (1 - record.severity / 10) * graphHeight;
      return `${x},${y}`;
    });
    
    return (
      <div className="mb-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <svg width="100%" height="80" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            {/* Y-axis labels */}
            <text x="2" y={padding + 2} fontSize="6" textAnchor="start" fill="#666">Alta</text>
            <text x="2" y={height - padding} fontSize="6" textAnchor="start" fill="#666">Baja</text>
            
            {/* Horizontal gridlines */}
            <line x1={padding} y1={padding + graphHeight/4} x2={width - padding} y2={padding + graphHeight/4} stroke="#eee" strokeWidth="0.5" />
            <line x1={padding} y1={padding + graphHeight/2} x2={width - padding} y2={padding + graphHeight/2} stroke="#eee" strokeWidth="0.5" />
            <line x1={padding} y1={padding + 3*graphHeight/4} x2={width - padding} y2={padding + 3*graphHeight/4} stroke="#eee" strokeWidth="0.5" />
            
            {/* Line */}
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            
            {/* Points */}
            {sortedRecords.map((record, index) => {
              const x = padding + (index / (sortedRecords.length - 1)) * graphWidth;
              const y = padding + (1 - record.severity / 10) * graphHeight;
              return (
                <circle
                  key={record.id}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#3b82f6"
                />
              );
            })}
          </svg>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{new Date(sortedRecords[0].date).toLocaleDateString()}</span>
            <span>{new Date(sortedRecords[sortedRecords.length - 1].date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get severity color class
  const getSeverityColorClass = (severity: number) => {
    if (severity >= 7) return 'bg-red-500';
    if (severity >= 4) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  // Get trend icon and text color
  const getTrendInfo = () => {
    if (trend === 'improving') {
      return { 
        icon: <ArrowDown size={16} className="text-green-500 mr-1" />, 
        textColor: 'text-green-500',
        text: `Mejorando (↓${severityChange.toFixed(1)} puntos)`
      };
    }
    if (trend === 'worsening') {
      return { 
        icon: <ArrowUp size={16} className="text-red-500 mr-1" />, 
        textColor: 'text-red-500',
        text: `Empeorando (↑${severityChange.toFixed(1)} puntos)`
      };
    }
    return { 
      icon: <Minus size={16} className="text-blue-500 mr-1" />, 
      textColor: 'text-blue-500',
      text: 'Estable'
    };
  };
  
  const trendInfo = getTrendInfo();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-blue-900">Historial de {symptomName}</h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`p-2 rounded ${
              viewMode === 'chart' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Ver como gráfico"
          >
            <BarChart2 size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Ver como lista"
          >
            <List size={18} />
          </button>
        </div>
      </div>
      
      <div className="border-b border-gray-200 px-6 py-2 bg-gray-50 flex items-center justify-between">
        <div className="text-sm flex items-center">
          <Filter size={16} className="mr-1 text-gray-500" />
          <span className="text-gray-700 mr-2">Periodo:</span>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-xs ${
                timeRange === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-xs ${
                timeRange === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 text-xs ${
                timeRange === 'year' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Año
            </button>
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center text-sm ${trendInfo.textColor} font-medium`}>
            {trendInfo.icon}
            {trendInfo.text}
          </div>
        )}
      </div>
      
      <div className="p-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No hay registros de síntomas en este periodo</p>
            <p className="text-sm text-gray-400 mt-1">
              Registre regularmente sus síntomas para ver su progreso a lo largo del tiempo
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'chart' && (
              <div className="mb-4">
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tendencia de intensidad</h4>
                  {renderChart()}
                </div>
                
                {/* Statistics and summary */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Promedio de intensidad</div>
                    <div className="font-medium text-lg">
                      {(filteredRecords.reduce((sum, r) => sum + r.severity, 0) / filteredRecords.length).toFixed(1)}
                      <span className="text-xs text-gray-500 ml-1">/ 10</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Episodios registrados</div>
                    <div className="font-medium text-lg">
                      {filteredRecords.length}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Intensidad máxima</div>
                    <div className="font-medium text-lg">
                      {Math.max(...filteredRecords.map(r => r.severity))}
                      <span className="text-xs text-gray-500 ml-1">/ 10</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Intensidad mínima</div>
                    <div className="font-medium text-lg">
                      {Math.min(...filteredRecords.map(r => r.severity))}
                      <span className="text-xs text-gray-500 ml-1">/ 10</span>
                    </div>
                  </div>
                </div>
                
                {/* Common triggers */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Desencadenantes comunes</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(
                      filteredRecords
                        .flatMap(r => r.factors.triggers || [])
                        .filter(t => t)
                    )).map((trigger, index) => (
                      <span 
                        key={index} 
                        className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full"
                      >
                        {trigger}
                      </span>
                    ))}
                    
                    {(Array.from(new Set(
                      filteredRecords
                        .flatMap(r => r.factors.triggers || [])
                        .filter(t => t)
                    ))).length === 0 && (
                      <span className="text-sm text-gray-500">No se han identificado desencadenantes comunes</span>
                    )}
                  </div>
                </div>
                
                {/* Recent entries preview */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Registros recientes</h4>
                    <button
                      onClick={() => setViewMode('list')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Ver todos
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {filteredRecords.slice(0, 3).map(record => (
                      <div 
                        key={record.id} 
                        className="border border-gray-200 rounded-lg p-3 flex justify-between hover:border-blue-300 cursor-pointer"
                        onClick={() => onViewDetails && onViewDetails(record.id)}
                      >
                        <div className="flex items-center">
                          <div className="mr-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                              <Calendar size={16} className="text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{formatDate(record.date)}</div>
                            <div className="text-xs text-gray-500">{record.duration}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="mr-4">
                            <div className="text-sm text-gray-500 mb-1">Intensidad</div>
                            <div className="w-24 h-2 bg-gray-200 rounded-full">
                              <div 
                                className={`h-2 rounded-full ${getSeverityColorClass(record.severity)}`}
                                style={{ width: `${record.severity * 10}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="font-medium">{record.severity}/10</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {viewMode === 'list' && (
              <div className="space-y-3">
                {filteredRecords.map(record => (
                  <div 
                    key={record.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer"
                    onClick={() => onViewDetails && onViewDetails(record.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <span className="font-medium">{formatDate(record.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{record.duration}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-500">Intensidad</span>
                        <span className="font-medium">{record.severity}/10</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${getSeverityColorClass(record.severity)}`}
                          style={{ width: `${record.severity * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {record.factors.triggers && record.factors.triggers.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-500 block mb-1">Desencadenantes:</span>
                        <div className="flex flex-wrap gap-1">
                          {record.factors.triggers.map((trigger, idx) => (
                            <span key={idx} className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full">
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {record.factors.relievers && record.factors.relievers.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-500 block mb-1">Aliviadores:</span>
                        <div className="flex flex-wrap gap-1">
                          {record.factors.relievers.map((reliever, idx) => (
                            <span key={idx} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                              {reliever}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {record.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        {record.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SymptomHistory;