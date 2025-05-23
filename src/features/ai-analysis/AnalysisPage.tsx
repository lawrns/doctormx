import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Heart, Brain, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, BarChart3, PieChart, Calendar,
  ThermometerSun, Droplets, Eye, Stethoscope, Download, Plus
} from 'lucide-react';

interface SymptomData {
  id: string;
  name: string;
  severity: number;
  duration: string;
  frequency: string;
  lastReported: Date;
}

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
}

const AnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'trends' | 'recommendations'>('symptoms');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [showExportModal, setShowExportModal] = useState(false);

  // Mock data - in real app, this would come from user's medical history
  const [symptoms] = useState<SymptomData[]>([
    {
      id: '1',
      name: 'Dolor de cabeza',
      severity: 6,
      duration: '3 días',
      frequency: 'Diario',
      lastReported: new Date(Date.now() - 1000 * 60 * 60 * 24)
    },
    {
      id: '2',
      name: 'Fatiga',
      severity: 4,
      duration: '1 semana',
      frequency: 'Ocasional',
      lastReported: new Date(Date.now() - 1000 * 60 * 60 * 12)
    },
    {
      id: '3',
      name: 'Dolor muscular',
      severity: 3,
      duration: '2 días',
      frequency: 'Después de ejercicio',
      lastReported: new Date(Date.now() - 1000 * 60 * 60 * 6)
    }
  ]);

  const [healthMetrics] = useState<HealthMetric[]>([
    {
      id: '1',
      name: 'Presión arterial',
      value: 120,
      unit: 'mmHg',
      status: 'normal',
      trend: 'stable',
      icon: Heart
    },
    {
      id: '2',
      name: 'Temperatura',
      value: 36.8,
      unit: '°C',
      status: 'normal',
      trend: 'stable',
      icon: ThermometerSun
    },
    {
      id: '3',
      name: 'Frecuencia cardíaca',
      value: 72,
      unit: 'bpm',
      status: 'normal',
      trend: 'down',
      icon: Activity
    },
    {
      id: '4',
      name: 'Nivel de estrés',
      value: 6,
      unit: '/10',
      status: 'warning',
      trend: 'up',
      icon: Brain
    }
  ]);

  // Mock recommendations data
  const recommendations = [
    {
      id: 1,
      type: 'urgent',
      title: 'Consulta médica recomendada',
      description: 'Basado en tus síntomas recientes de dolor de cabeza persistente',
      action: 'Agendar cita',
      priority: 'alta'
    },
    {
      id: 2,
      type: 'lifestyle',
      title: 'Mejora en hábitos de sueño',
      description: 'Detectamos patrones irregulares en tu descanso',
      action: 'Ver consejos',
      priority: 'media'
    },
    {
      id: 3,
      type: 'medication',
      title: 'Revisar medicación actual',
      description: 'Algunos medicamentos podrían estar afectando tu presión arterial',
      action: 'Consultar',
      priority: 'alta'
    }
  ];

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'text-red-600 bg-red-50';
    if (severity >= 6) return 'text-orange-600 bg-orange-50';
    if (severity >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-green-500 transform rotate-180" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'symptoms':
        return (
          <div className="space-y-6">
            {/* Symptoms Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Síntomas activos</p>
                    <p className="text-2xl font-bold text-gray-900">{symptoms.length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Promedio severidad</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(symptoms.reduce((acc, s) => acc + s.severity, 0) / symptoms.length).toFixed(1)}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Último registro</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor((Date.now() - Math.min(...symptoms.map(s => s.lastReported.getTime()))) / (1000 * 60 * 60))}h
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Días con síntomas</p>
                    <p className="text-2xl font-bold text-gray-900">7</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Symptoms List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Registro de Síntomas</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {symptoms.map((symptom) => (
                  <motion.div
                    key={symptom.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{symptom.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">Duración: {symptom.duration}</span>
                          <span className="text-sm text-gray-600">Frecuencia: {symptom.frequency}</span>
                          <span className="text-sm text-gray-600">
                            Último: {symptom.lastReported.toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(symptom.severity)}`}>
                          Severidad: {symptom.severity}/10
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'trends':
        return (
          <div className="space-y-6">
            {/* Health Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {healthMetrics.map((metric) => {
                const IconComponent = metric.icon;
                return (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{metric.name}</h3>
                          <p className="text-sm text-gray-600">Última medición</p>
                        </div>
                      </div>
                      {getTrendIcon(metric.trend)}
                    </div>
                    
                    <div className="flex items-end space-x-2">
                      <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                      <span className="text-lg text-gray-600 mb-1">{metric.unit}</span>
                    </div>
                    
                    <div className={`mt-2 px-2 py-1 rounded text-xs font-medium inline-block ${getStatusColor(metric.status)}`}>
                      {metric.status === 'normal' ? 'Normal' : metric.status === 'warning' ? 'Atención' : 'Crítico'}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias de Salud</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <PieChart className="w-12 h-12 mx-auto mb-2" />
                  <p>Gráficos de tendencias disponibles próximamente</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'recommendations':
        return (
          <div className="space-y-6">
            {/* AI Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recomendaciones Personalizadas</h3>
                <p className="text-sm text-gray-600">Basadas en tu historial médico y síntomas actuales</p>
              </div>
              
              <div className="p-6 space-y-4">
                {[
                  {
                    title: 'Hidratación',
                    description: 'Aumenta tu consumo de agua a 2-3 litros diarios para ayudar con los dolores de cabeza.',
                    priority: 'high',
                    icon: Droplets
                  },
                  {
                    title: 'Descanso',
                    description: 'Considera un horario de sueño más regular. 7-8 horas pueden reducir la fatiga.',
                    priority: 'medium',
                    icon: Clock
                  },
                  {
                    title: 'Ejercicio suave',
                    description: 'Yoga o estiramientos pueden ayudar con el dolor muscular y el estrés.',
                    priority: 'medium',
                    icon: Activity
                  },
                  {
                    title: 'Consulta médica',
                    description: 'Si los dolores de cabeza persisten más de una semana, consulta a un especialista.',
                    priority: 'high',
                    icon: Stethoscope
                  }
                ].map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      recommendation.priority === 'high' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        recommendation.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <recommendation.icon className={`w-5 h-5 ${
                          recommendation.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            recommendation.priority === 'high' 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            Prioridad {recommendation.priority === 'high' ? 'Alta' : 'Media'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Page Header - more compact */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Análisis Médico</h1>
            <p className="text-gray-600 mt-1">Seguimiento de síntomas y análisis de salud personalizado</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Síntoma
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation - more compact */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'symptoms', label: 'Síntomas', icon: AlertTriangle, count: symptoms.filter(s => s.severity >= 3).length },
            { id: 'trends', label: 'Tendencias', icon: BarChart3 },
            { id: 'recommendations', label: 'Recomendaciones', icon: CheckCircle, count: recommendations.length }
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-brand-jade-500 text-brand-jade-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
              {count !== undefined && count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === id
                    ? 'bg-brand-jade-100 text-brand-jade-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content - improved density */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Exportar Análisis</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
                <div className="font-medium">PDF Completo</div>
                <div className="text-sm text-gray-600">Incluye todos los datos y gráficos</div>
              </button>
              <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
                <div className="font-medium">Resumen Médico</div>
                <div className="text-sm text-gray-600">Solo información relevante para médicos</div>
              </button>
              <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
                <div className="font-medium">Datos CSV</div>
                <div className="text-sm text-gray-600">Para análisis en hoja de cálculo</div>
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowExportModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button className="flex-1 bg-brand-jade-600 text-white py-2 rounded-lg hover:bg-brand-jade-700 transition-colors">
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage; 