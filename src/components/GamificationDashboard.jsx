import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';

export default function GamificationDashboard() {
  const [healthPoints, setHealthPoints] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'achievements', label: 'Logros', icon: '🏆' },
    { id: 'leaderboard', label: 'Ranking', icon: '🥇' },
    { id: 'rewards', label: 'Recompensas', icon: '🎁' }
  ];

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setHealthPoints({
        userId: 'user123',
        totalPoints: 1250,
        availablePoints: 800,
        spentPoints: 450,
        level: 13,
        levelProgress: 50,
        nextLevelPoints: 1300
      });

      setAchievements([
        {
          id: 'first_consultation',
          name: 'Primera Consulta',
          description: 'Completa tu primera consulta médica',
          icon: '🩺',
          points: 50,
          earnedAt: '2024-01-15T10:30:00Z',
          completed: true
        },
        {
          id: 'daily_visitor',
          name: 'Visitante Diario',
          description: 'Visita la plataforma por 3 días consecutivos',
          icon: '📅',
          points: 100,
          earnedAt: '2024-01-18T09:15:00Z',
          completed: true
        },
        {
          id: 'trivia_novice',
          name: 'Novato en Trivia',
          description: 'Responde correctamente 5 preguntas de trivia médica',
          icon: '🧠',
          points: 150,
          earnedAt: null,
          completed: false,
          progress: 3
        }
      ]);

      setLeaderboard([
        { rank: 1, name: 'Ana García', points: 2500, level: 25 },
        { rank: 2, name: 'Carlos López', points: 2200, level: 22 },
        { rank: 3, name: 'María Rodríguez', points: 1800, level: 18 },
        { rank: 4, name: 'Juan Pérez', points: 1600, level: 16 },
        { rank: 5, name: 'Laura Martínez', points: 1400, level: 14 }
      ]);

    } catch (error) {
      console.error('Error loading gamification data:', error);
      toast.error('Error al cargar datos de gamificación');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    if (level >= 20) return 'from-purple-500 to-pink-500';
    if (level >= 15) return 'from-blue-500 to-purple-500';
    if (level >= 10) return 'from-green-500 to-blue-500';
    if (level >= 5) return 'from-yellow-500 to-green-500';
    return 'from-gray-500 to-yellow-500';
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-purple-500';
      case 'uncommon': return 'from-green-500 to-blue-500';
      default: return 'from-gray-500 to-green-500';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Centro de Gamificación
          </h2>
          <p className="text-gray-600">
            Gana puntos, desbloquea logros y compite con otros usuarios
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-medical-500 text-medical-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Health Points Card */}
              <div className={`bg-gradient-to-r ${getLevelColor(healthPoints?.level)} rounded-xl p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">Puntos de Salud</h3>
                    <p className="text-white/90">Nivel {healthPoints?.level}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{healthPoints?.totalPoints}</div>
                    <div className="text-white/90">Puntos totales</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progreso al siguiente nivel</span>
                    <span>{healthPoints?.levelProgress}/100</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-white h-3 rounded-full transition-all duration-500"
                      style={{ width: `${healthPoints?.levelProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Points Breakdown */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold">{healthPoints?.availablePoints}</div>
                    <div className="text-white/90 text-sm">Disponibles</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{healthPoints?.spentPoints}</div>
                    <div className="text-white/90 text-sm">Gastados</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{healthPoints?.nextLevelPoints}</div>
                    <div className="text-white/90 text-sm">Siguiente nivel</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="font-semibold text-gray-900">Logros</div>
                  <div className="text-2xl font-bold text-medical-600">
                    {achievements.filter(a => a.completed).length}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="font-semibold text-gray-900">Ranking</div>
                  <div className="text-2xl font-bold text-medical-600">#5</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="font-semibold text-gray-900">Racha</div>
                  <div className="text-2xl font-bold text-medical-600">7 días</div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Logros Recientes</h3>
                <div className="space-y-3">
                  {achievements.filter(a => a.completed).slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{achievement.name}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-medical-600">+{achievement.points}</div>
                        <div className="text-xs text-gray-500">puntos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      achievement.completed
                        ? 'border-medical-500 bg-medical-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                          {achievement.completed && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Completado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        {!achievement.completed && achievement.progress !== undefined && (
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progreso</span>
                              <span>{achievement.progress}/5</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-medical-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(achievement.progress / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-medical-600">+{achievement.points}</div>
                        <div className="text-xs text-gray-500">puntos</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-medical-50 to-blue-50 rounded-xl p-6 border border-medical-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ranking Global</h3>
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        index === 0
                          ? 'bg-yellow-100 border border-yellow-300'
                          : index === 1
                          ? 'bg-gray-100 border border-gray-300'
                          : index === 2
                          ? 'bg-orange-100 border border-orange-300'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="text-2xl font-bold text-gray-700">#{user.rank}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">Nivel {user.level}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-medical-600">{user.points}</div>
                        <div className="text-xs text-gray-500">puntos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-medical-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tienda de Recompensas</h3>
                <p className="text-gray-600 mb-4">
                  Próximamente podrás canjear tus puntos por recompensas especiales
                </p>
                <button
                  onClick={() => toast.info('Tienda de recompensas próximamente disponible')}
                  className="px-6 py-2 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
                >
                  Ver próximamente
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
