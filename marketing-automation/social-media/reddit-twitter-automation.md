# Social Media Automation Strategy for DoctorMX
## Reddit & Twitter/X Healthcare Engagement

### Strategic Overview
- **Reddit**: Community-driven health education and organic engagement
- **Twitter/X**: Real-time health crisis response and influencer partnerships
- **Objective**: Build trust and authority in Mexican healthcare space
- **Compliance**: Maintain platform policies while providing medical value

## 1. Reddit Automation Strategy

### Target Subreddits & Community Analysis
```typescript
const redditTargetCommunities = {
  tier_1_primary: {
    'r/mexico': {
      subscribers: 430000,
      engagement_rate: 'high',
      health_content_acceptance: 'medium',
      posting_frequency: '2-3 posts/week',
      best_times: ['19:00-22:00 Mexico City'],
      content_types: ['educational', 'news', 'AMA'],
      cultural_sensitivity: 'critical'
    },
    'r/guadalajara': {
      subscribers: 45000,
      engagement_rate: 'very_high',
      health_content_acceptance: 'high',
      posting_frequency: '1-2 posts/week',
      content_types: ['local_health', 'provider_recommendations']
    },
    'r/monterrey': {
      subscribers: 38000,
      engagement_rate: 'high',
      health_content_acceptance: 'medium',
      posting_frequency: '1-2 posts/week',
      content_types: ['workplace_health', 'industrial_health']
    }
  },
  
  tier_2_secondary: {
    'r/tijuana': { subscribers: 22000, focus: 'border_health' },
    'r/puebla': { subscribers: 18000, focus: 'traditional_medicine' },
    'r/queretaro': { subscribers: 16000, focus: 'tech_health' },
    'r/cancun': { subscribers: 15000, focus: 'tourism_health' }
  },
  
  medical_focused: {
    'r/medicina': { 
      subscribers: 25000,
      audience: 'medical_professionals',
      posting_frequency: '1 post/week',
      content_types: ['research', 'ai_discussion', 'tools']
    },
    'r/AskDocs': {
      subscribers: 180000,
      engagement_rules: 'strict_medical_disclaimer',
      content_types: ['educational_responses']
    }
  }
};
```

### Reddit Bot Implementation
```python
# reddit_automation_bot.py
import praw
import openai
import schedule
import time
import json
from datetime import datetime, timedelta
import requests
import logging

class DoctorMXRedditBot:
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=os.environ['REDDIT_CLIENT_ID'],
            client_secret=os.environ['REDDIT_CLIENT_SECRET'],
            username=os.environ['REDDIT_USERNAME'],
            password=os.environ['REDDIT_PASSWORD'],
            user_agent='DoctorMX Health Education Bot v1.0'
        )
        self.openai_client = openai.OpenAI(api_key=os.environ['OPENAI_API_KEY'])
        self.supabase_url = os.environ['SUPABASE_URL']
        self.supabase_key = os.environ['SUPABASE_SERVICE_KEY']
        
        # Karma building parameters
        self.min_karma_threshold = 100
        self.daily_post_limit = 3
        self.daily_comment_limit = 15
        
        # Mexican health topics database
        self.health_topics = self.load_mexican_health_topics()
    
    def load_mexican_health_topics(self):
        """Load curated Mexican health topics for content generation"""
        return {
            'diabetes': {
                'mexican_context': 'Mexico has one of highest diabetes rates globally',
                'keywords': ['diabetes', 'azúcar', 'insulina', 'nopales'],
                'cultural_factors': ['family_genetics', 'traditional_foods', 'coca_cola_consumption']
            },
            'obesity': {
                'mexican_context': 'Childhood obesity epidemic in Mexico',
                'keywords': ['obesidad', 'sobrepeso', 'alimentación', 'ejercicio'],
                'cultural_factors': ['street_food', 'sedentary_lifestyle', 'economic_factors']
            },
            'mental_health': {
                'mexican_context': 'Mental health stigma in Mexican culture',
                'keywords': ['salud mental', 'depresión', 'ansiedad', 'estrés'],
                'cultural_factors': ['machismo', 'family_expectations', 'migration_stress']
            },
            'womens_health': {
                'mexican_context': 'Reproductive health access challenges',
                'keywords': ['salud femenina', 'embarazo', 'anticonceptivos'],
                'cultural_factors': ['catholic_influence', 'family_planning', 'maternal_mortality']
            }
        }
    
    async def karma_building_strategy(self):
        """Build karma through genuine community engagement"""
        target_subreddits = ['r/mexico', 'r/guadalajara', 'r/monterrey']
        
        for subreddit_name in target_subreddits:
            subreddit = self.reddit.subreddit(subreddit_name.replace('r/', ''))
            
            # Find health-related posts to comment on
            health_posts = self.find_health_related_posts(subreddit)
            
            for post in health_posts[:3]:  # Limit daily engagement
                if self.should_engage_with_post(post):
                    helpful_comment = await self.generate_helpful_comment(post)
                    if helpful_comment:
                        self.post_comment(post, helpful_comment)
                        self.log_engagement('comment', post.id, subreddit_name)
                        time.sleep(300)  # 5-minute delay between comments
    
    def find_health_related_posts(self, subreddit):
        """Find posts related to health topics"""
        health_keywords = [
            'salud', 'médico', 'doctor', 'hospital', 'enfermedad', 'síntoma',
            'dolor', 'medicina', 'tratamiento', 'consulta', 'emergencia'
        ]
        
        relevant_posts = []
        
        # Search in hot posts
        for post in subreddit.hot(limit=50):
            post_text = f"{post.title} {post.selftext}".lower()
            if any(keyword in post_text for keyword in health_keywords):
                relevant_posts.append(post)
        
        return relevant_posts
    
    async def generate_helpful_comment(self, post):
        """Generate helpful, culturally appropriate health comment"""
        post_content = f"Título: {post.title}\nContenido: {post.selftext}"
        
        prompt = f"""
        Como Dr. Simeon, un médico mexicano experto, genera un comentario útil y culturalmente apropiado para esta publicación de Reddit:

        {post_content}

        Reglas importantes:
        1. Usa español mexicano natural
        2. Sé empático y profesional
        3. NO diagnostiques ni des consejos médicos específicos
        4. Sugiere buscar atención médica cuando apropiado
        5. Incluye información educativa general
        6. Mantén el tono conversacional pero profesional
        7. Respeta la cultura mexicana
        8. Máximo 300 palabras

        Incluye disclaimer médico sutil pero necesario.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400,
                temperature=0.7
            )
            
            comment = response.choices[0].message.content
            
            # Add Dr. Simeon signature
            comment += "\n\n*Dr. Simeon - Información educativa. No sustituye consulta médica profesional.*"
            
            return comment
            
        except Exception as e:
            logging.error(f"Error generating comment: {e}")
            return None
    
    def educational_content_strategy(self):
        """Post educational health content"""
        content_templates = {
            'diabetes_prevention': {
                'title': '🍎 Prevención de Diabetes en México: Mitos vs. Realidad',
                'content': self.generate_diabetes_content(),
                'subreddits': ['r/mexico', 'r/guadalajara'],
                'optimal_timing': '20:00'
            },
            'mental_health_awareness': {
                'title': '🧠 Salud Mental en México: Rompiendo el Estigma',
                'content': self.generate_mental_health_content(),
                'subreddits': ['r/mexico', 'r/monterrey'],
                'optimal_timing': '19:30'
            },
            'emergency_preparedness': {
                'title': '🚨 Qué Hacer en Emergencias Médicas: Guía para Familias Mexicanas',
                'content': self.generate_emergency_content(),
                'subreddits': ['r/mexico'],
                'optimal_timing': '18:00'
            }
        }
        
        return content_templates
    
    def generate_diabetes_content(self):
        """Generate diabetes prevention content for Mexican audience"""
        return """
        La diabetes tipo 2 afecta a **1 de cada 10 mexicanos**. Como Dr. Simeon, quiero compartir información importante:

        ## 🔍 Factores de Riesgo en México
        - Genética (antecedentes familiares)
        - Consumo alto de refrescos y jugos
        - Sedentarismo urbano
        - Estrés crónico

        ## 🌮 Prevención con Comida Mexicana
        **✅ Alimentos que ayudan:**
        - **Nopales**: Reducen azúcar en sangre
        - **Frijoles**: Fibra que controla glucosa
        - **Chía**: Omega-3 y fibra
        - **Aguacate**: Grasas saludables

        **❌ Moderar:**
        - Refrescos (incluso jugos naturales)
        - Pan dulce diario
        - Tortillas en exceso
        - Comida frita frecuente

        ## 🏃‍♂️ Ejercicio Realista
        - Caminar 30 min en parques locales
        - Subir escaleras en lugar de elevador
        - Bailar música mexicana (¡cuenta como cardio!)
        - Actividades familiares activas

        ## 🩺 Cuándo Hacerse Estudios
        - Después de los 35 años
        - Si hay antecedentes familiares
        - Con sobrepeso
        - Síntomas: mucha sed, orinar frecuente, cansancio

        **¿Dónde hacerse estudios gratis?**
        - Centros de Salud (gratuito)
        - IMSS/ISSSTE (derechohabientes)
        - Farmacias (glucómetros básicos)

        ---
        *Información educativa de Dr. Simeon. Para evaluación personalizada, consulta con tu médico.*

        ¿Alguna pregunta sobre prevención? 🤔
        """
    
    async def crisis_response_monitoring(self):
        """Monitor for health crises and respond appropriately"""
        crisis_keywords = [
            'emergencia médica', 'ambulancia', 'hospital', 'accidente',
            'envenenamiento', 'alergia grave', 'no respira', 'inconsciente'
        ]
        
        for subreddit_name in ['mexico', 'guadalajara', 'monterrey']:
            subreddit = self.reddit.subreddit(subreddit_name)
            
            # Monitor new posts
            for post in subreddit.new(limit=20):
                post_text = f"{post.title} {post.selftext}".lower()
                
                if any(keyword in post_text for keyword in crisis_keywords):
                    crisis_response = self.generate_crisis_response(post)
                    if crisis_response:
                        self.post_comment(post, crisis_response)
                        self.notify_human_moderator(post)
    
    def generate_crisis_response(self, post):
        """Generate appropriate crisis response"""
        return """
        🚨 **EMERGENCIA MÉDICA**

        Si esta es una emergencia real:
        
        **LLAMA INMEDIATAMENTE:**
        - 🚑 Cruz Roja: 065
        - 🚨 Emergencias: 911
        - 🏥 Hospital más cercano

        **No esperes respuestas en Reddit para emergencias.**

        Si no es emergencia inmediata pero necesitas orientación médica:
        - Dr. Simeon puede ayudarte 24/7
        - WhatsApp: [número]
        - Web: doctormx.com

        Tu seguridad es lo más importante. 🙏

        ---
        *Dr. Simeon - En emergencias reales, siempre contacta servicios de emergencia oficiales.*
        """
    
    def post_educational_content(self, content_type):
        """Post educational content to appropriate subreddits"""
        content = self.educational_content_strategy()[content_type]
        
        for subreddit_name in content['subreddits']:
            try:
                subreddit = self.reddit.subreddit(subreddit_name.replace('r/', ''))
                
                post = subreddit.submit(
                    title=content['title'],
                    selftext=content['content']
                )
                
                self.log_engagement('post', post.id, subreddit_name)
                print(f"Posted to {subreddit_name}: {content['title']}")
                
                # Wait between posts to different subreddits
                time.sleep(600)  # 10 minutes
                
            except Exception as e:
                logging.error(f"Error posting to {subreddit_name}: {e}")
    
    def schedule_content(self):
        """Schedule content posting"""
        # Educational posts
        schedule.every().monday.at("20:00").do(
            self.post_educational_content, 'diabetes_prevention'
        )
        schedule.every().wednesday.at("19:30").do(
            self.post_educational_content, 'mental_health_awareness'
        )
        schedule.every().friday.at("18:00").do(
            self.post_educational_content, 'emergency_preparedness'
        )
        
        # Daily karma building
        schedule.every().day.at("10:00").do(self.karma_building_strategy)
        schedule.every().day.at("15:00").do(self.karma_building_strategy)
        
        # Crisis monitoring (every hour)
        schedule.every().hour.do(self.crisis_response_monitoring)

# Run the bot
if __name__ == "__main__":
    bot = DoctorMXRedditBot()
    bot.schedule_content()
    
    while True:
        schedule.run_pending()
        time.sleep(60)
```

## 2. Twitter/X Healthcare Automation

### Twitter Bot for Health Crisis Response
```javascript
// twitter_healthcare_bot.js
const { TwitterApi } = require('twitter-api-v2');
const OpenAI = require('openai');
const cron = require('node-cron');

class DoctorMXTwitterBot {
  constructor() {
    this.twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
    
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Mexican health hashtags to monitor
    this.healthHashtags = [
      '#SaludMéxico', '#DiabetesMéxico', '#COVID19México',
      '#SaludMental', '#EmergenciaMédica', '#IMSSMéxico',
      '#DolorMéxico', '#FiebreMéxico', '#ConsultaMédica'
    ];
    
    // Mexican health influencers to engage with
    this.healthInfluencers = [
      '@DrRuyPérez', '@DoctoraCorazón', '@SaludEnMéxico',
      '@NutriciónMX', '@PsicólogoMX', '@EmergenciasMX'
    ];
  }
  
  async monitorHealthCrisis() {
    try {
      // Monitor trending health topics in Mexico
      const trends = await this.twitterClient.v1.trendsAvailable();
      const mexicoTrends = trends.filter(trend => 
        trend.country === 'Mexico' || trend.woeid === 23424900
      );
      
      for (const trend of mexicoTrends.slice(0, 10)) {
        if (this.isHealthRelated(trend.name)) {
          await this.respondToHealthTrend(trend);
        }
      }
      
      // Monitor specific health hashtags
      for (const hashtag of this.healthHashtags) {
        await this.monitorHashtag(hashtag);
      }
      
    } catch (error) {
      console.error('Error monitoring health crisis:', error);
    }
  }
  
  async monitorHashtag(hashtag) {
    try {
      const tweets = await this.twitterClient.v2.search(hashtag, {
        max_results: 20,
        'tweet.fields': 'created_at,author_id,public_metrics,context_annotations',
        'user.fields': 'verified,public_metrics'
      });
      
      for (const tweet of tweets.data || []) {
        await this.analyzeAndRespond(tweet);
      }
      
    } catch (error) {
      console.error(`Error monitoring hashtag ${hashtag}:`, error);
    }
  }
  
  async analyzeAndRespond(tweet) {
    // Skip if already responded or if it's our own tweet
    if (tweet.author_id === this.ourUserId || 
        await this.hasAlreadyResponded(tweet.id)) {
      return;
    }
    
    const analysis = await this.analyzeHealthContent(tweet.text);
    
    if (analysis.shouldRespond) {
      const response = await this.generateHealthResponse(tweet, analysis);
      if (response) {
        await this.postResponse(tweet.id, response);
      }
    }
  }
  
  async analyzeHealthContent(tweetText) {
    const prompt = `
    Analiza este tweet sobre salud en México y determina si Dr. Simeon debería responder:

    Tweet: "${tweetText}"

    Evalúa:
    1. ¿Es una consulta médica legítima?
    2. ¿Muestra urgencia o emergencia?
    3. ¿Contiene desinformación médica?
    4. ¿Es apropiado para respuesta automatizada?
    5. ¿Respeta la cultura mexicana?

    Responde en JSON:
    {
      "shouldRespond": boolean,
      "urgencyLevel": "low|medium|high|emergency",
      "topic": "diabetes|mental_health|emergency|general",
      "culturalSensitivity": "low|medium|high",
      "riskFactors": ["list", "of", "concerns"]
    }
    `;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing health content:', error);
      return { shouldRespond: false };
    }
  }
  
  async generateHealthResponse(tweet, analysis) {
    if (analysis.urgencyLevel === 'emergency') {
      return this.generateEmergencyResponse();
    }
    
    const prompt = `
    Como Dr. Simeon, genera una respuesta útil a este tweet de salud:

    Tweet original: "${tweet.text}"
    Urgencia: ${analysis.urgencyLevel}
    Tema: ${analysis.topic}

    Reglas:
    1. Máximo 280 caracteres
    2. Español mexicano natural
    3. Empático pero profesional
    4. No diagnostiques
    5. Incluye call-to-action sutil a DoctorMX
    6. Respeta sensibilidad cultural
    
    Formato: Solo el texto del tweet, sin comillas.
    `;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.7
      });
      
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating response:', error);
      return null;
    }
  }
  
  generateEmergencyResponse() {
    const emergencyResponses = [
      "🚨 Si es emergencia médica: llama 911 inmediatamente. Tu seguridad es primero. Dr. Simeon está disponible para orientación no urgente 24/7 📱",
      "🚨 EMERGENCIA = 911 ahora mismo. No esperes. Para consultas no urgentes, Dr. Simeon puede ayudarte después 🏥",
      "🚨 Emergencia real → 911 ya. Dr. Simeon para dudas médicas generales cuando estés seguro/a 💙"
    ];
    
    return emergencyResponses[Math.floor(Math.random() * emergencyResponses.length)];
  }
  
  async engageWithInfluencers() {
    for (const influencer of this.healthInfluencers) {
      try {
        // Get recent tweets from influencer
        const userTweets = await this.twitterClient.v2.userTimelineByUsername(
          influencer.replace('@', ''),
          { max_results: 5 }
        );
        
        for (const tweet of userTweets.data || []) {
          if (this.shouldEngageWithInfluencer(tweet)) {
            const engagement = await this.generateInfluencerEngagement(tweet);
            if (engagement) {
              await this.postResponse(tweet.id, engagement);
              // Wait between engagements
              await this.sleep(300000); // 5 minutes
            }
          }
        }
        
      } catch (error) {
        console.error(`Error engaging with ${influencer}:`, error);
      }
    }
  }
  
  async generateHealthThread(topic) {
    const threadTopics = {
      diabetes: {
        title: "🧵 DIABETES EN MÉXICO: Lo que necesitas saber",
        points: [
          "México tiene la 6ta tasa más alta de diabetes mundialmente",
          "1 de cada 10 mexicanos vive con diabetes tipo 2",
          "La genética + estilo de vida = factor de riesgo combinado",
          "Síntomas tempranos: sed excesiva, orinar frecuente, cansancio",
          "PREVENCIÓN: Nopales, ejercicio, menos refrescos, más agua",
          "Estudios gratuitos en Centros de Salud y IMSS",
          "Dr. Simeon puede ayudarte a evaluar tu riesgo 24/7"
        ]
      },
      
      mental_health: {
        title: "🧵 SALUD MENTAL EN MÉXICO: Rompamos el tabú",
        points: [
          "40% de mexicanos ha experimentado ansiedad o depresión",
          "El estigma cultural impide buscar ayuda profesional",
          "La salud mental ES salud real - no es 'falta de fe'",
          "Señales: cambios de humor, aislamiento, pérdida de interés",
          "Buscar ayuda es de valientes, no de débiles",
          "IMSS ofrece servicios de psicología gratuitos",
          "Dr. Simeon entiende el contexto cultural mexicano"
        ]
      }
    };
    
    const thread = threadTopics[topic];
    if (!thread) return;
    
    // Post thread
    let previousTweetId = null;
    
    for (let i = 0; i < thread.points.length; i++) {
      const tweetText = i === 0 
        ? `${thread.title}\n\n${i + 1}/${thread.points.length} ${thread.points[i]}`
        : `${i + 1}/${thread.points.length} ${thread.points[i]}`;
      
      try {
        const tweet = previousTweetId
          ? await this.twitterClient.v2.reply(tweetText, previousTweetId)
          : await this.twitterClient.v2.tweet(tweetText);
        
        previousTweetId = tweet.data.id;
        
        // Wait between thread posts
        await this.sleep(30000); // 30 seconds
        
      } catch (error) {
        console.error('Error posting thread:', error);
        break;
      }
    }
  }
  
  async scheduleHealthContent() {
    // Daily health tips at optimal times for Mexican audience
    cron.schedule('0 8 * * *', () => {
      this.postDailyHealthTip('morning');
    });
    
    cron.schedule('0 20 * * *', () => {
      this.postDailyHealthTip('evening');
    });
    
    // Weekly health threads
    cron.schedule('0 19 * * 1', () => {
      this.generateHealthThread('diabetes');
    });
    
    cron.schedule('0 19 * * 4', () => {
      this.generateHealthThread('mental_health');
    });
    
    // Crisis monitoring every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      this.monitorHealthCrisis();
    });
    
    // Influencer engagement twice daily
    cron.schedule('0 11,17 * * *', () => {
      this.engageWithInfluencers();
    });
  }
  
  async postDailyHealthTip(timeOfDay) {
    const tips = {
      morning: [
        "🌅 ¡Buenos días México! Tip del día: Bebe un vaso de agua al despertar. Tu cuerpo lo agradecerá después de 8 horas sin hidratación 💧 #SaludMéxico",
        "🌄 ¡Buen día! Camina 10 minutos después del desayuno. Ayuda a controlar el azúcar en sangre - especialmente importante para mexicanos 🚶‍♂️ #DiabetesPrevencion",
        "☀️ Tip matutino: Si tomas café, hazlo sin azúcar añadida. México consume mucha azúcar oculta diariamente ☕ #SaludMéxico"
      ],
      evening: [
        "🌙 Buenas noches México. Tip nocturno: Cena ligero 2 horas antes de dormir. Tu digestión descansará mejor 🥗 #SaludMéxico",
        "🌃 Reflexión nocturna: ¿Bebiste suficiente agua hoy? La meta son 8 vasos. Mañana es un nuevo día para cuidarte 💧",
        "🌜 Tip de la noche: Desconéctate del celular 30 min antes de dormir. Tu mente necesita prepararse para el descanso 📱🚫"
      ]
    };
    
    const randomTip = tips[timeOfDay][Math.floor(Math.random() * tips[timeOfDay].length)];
    
    try {
      await this.twitterClient.v2.tweet(randomTip);
      console.log(`Posted ${timeOfDay} health tip`);
    } catch (error) {
      console.error(`Error posting ${timeOfDay} tip:`, error);
    }
  }
  
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize and start the bot
const bot = new DoctorMXTwitterBot();
bot.scheduleHealthContent();

module.exports = DoctorMXTwitterBot;
```

## 3. Compliance & Risk Management

### Platform Policy Compliance Framework
```typescript
interface SocialMediaCompliance {
  reddit: {
    posting_limits: {
      daily_posts: 3,
      daily_comments: 15,
      self_promotion_ratio: '1:9', // 1 promotional per 9 helpful
      subreddit_specific_rules: Map<string, string[]>
    },
    content_guidelines: {
      medical_disclaimers: 'required',
      cultural_sensitivity: 'critical',
      spam_prevention: 'automated_detection'
    }
  },
  
  twitter: {
    api_limits: {
      tweets_per_hour: 300,
      follows_per_hour: 400,
      rate_limit_handling: 'exponential_backoff'
    },
    content_guidelines: {
      health_misinformation: 'strict_compliance',
      emergency_protocols: 'immediate_911_redirect',
      mexican_context: 'cultural_appropriate'
    }
  }
}

const complianceMonitor = {
  async checkContentCompliance(content: string, platform: string) {
    const checks = [
      this.checkMedicalClaims(content),
      this.checkCulturalSensitivity(content),
      this.checkEmergencyLanguage(content),
      this.checkSpamSignals(content)
    ];
    
    const results = await Promise.all(checks);
    return results.every(check => check.passed);
  },
  
  async escalateToHuman(content: string, reason: string) {
    // Alert human moderators for manual review
    await this.notifyModerationTeam({
      content,
      reason,
      platform: 'social_media',
      urgency: reason.includes('emergency') ? 'high' : 'medium'
    });
  }
};
```

## 4. Performance Metrics & ROI

### Social Media Analytics Dashboard
```typescript
const socialMediaKPIs = {
  reddit_metrics: {
    karma_growth: 'target: +50/week',
    helpful_comments_ratio: 'target: >90%',
    community_trust_score: 'target: >4.5/5',
    educational_post_engagement: 'target: >100 upvotes',
    crisis_response_time: 'target: <30 minutes'
  },
  
  twitter_metrics: {
    health_engagement_rate: 'target: >5%',
    follower_quality_score: 'target: >80%',
    crisis_response_time: 'target: <15 minutes',
    influencer_engagement_success: 'target: >30%',
    thread_completion_rate: 'target: >70%'
  },
  
  conversion_metrics: {
    social_to_consultation: 'target: >2%',
    brand_mention_sentiment: 'target: >85% positive',
    mexican_market_penetration: 'target: 15% awareness',
    healthcare_authority_score: 'target: top 10 health accounts'
  }
};

async function trackSocialMediaROI() {
  const metrics = {
    reddit: await getRedditMetrics(),
    twitter: await getTwitterMetrics(),
    conversions: await getSocialConversions(),
    roi: await calculateSocialROI()
  };
  
  // Mexican market specific tracking
  const mexicanMetrics = {
    cultural_relevance_score: await getCulturalRelevanceScore(),
    spanish_language_accuracy: await getLanguageAccuracyScore(),
    local_health_topic_coverage: await getLocalTopicCoverage()
  };
  
  await logSocialMediaMetrics({ ...metrics, ...mexicanMetrics });
}
```

This social media automation strategy positions DoctorMX as a trusted healthcare authority in Mexican digital communities while maintaining platform compliance and cultural sensitivity. 