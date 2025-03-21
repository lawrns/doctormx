/**
 * Lazy-loading version of the questionnaire machine
 * This prevents the immediate execution of xstate imports during module load
 */
import { z } from 'zod';
import { ensureDependenciesLoaded } from '../lib/dependency-loader';

// Validation schemas
export const AnswerSchema = z.union([
  z.boolean(),
  z.number(),
  z.string(),
  z.array(z.string()),
  z.object({}).passthrough(),
]);

export const QuestionSchema = z.object({
  id: z.string(),
  question_text: z.string(),
  question_type: z.enum([
    'boolean',
    'scale',
    'multiple_choice',
    'multi_select',
    'duration',
    'text',
    'textarea',
    'numeric',
    'date',
    'time',
    'range',
    'select',
    'radio',
    'checkbox'
  ]),
  options: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  depends_on: z.string().optional(),
  depends_value: z.any().optional(),
  required: z.boolean().optional(),
  help_text: z.string().optional(),
  validation_rules: z.record(z.any()).optional(),
  skip_logic: z.record(z.any()).optional()
});

export const SymptomSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  body_region: z.string(),
  severity_level: z.number(),
  duration_relevance: z.boolean().optional(),
  age_specific: z.boolean().optional(),
  gender_specific: z.boolean().optional(),
  follow_up_questions: z.array(z.any()).optional()
});

// Types
export type Answer = z.infer<typeof AnswerSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Symptom = z.infer<typeof SymptomSchema>;

// Valid body regions
export const VALID_BODY_REGIONS = [
  'head',
  'neck',
  'chest',
  'abdomen',
  'left_arm',
  'right_arm',
  'left_forearm',
  'right_forearm',
  'left_leg',
  'right_leg',
  'left_lower_leg',
  'right_lower_leg'
] as const;

export type BodyRegion = typeof VALID_BODY_REGIONS[number];

export interface QuestionnaireContext {
  bodyRegion: BodyRegion | null;
  symptoms: Symptom[];
  selectedSymptom: Symptom | null;
  currentQuestion: Question | null;
  questions: Question[];
  answers: Record<string, Answer>;
  currentQuestionIndex: number;
  error: string | null;
  isLoading: boolean;
}

export type QuestionnaireEvent =
  | { type: 'SELECT_BODY_REGION'; region: BodyRegion }
  | { type: 'SELECT_SYMPTOM'; symptom: Symptom }
  | { type: 'LOAD_QUESTIONS' }
  | { type: 'ANSWER_QUESTION'; questionId: string; answer: Answer }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'COMPLETE' }
  | { type: 'RESET' }
  | { type: 'ERROR'; message: string };

export const initialContext: QuestionnaireContext = {
  bodyRegion: null,
  symptoms: [],
  selectedSymptom: null,
  currentQuestion: null,
  questions: [],
  answers: {},
  currentQuestionIndex: 0,
  error: null,
  isLoading: false
};

// Helper function to validate body region
export const isValidBodyRegion = (region: string): region is BodyRegion => {
  return VALID_BODY_REGIONS.includes(region as BodyRegion);
};

// Create a lazy-loaded machine factory to be used at runtime
// This prevents the immediate execution of xstate imports during module load
export async function createQuestionnaireMachine() {
  try {
    // Wait for dependencies to be loaded
    await ensureDependenciesLoaded();

    // Dynamic import xstate after dependencies have been loaded
    const { createMachine, assign } = await import('../shims/xstate-shim');

    return createMachine({
      id: 'questionnaire',
      initial: 'idle',
      context: initialContext,
      states: {
        idle: {
          on: {
            SELECT_BODY_REGION: [{
              target: 'loadingSymptoms',
              guard: (_, event) => Boolean(event.region) && isValidBodyRegion(event.region),
              actions: assign({
                bodyRegion: (_, event) => {
                  if (!event.region || !isValidBodyRegion(event.region)) {
                    throw new Error(`Invalid body region: ${event.region}`);
                  }
                  return event.region;
                },
                isLoading: (_) => true,
                error: (_) => null
              })
            }, {
              target: 'error',
              actions: assign({
                error: (_, event) => `Invalid body region selected: ${event.region}`,
                isLoading: (_) => false
              })
            }]
          }
        },
        loadingSymptoms: {
          invoke: {
            src: 'loadSymptoms',
            onDone: {
              target: 'selectingSymptom',
              actions: assign({
                symptoms: (_, event) => event.data || [],
                isLoading: (_) => false,
                error: (_) => null
              })
            },
            onError: {
              target: 'error',
              actions: assign({
                error: (_, event) => event.data?.message || 'Failed to load symptoms. Please try again.',
                isLoading: (_) => false
              })
            }
          }
        },
        selectingSymptom: {
          on: {
            SELECT_SYMPTOM: [{
              target: 'loadingQuestions',
              guard: (_, event) => Boolean(event.symptom?.id && event.symptom?.body_region),
              actions: assign({
                selectedSymptom: (_, event) => {
                  if (!event.symptom?.id || !event.symptom?.body_region) {
                    throw new Error('Invalid symptom selection');
                  }
                  return event.symptom;
                },
                isLoading: (_) => true,
                error: (_) => null
              })
            }, {
              target: 'error',
              actions: assign({
                error: (_) => 'Invalid symptom selected. Please try again.',
                isLoading: (_) => false
              })
            }],
            RESET: {
              target: 'idle',
              actions: assign(initialContext)
            }
          }
        },
        loadingQuestions: {
          invoke: {
            src: 'loadQuestions',
            onDone: {
              target: 'answering',
              actions: assign({
                questions: (_, event) => event.data || [],
                currentQuestion: (_, event) => event.data[0] || null,
                isLoading: (_) => false,
                error: (_) => null
              })
            },
            onError: {
              target: 'error',
              actions: assign({
                error: (_, event) => event.data?.message || 'Failed to load questions. Please try again.',
                isLoading: (_) => false
              })
            }
          }
        },
        answering: {
          on: {
            ANSWER_QUESTION: {
              actions: [
                assign({
                  answers: (context, event) => {
                    if (!event.questionId || event.answer === undefined) {
                      throw new Error('Invalid answer data');
                    }
                    return {
                      ...context.answers,
                      [event.questionId]: event.answer
                    };
                  }
                }),
                'validateAnswer'
              ]
            },
            NEXT_QUESTION: [{
              target: 'complete',
              guard: (context) => context.currentQuestionIndex === context.questions.length - 1,
              actions: assign({
                currentQuestionIndex: (context) => context.currentQuestionIndex + 1
              })
            }, {
              target: 'answering',
              actions: assign({
                currentQuestionIndex: (context) => context.currentQuestionIndex + 1,
                currentQuestion: (context) => context.questions[context.currentQuestionIndex + 1]
              })
            }],
            PREVIOUS_QUESTION: [{
              target: 'selectingSymptom',
              guard: (context) => context.currentQuestionIndex === 0
            }, {
              target: 'answering',
              actions: assign({
                currentQuestionIndex: (context) => context.currentQuestionIndex - 1,
                currentQuestion: (context) => context.questions[context.currentQuestionIndex - 1]
              })
            }],
            RESET: {
              target: 'idle',
              actions: assign(initialContext)
            }
          }
        },
        complete: {
          on: {
            RESET: {
              target: 'idle',
              actions: assign(initialContext)
            }
          }
        },
        error: {
          on: {
            RESET: {
              target: 'idle',
              actions: assign(initialContext)
            }
          }
        }
      }
    }, {
      actions: {
        validateAnswer: (context, event) => {
          if (event.type !== 'ANSWER_QUESTION') return;
          
          const question = context.questions.find(q => q.id === event.questionId);
          if (!question) return;

          try {
            switch (question.question_type) {
              case 'boolean':
                z.boolean().parse(event.answer);
                break;
              case 'scale':
              case 'numeric':
              case 'range':
                z.number()
                  .min(question.min_value || 0)
                  .max(question.max_value || 100)
                  .parse(event.answer);
                break;
              case 'multi_select':
              case 'checkbox':
                z.array(z.string()).parse(event.answer);
                break;
              default:
                AnswerSchema.parse(event.answer);
            }
          } catch (error) {
            console.error('Answer validation failed:', error);
            throw new Error('Invalid answer format');
          }
        }
      }
    });
  } catch (error) {
    console.error('[QuestionnaireMachine] Error creating machine:', error);
    throw error;
  }
}

// Also export a singleton promise that resolves to the machine
// This can be used by components that need to ensure the machine is created
let machinePromise: Promise<any> | null = null;

export function getQuestionnaireMachine() {
  if (!machinePromise) {
    machinePromise = createQuestionnaireMachine();
  }
  return machinePromise;
}
