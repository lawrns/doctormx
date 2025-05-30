/**
 * ProgressEntryForm - Form for adding new health metric entries
 * Allows users to log symptoms, vital signs, and lifestyle metrics
 */

import React, { useState, useEffect } from 'react';
import { Plus, Save, X, AlertCircle, CheckCircle, Activity, Heart, Brain, Calendar } from 'lucide-react';
import { progressTrackingService } from '@svc/ProgressTrackingService';
import { loggingService } from '@svc/LoggingService';

interface HealthMetric {
  id: string;
  name: string;
  category: 'symptom' | 'vital' | 'lifestyle' | 'medication' | 'mood' | 'constitutional';
  unit: string;
  scale: {
    min: number;
    max: number;
    type: 'severity' | 'frequency' | 'numeric' | 'percentage';
  };
  description: string;
  mexicanContext?: string;
}

interface Props {
  userId?: string;
  onEntryAdded?: (entryId: string) => void;
  onClose?: () => void;
  initialMetricId?: string;
  className?: string;
}

export default function ProgressEntryForm({ 
  userId = 'demo_user_123', 
  onEntryAdded, 
  onClose,
  initialMetricId,
  className = ''
}: Props) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null);
  const [value, setValue] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<number>(5);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadMetrics();
  }, []);

  useEffect(() => {
    if (initialMetricId && metrics.length > 0) {
      const metric = metrics.find(m => m.id === initialMetricId);
      if (metric) {
        setSelectedMetric(metric);
        setValue(Math.floor((metric.scale.min + metric.scale.max) / 2));
      }
    }
  }, [initialMetricId, metrics]);

  const loadMetrics = () => {
    try {
      const availableMetrics = progressTrackingService.getAvailableMetrics();
      setMetrics(availableMetrics);
      loggingService.info('ProgressEntryForm', 'Metrics loaded', { count: availableMetrics.length });
    } catch (err) {
      setError('Error al cargar métricas disponibles');
      loggingService.error('ProgressEntryForm', 'Failed to load metrics', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMetric) {
      setError('Selecciona una métrica para registrar');
      return;
    }

    if (value < selectedMetric.scale.min || value > selectedMetric.scale.max) {
      setError(`El valor debe estar entre ${selectedMetric.scale.min} y ${selectedMetric.scale.max}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const entryId = await progressTrackingService.addProgressEntry({
        userId,
        metricId: selectedMetric.id,
        value,
        notes: notes.trim() || undefined,
        contextData: {
          mood,
          stressLevel
        }
      });

      setSuccess(true);
      loggingService.info('ProgressEntryForm', 'Progress entry added', {
        metricId: selectedMetric.id,
        value,
        entryId
      });

      // Reset form
      setTimeout(() => {
        setSuccess(false);
        if (!initialMetricId) {
          setSelectedMetric(null);
        }
        setValue(selectedMetric ? Math.floor((selectedMetric.scale.min + selectedMetric.scale.max) / 2) : 1);
        setNotes('');
        setMood(5);
        setStressLevel(3);
        onEntryAdded?.(entryId);
      }, 1500);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar el registro';
      setError(errorMsg);
      loggingService.error('ProgressEntryForm', 'Failed to add progress entry', err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      symptom: Heart,
      vital: Activity,
      lifestyle: Calendar,
      constitutional: Brain,
      medication: Activity,
      mood: Brain
    };
    return icons[category as keyof typeof icons] || Activity;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      symptom: 'text-red-600 bg-red-50 border-red-200',
      vital: 'text-blue-600 bg-blue-50 border-blue-200',
      lifestyle: 'text-green-600 bg-green-50 border-green-200',
      constitutional: 'text-purple-600 bg-purple-50 border-purple-200',
      medication: 'text-orange-600 bg-orange-50 border-orange-200',
      mood: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    };
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScaleLabels = (metric: HealthMetric) => {
    if (metric.scale.type === 'severity') {
      return {
        [metric.scale.min]: 'Muy leve',
        [Math.floor((metric.scale.min + metric.scale.max) / 2)]: 'Moderado',
        [metric.scale.max]: 'Muy severo'
      };
    } else if (metric.scale.type === 'frequency') {
      return {
        [metric.scale.min]: 'Nunca',
        [Math.floor((metric.scale.min + metric.scale.max) / 2)]: 'A veces',
        [metric.scale.max]: 'Muy frecuente'
      };
    }
    return {};
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  if (success) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">¡Registro Guardado!</h3>
          <p className="text-green-700">Tu progreso ha sido registrado exitosamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Plus className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Registrar Progreso</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Metric Selection */}
        {!initialMetricId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Qué quieres registrar?
            </label>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              {['symptom', 'vital', 'lifestyle', 'constitutional'].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'symptom' ? 'Síntomas' :
                   category === 'vital' ? 'Signos Vitales' :
                   category === 'lifestyle' ? 'Estilo de Vida' : 'Constitucional'}
                </button>
              ))}
            </div>

            {/* Metric List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {filteredMetrics.map((metric) => {
                const IconComponent = getCategoryIcon(metric.category);
                return (
                  <button
                    key={metric.id}
                    type="button"
                    onClick={() => {
                      setSelectedMetric(metric);
                      setValue(Math.floor((metric.scale.min + metric.scale.max) / 2));
                    }}
                    className={`p-3 text-left border-2 rounded-lg transition-all hover:shadow-md ${
                      selectedMetric?.id === metric.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded ${getCategoryColor(metric.category)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{metric.name}</h4>
                        <p className="text-sm text-gray-600">{metric.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Escala: {metric.scale.min} - {metric.scale.max} {metric.unit}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Value Input */}
        {selectedMetric && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {selectedMetric.name} ({selectedMetric.unit})
            </label>
            
            <div className="space-y-4">
              {/* Range Slider */}
              <div>
                <input
                  type="range"
                  min={selectedMetric.scale.min}
                  max={selectedMetric.scale.max}
                  step={selectedMetric.scale.type === 'numeric' ? 0.1 : 1}
                  value={value}
                  onChange={(e) => setValue(parseFloat(e.target.value))}
                  className="w-full"
                />
                
                {/* Scale Labels */}
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{selectedMetric.scale.min}</span>
                  <span className="font-medium text-blue-600 text-base">{value}</span>
                  <span>{selectedMetric.scale.max}</span>
                </div>

                {/* Scale Descriptions */}
                {selectedMetric.scale.type === 'severity' && (
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Leve</span>
                    <span>Moderado</span>
                    <span>Severo</span>
                  </div>
                )}
              </div>

              {/* Numeric Input as Alternative */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Valor exacto:</span>
                <input
                  type="number"
                  min={selectedMetric.scale.min}
                  max={selectedMetric.scale.max}
                  step={selectedMetric.scale.type === 'numeric' ? 0.1 : 1}
                  value={value}
                  onChange={(e) => setValue(parseFloat(e.target.value) || selectedMetric.scale.min)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                />
                <span className="text-sm text-gray-500">{selectedMetric.unit}</span>
              </div>

              {/* Mexican Context */}
              {selectedMetric.mexicanContext && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Contexto mexicano:</strong> {selectedMetric.mexicanContext}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Context Information */}
        {selectedMetric && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de ánimo (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Muy triste</span>
                <span className="font-medium">{mood}</span>
                <span>Muy feliz</span>
              </div>
            </div>

            {/* Stress Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de estrés (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Muy relajado</span>
                <span className="font-medium">{stressLevel}</span>
                <span>Muy estresado</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {selectedMetric && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Me duele más después de caminar, noté mejoría con el té de manzanilla..."
            />
          </div>
        )}

        {/* Submit Button */}
        {selectedMetric && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Registro
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}