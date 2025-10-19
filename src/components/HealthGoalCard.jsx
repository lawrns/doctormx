import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';

export default function HealthGoalCard({ goal, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(goal.current_value);

  const getProgressPercentage = () => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'exercise':
        return 'from-green-500 to-green-600';
      case 'nutrition':
        return 'from-orange-500 to-orange-600';
      case 'sleep':
        return 'from-blue-500 to-blue-600';
      case 'mental_health':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'exercise':
        return '💪';
      case 'nutrition':
        return '🥗';
      case 'sleep':
        return '😴';
      case 'mental_health':
        return '🧘';
      default:
        return '🎯';
    }
  };

  const handleUpdateProgress = async () => {
    try {
      const response = await fetch(`/api/gamification/goals/${goal.id}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_value: currentValue })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.completed) {
          toast.success(`¡Meta completada! Ganaste ${result.pointsAwarded} puntos`);
        } else {
          toast.success('Progreso actualizado');
        }
        setIsEditing(false);
        onUpdate();
      } else {
        throw new Error('Error al actualizar progreso');
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast.error('Error al actualizar progreso');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
        goal.is_completed ? 'border-green-500' : 'border-blue-500'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getCategoryColor(goal.category)} flex items-center justify-center text-white text-xl`}>
            {getCategoryIcon(goal.category)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
            <p className="text-sm text-gray-600">{goal.description}</p>
          </div>
        </div>
        
        {goal.is_completed && (
          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
            <span className="text-green-600 text-sm">✓</span>
            <span className="text-xs font-medium text-green-800">Completada</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm text-gray-600">
            {goal.current_value} / {goal.target_value} {goal.unit}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full bg-gradient-to-r ${
              goal.is_completed ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600'
            } rounded-full`}
          />
        </div>
        <div className="text-right text-xs text-gray-500 mt-1">
          {getProgressPercentage().toFixed(1)}%
        </div>
      </div>

      {/* Goal Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-xs text-gray-500">Fecha límite</span>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(goal.target_date)}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Recompensa</span>
          <p className="text-sm font-medium text-gray-900">
            +{goal.points_reward} puntos
          </p>
        </div>
      </div>

      {/* Update Progress */}
      {!goal.is_completed && (
        <div className="border-t pt-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progreso actual
                </label>
                <input
                  type="number"
                  min="0"
                  max={goal.target_value}
                  value={currentValue}
                  onChange={(e) => setCurrentValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateProgress}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Actualizar Progreso
            </button>
          )}
        </div>
      )}

      {/* Completion Message */}
      {goal.is_completed && (
        <div className="border-t pt-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">🎉</span>
              <span className="text-sm font-medium text-green-800">
                ¡Meta completada!
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Ganaste {goal.points_reward} puntos por completar esta meta
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
