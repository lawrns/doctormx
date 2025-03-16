// Community Groups API - Supabase implementation

import { supabase } from '../supabaseClient';
import { getPatientId, getDoctorId } from '../auth/utils';

// Types
export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  imageUrl?: string;
  category: string;
  isJoined: boolean;
  unreadCount?: number;
}

// Get community groups for a patient
export const getPatientCommunityGroups = async (): Promise<CommunityGroup[]> => {
  try {
    const patientId = await getPatientId();
    
    // Get groups the patient is a member of
    const { data: memberships, error: membershipsError } = await supabase
      .from('community_group_members')
      .select(`
        id,
        group_id,
        role,
        community_groups!inner (
          id,
          name,
          description,
          category,
          image_url
        )
      `)
      .eq('user_id', patientId)
      .eq('user_type', 'patient');
      
    if (membershipsError) throw membershipsError;
    
    if (!memberships || memberships.length === 0) {
      return [];
    }
    
    // Get group IDs
    const groupIds = memberships.map(m => m.group_id);
    
    // Get member counts for each group
    const { data: memberCounts, error: memberCountsError } = await supabase
      .from('community_group_members')
      .select('group_id, count')
      .in('group_id', groupIds)
      .group('group_id');
      
    if (memberCountsError) throw memberCountsError;
    
    // Convert member counts to a Map for quick lookup
    const memberCountMap = new Map<string, number>();
    memberCounts.forEach(item => {
      memberCountMap.set(item.group_id, parseInt(item.count));
    });
    
    // Get unread post counts
    // In a real application, this would involve tracking which posts a user has read
    // and comparing against all posts in the group
    const unreadCountMap = new Map<string, number>();
    groupIds.forEach(groupId => {
      // Mock data - in a real app this would be calculated
      unreadCountMap.set(groupId, Math.floor(Math.random() * 5));
    });
    
    // Transform the data
    return memberships.map(membership => ({
      id: membership.community_groups.id,
      name: membership.community_groups.name,
      description: membership.community_groups.description,
      category: membership.community_groups.category,
      imageUrl: membership.community_groups.image_url,
      memberCount: memberCountMap.get(membership.group_id) || 0,
      isJoined: true,
      unreadCount: unreadCountMap.get(membership.group_id) || 0
    }));
  } catch (error) {
    console.error('Error fetching community groups:', error);
    throw error;
  }
};

// Join a community group
export const joinCommunityGroup = async (groupId: string): Promise<void> => {
  try {
    const patientId = await getPatientId();
    
    // Check if already a member
    const { data: existing, error: checkError } = await supabase
      .from('community_group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', patientId)
      .eq('user_type', 'patient');
      
    if (checkError) throw checkError;
    
    // If already a member, do nothing
    if (existing && existing.length > 0) {
      return;
    }
    
    // Join the group
    const { error } = await supabase
      .from('community_group_members')
      .insert({
        id: crypto.randomUUID(),
        group_id: groupId,
        user_id: patientId,
        user_type: 'patient',
        role: 'member',
        joined_at: new Date().toISOString()
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Error joining community group:', error);
    throw error;
  }
};

// Leave a community group
export const leaveCommunityGroup = async (groupId: string): Promise<void> => {
  try {
    const patientId = await getPatientId();
    
    // Leave the group
    const { error } = await supabase
      .from('community_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', patientId)
      .eq('user_type', 'patient');
      
    if (error) throw error;
  } catch (error) {
    console.error('Error leaving community group:', error);
    throw error;
  }
};

// Get all available community groups
export const getAllCommunityGroups = async (): Promise<CommunityGroup[]> => {
  try {
    const patientId = await getPatientId();
    
    // Get all public groups
    const { data: groups, error: groupsError } = await supabase
      .from('community_groups')
      .select('id, name, description, category, image_url, created_at')
      .eq('is_public', true)
      .order('name');
      
    if (groupsError) throw groupsError;
    
    if (!groups || groups.length === 0) {
      return [];
    }
    
    // Get member counts for each group
    const { data: memberCounts, error: memberCountsError } = await supabase
      .from('community_group_members')
      .select('group_id, count')
      .in('group_id', groups.map(g => g.id))
      .group('group_id');
      
    if (memberCountsError) throw memberCountsError;
    
    // Convert member counts to a Map for quick lookup
    const memberCountMap = new Map<string, number>();
    memberCounts.forEach(item => {
      memberCountMap.set(item.group_id, parseInt(item.count));
    });
    
    // Check which groups the user is a member of
    const { data: memberships, error: membershipsError } = await supabase
      .from('community_group_members')
      .select('group_id')
      .eq('user_id', patientId)
      .eq('user_type', 'patient')
      .in('group_id', groups.map(g => g.id));
      
    if (membershipsError) throw membershipsError;
    
    // Convert memberships to a Set for quick lookup
    const userGroups = new Set(memberships?.map(m => m.group_id) || []);
    
    // Transform the data
    return groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      category: group.category,
      imageUrl: group.image_url,
      memberCount: memberCountMap.get(group.id) || 0,
      isJoined: userGroups.has(group.id),
      unreadCount: userGroups.has(group.id) ? Math.floor(Math.random() * 5) : undefined
    }));
  } catch (error) {
    console.error('Error fetching all community groups:', error);
    throw error;
  }
};
