import { supabaseAdmin } from '../lib/supabase.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Doctor subscription plans
export const DOCTOR_SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'doctor_monthly',
    name: 'Plan Mensual Doctor',
    price: 49900, // $499 MXN in centavos
    currency: 'mxn',
    interval: 'month',
    description: 'Suscripción mensual para doctores - $499 MXN/mes',
    features: [
      'Referencias ilimitadas de pacientes por IA',
      '70% de ingresos por consulta ($200+ MXN)',
      'Dashboard profesional completo',
      'Integración con WhatsApp',
      'Procesamiento de pagos incluido',
      'Recetas digitales válidas (NOM-004)',
      'Soporte prioritario 24/7'
    ]
  },
  yearly: {
    id: 'doctor_yearly',
    name: 'Plan Anual Doctor',
    price: 499900, // $4999 MXN in centavos (2 meses gratis)
    currency: 'mxn',
    interval: 'year',
    description: 'Suscripción anual para doctores - $4999 MXN/año (2 meses gratis)',
    features: [
      'Todo lo del plan mensual',
      '2 meses gratis (ahorro de $998 MXN)',
      'Prioridad en referencias de pacientes',
      'Dashboard avanzado con analytics',
      'Certificación de especialidad destacada'
    ]
  }
};

// Create Stripe subscription for doctor
export async function createDoctorSubscription(doctorId: string, planId: string, paymentMethodId: string) {
  try {
    console.log('💳 Creating doctor subscription:', { doctorId, planId, paymentMethodId });

    // Get doctor details
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .select('user_id, users(email, name)')
      .eq('user_id', doctorId)
      .single();

    if (doctorError || !doctor) {
      throw new Error('Doctor not found');
    }

    const plan = DOCTOR_SUBSCRIPTION_PLANS[planId as keyof typeof DOCTOR_SUBSCRIPTION_PLANS];
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    // Create Stripe customer if not exists
    let customerId = await getStripeCustomerId(doctorId);
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: doctor.users.email,
        name: doctor.users.name,
        metadata: {
          doctor_id: doctorId,
          platform: 'doctor.mx'
        }
      });
      customerId = customer.id;

      // Store customer ID
      await supabaseAdmin
        .from('doctors')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', doctorId);
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price_data: {
          currency: plan.currency,
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: plan.price,
          recurring: {
            interval: plan.interval as 'month' | 'year',
          },
        },
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        doctor_id: doctorId,
        plan_id: planId,
        platform: 'doctor.mx'
      }
    });

    // Store subscription in database
    await supabaseAdmin
      .from('doctors')
      .update({
        subscription_status: 'active',
        subscription_id: subscription.id,
        subscription_start_date: new Date().toISOString(),
        payment_provider: 'stripe',
        subscription_plan: planId
      })
      .eq('user_id', doctorId);

    // Log subscription event
    await logSubscriptionEvent(doctorId, 'subscription_created', {
      subscription_id: subscription.id,
      plan_id: planId,
      amount: plan.price,
      currency: plan.currency
    });

    console.log('✅ Doctor subscription created:', subscription.id);

    return {
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      status: subscription.status
    };

  } catch (error) {
    console.error('❌ Error creating doctor subscription:', error);
    throw error;
  }
}

// Get doctor subscription status
export async function getDoctorSubscription(doctorId: string) {
  try {
    const { data: doctor, error } = await supabaseAdmin
      .from('doctors')
      .select('subscription_status, subscription_id, subscription_start_date, subscription_end_date, payment_provider, subscription_plan')
      .eq('user_id', doctorId)
      .single();

    if (error) throw error;

    if (!doctor.subscription_id) {
      return {
        status: 'inactive',
        plan: null,
        nextBillingDate: null,
        amount: 0
      };
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(doctor.subscription_id);
    const plan = DOCTOR_SUBSCRIPTION_PLANS[doctor.subscription_plan as keyof typeof DOCTOR_SUBSCRIPTION_PLANS];

    return {
      status: subscription.status,
      plan: plan,
      nextBillingDate: new Date(subscription.current_period_end * 1000),
      amount: plan?.price || 0,
      subscriptionId: subscription.id,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    };

  } catch (error) {
    console.error('❌ Error getting doctor subscription:', error);
    throw error;
  }
}

// Cancel doctor subscription
export async function cancelDoctorSubscription(doctorId: string, cancelAtPeriodEnd: boolean = true) {
  try {
    const { data: doctor, error } = await supabaseAdmin
      .from('doctors')
      .select('subscription_id')
      .eq('user_id', doctorId)
      .single();

    if (error || !doctor.subscription_id) {
      throw new Error('No active subscription found');
    }

    let subscription;
    if (cancelAtPeriodEnd) {
      // Cancel at end of billing period
      subscription = await stripe.subscriptions.update(doctor.subscription_id, {
        cancel_at_period_end: true
      });
    } else {
      // Cancel immediately
      subscription = await stripe.subscriptions.cancel(doctor.subscription_id);
    }

    // Update database
    await supabaseAdmin
      .from('doctors')
      .update({
        subscription_status: cancelAtPeriodEnd ? 'canceling' : 'canceled',
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('user_id', doctorId);

    // Log cancellation event
    await logSubscriptionEvent(doctorId, 'subscription_canceled', {
      subscription_id: subscription.id,
      cancel_at_period_end: cancelAtPeriodEnd
    });

    return {
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      endDate: new Date(subscription.current_period_end * 1000)
    };

  } catch (error) {
    console.error('❌ Error canceling doctor subscription:', error);
    throw error;
  }
}

// Update payment method
export async function updateDoctorPaymentMethod(doctorId: string, paymentMethodId: string) {
  try {
    const customerId = await getStripeCustomerId(doctorId);
    if (!customerId) {
      throw new Error('No Stripe customer found');
    }

    // Attach new payment method
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log('✅ Payment method updated for doctor:', doctorId);
    return { success: true };

  } catch (error) {
    console.error('❌ Error updating payment method:', error);
    throw error;
  }
}

// Get Stripe customer ID for doctor
async function getStripeCustomerId(doctorId: string): Promise<string | null> {
  const { data: doctor, error } = await supabaseAdmin
    .from('doctors')
    .select('stripe_customer_id')
    .eq('user_id', doctorId)
    .single();

  if (error || !doctor) return null;
  return doctor.stripe_customer_id;
}

// Log subscription events for audit
async function logSubscriptionEvent(doctorId: string, eventType: string, metadata: any) {
  try {
    await supabaseAdmin
      .from('doctor_subscription_events')
      .insert({
        doctor_id: doctorId,
        event_type: eventType,
        metadata: metadata,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('❌ Error logging subscription event:', error);
  }
}

// Handle Stripe webhook events
export async function handleStripeWebhook(event: any) {
  try {
    console.log('🔔 Processing Stripe webhook:', event.type);

    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
    }

    return { received: true };
  } catch (error) {
    console.error('❌ Error handling Stripe webhook:', error);
    throw error;
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription;
  const doctorId = await getDoctorIdBySubscriptionId(subscriptionId);
  
  if (doctorId) {
    await supabaseAdmin
      .from('doctors')
      .update({
        subscription_status: 'active',
        last_payment_date: new Date().toISOString(),
        failed_payment_count: 0
      })
      .eq('user_id', doctorId);

    await logSubscriptionEvent(doctorId, 'payment_succeeded', {
      subscription_id: subscriptionId,
      amount: invoice.amount_paid,
      currency: invoice.currency
    });
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription;
  const doctorId = await getDoctorIdBySubscriptionId(subscriptionId);
  
  if (doctorId) {
    // Increment failed payment count
    const { data: doctor } = await supabaseAdmin
      .from('doctors')
      .select('failed_payment_count')
      .eq('user_id', doctorId)
      .single();

    const failedCount = (doctor?.failed_payment_count || 0) + 1;

    await supabaseAdmin
      .from('doctors')
      .update({
        subscription_status: failedCount >= 3 ? 'suspended' : 'payment_failed',
        failed_payment_count: failedCount
      })
      .eq('user_id', doctorId);

    await logSubscriptionEvent(doctorId, 'payment_failed', {
      subscription_id: subscriptionId,
      failed_count: failedCount,
      amount: invoice.amount_due,
      currency: invoice.currency
    });
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: any) {
  const doctorId = await getDoctorIdBySubscriptionId(subscription.id);
  
  if (doctorId) {
    await supabaseAdmin
      .from('doctors')
      .update({
        subscription_status: 'canceled',
        subscription_end_date: new Date().toISOString()
      })
      .eq('user_id', doctorId);

    await logSubscriptionEvent(doctorId, 'subscription_deleted', {
      subscription_id: subscription.id
    });
  }
}

// Handle subscription update
async function handleSubscriptionUpdated(subscription: any) {
  const doctorId = await getDoctorIdBySubscriptionId(subscription.id);
  
  if (doctorId) {
    await supabaseAdmin
      .from('doctors')
      .update({
        subscription_status: subscription.status,
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('user_id', doctorId);

    await logSubscriptionEvent(doctorId, 'subscription_updated', {
      subscription_id: subscription.id,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end
    });
  }
}

// Get doctor ID by subscription ID
async function getDoctorIdBySubscriptionId(subscriptionId: string): Promise<string | null> {
  const { data: doctor, error } = await supabaseAdmin
    .from('doctors')
    .select('user_id')
    .eq('subscription_id', subscriptionId)
    .single();

  if (error || !doctor) return null;
  return doctor.user_id;
}

// Get subscription plans for display
export function getDoctorSubscriptionPlans() {
  return Object.values(DOCTOR_SUBSCRIPTION_PLANS);
}

// Check if doctor has active subscription
export async function hasActiveSubscription(doctorId: string): Promise<boolean> {
  try {
    const subscription = await getDoctorSubscription(doctorId);
    return subscription.status === 'active';
  } catch (error) {
    console.error('❌ Error checking subscription status:', error);
    return false;
  }
}