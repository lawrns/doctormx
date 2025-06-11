import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, AlertTriangle, CheckCircle, Calendar, 
  Activity, Heart, Brain, Shield 
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface PredictiveHealthCardProps {
  healthData: {
    healthScore: number;
    riskFactors: Array<{
      condition: string;
      risk: number;
      prevention: string[];
    }>;
    nextActions: Array<{
      action: string;
      priority: 'low' | 'medium' | 'high';
      dueDate: string;
    }>;
  };
  onActionClick: (action: any) => void;
}

export default function PredictiveHealthCard({ healthData, onActionClick }: PredictiveHealthCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getRiskColor = (risk: number) => {
    if (risk < 10) return 'text-green-600 bg-green-50';
    if (risk < 25) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Activity className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <Card className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <div className="p-6 space-y-6">
        {/* Health Score */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${healthData.healthScore * 2.51} 251`}
                className={`${getScoreColor(healthData.healthScore)} transition-all duration-1000`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(healthData.healthScore)}`}>
                {healthData.healthScore}
              </span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Puntuación de Salud
          </h3>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getScoreBackground(healthData.healthScore)} text-white`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {healthData.healthScore >= 80 ? 'Excelente' : 
             healthData.healthScore >= 60 ? 'Buena' : 'Necesita Atención'}
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            Predicciones IA
          </h4>
          
          <div className="space-y-3">
            {healthData.riskFactors.slice(0, 2).map((factor, index) => (
              <motion.div
                key={factor.condition}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${getRiskColor(factor.risk)} dark:bg-gray-800 dark:border-gray-600`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {factor.condition}
                  </span>
                  <span className={`text-sm font-bold ${getRiskColor(factor.risk).split(' ')[0]}`}>
                    {factor.risk}% riesgo
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  Prevención: {factor.prevention.slice(0, 2).join(', ')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next Actions */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Acciones Recomendadas
          </h4>
          
          <div className="space-y-2">
            {healthData.nextActions.slice(0, 3).map((action, index) => (
              <motion.div
                key={action.action}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(action.priority)}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {action.action}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      En {action.dueDate}
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onActionClick(action)}
                  className="text-xs"
                >
                  Programar
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Insight IA Personalizado
              </h5>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Basado en tu perfil genético y estilo de vida, mantener actividad física 
                regular puede reducir tu riesgo cardiovascular en un 35%.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
          onClick={() => onActionClick({ type: 'comprehensive_analysis' })}
        >
          <Heart className="w-4 h-4 mr-2" />
          Ver Análisis Completo
        </Button>
      </div>
    </Card>
  );
}