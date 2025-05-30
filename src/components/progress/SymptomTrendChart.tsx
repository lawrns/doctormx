/**
 * SymptomTrendChart - Visual trend chart for symptom tracking over time
 * Shows progress patterns and provides insights for health monitoring
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Info, AlertCircle } from 'lucide-react';
import { progressTrackingService } from '@svc/ProgressTrackingService';
import { loggingService } from '@svc/LoggingService';

interface TrendData {
  data: { date: string; value: number; notes?: string }[];
  trend: {
    metricId: string;
    direction: 'improving' | 'worsening' | 'stable';
    changePercentage: number;
    period: 'daily' | 'weekly' | 'monthly';
    significance: 'high' | 'medium' | 'low';
    insights: string[];
  };
  recommendations: string[];
}

interface Props {
  userId?: string;
  metricId: string;
  metricName: string;
  timeframeDays?: number;
  height?: number;
  showRecommendations?: boolean;
}

export default function SymptomTrendChart({
  userId = 'demo_user_123',
  metricId,
  metricName,
  timeframeDays = 30,
  height = 200,
  showRecommendations = true
}: Props) {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  useEffect(() => {
    loadTrendData();
  }, [userId, metricId, timeframeDays]);

  const loadTrendData = async () => {
    try {
      setLoading(true);
      const data = await progressTrackingService.getSymptomTrends(userId, metricId, timeframeDays);
      setTrendData(data);
      loggingService.info('SymptomTrendChart', 'Trend data loaded', {
        metricId,
        dataPoints: data.data.length,
        direction: data.trend.direction
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar tendencias';
      setError(errorMsg);
      loggingService.error('SymptomTrendChart', 'Failed to load trend data', err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: 'improving' | 'worsening' | 'stable') => {
    switch (direction) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'worsening':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = (direction: 'improving' | 'worsening' | 'stable') => {
    switch (direction) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'worsening':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSignificanceColor = (significance: 'high' | 'medium' | 'low') => {
    switch (significance) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const renderSimpleChart = () => {
    if (!trendData || trendData.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
          <div className="text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">No hay datos para mostrar</p>
            <p className="text-sm text-gray-400">Agrega registros para ver tu progreso</p>
          </div>
        </div>
      );
    }

    const data = trendData.data;
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    // Create SVG path
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((point.value - minValue) / range) * 80; // 80% of height for padding
      return `${x},${y}`;
    }).join(' ');

    const pathD = `M ${points.split(' ').map((point, index) => 
      index === 0 ? `M ${point}` : `L ${point}`
    ).join(' ')}`;

    return (
      <div className="relative">
        <svg 
          width="100%" 
          height={height} 
          viewBox="0 0 100 100" 
          className="border border-gray-200 rounded-lg bg-white"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Trend line */}
          <path
            d={pathD}
            fill="none"
            stroke={trendData.trend.direction === 'improving' ? '#10b981' : 
                   trendData.trend.direction === 'worsening' ? '#ef4444' : '#6b7280'}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((point.value - minValue) / range) * 80;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={trendData.trend.direction === 'improving' ? '#10b981' : 
                      trendData.trend.direction === 'worsening' ? '#ef4444' : '#6b7280'}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer hover:r-4 transition-all"
                onClick={() => setSelectedPoint(selectedPoint === index ? null : index)}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>{maxValue}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{minValue}</span>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{new Date(data[0]?.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
          {data.length > 1 && (
            <span>{new Date(data[data.length - 1]?.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
          )}
        </div>

        {/* Selected point tooltip */}
        {selectedPoint !== null && data[selectedPoint] && (
          <div className="absolute bg-black text-white p-2 rounded text-sm transform -translate-x-1/2 -translate-y-full z-10"
               style={{ 
                 left: `${(selectedPoint / (data.length - 1)) * 100}%`,
                 top: `${100 - ((data[selectedPoint].value - minValue) / range) * 80}%`
               }}>
            <p className="font-medium">{data[selectedPoint].value}</p>
            <p className="text-xs opacity-75">
              {new Date(data[selectedPoint].date).toLocaleDateString('es-MX')}
            </p>
            {data[selectedPoint].notes && (
              <p className="text-xs mt-1 max-w-32">{data[selectedPoint].notes}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando tendencias...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadTrendData}
              className="text-red-600 underline text-sm mt-2"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{metricName}</h3>
          {trendData && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getTrendColor(trendData.trend.direction)}`}>
              {getTrendIcon(trendData.trend.direction)}
              <span className="text-sm font-medium">
                {trendData.trend.direction === 'improving' ? 'Mejorando' :
                 trendData.trend.direction === 'worsening' ? 'Empeorando' : 'Estable'}
                {trendData.trend.changePercentage > 0 && (
                  <span className="ml-1">({trendData.trend.changePercentage.toFixed(1)}%)</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        {renderSimpleChart()}
      </div>

      {/* Insights and Recommendations */}
      {trendData && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* Trend Insights */}
          {trendData.trend.insights.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Análisis de Tendencia
              </h4>
              <div className="space-y-2">
                {trendData.trend.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    {insight}
                  </div>
                ))}
              </div>
              
              {/* Significance Indicator */}
              <div className="mt-2">
                <span className={`text-xs font-medium ${getSignificanceColor(trendData.trend.significance)}`}>
                  Significancia: {trendData.trend.significance === 'high' ? 'Alta' :
                                 trendData.trend.significance === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {showRecommendations && trendData.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Recomendaciones
              </h4>
              <div className="space-y-2">
                {trendData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded text-sm text-orange-700">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    {recommendation}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Summary */}
          <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t border-gray-100">
            <span>
              {trendData.data.length} registros en {timeframeDays} días
            </span>
            <span>
              Último: {trendData.data.length > 0 && 
                       new Date(trendData.data[trendData.data.length - 1].date).toLocaleDateString('es-MX')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}