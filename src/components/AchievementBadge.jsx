import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AchievementBadge({ achievement, earned = false, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const getBadgeColor = (category) => {
    switch (category) {
      case 'consultations':
        return 'from-blue-500 to-blue-600';
      case 'streak':
        return 'from-orange-500 to-orange-600';
      case 'points':
        return 'from-purple-500 to-purple-600';
      case 'goals':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'consultations':
        return '👨‍⚕️';
      case 'streak':
        return '🔥';
      case 'points':
        return '⭐';
      case 'goals':
        return '🎯';
      default:
        return '🏆';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative cursor-pointer transition-all duration-200 ${
        earned ? 'opacity-100' : 'opacity-60'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getBadgeColor(achievement.category)} flex items-center justify-center text-white text-2xl shadow-lg`}>
        {achievement.icon || getIcon(achievement.category)}
      </div>
      
      {earned && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white">✓</span>
        </div>
      )}

      {/* Tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10"
        >
          <div className="font-semibold">{achievement.name}</div>
          <div className="text-gray-300">{achievement.description}</div>
          <div className="text-yellow-400 mt-1">
            +{achievement.points_reward} puntos
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </motion.div>
      )}

      {/* Progress Ring for Unearned Achievements */}
      {!earned && achievement.progress !== undefined && (
        <div className="absolute inset-0 rounded-full">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="white"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - achievement.progress / 100)}`}
              className="transition-all duration-300"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
