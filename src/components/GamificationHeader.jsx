import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function GamificationHeader() {
  const { user } = useAuth();
  const [healthPoints, setHealthPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadHealthPoints();
    }
  }, [user]);

  const loadHealthPoints = async () => {
    try {
      const response = await fetch(`/api/gamification/points/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setHealthPoints(data);
      }
    } catch (error) {
      console.error('Error loading health points:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!healthPoints) return 0;
    const currentLevelPoints = (healthPoints.level - 1) * 1000;
    const nextLevelPoints = healthPoints.level * 1000;
    const progress = ((healthPoints.total_points_earned - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getLevelColor = (level) => {
    if (level >= 10) return 'from-purple-500 to-purple-600';
    if (level >= 5) return 'from-blue-500 to-blue-600';
    if (level >= 3) return 'from-green-500 to-green-600';
    return 'from-yellow-500 to-yellow-600';
  };

  if (loading || !healthPoints) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Health Points Display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center space-x-2"
      >
        <div className="relative">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getLevelColor(healthPoints.level)} flex items-center justify-center text-white font-bold text-sm`}>
            {healthPoints.level}
          </div>
          {healthPoints.streak_days > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">🔥</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-semibold text-gray-900">
              {healthPoints.points.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">pts</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getLevelProgress()}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Streak Display */}
      {healthPoints.streak_days > 0 && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center space-x-1 bg-orange-100 px-2 py-1 rounded-full"
        >
          <span className="text-orange-600 text-sm">🔥</span>
          <span className="text-xs font-medium text-orange-800">
            {healthPoints.streak_days} días
          </span>
        </motion.div>
      )}

      {/* Level Up Animation */}
      {showLevelUp && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowLevelUp(false)}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 text-center max-w-md mx-4"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Subiste de Nivel!
            </h2>
            <p className="text-gray-600 mb-4">
              Ahora eres nivel <span className="font-bold text-blue-600">{healthPoints.level}</span>
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                Has ganado <span className="font-bold">100 puntos</span> por subir de nivel
              </p>
            </div>
            <button
              onClick={() => setShowLevelUp(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ¡Genial!
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
