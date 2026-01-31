/**
 * WhatsApp Webhook Handler
 * Handles incoming messages and status updates from Meta
 */

import { NextRequest, NextResponse } from 'next/server';

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
        // Process messages
        if (change.value?.messages) {
          for (const message of change.value.messages) {
            await processMessage(message);
          }
        }

        // Process status updates
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
      content = message.image?.caption || '[Image received]';
      mediaId = message.image?.id;
      mediaType = 'image';
      break;
    case 'document':
      content = message.document?.caption || '[Document received]';
      mediaId = message.document?.id;
      mediaType = 'document';
      break;
    case 'audio':
      content = '[Voice message received]';
      mediaId = message.audio?.id;
      mediaType = 'audio';
      break;
  }

  // TODO: Store message and route to AI/doctor
  console.log('Message from', phone, ':', content);
}

async function processStatusUpdate(status: any) {
  // TODO: Update notification_logs with delivery status
  console.log('Status update:', status.id, status.status);
}
