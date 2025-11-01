import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabaseAdmin } from '../lib/supabase.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface DoctorCheckoutRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
  body: {
    priceId?: string;
    interval?: 'month' | 'year';
  };
}

/**
 * Create Stripe Checkout Session for Doctor Subscription
 */
export async function createDoctorCheckoutSession(req: DoctorCheckoutRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    // Get doctor profile
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .select('id, user_id')
      .eq('user_id', userId)
      .single();
    
    if (doctorError || !doctor) {
      return res.status(404).json({ error: 'Perfil de doctor no encontrado' });
    }
    
    // Check if doctor already has active subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('doctor_id', doctor.id)
      .eq('status', 'active')
      .single();
    
    if (existingSubscription) {
      return res.status(400).json({
        error: 'Ya tienes una suscripción activa',
        subscription: existingSubscription,
      });
    }
    
    // Determine price ID
    const interval = req.body.interval || 'month';
    const priceId = interval === 'year' 
      ? process.env.STRIPE_DOCTOR_YEARLY_PRICE_ID 
      : process.env.STRIPE_DOCTOR_MONTHLY_PRICE_ID;
    
    if (!priceId) {
      return res.status(500).json({ error: 'Price ID not configured' });
    }
    
    // Create or get Stripe customer
    let customerId: string;
    
    // Check if doctor already has a Stripe customer ID
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('provider_customer_id')
      .eq('doctor_id', doctor.id)
      .not('provider_customer_id', 'is', null)
      .limit(1)
      .single();
    
    if (existingSub?.provider_customer_id) {
      customerId = existingSub.provider_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          doctor_id: doctor.id.toString(),
          user_id: userId,
        },
      });
      customerId = customer.id;
    }
    
    // Get base URL from env or request
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/connect/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${baseUrl}/connect/subscription-setup?canceled=true`,
      metadata: {
        doctor_id: doctor.id.toString(),
        user_id: userId,
        interval,
      },
      subscription_data: {
        metadata: {
          doctor_id: doctor.id.toString(),
          user_id: userId,
        },
      },
      // Early bird offer: first month free
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });
    
    res.json({
      sessionId: session.id,
      url: session.url,
      customerId,
    });
    
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({
      error: 'Error al crear sesión de pago',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Handle Stripe Webhooks
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    return res.status(400).send('No signature');
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const doctorId = session.metadata?.doctor_id;
  const subscriptionId = session.subscription as string;
  
  if (!doctorId) {
    console.error('No doctor_id in session metadata');
    return;
  }
  
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Get plan from database
  const interval = session.metadata?.interval || 'month';
  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('code', interval === 'year' ? 'DOC_DISCOVERY_Y' : 'DOC_DISCOVERY_M')
    .single();
  
  if (!plan) {
    console.error('Plan not found in database');
    return;
  }
  
  // Create subscription record
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .insert({
      doctor_id: parseInt(doctorId),
      plan_id: plan.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      provider: 'stripe',
      provider_sub_id: subscriptionId,
      provider_customer_id: session.customer as string,
      metadata: {
        session_id: session.id,
        interval,
      },
    });
  
  if (error) {
    console.error('Error creating subscription:', error);
  } else {
    console.log(`Subscription created for doctor ${doctorId}`);
    
    // Update doctor profile
    await supabaseAdmin
      .from('doctors')
      .update({
        verified: true,
        onboarding_step: 'completed',
        profile_completed: true,
      })
      .eq('id', parseInt(doctorId));
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('provider_sub_id', subscription.id);
  
  if (error) {
    console.error('Error updating subscription:', error);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('provider_sub_id', subscription.id);
  
  if (error) {
    console.error('Error canceling subscription:', error);
  }
}

/**
 * Handle successful payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`Invoice ${invoice.id} paid successfully`);
  // Could send confirmation email, update metrics, etc.
}

/**
 * Handle failed payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  // Update subscription status to past_due
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('provider_sub_id', subscriptionId);
  
  console.log(`Payment failed for invoice ${invoice.id}`);
  // Could send notification to doctor, etc.
}

/**
 * Get doctor's subscription status
 */
export async function getDoctorSubscriptionStatus(req: DoctorCheckoutRequest, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const { data: doctor } = await supabaseAdmin
      .from('doctors')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor no encontrado' });
    }
    
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        plans (*)
      `)
      .eq('doctor_id', doctor.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!subscription) {
      return res.json({ hasSubscription: false });
    }
    
    res.json({
      hasSubscription: true,
      subscription,
      isActive: subscription.status === 'active' && new Date(subscription.current_period_end) > new Date(),
    });
    
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Error al obtener suscripción' });
  }
}

/**
 * Cancel doctor subscription
 */
export async function cancelDoctorSubscription(req: DoctorCheckoutRequest, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const { data: doctor } = await supabaseAdmin
      .from('doctors')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor no encontrado' });
    }
    
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('doctor_id', doctor.id)
      .eq('status', 'active')
      .single();
    
    if (!subscription) {
      return res.status(404).json({ error: 'No tienes suscripción activa' });
    }
    
    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(subscription.provider_sub_id, {
      cancel_at_period_end: true,
    });
    
    // Update local record
    await supabaseAdmin
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('id', subscription.id);
    
    res.json({
      success: true,
      message: 'Suscripción cancelada. Seguirás teniendo acceso hasta el final del período actual.',
      endsAt: subscription.current_period_end,
    });
    
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Error al cancelar suscripción' });
  }
}
