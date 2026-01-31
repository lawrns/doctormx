import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createSession, addMessage, conductTriage, routeHandoff } from '@/lib/whatsapp';
import { sendWhatsAppMessage } from '@/lib/whatsapp-business-api';

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

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
    const body = await request.json();

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

async function processMessage(message: any) {
  const phone = message.from;
  const messageId = message.id;

  let content = '';
  let mediaId = null;
  let mediaType = null;

  switch (message.type) {
    case 'text':
      content = message.text?.body || '';
      break;
    case 'image':
      content = message.image?.caption || '[Imagen recibida]';
      mediaId = message.image?.id;
      mediaType = 'image';
      break;
    case 'document':
      content = message.document?.caption || '[Documento recibido]';
      mediaId = message.document?.id;
      mediaType = 'document';
      break;
    case 'audio':
      content = '[Mensaje de voz recibido]';
      mediaId = message.audio?.id;
      mediaType = 'audio';
      break;
  }

  const supabase = createServiceClient();

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
  await addMessage(sessionId, content, 'inbound', 'patient', undefined, mediaId || undefined, mediaType || undefined);

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

async function processStatusUpdate(status: any) {
  const supabase = createServiceClient();
  
  await supabase.from('notification_logs').insert({
    phone_number: status.recipient_id,
    template: 'status_update',
    status: status.status,
    whatsapp_message_id: status.id,
    context: { status: status.status, timestamp: status.timestamp },
  });
}
