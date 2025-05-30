/**
 * ProgressTrackingPage - Main page for health progress tracking
 * Combines dashboard, entry form, and trend visualization
 */

import React, { useState } from 'react';
import { TrendingUp, Plus, BarChart3, Target, ArrowLeft } from 'lucide-react';
import ProgressDashboard from '../../components/progress/ProgressDashboard';
import ProgressEntryForm from '../../components/progress/ProgressEntryForm';
import SymptomTrendChart from '../../components/progress/SymptomTrendChart';
import { loggingService } from '@svc/LoggingService';

type ViewMode = 'dashboard' | 'add-entry' | 'trend-detail';

interface Props {
  userId?: string;
}

export default function ProgressTrackingPage({ userId = 'demo_user_123' }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [selectedMetricName, setSelectedMetricName] = useState<string>('');
  const [refreshDashboard, setRefreshDashboard] = useState(0);

  const handleMetricClick = (metricId: string) => {
    setSelectedMetricId(metricId);
    setSelectedMetricName(metricId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    setViewMode('trend-detail');
    loggingService.info('ProgressTrackingPage', 'Metric selected for trend view', { metricId });
  };

  const handleGoalClick = (goalId: string) => {
    // Future: Navigate to goal detail view
    loggingService.info('ProgressTrackingPage', 'Goal clicked', { goalId });
  };

  const handleEntryAdded = (entryId: string) => {
    setRefreshDashboard(prev => prev + 1);
    setViewMode('dashboard');
    loggingService.info('ProgressTrackingPage', 'Entry added, returning to dashboard', { entryId });
  };

  const renderHeader = () => {
    switch (viewMode) {
      case 'add-entry':
        return (
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setViewMode('dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Registrar Progreso</h1>
              <p className="text-gray-600">Agrega un nuevo registro de salud</p>
            </div>
          </div>
        );
      case 'trend-detail':
        return (
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setViewMode('dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tendencia: {selectedMetricName}</h1>
              <p className="text-gray-600">Análisis detallado de tu progreso</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seguimiento de Progreso</h1>
              <p className="text-gray-600">Monitorea tu salud y bienestar a lo largo del tiempo</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('add-entry')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nuevo Registro
              </button>
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'add-entry':
        return (
          <div className="max-w-2xl mx-auto">
            <ProgressEntryForm
              userId={userId}
              onEntryAdded={handleEntryAdded}
              onClose={() => setViewMode('dashboard')}
            />
          </div>
        );
      
      case 'trend-detail':
        return selectedMetricId ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <SymptomTrendChart
              userId={userId}
              metricId={selectedMetricId}
              metricName={selectedMetricName}
              timeframeDays={30}
              showRecommendations={true}
            />
            
            {/* Additional trend periods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SymptomTrendChart
                userId={userId}
                metricId={selectedMetricId}
                metricName={`${selectedMetricName} (Última Semana)`}
                timeframeDays={7}
                height={150}
                showRecommendations={false}
              />
              <SymptomTrendChart
                userId={userId}
                metricId={selectedMetricId}
                metricName={`${selectedMetricName} (Último Trimestre)`}
                timeframeDays={90}
                height={150}
                showRecommendations={false}
              />
            </div>

            {/* Quick Add Entry for This Metric */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-4">Agregar Nuevo Registro</h3>
              <ProgressEntryForm
                userId={userId}
                initialMetricId={selectedMetricId}
                onEntryAdded={() => {
                  // Refresh the trend chart
                  window.location.reload();
                }}
                className="border-0 p-0 bg-transparent"
              />
            </div>
          </div>
        ) : null;
      
      default:
        return (
          <ProgressDashboard
            key={refreshDashboard}
            userId={userId}
            timeframe="month"
            onMetricClick={handleMetricClick}
            onGoalClick={handleGoalClick}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderHeader()}
        {renderContent()}
      </div>

      {/* Quick Actions Floating Button (only on dashboard) */}
      {viewMode === 'dashboard' && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <button
            onClick={() => setViewMode('add-entry')}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            title="Agregar registro"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Features Preview Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 text-center">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold">Seguimiento de Progreso Avanzado</p>
              <p className="text-sm opacity-90">
                Monitorea síntomas, establece objetivos y recibe recomendaciones personalizadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>Tendencias Inteligentes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              <span>Objetivos Personalizados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}