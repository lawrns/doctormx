import { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, BarChart2, Clock, Users, TrendingUp, Activity, Search } from 'lucide-react';
import analyticsService from '../../services/AnalyticsService';

interface TrendData {
  period: string;
  count: number;
  change: number;
  changeDirection: 'up' | 'down' | 'neutral';
}

interface PopularSymptom {
  id: string;
  name: string;
  count: number;
  trend: 'up' | 'down' | 'neutral';
  changePercent: number;
}

interface RegionalData {
  region: string;
  symptoms: {
    id: string;
    name: string;
    percent: number;
  }[];
}

interface SymptomTrendsProps {
  compact?: boolean;
  showRegionalData?: boolean;
}

const SymptomTrends: React.FC<SymptomTrendsProps> = ({ 
  compact = false, 
  showRegionalData = true 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [popularSymptoms, setPopularSymptoms] = useState<PopularSymptom[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load trend data on mount and when period changes
  useEffect(() => {
    const fetchTrendData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would fetch data from an API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get usage data from analytics service
        const usageData = await analyticsService.getSymptomCheckerUsageData();
        
        // Generate mock trend data based on period
        const mockTrends: TrendData[] = [
          {
            period: 'Evaluaciones',
            count: selectedPeriod === 'week' ? 387 : selectedPeriod === 'month' ? 1654 : 8426,
            change: selectedPeriod === 'week' ? 4.2 : selectedPeriod === 'month' ? -2.1 : 15.8,
            changeDirection: selectedPeriod === 'week' ? 'up' : selectedPeriod === 'month' ? 'down' : 'up'
          },
          {
            period: 'Citas agendadas',
            count: selectedPeriod === 'week' ? 143 : selectedPeriod === 'month' ? 698 : 3564,
            change: selectedPeriod === 'week' ? 7.8 : selectedPeriod === 'month' ? 3.2 : 9.5,
            changeDirection: selectedPeriod === 'week' ? 'up' : selectedPeriod === 'month' ? 'up' : 'up'
          },
          {
            period: 'Tasa de conversión',
            count: 37, // percentage
            change: selectedPeriod === 'week' ? 2.3 : selectedPeriod === 'month' ? 1.5 : -0.8,
            changeDirection: selectedPeriod === 'week' ? 'up' : selectedPeriod === 'month' ? 'up' : 'down'
          }
        ];
        
        // Generate mock popular symptoms
        const mockPopularSymptoms: PopularSymptom[] = [
          {
            id: 'headache',
            name: 'Dolor de cabeza',
            count: selectedPeriod === 'week' ? 86 : selectedPeriod === 'month' ? 354 : 1245,
            trend: 'up',
            changePercent: 12.4
          },
          {
            id: 'abdominal_pain',
            name: 'Dolor abdominal',
            count: selectedPeriod === 'week' ? 64 : selectedPeriod === 'month' ? 278 : 986,
            trend: 'up',
            changePercent: 8.7
          },
          {
            id: 'back_pain',
            name: 'Dolor de espalda',
            count: selectedPeriod === 'week' ? 52 : selectedPeriod === 'month' ? 215 : 754,
            trend: 'down',
            changePercent: 3.2
          },
          {
            id: 'cough',
            name: 'Tos',
            count: selectedPeriod === 'week' ? 47 : selectedPeriod === 'month' ? 198 : 612,
            trend: 'up',
            changePercent: 15.6
          },
          {
            id: 'fever',
            name: 'Fiebre',
            count: selectedPeriod === 'week' ? 43 : selectedPeriod === 'month' ? 182 : 583,
            trend: 'down',
            changePercent: 5.1
          }
        ];
        
        // Generate mock regional data
        const mockRegionalData: RegionalData[] = [
          {
            region: 'Cabeza',
            symptoms: [
              { id: 'headache', name: 'Dolor de cabeza', percent: 68 },
              { id: 'dizziness', name: 'Mareo', percent: 22 },
              { id: 'vision_problems', name: 'Problemas de visión', percent: 10 }
            ]
          },
          {
            region: 'Pecho',
            symptoms: [
              { id: 'cough', name: 'Tos', percent: 45 },
              { id: 'chest_pain', name: 'Dolor de pecho', percent: 30 },
              { id: 'shortness_of_breath', name: 'Dificultad para respirar', percent: 25 }
            ]
          },
          {
            region: 'Abdomen',
            symptoms: [
              { id: 'abdominal_pain', name: 'Dolor abdominal', percent: 55 },
              { id: 'nausea', name: 'Náuseas', percent: 25 },
              { id: 'diarrhea', name: 'Diarrea', percent: 20 }
            ]
          },
          {
            region: 'Espalda',
            symptoms: [
              { id: 'back_pain', name: 'Dolor de espalda', percent: 75 },
              { id: 'muscle_pain', name: 'Dolor muscular', percent: 15 },
              { id: 'spine_pain', name: 'Dolor en columna', percent: 10 }
            ]
          }
        ];
        
        setTrends(mockTrends);
        setPopularSymptoms(mockPopularSymptoms);
        setRegionalData(mockRegionalData);
      } catch (error) {
        console.error('Error fetching trend data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrendData();
  }, [selectedPeriod]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Compact view for dashboard widgets
  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
          <h3 className="font-medium text-blue-900">Tendencias de Síntomas</h3>
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            Último mes
          </div>
        </div>
        
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Síntomas más comunes</h4>
          
          <div className="space-y-2">
            {popularSymptoms.slice(0, 3).map((symptom) => (
              <div key={symptom.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600">{symptom.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    {symptom.count}
                  </span>
                  <span className={`text-xs flex items-center ${
                    symptom.trend === 'up' 
                      ? 'text-green-600' 
                      : symptom.trend === 'down' 
                      ? 'text-red-600' 
                      : 'text-gray-500'
                  }`}>
                    {symptom.trend === 'up' 
                      ? <ArrowUp size={12} className="mr-0.5" /> 
                      : symptom.trend === 'down' 
                      ? <ArrowDown size={12} className="mr-0.5" /> 
                      : null
                    }
                    {symptom.changePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-right mt-3">
            <a href="#" className="text-blue-600 hover:text-blue-800 text-xs font-medium">
              Ver más
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900">Tendencias de Evaluación de Síntomas</h3>
      </div>
      
      <div className="p-6">
        {/* Period selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período de análisis:
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                selectedPeriod === 'week' 
                  ? 'bg-blue-100 text-blue-800 font-medium' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Última semana
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                selectedPeriod === 'month' 
                  ? 'bg-blue-100 text-blue-800 font-medium' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Último mes
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                selectedPeriod === 'year' 
                  ? 'bg-blue-100 text-blue-800 font-medium' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Último año
            </button>
          </div>
        </div>
        
        {/* Trend cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {trends.map((trend, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-500">
                  {trend.period}
                </h4>
                {index === 0 && <BarChart2 size={18} className="text-blue-500" />}
                {index === 1 && <Users size={18} className="text-blue-500" />}
                {index === 2 && <Activity size={18} className="text-blue-500" />}
              </div>
              
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-gray-900">
                  {trend.period === 'Tasa de conversión' ? `${trend.count}%` : trend.count.toLocaleString()}
                </p>
                <div className={`flex items-center text-sm ${
                  trend.changeDirection === 'up' 
                    ? 'text-green-600' 
                    : trend.changeDirection === 'down' 
                    ? 'text-red-600' 
                    : 'text-gray-500'
                }`}>
                  {trend.changeDirection === 'up' 
                    ? <ArrowUp size={16} className="mr-0.5" /> 
                    : trend.changeDirection === 'down' 
                    ? <ArrowDown size={16} className="mr-0.5" /> 
                    : null
                  }
                  {Math.abs(trend.change)}%
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Popular symptoms */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Síntomas Más Comunes</h4>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {popularSymptoms.map((symptom, index) => (
                <div 
                  key={symptom.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="font-medium text-blue-800">{index + 1}</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{symptom.name}</h5>
                      <p className="text-sm text-gray-500">
                        {symptom.count.toLocaleString()} {selectedPeriod === 'week' ? 'esta semana' : selectedPeriod === 'month' ? 'este mes' : 'este año'}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center ${
                    symptom.trend === 'up' 
                      ? 'text-green-600' 
                      : symptom.trend === 'down' 
                      ? 'text-red-600' 
                      : 'text-gray-500'
                  }`}>
                    {symptom.trend === 'up' 
                      ? <ArrowUp size={16} className="mr-1" /> 
                      : symptom.trend === 'down' 
                      ? <ArrowDown size={16} className="mr-1" /> 
                      : null
                    }
                    {Math.abs(symptom.changePercent)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Regional data */}
        {showRegionalData && (
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Síntomas por Región Corporal</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regionalData.map((region) => (
                <div 
                  key={region.region}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                >
                  <h5 className="font-medium text-gray-900 mb-3">{region.region}</h5>
                  
                  {region.symptoms.map((symptom) => (
                    <div key={symptom.id} className="mb-2 last:mb-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{symptom.name}</span>
                        <span className="font-medium text-gray-900">{symptom.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${symptom.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Search frequency trends */}
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Búsquedas Tendencia</h4>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <Search size={16} className="text-blue-500 mr-2" />
              <span className="text-gray-700">Términos de búsqueda más frecuentes</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="bg-blue-50 px-3 py-1.5 rounded-full text-blue-800 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1 text-blue-600" />
                dolor de cabeza
              </div>
              <div className="bg-blue-50 px-3 py-1.5 rounded-full text-blue-800 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1 text-blue-600" />
                fiebre y tos
              </div>
              <div className="bg-blue-50 px-3 py-1.5 rounded-full text-blue-800 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1 text-blue-600" />
                dolor estómago
              </div>
              <div className="bg-blue-50 px-3 py-1.5 rounded-full text-blue-800 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1 text-blue-600" />
                mareos
              </div>
              <div className="bg-blue-50 px-3 py-1.5 rounded-full text-blue-800 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1 text-blue-600" />
                presión en el pecho
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <Clock size={14} className="inline-block mr-1" />
              Actualizado hace 2 horas
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="text-xs text-gray-500 mt-8 border-t border-gray-100 pt-4">
          <p>
            Estos datos representan tendencias generales basadas en las evaluaciones realizadas 
            por usuarios en nuestra plataforma. No constituyen evidencia epidemiológica oficial.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SymptomTrends;