/**
 * ProtocolTimelineVisualization - Interactive timeline for treatment protocols
 * Displays phases, actions, and milestones in a visual timeline format
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Target, Leaf, Activity, Utensils, Trophy, 
  CheckCircle, Circle, Play, Pause, MoreHorizontal, Info,
  ChevronLeft, ChevronRight, AlertCircle, Heart
} from 'lucide-react';
import { protocolTimelineService } from '@svc/ProtocolTimelineService';
import { loggingService } from '@svc/LoggingService';

interface ProtocolTimeline {
  id: string;
  name: string;
  description: string;
  condition: string;
  constitution?: 'vata' | 'pitta' | 'kapha';
  totalDuration: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'abandoned';
}

interface TimelineOverview {
  timeline: ProtocolTimeline;
  currentDay?: number;
  currentPhase?: any;
  completedMilestones: number;
  totalMilestones: number;
  daysRemaining?: number;
  progressPercentage: number;
}

interface Props {
  userId?: string;
  timelineId: string;
  onMilestoneClick?: (milestoneId: string) => void;
  onActionClick?: (actionId: string) => void;
}

export default function ProtocolTimelineVisualization({ 
  userId = 'demo_user_123', 
  timelineId,
  onMilestoneClick,
  onActionClick 
}: Props) {
  const [overview, setOverview] = useState<TimelineOverview | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [dayDetails, setDayDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'daily'>('overview');

  useEffect(() => {
    loadTimelineOverview();
  }, [userId, timelineId]);

  useEffect(() => {
    if (viewMode === 'daily') {
      loadDayDetails(selectedDay);
    }
  }, [selectedDay, viewMode]);

  const loadTimelineOverview = async () => {
    try {
      setLoading(true);
      const timelineOverview = protocolTimelineService.getTimelineOverview(userId, timelineId);
      if (!timelineOverview) {
        throw new Error('Timeline not found');
      }
      setOverview(timelineOverview);
      
      // Set selected day to current day if active
      if (timelineOverview.currentDay) {
        setSelectedDay(timelineOverview.currentDay);
      }

      loggingService.info('ProtocolTimelineVisualization', 'Timeline overview loaded', {
        timelineId,
        status: timelineOverview.timeline.status,
        currentDay: timelineOverview.currentDay
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar timeline';
      setError(errorMsg);
      loggingService.error('ProtocolTimelineVisualization', 'Failed to load timeline', err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const loadDayDetails = (day: number) => {
    try {
      const dayData = protocolTimelineService.getTimelineDay(userId, timelineId, day);
      setDayDetails(dayData);
    } catch (err) {
      loggingService.warn('ProtocolTimelineVisualization', 'Failed to load day details', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const handleMilestoneAchieve = async (milestoneId: string) => {
    try {
      const success = await protocolTimelineService.achieveMilestone(userId, timelineId, milestoneId);
      if (success) {
        loadTimelineOverview();
        if (viewMode === 'daily') {
          loadDayDetails(selectedDay);
        }
      }
    } catch (err) {
      loggingService.error('ProtocolTimelineVisualization', 'Failed to achieve milestone', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const getActionIcon = (type: string) => {
    const icons = {
      herb: Leaf,
      lifestyle: Activity,
      diet: Utensils,
      exercise: Activity,
      monitoring: Heart,
      milestone: Trophy
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getActionColor = (type: string) => {
    const colors = {
      herb: 'text-green-600 bg-green-50 border-green-200',
      lifestyle: 'text-blue-600 bg-blue-50 border-blue-200',
      diet: 'text-orange-600 bg-orange-50 border-orange-200',
      exercise: 'text-purple-600 bg-purple-50 border-purple-200',
      monitoring: 'text-red-600 bg-red-50 border-red-200',
      milestone: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const renderTimelineOverview = () => {
    if (!overview) return null;

    const { timeline, progressPercentage, completedMilestones, totalMilestones, currentDay, daysRemaining } = overview;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{timeline.name}</h2>
              <p className="text-blue-100 mb-4">{timeline.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{timeline.totalDuration} días total</span>
                </div>
                {currentDay && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Día {currentDay}</span>
                  </div>
                )}
                {daysRemaining !== undefined && (
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>{daysRemaining} días restantes</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-blue-100">Progreso</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full ${
                timeline.status === 'active' ? 'bg-green-100 text-green-600' :
                timeline.status === 'paused' ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {timeline.status === 'active' ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Estado</h3>
                <p className="text-sm text-gray-600">
                  {timeline.status === 'active' ? 'Activo' :
                   timeline.status === 'paused' ? 'Pausado' :
                   timeline.status === 'completed' ? 'Completado' : 'Borrador'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Logros</h3>
                <p className="text-sm text-gray-600">
                  {completedMilestones} de {totalMilestones} hitos
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Condición</h3>
                <p className="text-sm text-gray-600">{timeline.condition}</p>
              </div>
            </div>
            {timeline.constitution && (
              <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                Constitución: {timeline.constitution.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Phase Timeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fases del Protocolo</h3>
          <div className="space-y-4">
            {timeline.phases?.map((phase: any, index: number) => {
              const isActive = currentDay && currentDay >= phase.startDay && currentDay <= phase.endDay;
              const isCompleted = currentDay && currentDay > phase.endDay;
              
              return (
                <div 
                  key={phase.id}
                  className={`p-4 rounded-lg border-2 ${
                    isActive ? 'border-blue-500 bg-blue-50' :
                    isCompleted ? 'border-green-500 bg-green-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{phase.name}</h4>
                    <div className="flex items-center gap-2">
                      {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {isActive && <Circle className="w-5 h-5 text-blue-600 animate-pulse" />}
                      <span className="text-sm text-gray-500">
                        Días {phase.startDay}-{phase.endDay}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                  
                  {/* Phase Objectives */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Objetivos:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {phase.objectives?.map((objective: string, i: number) => (
                          <li key={i} className="flex items-start gap-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Resultados Esperados:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {phase.expectedOutcomes?.map((outcome: string, i: number) => (
                          <li key={i} className="flex items-start gap-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setViewMode('daily')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Vista Diaria
          </button>
          {timeline.status === 'draft' && (
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Iniciar Protocolo
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderDailyView = () => {
    if (!overview || !dayDetails) return null;

    const { timeline } = overview;
    const { day, date, phase, actions, milestones, isToday, isPast, isFuture } = dayDetails;

    return (
      <div className="space-y-6">
        {/* Daily Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewMode('overview')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al Resumen
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                disabled={selectedDay <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-500">
                Día {selectedDay} de {timeline.totalDuration}
              </span>
              <button
                onClick={() => setSelectedDay(Math.min(timeline.totalDuration, selectedDay + 1))}
                disabled={selectedDay >= timeline.totalDuration}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Día {day} - {date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isToday ? 'bg-blue-100 text-blue-800' :
              isPast ? 'bg-gray-100 text-gray-600' :
              'bg-green-100 text-green-800'
            }`}>
              {isToday ? '📅 Hoy' : isPast ? '✅ Completado' : '🔮 Futuro'}
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">Fase: </span>
              <span className="font-medium text-gray-900">{phase.name}</span>
            </div>
          </div>
        </div>

        {/* Daily Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividades del Día</h3>
          
          {actions.length > 0 ? (
            <div className="space-y-4">
              {actions.map((action: any) => {
                const IconComponent = getActionIcon(action.type);
                return (
                  <div 
                    key={action.id}
                    className={`p-4 rounded-lg border-l-4 ${getPriorityColor(action.priority)} bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer`}
                    onClick={() => onActionClick?.(action.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getActionColor(action.type)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{action.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">
                              {action.frequency === 'daily' ? 'Diario' :
                               action.frequency === 'twice_daily' ? '2x al día' :
                               action.frequency === 'three_times_daily' ? '3x al día' :
                               action.frequency}
                            </div>
                            {action.priority === 'high' && (
                              <div className="text-xs text-red-600 font-medium">Prioridad Alta</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Instrucciones: </span>
                            <span className="text-gray-600">{action.instructions}</span>
                          </div>
                          {action.dosage && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Dosis: </span>
                              <span className="text-gray-600">{action.dosage}</span>
                            </div>
                          )}
                          {action.mexicanContext && (
                            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                              🇲🇽 {action.mexicanContext}
                            </div>
                          )}
                          {action.safetyNotes && action.safetyNotes.length > 0 && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                              ⚠️ {action.safetyNotes.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay actividades programadas para este día</p>
            </div>
          )}
        </div>

        {/* Daily Milestones */}
        {milestones.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hitos del Día</h3>
            <div className="space-y-4">
              {milestones.map((milestone: any) => (
                <div 
                  key={milestone.id}
                  className={`p-4 rounded-lg border-2 ${
                    milestone.achieved ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${milestone.achieved ? 'text-green-600' : 'text-yellow-600'}`}>
                        {milestone.achieved ? <CheckCircle className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        {milestone.criteria && milestone.criteria.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-700">Criterios:</span>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                              {milestone.criteria.map((criterion: string, i: number) => (
                                <li key={i} className="flex items-start gap-1">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                  {criterion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    {!milestone.achieved && (isToday || isPast) && (
                      <button
                        onClick={() => handleMilestoneAchieve(milestone.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Marcar Completado
                      </button>
                    )}
                  </div>
                  {milestone.achieved && milestone.achievedDate && (
                    <div className="mt-3 text-xs text-green-600">
                      ✅ Completado el {new Date(milestone.achievedDate).toLocaleDateString('es-MX')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando protocolo...</span>
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
              onClick={loadTimelineOverview}
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
    <div className="max-w-6xl mx-auto">
      {viewMode === 'overview' ? renderTimelineOverview() : renderDailyView()}
    </div>
  );
}