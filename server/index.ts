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
import { supabase } from './lib/supabase.js';
import { doctorReply } from './providers/openai.ts';
import { evaluateRedFlags } from './triage.ts';
import { getUserFreeQuestions, useFreeQuestion, checkFreeQuestionEligibility } from './providers/freeQuestions.ts';
import { createAIReferral, getAIReferrals, updateReferralStatus, createAppointmentBooking } from './providers/referralSystem.ts';
import { createBooking, getAvailableSlots, getDoctorBookings, cancelBooking, getPatientBookings } from './providers/booking.ts';
import { createCheckoutSession, createPaymentIntent, getCheckoutSession, getPaymentIntent, handleWebhookEvent, validateWebhookSignature, convertToCentavos, formatCurrency } from './providers/payments.ts';
import { getQuestions, getQuestionWithAnswers, createQuestion, createAnswer, likeItem, rateAnswerHelpful, incrementQuestionViews, getCategories, getPopularTags, moderateQuestion, moderateAnswer } from './providers/qaBoard.ts';
import { trackAffiliateEvent, getAffiliatePerformance, getAffiliateCommissions, getAffiliateMarketingMaterials, createAffiliateCommission, getAffiliateAnalytics, generateAffiliateLink, trackAffiliateClick, trackAffiliateConversion } from './providers/affiliateTracking.ts';
import { getUserHealthPoints, addHealthPoints, getUserAchievements, getAllAchievements, awardAchievement, getUserHealthGoals, createHealthGoal, updateHealthGoalProgress, getPointsTransactionHistory, getLeaderboard, checkAndAwardAchievements, updateUserStreak } from './providers/gamification.ts';
import { analyzeMedicalImage, getSpecializedAnalysis, compareImages } from './providers/vision.ts';
import { 
  getDoctorSubscriptionPlans, 
  getDoctorSubscription, 
  createDoctorSubscription, 
  cancelDoctorSubscription, 
  updateDoctorPaymentMethod, 
  hasActiveSubscription 
} from './providers/doctorSubscriptions.ts';
import {
  verifyCedulaProfesional,
  getDoctorVerificationStatus,
  updateDoctorVerificationStatus,
  getVerificationStatistics,
  cleanExpiredCache
} from './providers/sepVerification.ts';
import {
  submitDoctorReview,
  getDoctorReviews,
  updateDoctorStats,
  flagReviewForModeration,
  moderateReview,
  voteReviewHelpfulness,
  respondToReview,
  getReviewStatistics
} from './providers/ratings.ts';
import { findRelevantDoctors, getDoctorAvailability, createReferralRequest, getSpecialtyRecommendations } from './providers/doctorReferral.ts';
import {
  trackOnboardingEvent,
  getOnboardingFunnelMetrics,
  getDoctorAcquisitionStats,
  identifyDropoffPoints,
  getDoctorOnboardingEvents,
  getOnboardingSession,
  recordConversion,
  getConversionStatistics,
  getRealTimeOnboardingMetrics,
  exportOnboardingAnalytics
} from './providers/analytics.ts';
import { 
  initializeMedicalKnowledgeBase,
  retrieveMedicalContext,
  searchMedicalKnowledge,
  getMedicalKnowledgeStats,
  updateMedicalKnowledge,
  getDocumentsBySpecialty
} from './providers/medicalKnowledgeBase.ts';
import {
  getDoctorBadges,
  createDoctorBadge,
  updateDoctorBadge,
  deactivateDoctorBadge,
  getBadgeStatistics,
  verifyDoctorBadges
} from './providers/trustBadges.ts';

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

    // Fetch user data if userId is provided
    let userData = null;
    if (userId) {
      try {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('age, sex')
          .eq('id', userId)
          .single();
        
        if (!userError && user) {
          userData = user;
        }
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
      }
    }

    // Determine conversation stage based on history length and content
    const conversationStage = history.length === 0 ? 'initial' : 
                            history.length < 3 ? 'followup' : 
                            history.length < 6 ? 'detailed' : 'referral';

    console.log('🤖 Generating AI reply...');
    const reply = await doctorReply({ 
      history: [...history, { role: 'user', content: message }], 
      redFlags: red,
      patientData: {
        age: userData?.age,
        sex: userData?.sex,
        specialty: undefined // Could be determined from symptoms or user preferences
      },
      conversationStage
    });
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
    
    // Generate interactive response options based on conversation stage and content
    const generateResponseOptions = (reply, stage, message) => {
      const replyLower = reply.toLowerCase();
      const messageLower = message.toLowerCase();
      
      // Detect symptoms for adaptive actions
      const symptomPatterns = {
        respiratory: ['tos', 'respirar', 'falta de aire', 'asma', 'bronquitis', 'neumonía'],
        cardiovascular: ['corazón', 'pecho', 'palpitaciones', 'presión', 'hipertensión'],
        gastrointestinal: ['estómago', 'abdomen', 'nausea', 'vómito', 'diarrea', 'digestión'],
        neurological: ['cabeza', 'migraña', 'mareo', 'convulsión', 'desmayo'],
        dermatological: ['piel', 'erupción', 'sarpullido', 'picazón', 'manchas'],
        musculoskeletal: ['dolor', 'articulación', 'músculo', 'hueso', 'espalda', 'cuello']
      };

      const detectedSymptoms = Object.keys(symptomPatterns).filter(symptomType =>
        symptomPatterns[symptomType].some(pattern => 
          messageLower.includes(pattern) || replyLower.includes(pattern)
        )
      );

      // Map symptoms to specialties
      const specialtyMap = {
        respiratory: 'Neumología',
        cardiovascular: 'Cardiología',
        gastrointestinal: 'Gastroenterología',
        neurological: 'Neurología',
        dermatological: 'Dermatología',
        musculoskeletal: 'Ortopedia'
      };

      const suggestedSpecialty = detectedSymptoms.length > 0 ? 
        specialtyMap[detectedSymptoms[0]] || 'Medicina General' : 'Medicina General';

      // Build structured options
      const primary = [];
      const secondary = [];
      const overflow = [];

      // Baseline severity options (always available during exploration/analysis)
      if (stage === 'followup' || stage === 'detailed') {
        primary.push(
          { id: 'severity_mild', text: 'Leve', action: 'severity', value: 'mild', style: 'success', priority: 1 },
          { id: 'severity_moderate', text: 'Moderado', action: 'severity', value: 'moderate', style: 'warning', priority: 2 },
          { id: 'severity_severe', text: 'Severo', action: 'severity', value: 'severe', style: 'danger', priority: 3 }
        );
      }

      // Emergency options (highest priority)
      if (replyLower.includes('urgencia') || replyLower.includes('emergencia') || replyLower.includes('911')) {
        primary.unshift({
          id: 'emergency_call',
          text: '🚨 Llamar 911',
          action: 'emergency_call',
          style: 'danger',
          priority: 0
        });
        primary.unshift({
          id: 'find_hospital',
          text: '🏥 Buscar Hospital',
          action: 'find_hospital',
          style: 'danger',
          priority: 0
        });
      }

      // Specialist referral (adaptive based on symptoms)
      if (detectedSymptoms.length > 0 || replyLower.includes('especialista') || replyLower.includes('derivar') || replyLower.includes('especialidad')) {
        primary.push({
          id: 'find_specialist',
          text: `🔍 Buscar ${suggestedSpecialty}`,
          action: 'find_specialist',
          value: suggestedSpecialty,
          style: 'primary',
          priority: 4
        });
      }

      // Follow-up questions for followup stage
      if (stage === 'followup') {
        secondary.push(
          { id: 'duration', text: '¿Cuánto tiempo?', action: 'question', value: 'duration', style: 'secondary' },
          { id: 'frequency', text: '¿Con qué frecuencia?', action: 'question', value: 'frequency', style: 'secondary' },
          { id: 'triggers', text: '¿Qué lo empeora?', action: 'question', value: 'triggers', style: 'secondary' }
        );
      }

      // Treatment and appointment options
      if (replyLower.includes('medicamento') || replyLower.includes('tratamiento')) {
        secondary.push({
          id: 'prescription',
          text: '💊 Solicitar Receta',
          action: 'prescription',
          style: 'primary'
        });
      }

      if (stage === 'referral') {
        secondary.push({
          id: 'book_appointment',
          text: '📅 Agendar Cita',
          action: 'book_appointment',
          value: suggestedSpecialty,
          style: 'primary'
        });
      }

      // Image analysis option
      if (messageLower.includes('imagen') || messageLower.includes('foto') || stage === 'followup') {
        secondary.push({
          id: 'upload_image',
          text: '📷 Subir Imagen',
          action: 'upload_image',
          style: 'secondary'
        });
      }

      // Overflow menu options (always available)
      overflow.push(
        { id: 'second_opinion', text: 'Segunda Opinión', action: 'second_opinion', style: 'default' },
        { id: 'save_conversation', text: 'Guardar Conversación', action: 'save_conversation', style: 'default' },
        { id: 'share_with_doctor', text: 'Compartir con Doctor', action: 'share_with_doctor', style: 'default' }
      );

      // Sort primary options by priority
      primary.sort((a, b) => (a.priority || 999) - (b.priority || 999));

      // Limit primary to 3 options, secondary to 2, overflow unlimited
      return {
        primary: primary.slice(0, 3),
        secondary: secondary.slice(0, 2),
        overflow: overflow
      };
    };

    const responseOptions = generateResponseOptions(reply, conversationStage, message);

    console.log('✅ Returning successful response');
    res.json({ 
      reply: reply,
      freeQuestionUsed,
      remainingFreeQuestions: freeQuestionUsed ? 4 : 5, // This should be calculated properly
      redFlagsTriggered: false,
      conversationStage: conversationStage,
      responseOptions: responseOptions
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
    const { patientId, symptoms, additionalInfo } = req.body;
    console.log('📋 Creating AI referral:', { patientId, symptoms: symptoms?.substring(0, 50) + '...' });
    
    // Simple AI analysis for now
    const analysis = {
      needsReferral: true,
      urgency: 'high' as const,
      recommendedSpecialty: 'Cardiología',
      reasoning: 'Los síntomas de dolor de pecho con ejercicio y dificultad respiratoria requieren evaluación cardiológica urgente',
      redFlags: ['Dolor de pecho con ejercicio', 'Dificultad respiratoria', 'Historial familiar de infarto']
    };
    
    // Get available doctors
    const { data: doctors, error } = await supabase
      .from('doctors')
      .select(`
        *,
        users!inner(
          id,
          name,
          email,
          phone
        )
      `)
      .eq('license_status', 'verified')
      .limit(3);
    
    if (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
    
    const matchedDoctors = doctors?.map(doctor => ({
      doctor_id: doctor.user_id,
      match_score: 95,
      reasons: ['Especialidad exacta', 'Calificación alta', 'Disponibilidad inmediata'],
      availability: {
        next_available: '25/1/2024',
        time_slots: ['10:00', '14:00', '16:00']
      },
      estimated_wait_time: '2 horas',
      consultation_fee: 800,
      insurance_accepted: true
    })) || [];
    
    const referral = {
      referral_id: `ref_${Date.now()}`,
      patient_id: patientId || 'anonymous',
      ai_analysis: analysis,
      matched_doctors: matchedDoctors,
      created_at: new Date().toISOString()
    };
    
    console.log('✅ AI referral created:', referral.referral_id);
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

// Doctor Subscription endpoints
app.post('/api/doctors/:doctorId/subscribe', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { planId, paymentMethodId } = req.body;
    console.log('💳 Creating doctor subscription:', { doctorId, planId });
    
    const subscription = await createDoctorSubscription(doctorId, planId, paymentMethodId);
    console.log('✅ Doctor subscription created:', subscription.subscriptionId);
    
    res.json(subscription);
  } catch (error) {
    console.error('❌ Error creating doctor subscription:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/subscription-plans', async (req, res) => {
  try {
    console.log('💳 Getting doctor subscription plans');
    
    const plans = await getDoctorSubscriptionPlans();
    console.log('✅ Doctor subscription plans retrieved:', plans.length);
    
    res.json(plans);
  } catch (error) {
    console.error('❌ Error getting subscription plans:', error);
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

// Doctor Directory endpoints
        app.get('/api/doctors', async (req, res) => {
          try {
            const { specialty, search, available, location, sort = 'rating', limit = 1000, offset = 0 } = req.query;
            
            let query = supabase
              .from('doctors')
              .select(`
                *,
                users!inner(
                  id,
                  name,
                  email,
                  phone
                )
              `)
              .eq('license_status', 'verified');
            
            // Apply sorting
            switch (sort) {
              case 'rating':
                query = query.order('rating_avg', { ascending: false });
                break;
              case 'price':
                query = query.order('consultation_fees->base_fee', { ascending: true });
                break;
              case 'availability':
                query = query.order('response_time_avg', { ascending: true });
                break;
              case 'distance':
                query = query.order('created_at', { ascending: false });
                break;
              default:
                query = query.order('rating_avg', { ascending: false });
            }
            
            query = query.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);
            
            if (specialty && specialty !== 'Todas las especialidades') {
              query = query.contains('specialties', [specialty]);
            }
            
            if (search) {
              query = query.or(`users.name.ilike.%${search}%,specialties.cs.{${search}}`);
            }
            
            if (location) {
              query = query.ilike('full_name', `%${location}%`);
            }
            
            // Get total count for pagination
            const { count: totalCount } = await supabase
              .from('doctors')
              .select('*', { count: 'exact', head: true })
              .eq('license_status', 'verified');
            
            const { data: doctors, error } = await query.limit(parseInt(limit as string));
            
            if (error) {
              console.error('Error fetching doctors:', error);
              return res.status(500).json({ error: 'Error fetching doctors' });
            }
            
            res.json({ 
              doctors: doctors || [], 
              totalCount: totalCount || 0 
            });
          } catch (error) {
            console.error('Error in doctors endpoint:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

// Get single doctor by ID
app.get('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select(`
        *,
        users!inner(
          id,
          name,
          email,
          phone
        )
      `)
      .eq('user_id', id)
      .eq('license_status', 'verified')
      .single();
    
    // Ensure the doctor has a proper name
    if (doctor && !doctor.full_name && doctor.users?.name) {
      doctor.full_name = doctor.users.name;
    }
    
    if (error) {
      console.error('Error fetching doctor:', error);
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    res.json({ doctor });
  } catch (error) {
    console.error('Error in doctor endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor Subscription endpoints
app.get('/api/doctors/:doctorId/subscription', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('💳 Getting doctor subscription:', doctorId);
    
    const subscription = await getDoctorSubscription(doctorId);
    console.log('✅ Doctor subscription retrieved');
    
    res.json(subscription);
  } catch (error) {
    console.error('❌ Error getting doctor subscription:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/doctors/subscribe', async (req, res) => {
  try {
    const { doctorId, planId, paymentMethodId, email, name } = req.body;
    console.log('💳 Creating doctor subscription:', { doctorId, planId, email });
    
    const subscription = await createDoctorSubscription(doctorId, planId, paymentMethodId, email, name);
    console.log('✅ Doctor subscription created:', subscription.id);
    
    res.json(subscription);
  } catch (error) {
    console.error('❌ Error creating doctor subscription:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/doctors/:doctorId/subscription/cancel', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { reason } = req.body;
    console.log('💳 Canceling doctor subscription:', { doctorId, reason });
    
    const success = await cancelDoctorSubscription(doctorId, reason);
    console.log('✅ Doctor subscription canceled');
    
    res.json({ success, message: 'Suscripción cancelada exitosamente' });
  } catch (error) {
    console.error('❌ Error canceling doctor subscription:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/doctors/:doctorId/subscription/update-payment', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { paymentMethodId } = req.body;
    console.log('💳 Updating doctor payment method:', { doctorId });
    
    const success = await updateDoctorPaymentMethod(doctorId, paymentMethodId);
    console.log('✅ Doctor payment method updated');
    
    res.json({ success, message: 'Método de pago actualizado exitosamente' });
  } catch (error) {
    console.error('❌ Error updating payment method:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/:doctorId/subscription/events', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { limit = 50 } = req.query;
    console.log('💳 Getting doctor subscription events:', { doctorId, limit });
    
    const events = await getDoctorSubscriptionEvents(doctorId, parseInt(limit as string));
    console.log('✅ Doctor subscription events retrieved:', events.length);
    
    res.json(events);
  } catch (error) {
    console.error('❌ Error getting subscription events:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/:doctorId/subscription/status', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('💳 Checking doctor subscription status:', doctorId);
    
    const hasActive = await hasActiveSubscription(doctorId);
    console.log('✅ Doctor subscription status checked:', hasActive);
    
    res.json({ hasActiveSubscription: hasActive });
  } catch (error) {
    console.error('❌ Error checking subscription status:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Doctor subscription webhook endpoint
app.post('/api/webhooks/doctor-subscriptions', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = JSON.stringify(req.body);
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }
    
    const webhookSecret = process.env.STRIPE_DOCTOR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ Missing STRIPE_DOCTOR_WEBHOOK_SECRET');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }
    
    // Validate webhook signature
    if (!validateWebhookSignature(payload, signature, webhookSecret)) {
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    console.log('💳 Processing doctor subscription webhook event:', req.body.type);
    
    await handleSubscriptionWebhook(req.body);
    
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing doctor subscription webhook:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// SEP Verification endpoints
app.post('/api/doctors/verify-cedula', async (req, res) => {
  try {
    const { cedula, doctorName } = req.body;
    console.log('🔍 Verifying cédula profesional:', { cedula, doctorName });
    
    if (!cedula || !doctorName) {
      return res.status(400).json({ error: 'Cédula y nombre del doctor son requeridos' });
    }
    
    const result = await verifyCedulaProfesional(cedula, doctorName);
    console.log('✅ Cédula verification completed:', result.status);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error verifying cédula:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/verification-status/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('🔍 Getting verification status for doctor:', doctorId);
    
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('cedula, license_status, users!inner(name)')
      .eq('user_id', doctorId)
      .single();
    
    if (error) throw error;
    
    let verificationResult = null;
    if (doctor.cedula) {
      verificationResult = await verifyCedulaProfesional(doctor.cedula, doctor.users.name);
    }
    
    const status = {
      doctorId,
      cedula: doctor.cedula,
      licenseStatus: doctor.license_status,
      verificationResult,
      lastChecked: new Date().toISOString()
    };
    
    console.log('✅ Verification status retrieved');
    res.json(status);
  } catch (error) {
    console.error('❌ Error getting verification status:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/cedula/:cedulaNumber/details', async (req, res) => {
  try {
    const { cedulaNumber } = req.params;
    console.log('🔍 Getting cédula details:', cedulaNumber);
    
    const details = await getCedulaDetails(cedulaNumber);
    console.log('✅ Cédula details retrieved');
    
    res.json(details);
  } catch (error) {
    console.error('❌ Error getting cédula details:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/cedula/:cedulaNumber/status', async (req, res) => {
  try {
    const { cedulaNumber } = req.params;
    console.log('🔍 Checking cédula status:', cedulaNumber);
    
    const status = await checkCedulaStatus(cedulaNumber);
    console.log('✅ Cédula status checked:', status);
    
    res.json({ cedula: cedulaNumber, status });
  } catch (error) {
    console.error('❌ Error checking cédula status:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/admin/verification-stats', async (req, res) => {
  try {
    console.log('📊 Getting verification statistics');
    
    const stats = await getVerificationStats();
    console.log('✅ Verification stats retrieved');
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error getting verification stats:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/admin/clear-verification-cache', async (req, res) => {
  try {
    console.log('🧹 Clearing expired verification cache');
    
    await clearExpiredCache();
    console.log('✅ Verification cache cleared');
    
    res.json({ success: true, message: 'Cache de verificación limpiado exitosamente' });
  } catch (error) {
    console.error('❌ Error clearing verification cache:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Medical Knowledge Base endpoints
app.post('/api/admin/medical-knowledge/initialize', async (req, res) => {
  try {
    console.log('🏥 Initializing medical knowledge base');
    
    await initializeMedicalKnowledgeBase();
    console.log('✅ Medical knowledge base initialized');
    
    res.json({ success: true, message: 'Base de conocimiento médico inicializada exitosamente' });
  } catch (error) {
    console.error('❌ Error initializing medical knowledge base:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/medical-knowledge/retrieve', async (req, res) => {
  try {
    const { symptoms, patientData } = req.body;
    console.log('🔍 Retrieving medical context:', { symptoms, patientData });
    
    const context = await retrieveMedicalContext(symptoms, patientData);
    console.log('✅ Medical context retrieved:', context.total_results, 'documents');
    
    res.json(context);
  } catch (error) {
    console.error('❌ Error retrieving medical context:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/medical-knowledge/search', async (req, res) => {
  try {
    const { q: query, specialty, limit = 10 } = req.query;
    console.log('🔍 Searching medical knowledge:', { query, specialty, limit });
    
    const results = await searchMedicalKnowledge(query as string, specialty as string, parseInt(limit as string));
    console.log('✅ Medical knowledge search completed:', results.length, 'results');
    
    res.json(results);
  } catch (error) {
    console.error('❌ Error searching medical knowledge:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/medical-knowledge/specialty/:specialty', async (req, res) => {
  try {
    const { specialty } = req.params;
    console.log('🔍 Getting documents by specialty:', specialty);
    
    const documents = await getDocumentsBySpecialty(specialty);
    console.log('✅ Documents retrieved for specialty:', documents.length);
    
    res.json(documents);
  } catch (error) {
    console.error('❌ Error getting documents by specialty:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/admin/medical-knowledge/stats', async (req, res) => {
  try {
    console.log('📊 Getting medical knowledge statistics');
    
    const stats = await getMedicalKnowledgeStats();
    console.log('✅ Medical knowledge stats retrieved');
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error getting medical knowledge stats:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/admin/medical-knowledge/update', async (req, res) => {
  try {
    console.log('🔄 Updating medical knowledge base');
    
    await updateMedicalKnowledge();
    console.log('✅ Medical knowledge base updated');
    
    res.json({ success: true, message: 'Base de conocimiento médico actualizada exitosamente' });
  } catch (error) {
    console.error('❌ Error updating medical knowledge base:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ratings and Reviews endpoints
app.post('/api/reviews/submit', async (req, res) => {
  try {
    const { doctor_id, patient_id, consult_id, rating, review_text, response_time_rating, professionalism_rating, clarity_rating, is_anonymous } = req.body;
    console.log('⭐ Submitting doctor review:', { doctor_id, patient_id, rating });
    
    const review = await submitDoctorReview({
      doctor_id,
      patient_id,
      consult_id,
      rating,
      review_text,
      response_time_rating,
      professionalism_rating,
      clarity_rating,
      is_anonymous
    });
    
    console.log('✅ Doctor review submitted:', review.id);
    res.json(review);
  } catch (error) {
    console.error('❌ Error submitting review:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/:doctorId/rating', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('⭐ Getting doctor rating:', doctorId);
    
    const rating = await getDoctorRating(doctorId);
    console.log('✅ Doctor rating retrieved');
    
    res.json(rating);
  } catch (error) {
    console.error('❌ Error getting doctor rating:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// SEP Verification endpoints
app.post('/api/doctors/verify-cedula', async (req, res) => {
  try {
    const { cedulaNumber, doctorName } = req.body;
    console.log('🔍 Verifying cédula:', cedulaNumber);
    
    const verificationResult = await verifyCedulaProfesional(cedulaNumber, doctorName);
    console.log('✅ Cédula verification completed:', verificationResult.status);
    
    res.json(verificationResult);
  } catch (error) {
    console.error('❌ Error verifying cédula:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/:doctorId/verification-status', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('🔍 Getting doctor verification status:', doctorId);
    
    const verificationStatus = await getDoctorVerificationStatus(doctorId);
    console.log('✅ Doctor verification status retrieved');
    
    res.json({ verificationStatus });
  } catch (error) {
    console.error('❌ Error getting verification status:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/doctors/:doctorId/verify', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { cedulaNumber, doctorName } = req.body;
    console.log('🔍 Starting verification for doctor:', doctorId);
    
    // Verify cédula
    const verificationResult = await verifyCedulaProfesional(cedulaNumber, doctorName);
    
    // Update doctor verification status
    await updateDoctorVerificationStatus(doctorId, verificationResult);
    
    console.log('✅ Doctor verification completed:', verificationResult.status);
    
    res.json({
      success: true,
      verificationResult,
      message: verificationResult.isValid 
        ? 'Verificación exitosa' 
        : 'Verificación fallida'
    });
  } catch (error) {
    console.error('❌ Error verifying doctor:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/admin/verification-statistics', async (req, res) => {
  try {
    console.log('📊 Getting verification statistics');
    
    const statistics = await getVerificationStatistics();
    console.log('✅ Verification statistics retrieved');
    
    res.json(statistics);
  } catch (error) {
    console.error('❌ Error getting verification statistics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/admin/clean-verification-cache', async (req, res) => {
  try {
    console.log('🧹 Cleaning expired verification cache');
    
    await cleanExpiredCache();
    console.log('✅ Verification cache cleaned');
    
    res.json({ success: true, message: 'Cache limpiado exitosamente' });
  } catch (error) {
    console.error('❌ Error cleaning verification cache:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Doctor Ratings and Reviews endpoints
app.post('/api/doctors/:doctorId/reviews', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviewData = req.body;
    console.log('⭐ Submitting doctor review:', doctorId);
    
    // Get patient ID from auth (in a real app, this would come from JWT)
    const patientId = req.headers['x-user-id'] as string;
    if (!patientId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const review = await submitDoctorReview(reviewData, patientId);
    console.log('✅ Doctor review submitted:', review.id);
    
    res.json({ review });
  } catch (error) {
    console.error('❌ Error submitting doctor review:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/:doctorId/rating', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('⭐ Getting doctor rating:', doctorId);
    
    const rating = await getDoctorRating(doctorId);
    console.log('✅ Doctor rating retrieved');
    
    res.json({ rating });
  } catch (error) {
    console.error('❌ Error getting doctor rating:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/:doctorId/reviews', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { limit = 10, offset = 0, include_responses = true } = req.query;
    console.log('⭐ Getting doctor reviews:', { doctorId, limit, offset });
    
    const result = await getDoctorReviews(
      doctorId, 
      parseInt(limit as string), 
      parseInt(offset as string),
      include_responses === 'true'
    );
    console.log('✅ Doctor reviews retrieved:', result.reviews.length);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error getting doctor reviews:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/reviews/:reviewId/flag', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;
    const userId = req.headers['x-user-id'] as string;
    console.log('🚩 Flagging review:', reviewId);
    
    await flagReviewForModeration(reviewId, reason, description, userId);
    console.log('✅ Review flagged');
    
    res.json({ success: true, message: 'Reseña reportada para moderación' });
  } catch (error) {
    console.error('❌ Error flagging review:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/reviews/:reviewId/vote', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { is_helpful } = req.body;
    const userId = req.headers['x-user-id'] as string;
    console.log('👍 Voting on review:', reviewId, is_helpful);
    
    await voteReviewHelpfulness(reviewId, userId, is_helpful);
    console.log('✅ Review vote recorded');
    
    res.json({ success: true, message: 'Voto registrado' });
  } catch (error) {
    console.error('❌ Error voting on review:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/reviews/:reviewId/respond', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response_text } = req.body;
    const doctorId = req.headers['x-user-id'] as string;
    console.log('💬 Responding to review:', reviewId);
    
    await respondToReview(reviewId, doctorId, response_text);
    console.log('✅ Doctor response added');
    
    res.json({ success: true, message: 'Respuesta agregada' });
  } catch (error) {
    console.error('❌ Error responding to review:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/admin/review-statistics', async (req, res) => {
  try {
    console.log('📊 Getting review statistics');
    
    const statistics = await getReviewStatistics();
    console.log('✅ Review statistics retrieved');
    
    res.json(statistics);
  } catch (error) {
    console.error('❌ Error getting review statistics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Onboarding Analytics endpoints
app.post('/api/analytics/track-event', async (req, res) => {
  try {
    const {
      doctorId,
      email,
      eventName,
      eventData,
      sessionId,
      userAgent,
      ipAddress,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    } = req.body;
    
    console.log('📊 Tracking onboarding event:', eventName);
    
    const eventId = await trackOnboardingEvent(
      doctorId,
      email,
      eventName,
      eventData,
      sessionId,
      userAgent,
      ipAddress,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    );
    
    console.log('✅ Onboarding event tracked:', eventId);
    
    res.json({ eventId, success: true });
  } catch (error) {
    console.error('❌ Error tracking onboarding event:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/analytics/funnel-metrics', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    console.log('📊 Getting onboarding funnel metrics');
    
    const metrics = await getOnboardingFunnelMetrics(
      start_date as string,
      end_date as string
    );
    
    console.log('✅ Funnel metrics retrieved');
    
    res.json({ metrics });
  } catch (error) {
    console.error('❌ Error getting funnel metrics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/analytics/acquisition-stats', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    console.log('📊 Getting doctor acquisition stats');
    
    const stats = await getDoctorAcquisitionStats(
      start_date as string,
      end_date as string
    );
    
    console.log('✅ Acquisition stats retrieved');
    
    res.json({ stats });
  } catch (error) {
    console.error('❌ Error getting acquisition stats:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/analytics/dropoff-points', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    console.log('📊 Identifying dropoff points');
    
    const dropoffPoints = await identifyDropoffPoints(
      start_date as string,
      end_date as string
    );
    
    console.log('✅ Dropoff points identified');
    
    res.json({ dropoffPoints });
  } catch (error) {
    console.error('❌ Error identifying dropoff points:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/analytics/real-time-metrics', async (req, res) => {
  try {
    console.log('📊 Getting real-time onboarding metrics');
    
    const metrics = await getRealTimeOnboardingMetrics();
    
    console.log('✅ Real-time metrics retrieved');
    
    res.json(metrics);
  } catch (error) {
    console.error('❌ Error getting real-time metrics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/analytics/record-conversion', async (req, res) => {
  try {
    const {
      doctorId,
      conversionType,
      conversionSource,
      conversionValue,
      timeToConvertMinutes,
      metadata
    } = req.body;
    
    console.log('📊 Recording conversion:', conversionType);
    
    const conversion = await recordConversion(
      doctorId,
      conversionType,
      conversionSource,
      conversionValue,
      timeToConvertMinutes,
      metadata
    );
    
    console.log('✅ Conversion recorded:', conversion.id);
    
    res.json({ conversion, success: true });
  } catch (error) {
    console.error('❌ Error recording conversion:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/analytics/conversion-statistics', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    console.log('📊 Getting conversion statistics');
    
    const statistics = await getConversionStatistics(
      start_date as string,
      end_date as string
    );
    
    console.log('✅ Conversion statistics retrieved');
    
    res.json(statistics);
  } catch (error) {
    console.error('❌ Error getting conversion statistics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/analytics/export', async (req, res) => {
  try {
    const { start_date, end_date, format = 'json' } = req.query;
    console.log('📊 Exporting onboarding analytics');
    
    const exportData = await exportOnboardingAnalytics(
      start_date as string,
      end_date as string,
      format as 'csv' | 'json'
    );
    
    console.log('✅ Analytics exported');
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="onboarding-analytics.csv"');
      res.send(exportData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="onboarding-analytics.json"');
      res.send(exportData);
    }
  } catch (error) {
    console.error('❌ Error exporting analytics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/:doctorId/onboarding-events', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { limit = 50 } = req.query;
    console.log('📊 Getting doctor onboarding events:', doctorId);
    
    const events = await getDoctorOnboardingEvents(doctorId, parseInt(limit as string));
    
    console.log('✅ Doctor onboarding events retrieved');
    
    res.json({ events });
  } catch (error) {
    console.error('❌ Error getting doctor onboarding events:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Trust Badges endpoints
app.get('/api/doctors/:doctorId/badges', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('🏆 Getting doctor badges:', doctorId);
    
    const badges = await getDoctorBadges(doctorId);
    console.log('✅ Doctor badges retrieved:', badges.length);
    
    res.json({ badges });
  } catch (error) {
    console.error('❌ Error getting doctor badges:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/doctors/:doctorId/badges', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const badgeData = req.body;
    console.log('🏆 Creating doctor badge:', doctorId);
    
    const badge = await createDoctorBadge({
      doctor_id: doctorId,
      ...badgeData
    });
    console.log('✅ Doctor badge created');
    
    res.json({ badge });
  } catch (error) {
    console.error('❌ Error creating doctor badge:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/badges/:badgeId', async (req, res) => {
  try {
    const { badgeId } = req.params;
    const updates = req.body;
    console.log('🏆 Updating badge:', badgeId);
    
    const badge = await updateDoctorBadge(badgeId, updates);
    console.log('✅ Badge updated');
    
    res.json({ badge });
  } catch (error) {
    console.error('❌ Error updating badge:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.delete('/api/badges/:badgeId', async (req, res) => {
  try {
    const { badgeId } = req.params;
    console.log('🏆 Deactivating badge:', badgeId);
    
    await deactivateDoctorBadge(badgeId);
    console.log('✅ Badge deactivated');
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error deactivating badge:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/badges/types', async (req, res) => {
  try {
    console.log('🏆 Getting badge types');
    
    // Return available badge types
    const types = ['sep_verified', 'nom_004', 'nom_024', 'data_privacy', 'top_rated', 'fast_responder', 'highly_experienced', 'active_subscription', 'specialty_expert', 'patient_favorite', 'compliance_champion', 'early_adopter'];
    console.log('✅ Badge types retrieved:', types.length);
    
    res.json({ types });
  } catch (error) {
    console.error('❌ Error getting badge types:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/badges/statistics', async (req, res) => {
  try {
    console.log('🏆 Getting badge statistics');
    
    const stats = await getBadgeStatistics();
    console.log('✅ Badge statistics retrieved');
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error getting badge statistics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/doctors/:doctorId/verify-badges', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('🏆 Verifying doctor badges:', doctorId);
    
    const badges = await verifyDoctorBadges(doctorId);
    console.log('✅ Doctor badges verified:', badges.length);
    
    res.json({ badges });
  } catch (error) {
    console.error('❌ Error verifying doctor badges:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/:doctorId/reviews', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    console.log('⭐ Getting doctor reviews:', { doctorId, limit, offset });
    
    const result = await getDoctorReviews(doctorId, parseInt(limit as string), parseInt(offset as string));
    console.log('✅ Doctor reviews retrieved:', result.reviews.length);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error getting doctor reviews:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/doctors/:doctorId/stats/update', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('⭐ Updating doctor stats:', doctorId);
    
    const stats = await updateDoctorStats(doctorId);
    console.log('✅ Doctor stats updated');
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error updating doctor stats:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/reviews/:reviewId/flag', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { flagged_by, reason, description } = req.body;
    console.log('🚩 Flagging review:', { reviewId, reason });
    
    const flag = await flagReviewForModeration(reviewId, flagged_by, reason, description);
    console.log('✅ Review flagged');
    
    res.json(flag);
  } catch (error) {
    console.error('❌ Error flagging review:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/reviews/:reviewId/moderate', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action, moderator_id, reason, notes } = req.body;
    console.log('🔧 Moderating review:', { reviewId, action });
    
    const moderation = await moderateReview(reviewId, action, moderator_id, reason, notes);
    console.log('✅ Review moderated');
    
    res.json(moderation);
  } catch (error) {
    console.error('❌ Error moderating review:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/doctors/top-rated', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    console.log('⭐ Getting top rated doctors:', { limit });
    
    const doctors = await getTopRatedDoctors(parseInt(limit as string));
    console.log('✅ Top rated doctors retrieved:', doctors.length);
    
    res.json(doctors);
  } catch (error) {
    console.error('❌ Error getting top rated doctors:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/admin/reviews/statistics', async (req, res) => {
  try {
    console.log('📊 Getting review statistics');
    
    const stats = await getReviewStatistics();
    console.log('✅ Review statistics retrieved');
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error getting review statistics:', error);
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

// Doctor Referral System endpoints
app.post('/api/doctors/find-relevant', async (req, res) => {
  try {
    const { symptoms, urgency, location, maxFee, languages, verifiedOnly } = req.body;
    console.log('🔍 Finding relevant doctors:', { symptoms, urgency, location });

    if (!symptoms || !urgency) {
      return res.status(400).json({ error: 'Síntomas y urgencia son requeridos' });
    }

    const criteria = {
      specialty: undefined, // Will be determined from symptoms
      urgency: urgency as 'emergency' | 'urgent' | 'routine',
      location,
      maxFee,
      languages,
      verifiedOnly
    };

    // Get specialty recommendations based on symptoms
    const specialtyRecommendations = await getSpecialtyRecommendations(symptoms);
    console.log('🎯 Specialty recommendations:', specialtyRecommendations);

    // Find doctors for each recommended specialty, or all doctors if no specific specialty
    const allDoctors = [];
    if (specialtyRecommendations.length > 0) {
      for (const specialty of specialtyRecommendations) {
        const doctors = await findRelevantDoctors({ ...criteria, specialty });
        allDoctors.push(...doctors);
      }
    } else {
      // If no specific specialty recommendations, get all verified doctors
      const doctors = await findRelevantDoctors(criteria);
      allDoctors.push(...doctors);
    }

    // Remove duplicates and sort by relevance
    const uniqueDoctors = allDoctors.filter((doctor, index, self) => 
      index === self.findIndex(d => d.id === doctor.id)
    );

    console.log(`✅ Found ${uniqueDoctors.length} relevant doctors`);
    res.json({ doctors: uniqueDoctors, specialtyRecommendations });

  } catch (error) {
    console.error('❌ Error finding relevant doctors:', error);
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
    console.log('✅ Doctor availability retrieved:', availability);

    res.json(availability);

  } catch (error) {
    console.error('❌ Error getting doctor availability:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/referrals/create', async (req, res) => {
  try {
    const { patientId, doctorId, symptoms, urgency, message } = req.body;
    console.log('📋 Creating referral request:', { patientId, doctorId, urgency });

    if (!patientId || !doctorId || !symptoms || !urgency) {
      return res.status(400).json({ error: 'Datos requeridos: patientId, doctorId, symptoms, urgency' });
    }

    const result = await createReferralRequest({
      patientId,
      doctorId,
      symptoms,
      urgency: urgency as 'emergency' | 'urgent' | 'routine',
      message
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    console.log('✅ Referral request created:', result.referralId);
    res.json({ success: true, referralId: result.referralId });

  } catch (error) {
    console.error('❌ Error creating referral request:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/specialties/recommendations', async (req, res) => {
  try {
    const { symptoms } = req.query;
    console.log('🎯 Getting specialty recommendations for:', symptoms);

    if (!symptoms || typeof symptoms !== 'string') {
      return res.status(400).json({ error: 'Síntomas requeridos' });
    }

    const recommendations = await getSpecialtyRecommendations(symptoms);
    console.log('✅ Specialty recommendations:', recommendations);

    res.json({ specialties: recommendations });

  } catch (error) {
    console.error('❌ Error getting specialty recommendations:', error);
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