/**
 * ProtocolBrowser - Browse and create treatment protocol timelines
 * Displays available templates and user's active protocols
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Clock, User, Target, Calendar, Play, Pause, 
  CheckCircle, FileText, Leaf, Heart, Brain, Filter,
  Search, MoreHorizontal, Star, TrendingUp
} from 'lucide-react';
import { protocolTimelineService } from '@svc/ProtocolTimelineService';
import { loggingService } from '@svc/LoggingService';

interface ProtocolTemplate {
  id: string;
  name: string;
  description: string;
  condition: string;
  duration: number;
  phases: number;
}

interface ProtocolTimeline {
  id: string;
  name: string;
  description: string;
  condition: string;
  constitution?: 'vata' | 'pitta' | 'kapha';
  totalDuration: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'abandoned';
}

interface Props {
  userId?: string;
  onTimelineSelect?: (timelineId: string) => void;
  onCreateNew?: (templateId: string) => void;
}

export default function ProtocolBrowser({ 
  userId = 'demo_user_123', 
  onTimelineSelect,
  onCreateNew 
}: Props) {
  const [templates, setTemplates] = useState<ProtocolTemplate[]>([]);
  const [userTimelines, setUserTimelines] = useState<ProtocolTimeline[]>([]);
  const [activeTab, setActiveTab] = useState<'my_protocols' | 'templates'>('my_protocols');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    try {
      setLoading(true);
      
      // Load templates
      const availableTemplates = protocolTimelineService.getProtocolTemplates();
      setTemplates(availableTemplates);
      
      // Load user timelines
      const timelines = protocolTimelineService.getUserTimelines(userId);
      setUserTimelines(timelines);
      
      loggingService.info('ProtocolBrowser', 'Data loaded', {
        templatesCount: availableTemplates.length,
        timelinesCount: timelines.length
      });
    } catch (err) {
      loggingService.error('ProtocolBrowser', 'Failed to load data', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProtocol = (templateId: string) => {
    onCreateNew?.(templateId);
    loggingService.info('ProtocolBrowser', 'Create protocol requested', { templateId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'paused':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'draft':
        return <FileText className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const getConditionIcon = (condition: string) => {
    if (condition.toLowerCase().includes('digestivo')) return <Heart className="w-5 h-5" />;
    if (condition.toLowerCase().includes('ansiedad')) return <Brain className="w-5 h-5" />;
    return <Leaf className="w-5 h-5" />;
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCondition = selectedCondition === 'all' || 
                            template.condition.toLowerCase().includes(selectedCondition.toLowerCase());
    return matchesSearch && matchesCondition;
  });

  const filteredTimelines = userTimelines.filter(timeline => {
    const matchesSearch = timeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timeline.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timeline.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCondition = selectedCondition === 'all' || 
                            timeline.condition.toLowerCase().includes(selectedCondition.toLowerCase());
    return matchesSearch && matchesCondition;
  });

  const uniqueConditions = Array.from(new Set([
    ...templates.map(t => t.condition),
    ...userTimelines.map(t => t.condition)
  ]));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando protocolos...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Protocolos de Tratamiento</h1>
          <p className="text-gray-600">Crea y gestiona tus protocolos personalizados de salud</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar protocolos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Condition Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las condiciones</option>
              {uniqueConditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('my_protocols')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my_protocols'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Mis Protocolos ({userTimelines.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Plantillas Disponibles ({templates.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'my_protocols' ? (
        <div className="space-y-4">
          {filteredTimelines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTimelines.map((timeline) => (
                <div 
                  key={timeline.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onTimelineSelect?.(timeline.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getConditionIcon(timeline.condition)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{timeline.name}</h3>
                        <p className="text-sm text-gray-600">{timeline.condition}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(timeline.status)}`}>
                      {getStatusIcon(timeline.status)}
                      {timeline.status === 'active' ? 'Activo' :
                       timeline.status === 'paused' ? 'Pausado' :
                       timeline.status === 'completed' ? 'Completado' :
                       timeline.status === 'draft' ? 'Borrador' : 'Inactivo'}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{timeline.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{timeline.totalDuration} días</span>
                    </div>
                    {timeline.constitution && (
                      <div className="flex items-center gap-2 text-purple-600">
                        <Brain className="w-4 h-4" />
                        <span>{timeline.constitution.toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  {timeline.status === 'active' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>Protocolo en progreso</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes protocolos activos</h3>
              <p className="text-gray-600 mb-6">Crea tu primer protocolo usando una de nuestras plantillas</p>
              <button
                onClick={() => setActiveTab('templates')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explorar Plantillas
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTemplates.map((template) => (
                <div 
                  key={template.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      {getConditionIcon(template.condition)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-blue-600 mb-2">{template.condition}</p>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{template.duration} días</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Target className="w-4 h-4" />
                      <span>{template.phases} fases</span>
                    </div>
                  </div>

                  {/* Template Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Incluye:</h4>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                        <Leaf className="w-3 h-3" />
                        Hierbas mexicanas
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        <Heart className="w-3 h-3" />
                        Cambios lifestyle
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                        <Target className="w-3 h-3" />
                        Hitos y objetivos
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCreateProtocol(template.id)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Crear Protocolo
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron plantillas</h3>
              <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">📊 Estadísticas de Protocolos</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{userTimelines.filter(t => t.status === 'active').length}</div>
            <div className="text-gray-600">Protocolos Activos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{userTimelines.filter(t => t.status === 'completed').length}</div>
            <div className="text-gray-600">Completados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{templates.length}</div>
            <div className="text-gray-600">Plantillas Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{uniqueConditions.length}</div>
            <div className="text-gray-600">Condiciones Cubiertas</div>
          </div>
        </div>
      </div>
    </div>
  );
}