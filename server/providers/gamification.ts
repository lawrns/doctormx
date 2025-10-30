import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Service Role Key must be provided in .env');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export interface HealthPoints {
  id: string;
  user_id: string;
  score: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  requirement_type: string;
  requirement_value: number;
  requirement_description: string;
  rarity: string;
  achievement_type: string;
  difficulty: string;
  is_active: boolean;
  points_reward: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
  is_completed: boolean;
  achievement?: Achievement;
}

export interface HealthGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  category: string;
  target_date: string;
  is_completed: boolean;
  points_reward: number;
  created_at: string;
  updated_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

/**
 * Get user health points and level
 */
export async function getUserHealthPoints(userId: string): Promise<HealthPoints | null> {
  try {
    const supabaseClient = getSupabaseClient();

    const { data, error } = await supabaseClient
      .from('health_scores')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User doesn't have health points yet, try to create them
        try {
          return await createUserHealthPoints(userId);
        } catch (createError: any) {
          // If creation fails due to foreign key constraint, return default points
          if (createError.code === '23503') {
            console.log('User not in profiles table, returning default points');
            return {
              id: 'temp-' + userId,
              user_id: userId,
              score: 0,
              level: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
          throw createError;
        }
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting user health points:', error);
    throw error;
  }
}

/**
 * Create initial health points for user
 */
export async function createUserHealthPoints(userId: string): Promise<HealthPoints> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('health_scores')
      .insert({
        user_id: userId,
        score: 0,
        level: 1
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user health points:', error);
    throw error;
  }
}

/**
 * Add points to user
 */
export async function addHealthPoints(
  userId: string,
  points: number,
  transactionType: string,
  description: string,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; newLevel?: number; pointsAdded: number }> {
  try {
    const supabaseClient = getSupabaseClient();
    
    // Start transaction
    const { data: currentPoints, error: fetchError } = await supabaseClient
      .from('health_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Create health points if they don't exist
        await createUserHealthPoints(userId);
        return await addHealthPoints(userId, points, transactionType, description, metadata);
      }
      throw fetchError;
    }

    const newScore = currentPoints.score + points;
    const newLevel = Math.floor(newScore / 1000) + 1; // 1000 points per level
    const levelUp = newLevel > currentPoints.level;

    // Update health points
    const { error: updateError } = await supabaseClient
      .from('health_scores')
      .update({
        score: newScore,
        level: newLevel
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabaseClient
      .from('points_transactions')
      .insert({
        user_id: userId,
        points: points,
        transaction_type: transactionType,
        description: description,
        metadata: metadata
      });

    if (transactionError) {
      console.error('Error recording points transaction:', transactionError);
      // Don't throw error for transaction logging failures
    }

    return {
      success: true,
      newLevel: levelUp ? newLevel : undefined,
      pointsAdded: points,
      newScore: newScore
    };
  } catch (error) {
    console.error('Error adding health points:', error);
    throw error;
  }
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user achievements:', error);
    throw error;
  }
}

/**
 * Get all available achievements
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('points_reward', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting all achievements:', error);
    throw error;
  }
}

/**
 * Award achievement to user
 */
export async function awardAchievement(
  userId: string,
  achievementId: string,
  progress: number = 100
): Promise<{ success: boolean; achievement?: Achievement }> {
  try {
    const supabaseClient = getSupabaseClient();
    
    // Check if user already has this achievement
    const { data: existingAchievement, error: checkError } = await supabaseClient
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingAchievement) {
      return { success: false }; // Already has this achievement
    }

    // Get achievement details
    const { data: achievement, error: achievementError } = await supabaseClient
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (achievementError) throw achievementError;

    // Award achievement
    const { error: awardError } = await supabaseClient
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        progress: progress,
        is_completed: progress >= 100,
        earned_at: new Date().toISOString()
      });

    if (awardError) throw awardError;

    // Add points if achievement gives points
    if (achievement.points_reward > 0) {
      await addHealthPoints(
        userId,
        achievement.points_reward,
        'achievement',
        `Logro desbloqueado: ${achievement.name}`,
        { achievement_id: achievementId }
      );
    }

    return { success: true, achievement };
  } catch (error) {
    console.error('Error awarding achievement:', error);
    throw error;
  }
}

/**
 * Get user health goals
 */
export async function getUserHealthGoals(userId: string): Promise<HealthGoal[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('health_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user health goals:', error);
    throw error;
  }
}

/**
 * Create health goal
 */
export async function createHealthGoal(
  userId: string,
  title: string,
  description: string,
  targetValue: number,
  unit: string,
  category: string,
  targetDate: string,
  pointsReward: number = 100
): Promise<HealthGoal> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('health_goals')
      .insert({
        user_id: userId,
        title,
        description,
        target_value: targetValue,
        current_value: 0,
        unit,
        category,
        target_date: targetDate,
        is_completed: false,
        points_reward: pointsReward
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating health goal:', error);
    throw error;
  }
}

/**
 * Update health goal progress
 */
export async function updateHealthGoalProgress(
  goalId: string,
  currentValue: number
): Promise<{ success: boolean; completed: boolean; pointsAwarded?: number }> {
  try {
    const supabaseClient = getSupabaseClient();
    
    // Get goal details
    const { data: goal, error: goalError } = await supabaseClient
      .from('health_goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (goalError) throw goalError;

    const isCompleted = currentValue >= goal.target_value;
    const wasCompleted = goal.is_completed;

    // Update goal
    const { error: updateError } = await supabaseClient
      .from('health_goals')
      .update({
        current_value: currentValue,
        is_completed: isCompleted
      })
      .eq('id', goalId);

    if (updateError) throw updateError;

    // Award points if goal was just completed
    if (isCompleted && !wasCompleted) {
      await addHealthPoints(
        goal.user_id,
        goal.points_reward,
        'goal_completion',
        `Meta completada: ${goal.title}`,
        { goal_id: goalId }
      );

      return { success: true, completed: true, pointsAwarded: goal.points_reward };
    }

    return { success: true, completed: false };
  } catch (error) {
    console.error('Error updating health goal progress:', error);
    throw error;
  }
}

/**
 * Get points transaction history
 */
export async function getPointsTransactionHistory(
  userId: string,
  limit: number = 50
): Promise<PointsTransaction[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting points transaction history:', error);
    throw error;
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit: number = 10): Promise<Array<{
  user_id: string;
  total_points: number;
  level: number;
  user_name?: string;
  rank: number;
}>> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('health_points')
      .select(`
        user_id,
        total_points_earned,
        level,
        users!inner(name)
      `)
      .order('total_points_earned', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((item, index) => ({
      user_id: item.user_id,
      total_points: item.total_points_earned,
      level: item.level,
      user_name: item.users?.name || 'Usuario',
      rank: index + 1
    }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

/**
 * Check and award achievements based on user activity
 */
export async function checkAndAwardAchievements(userId: string, activityType: string, metadata: Record<string, any> = {}): Promise<Achievement[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    // Get all active achievements
    const { data: achievements, error: achievementsError } = await supabaseClient
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (achievementsError) throw achievementsError;

    const awardedAchievements: Achievement[] = [];

    for (const achievement of achievements || []) {
      let shouldAward = false;

      // Check achievement requirements based on type
      switch (achievement.category) {
        case 'consultations':
          if (activityType === 'consultation_completed') {
            const { data: consultationCount } = await supabaseClient
              .from('consults')
              .select('id', { count: 'exact' })
              .eq('user_id', userId)
              .eq('status', 'completed');

            if (consultationCount && consultationCount.length >= (achievement.requirements?.count || 1)) {
              shouldAward = true;
            }
          }
          break;

        case 'streak':
          if (activityType === 'daily_login') {
            const { data: healthPoints } = await supabaseClient
              .from('health_points')
              .select('streak_days')
              .eq('user_id', userId)
              .single();

            if (healthPoints && healthPoints.streak_days >= (achievement.requirements?.days || 7)) {
              shouldAward = true;
            }
          }
          break;

        case 'points':
          if (activityType === 'points_earned') {
            const { data: healthPoints } = await supabaseClient
              .from('health_points')
              .select('total_points_earned')
              .eq('user_id', userId)
              .single();

            if (healthPoints && healthPoints.total_points_earned >= (achievement.requirements?.points || 1000)) {
              shouldAward = true;
            }
          }
          break;
      }

      if (shouldAward) {
        const result = await awardAchievement(userId, achievement.id);
        if (result.success && result.achievement) {
          awardedAchievements.push(result.achievement);
        }
      }
    }

    return awardedAchievements;
  } catch (error) {
    console.error('Error checking and awarding achievements:', error);
    throw error;
  }
}

/**
 * Update user streak
 */
export async function updateUserStreak(userId: string): Promise<{ success: boolean; streakDays: number; streakBonus?: number }> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data: healthPoints, error: fetchError } = await supabaseClient
      .from('health_scores')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        await createUserHealthPoints(userId);
        return await updateUserStreak(userId);
      }
      throw fetchError;
    }

    // Simplified streak logic - just award bonus points
    const streakBonus = 10; // Fixed bonus for daily activity

    // Update score with streak bonus
    const { error: updateError } = await supabaseClient
      .from('health_scores')
      .update({
        score: healthPoints.score + streakBonus
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Award streak bonus points
    if (streakBonus > 0) {
      await addHealthPoints(
        userId,
        streakBonus,
        'streak_bonus',
        'Actividad diaria',
        { streak_bonus: streakBonus }
      );
    }

    return { success: true, streakBonus };
  } catch (error) {
    console.error('Error updating user streak:', error);
    throw error;
  }
}