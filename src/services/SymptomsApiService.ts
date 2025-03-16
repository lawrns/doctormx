import { supabase } from '../lib/supabase';
import symptomAnalysisService from './SymptomAnalysisService';
import analyticsService from './AnalyticsService';

// Service for handling all symptom checker API interactions
export interface SymptomCheckerSession {
  id: string;
  user_id?: string;
  started_at: string;
  completed_at?: string;
  method: 'body' | 'ai';
  completed: boolean;
  questionnaire_data?: any;
  answers?: Record<string, any>;
  selected_body_region?: string;
  selected_symptom_id?: string;
  analysis_result?: any;
}

export interface BodyRegion {
  id: string;
  name: string;
  svg_path_id?: string;
  parent_region_id?: string;
  common_symptoms: string[];
}

export interface Symptom {
  id: string;
  name: string;
  description?: string;
  keywords: string[];
  body_regions: string[];
  related_conditions: string[];
  severity_level: number;
  triage_urgency: 'low' | 'medium' | 'high' | 'emergency';
  follow_up_question_ids: string[];
  medical_specialty: string[];
}

export interface Question {
  id: string;
  question_text: string; 
  question_type: 'boolean' | 'scale' | 'multiple_choice' | 'multi_select' | 'text' | 'duration';
  options?: Array<{value: string, label: string}>;
  min_value?: number;
  max_value?: number;
  required: boolean;
  symptom_ids: string[];
  body_region_ids?: string[];
  display_order: number;
  conditional_logic?: {
    dependent_question_id: string;
    display_when_answer: any;
  };
}

export interface AnalysisResult {
  symptom_id: string;
  symptom_name: string;
  body_region: string;
  severity_assessment: 'low' | 'moderate' | 'high';
  urgency_assessment: 'routine' | 'soon' | 'urgent' | 'emergency';
  possible_conditions: Array<{
    name: string;
    probability: 'alta' | 'media' | 'baja';
    description: string;
    icd10_code?: string;
  }>;
  recommended_specialties: string[];
  recommended_tests?: string[];
  self_care_recommendations: string[];
  red_flags_detected: Array<{
    description: string;
    urgency_level: string;
    action: string;
  }>;
  differential_symptoms?: string[];
  patient_context?: {
    age?: number;
    gender?: string;
    relevant_medical_history?: string[];
    medications?: string[];
  };
  created_at: string;
}

// Mock data for body regions
const BODY_REGIONS: BodyRegion[] = [
  {
    id: 'head',
    name: 'Cabeza',
    common_symptoms: ['headache', 'migraine', 'sinusitis', 'vertigo']
  },
  {
    id: 'neck',
    name: 'Cuello',
    common_symptoms: ['sore_throat', 'neck_pain', 'stiff_neck', 'swollen_lymph_nodes']
  },
  {
    id: 'chest',
    name: 'Pecho / Tórax',
    common_symptoms: ['chest_pain', 'shortness_of_breath', 'cough', 'palpitations']
  },
  {
    id: 'abdomen',
    name: 'Abdomen',
    common_symptoms: ['abdominal_pain', 'nausea', 'vomiting', 'diarrhea', 'constipation']
  },
  {
    id: 'back',
    name: 'Espalda',
    common_symptoms: ['back_pain', 'sciatica', 'herniated_disc']
  },
  {
    id: 'left_arm',
    name: 'Brazo izquierdo',
    common_symptoms: ['arm_pain', 'joint_pain', 'muscle_pain', 'numbness', 'weakness']
  },
  {
    id: 'right_arm',
    name: 'Brazo derecho',
    common_symptoms: ['arm_pain', 'joint_pain', 'muscle_pain', 'numbness', 'weakness']
  },
  {
    id: 'left_leg',
    name: 'Pierna izquierda',
    common_symptoms: ['leg_pain', 'joint_pain', 'swelling', 'varicose_veins']
  },
  {
    id: 'right_leg',
    name: 'Pierna derecha',
    common_symptoms: ['leg_pain', 'joint_pain', 'swelling', 'varicose_veins']
  }
];

// Mock data for symptoms
const SYMPTOMS: Symptom[] = [
  {
    id: 'headache',
    name: 'Dolor de cabeza',
    description: 'Dolor o molestia en cualquier parte de la cabeza',
    keywords: ['dolor de cabeza', 'cefalea', 'migraña', 'jaqueca', 'dolor craneal'],
    body_regions: ['head'],
    related_conditions: ['migraine', 'tension_headache', 'sinusitis', 'cluster_headache'],
    severity_level: 3,
    triage_urgency: 'medium',
    follow_up_question_ids: ['headache_location', 'headache_character', 'headache_intensity', 'headache_duration'],
    medical_specialty: ['Neurología', 'Medicina General']
  },
  {
    id: 'chest_pain',
    name: 'Dolor de pecho',
    description: 'Dolor, presión o molestia en cualquier parte del pecho',
    keywords: ['dolor de pecho', 'dolor torácico', 'presión en el pecho', 'angina', 'dolor precordial'],
    body_regions: ['chest'],
    related_conditions: ['angina', 'myocardial_infarction', 'costochondritis', 'gerd'],
    severity_level: 8,
    triage_urgency: 'high',
    follow_up_question_ids: ['chest_pain_character', 'chest_pain_radiation', 'chest_pain_duration', 'chest_pain_triggers'],
    medical_specialty: ['Cardiología', 'Medicina Interna', 'Medicina de Emergencia']
  },
  {
    id: 'abdominal_pain',
    name: 'Dolor abdominal',
    description: 'Dolor o molestia en cualquier parte del abdomen',
    keywords: ['dolor abdominal', 'dolor de estómago', 'dolor de vientre', 'cólico', 'calambres abdominales'],
    body_regions: ['abdomen'],
    related_conditions: ['appendicitis', 'gastritis', 'ibs', 'gastroenteritis', 'pancreatitis'],
    severity_level: 5,
    triage_urgency: 'medium',
    follow_up_question_ids: ['abdominal_pain_location', 'abdominal_pain_character', 'abdominal_pain_timing', 'abdominal_pain_triggers'],
    medical_specialty: ['Gastroenterología', 'Medicina General', 'Cirugía General']
  },
  {
    id: 'back_pain',
    name: 'Dolor de espalda',
    description: 'Dolor o molestia en cualquier parte de la espalda',
    keywords: ['dolor de espalda', 'lumbalgia', 'dorsalgia', 'dolor lumbar', 'dolor cervical'],
    body_regions: ['back'],
    related_conditions: ['muscle_strain', 'herniated_disc', 'sciatica', 'spinal_stenosis', 'arthritis'],
    severity_level: 4,
    triage_urgency: 'medium',
    follow_up_question_ids: ['back_pain_location', 'back_pain_radiation', 'back_pain_triggers', 'back_pain_relief'],
    medical_specialty: ['Traumatología', 'Fisioterapia', 'Medicina General', 'Neurocirugía']
  },
  {
    id: 'sore_throat',
    name: 'Dolor de garganta',
    description: 'Dolor o irritación en la garganta que empeora al tragar',
    keywords: ['dolor de garganta', 'faringitis', 'garganta irritada', 'amigdalitis', 'odinofagia'],
    body_regions: ['neck'],
    related_conditions: ['pharyngitis', 'tonsillitis', 'common_cold', 'strep_throat'],
    severity_level: 3,
    triage_urgency: 'low',
    follow_up_question_ids: ['sore_throat_duration', 'sore_throat_severity', 'sore_throat_associated'],
    medical_specialty: ['Otorrinolaringología', 'Medicina General']
  }
];

// Mock data for questions
const QUESTIONS: Question[] = [
  {
    id: 'headache_location',
    question_text: '¿Dónde se localiza principalmente el dolor de cabeza?',
    question_type: 'multiple_choice',
    options: [
      {value: 'one_side', label: 'Un lado de la cabeza'},
      {value: 'both_sides', label: 'Ambos lados de la cabeza'},
      {value: 'forehead', label: 'Frente'},
      {value: 'back_of_head', label: 'Parte posterior de la cabeza'},
      {value: 'around_eyes', label: 'Alrededor de los ojos'},
      {value: 'entire_head', label: 'Toda la cabeza'}
    ],
    required: true,
    symptom_ids: ['headache', 'migraine'],
    body_region_ids: ['head'],
    display_order: 1
  },
  {
    id: 'headache_character',
    question_text: '¿Cómo describiría la sensación del dolor?',
    question_type: 'multiple_choice',
    options: [
      {value: 'throbbing', label: 'Pulsátil/Palpitante'},
      {value: 'pressure', label: 'Presión/Opresión'},
      {value: 'stabbing', label: 'Punzante'},
      {value: 'tight_band', label: 'Como una banda apretada'},
      {value: 'dull', label: 'Sordo/Continuo'}
    ],
    required: true,
    symptom_ids: ['headache', 'migraine'],
    body_region_ids: ['head'],
    display_order: 2
  },
  {
    id: 'chest_pain_character',
    question_text: '¿Cómo describiría el dolor de pecho?',
    question_type: 'multiple_choice',
    options: [
      {value: 'pressure', label: 'Presión o peso'},
      {value: 'stabbing', label: 'Punzante o agudo'},
      {value: 'burning', label: 'Ardor o quemazón'},
      {value: 'aching', label: 'Dolor sordo'},
      {value: 'tightness', label: 'Opresión o tensión'}
    ],
    required: true,
    symptom_ids: ['chest_pain'],
    body_region_ids: ['chest'],
    display_order: 1
  },
  {
    id: 'chest_pain_radiation',
    question_text: '¿El dolor se irradia o extiende a otras partes del cuerpo?',
    question_type: 'multiple_choice',
    options: [
      {value: 'no', label: 'No'},
      {value: 'left_arm', label: 'Al brazo izquierdo'},
      {value: 'jaw', label: 'Al cuello o mandíbula'},
      {value: 'back', label: 'A la espalda'},
      {value: 'both_arms', label: 'A ambos brazos'}
    ],
    required: true,
    symptom_ids: ['chest_pain'],
    body_region_ids: ['chest'],
    display_order: 2
  },
  {
    id: 'abdominal_pain_location',
    question_text: '¿En qué parte del abdomen siente el dolor principalmente?',
    question_type: 'multiple_choice',
    options: [
      {value: 'upper_central', label: 'Superior central (epigastrio)'},
      {value: 'upper_right', label: 'Superior derecho'},
      {value: 'upper_left', label: 'Superior izquierdo'},
      {value: 'central', label: 'Central (periumbilical)'},
      {value: 'lower_right', label: 'Inferior derecho'},
      {value: 'lower_left', label: 'Inferior izquierdo'},
      {value: 'lower_central', label: 'Inferior central (suprapúbico)'},
      {value: 'diffuse', label: 'Difuso (todo el abdomen)'}
    ],
    required: true,
    symptom_ids: ['abdominal_pain'],
    body_region_ids: ['abdomen'],
    display_order: 1
  }
];

class SymptomsApiService {
  // Initialize a symptom checker session
  async startSession(method: 'body' | 'ai', userId?: string): Promise<SymptomCheckerSession> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const session: SymptomCheckerSession = {
        id: sessionId,
        user_id: userId,
        started_at: new Date().toISOString(),
        method,
        completed: false
      };
      
      // In a real app, save this to the database
      // For now, save to sessionStorage
      sessionStorage.setItem('current_symptom_session', JSON.stringify(session));
      
      // Track in analytics
      analyticsService.trackSymptomCheckerStart(method);
      
      return session;
    } catch (error) {
      console.error('Error starting symptom session:', error);
      throw new Error('Failed to start symptom checker session');
    }
  }

  // Complete a symptom checker session
  async completeSession(sessionId: string, data: any): Promise<SymptomCheckerSession> {
    try {
      // Get the current session
      const sessionJson = sessionStorage.getItem('current_symptom_session');
      if (!sessionJson) {
        throw new Error('No active symptom checker session found');
      }
      
      const session: SymptomCheckerSession = JSON.parse(sessionJson);
      if (session.id !== sessionId) {
        throw new Error('Session ID mismatch');
      }
      
      // Update session data
      const updatedSession: SymptomCheckerSession = {
        ...session,
        completed_at: new Date().toISOString(),
        completed: true,
        ...data
      };
      
      // In a real app, update this in the database
      // For now, update sessionStorage
      sessionStorage.setItem('current_symptom_session', JSON.stringify(updatedSession));
      
      // Track completion in analytics
      analyticsService.trackSymptomCheckerCompletion({
        start_time: session.started_at,
        end_time: updatedSession.completed_at || new Date().toISOString(),
        method: session.method,
        symptom_id: data.selected_symptom_id || 'unknown',
        symptom_name: data.analysis_result?.symptom_name || 'Unknown',
        completed: true
      });
      
      return updatedSession;
    } catch (error) {
      console.error('Error completing symptom session:', error);
      throw new Error('Failed to complete symptom checker session');
    }
  }

  // Get all body regions
  async getBodyRegions(): Promise<BodyRegion[]> {
    try {
      // In a real app, fetch from the database
      // For now, return mock data
      return BODY_REGIONS;
    } catch (error) {
      console.error('Error fetching body regions:', error);
      throw new Error('Failed to fetch body regions');
    }
  }

  // Get symptoms by body region
  async getSymptomsByBodyRegion(bodyRegion: string): Promise<Symptom[]> {
    try {
      // In a real app, fetch from the database
      // For now, filter mock data
      return SYMPTOMS.filter(symptom => symptom.body_regions.includes(bodyRegion));
    } catch (error) {
      console.error('Error fetching symptoms by body region:', error);
      throw new Error('Failed to fetch symptoms');
    }
  }

  // Get all symptoms
  async getAllSymptoms(): Promise<Symptom[]> {
    try {
      // In a real app, fetch from the database
      return SYMPTOMS;
    } catch (error) {
      console.error('Error fetching all symptoms:', error);
      throw new Error('Failed to fetch symptoms');
    }
  }

  // Get symptom by ID
  async getSymptomById(symptomId: string): Promise<Symptom | null> {
    try {
      // In a real app, fetch from the database
      const symptom = SYMPTOMS.find(s => s.id === symptomId);
      return symptom || null;
    } catch (error) {
      console.error('Error fetching symptom by ID:', error);
      throw new Error('Failed to fetch symptom');
    }
  }

  // Get questions for a specific symptom
  async getQuestionsForSymptom(symptomId: string): Promise<Question[]> {
    try {
      // In a real app, fetch from the database
      const symptom = await this.getSymptomById(symptomId);
      if (!symptom) {
        throw new Error('Symptom not found');
      }
      
      // Filter questions by symptom ID and sort by display order
      const questions = QUESTIONS.filter(q => q.symptom_ids.includes(symptomId))
        .sort((a, b) => a.display_order - b.display_order);
      
      return questions;
    } catch (error) {
      console.error('Error fetching questions for symptom:', error);
      throw new Error('Failed to fetch questions');
    }
  }

  // Analyze symptoms based on answers
  async analyzeSymptoms(
    symptomId: string,
    answers: Record<string, any>,
    patientInfo?: { age?: number; gender?: string }
  ): Promise<AnalysisResult> {
    try {
      // Use the symptom analysis service
      const analysis = await symptomAnalysisService.analyzeSymptoms(
        symptomId,
        answers,
        patientInfo
      );
      
      // Format the result
      const result: AnalysisResult = {
        symptom_id: symptomId,
        symptom_name: SYMPTOMS.find(s => s.id === symptomId)?.name || 'Unknown Symptom',
        body_region: SYMPTOMS.find(s => s.id === symptomId)?.body_regions[0] || 'unknown',
        severity_assessment: analysis.severityAssessment,
        urgency_assessment: analysis.urgencyAssessment,
        possible_conditions: analysis.possibleConditions,
        recommended_specialties: analysis.recommendedSpecialties,
        recommended_tests: analysis.recommendedTests,
        self_care_recommendations: analysis.selfCareRecommendations,
        red_flags_detected: analysis.redFlagsDetected,
        patient_context: patientInfo ? {
          age: patientInfo.age,
          gender: patientInfo.gender
        } : undefined,
        created_at: new Date().toISOString()
      };
      
      // Track analysis in analytics
      analyticsService.trackAnalysisComplete(result);
      
      // Save to session storage for persistence
      sessionStorage.setItem('symptom_analysis_result', JSON.stringify(result));
      
      return result;
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw new Error('Failed to analyze symptoms');
    }
  }

  // Save user feedback on analysis
  async saveUserFeedback(analysisId: string, feedback: {
    was_helpful: boolean;
    comments?: string;
    eventual_diagnosis?: string;
  }): Promise<void> {
    try {
      // In a real app, save to the database
      console.log('Saving user feedback:', { analysisId, feedback });
      
      // Track in analytics
      analyticsService.trackEvent('analysis_feedback', {
        analysis_id: analysisId,
        ...feedback
      });
    } catch (error) {
      console.error('Error saving user feedback:', error);
      throw new Error('Failed to save feedback');
    }
  }

  // Get user's recent symptom history
  async getUserSymptomHistory(userId: string): Promise<AnalysisResult[]> {
    try {
      // In a real app, fetch from the database
      // For now, mock an empty history
      return [];
    } catch (error) {
      console.error('Error fetching user symptom history:', error);
      throw new Error('Failed to fetch symptom history');
    }
  }

  // Search for symptoms by keyword
  async searchSymptoms(keyword: string): Promise<Symptom[]> {
    try {
      // Simple search implementation
      const normalizedKeyword = keyword.toLowerCase().trim();
      
      if (!normalizedKeyword) {
        return [];
      }
      
      return SYMPTOMS.filter(symptom => 
        symptom.name.toLowerCase().includes(normalizedKeyword) ||
        symptom.keywords.some(k => k.toLowerCase().includes(normalizedKeyword)) ||
        (symptom.description && symptom.description.toLowerCase().includes(normalizedKeyword))
      );
    } catch (error) {
      console.error('Error searching symptoms:', error);
      throw new Error('Failed to search symptoms');
    }
  }

  // Detect symptom from free text description
  async detectSymptomsFromText(text: string): Promise<{
    detectedSymptoms: Symptom[];
    confidence: number;
  }> {
    try {
      // Simple keyword matching implementation
      // In a real app, this would use NLP or machine learning
      const normalizedText = text.toLowerCase();
      const matchedSymptoms: Symptom[] = [];
      
      for (const symptom of SYMPTOMS) {
        // Check if any of the symptom keywords are in the text
        const matches = symptom.keywords.filter(keyword => 
          normalizedText.includes(keyword.toLowerCase())
        );
        
        if (matches.length > 0) {
          matchedSymptoms.push(symptom);
        }
      }
      
      // Calculate a simple confidence score based on the number of matching keywords
      const confidence = matchedSymptoms.length > 0 ? 0.7 : 0.3;
      
      return {
        detectedSymptoms: matchedSymptoms,
        confidence
      };
    } catch (error) {
      console.error('Error detecting symptoms from text:', error);
      throw new Error('Failed to detect symptoms');
    }
  }
}

// Create singleton instance
const symptomsApiService = new SymptomsApiService();
export default symptomsApiService;