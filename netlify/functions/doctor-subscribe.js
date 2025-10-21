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

// Doctor subscription plans
const DOCTOR_SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'doctor_monthly',
    name: 'Plan Mensual Doctor',
    price: 49900, // $499 MXN in centavos
    currency: 'mxn',
    interval: 'month',
    description: 'Suscripción mensual para doctores - $499 MXN/mes',
  },
  yearly: {
    id: 'doctor_yearly',
    name: 'Plan Anual Doctor',
    price: 499900, // $4999 MXN in centavos (2 meses gratis)
    currency: 'mxn',
    interval: 'year',
    description: 'Suscripción anual para doctores - $4999 MXN/año (2 meses gratis)',
  }
};

// Get Stripe customer ID for doctor
async function getStripeCustomerId(doctorId) {
  try {
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('stripe_customer_id')
      .eq('user_id', doctorId)
      .single();

    if (error) throw error;
    return doctor?.stripe_customer_id || null;
  } catch (error) {
    console.error('Error getting Stripe customer ID:', error);
    return null;
  }
}

// Create Stripe Checkout session for doctor subscription
async function createDoctorCheckoutSession(doctorId, planId, verificationToken) {
  try {
    console.log('💳 Creating doctor checkout session:', { doctorId, planId });

    // Get doctor details
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('user_id, users(email, name), subscription_status, license_status')
      .eq('user_id', doctorId)
      .single();

    if (doctorError || !doctor) {
      throw new Error('Doctor not found');
    }

    // Verify doctor is verified and not already subscribed
    if (doctor.license_status !== 'verified') {
      throw new Error('Doctor must be verified before subscribing');
    }

    if (doctor.subscription_status === 'active') {
      throw new Error('Doctor already has an active subscription');
    }

    const plan = DOCTOR_SUBSCRIPTION_PLANS[planId];
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
      await supabase
        .from('doctors')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', doctorId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: plan.currency,
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: plan.price,
          recurring: {
            interval: plan.interval,
          },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        metadata: {
          doctor_id: doctorId,
          plan_id: planId,
          platform: 'doctor.mx',
          trial_enabled: 'true'
        }
      },
      success_url: `${process.env.FRONTEND_URL || 'https://doctor.mx'}/connect/dashboard?subscription=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://doctor.mx'}/connect/subscription-setup?doctorId=${doctorId}&token=${verificationToken}`,
      metadata: {
        doctor_id: doctorId,
        plan_id: planId,
        verification_token: verificationToken || '',
        platform: 'doctor.mx'
      }
    });

    console.log('✅ Doctor checkout session created:', session.id);

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      expiresAt: new Date(session.expires_at * 1000)
    };

  } catch (error) {
    console.error('❌ Error creating doctor checkout session:', error);
    throw error;
  }
}

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
    const { doctorId, subscriptionPlan, verificationToken } = JSON.parse(event.body);
    
    if (!doctorId || !subscriptionPlan) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: doctorId, subscriptionPlan' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }

    console.log('💳 Creating doctor subscription checkout:', { doctorId, subscriptionPlan });
    
    const checkoutSession = await createDoctorCheckoutSession(doctorId, subscriptionPlan, verificationToken);
    console.log('✅ Doctor checkout session created:', checkoutSession.sessionId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        checkoutUrl: checkoutSession.checkoutUrl,
        sessionId: checkoutSession.sessionId,
        expiresAt: checkoutSession.expiresAt
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };

  } catch (error) {
    console.error('❌ Error creating doctor subscription checkout:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
}
