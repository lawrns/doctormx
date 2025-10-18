import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIPersonality {
  id: string;
  name: string;
  specialty: string;
  personality: string;
  voice: string;
  greeting: string;
  systemPrompt: string;
  entertainmentFeatures: string[];
}

export const AI_PERSONALITIES: AIPersonality[] = [
  {
    id: 'dr_maria',
    name: 'Dra. María',
    specialty: 'Medicina General y Salud Mental',
    personality: 'Empática, cálida, comprensiva, con un toque de humor',
    voice: 'Voz cálida y maternal con acento mexicano',
    greeting: '¡Hola! Soy la Dra. María. Estoy aquí para ayudarte con cualquier consulta médica. ¿Cómo te sientes hoy?',
    systemPrompt: `Eres la Dra. María, una médica mexicana especializada en medicina general y salud mental. Tu personalidad es:

CARACTERÍSTICAS:
- Empática y comprensiva
- Cálida y maternal
- Usa humor sutil para aliviar tensiones
- Habla en español mexicano natural
- Usa expresiones mexicanas apropiadas
- Siempre muestra preocupación genuina

ESTILO DE COMUNICACIÓN:
- Saluda cálidamente
- Pregunta cómo se siente la persona
- Usa "mi amor", "mi vida" ocasionalmente (con moderación)
- Explica las cosas de manera simple
- Termina con palabras de aliento

ENTRETENIMIENTO:
- Comparte tips de salud divertidos
- Menciona remedios caseros mexicanos
- Da consejos de bienestar
- Crea conexión emocional

Siempre mantén el tono profesional pero cálido.`,
    entertainmentFeatures: [
      'Tips de salud divertidos',
      'Remedios caseros mexicanos',
      'Consejos de bienestar',
      'Conexión emocional'
    ]
  },
  {
    id: 'dr_carlos',
    name: 'Dr. Carlos',
    specialty: 'Medicina Interna y Emergencias',
    personality: 'Profesional, directo, basado en evidencia, confiable',
    voice: 'Voz clara y autoritativa',
    greeting: 'Buenos días. Soy el Dr. Carlos, especialista en medicina interna. ¿En qué puedo ayudarte hoy?',
    systemPrompt: `Eres el Dr. Carlos, un médico mexicano especializado en medicina interna y emergencias. Tu personalidad es:

CARACTERÍSTICAS:
- Profesional y directo
- Basado en evidencia científica
- Confiable y preciso
- Habla claro y conciso
- Usa terminología médica apropiada
- Siempre prioriza la seguridad

ESTILO DE COMUNICACIÓN:
- Saluda profesionalmente
- Va directo al grano
- Explica con precisión médica
- Usa datos y estadísticas cuando es relevante
- Termina con recomendaciones claras

ENTRETENIMIENTO:
- Comparte casos médicos interesantes
- Explica procedimientos médicos
- Da consejos de prevención
- Comparte avances médicos

Siempre mantén el tono profesional y educativo.`,
    entertainmentFeatures: [
      'Casos médicos interesantes',
      'Explicación de procedimientos',
      'Consejos de prevención',
      'Avances médicos'
    ]
  }
];

export async function getPersonalityResponse(
  personalityId: string,
  message: string,
  history: { role: 'user' | 'assistant' | 'system'; content: string }[],
  context?: any
): Promise<string> {
  const personality = AI_PERSONALITIES.find(p => p.id === personalityId);
  if (!personality) {
    throw new Error('Personality not found');
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: personality.systemPrompt
        },
        ...history,
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    return response.choices[0].message.content || 'Lo siento, no pude procesar tu mensaje.';
  } catch (error) {
    console.error('Error getting personality response:', error);
    throw new Error('Error getting personality response');
  }
}

export async function getEntertainmentContent(
  personalityId: string,
  type: 'tip' | 'fact' | 'challenge' | 'story'
): Promise<string> {
  const personality = AI_PERSONALITIES.find(p => p.id === personalityId);
  if (!personality) {
    throw new Error('Personality not found');
  }

  const contentPrompts = {
    tip: `Como ${personality.name}, comparte un tip de salud útil y entretenido relacionado con ${personality.specialty}. Hazlo divertido pero educativo.`,
    fact: `Como ${personality.name}, comparte un dato médico interesante sobre ${personality.specialty}. Hazlo fascinante y educativo.`,
    challenge: `Como ${personality.name}, propón un desafío de salud relacionado con ${personality.specialty}. Hazlo motivador y alcanzable.`,
    story: `Como ${personality.name}, comparte una breve historia médica interesante relacionada con ${personality.specialty}. Hazla educativa y entretenida.`
  };

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: personality.systemPrompt
        },
        {
          role: "user",
          content: contentPrompts[type]
        }
      ],
      max_tokens: 300,
      temperature: 0.8
    });

    return response.choices[0].message.content || 'Contenido no disponible.';
  } catch (error) {
    console.error('Error getting entertainment content:', error);
    throw new Error('Error getting entertainment content');
  }
}

export async function getHealthTrivia(
  personalityId: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}> {
  const personality = AI_PERSONALITIES.find(p => p.id === personalityId);
  if (!personality) {
    throw new Error('Personality not found');
  }

  const difficultyPrompts = {
    easy: 'Pregunta básica sobre salud general',
    medium: 'Pregunta intermedia sobre medicina',
    hard: 'Pregunta avanzada sobre especialización médica'
  };

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Como ${personality.name}, crea una pregunta de trivia médica de nivel ${difficulty} relacionada con ${personality.specialty}. 

Formato requerido:
QUESTION: [pregunta]
OPTIONS: [opción1, opción2, opción3, opción4]
CORRECT: [número de la opción correcta]
EXPLANATION: [explicación breve]`
        }
      ],
      max_tokens: 400,
      temperature: 0.7
    });

    const content = response.choices[0].message.content || '';
    const lines = content.split('\n');
    
    let question = '';
    let options: string[] = [];
    let correctAnswer = 0;
    let explanation = '';

    for (const line of lines) {
      if (line.startsWith('QUESTION:')) {
        question = line.replace('QUESTION:', '').trim();
      } else if (line.startsWith('OPTIONS:')) {
        options = line.replace('OPTIONS:', '').split(',').map(opt => opt.trim());
      } else if (line.startsWith('CORRECT:')) {
        correctAnswer = parseInt(line.replace('CORRECT:', '').trim()) - 1;
      } else if (line.startsWith('EXPLANATION:')) {
        explanation = line.replace('EXPLANATION:', '').trim();
      }
    }

    return {
      question: question || 'Pregunta no disponible',
      options: options.length === 4 ? options : ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
      correctAnswer: Math.max(0, Math.min(3, correctAnswer)),
      explanation: explanation || 'Explicación no disponible'
    };
  } catch (error) {
    console.error('Error getting health trivia:', error);
    throw new Error('Error getting health trivia');
  }
}

export async function getMotivationalMessage(
  personalityId: string,
  context: 'health_goal' | 'recovery' | 'prevention' | 'general'
): Promise<string> {
  const personality = AI_PERSONALITIES.find(p => p.id === personalityId);
  if (!personality) {
    throw new Error('Personality not found');
  }

  const contextPrompts = {
    health_goal: `Como ${personality.name}, da un mensaje motivacional para alguien que está trabajando en sus metas de salud.`,
    recovery: `Como ${personality.name}, da un mensaje de aliento para alguien que se está recuperando de una enfermedad.`,
    prevention: `Como ${personality.name}, da un mensaje motivacional sobre la importancia de la prevención en salud.`,
    general: `Como ${personality.name}, da un mensaje general de motivación y bienestar.`
  };

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: personality.systemPrompt
        },
        {
          role: "user",
          content: contextPrompts[context]
        }
      ],
      max_tokens: 200,
      temperature: 0.8
    });

    return response.choices[0].message.content || 'Mensaje no disponible.';
  } catch (error) {
    console.error('Error getting motivational message:', error);
    throw new Error('Error getting motivational message');
  }
}

export function getPersonalityById(id: string): AIPersonality | undefined {
  return AI_PERSONALITIES.find(p => p.id === id);
}

export function getAllPersonalities(): AIPersonality[] {
  return AI_PERSONALITIES;
}
