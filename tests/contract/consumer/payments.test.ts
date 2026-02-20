/**
 * Payments Service Consumer Contract Tests
 * 
 * @module tests/contract/consumer/payments
 */

import { Pact } from '@pact-foundation/pact';
import { like, integer, decimal, regex } from '../utils/matchers';
import path from 'path';

const provider = new Pact({
  consumer: 'DoctorMXWebApp',
  provider: 'PaymentService',
  port: 1235,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
});

describe('Payments Service Contract', () => {
  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe('POST /api/create-payment-intent', () => {
    it('returns client secret on success', async () => {
      const requestBody = {
        appointmentId: 'appt_123',
        amount: 50000, // cents
        currency: 'mxn',
      };

      const expectedResponse = {
        clientSecret: like('pi_123_secret_456'),
        paymentIntentId: like('pi_123'),
        amount: integer(50000),
        currency: like('mxn'),
      };

      await provider.addInteraction({
        state: 'appointment exists and is pending payment',
        uponReceiving: 'a request to create payment intent',
        withRequest: {
          method: 'POST',
          path: '/api/create-payment-intent',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': like('Bearer test-token'),
          },
          body: requestBody,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: expectedResponse,
        },
      });

      const response = await fetch('http://localhost:1235/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('clientSecret');
      expect(data).toHaveProperty('paymentIntentId');
    });
  });

  describe('POST /api/confirm-payment', () => {
    it('confirms payment successfully', async () => {
      const requestBody = {
        paymentIntentId: 'pi_123',
        appointmentId: 'appt_123',
      };

      const expectedResponse = {
        success: true,
        appointmentId: like('appt_123'),
        status: like('confirmed'),
        receiptUrl: like('https://receipts.doctormx.com/r/123'),
      };

      await provider.addInteraction({
        state: 'payment intent exists and is successful',
        uponReceiving: 'a request to confirm payment',
        withRequest: {
          method: 'POST',
          path: '/api/confirm-payment',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': like('Bearer test-token'),
          },
          body: requestBody,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: expectedResponse,
        },
      });

      const response = await fetch('http://localhost:1235/api/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});
