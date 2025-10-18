import { supabase } from '../lib/supabase';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'health' | 'social' | 'learning' | 'streak' | 'special';
  requirement: {
    type: 'consultations' | 'days_streak' | 'points_earned' | 'referrals' | 'trivia_correct' | 'custom';
    value: number;
    description: string;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface HealthPoints {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  spentPoints: number;
  level: number;
  levelProgress: number;
  nextLevelPoints: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  progress: number;
  completed: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Health Achievements
  {
    id: 'first_consultation',
    name: 'Primera Consulta',
    description: 'Completa tu primera consulta médica',
    icon: '🩺',
    points: 50,
    category: 'health',
    requirement: {
      type: 'consultations',
      value: 1,
      description: 'Completa 1 consulta'
    },
    rarity: 'common'
  },
  {
    id: 'health_explorer',
    name: 'Explorador de la Salud',
    description: 'Completa 10 consultas médicas',
    icon: '🗺️',
    points: 200,
    category: 'health',
    requirement: {
      type: 'consultations',
      value: 10,
      description: 'Completa 10 consultas'
    },
    rarity: 'uncommon'
  },
  {
    id: 'health_champion',
    name: 'Campeón de la Salud',
    description: 'Completa 50 consultas médicas',
    icon: '🏆',
    points: 1000,
    category: 'health',
    requirement: {
      type: 'consultations',
      value: 50,
      description: 'Completa 50 consultas'
    },
    rarity: 'rare'
  },
  {
    id: 'health_master',
    name: 'Maestro de la Salud',
    description: 'Completa 100 consultas médicas',
    icon: '👑',
    points: 2500,
    category: 'health',
    requirement: {
      type: 'consultations',
      value: 100,
      description: 'Completa 100 consultas'
    },
    rarity: 'epic'
  },

  // Streak Achievements
  {
    id: 'daily_visitor',
    name: 'Visitante Diario',
    description: 'Visita la plataforma por 3 días consecutivos',
    icon: '📅',
    points: 100,
    category: 'streak',
    requirement: {
      type: 'days_streak',
      value: 3,
      description: 'Visita por 3 días consecutivos'
    },
    rarity: 'common'
  },
  {
    id: 'week_warrior',
    name: 'Guerrero de la Semana',
    description: 'Visita la plataforma por 7 días consecutivos',
    icon: '⚔️',
    points: 300,
    category: 'streak',
    requirement: {
      type: 'days_streak',
      value: 7,
      description: 'Visita por 7 días consecutivos'
    },
    rarity: 'uncommon'
  },
  {
    id: 'month_master',
    name: 'Maestro del Mes',
    description: 'Visita la plataforma por 30 días consecutivos',
    icon: '🗓️',
    points: 1500,
    category: 'streak',
    requirement: {
      type: 'days_streak',
      value: 30,
      description: 'Visita por 30 días consecutivos'
    },
    rarity: 'rare'
  },

  // Learning Achievements
  {
    id: 'trivia_novice',
    name: 'Novato en Trivia',
    description: 'Responde correctamente 5 preguntas de trivia médica',
    icon: '🧠',
    points: 150,
    category: 'learning',
    requirement: {
      type: 'trivia_correct',
      value: 5,
      description: 'Responde 5 preguntas correctamente'
    },
    rarity: 'common'
  },
  {
    id: 'trivia_expert',
    name: 'Experto en Trivia',
    description: 'Responde correctamente 25 preguntas de trivia médica',
    icon: '🎓',
    points: 500,
    category: 'learning',
    requirement: {
      type: 'trivia_correct',
      value: 25,
      description: 'Responde 25 preguntas correctamente'
    },
    rarity: 'uncommon'
  },
  {
    id: 'trivia_master',
    name: 'Maestro en Trivia',
    description: 'Responde correctamente 100 preguntas de trivia médica',
    icon: '🧙‍♂️',
    points: 2000,
    category: 'learning',
    requirement: {
      type: 'trivia_correct',
      value: 100,
      description: 'Responde 100 preguntas correctamente'
    },
    rarity: 'rare'
  },

  // Social Achievements
  {
    id: 'first_referral',
    name: 'Primer Referido',
    description: 'Refiere a tu primer amigo',
    icon: '👥',
    points: 100,
    category: 'social',
    requirement: {
      type: 'referrals',
      value: 1,
      description: 'Refiere a 1 amigo'
    },
    rarity: 'common'
  },
  {
    id: 'social_butterfly',
    name: 'Mariposa Social',
    description: 'Refiere a 10 amigos',
    icon: '🦋',
    points: 500,
    category: 'social',
    requirement: {
      type: 'referrals',
      value: 10,
      description: 'Refiere a 10 amigos'
    },
    rarity: 'uncommon'
  },
  {
    id: 'community_leader',
    name: 'Líder de la Comunidad',
    description: 'Refiere a 50 amigos',
    icon: '👑',
    points: 2000,
    category: 'social',
    requirement: {
      type: 'referrals',
      value: 50,
      description: 'Refiere a 50 amigos'
    },
    rarity: 'rare'
  },

  // Special Achievements
  {
    id: 'early_adopter',
    name: 'Pionero',
    description: 'Únete a Doctor.mx en sus primeros días',
    icon: '🚀',
    points: 1000,
    category: 'special',
    requirement: {
      type: 'custom',
      value: 1,
      description: 'Usuario pionero'
    },
    rarity: 'legendary'
  },
  {
    id: 'beta_tester',
    name: 'Probador Beta',
    description: 'Participa en el programa beta de Doctor.mx',
    icon: '🧪',
    points: 750,
    category: 'special',
    requirement: {
      type: 'custom',
      value: 1,
      description: 'Probador beta'
    },
    rarity: 'epic'
  }
];

export async function getUserHealthPoints(userId: string): Promise<HealthPoints> {
  try {
    const { data: pointsData, error } = await supabase
      .from('health_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!pointsData) {
      // Create new health points record
      const { data: newPoints, error: createError } = await supabase
        .from('health_points')
        .insert({
          user_id: userId,
          total_points: 0,
          available_points: 0,
          spent_points: 0,
          level: 1,
          level_progress: 0,
          next_level_points: 100
        })
        .select()
        .single();

      if (createError) throw createError;
      return mapHealthPoints(newPoints);
    }

    return mapHealthPoints(pointsData);
  } catch (error) {
    console.error('Error getting user health points:', error);
    throw error;
  }
}

export async function addHealthPoints(
  userId: string,
  points: number,
  reason: string,
  metadata?: any
): Promise<HealthPoints> {
  try {
    // Get current points
    const currentPoints = await getUserHealthPoints(userId);
    
    // Calculate new level
    const newTotalPoints = currentPoints.totalPoints + points;
    const newLevel = Math.floor(newTotalPoints / 100) + 1;
    const levelProgress = newTotalPoints % 100;
    const nextLevelPoints = newLevel * 100;

    // Update points
    const { data: updatedPoints, error } = await supabase
      .from('health_points')
      .update({
        total_points: newTotalPoints,
        available_points: currentPoints.availablePoints + points,
        level: newLevel,
        level_progress: levelProgress,
        next_level_points: nextLevelPoints
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log points transaction
    await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        points: points,
        reason: reason,
        metadata: metadata || {},
        transaction_type: 'earned'
      });

    return mapHealthPoints(updatedPoints);
  } catch (error) {
    console.error('Error adding health points:', error);
    throw error;
  }
}

export async function spendHealthPoints(
  userId: string,
  points: number,
  reason: string,
  metadata?: any
): Promise<HealthPoints> {
  try {
    // Get current points
    const currentPoints = await getUserHealthPoints(userId);
    
    if (currentPoints.availablePoints < points) {
      throw new Error('Insufficient points');
    }

    // Update points
    const { data: updatedPoints, error } = await supabase
      .from('health_points')
      .update({
        available_points: currentPoints.availablePoints - points,
        spent_points: currentPoints.spentPoints + points
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log points transaction
    await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        points: -points,
        reason: reason,
        metadata: metadata || {},
        transaction_type: 'spent'
      });

    return mapHealthPoints(updatedPoints);
  } catch (error) {
    console.error('Error spending health points:', error);
    throw error;
  }
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user achievements:', error);
    throw error;
  }
}

export async function checkAndAwardAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const userAchievements = await getUserAchievements(userId);
    const userPoints = await getUserHealthPoints(userId);
    const newAchievements: UserAchievement[] = [];

    // Get user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    const userStats = stats || {
      consultations_completed: 0,
      days_streak: 0,
      referrals_made: 0,
      trivia_correct: 0
    };

    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
      const existingAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
      
      if (existingAchievement && existingAchievement.completed) {
        continue; // Already earned
      }

      let progress = 0;
      let completed = false;

      switch (achievement.requirement.type) {
        case 'consultations':
          progress = Math.min(userStats.consultations_completed, achievement.requirement.value);
          completed = userStats.consultations_completed >= achievement.requirement.value;
          break;
        case 'days_streak':
          progress = Math.min(userStats.days_streak, achievement.requirement.value);
          completed = userStats.days_streak >= achievement.requirement.value;
          break;
        case 'referrals':
          progress = Math.min(userStats.referrals_made, achievement.requirement.value);
          completed = userStats.referrals_made >= achievement.requirement.value;
          break;
        case 'trivia_correct':
          progress = Math.min(userStats.trivia_correct, achievement.requirement.value);
          completed = userStats.trivia_correct >= achievement.requirement.value;
          break;
        case 'points_earned':
          progress = Math.min(userPoints.totalPoints, achievement.requirement.value);
          completed = userPoints.totalPoints >= achievement.requirement.value;
          break;
        case 'custom':
          // Special achievements are manually awarded
          continue;
      }

      if (completed && !existingAchievement) {
        // Award new achievement
        const { data: newAchievement, error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: new Date().toISOString(),
            progress: progress,
            completed: true
          })
          .select()
          .single();

        if (error) throw error;

        newAchievements.push(newAchievement);

        // Award points for achievement
        await addHealthPoints(userId, achievement.points, `Achievement: ${achievement.name}`, {
          achievement_id: achievement.id
        });
      } else if (existingAchievement && !existingAchievement.completed) {
        // Update progress
        const { error } = await supabase
          .from('user_achievements')
          .update({
            progress: progress,
            completed: completed
          })
          .eq('id', existingAchievement.id);

        if (error) throw error;
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    throw error;
  }
}

export async function getLeaderboard(type: 'points' | 'achievements' | 'streak' = 'points', limit: number = 10): Promise<any[]> {
  try {
    let query;
    
    switch (type) {
      case 'points':
        query = supabase
          .from('health_points')
          .select(`
            *,
            users!inner(name, email)
          `)
          .order('total_points', { ascending: false })
          .limit(limit);
        break;
      case 'achievements':
        query = supabase
          .from('user_achievements')
          .select(`
            user_id,
            users!inner(name, email)
          `)
          .eq('completed', true)
          .limit(limit);
        break;
      case 'streak':
        query = supabase
          .from('user_stats')
          .select(`
            *,
            users!inner(name, email)
          `)
          .order('days_streak', { ascending: false })
          .limit(limit);
        break;
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

function mapHealthPoints(data: any): HealthPoints {
  return {
    userId: data.user_id,
    totalPoints: data.total_points,
    availablePoints: data.available_points,
    spentPoints: data.spent_points,
    level: data.level,
    levelProgress: data.level_progress,
    nextLevelPoints: data.next_level_points
  };
}

export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS;
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
