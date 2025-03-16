import { supabase } from '../supabase';
import type { BodyRegion } from '../../machines/questionnaireMachine';

export interface Symptom {
  id: string;
  name: string;
  description?: string;
  body_region: string;
  severity_level: number;
  duration_relevance: boolean;
  age_specific: boolean;
  gender_specific: boolean;
  follow_up_questions: any[];
}

export interface SymptomQuestion {
  id: string;
  symptom_id: string;
  question_text: string;
  order: number;
  question_type: 'boolean' | 'scale' | 'multiple_choice' | 'duration';
  options?: any[];
  conditional_logic?: any;
}

// Get symptoms by body region
export async function getSymptomsByRegion(bodyRegion: BodyRegion) {
  try {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('body_region', bodyRegion)
      .order('severity_level', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    throw new Error('Failed to load symptoms for the selected body region');
  }
}

// Get questions for a specific symptom
export async function getSymptomQuestions(symptomId: string) {
  try {
    const { data, error } = await supabase
      .from('symptom_questions')
      .select('*')
      .eq('symptom_id', symptomId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw new Error('Failed to load questions for the selected symptom');
  }
}

// Save symptom check results
export async function saveSymptomCheck(checkData: {
  user_id: string;
  symptom_id: string;
  severity_level: number;
  answers: Record<string, any>;
}) {
  try {
    const { data, error } = await supabase
      .from('user_symptom_checks')
      .insert([checkData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving symptom check:', error);
    throw new Error('Failed to save symptom check results');
  }
}