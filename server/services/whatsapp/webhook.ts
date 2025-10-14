/**
 * WhatsApp Cloud API Webhook Handler
 * Receives and processes incoming messages from Meta
 */

import { Request, Response } from 'express';
import { whatsappConfig } from './config.js';
import { sendTextMessage, markMessageAsRead } from './sender.js';
import { handleUserMessage } from './conversationHandler.js';

export interface WhatsAppWebhookMessage {
  from: string; // Phone number
  id: string; // Message ID
  timestamp: string;
  type: 'text' | 'button' | 'interactive' | 'image' | 'audio' | 'document';
  text?: { body: string };
  button?: { text: string; payload: string };
  interactive?: { type: string; button_reply?: { id: string; title: string } };
}

export interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: { display_phone_number: string; phone_number_id: string };
      contacts?: Array<{ profile: { name: string }; wa_id: string }>;
      messages?: WhatsAppWebhookMessage[];
      statuses?: Array<{ id: string; status: string; timestamp: string }>;
    };
    field: string;
  }>;
}

/**
 * Verify webhook (GET request from Meta)
 */
export function verifyWebhook(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('📞 WhatsApp webhook verification request:', { mode, token });

  if (mode === 'subscribe' && token === whatsappConfig.verifyToken) {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
}

/**
 * Handle incoming webhook events (POST request from Meta)
 */
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body;

    // Validate webhook signature (production security)
    if (process.env.NODE_ENV === 'production') {
      const signature = req.headers['x-hub-signature-256'];
      if (!verifyWebhookSignature(signature as string, JSON.stringify(body))) {
        console.error('❌ Invalid webhook signature');
        res.status(403).send('Invalid signature');
        return;
      }
    }

    // Respond immediately (Meta requires 200 within 20 seconds)
    res.status(200).send('EVENT_RECEIVED');

    // Process webhook asynchronously
    if (body.object === 'whatsapp_business_account') {
      await processWebhookEntries(body.entry || []);
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    // Still return 200 to Meta to avoid retries
    res.status(200).send('ERROR_LOGGED');
  }
}

/**
 * Process all entries in webhook payload
 */
async function processWebhookEntries(entries: WhatsAppWebhookEntry[]): Promise<void> {
  for (const entry of entries) {
    for (const change of entry.changes) {
      if (change.field === 'messages') {
        await processMessages(change.value);
      } else if (change.field === 'message_status') {
        await processMessageStatus(change.value);
      }
    }
  }
}

/**
 * Process incoming messages
 */
async function processMessages(value: any): Promise<void> {
  const messages = value.messages || [];
  const contacts = value.contacts || [];

  for (const message of messages) {
    try {
      console.log('📨 Incoming WhatsApp message:', {
        from: message.from,
        type: message.type,
        id: message.id,
      });

      // Mark as read immediately
      await markMessageAsRead(message.id);

      // Get contact name if available
      const contact = contacts.find((c: any) => c.wa_id === message.from);
      const userName = contact?.profile?.name || 'Usuario';

      // Extract message content based on type
      let messageText = '';
      if (message.type === 'text' && message.text?.body) {
        messageText = message.text.body;
      } else if (message.type === 'button' && message.button?.text) {
        messageText = message.button.text;
      } else if (message.type === 'interactive' && message.interactive?.button_reply) {
        messageText = message.interactive.button_reply.title;
      } else {
        console.log('⚠️  Unsupported message type:', message.type);
        await sendTextMessage(
          message.from,
          'Lo siento, solo puedo procesar mensajes de texto por ahora. Por favor escribe tu consulta.'
        );
        return;
      }

      // Handle the conversation
      await handleUserMessage({
        from: message.from,
        messageId: message.id,
        text: messageText,
        userName,
        timestamp: parseInt(message.timestamp) * 1000,
      });
    } catch (error) {
      console.error('Error processing message:', error);
      // Send error message to user
      try {
        await sendTextMessage(
          message.from,
          'Disculpa, hubo un error procesando tu mensaje. Por favor intenta de nuevo.'
        );
      } catch (sendError) {
        console.error('Failed to send error message:', sendError);
      }
    }
  }
}

/**
 * Process message status updates (sent, delivered, read, failed)
 */
async function processMessageStatus(value: any): Promise<void> {
  const statuses = value.statuses || [];

  for (const status of statuses) {
    console.log('📊 Message status update:', {
      id: status.id,
      status: status.status,
      timestamp: status.timestamp,
    });

    // You can store these in database for analytics
    // For now, just log them
  }
}

/**
 * Verify webhook signature using HMAC SHA-256
 */
function verifyWebhookSignature(signature: string, payload: string): boolean {
  if (!signature || !whatsappConfig.webhookSecret) {
    return false;
  }

  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', whatsappConfig.webhookSecret)
      .update(payload)
      .digest('hex');

    const signatureHash = signature.replace('sha256=', '');
    return crypto.timingSafeEqual(
      Buffer.from(signatureHash),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Health check endpoint for monitoring
 */
export function healthCheck(req: Request, res: Response): void {
  res.status(200).json({
    status: 'healthy',
    service: 'whatsapp-webhook',
    timestamp: new Date().toISOString(),
  });
}
