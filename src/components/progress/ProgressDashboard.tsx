/**
 * ProgressDashboard - Comprehensive health progress tracking dashboard
 * Displays trends, goals, and insights for user health metrics
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Target, Calendar, AlertCircle, 
  CheckCircle, Clock, Activity, Heart, Brain, Droplets, Moon,
  ChevronRight, Plus, Filter, RefreshCw, Info
} from 'lucide-react';
import { progressTrackingService } from '@svc/ProgressTrackingService';
import { loggingService } from '@svc/LoggingService';

interface ProgressDashboard {
  overview: {
    totalMetrics: number;
    activeGoals: number;
    improvingTrends: number;
    daysTracked: number;
    currentStreak: number;
  };
  recentEntries: any[];
  trends: any[];
  goals: any[];
  insights: {
    weekly: string[];
    monthly: string[];
    constitutional: string[];
    seasonal: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

interface Props {
  userId?: string;
  timeframe?: 'week' | 'month' | 'quarter';
  onMetricClick?: (metricId: string) => void;
  onGoalClick?: (goalId: string) => void;
}

export default function ProgressDashboard({ 
  userId = 'demo_user_123', 
  timeframe = 'month',
  onMetricClick,
  onGoalClick 
}: Props) {
  const [dashboard, setDashboard] = useState<ProgressDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInsightCategory, setSelectedInsightCategory] = useState<'weekly' | 'monthly' | 'constitutional' | 'seasonal'>('weekly');

  useEffect(() => {
    loadDashboard();
  }, [userId, timeframe]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await progressTrackingService.getProgressDashboard(userId, timeframe);
      setDashboard(dashboardData);
      loggingService.info('ProgressDashboard', 'Dashboard loaded', {
        userId,
        timeframe,
        metricsCount: dashboardData.overview.totalMetrics
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar el dashboard';
      setError(errorMsg);
      loggingService.error('ProgressDashboard', 'Failed to load dashboard', err instanceof Error ? err : new Error(errorMsg));
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

  const getMetricIcon = (category: string) => {
    const icons = {
      symptom: Heart,
      vital: Activity,
      lifestyle: Calendar,
      constitutional: Brain,
      medication: Droplets,
      mood: Moon
    };
    return icons[category as keyof typeof icons] || Activity;
  };

  const formatProgress = (progress: number) => {
    return `${Math.round(progress)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando progreso...</span>
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
              onClick={() => { setError(null); loadDashboard(); }}
              className="text-red-600 underline text-sm mt-2"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No hay datos de progreso disponibles</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seguimiento de Progreso</h1>
          <p className="text-gray-600">Monitorea tu salud y bienestar a lo largo del tiempo</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => window.location.reload()} // Simple refresh for demo
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
          </select>
          <button
            onClick={loadDashboard}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">Métricas Activas</p>
              <p className="text-2xl font-semibold text-blue-800">{dashboard.overview.totalMetrics}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-green-600">Objetivos Activos</p>
              <p className="text-2xl font-semibold text-green-800">{dashboard.overview.activeGoals}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600">Mejorando</p>
              <p className="text-2xl font-semibold text-purple-800">{dashboard.overview.improvingTrends}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-orange-600">Días Registrados</p>
              <p className="text-2xl font-semibold text-orange-800">{dashboard.overview.daysTracked}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-600">Racha Actual</p>
              <p className="text-2xl font-semibold text-yellow-800">{dashboard.overview.currentStreak} días</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Tendencias Recientes
          </h2>

          <div className="space-y-3">
            {dashboard.trends.slice(0, 5).map((trend, index) => (
              <div 
                key={trend.metricId}
                className={`p-3 rounded-lg border ${getTrendColor(trend.direction)} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => onMetricClick?.(trend.metricId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTrendIcon(trend.direction)}
                    <div>
                      <p className="font-medium">{trend.metricId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p className="text-sm opacity-75">
                        {trend.direction === 'improving' ? 'Mejorando' : 
                         trend.direction === 'worsening' ? 'Empeorando' : 'Estable'} 
                        {trend.changePercentage > 0 && ` ${trend.changePercentage.toFixed(1)}%`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </div>

                {trend.insights.length > 0 && (
                  <div className="mt-2 text-xs opacity-75">
                    {trend.insights[0]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {dashboard.trends.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay suficientes datos para mostrar tendencias</p>
              <p className="text-sm">Agrega más registros para ver tu progreso</p>
            </div>
          )}
        </div>

        {/* Goals Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Objetivos de Bienestar
            </h2>
            <button className="text-green-600 hover:text-green-700">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {dashboard.goals.map((goal) => (
              <div 
                key={goal.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onGoalClick?.(goal.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    {formatProgress(goal.progress)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>

                {/* Milestones */}
                <div className="flex items-center gap-2">
                  {goal.milestones.slice(0, 3).map((milestone: any, index: number) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        milestone.achieved 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {milestone.achieved ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {milestone.label}
                    </div>
                  ))}
                </div>

                {/* Deadline */}
                <div className="mt-2 text-xs text-gray-500">
                  Meta: {new Date(goal.deadline).toLocaleDateString('es-MX')}
                </div>
              </div>
            ))}
          </div>

          {dashboard.goals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No tienes objetivos activos</p>
              <button className="text-green-600 text-sm mt-2 hover:underline">
                Crear tu primer objetivo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Análisis Inteligente
          </h2>

          {/* Insight Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['weekly', 'monthly', 'constitutional', 'seasonal'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedInsightCategory(category)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedInsightCategory === category
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category === 'weekly' ? 'Semanal' :
                 category === 'monthly' ? 'Mensual' :
                 category === 'constitutional' ? 'Constitucional' : 'Estacional'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {dashboard.insights[selectedInsightCategory].map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-purple-700">{insight}</p>
              </div>
            ))}
          </div>

          {dashboard.insights[selectedInsightCategory].length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No hay análisis disponibles para este período</p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Recomendaciones
          </h2>

          <div className="space-y-4">
            {/* Immediate */}
            {dashboard.recommendations.immediate.length > 0 && (
              <div>
                <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Inmediatas
                </h3>
                <div className="space-y-2">
                  {dashboard.recommendations.immediate.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded text-sm text-red-700">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Short-term */}
            {dashboard.recommendations.shortTerm.length > 0 && (
              <div>
                <h3 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Corto Plazo
                </h3>
                <div className="space-y-2">
                  {dashboard.recommendations.shortTerm.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded text-sm text-orange-700">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Long-term */}
            {dashboard.recommendations.longTerm.length > 0 && (
              <div>
                <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Largo Plazo
                </h3>
                <div className="space-y-2">
                  {dashboard.recommendations.longTerm.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}