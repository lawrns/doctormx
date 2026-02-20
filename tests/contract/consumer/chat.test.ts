/**
 * Chat Service Consumer Contract Tests
 * 
 * These tests verify that the chat client correctly consumes
 * the chat API contract.
 * 
 * @module tests/contract/consumer/chat
 */

import { Pact } from '@pact-foundation/pact';
import { like, regex, integer, string } from '../utils/matchers';
import path from 'path';

const provider = new Pact({
  consumer: 'DoctorMXWebApp',
  provider: 'ChatService',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
});

describe('Chat Service Contract', () => {
  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe('POST /api/chat/messages', () => {
    it('returns conversation and message on success', async () => {
      const requestBody = {
        message: 'Hola, tengo dolor de cabeza',
        conversationId: null,
      };

      const expectedResponse = {
        conversationId: like('conv_123'),
        messageId: like('msg_456'),
        content: like('Entiendo que tienes dolor de cabeza...'),
        timestamp: regex({ generate: '2024-01-15T10:30:00Z', matcher: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$' }),
      };

      await provider.addInteraction({
        state: 'user is authenticated',
        uponReceiving: 'a request to send a chat message',
        withRequest: {
          method: 'POST',
          path: '/api/chat/messages',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': like('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'),
          },
          body: requestBody,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: expectedResponse,
        },
      });

      const response = await fetch('http://localhost:1234/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('conversationId');
      expect(data).toHaveProperty('messageId');
      expect(data).toHaveProperty('content');
    });

    it('returns 401 when user is not authenticated', async () => {
      await provider.addInteraction({
        state: 'user is not authenticated',
        uponReceiving: 'a request to send a chat message without auth',
        withRequest: {
          method: 'POST',
          path: '/api/chat/messages',
          headers: { 'Content-Type': 'application/json' },
          body: { message: 'Hola' },
        },
        willRespondWith: {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
          body: {
            error: like('Unauthorized'),
            message: like('Authentication required'),
          },
        },
      });

      const response = await fetch('http://localhost:1234/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hola' }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/chat/conversations/:id', () => {
    it('returns conversation history', async () => {
      const expectedResponse = {
        id: like('conv_123'),
        messages: [
          {
            id: like('msg_1'),
            content: like('Hola'),
            role: regex({ generate: 'user', matcher: '^(user|assistant)$' }),
            timestamp: like('2024-01-15T10:00:00Z'),
          },
        ],
        totalMessages: integer(1),
      };

      await provider.addInteraction({
        state: 'conversation exists',
        uponReceiving: 'a request to get conversation history',
        withRequest: {
          method: 'GET',
          path: '/api/chat/conversations/conv_123',
          headers: {
            'Authorization': like('Bearer test-token'),
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: expectedResponse,
        },
      });

      const response = await fetch('http://localhost:1234/api/chat/conversations/conv_123', {
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('messages');
      expect(Array.isArray(data.messages)).toBe(true);
    });
  });
});
