/**
 * WhatsApp Conversation Handler
 * Manages user sessions, AI triage, and doctor handoff
 */

import { sendTextMessage, sendEmergencyAlert, sendInteractiveMessage } from './sender.js';
import { evaluateRedFlags } from '../../triage.js';
import { doctorReply } from '../../providers/openai.js';
import { findSpecialists } from '../../providers/orchestrator.js';

// In-memory session store (replace with Redis/DB in production)
const sessions = new Map<string, UserSession>();

export interface UserSession {
  phoneNumber: string;
  userName: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  intake: {
    symptoms?: string[];
    isPregnant?: boolean;
    vitals?: { spo2?: number };
  };
  state: 'new' | 'triage' | 'waiting_consent' | 'with_doctor' | 'rx_ready' | 'completed';
  lastActivity: number;
  userId?: string; // If registered
  sessionId: string;
}

export interface IncomingMessage {
  from: string;
  messageId: string;
  text: string;
  userName: string;
  timestamp: number;
}

/**
 * Main entry point for handling user messages
 */
export async function handleUserMessage(message: IncomingMessage): Promise<void> {
  const { from, text, userName, timestamp } = message;

  // Get or create session
  let session = getSession(from);
  if (!session) {
    session = createSession(from, userName);
    await sendWelcomeMessage(from, userName);
  }

  // Update session activity
  session.lastActivity = timestamp;
  session.conversationHistory.push({ role: 'user', content: text });

  // Route based on state
  switch (session.state) {
    case 'new':
    case 'triage':
      await handleTriageMessage(session, text);
      break;
    case 'waiting_consent':
      await handleConsentResponse(session, text);
      break;
    case 'with_doctor':
      await handleDoctorConversation(session, text);
      break;
    default:
      await sendTextMessage(from, 'Lo siento, hubo un error. Escribe "ayuda" para empezar de nuevo.');
  }

  // Save updated session
  saveSession(session);

  // Clean old sessions (30 min timeout)
  cleanupOldSessions();
}

/**
 * Handle triage phase (AI evaluation)
 */
async function handleTriageMessage(session: UserSession, text: string): Promise<void> {
  const { phoneNumber, conversationHistory, intake } = session;

  try {
    // Evaluate red flags
    const redFlags = evaluateRedFlags({ message: text, intake });

    if (redFlags.triggered) {
      // EMERGENCY - Send immediate alert
      console.log('🚨 RED FLAGS detected for', phoneNumber);
      await sendEmergencyAlert(phoneNumber, redFlags.reasons.join('; '));
      session.state = 'completed';
      return;
    }

    // Get AI triage response
    const aiResponse = await doctorReply({
      history: conversationHistory,
      redFlags,
    });

    conversationHistory.push({ role: 'assistant', content: aiResponse });

    // Send AI response
    await sendTextMessage(phoneNumber, aiResponse);

    // Check if AI suggests specialist
    const specialtyMatch = aiResponse.match(/Especialidad Sugerida:\s*([^\n\.]+)/i);
    if (specialtyMatch) {
      const specialty = specialtyMatch[1].trim();
      await offerSpecialistReferral(session, specialty);
    }

    session.state = 'triage';
  } catch (error) {
    console.error('Error in triage:', error);
    await sendTextMessage(
      phoneNumber,
      'Disculpa, hubo un error procesando tu consulta. ¿Puedes intentar de nuevo?'
    );
  }
}

/**
 * Offer specialist referral with interactive buttons
 */
async function offerSpecialistReferral(session: UserSession, specialty: string): Promise<void> {
  const { phoneNumber } = session;

  await sendInteractiveMessage(phoneNumber, {
    type: 'button',
    body: {
      text: `Recomiendo consultar con un especialista en ${specialty}.\n\n¿Te gustaría ver especialistas cerca de ti?`,
    },
    action: {
      buttons: [
        {
          type: 'reply',
          reply: {
            id: 'find_specialists_yes',
            title: 'Sí, buscar',
          },
        },
        {
          type: 'reply',
          reply: {
            id: 'find_specialists_no',
            title: 'No, gracias',
          },
        },
      ],
    },
  });

  // Store specialty in session for later use
  (session as any).suggestedSpecialty = specialty;
}

/**
 * Handle consent response
 */
async function handleConsentResponse(session: UserSession, text: string): Promise<void> {
  const { phoneNumber } = session;
  const lowerText = text.toLowerCase();

  if (lowerText.includes('acepto') || lowerText.includes('sí') || lowerText.includes('si')) {
    await sendTextMessage(
      phoneNumber,
      '✅ Gracias. Ahora describe tu situación médica con el mayor detalle posible.'
    );
    session.state = 'triage';
  } else {
    await sendTextMessage(
      phoneNumber,
      'Entiendo. No puedo continuar sin tu consentimiento. Si cambias de opinión, escribe "empezar".'
    );
    session.state = 'completed';
  }
}

/**
 * Handle conversation when with real doctor (future implementation)
 */
async function handleDoctorConversation(session: UserSession, text: string): Promise<void> {
  // TODO: Route to doctor dashboard/chat system
  await sendTextMessage(
    session.phoneNumber,
    'Tu mensaje ha sido enviado al doctor. Te responderá pronto.'
  );
}

/**
 * Send welcome message to new users
 */
async function sendWelcomeMessage(phoneNumber: string, userName: string): Promise<void> {
  const welcomeText = `¡Hola ${userName}! 👋

Soy Doctor.mx, tu asistente médico de IA.

Puedo ayudarte con:
• Evaluación inicial de síntomas
• Recomendaciones de especialistas
• Orientación sobre cuándo buscar atención urgente

⚠️ IMPORTANTE:
• NO soy un médico real
• En emergencias, llama al 911
• Mis respuestas son orientativas

¿En qué puedo ayudarte hoy?`;

  await sendTextMessage(phoneNumber, welcomeText);
}

/**
 * Session management functions
 */
function getSession(phoneNumber: string): UserSession | undefined {
  return sessions.get(phoneNumber);
}

function createSession(phoneNumber: string, userName: string): UserSession {
  const session: UserSession = {
    phoneNumber,
    userName,
    conversationHistory: [],
    intake: {},
    state: 'new',
    lastActivity: Date.now(),
    sessionId: `${phoneNumber}_${Date.now()}`,
  };
  sessions.set(phoneNumber, session);
  console.log('📱 New session created for', phoneNumber);
  return session;
}

function saveSession(session: UserSession): void {
  sessions.set(session.phoneNumber, session);
}

function cleanupOldSessions(): void {
  const timeout = 30 * 60 * 1000; // 30 minutes
  const now = Date.now();
  let cleaned = 0;

  for (const [phoneNumber, session] of sessions.entries()) {
    if (now - session.lastActivity > timeout) {
      sessions.delete(phoneNumber);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} old sessions`);
  }
}

/**
 * Get active session count (for monitoring)
 */
export function getActiveSessionCount(): number {
  return sessions.size;
}

/**
 * Get session by phone number (for admin/debug)
 */
export function getSessionByPhone(phoneNumber: string): UserSession | undefined {
  return sessions.get(phoneNumber);
}
