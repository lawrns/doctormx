// Educational Content API - Supabase implementation

import { supabase } from '../supabaseClient';
import { getPatientId, getDoctorId } from '../auth/utils';

// Types
export interface EducationalContentItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  timeToRead: number; // minutes
  imageUrl?: string;
  recommendedBy?: string;
  saved: boolean;
  url: string;
}

// Get recommended educational content for a patient
export const getPatientEducationalContent = async (): Promise<EducationalContentItem[]> => {
  try {
    const patientId = await getPatientId();
    
    // Get content recommended by the patient's doctors
    const { data: recommendations, error: recommendationsError } = await supabase
      .from('doctor_content_recommendations')
      .select(`
        content_id,
        doctors:doctor_id (
          name
        ),
        educational_content!inner (
          id,
          title,
          excerpt,
          category,
          time_to_read,
          image_url,
          is_published
        )
      `)
      .eq('patient_id', patientId)
      .eq('educational_content.is_published', true)
      .order('created_at', { ascending: false });
    
    if (recommendationsError) throw recommendationsError;
    
    // Get saved status for all content
    const { data: savedContent, error: savedContentError } = await supabase
      .from('saved_educational_content')
      .select('content_id')
      .eq('patient_id', patientId);
      
    if (savedContentError) throw savedContentError;
    
    // Create a set of saved content IDs for quick lookup
    const savedContentIds = new Set(savedContent?.map(item => item.content_id) || []);
    
    // Transform the data to match our interface
    const contentItems = recommendations.map(rec => ({
      id: rec.educational_content.id,
      title: rec.educational_content.title,
      excerpt: rec.educational_content.excerpt,
      category: rec.educational_content.category,
      timeToRead: rec.educational_content.time_to_read,
      imageUrl: rec.educational_content.image_url,
      recommendedBy: rec.doctors.name,
      saved: savedContentIds.has(rec.content_id),
      url: `/contenido/${rec.educational_content.id}`
    }));
    
    return contentItems;
  } catch (error) {
    console.error('Error fetching educational content:', error);
    throw error;
  }
};

// Toggle saved status for educational content
export const toggleSaveContent = async (contentId: string, saved: boolean): Promise<void> => {
  try {
    const patientId = await getPatientId();
    
    if (saved) {
      // Save the content
      const { error } = await supabase
        .from('saved_educational_content')
        .insert({
          id: crypto.randomUUID(),
          content_id: contentId,
          patient_id: patientId,
          saved_at: new Date().toISOString()
        });
        
      if (error) throw error;
    } else {
      // Remove the saved content
      const { error } = await supabase
        .from('saved_educational_content')
        .delete()
        .eq('content_id', contentId)
        .eq('patient_id', patientId);
        
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error toggling save status:', error);
    throw error;
  }
};

// Get educational content by category
export const getEducationalContentByCategory = async (category?: string): Promise<EducationalContentItem[]> => {
  try {
    const patientId = await getPatientId();
    
    // Build query for educational content
    let query = supabase
      .from('educational_content')
      .select(`
        id,
        title,
        excerpt,
        category,
        time_to_read,
        image_url,
        author_id,
        doctors:author_id (
          name
        )
      `)
      .eq('is_published', true);
      
    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    // Execute query
    const { data: content, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Get saved status for all content
    const { data: savedContent, error: savedContentError } = await supabase
      .from('saved_educational_content')
      .select('content_id')
      .eq('patient_id', patientId);
      
    if (savedContentError) throw savedContentError;
    
    // Create a set of saved content IDs for quick lookup
    const savedContentIds = new Set(savedContent?.map(item => item.content_id) || []);
    
    // Transform the data to match our interface
    return content.map(item => ({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      category: item.category,
      timeToRead: item.time_to_read,
      imageUrl: item.image_url,
      recommendedBy: item.doctors ? item.doctors.name : undefined,
      saved: savedContentIds.has(item.id),
      url: `/contenido/${item.id}`
    }));
  } catch (error) {
    console.error('Error fetching educational content by category:', error);
    throw error;
  }
};
