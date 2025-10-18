import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface FreeQuestionUsage {
  user_id: string;
  questions_used: number;
  questions_limit: number;
  last_reset_date: string;
}

export async function getUserFreeQuestions(userId: string): Promise<FreeQuestionUsage> {
  try {
    const { data, error } = await supabase
      .from('user_free_questions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    // If no record exists, create one
    if (!data) {
      const newRecord = {
        user_id: userId,
        questions_used: 0,
        questions_limit: parseInt(process.env.FREE_QUESTIONS_PER_USER || '5'),
        last_reset_date: new Date().toISOString()
      };

      const { data: createdData, error: createError } = await supabase
        .from('user_free_questions')
        .insert(newRecord)
        .select()
        .single();

      if (createError) throw createError;
      return createdData;
    }

    // Check if we need to reset (monthly reset)
    const lastReset = new Date(data.last_reset_date);
    const now = new Date();
    const shouldReset = now.getMonth() !== lastReset.getMonth() || 
                       now.getFullYear() !== lastReset.getFullYear();

    if (shouldReset) {
      const { data: updatedData, error: updateError } = await supabase
        .from('user_free_questions')
        .update({
          questions_used: 0,
          last_reset_date: now.toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedData;
    }

    return data;
  } catch (error) {
    console.error('Error getting user free questions:', error);
    throw error;
  }
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

    const { error } = await supabase
      .from('user_free_questions')
      .update({
        questions_used: usage.questions_used + 1
      })
      .eq('user_id', userId);

    if (error) throw error;

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
