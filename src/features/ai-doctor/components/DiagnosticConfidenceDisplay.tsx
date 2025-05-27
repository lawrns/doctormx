import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, CheckCircle, AlertTriangle, Stethoscope } from 'lucide-react';

interface DiagnosticConfidenceDisplayProps {
  confidence: number; // 0-1
  phase: 'greeting' | 'chief_complaint' | 'history_taking' | 'diagnosis' | 'treatment';
  questionCount: number;
  primaryHypothesis?: string;
  clinicalReasoning?: string;
  shouldDiagnose: boolean;
}

const DiagnosticConfidenceDisplay: React.FC<DiagnosticConfidenceDisplayProps> = ({
  confidence = 0.1,
  phase = 'greeting',
  questionCount = 0,
  primaryHypothesis,
  clinicalReasoning,
  shouldDiagnose = false
}) => {
  const confidencePercent = Math.round(confidence * 100);
  
  const getPhaseInfo = () => {
    switch (phase) {
      case 'greeting':
        return {
          icon: Stethoscope,
          label: 'Saludo inicial',
          color: '#6B7280',
          description: 'Estableciendo contacto'
        };
      case 'chief_complaint':
        return {
          icon: Target,
          label: 'Motivo de consulta',
          color: '#3B82F6',
          description: 'Identificando síntoma principal'
        };
      case 'history_taking':
        return {
          icon: Brain,
          label: 'Interrogatorio dirigido',
          color: '#F59E0B',
          description: 'Recopilando información clínica'
        };
      case 'diagnosis':
        return {
          icon: CheckCircle,
          label: 'Diagnóstico',
          color: '#10B981',
          description: 'Formulando impresión diagnóstica'
        };
      default:
        return {
          icon: Stethoscope,
          label: 'Evaluación',
          color: '#6B7280',
          description: 'Proceso diagnóstico'
        };
    }
  };

  const getConfidenceColor = () => {
    if (confidence < 0.3) return '#EF4444'; // red
    if (confidence < 0.6) return '#F59E0B'; // yellow
    if (confidence < 0.8) return '#3B82F6'; // blue
    return '#10B981'; // green
  };

  const getConfidenceLabel = () => {
    if (confidence < 0.3) return 'Explorando';
    if (confidence < 0.6) return 'Evaluando';
    if (confidence < 0.8) return 'Clarificando';
    return 'Confiado';
  };

  const phaseInfo = getPhaseInfo();
  const PhaseIcon = phaseInfo.icon;

  return (
    <div className="diagnostic-confidence-display bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
      {/* Header with phase and confidence */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${phaseInfo.color}20` }}
          >
            <PhaseIcon 
              size={20} 
              style={{ color: phaseInfo.color }}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              {phaseInfo.label}
            </h3>
            <p className="text-xs text-gray-600">
              {phaseInfo.description}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-1">
            <span 
              className="text-lg font-bold"
              style={{ color: getConfidenceColor() }}
            >
              {confidencePercent}%
            </span>
            {shouldDiagnose && (
              <CheckCircle size={16} className="text-green-500" />
            )}
          </div>
          <p className="text-xs text-gray-500">
            {getConfidenceLabel()}
          </p>
        </div>
      </div>

      {/* Confidence meter */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Confianza diagnóstica</span>
          <span>{questionCount} preguntas</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${confidencePercent}%`,
              backgroundColor: getConfidenceColor()
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        
        {/* Confidence threshold indicator */}
        <div className="relative mt-1">
          <div 
            className="absolute w-0.5 h-2 bg-green-500"
            style={{ left: '82%', transform: 'translateX(-50%)' }}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Umbral diagnóstico: 82%
          </p>
        </div>
      </div>

      {/* Primary hypothesis */}
      {primaryHypothesis && (
        <div className="mb-3 p-2 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-1">
            <Target size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-gray-700">
              Hipótesis principal
            </span>
          </div>
          <p className="text-sm text-gray-800 font-medium">
            {primaryHypothesis}
          </p>
        </div>
      )}

      {/* Clinical reasoning */}
      {clinicalReasoning && (
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-1">
            <Brain size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-700">
              Razonamiento clínico
            </span>
          </div>
          <p className="text-xs text-blue-800">
            {clinicalReasoning}
          </p>
        </div>
      )}

      {/* Progress indicators */}
      <div className="mt-3 flex justify-between items-center">
        <div className="flex space-x-1">
          {['greeting', 'chief_complaint', 'history_taking', 'diagnosis'].map((stepPhase, index) => {
            const isActive = phase === stepPhase;
            const isCompleted = ['greeting', 'chief_complaint', 'history_taking', 'diagnosis'].indexOf(phase) > index;
            
            return (
              <div
                key={stepPhase}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isActive 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300'
                }`}
              />
            );
          })}
        </div>
        
        {shouldDiagnose && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center space-x-1 text-green-600"
          >
            <CheckCircle size={14} />
            <span className="text-xs font-medium">Listo para diagnóstico</span>
          </motion.div>
        )}
      </div>

      {/* Diagnostic readiness indicator */}
      {confidence >= 0.82 && !shouldDiagnose && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle size={14} className="text-green-600" />
            <span className="text-xs font-medium text-green-700">
              Confianza suficiente para diagnóstico
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DiagnosticConfidenceDisplay;
