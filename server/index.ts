import dotenv from 'dotenv';

// IMPORTANTE: Configurar dotenv ANTES de cualquier otra importación
dotenv.config();

// Debug environment variables
console.log('🔧 Environment check:', {
  SUPABASE_URL: !!process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
  OPENAI_API_KEY: !!process.env.OPENAI_API_KEY
});

import express from 'express';
import cors from 'cors';
import { doctorReply } from './providers/openai.ts';
import { evaluateRedFlags } from './triage.ts';
import { getUserFreeQuestions, useFreeQuestion, checkFreeQuestionEligibility } from './providers/freeQuestions.ts';
import { createAIReferral, getAIReferrals, updateReferralStatus, getDoctorAvailability, createAppointmentBooking } from './providers/referralSystem.ts';
import { createBooking, getAvailableSlots, getDoctorBookings, cancelBooking, getPatientBookings } from './providers/booking.ts';
import { createCheckoutSession, createPaymentIntent, getCheckoutSession, getPaymentIntent, handleWebhookEvent, validateWebhookSignature, convertToCentavos, formatCurrency } from './providers/payments.ts';
import { getQuestions, getQuestionWithAnswers, createQuestion, createAnswer, likeItem, rateAnswerHelpful, incrementQuestionViews, getCategories, getPopularTags, moderateQuestion, moderateAnswer } from './providers/qaBoard.ts';
import { trackAffiliateEvent, getAffiliatePerformance, getAffiliateCommissions, getAffiliateMarketingMaterials, createAffiliateCommission, getAffiliateAnalytics, generateAffiliateLink, trackAffiliateClick, trackAffiliateConversion } from './providers/affiliateTracking.ts';
import { getUserHealthPoints, addHealthPoints, getUserAchievements, getAllAchievements, awardAchievement, getUserHealthGoals, createHealthGoal, updateHealthGoalProgress, getPointsTransactionHistory, getLeaderboard, checkAndAwardAchievements, updateUserStreak } from './providers/gamification.ts';
import { analyzeMedicalImage, getSpecializedAnalysis, compareImages } from './providers/vision.ts';

const app = express();
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// AI Health endpoint for testing AI functionality
app.get('/api/ai/health', async (req, res) => {
  try {
    console.log('🤖 Testing AI health...');
    
    // Test OpenAI connection with minimal request
    const testResponse = await doctorReply({
      history: [{ role: 'user', content: 'test' }],
      redFlags: { triggered: false, reasons: [] }
    });
    
    console.log('✅ AI health check passed');
    res.json({
      status: 'healthy',
      ai: 'working',
      timestamp: new Date().toISOString(),
      testResponse: testResponse.substring(0, 100) + '...'
    });
  } catch (error) {
    console.error('❌ AI health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      ai: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Full AI chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    console.log('📝 Chat request received:', { 
      hasMessage: !!req.body?.message, 
      hasUserId: !!req.body?.userId,
      timestamp: new Date().toISOString() 
    });

    const { message, history = [], intake, userId } = req.body || {};
    if (!message || typeof message !== 'string') {
      console.log('❌ Invalid message:', { message, type: typeof message });
      return res.status(400).json({ error: 'message requerido' });
    }

    console.log('🔍 Processing message:', message.substring(0, 100) + '...');

    // Check free question eligibility if userId is provided
    let freeQuestionUsed = false;
    let freeQuestionMessage = '';
    
    if (userId) {
      try {
        console.log('🎯 Checking free question eligibility for user:', userId);
        const eligibility = await checkFreeQuestionEligibility(userId);
        console.log('✅ Free question eligibility:', eligibility);
        
        if (!eligibility.eligible) {
          console.log('💳 Free questions exhausted for user:', userId);
          return res.status(402).json({ 
            error: 'Free questions exhausted',
            message: eligibility.message,
            careLevel: 'PAYMENT_REQUIRED'
          });
        }
      } catch (error) {
        console.error('❌ Error checking free question eligibility:', error);
        // Continue without free question check if there's an error
      }
    }

    console.log('🚨 Evaluating red flags...');
    const red = evaluateRedFlags({ message, intake });
    console.log('🚨 Red flags result:', { triggered: red.triggered, reasons: red.reasons });
    
    if (red.triggered) {
      const msg = `Con tus datos hay señales de alarma. Motivo: ${red.reasons.join('; ')}. Te recomiendo acudir a urgencias ahora mismo.\n\nEsto no sustituye una evaluación médica profesional.`;
      
      // Use free question if available
      if (userId) {
        try {
          console.log('💳 Using free question for red flag response...');
          const result = await useFreeQuestion(userId);
          freeQuestionUsed = result.success;
          freeQuestionMessage = result.message;
          console.log('✅ Free question used:', result);
        } catch (error) {
          console.error('❌ Error using free question:', error);
        }
      }
      
      console.log('🚨 Returning red flag response');
      return res.json({ 
        careLevel: red.action || 'ER', 
        redFlags: red, 
        message: msg,
        freeQuestionUsed,
        freeQuestionMessage
      });
    }

    console.log('🤖 Generating AI reply...');
    const reply = await doctorReply({ history: [...history, { role: 'user', content: message }], redFlags: red });
    console.log('✅ AI reply generated:', reply.substring(0, 100) + '...');
    
    // Use free question if available
    if (userId) {
      try {
        console.log('💳 Using free question for AI reply...');
        const result = await useFreeQuestion(userId);
        freeQuestionUsed = result.success;
        freeQuestionMessage = result.message;
        console.log('✅ Free question used:', result);
      } catch (error) {
        console.error('❌ Error using free question:', error);
      }
    }
    
    console.log('✅ Returning successful response');
    res.json({ 
      careLevel: 'PRIMARY', 
      redFlags: red, 
      message: reply,
      freeQuestionUsed,
      freeQuestionMessage
    });
  } catch (e) {
    console.error('❌ Chat endpoint error:', e);
    console.error('❌ Error stack:', e.stack);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
});

// Free questions eligibility endpoint
app.get('/api/free-questions/:userId/eligibility', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🎯 Checking free question eligibility for user:', userId);
    
    const eligibility = await checkFreeQuestionEligibility(userId);
    console.log('✅ Free question eligibility:', eligibility);
    
    res.json(eligibility);
  } catch (error) {
    console.error('❌ Error checking free question eligibility:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// AI Referral System endpoints
app.post('/api/referrals', async (req, res) => {
  try {
    const { patientId, symptoms, specialty, urgency, location } = req.body;
    console.log('📋 Creating AI referral:', { patientId, specialty, urgency });
    
    const referral = await createAIReferral({
      patientId,
      symptoms,
      specialty,
      urgency,
      location
    });
    
    console.log('✅ AI referral created:', referral.id);
    res.json(referral);
  } catch (error) {
    console.error('❌ Error creating AI referral:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/referrals/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('📋 Getting referrals for doctor:', doctorId);
    
    const referrals = await getAIReferrals(doctorId);
    console.log('✅ Found referrals:', referrals.length);
    
    res.json(referrals);
  } catch (error) {
    console.error('❌ Error getting referrals:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/referrals/:referralId/status', async (req, res) => {
  try {
    const { referralId } = req.params;
    const { status, doctorId } = req.body;
    console.log('📋 Updating referral status:', { referralId, status });
    
    await updateReferralStatus(referralId, status, doctorId);
    console.log('✅ Referral status updated');
    
    res.json({ success: true, message: 'Referral status updated successfully' });
  } catch (error) {
    console.error('❌ Error updating referral status:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/:doctorId/availability', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('📅 Getting doctor availability:', doctorId);
    
    const availability = await getDoctorAvailability(doctorId);
    console.log('✅ Doctor availability retrieved');
    
    res.json(availability);
  } catch (error) {
    console.error('❌ Error getting doctor availability:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Booking System endpoints
app.post('/api/bookings', async (req, res) => {
  try {
    const { referralId, doctorId, patientId, appointmentTime, appointmentDate, duration, type, notes, patientInfo } = req.body;
    console.log('📅 Creating appointment booking:', { referralId, doctorId, appointmentTime, appointmentDate });
    
    const booking = await createBooking({
      referralId,
      doctorId,
      patientId,
      appointmentTime,
      appointmentDate,
      duration: duration || 30,
      type: type || 'consultation',
      notes,
      patientInfo
    });
    
    console.log('✅ Appointment booking created:', booking.id);
    res.json(booking);
  } catch (error) {
    console.error('❌ Error creating appointment booking:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/:doctorId/slots/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    console.log('📅 Getting available slots:', { doctorId, date });
    
    const slots = await getAvailableSlots(doctorId, date);
    console.log('✅ Available slots retrieved:', slots.length);
    
    res.json(slots);
  } catch (error) {
    console.error('❌ Error getting available slots:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/:doctorId/bookings', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;
    console.log('📅 Getting doctor bookings:', { doctorId, startDate, endDate });
    
    const bookings = await getDoctorBookings(
      doctorId, 
      startDate as string || new Date().toISOString().split('T')[0],
      endDate as string || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    
    console.log('✅ Doctor bookings retrieved:', bookings.length);
    res.json(bookings);
  } catch (error) {
    console.error('❌ Error getting doctor bookings:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/patients/:patientId/bookings', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { upcoming } = req.query;
    console.log('📅 Getting patient bookings:', { patientId, upcoming });
    
    const bookings = await getPatientBookings(patientId, upcoming === 'true');
    console.log('✅ Patient bookings retrieved:', bookings.length);
    
    res.json(bookings);
  } catch (error) {
    console.error('❌ Error getting patient bookings:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/bookings/:bookingId/cancel', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    console.log('📅 Cancelling booking:', { bookingId, reason });
    
    await cancelBooking(bookingId, reason);
    console.log('✅ Booking cancelled successfully');
    
    res.json({ success: true, message: 'Cita cancelada exitosamente' });
  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Payment System endpoints
app.post('/api/payments/checkout', async (req, res) => {
  try {
    const { amount, description, customerEmail, customerName, metadata, successUrl, cancelUrl } = req.body;
    console.log('💳 Creating checkout session:', { amount, description, customerEmail });
    
    const checkoutSession = await createCheckoutSession({
      amount: convertToCentavos(amount),
      currency: 'MXN',
      description,
      customerEmail,
      customerName,
      metadata,
      successUrl,
      cancelUrl
    });
    
    console.log('✅ Checkout session created:', checkoutSession.id);
    res.json(checkoutSession);
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/payments/intent', async (req, res) => {
  try {
    const { amount, description, customerEmail, customerName, metadata } = req.body;
    console.log('💳 Creating payment intent:', { amount, description, customerEmail });
    
    const paymentIntent = await createPaymentIntent({
      amount: convertToCentavos(amount),
      currency: 'MXN',
      description,
      customerEmail,
      customerName,
      metadata
    });
    
    console.log('✅ Payment intent created:', paymentIntent.id);
    res.json(paymentIntent);
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/payments/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('💳 Retrieving checkout session:', sessionId);
    
    const session = await getCheckoutSession(sessionId);
    console.log('✅ Checkout session retrieved');
    
    res.json(session);
  } catch (error) {
    console.error('❌ Error retrieving checkout session:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/payments/intent/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    console.log('💳 Retrieving payment intent:', paymentIntentId);
    
    const paymentIntent = await getPaymentIntent(paymentIntentId);
    console.log('✅ Payment intent retrieved');
    
    res.json(paymentIntent);
  } catch (error) {
    console.error('❌ Error retrieving payment intent:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/payments/webhook', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = JSON.stringify(req.body);
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ Missing STRIPE_WEBHOOK_SECRET');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }
    
    // Validate webhook signature
    if (!validateWebhookSignature(payload, signature, webhookSecret)) {
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    console.log('💳 Processing webhook event:', req.body.type);
    
    await handleWebhookEvent(req.body);
    
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Q&A Board endpoints
app.get('/api/qa/questions', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    console.log('❓ Getting Q&A questions:', { page, limit, category, search });
    
    const result = await getQuestions(
      parseInt(page as string),
      parseInt(limit as string),
      category as string,
      search as string
    );
    
    console.log('✅ Q&A questions retrieved:', result.questions.length);
    res.json(result);
  } catch (error) {
    console.error('❌ Error getting Q&A questions:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/qa/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    console.log('❓ Getting Q&A question with answers:', questionId);
    
    const question = await getQuestionWithAnswers(questionId);
    
    if (!question) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }
    
    // Increment view count
    await incrementQuestionViews(questionId);
    
    console.log('✅ Q&A question retrieved with', question.answers.length, 'answers');
    res.json(question);
  } catch (error) {
    console.error('❌ Error getting Q&A question:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/qa/questions', async (req, res) => {
  try {
    const { title, content, category, tags, author_name, author_email, is_anonymous } = req.body;
    console.log('❓ Creating Q&A question:', { title, category });
    
    const question = await createQuestion({
      title,
      content,
      category,
      tags,
      author_name,
      author_email,
      is_anonymous
    });
    
    console.log('✅ Q&A question created:', question.id);
    res.json(question);
  } catch (error) {
    console.error('❌ Error creating Q&A question:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/qa/answers', async (req, res) => {
  try {
    const { question_id, content, author_name, author_email, is_anonymous, is_verified_doctor, doctor_id } = req.body;
    console.log('❓ Creating Q&A answer:', { question_id });
    
    const answer = await createAnswer({
      question_id,
      content,
      author_name,
      author_email,
      is_anonymous,
      is_verified_doctor,
      doctor_id
    });
    
    console.log('✅ Q&A answer created:', answer.id);
    res.json(answer);
  } catch (error) {
    console.error('❌ Error creating Q&A answer:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/qa/like', async (req, res) => {
  try {
    const { question_id, answer_id, user_ip, user_agent } = req.body;
    console.log('❓ Liking Q&A item:', { question_id, answer_id });
    
    const result = await likeItem({
      question_id,
      answer_id,
      user_ip,
      user_agent
    });
    
    console.log('✅ Q&A like result:', result.success);
    res.json(result);
  } catch (error) {
    console.error('❌ Error liking Q&A item:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/qa/helpful', async (req, res) => {
  try {
    const { answer_id, helpful, user_ip, user_agent } = req.body;
    console.log('❓ Rating Q&A answer helpful:', { answer_id, helpful });
    
    const result = await rateAnswerHelpful({
      answer_id,
      helpful,
      user_ip,
      user_agent
    });
    
    console.log('✅ Q&A helpful rating result:', result.success);
    res.json(result);
  } catch (error) {
    console.error('❌ Error rating Q&A answer helpful:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/qa/categories', async (req, res) => {
  try {
    console.log('❓ Getting Q&A categories');
    
    const categories = await getCategories();
    console.log('✅ Q&A categories retrieved:', categories.length);
    
    res.json(categories);
  } catch (error) {
    console.error('❌ Error getting Q&A categories:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/qa/tags', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    console.log('❓ Getting Q&A popular tags');
    
    const tags = await getPopularTags(parseInt(limit as string));
    console.log('✅ Q&A tags retrieved:', tags.length);
    
    res.json(tags);
  } catch (error) {
    console.error('❌ Error getting Q&A tags:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin/Moderator endpoints
app.put('/api/qa/questions/:questionId/moderate', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { status, notes, moderator_id } = req.body;
    console.log('❓ Moderating Q&A question:', { questionId, status });
    
    await moderateQuestion(questionId, status, notes, moderator_id);
    console.log('✅ Q&A question moderated');
    
    res.json({ success: true, message: 'Pregunta moderada exitosamente' });
  } catch (error) {
    console.error('❌ Error moderating Q&A question:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/qa/answers/:answerId/moderate', async (req, res) => {
  try {
    const { answerId } = req.params;
    const { status, notes, moderator_id } = req.body;
    console.log('❓ Moderating Q&A answer:', { answerId, status });
    
    await moderateAnswer(answerId, status, notes, moderator_id);
    console.log('✅ Q&A answer moderated');
    
    res.json({ success: true, message: 'Respuesta moderada exitosamente' });
  } catch (error) {
    console.error('❌ Error moderating Q&A answer:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Affiliate Tracking endpoints
app.post('/api/affiliate/track', async (req, res) => {
  try {
    const { affiliate_id, event_type, event_data, user_ip, user_agent, referrer_url, utm_source, utm_medium, utm_campaign, utm_term, utm_content, conversion_value } = req.body;
    console.log('🔗 Tracking affiliate event:', { affiliate_id, event_type });
    
    const trackingId = await trackAffiliateEvent({
      affiliate_id,
      event_type,
      event_data,
      user_ip,
      user_agent,
      referrer_url,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      conversion_value
    });
    
    console.log('✅ Affiliate event tracked:', trackingId);
    res.json({ success: true, tracking_id: trackingId });
  } catch (error) {
    console.error('❌ Error tracking affiliate event:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/affiliate/:affiliateId/performance', async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const { start_date, end_date } = req.query;
    console.log('📊 Getting affiliate performance:', { affiliateId, start_date, end_date });
    
    const performance = await getAffiliatePerformance(
      affiliateId,
      start_date as string,
      end_date as string
    );
    
    console.log('✅ Affiliate performance retrieved:', performance.length, 'records');
    res.json(performance);
  } catch (error) {
    console.error('❌ Error getting affiliate performance:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/affiliate/:affiliateId/commissions', async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const { status } = req.query;
    console.log('💰 Getting affiliate commissions:', { affiliateId, status });
    
    const commissions = await getAffiliateCommissions(affiliateId, status as string);
    console.log('✅ Affiliate commissions retrieved:', commissions.length);
    
    res.json(commissions);
  } catch (error) {
    console.error('❌ Error getting affiliate commissions:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/affiliate/:affiliateId/materials', async (req, res) => {
  try {
    const { affiliateId } = req.params;
    console.log('📋 Getting affiliate marketing materials:', affiliateId);
    
    const materials = await getAffiliateMarketingMaterials(affiliateId);
    console.log('✅ Affiliate materials retrieved:', materials.length);
    
    res.json(materials);
  } catch (error) {
    console.error('❌ Error getting affiliate materials:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/affiliate/:affiliateId/analytics', async (req, res) => {
  try {
    const { affiliateId } = req.params;
    console.log('📈 Getting affiliate analytics:', affiliateId);
    
    const analytics = await getAffiliateAnalytics(affiliateId);
    console.log('✅ Affiliate analytics retrieved');
    
    res.json(analytics);
  } catch (error) {
    console.error('❌ Error getting affiliate analytics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/affiliate/:affiliateId/commission', async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const { referral_id, commission_type, amount } = req.body;
    console.log('💰 Creating affiliate commission:', { affiliateId, commission_type, amount });
    
    const commissionId = await createAffiliateCommission(affiliateId, referral_id, commission_type, amount);
    console.log('✅ Affiliate commission created:', commissionId);
    
    res.json({ success: true, commission_id: commissionId });
  } catch (error) {
    console.error('❌ Error creating affiliate commission:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/affiliate/:affiliateId/link', async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const { base_url, utm_source, utm_medium, utm_campaign } = req.body;
    console.log('🔗 Generating affiliate link:', { affiliateId, utm_source });
    
    const link = await generateAffiliateLink(affiliateId, base_url, utm_source, utm_medium, utm_campaign);
    console.log('✅ Affiliate link generated');
    
    res.json({ success: true, link });
  } catch (error) {
    console.error('❌ Error generating affiliate link:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/affiliate/:affiliateId/click', async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const { user_ip, user_agent, referrer_url, utm_params } = req.body;
    console.log('👆 Tracking affiliate click:', { affiliateId });
    
    await trackAffiliateClick(affiliateId, user_ip, user_agent, referrer_url, utm_params);
    console.log('✅ Affiliate click tracked');
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error tracking affiliate click:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/affiliate/:affiliateId/conversion', async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const { event_type, conversion_value, event_data } = req.body;
    console.log('🎯 Tracking affiliate conversion:', { affiliateId, event_type, conversion_value });
    
    await trackAffiliateConversion(affiliateId, event_type, conversion_value, event_data);
    console.log('✅ Affiliate conversion tracked');
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error tracking affiliate conversion:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Gamification endpoints
app.get('/api/gamification/points/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🏆 Getting health points for user:', userId);
    
    const healthPoints = await getUserHealthPoints(userId);
    console.log('✅ Health points retrieved');
    
    res.json(healthPoints);
  } catch (error) {
    console.error('❌ Error getting health points:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/gamification/points/:userId/add', async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, transaction_type, description, metadata } = req.body;
    console.log('🏆 Adding health points:', { userId, points, transaction_type });
    
    const result = await addHealthPoints(userId, points, transaction_type, description, metadata);
    console.log('✅ Health points added:', result.pointsAdded);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error adding health points:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/gamification/achievements/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🏆 Getting user achievements:', userId);
    
    const achievements = await getUserAchievements(userId);
    console.log('✅ User achievements retrieved:', achievements.length);
    
    res.json(achievements);
  } catch (error) {
    console.error('❌ Error getting user achievements:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/gamification/achievements', async (req, res) => {
  try {
    console.log('🏆 Getting all achievements');
    
    const achievements = await getAllAchievements();
    console.log('✅ All achievements retrieved:', achievements.length);
    
    res.json(achievements);
  } catch (error) {
    console.error('❌ Error getting all achievements:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/gamification/achievements/:userId/award', async (req, res) => {
  try {
    const { userId } = req.params;
    const { achievement_id, progress } = req.body;
    console.log('🏆 Awarding achievement:', { userId, achievement_id });
    
    const result = await awardAchievement(userId, achievement_id, progress);
    console.log('✅ Achievement awarded:', result.success);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error awarding achievement:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/gamification/goals/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🎯 Getting user health goals:', userId);
    
    const goals = await getUserHealthGoals(userId);
    console.log('✅ User health goals retrieved:', goals.length);
    
    res.json(goals);
  } catch (error) {
    console.error('❌ Error getting user health goals:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/gamification/goals/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, description, target_value, unit, category, target_date, points_reward } = req.body;
    console.log('🎯 Creating health goal:', { userId, title });
    
    const goal = await createHealthGoal(
      userId,
      title,
      description,
      target_value,
      unit,
      category,
      target_date,
      points_reward
    );
    console.log('✅ Health goal created:', goal.id);
    
    res.json(goal);
  } catch (error) {
    console.error('❌ Error creating health goal:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/gamification/goals/:goalId/progress', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { current_value } = req.body;
    console.log('🎯 Updating goal progress:', { goalId, current_value });
    
    const result = await updateHealthGoalProgress(goalId, current_value);
    console.log('✅ Goal progress updated:', result.success);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error updating goal progress:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/gamification/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    console.log('📊 Getting points transaction history:', { userId, limit });
    
    const transactions = await getPointsTransactionHistory(userId, parseInt(limit as string));
    console.log('✅ Points transactions retrieved:', transactions.length);
    
    res.json(transactions);
  } catch (error) {
    console.error('❌ Error getting points transactions:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/gamification/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    console.log('🏆 Getting leaderboard:', { limit });
    
    const leaderboard = await getLeaderboard(parseInt(limit as string));
    console.log('✅ Leaderboard retrieved:', leaderboard.length);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('❌ Error getting leaderboard:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/gamification/check-achievements/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { activity_type, metadata } = req.body;
    console.log('🏆 Checking achievements:', { userId, activity_type });
    
    const achievements = await checkAndAwardAchievements(userId, activity_type, metadata);
    console.log('✅ Achievements checked, awarded:', achievements.length);
    
    res.json({ success: true, achievements });
  } catch (error) {
    console.error('❌ Error checking achievements:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/gamification/streak/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔥 Updating user streak:', userId);
    
    const result = await updateUserStreak(userId);
    console.log('✅ User streak updated:', result.streakDays);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error updating user streak:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Vision Analysis endpoints
app.post('/api/vision/analyze', async (req, res) => {
  try {
    const { imageBase64, imageType, patientAge, patientGender, symptoms, medicalHistory } = req.body;
    console.log('👁️ Analyzing medical image:', { imageType, hasImage: !!imageBase64 });
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Imagen requerida' });
    }
    
    const analysis = await analyzeMedicalImage({
      imageBase64,
      imageType: imageType || 'general',
      patientAge,
      patientGender,
      symptoms,
      medicalHistory
    });
    
    console.log('✅ Vision analysis completed:', { urgency: analysis.urgency, confidence: analysis.confidence });
    res.json(analysis);
  } catch (error) {
    console.error('❌ Error analyzing medical image:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/vision/specialized', async (req, res) => {
  try {
    const { imageBase64, imageType, specialty } = req.body;
    console.log('👁️ Getting specialized analysis:', { imageType, specialty });
    
    if (!imageBase64 || !specialty) {
      return res.status(400).json({ error: 'Imagen y especialidad requeridas' });
    }
    
    const analysis = await getSpecializedAnalysis(imageBase64, imageType || 'general', specialty);
    console.log('✅ Specialized analysis completed:', { specialty, urgency: analysis.urgency });
    
    res.json(analysis);
  } catch (error) {
    console.error('❌ Error getting specialized analysis:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/vision/compare', async (req, res) => {
  try {
    const { images, imageType } = req.body;
    console.log('👁️ Comparing images:', { imageType, count: images?.length });
    
    if (!images || images.length < 2) {
      return res.status(400).json({ error: 'Se requieren al menos 2 imágenes para comparar' });
    }
    
    const comparison = await compareImages(images, imageType || 'general');
    console.log('✅ Image comparison completed:', { urgency: comparison.urgency });
    
    res.json(comparison);
  } catch (error) {
    console.error('❌ Error comparing images:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Doctor.mx API running on http://localhost:${PORT}`);
});