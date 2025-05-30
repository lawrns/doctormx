/**
 * ProtocolTimelinePage - Main page for protocol timeline management
 * Combines browsing, creation, and visualization of treatment protocols
 */

import React, { useState } from 'react';
import { ArrowLeft, Calendar, Target, Leaf, Heart } from 'lucide-react';
import ProtocolBrowser from '../../components/protocol/ProtocolBrowser';
import ProtocolTimelineVisualization from '../../components/protocol/ProtocolTimelineVisualization';
import { protocolTimelineService } from '@svc/ProtocolTimelineService';
import { loggingService } from '@svc/LoggingService';

type ViewMode = 'browser' | 'timeline' | 'create';

interface Props {
  userId?: string;
}

export default function ProtocolTimelinePage({ userId = 'demo_user_123' }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('browser');
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');

  const handleTimelineSelect = (timelineId: string) => {
    setSelectedTimelineId(timelineId);
    setViewMode('timeline');
    loggingService.info('ProtocolTimelinePage', 'Timeline selected', { timelineId });
  };

  const handleCreateNew = async (templateId: string) => {
    try {
      // In a real implementation, this would show a customization form
      // For now, we'll create with default settings
      const timelineId = await protocolTimelineService.createProtocolTimeline(
        userId,
        templateId,
        {
          constitution: 'pitta', // This could be from user's constitutional analysis
          preferences: []
        }
      );
      
      setSelectedTimelineId(timelineId);
      setViewMode('timeline');
      
      loggingService.info('ProtocolTimelinePage', 'New protocol created', { templateId, timelineId });
    } catch (error) {
      loggingService.error('ProtocolTimelinePage', 'Failed to create protocol', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const handleGoBack = () => {
    setViewMode('browser');
    setSelectedTimelineId(null);
  };

  const renderHeader = () => {
    switch (viewMode) {
      case 'timeline':
        return (
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Protocolos
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Protocolo de Tratamiento</h1>
              <p className="text-gray-600">Sigue tu plan personalizado de salud día a día</p>
            </div>
          </div>
        );
      default:
        return null; // ProtocolBrowser handles its own header
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'timeline':
        return selectedTimelineId ? (
          <ProtocolTimelineVisualization
            userId={userId}
            timelineId={selectedTimelineId}
            onMilestoneClick={(milestoneId) => {
              loggingService.info('ProtocolTimelinePage', 'Milestone clicked', { milestoneId });
            }}
            onActionClick={(actionId) => {
              loggingService.info('ProtocolTimelinePage', 'Action clicked', { actionId });
            }}
          />
        ) : null;
      
      default:
        return (
          <ProtocolBrowser
            userId={userId}
            onTimelineSelect={handleTimelineSelect}
            onCreateNew={handleCreateNew}
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

      {/* Feature Information Footer (only on browser view) */}
      {viewMode === 'browser' && (
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Protocolos de Tratamiento Personalizados</h2>
              <p className="text-white/90 max-w-3xl mx-auto">
                Planes estructurados que combinan medicina tradicional mexicana con enfoques modernos, 
                adaptados a tu constitución y estilo de vida
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Planificación Estructurada</h3>
                <p className="text-sm text-white/80">
                  Protocolos organizados por fases con objetivos claros y cronogramas específicos
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Hierbas Mexicanas</h3>
                <p className="text-sm text-white/80">
                  Integración de plantas medicinales tradicionales con dosificaciones seguras y efectivas
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Seguimiento de Hitos</h3>
                <p className="text-sm text-white/80">
                  Objetivos medibles con criterios claros para evaluar tu progreso de forma objetiva
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Enfoque Holístico</h3>
                <p className="text-sm text-white/80">
                  Combina hierbas, alimentación, ejercicio y hábitos según tu constitución ayurvédica
                </p>
              </div>
            </div>

            {/* Protocol Examples */}
            <div className="mt-8 bg-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Protocolos Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-medium mb-2">🌱 Salud Digestiva</h4>
                  <p className="text-white/80">6 semanas de protocolo integral con hierbas mexicanas para mejorar digestión y reducir inflamación</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-medium mb-2">🧘 Manejo de Ansiedad</h4>
                  <p className="text-white/80">4 semanas de terapia natural con plantas calmantes y técnicas de relajación culturalmente adaptadas</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-medium mb-2">💪 Fortalecimiento Inmune</h4>
                  <p className="text-white/80">Protocolo estacional de 8 semanas para fortalecer el sistema inmunológico con adaptógenos mexicanos</p>
                </div>
              </div>
            </div>

            {/* Cultural Context */}
            <div className="mt-6 text-center">
              <p className="text-white/80 text-sm max-w-2xl mx-auto">
                🇲🇽 <strong>Adaptado para México:</strong> Todos nuestros protocolos consideran el clima, 
                la altitud, los ingredientes locales y las tradiciones de medicina mexicana para 
                garantizar efectividad y relevancia cultural.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Floating Action (only on browser view) */}
      {viewMode === 'browser' && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => {
              // Quick access to create digestive protocol
              handleCreateNew('digestive_health');
            }}
            className="w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            title="Crear protocolo digestivo rápido"
          >
            <Leaf className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}