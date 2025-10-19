import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';
import { useAuth } from '../contexts/AuthContext';
import AchievementBadge from './AchievementBadge';
import HealthGoalCard from './HealthGoalCard';

export default function GamificationDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [healthPoints, setHealthPoints] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [healthGoals, setHealthGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_value: '',
    unit: '',
    category: 'exercise',
    target_date: '',
    points_reward: 100
  });

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'achievements', label: 'Logros', icon: '🏆' },
    { id: 'goals', label: 'Metas', icon: '🎯' },
    { id: 'leaderboard', label: 'Ranking', icon: '📈' },
    { id: 'transactions', label: 'Historial', icon: '📋' }
  ];

  const goalCategories = [
    { value: 'exercise', label: 'Ejercicio', icon: '💪' },
    { value: 'nutrition', label: 'Nutrición', icon: '🥗' },
    { value: 'sleep', label: 'Sueño', icon: '😴' },
    { value: 'mental_health', label: 'Salud Mental', icon: '🧘' },
    { value: 'general', label: 'General', icon: '🎯' }
  ];

  useEffect(() => {
    if (user?.id) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Load health points
      const pointsResponse = await fetch(`/api/gamification/points/${user.id}`);
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setHealthPoints(pointsData);
      }

      // Load user achievements
      const achievementsResponse = await fetch(`/api/gamification/achievements/${user.id}`);
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        setAchievements(achievementsData);
      }

      // Load all achievements
      const allAchievementsResponse = await fetch('/api/gamification/achievements');
      if (allAchievementsResponse.ok) {
        const allAchievementsData = await allAchievementsResponse.json();
        setAllAchievements(allAchievementsData);
      }

      // Load health goals
      const goalsResponse = await fetch(`/api/gamification/goals/${user.id}`);
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setHealthGoals(goalsData);
      }

      // Load leaderboard
      const leaderboardResponse = await fetch('/api/gamification/leaderboard');
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData);
      }

      // Load transactions
      const transactionsResponse = await fetch(`/api/gamification/transactions/${user.id}`);
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      }

    } catch (error) {
      console.error('Error loading gamification data:', error);
      toast.error('Error al cargar datos de gamificación');
    } finally {
      setLoading(false);
    }
  };

  const createHealthGoal = async () => {
    try {
      const response = await fetch(`/api/gamification/goals/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGoal,
          target_value: parseInt(newGoal.target_value),
          points_reward: parseInt(newGoal.points_reward)
        })
      });

      if (response.ok) {
        toast.success('Meta creada exitosamente');
        setShowNewGoalForm(false);
        setNewGoal({
          title: '',
          description: '',
          target_value: '',
          unit: '',
          category: 'exercise',
          target_date: '',
          points_reward: 100
        });
        loadGamificationData();
      } else {
        throw new Error('Error al crear meta');
      }
    } catch (error) {
      console.error('Error creating health goal:', error);
      toast.error('Error al crear meta');
    }
  };

  const updateUserStreak = async () => {
    try {
      const response = await fetch(`/api/gamification/streak/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.streakBonus > 0) {
          toast.success(`¡Racha de ${result.streakDays} días! +${result.streakBonus} puntos`);
        }
        loadGamificationData();
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLevelProgress = () => {
    if (!healthPoints) return 0;
    const currentLevelPoints = (healthPoints.level - 1) * 1000;
    const nextLevelPoints = healthPoints.level * 1000;
    const progress = ((healthPoints.total_points_earned - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard de gamificación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gamificación de Salud
          </h1>
          <p className="text-gray-600">
            Gana puntos, desbloquea logros y alcanza tus metas de salud
          </p>
        </div>

        {/* Health Points Overview */}
        {healthPoints && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Tu Progreso</h2>
              <button
                onClick={updateUserStreak}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                🔥 Actualizar Racha
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {healthPoints.level}
                </div>
                <div className="text-sm text-gray-600">Nivel</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {healthPoints.points.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Puntos Actuales</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {healthPoints.total_points_earned.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Ganados</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {healthPoints.streak_days}
                </div>
                <div className="text-sm text-gray-600">Días de Racha</div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progreso al Nivel {healthPoints.level + 1}
                </span>
                <span className="text-sm text-gray-600">
                  {getLevelProgress().toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getLevelProgress()}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Logros Recientes</h3>
                    <div className="space-y-3">
                      {achievements.slice(0, 5).map((achievement) => (
                        <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl">{achievement.achievement?.icon || '🏆'}</div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{achievement.achievement?.name}</div>
                            <div className="text-sm text-gray-600">{achievement.achievement?.description}</div>
                            <div className="text-xs text-green-600">+{achievement.achievement?.points_reward} puntos</div>
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(achievement.earned_at)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Metas Activas</h3>
                    <div className="space-y-3">
                      {healthGoals.filter(goal => !goal.is_completed).slice(0, 3).map((goal) => (
                        <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-900">{goal.title}</div>
                            <div className="text-sm text-gray-600">
                              {goal.current_value}/{goal.target_value} {goal.unit}
                            </div>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(goal.current_value / goal.target_value) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Todos los Logros</h3>
                  <div className="text-sm text-gray-600">
                    {achievements.filter(a => a.is_completed).length} de {allAchievements.length} completados
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {allAchievements.map((achievement) => {
                    const userAchievement = achievements.find(a => a.achievement_id === achievement.id);
                    return (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        earned={userAchievement?.is_completed || false}
                        progress={userAchievement?.progress || 0}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Mis Metas de Salud</h3>
                  <button
                    onClick={() => setShowNewGoalForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Nueva Meta
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {healthGoals.map((goal) => (
                    <HealthGoalCard
                      key={goal.id}
                      goal={goal}
                      onUpdate={loadGamificationData}
                    />
                  ))}
                </div>

                {healthGoals.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🎯</div>
                    <p>No tienes metas de salud aún</p>
                    <p className="text-sm">Crea tu primera meta para comenzar tu journey de salud</p>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Ranking de Usuarios</h3>
                
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.user_id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        user.user_id === user.id ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' :
                          'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.user_name}</div>
                          <div className="text-sm text-gray-600">Nivel {user.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{user.total_points.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">puntos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Historial de Puntos</h3>
                
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transaction.description}</div>
                          <div className="text-sm text-gray-600">{transaction.transaction_type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{formatDate(transaction.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Goal Form Modal */}
        {showNewGoalForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold mb-4">Nueva Meta de Salud</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Caminar 10,000 pasos diarios"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe tu meta..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Objetivo *
                    </label>
                    <input
                      type="number"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidad *
                    </label>
                    <input
                      type="text"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="días, pasos, vasos..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {goalCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Límite *
                  </label>
                  <input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puntos de Recompensa
                  </label>
                  <input
                    type="number"
                    value={newGoal.points_reward}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, points_reward: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowNewGoalForm(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createHealthGoal}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Meta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}