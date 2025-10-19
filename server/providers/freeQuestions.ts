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

export interface FreeQuestionUsage {
  user_id: string;
  questions_used: number;
  questions_limit: number;
  last_reset_date: string;
}

// In-memory fallback for free questions when database is not accessible
const inMemoryFreeQuestions = new Map<string, { questions_used: number; last_reset_date: string }>();

export async function getUserFreeQuestions(userId: string): Promise<FreeQuestionUsage> {
  try {
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('user_free_questions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error getting user free questions:', error);
      // Fall back to in-memory storage
      return getInMemoryFreeQuestions(userId);
    }

    // If no record exists, create one
    if (!data) {
      const newRecord = {
        user_id: userId,
        questions_used: 0,
        questions_limit: parseInt(process.env.FREE_QUESTIONS_PER_USER || '5'),
        last_reset_date: new Date().toISOString()
      };

      const { data: createdData, error: createError } = await supabaseClient
        .from('user_free_questions')
        .insert(newRecord)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user free questions:', createError);
        // Fall back to in-memory storage
        return getInMemoryFreeQuestions(userId);
      }
      return createdData;
    }

    // Check if we need to reset (monthly reset)
    const lastReset = new Date(data.last_reset_date);
    const now = new Date();
    const shouldReset = now.getMonth() !== lastReset.getMonth() || 
                       now.getFullYear() !== lastReset.getFullYear();

    if (shouldReset) {
      const { data: updatedData, error: updateError } = await supabaseClient
        .from('user_free_questions')
        .update({
          questions_used: 0,
          last_reset_date: now.toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error resetting user free questions:', updateError);
        // Fall back to in-memory storage
        return getInMemoryFreeQuestions(userId);
      }
      return updatedData;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserFreeQuestions:', error);
    // Fall back to in-memory storage
    return getInMemoryFreeQuestions(userId);
  }
}

function getInMemoryFreeQuestions(userId: string): FreeQuestionUsage {
  const now = new Date();
  const stored = inMemoryFreeQuestions.get(userId);
  
  if (!stored) {
    const newRecord = {
      user_id: userId,
      questions_used: 0,
      questions_limit: parseInt(process.env.FREE_QUESTIONS_PER_USER || '5'),
      last_reset_date: now.toISOString()
    };
    inMemoryFreeQuestions.set(userId, { questions_used: 0, last_reset_date: now.toISOString() });
    return newRecord;
  }

  // Check if monthly reset is needed
  const lastReset = new Date(stored.last_reset_date);
  const shouldReset = now.getMonth() !== lastReset.getMonth() || 
                     now.getFullYear() !== lastReset.getFullYear();

  if (shouldReset) {
    stored.questions_used = 0;
    stored.last_reset_date = now.toISOString();
    inMemoryFreeQuestions.set(userId, stored);
  }

  return {
    user_id: userId,
    questions_used: stored.questions_used,
    questions_limit: parseInt(process.env.FREE_QUESTIONS_PER_USER || '5'),
    last_reset_date: stored.last_reset_date
  };
}

export async function useFreeQuestion(userId: string): Promise<{ success: boolean; remaining: number; message: string }> {
  try {
    const usage = await getUserFreeQuestions(userId);

    if (usage.questions_used >= usage.questions_limit) {
      return {
        success: false,
        remaining: 0,
        message: `Has agotado tus ${usage.questions_limit} preguntas gratuitas este mes. Las preguntas se renuevan automáticamente cada mes.`
      };
    }

    // Try database update first
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from('user_free_questions')
        .update({
          questions_used: usage.questions_used + 1
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (dbError) {
      console.error('Database update failed, using in-memory:', dbError);
      // Fall back to in-memory update
      const stored = inMemoryFreeQuestions.get(userId);
      if (stored) {
        stored.questions_used += 1;
        inMemoryFreeQuestions.set(userId, stored);
      }
    }

    const remaining = usage.questions_limit - (usage.questions_used + 1);
    return {
      success: true,
      remaining,
      message: remaining > 0 
        ? `Pregunta gratuita utilizada. Te quedan ${remaining} preguntas gratis este mes.`
        : 'Has utilizado tu última pregunta gratuita este mes. Las preguntas se renuevan automáticamente cada mes.'
    };
  } catch (error) {
    console.error('Error using free question:', error);
    throw error;
  }
}

export async function checkFreeQuestionEligibility(userId: string): Promise<{ eligible: boolean; remaining: number; message: string }> {
  try {
    const usage = await getUserFreeQuestions(userId);
    const remaining = usage.questions_limit - usage.questions_used;
    
    return {
      eligible: remaining > 0,
      remaining,
      message: remaining > 0 
        ? `Tienes ${remaining} preguntas gratuitas disponibles este mes.`
        : `Has agotado tus ${usage.questions_limit} preguntas gratuitas este mes. Las preguntas se renuevan automáticamente cada mes.`
    };
  } catch (error) {
    console.error('Error checking free question eligibility:', error);
    throw error;
  }
}
