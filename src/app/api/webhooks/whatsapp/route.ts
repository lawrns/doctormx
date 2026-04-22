import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createSession, addMessage, conductTriage, routeHandoff } from '@/lib/whatsapp';
import { sendWhatsAppMessage } from '@/lib/whatsapp-business-api';
import { createHmac, timingSafeEqual } from 'crypto';

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;

type WhatsAppMessage = {
  id?: string;
  from?: string;
  type?: string;
  text?: { body?: string };
  image?: { id?: string; caption?: string };
  document?: { id?: string; caption?: string };
  audio?: { id?: string };
}

type WhatsAppStatus = {
  id?: string;
  recipient_id?: string;
  status?: string;
  timestamp?: string;
}

type WhatsAppWebhookBody = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppMessage[];
        statuses?: WhatsAppStatus[];
      };
    }>;
  }>;
}

export function verifyWhatsAppSignature(payload: string, signatureHeader: string | null, appSecret = APP_SECRET) {
  if (!appSecret || !signatureHeader?.startsWith('sha256=')) {
    return false;
  }

  const expected = createHmac('sha256', appSecret).update(payload).digest('hex');
  const received = signatureHeader.slice('sha256='.length);

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
  } catch {
    return false;
  }
}

// GET: Webhook verification for Meta
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// POST: Handle incoming messages
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!verifyWhatsAppSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: APP_SECRET ? 401 : 500 });
    }

    const body = JSON.parse(rawBody) as WhatsAppWebhookBody;

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.value?.messages) {
          for (const message of change.value.messages) {
            await processMessage(message);
          }
        }

        if (change.value?.statuses) {
          for (const status of change.value.statuses) {
            await processStatusUpdate(status);
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

async function processMessage(message: WhatsAppMessage) {
  const phone = message.from;
  const messageId = message.id;
  if (!phone || !messageId) return;

  const supabase = createServiceClient();

  const { data: duplicate } = await supabase
    .from('whatsapp_messages')
    .select('id')
    .eq('whatsapp_message_id', messageId)
    .maybeSingle();

  if (duplicate) {
    return;
  }

  let content = '';
  let mediaId: string | null = null;
  let mediaType: string | null = null;

  switch (message.type) {
    case 'text':
      content = message.text?.body || '';
      break;
    case 'image':
      content = message.image?.caption || '[Imagen recibida]';
      mediaId = message.image?.id || null;
      mediaType = 'image';
      break;
    case 'document':
      content = message.document?.caption || '[Documento recibido]';
      mediaId = message.document?.id || null;
      mediaType = 'document';
      break;
    case 'audio':
      content = '[Mensaje de voz recibido]';
      mediaId = message.audio?.id || null;
      mediaType = 'audio';
      break;
  }

  // Get or create session
  const { data: existingSession } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('phone_number', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let sessionId: string;

  if (!existingSession || existingSession.state === 'completed') {
    const result = await createSession(phone);
    sessionId = result.sessionId;
  } else {
    sessionId = existingSession.id;
  }

  // Store inbound message
  await addMessage(sessionId, content, 'inbound', 'patient', undefined, mediaId || undefined, mediaType || undefined, messageId);

  // Conduct AI triage
  const triageResult = await conductTriage(sessionId, content);

  if (triageResult.success) {
    // Send AI response
    await sendWhatsAppMessage(phone, triageResult.aiResponse);

    // If triage is complete, route to doctor
    if (triageResult.triageComplete && triageResult.summary) {
      if (triageResult.summary.recommendedAction === 'emergency_redirect') {
        await sendWhatsAppMessage(phone, 
          '🚨 *ATENCIÓN MÉDICA URGENTE*\n\n' +
          'Tu caso requiere atención médica inmediata.\n\n' +
          'Por favor dirígete a:\n' +
          '• Urgencias más cercanas\n' +
          '• O llama al 911\n\n' +
          'Doctor.mx no reemplaza la atención de emergencia.'
        );
      } else {
        const handoff = await routeHandoff(sessionId, triageResult.summary);
        if (handoff.success) {
          await sendWhatsAppMessage(phone,
            '✅ *Triage completado*\n\n' +
            `Hemos encontrado un médico disponible para ti.\n\n` +
            `Reserva tu cita aquí: ${process.env.NEXT_PUBLIC_APP_URL}${handoff.bookingLink}`
          );
        } else {
          await sendWhatsAppMessage(phone,
            '⏳ *Buscando médico disponible*\n\n' +
            'En este momento no hay médicos disponibles. Te contactaremos pronto.'
          );
        }
      }
    }
  } else {
    await sendWhatsAppMessage(phone, 'Lo siento, hubo un error. Por favor intenta de nuevo.');
  }
}

async function processStatusUpdate(status: WhatsAppStatus) {
  const supabase = createServiceClient();
  
  await supabase.from('notification_logs').insert({
    phone_number: status.recipient_id,
    template: 'status_update',
    status: status.status,
    whatsapp_message_id: status.id,
    context: { status: status.status, timestamp: status.timestamp },
  });
}
