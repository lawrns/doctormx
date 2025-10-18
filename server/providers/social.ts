import { supabase } from '../lib/supabase';

export interface HealthPost {
  id: string;
  userId: string;
  content: string;
  type: 'tip' | 'question' | 'experience' | 'achievement' | 'support';
  category: 'general' | 'nutrition' | 'exercise' | 'mental_health' | 'chronic_conditions' | 'prevention';
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isAnonymous: boolean;
  metadata: {
    imageUrl?: string;
    linkUrl?: string;
    location?: string;
    mood?: string;
  };
}

export interface HealthComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
  parentId?: string; // For replies
  isAnonymous: boolean;
}

export interface HealthGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  isPublic: boolean;
  isVerified: boolean;
  createdAt: string;
  rules: string[];
  tags: string[];
  coverImage?: string;
  adminIds: string[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  isActive: boolean;
}

export interface HealthChallenge {
  id: string;
  name: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'mental_health' | 'sleep' | 'hydration' | 'meditation';
  duration: number; // days
  difficulty: 'easy' | 'medium' | 'hard';
  startDate: string;
  endDate: string;
  participants: number;
  isActive: boolean;
  rewards: {
    points: number;
    badge?: string;
    certificate?: boolean;
  };
  requirements: string[];
  instructions: string[];
}

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  userId: string;
  joinedAt: string;
  progress: number; // percentage
  completed: boolean;
  completedAt?: string;
  streak: number;
  lastActivity: string;
}

export async function createHealthPost(
  userId: string,
  content: string,
  type: string,
  category: string,
  tags: string[] = [],
  isPublic: boolean = true,
  isAnonymous: boolean = false,
  metadata: any = {}
): Promise<HealthPost> {
  try {
    const { data, error } = await supabase
      .from('health_posts')
      .insert({
        user_id: userId,
        content,
        type,
        category,
        tags,
        is_public: isPublic,
        is_anonymous: isAnonymous,
        metadata,
        likes: 0,
        comments: 0,
        shares: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating health post:', error);
    throw error;
  }
}

export async function getHealthPosts(
  category?: string,
  type?: string,
  limit: number = 20,
  offset: number = 0
): Promise<HealthPost[]> {
  try {
    let query = supabase
      .from('health_posts')
      .select(`
        *,
        users!inner(name, avatar_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting health posts:', error);
    throw error;
  }
}

export async function likePost(postId: string, userId: string): Promise<boolean> {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      // Decrement likes count
      await supabase
        .from('health_posts')
        .update({ likes: supabase.raw('likes - 1') })
        .eq('id', postId);

      return false;
    } else {
      // Like
      await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString()
        });

      // Increment likes count
      await supabase
        .from('health_posts')
        .update({ likes: supabase.raw('likes + 1') })
        .eq('id', postId);

      return true;
    }
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
}

export async function addComment(
  postId: string,
  userId: string,
  content: string,
  parentId?: string,
  isAnonymous: boolean = false
): Promise<HealthComment> {
  try {
    const { data, error } = await supabase
      .from('health_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        parent_id: parentId,
        is_anonymous: isAnonymous,
        likes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Increment comments count
    await supabase
      .from('health_posts')
      .update({ comments: supabase.raw('comments + 1') })
      .eq('id', postId);

    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

export async function getPostComments(postId: string): Promise<HealthComment[]> {
  try {
    const { data, error } = await supabase
      .from('health_comments')
      .select(`
        *,
        users!inner(name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting post comments:', error);
    throw error;
  }
}

export async function createHealthGroup(
  userId: string,
  name: string,
  description: string,
  category: string,
  isPublic: boolean = true,
  rules: string[] = [],
  tags: string[] = []
): Promise<HealthGroup> {
  try {
    const { data, error } = await supabase
      .from('health_groups')
      .insert({
        name,
        description,
        category,
        is_public: isPublic,
        rules,
        tags,
        member_count: 1,
        admin_ids: [userId],
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin member
    await supabase
      .from('group_members')
      .insert({
        group_id: data.id,
        user_id: userId,
        role: 'admin',
        joined_at: new Date().toISOString(),
        is_active: true
      });

    return data;
  } catch (error) {
    console.error('Error creating health group:', error);
    throw error;
  }
}

export async function joinGroup(groupId: string, userId: string): Promise<boolean> {
  try {
    // Check if already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      throw new Error('Already a member');
    }

    // Add member
    await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString(),
        is_active: true
      });

    // Increment member count
    await supabase
      .from('health_groups')
      .update({ member_count: supabase.raw('member_count + 1') })
      .eq('id', groupId);

    return true;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
}

export async function getHealthGroups(
  category?: string,
  limit: number = 20,
  offset: number = 0
): Promise<HealthGroup[]> {
  try {
    let query = supabase
      .from('health_groups')
      .select('*')
      .eq('is_public', true)
      .order('member_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting health groups:', error);
    throw error;
  }
}

export async function createHealthChallenge(
  name: string,
  description: string,
  category: string,
  duration: number,
  difficulty: string,
  startDate: string,
  endDate: string,
  rewards: any,
  requirements: string[],
  instructions: string[]
): Promise<HealthChallenge> {
  try {
    const { data, error } = await supabase
      .from('health_challenges')
      .insert({
        name,
        description,
        category,
        duration,
        difficulty,
        start_date: startDate,
        end_date: endDate,
        participants: 0,
        is_active: true,
        rewards,
        requirements,
        instructions,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating health challenge:', error);
    throw error;
  }
}

export async function joinChallenge(challengeId: string, userId: string): Promise<ChallengeParticipation> {
  try {
    // Check if already participating
    const { data: existingParticipation } = await supabase
      .from('challenge_participations')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single();

    if (existingParticipation) {
      throw new Error('Already participating');
    }

    // Add participation
    const { data, error } = await supabase
      .from('challenge_participations')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        joined_at: new Date().toISOString(),
        progress: 0,
        completed: false,
        streak: 0,
        last_activity: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Increment participants count
    await supabase
      .from('health_challenges')
      .update({ participants: supabase.raw('participants + 1') })
      .eq('id', challengeId);

    return data;
  } catch (error) {
    console.error('Error joining challenge:', error);
    throw error;
  }
}

export async function updateChallengeProgress(
  participationId: string,
  progress: number,
  streak: number
): Promise<ChallengeParticipation> {
  try {
    const { data, error } = await supabase
      .from('challenge_participations')
      .update({
        progress,
        streak,
        last_activity: new Date().toISOString(),
        completed: progress >= 100
      })
      .eq('id', participationId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    throw error;
  }
}

export async function getActiveChallenges(): Promise<HealthChallenge[]> {
  try {
    const { data, error } = await supabase
      .from('health_challenges')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .order('participants', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting active challenges:', error);
    throw error;
  }
}

export async function getUserChallenges(userId: string): Promise<ChallengeParticipation[]> {
  try {
    const { data, error } = await supabase
      .from('challenge_participations')
      .select(`
        *,
        health_challenges!inner(*)
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting user challenges:', error);
    throw error;
  }
}

export async function getHealthFeed(userId: string, limit: number = 20): Promise<HealthPost[]> {
  try {
    // Get posts from user's groups and followed users
    const { data, error } = await supabase
      .from('health_posts')
      .select(`
        *,
        users!inner(name, avatar_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting health feed:', error);
    throw error;
  }
}

export async function searchHealthContent(query: string, type: 'posts' | 'groups' | 'challenges'): Promise<any[]> {
  try {
    let tableName: string;
    let selectFields: string;

    switch (type) {
      case 'posts':
        tableName = 'health_posts';
        selectFields = '*, users!inner(name, avatar_url)';
        break;
      case 'groups':
        tableName = 'health_groups';
        selectFields = '*';
        break;
      case 'challenges':
        tableName = 'health_challenges';
        selectFields = '*';
        break;
      default:
        throw new Error('Invalid search type');
    }

    const { data, error } = await supabase
      .from(tableName)
      .select(selectFields)
      .or(`content.ilike.%${query}%,name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_public', true)
      .limit(20);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error searching health content:', error);
    throw error;
  }
}
