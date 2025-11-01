import Stripe from 'stripe';
import crypto from 'crypto';

let stripe: any = null;

function getStripeClient() {
  if (!stripe) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      throw new Error('Stripe Secret Key must be provided in .env');
    }
    
    stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20',
    });
  }
  return stripe;
}

export interface PaymentRequest {
  amount: number; // in centavos (MXN)
  currency: string;
  description: string;
  customerEmail: string;
  customerName?: string;
  metadata?: Record<string, string>;
  successUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResult {
  id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  paymentIntentId?: string;
  checkoutSessionId?: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

export interface PaymentWebhook {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

/**
 * Create a Stripe checkout session for payment
 */
export async function createCheckoutSession(paymentRequest: PaymentRequest): Promise<PaymentResult> {
  try {
    const stripeClient = getStripeClient();
    
    const idempotencyKey = crypto.randomUUID();
    
    const session = await stripeClient.checkout.sessions.create({
      idempotency_key: idempotencyKey,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: paymentRequest.currency.toLowerCase(),
            product_data: {
              name: paymentRequest.description,
              description: `Consulta médica - Doctor.mx`,
            },
            unit_amount: paymentRequest.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: paymentRequest.successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: paymentRequest.cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`,
      customer_email: paymentRequest.customerEmail,
      metadata: {
        customer_name: paymentRequest.customerName || '',
        ...paymentRequest.metadata
      },
    });

    return {
      id: session.id,
      status: 'pending',
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      description: paymentRequest.description,
      customerEmail: paymentRequest.customerEmail,
      checkoutSessionId: session.id,
      createdAt: new Date().toISOString(),
      metadata: paymentRequest.metadata
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Error al crear la sesión de pago');
  }
}

/**
 * Create a payment intent for direct payment
 */
export async function createPaymentIntent(paymentRequest: PaymentRequest): Promise<PaymentResult> {
  try {
    const stripeClient = getStripeClient();
    
    const idempotencyKey = crypto.randomUUID();
    
    const paymentIntent = await stripeClient.paymentIntents.create({
      idempotency_key: idempotencyKey,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency.toLowerCase(),
      description: paymentRequest.description,
      metadata: {
        customer_email: paymentRequest.customerEmail,
        customer_name: paymentRequest.customerName || '',
        ...paymentRequest.metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      status: 'pending',
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      description: paymentRequest.description,
      customerEmail: paymentRequest.customerEmail,
      paymentIntentId: paymentIntent.id,
      createdAt: new Date().toISOString(),
      metadata: paymentRequest.metadata
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Error al crear el intent de pago');
  }
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(sessionId: string): Promise<any> {
  try {
    const stripeClient = getStripeClient();
    
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw new Error('Error al obtener la sesión de pago');
  }
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<any> {
  try {
    const stripeClient = getStripeClient();
    
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error('Error al obtener el intent de pago');
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event: PaymentWebhook): Promise<void> {
  try {
    console.log(`Processing webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
    throw error;
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: any): Promise<void> {
  try {
    console.log(`Checkout session completed: ${session.id}`);
    
    // TODO: Update database with successful payment
    // - Mark referral as paid if applicable
    // - Create consultation credit
    // - Send confirmation email
    
    console.log(`Payment successful for session ${session.id}`);
    console.log(`Amount: ${session.amount_total} ${session.currency}`);
    console.log(`Customer: ${session.customer_email}`);
    
    // For now, just log the success
    // In production, this would update the database
    
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
  try {
    console.log(`Payment intent succeeded: ${paymentIntent.id}`);
    
    // TODO: Update database with successful payment
    // - Mark referral as paid if applicable
    // - Create consultation credit
    // - Send confirmation email
    
    console.log(`Payment successful for intent ${paymentIntent.id}`);
    console.log(`Amount: ${paymentIntent.amount} ${paymentIntent.currency}`);
    
    // For now, just log the success
    // In production, this would update the database
    
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
    throw error;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
  try {
    console.log(`Payment intent failed: ${paymentIntent.id}`);
    
    // TODO: Handle failed payment
    // - Log failure reason
    // - Send failure notification
    // - Update booking status if applicable
    
    console.log(`Payment failed for intent ${paymentIntent.id}`);
    console.log(`Failure reason: ${paymentIntent.last_payment_error?.message || 'Unknown'}`);
    
    // For now, just log the failure
    // In production, this would update the database
    
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
    throw error;
  }
}

/**
 * Create a refund
 */
export async function createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<any> {
  try {
    const stripeClient = getStripeClient();
    
    const refund = await stripeClient.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // If not provided, refunds full amount
      reason: reason || 'requested_by_customer',
      metadata: {
        refunded_at: new Date().toISOString(),
      },
    });

    console.log(`Refund created: ${refund.id} for payment ${paymentIntentId}`);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Error al crear el reembolso');
  }
}

/**
 * Get payment methods for a customer
 */
export async function getCustomerPaymentMethods(customerEmail: string): Promise<any[]> {
  try {
    const stripeClient = getStripeClient();
    
    // First, find or create customer
    let customers = await stripeClient.customers.list({
      email: customerEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return []; // No customer found
    }

    const customer = customers.data[0];
    
    // Get payment methods
    const paymentMethods = await stripeClient.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    console.error('Error getting customer payment methods:', error);
    throw new Error('Error al obtener métodos de pago');
  }
}

/**
 * Validate webhook signature
 */
export function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const stripeClient = getStripeClient();
    
    const event = stripeClient.webhooks.constructEvent(payload, signature, secret);
    return !!event;
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
}

/**
 * Convert MXN pesos to centavos for Stripe
 */
export function convertToCentavos(amountInPesos: number): number {
  return Math.round(amountInPesos * 100);
}

/**
 * Convert centavos to MXN pesos from Stripe
 */
export function convertFromCentavos(amountInCentavos: number): number {
  return amountInCentavos / 100;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
