import { useEffect, useRef } from 'react';
import { Grid, PieChart, BarChart2, TrendingUp, ThermometerSnowflake, Thermometer, ThermometerSun } from 'lucide-react';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

interface AnalyticsChartsProps {
  symptomId?: string;
  severity?: 'low' | 'moderate' | 'high';
  urgency?: 'routine' | 'soon' | 'urgent' | 'emergency';
  recommendations?: string[];
  conditions?: Array<{
    name: string;
    probability: string;
  }>;
  data?: {
    [key: string]: any;
  };
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  symptomId,
  severity = 'moderate',
  urgency = 'routine',
  recommendations = [],
  conditions = [],
  data = {}
}) => {
  const probabilityChartRef = useRef<HTMLCanvasElement>(null);
  const severityDistributionRef = useRef<HTMLCanvasElement>(null);
  
  // Manually drawing charts with canvas to avoid dependencies
  useEffect(() => {
    // Draw probability chart
    if (probabilityChartRef.current && conditions.length > 0) {
      const canvas = probabilityChartRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up variables
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Map probabilities to values
        const probToValue = (prob: string) => {
          switch(prob) {
            case 'alta': return 65;
            case 'media': return 25;
            case 'baja': return 10;
            default: return 0;
          }
        };
        
        // Get data
        const values = conditions.map(c => probToValue(c.probability));
        const total = values.reduce((a, b) => a + b, 0);
        
        // Colors
        const colors = [
          '#3b82f6', // blue-500
          '#60a5fa', // blue-400
          '#93c5fd', // blue-300
          '#bfdbfe'  // blue-200
        ];
        
        // Draw pie chart
        let startAngle = 0;
        conditions.forEach((condition, index) => {
          const value = probToValue(condition.probability);
          const sliceAngle = (value / total) * 2 * Math.PI;
          
          ctx.fillStyle = colors[index % colors.length];
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
          ctx.closePath();
          ctx.fill();
          
          // Draw labels
          const labelAngle = startAngle + sliceAngle / 2;
          const labelRadius = radius * 0.7;
          const labelX = centerX + Math.cos(labelAngle) * labelRadius;
          const labelY = centerY + Math.sin(labelAngle) * labelRadius;
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Truncate long condition names
          const displayName = condition.name.length > 12
            ? condition.name.substring(0, 10) + '...'
            : condition.name;
          
          ctx.fillText(displayName, labelX, labelY);
          
          startAngle += sliceAngle;
        });
        
        // Draw legend
        const legendX = 10;
        let legendY = canvas.height - 15 * conditions.length;
        
        conditions.forEach((condition, index) => {
          // Color square
          ctx.fillStyle = colors[index % colors.length];
          ctx.fillRect(legendX, legendY - 8, 10, 10);
          
          // Label
          ctx.fillStyle = '#4b5563'; // text-gray-600
          ctx.font = '10px Arial';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          
          const displayValue = probToValue(condition.probability);
          ctx.fillText(`${condition.name} (${displayValue}%)`, legendX + 15, legendY - 3);
          
          legendY += 15;
        });
      }
    }
    
    // Draw severity distribution chart
    if (severityDistributionRef.current) {
      const canvas = severityDistributionRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up variables
        const barWidth = 30;
        const spacing = 15;
        const startX = 40;
        const bottomY = canvas.height - 30;
        const maxBarHeight = bottomY - 20;
        
        // Get data for this symptom
        // In a real app, this would be actual distribution data
        const severityDistribution = {
          low: symptomId === 'headache' ? 45 : symptomId === 'chest_pain' ? 30 : 40,
          moderate: symptomId === 'headache' ? 35 : symptomId === 'chest_pain' ? 35 : 35,
          high: symptomId === 'headache' ? 20 : symptomId === 'chest_pain' ? 35 : 25
        };
        
        const maxValue = Math.max(...Object.values(severityDistribution));
        
        // Colors
        const getBarColor = (level: string) => {
          switch(level) {
            case 'low': return '#4ade80'; // green-400
            case 'moderate': return '#fbbf24'; // amber-400
            case 'high': return '#f87171'; // red-400
            default: return '#9ca3af'; // gray-400
          }
        };
        
        // Draw bars and labels
        let currentX = startX;
        const levels = ['low', 'moderate', 'high'];
        
        levels.forEach(level => {
          const value = severityDistribution[level as keyof typeof severityDistribution];
          const barHeight = (value / maxValue) * maxBarHeight;
          
          // Draw bar
          ctx.fillStyle = getBarColor(level);
          ctx.fillRect(currentX, bottomY - barHeight, barWidth, barHeight);
          
          // Highlight user's severity
          if (severity === level) {
            ctx.strokeStyle = '#1f2937'; // gray-800
            ctx.lineWidth = 2;
            ctx.strokeRect(currentX, bottomY - barHeight, barWidth, barHeight);
            
            // Marker for user's position
            ctx.fillStyle = '#1f2937'; // gray-800
            ctx.beginPath();
            ctx.moveTo(currentX + barWidth / 2, bottomY - barHeight - 15);
            ctx.lineTo(currentX + barWidth / 2 - 5, bottomY - barHeight - 5);
            ctx.lineTo(currentX + barWidth / 2 + 5, bottomY - barHeight - 5);
            ctx.closePath();
            ctx.fill();
          }
          
          // Value on top of bar
          ctx.fillStyle = '#4b5563'; // text-gray-600
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${value}%`, currentX + barWidth / 2, bottomY - barHeight - 5);
          
          // Label below bar
          const labelText = level.charAt(0).toUpperCase() + level.slice(1);
          ctx.fillText(labelText, currentX + barWidth / 2, bottomY + 15);
          
          currentX += barWidth + spacing;
        });
        
        // Draw axes
        ctx.strokeStyle = '#9ca3af'; // gray-400
        ctx.lineWidth = 1;
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(startX - 10, 20);
        ctx.lineTo(startX - 10, bottomY);
        ctx.lineTo(canvas.width - 20, bottomY);
        ctx.stroke();
        
        // Y-axis label
        ctx.fillStyle = '#4b5563'; // text-gray-600
        ctx.font = '9px Arial';
        ctx.textAlign = 'right';
        ctx.save();
        ctx.translate(startX - 25, bottomY / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Porcentaje de pacientes', 0, 0);
        ctx.restore();
      }
    }
  }, [symptomId, severity, conditions]);

  // Get an icon based on severity
  const getSeverityIcon = () => {
    switch (severity) {
      case 'low':
        return <ThermometerSnowflake size={24} className="text-green-500" />;
      case 'moderate':
        return <Thermometer size={24} className="text-amber-500" />;
      case 'high':
        return <ThermometerSun size={24} className="text-red-500" />;
      default:
        return <Thermometer size={24} className="text-gray-500" />;
    }
  };

  // Get a color based on severity
  const getSeverityColor = () => {
    switch (severity) {
      case 'low':
        return 'border-green-200 bg-green-50 text-green-700';
      case 'moderate':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'high':
        return 'border-red-200 bg-red-50 text-red-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  // Get urgency text
  const getUrgencyText = () => {
    switch (urgency) {
      case 'emergency':
        return 'Emergencia (inmediata)';
      case 'urgent':
        return 'Urgente (1-2 días)';
      case 'soon':
        return 'Pronta (1 semana)';
      case 'routine':
        return 'Rutina (cuando sea conveniente)';
      default:
        return 'No especificada';
    }
  };

  // Get urgency color
  const getUrgencyColor = () => {
    switch (urgency) {
      case 'emergency':
        return 'border-red-200 bg-red-50 text-red-700';
      case 'urgent':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'soon':
        return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'routine':
        return 'border-green-200 bg-green-50 text-green-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Grid size={20} className="mr-2 text-blue-600" />
          Análisis de síntomas
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Severity Level */}
          <div className={`border rounded-lg p-4 ${getSeverityColor()}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-medium">Nivel de severidad</h4>
              {getSeverityIcon()}
            </div>
            <p className="mb-2 text-sm">
              Sus síntomas indican un nivel de severidad:
            </p>
            <p className="font-bold text-lg">
              {severity === 'low' ? 'Bajo' : 
               severity === 'moderate' ? 'Moderado' : 'Alto'}
            </p>
            <p className="mt-1 text-xs opacity-80">
              {severity === 'low' 
                ? 'Sus síntomas son leves y probablemente pueden manejarse con medidas de autocuidado.' 
                : severity === 'moderate' 
                ? 'Sus síntomas justifican atención médica para evaluación y posible tratamiento.' 
                : 'Sus síntomas son significativos y requieren atención médica.'}
            </p>
          </div>

          {/* Urgency Level */}
          <div className={`border rounded-lg p-4 ${getUrgencyColor()}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-medium">Nivel de atención</h4>
              <TrendingUp size={24} className={urgency === 'emergency' || urgency === 'urgent' 
                ? 'text-red-500' 
                : urgency === 'soon' 
                ? 'text-amber-500' 
                : 'text-green-500'} />
            </div>
            <p className="mb-2 text-sm">
              Basado en su evaluación, recomendamos:
            </p>
            <p className="font-bold text-lg">
              {getUrgencyText()}
            </p>
            <p className="mt-1 text-xs opacity-80">
              {urgency === 'emergency' 
                ? 'Busque atención médica de emergencia inmediatamente.' 
                : urgency === 'urgent' 
                ? 'Consulte con un médico dentro de 1-2 días.' 
                : urgency === 'soon'
                ? 'Agende una cita médica dentro de la próxima semana.'
                : 'Puede programar una consulta cuando le sea conveniente.'}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Differential Diagnosis */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <PieChart size={18} className="text-blue-600 mr-2" />
              <h4 className="text-base font-medium text-gray-900">Diagnóstico diferencial</h4>
            </div>
            <div className="aspect-square w-full">
              <canvas ref={probabilityChartRef} width={200} height={200} className="mx-auto"></canvas>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Probabilidad relativa de las posibles condiciones
            </p>
          </div>

          {/* Severity Distribution */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <BarChart2 size={18} className="text-blue-600 mr-2" />
              <h4 className="text-base font-medium text-gray-900">Distribución de severidad</h4>
            </div>
            <div className="aspect-square w-full">
              <canvas ref={severityDistributionRef} width={200} height={200} className="mx-auto"></canvas>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Comparación de su caso con otros pacientes similares
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mr-2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h4 className="text-base font-medium text-gray-900">Recomendaciones</h4>
            </div>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-1 mr-2 flex-shrink-0">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>
            Este análisis se basa en los síntomas reportados y no constituye un diagnóstico médico.
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;