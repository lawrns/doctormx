import dotenv from 'dotenv';

// IMPORTANTE: Configurar dotenv ANTES de cualquier otra importación
dotenv.config();

import express from 'express';
import cors from 'cors';
import { evaluateRedFlags } from './triage.ts';
import { doctorReply } from './providers/openai.ts';
import { findSpecialists, validateSearchParams } from './providers/orchestrator.ts';
import { verifyWebhook, handleWebhook, healthCheck } from './services/whatsapp/webhook.ts';
import { validateWhatsAppConfig } from './services/whatsapp/config.ts';
import { getActiveSessionCount } from './services/whatsapp/conversationHandler.ts';
import { createAIReferral, getPatientReferrals, updateReferralStatus, findMatchingDoctors } from './providers/referralSystem.ts';
import { getUserFreeQuestions, useFreeQuestion, checkFreeQuestionEligibility } from './providers/freeQuestions.ts';

const app = express();
app.use(cors());
app.use(express.json());

// Validate WhatsApp configuration on startup
if (validateWhatsAppConfig()) {
  console.log('✅ WhatsApp Cloud API configured');
} else {
  console.warn('⚠️  WhatsApp Cloud API not fully configured - check .env file');
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], intake, userId } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message requerido' });
    }

    // Check free question eligibility if userId is provided
    let freeQuestionUsed = false;
    let freeQuestionMessage = '';
    
    if (userId) {
      try {
        const eligibility = await checkFreeQuestionEligibility(userId);
        if (!eligibility.eligible) {
          return res.status(402).json({ 
            error: 'Free questions exhausted',
            message: eligibility.message,
            careLevel: 'PAYMENT_REQUIRED'
          });
        }
      } catch (error) {
        console.error('Error checking free question eligibility:', error);
        // Continue without free question check if there's an error
      }
    }

    const red = evaluateRedFlags({ message, intake });
    if (red.triggered) {
      const msg = `Con tus datos hay señales de alarma. Motivo: ${red.reasons.join('; ')}. Te recomiendo acudir a urgencias ahora mismo.\n\nEsto no sustituye una evaluación médica profesional.`;
      
      // Use free question if available
      if (userId) {
        try {
          const result = await useFreeQuestion(userId);
          freeQuestionUsed = result.success;
          freeQuestionMessage = result.message;
        } catch (error) {
          console.error('Error using free question:', error);
        }
      }
      
      return res.json({ 
        careLevel: red.action || 'ER', 
        redFlags: red, 
        message: msg,
        freeQuestionUsed,
        freeQuestionMessage
      });
    }

    const reply = await doctorReply({ history: [...history, { role: 'user', content: message }], redFlags: red });
    
    // Use free question if available
    if (userId) {
      try {
        const result = await useFreeQuestion(userId);
        freeQuestionUsed = result.success;
        freeQuestionMessage = result.message;
      } catch (error) {
        console.error('Error using free question:', error);
      }
    }
    
    res.json({ 
      careLevel: 'PRIMARY', 
      redFlags: red, 
      message: reply,
      freeQuestionUsed,
      freeQuestionMessage
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/specialists', async (req, res) => {
  try {
    const params = validateSearchParams(req.body);
    if (!params) {
      return res.status(400).json({
        error: 'Parámetros inválidos. Se requiere specialty.'
      });
    }

    console.log('Búsqueda de especialistas solicitada:', params);
    const result = await findSpecialists(params);

    res.json(result);
  } catch (e) {
    console.error('Error en /api/specialists:', e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// WhatsApp Cloud API Webhook endpoints
app.get('/api/whatsapp/webhook', verifyWebhook);
app.post('/api/whatsapp/webhook', handleWebhook);

// Vision Analysis Endpoints
app.post('/api/vision/analyze', async (req, res) => {
  try {
    const { imageBase64, imageType, patientAge, patientGender, symptoms, medicalHistory } = req.body || {};
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 requerido' });
    }

    const { analyzeMedicalImage } = await import('./providers/vision.js');
    const analysis = await analyzeMedicalImage({
      imageBase64,
      imageType: imageType || 'general',
      patientAge,
      patientGender,
      symptoms,
      medicalHistory
    });

    res.json(analysis);
  } catch (e) {
    console.error('Vision analysis error:', e);
    res.status(500).json({ error: 'Error en el análisis de imagen' });
  }
});

app.post('/api/vision/specialized', async (req, res) => {
  try {
    const { imageBase64, imageType, specialty } = req.body || {};
    
    if (!imageBase64 || !specialty) {
      return res.status(400).json({ error: 'imageBase64 y specialty requeridos' });
    }

    const { getSpecializedAnalysis } = await import('./providers/vision.js');
    const analysis = await getSpecializedAnalysis(imageBase64, imageType, specialty);

    res.json(analysis);
  } catch (e) {
    console.error('Specialized analysis error:', e);
    res.status(500).json({ error: 'Error en el análisis especializado' });
  }
});

app.post('/api/vision/compare', async (req, res) => {
  try {
    const { images, imageType } = req.body || {};
    
    if (!images || !Array.isArray(images) || images.length < 2) {
      return res.status(400).json({ error: 'Se requieren al menos 2 imágenes para comparar' });
    }

    const { compareImages } = await import('./providers/vision.js');
    const comparison = await compareImages(images, imageType || 'general');

    res.json(comparison);
  } catch (e) {
    console.error('Image comparison error:', e);
    res.status(500).json({ error: 'Error en la comparación de imágenes' });
  }
});

// AI Personality Endpoints
app.get('/api/personalities', async (req, res) => {
  try {
    const { getAllPersonalities } = await import('./providers/aiPersonalities.js');
    const personalities = getAllPersonalities();
    res.json({ personalities });
  } catch (e) {
    console.error('Error getting personalities:', e);
    res.status(500).json({ error: 'Error al obtener personalidades' });
  }
});

app.post('/api/personalities/chat', async (req, res) => {
  try {
    const { personalityId, message, history = [] } = req.body || {};
    
    if (!personalityId || !message) {
      return res.status(400).json({ error: 'personalityId y message requeridos' });
    }

    const { getPersonalityResponse } = await import('./providers/aiPersonalities.js');
    const response = await getPersonalityResponse(personalityId, message, history);

    res.json({ response });
  } catch (e) {
    console.error('Error in personality chat:', e);
    res.status(500).json({ error: 'Error en el chat con personalidad' });
  }
});

app.post('/api/personalities/entertainment', async (req, res) => {
  try {
    const { personalityId, type } = req.body || {};
    
    if (!personalityId || !type) {
      return res.status(400).json({ error: 'personalityId y type requeridos' });
    }

    const { getEntertainmentContent } = await import('./providers/aiPersonalities.js');
    const content = await getEntertainmentContent(personalityId, type);

    res.json({ content });
  } catch (e) {
    console.error('Error getting entertainment content:', e);
    res.status(500).json({ error: 'Error al obtener contenido de entretenimiento' });
  }
});

app.post('/api/personalities/trivia', async (req, res) => {
  try {
    const { personalityId, difficulty = 'medium' } = req.body || {};
    
    if (!personalityId) {
      return res.status(400).json({ error: 'personalityId requerido' });
    }

    const { getHealthTrivia } = await import('./providers/aiPersonalities.js');
    const trivia = await getHealthTrivia(personalityId, difficulty);

    res.json(trivia);
  } catch (e) {
    console.error('Error getting trivia:', e);
    res.status(500).json({ error: 'Error al obtener trivia' });
  }
});

app.post('/api/personalities/motivation', async (req, res) => {
  try {
    const { personalityId, context = 'general' } = req.body || {};
    
    if (!personalityId) {
      return res.status(400).json({ error: 'personalityId requerido' });
    }

    const { getMotivationalMessage } = await import('./providers/aiPersonalities.js');
    const message = await getMotivationalMessage(personalityId, context);

    res.json({ message });
  } catch (e) {
    console.error('Error getting motivational message:', e);
    res.status(500).json({ error: 'Error al obtener mensaje motivacional' });
  }
});

// Gamification Endpoints
app.get('/api/gamification/points/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }

    const { getUserHealthPoints } = await import('./providers/gamification.js');
    const points = await getUserHealthPoints(userId);

    res.json(points);
  } catch (e) {
    console.error('Error getting health points:', e);
    res.status(500).json({ error: 'Error al obtener puntos de salud' });
  }
});

app.post('/api/gamification/points/add', async (req, res) => {
  try {
    const { userId, points, reason, metadata } = req.body || {};
    
    if (!userId || !points || !reason) {
      return res.status(400).json({ error: 'userId, points y reason requeridos' });
    }

    const { addHealthPoints } = await import('./providers/gamification.js');
    const updatedPoints = await addHealthPoints(userId, points, reason, metadata);

    res.json(updatedPoints);
  } catch (e) {
    console.error('Error adding health points:', e);
    res.status(500).json({ error: 'Error al agregar puntos de salud' });
  }
});

app.post('/api/gamification/points/spend', async (req, res) => {
  try {
    const { userId, points, reason, metadata } = req.body || {};
    
    if (!userId || !points || !reason) {
      return res.status(400).json({ error: 'userId, points y reason requeridos' });
    }

    const { spendHealthPoints } = await import('./providers/gamification.js');
    const updatedPoints = await spendHealthPoints(userId, points, reason, metadata);

    res.json(updatedPoints);
  } catch (e) {
    console.error('Error spending health points:', e);
    res.status(500).json({ error: 'Error al gastar puntos de salud' });
  }
});

app.get('/api/gamification/achievements/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }

    const { getUserAchievements } = await import('./providers/gamification.js');
    const achievements = await getUserAchievements(userId);

    res.json({ achievements });
  } catch (e) {
    console.error('Error getting achievements:', e);
    res.status(500).json({ error: 'Error al obtener logros' });
  }
});

app.post('/api/gamification/achievements/check', async (req, res) => {
  try {
    const { userId } = req.body || {};
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }

    const { checkAndAwardAchievements } = await import('./providers/gamification.js');
    const newAchievements = await checkAndAwardAchievements(userId);

    res.json({ newAchievements });
  } catch (e) {
    console.error('Error checking achievements:', e);
    res.status(500).json({ error: 'Error al verificar logros' });
  }
});

app.get('/api/gamification/leaderboard', async (req, res) => {
  try {
    const { type = 'points', limit = 10 } = req.query;
    
    const { getLeaderboard } = await import('./providers/gamification.js');
    const leaderboard = await getLeaderboard(type as 'points' | 'achievements' | 'streak', parseInt(limit as string));

    res.json({ leaderboard });
  } catch (e) {
    console.error('Error getting leaderboard:', e);
    res.status(500).json({ error: 'Error al obtener ranking' });
  }
});

app.get('/api/gamification/achievements', async (req, res) => {
  try {
    const { getAllAchievements } = await import('./providers/gamification.js');
    const achievements = getAllAchievements();

    res.json({ achievements });
  } catch (e) {
    console.error('Error getting all achievements:', e);
    res.status(500).json({ error: 'Error al obtener logros' });
  }
});

// Social Features Endpoints
app.get('/api/social/posts', async (req, res) => {
  try {
    const { category, type, limit = 20, offset = 0 } = req.query;
    
    const { getHealthPosts } = await import('./providers/social.js');
    const posts = await getHealthPosts(category as string, type as string, parseInt(limit as string), parseInt(offset as string));

    res.json({ posts });
  } catch (e) {
    console.error('Error getting health posts:', e);
    res.status(500).json({ error: 'Error al obtener posts' });
  }
});

app.post('/api/social/posts', async (req, res) => {
  try {
    const { userId, content, type, category, tags, isPublic, isAnonymous, metadata } = req.body || {};
    
    if (!userId || !content || !type || !category) {
      return res.status(400).json({ error: 'userId, content, type y category requeridos' });
    }

    const { createHealthPost } = await import('./providers/social.js');
    const post = await createHealthPost(userId, content, type, category, tags, isPublic, isAnonymous, metadata);

    res.json({ post });
  } catch (e) {
    console.error('Error creating health post:', e);
    res.status(500).json({ error: 'Error al crear post' });
  }
});

app.post('/api/social/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body || {};
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }

    const { likePost } = await import('./providers/social.js');
    const liked = await likePost(postId, userId);

    res.json({ liked });
  } catch (e) {
    console.error('Error liking post:', e);
    res.status(500).json({ error: 'Error al dar like' });
  }
});

app.get('/api/social/groups', async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;
    
    const { getHealthGroups } = await import('./providers/social.js');
    const groups = await getHealthGroups(category as string, parseInt(limit as string), parseInt(offset as string));

    res.json({ groups });
  } catch (e) {
    console.error('Error getting health groups:', e);
    res.status(500).json({ error: 'Error al obtener grupos' });
  }
});

app.post('/api/social/groups/:groupId/join', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body || {};
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }

    const { joinGroup } = await import('./providers/social.js');
    const success = await joinGroup(groupId, userId);

    res.json({ success });
  } catch (e) {
    console.error('Error joining group:', e);
    res.status(500).json({ error: 'Error al unirse al grupo' });
  }
});

app.get('/api/social/challenges', async (req, res) => {
  try {
    const { getActiveChallenges } = await import('./providers/social.js');
    const challenges = await getActiveChallenges();

    res.json({ challenges });
  } catch (e) {
    console.error('Error getting active challenges:', e);
    res.status(500).json({ error: 'Error al obtener desafíos' });
  }
});

app.post('/api/social/challenges/:challengeId/join', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.body || {};
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }

    const { joinChallenge } = await import('./providers/social.js');
    const participation = await joinChallenge(challengeId, userId);

    res.json({ participation });
  } catch (e) {
    console.error('Error joining challenge:', e);
    res.status(500).json({ error: 'Error al unirse al desafío' });
  }
});

// Marketplace Endpoints
app.get('/api/marketplace/products', async (req, res) => {
  try {
    const { category, subcategory, search, minPrice, maxPrice, rating, sortBy, limit, offset } = req.query;
    
    const { getMarketplaceProducts } = await import('./providers/marketplace.js');
    const products = await getMarketplaceProducts(
      category as string,
      subcategory as string,
      search as string,
      minPrice ? parseInt(minPrice as string) : undefined,
      maxPrice ? parseInt(maxPrice as string) : undefined,
      rating ? parseInt(rating as string) : undefined,
      sortBy as 'price' | 'rating' | 'newest' | 'popular' || 'popular',
      parseInt(limit as string) || 20,
      parseInt(offset as string) || 0
    );

    res.json({ products });
  } catch (e) {
    console.error('Error getting marketplace products:', e);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/api/marketplace/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const { getProductById } = await import('./providers/marketplace.js');
    const product = await getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ product });
  } catch (e) {
    console.error('Error getting product by ID:', e);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

app.get('/api/marketplace/products/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10 } = req.query;
    
    const { getProductReviews } = await import('./providers/marketplace.js');
    const reviews = await getProductReviews(productId, parseInt(limit as string));

    res.json({ reviews });
  } catch (e) {
    console.error('Error getting product reviews:', e);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
});

app.post('/api/marketplace/products/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, rating, title, content, images } = req.body || {};
    
    if (!userId || !rating || !title || !content) {
      return res.status(400).json({ error: 'userId, rating, title y content requeridos' });
    }

    const { addProductReview } = await import('./providers/marketplace.js');
    const review = await addProductReview(productId, userId, rating, title, content, images);

    res.json({ review });
  } catch (e) {
    console.error('Error adding product review:', e);
    res.status(500).json({ error: 'Error al agregar reseña' });
  }
});

app.get('/api/marketplace/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const { getFeaturedProducts } = await import('./providers/marketplace.js');
    const products = await getFeaturedProducts(parseInt(limit as string));

    res.json({ products });
  } catch (e) {
    console.error('Error getting featured products:', e);
    res.status(500).json({ error: 'Error al obtener productos destacados' });
  }
});

app.get('/api/marketplace/recommended/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 8 } = req.query;
    
    const { getRecommendedProducts } = await import('./providers/marketplace.js');
    const products = await getRecommendedProducts(userId, parseInt(limit as string));

    res.json({ products });
  } catch (e) {
    console.error('Error getting recommended products:', e);
    res.status(500).json({ error: 'Error al obtener productos recomendados' });
  }
});

app.post('/api/marketplace/orders', async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod } = req.body || {};
    
    if (!userId || !items || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'userId, items, shippingAddress y paymentMethod requeridos' });
    }

    const { createOrder } = await import('./providers/marketplace.js');
    const order = await createOrder(userId, items, shippingAddress, paymentMethod);

    res.json({ order });
  } catch (e) {
    console.error('Error creating order:', e);
    res.status(500).json({ error: 'Error al crear orden' });
  }
});

app.get('/api/marketplace/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { getUserOrders } = await import('./providers/marketplace.js');
    const orders = await getUserOrders(userId);

    res.json({ orders });
  } catch (e) {
    console.error('Error getting user orders:', e);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

app.get('/api/marketplace/categories', async (req, res) => {
  try {
    const { getAllCategories } = await import('./providers/marketplace.js');
    const categories = getAllCategories();

    res.json({ categories });
  } catch (e) {
    console.error('Error getting categories:', e);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// AI Referral System Endpoints
app.post('/api/referrals/create', async (req, res) => {
  try {
    const { patientId, symptoms, additionalInfo } = req.body || {};
    
    if (!patientId || !symptoms) {
      return res.status(400).json({ error: 'patientId y symptoms requeridos' });
    }

    const referral = await createAIReferral(patientId, symptoms, additionalInfo);
    res.json({ referral });
  } catch (e) {
    console.error('Error creating AI referral:', e);
    res.status(500).json({ error: 'Error al crear referencia' });
  }
});

app.get('/api/referrals/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const referrals = await getPatientReferrals(patientId);
    res.json({ referrals });
  } catch (e) {
    console.error('Error getting patient referrals:', e);
    res.status(500).json({ error: 'Error al obtener referencias' });
  }
});

app.put('/api/referrals/:referralId/status', async (req, res) => {
  try {
    const { referralId } = req.params;
    const { status, doctorId } = req.body || {};
    
    if (!status) {
      return res.status(400).json({ error: 'status requerido' });
    }

    await updateReferralStatus(referralId, status, doctorId);
    res.json({ success: true });
  } catch (e) {
    console.error('Error updating referral status:', e);
    res.status(500).json({ error: 'Error al actualizar estado de referencia' });
  }
});

app.post('/api/referrals/find-doctors', async (req, res) => {
  try {
    const { criteria, limit = 5 } = req.body || {};
    
    if (!criteria) {
      return res.status(400).json({ error: 'criteria requerido' });
    }

    const doctors = await findMatchingDoctors(criteria, limit);
    res.json({ doctors });
  } catch (e) {
    console.error('Error finding matching doctors:', e);
    res.status(500).json({ error: 'Error al encontrar doctores' });
  }
});

// Free Questions System Endpoints
app.get('/api/free-questions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const usage = await getUserFreeQuestions(userId);
    res.json({ usage });
  } catch (e) {
    console.error('Error getting free questions usage:', e);
    res.status(500).json({ error: 'Error al obtener uso de preguntas gratuitas' });
  }
});

app.get('/api/free-questions/:userId/eligibility', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const eligibility = await checkFreeQuestionEligibility(userId);
    res.json(eligibility);
  } catch (e) {
    console.error('Error checking free question eligibility:', e);
    res.status(500).json({ error: 'Error al verificar elegibilidad de preguntas gratuitas' });
  }
});

app.post('/api/free-questions/:userId/use', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await useFreeQuestion(userId);
    res.json(result);
  } catch (e) {
    console.error('Error using free question:', e);
    res.status(500).json({ error: 'Error al usar pregunta gratuita' });
  }
});

// Health check and monitoring
app.get('/api/health', healthCheck);
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    status: 'online',
    activeSessions: getActiveSessionCount(),
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`🚀 Doctor.mx API running on http://localhost:${PORT}`);
  console.log(`📞 WhatsApp webhook: http://localhost:${PORT}/api/whatsapp/webhook`);
});