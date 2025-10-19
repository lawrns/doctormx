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

export interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author_name?: string;
  author_email?: string;
  is_anonymous: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  moderation_notes?: string;
  moderated_by?: string;
  moderated_at?: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  content: string;
  author_name?: string;
  author_email?: string;
  is_anonymous: boolean;
  is_verified_doctor: boolean;
  doctor_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  moderation_notes?: string;
  moderated_by?: string;
  moderated_at?: string;
  likes_count: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
}

export interface CreateQuestionRequest {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  author_name?: string;
  author_email?: string;
  is_anonymous?: boolean;
}

export interface CreateAnswerRequest {
  question_id: string;
  content: string;
  author_name?: string;
  author_email?: string;
  is_anonymous?: boolean;
  is_verified_doctor?: boolean;
  doctor_id?: string;
}

export interface LikeRequest {
  question_id?: string;
  answer_id?: string;
  user_ip?: string;
  user_agent?: string;
}

export interface HelpfulRequest {
  answer_id: string;
  helpful: boolean;
  user_ip?: string;
  user_agent?: string;
}

/**
 * Get all approved questions with pagination
 */
export async function getQuestions(
  page: number = 1,
  limit: number = 20,
  category?: string,
  search?: string
): Promise<{ questions: Question[]; total: number }> {
  try {
    const supabaseClient = getSupabaseClient();
    const offset = (page - 1) * limit;
    
    let query = supabaseClient
      .from('public_questions')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error getting questions:', error);
      throw new Error('Error al obtener las preguntas');
    }

    return {
      questions: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error in getQuestions:', error);
    throw error;
  }
}

/**
 * Get a single question with its answers
 */
export async function getQuestionWithAnswers(questionId: string): Promise<QuestionWithAnswers | null> {
  try {
    const supabaseClient = getSupabaseClient();
    
    // Get question
    const { data: question, error: questionError } = await supabaseClient
      .from('public_questions')
      .select('*')
      .eq('id', questionId)
      .eq('status', 'approved')
      .single();

    if (questionError || !question) {
      return null;
    }

    // Get answers
    const { data: answers, error: answersError } = await supabaseClient
      .from('public_answers')
      .select('*')
      .eq('question_id', questionId)
      .eq('status', 'approved')
      .order('helpful_count', { ascending: false })
      .order('created_at', { ascending: true });

    if (answersError) {
      console.error('Error getting answers:', answersError);
      // Return question without answers if there's an error
      return { ...question, answers: [] };
    }

    return {
      ...question,
      answers: answers || []
    };
  } catch (error) {
    console.error('Error in getQuestionWithAnswers:', error);
    throw error;
  }
}

/**
 * Create a new question
 */
export async function createQuestion(questionData: CreateQuestionRequest): Promise<Question> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('public_questions')
      .insert({
        title: questionData.title,
        content: questionData.content,
        category: questionData.category || 'general',
        tags: questionData.tags || [],
        author_name: questionData.author_name,
        author_email: questionData.author_email,
        is_anonymous: questionData.is_anonymous !== false, // Default to true
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      throw new Error('Error al crear la pregunta');
    }

    return data;
  } catch (error) {
    console.error('Error in createQuestion:', error);
    throw error;
  }
}

/**
 * Create a new answer
 */
export async function createAnswer(answerData: CreateAnswerRequest): Promise<Answer> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('public_answers')
      .insert({
        question_id: answerData.question_id,
        content: answerData.content,
        author_name: answerData.author_name,
        author_email: answerData.author_email,
        is_anonymous: answerData.is_anonymous !== false, // Default to true
        is_verified_doctor: answerData.is_verified_doctor || false,
        doctor_id: answerData.doctor_id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating answer:', error);
      throw new Error('Error al crear la respuesta');
    }

    return data;
  } catch (error) {
    console.error('Error in createAnswer:', error);
    throw error;
  }
}

/**
 * Like a question or answer
 */
export async function likeItem(likeData: LikeRequest): Promise<{ success: boolean; message: string }> {
  try {
    const supabaseClient = getSupabaseClient();
    
    if (likeData.question_id) {
      const { error } = await supabaseClient
        .from('question_likes')
        .insert({
          question_id: likeData.question_id,
          user_ip: likeData.user_ip,
          user_agent: likeData.user_agent
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { success: false, message: 'Ya has dado like a esta pregunta' };
        }
        throw error;
      }

      return { success: true, message: 'Like agregado exitosamente' };
    }

    if (likeData.answer_id) {
      const { error } = await supabaseClient
        .from('answer_likes')
        .insert({
          answer_id: likeData.answer_id,
          user_ip: likeData.user_ip,
          user_agent: likeData.user_agent
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { success: false, message: 'Ya has dado like a esta respuesta' };
        }
        throw error;
      }

      return { success: true, message: 'Like agregado exitosamente' };
    }

    throw new Error('Debe especificar question_id o answer_id');
  } catch (error) {
    console.error('Error in likeItem:', error);
    throw error;
  }
}

/**
 * Rate an answer as helpful or not helpful
 */
export async function rateAnswerHelpful(helpfulData: HelpfulRequest): Promise<{ success: boolean; message: string }> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { error } = await supabaseClient
      .from('answer_helpful')
      .upsert({
        answer_id: helpfulData.answer_id,
        user_ip: helpfulData.user_ip,
        user_agent: helpfulData.user_agent,
        helpful: helpfulData.helpful
      });

    if (error) {
      console.error('Error rating answer helpful:', error);
      throw new Error('Error al calificar la respuesta');
    }

    return { 
      success: true, 
      message: helpfulData.helpful ? 'Respuesta marcada como útil' : 'Respuesta marcada como no útil' 
    };
  } catch (error) {
    console.error('Error in rateAnswerHelpful:', error);
    throw error;
  }
}

/**
 * Increment view count for a question
 */
export async function incrementQuestionViews(questionId: string): Promise<void> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { error } = await supabaseClient.rpc('increment_question_views', {
      question_uuid: questionId
    });

    if (error) {
      console.error('Error incrementing views:', error);
      // Don't throw error for view count failures
    }
  } catch (error) {
    console.error('Error in incrementQuestionViews:', error);
    // Don't throw error for view count failures
  }
}

/**
 * Get categories for filtering
 */
export async function getCategories(): Promise<string[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('public_questions')
      .select('category')
      .eq('status', 'approved')
      .not('category', 'is', null);

    if (error) {
      console.error('Error getting categories:', error);
      return ['general'];
    }

    const categories = [...new Set(data?.map(item => item.category) || [])];
    return categories.length > 0 ? categories : ['general'];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return ['general'];
  }
}

/**
 * Get popular tags
 */
export async function getPopularTags(limit: number = 20): Promise<string[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('public_questions')
      .select('tags')
      .eq('status', 'approved')
      .not('tags', 'is', null);

    if (error) {
      console.error('Error getting tags:', error);
      return [];
    }

    const allTags = data?.flatMap(item => item.tags || []) || [];
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag);
  } catch (error) {
    console.error('Error in getPopularTags:', error);
    return [];
  }
}

/**
 * Moderate a question (admin/moderator only)
 */
export async function moderateQuestion(
  questionId: string, 
  status: 'approved' | 'rejected' | 'archived',
  notes?: string,
  moderatorId?: string
): Promise<void> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { error } = await supabaseClient
      .from('public_questions')
      .update({
        status,
        moderation_notes: notes,
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString()
      })
      .eq('id', questionId);

    if (error) {
      console.error('Error moderating question:', error);
      throw new Error('Error al moderar la pregunta');
    }
  } catch (error) {
    console.error('Error in moderateQuestion:', error);
    throw error;
  }
}

/**
 * Moderate an answer (admin/moderator only)
 */
export async function moderateAnswer(
  answerId: string, 
  status: 'approved' | 'rejected' | 'archived',
  notes?: string,
  moderatorId?: string
): Promise<void> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { error } = await supabaseClient
      .from('public_answers')
      .update({
        status,
        moderation_notes: notes,
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString()
      })
      .eq('id', answerId);

    if (error) {
      console.error('Error moderating answer:', error);
      throw new Error('Error al moderar la respuesta');
    }
  } catch (error) {
    console.error('Error in moderateAnswer:', error);
    throw error;
  }
}
