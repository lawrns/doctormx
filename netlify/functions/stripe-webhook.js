import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }

  try {
    const signature = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing signature or webhook secret' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }

    // Verify webhook signature
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(event.body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }

    console.log('🔔 Received Stripe webhook:', stripeEvent.type);

    // Handle different event types
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(stripeEvent.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  try {
    console.log('✅ Subscription created:', subscription.id);
    
    const doctorId = subscription.metadata?.doctor_id;
    if (!doctorId) {
      console.error('No doctor_id in subscription metadata');
      return;
    }

    // Update doctor subscription status
    await supabase
      .from('doctors')
      .update({
        subscription_status: 'active',
        subscription_id: subscription.id,
        subscription_start_date: new Date().toISOString(),
        subscription_trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('user_id', doctorId);

    // Log subscription event
    await logSubscriptionEvent(doctorId, 'subscription_created', {
      subscription_id: subscription.id,
      plan_id: subscription.metadata?.plan_id,
      trial_enabled: subscription.metadata?.trial_enabled === 'true'
    });

    // Track onboarding event
    await supabase
      .from('onboarding_analytics')
      .insert({
        doctor_id: doctorId,
        event_type: 'subscription_activated',
        event_data: {
          subscription_id: subscription.id,
          plan_id: subscription.metadata?.plan_id,
          trial_enabled: subscription.metadata?.trial_enabled === 'true'
        }
      });

    console.log('✅ Doctor subscription activated:', doctorId);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('🔄 Subscription updated:', subscription.id);
    
    const doctorId = subscription.metadata?.doctor_id;
    if (!doctorId) {
      console.error('No doctor_id in subscription metadata');
      return;
    }

    // Update subscription status
    await supabase
      .from('doctors')
      .update({
        subscription_status: subscription.status,
        subscription_trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
      })
      .eq('user_id', doctorId);

    // Log subscription event
    await logSubscriptionEvent(doctorId, 'subscription_updated', {
      subscription_id: subscription.id,
      status: subscription.status,
      trial_end: subscription.trial_end
    });

    console.log('✅ Doctor subscription updated:', doctorId);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('❌ Subscription deleted:', subscription.id);
    
    const doctorId = subscription.metadata?.doctor_id;
    if (!doctorId) {
      console.error('No doctor_id in subscription metadata');
      return;
    }

    // Update doctor subscription status
    await supabase
      .from('doctors')
      .update({
        subscription_status: 'cancelled',
        subscription_end_date: new Date().toISOString()
      })
      .eq('user_id', doctorId);

    // Log subscription event
    await logSubscriptionEvent(doctorId, 'subscription_cancelled', {
      subscription_id: subscription.id,
      cancelled_at: new Date().toISOString()
    });

    console.log('✅ Doctor subscription cancelled:', doctorId);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

// Handle payment succeeded
async function handlePaymentSucceeded(invoice) {
  try {
    console.log('💳 Payment succeeded:', invoice.id);
    
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const doctorId = subscription.metadata?.doctor_id;
    
    if (!doctorId) {
      console.error('No doctor_id in subscription metadata');
      return;
    }

    // Log payment event
    await logSubscriptionEvent(doctorId, 'payment_succeeded', {
      invoice_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency
    });

    console.log('✅ Payment processed for doctor:', doctorId);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

// Handle payment failed
async function handlePaymentFailed(invoice) {
  try {
    console.log('💳 Payment failed:', invoice.id);
    
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const doctorId = subscription.metadata?.doctor_id;
    
    if (!doctorId) {
      console.error('No doctor_id in subscription metadata');
      return;
    }

    // Update subscription status
    await supabase
      .from('doctors')
      .update({
        subscription_status: 'past_due'
      })
      .eq('user_id', doctorId);

    // Log payment event
    await logSubscriptionEvent(doctorId, 'payment_failed', {
      invoice_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      attempt_count: invoice.attempt_count
    });

    // TODO: Send notification email to doctor about failed payment
    console.log('⚠️ Payment failed for doctor:', doctorId);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Handle trial will end
async function handleTrialWillEnd(subscription) {
  try {
    console.log('⏰ Trial will end:', subscription.id);
    
    const doctorId = subscription.metadata?.doctor_id;
    if (!doctorId) {
      console.error('No doctor_id in subscription metadata');
      return;
    }

    // Log trial event
    await logSubscriptionEvent(doctorId, 'trial_will_end', {
      subscription_id: subscription.id,
      trial_end: subscription.trial_end
    });

    // TODO: Send notification email to doctor about trial ending
    console.log('⏰ Trial ending soon for doctor:', doctorId);
  } catch (error) {
    console.error('Error handling trial will end:', error);
  }
}

// Log subscription events
async function logSubscriptionEvent(doctorId, eventType, eventData) {
  try {
    await supabase
      .from('subscription_events')
      .insert({
        doctor_id: doctorId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging subscription event:', error);
  }
}
