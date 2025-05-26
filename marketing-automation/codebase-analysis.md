# DoctorMX Codebase Analysis & Marketing Integration Points

## Platform Architecture Overview

### Technology Stack
```typescript
// Current Stack Analysis
{
  "frontend": "React 18.2.0 + TypeScript",
  "backend": "Supabase (PostgreSQL + Auth + Storage)",
  "deployment": "Netlify with Edge Functions",
  "ai_integration": "OpenAI GPT-4 + Custom Medical Knowledge Base",
  "styling": "TailwindCSS + Framer Motion",
  "state_management": "XState + React Query",
  "routing": "React Router DOM 6.16.0"
}
```

### User Journey Mapping & Marketing Touchpoints

#### 1. Landing Page (`src/pages/AIHomePage.tsx`)
**Marketing Integration Opportunities:**
```typescript
// Add tracking events for marketing attribution
const trackLandingPageView = () => {
  // Google Analytics 4 event
  gtag('event', 'page_view', {
    page_title: 'DoctorMX Home',
    page_location: window.location.href,
    user_id: userId || 'anonymous'
  });
  
  // Supabase analytics
  supabase.from('user_events').insert({
    event_type: 'landing_page_view',
    user_id: userId,
    timestamp: new Date(),
    metadata: {
      referrer: document.referrer,
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign')
    }
  });
};

// Lead capture optimization
const enhancedChatSubmit = async (message: string) => {
  // Track consultation intent
  await trackEvent('consultation_intent', {
    initial_message: message,
    source: 'homepage_chat'
  });
  
  // Trigger lead nurturing workflow
  await triggerMarketingAutomation('new_lead', {
    message,
    source: 'homepage'
  });
};
```

**Key Marketing Angles:**
- "Dr. Simeon" - Personalized Mexican AI doctor
- 25,000+ consultations completed (social proof)
- 4.9/5 rating with cultural understanding
- Free consultations (lead magnet)
- WhatsApp integration (Mexican preference)

#### 2. AI Doctor Consultation (`src/features/ai-doctor/components/AIDoctor.tsx`)
**Marketing Integration Points:**

```typescript
// Enhanced user scoring based on consultation behavior
const calculateUserEngagementScore = (consultation: Consultation) => {
  let score = 0;
  
  // Message depth scoring
  score += consultation.messages.length * 2;
  
  // Feature usage scoring
  if (consultation.imageAnalysis) score += 15;
  if (consultation.voiceMessages) score += 10;
  if (consultation.locationShared) score += 5;
  
  // Completion scoring
  if (consultation.completedConsultation) score += 25;
  if (consultation.scheduledAppointment) score += 30;
  
  return Math.min(score, 100);
};

// Behavioral triggers for marketing automation
const consultationEventHandlers = {
  onMessageSent: async (message: Message) => {
    await trackEvent('consultation_message', {
      message_type: message.sender,
      has_image: !!message.imageUrl,
      severity_detected: message.severity
    });
  },
  
  onConsultationComplete: async (consultation: Consultation) => {
    const userScore = calculateUserEngagementScore(consultation);
    
    // Trigger appropriate marketing workflow
    if (userScore >= 70) {
      await triggerWorkflow('high_intent_user', { consultation, userScore });
    } else if (userScore >= 40) {
      await triggerWorkflow('medium_intent_user', { consultation, userScore });
    } else {
      await triggerWorkflow('low_intent_user', { consultation, userScore });
    }
  },
  
  onEmergencyDetected: async (consultation: Consultation) => {
    // Immediate follow-up for emergency cases
    await triggerWorkflow('emergency_follow_up', { consultation });
  }
};
```

#### 3. User Registration Hooks
```typescript
// src/hooks/useAuthIntegration.ts
export const useAuthIntegration = () => {
  const onUserRegistration = async (user: User, metadata: any) => {
    // Marketing automation trigger
    await fetch('/.netlify/functions/user-registered', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        email: user.email,
        phone: user.phone,
        registration_source: metadata.source,
        utm_data: metadata.utm,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    });
    
    // WhatsApp welcome message
    if (user.phone) {
      await sendWhatsAppWelcome(user.phone, user.email);
    }
    
    // Email onboarding sequence
    await startEmailOnboarding(user.email, {
      name: user.user_metadata?.name,
      source: metadata.source
    });
  };
  
  return { onUserRegistration };
};
```

### API Endpoints for Marketing Integration

#### 1. User Analytics Endpoint
```typescript
// netlify/functions/user-analytics.ts
export const handler = async (event: any) => {
  const { user_id, event_type, metadata } = JSON.parse(event.body);
  
  // Store in Supabase for analysis
  await supabase.from('user_analytics').insert({
    user_id,
    event_type,
    metadata,
    timestamp: new Date(),
    session_id: metadata.session_id
  });
  
  // Trigger real-time marketing automation
  await fetch(`${process.env.N8N_WEBHOOK_URL}/user-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id,
      event_type,
      metadata,
      timestamp: new Date().toISOString()
    })
  });
  
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

#### 2. WhatsApp Integration Endpoint
```typescript
// netlify/functions/whatsapp-webhook.ts
export const handler = async (event: any) => {
  const { phone, message_type, content } = JSON.parse(event.body);
  
  const whatsappApi = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
  
  const messageTemplates = {
    welcome: {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: "doctormx_welcome",
        language: { code: "es_MX" },
        components: [{
          type: "body",
          parameters: [{
            type: "text",
            text: "Dr. Simeon"
          }]
        }]
      }
    },
    
    consultation_reminder: {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: "consultation_reminder",
        language: { code: "es_MX" }
      }
    }
  };
  
  await fetch(whatsappApi, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messageTemplates[message_type])
  });
  
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

### Unique Value Propositions for Marketing

#### 1. AI Doctor "Dr. Simeon" Positioning
```markdown
**Primary Value Props:**
- "El primer médico mexicano con inteligencia artificial"
- "Entiende tu cultura y tu familia"
- "Disponible 24/7 como tu médico de cabecera"
- "Análisis de síntomas en tiempo real"
- "Conexión directa con doctores locales"

**Differentiation from Competitors:**
- Dr. Consulta: Physical clinics vs AI-first approach
- Doctoralia: Appointment booking vs comprehensive AI consultation
- Médica Sur: Premium pricing vs accessible AI healthcare
```

#### 2. Mexican Cultural Integration Features
```typescript
// Cultural adaptation features for marketing
const mexicanHealthFeatures = {
  familyMedicine: "Consejos para toda la familia mexicana",
  traditionalIntegration: "Combina medicina tradicional y moderna",
  imssIntegration: "Compatible con tu seguro del IMSS",
  localProviders: "Doctores cerca de ti en tu ciudad",
  whatsappFirst: "Tu doctor en WhatsApp, como hablas con familia"
};

// Regional health targeting
const regionalHealthConcerns = {
  "Ciudad de México": ["contaminación", "estrés", "diabetes"],
  "Guadalajara": ["alergias", "respiratorias", "cardiovascular"],
  "Monterrey": ["industrial", "laboral", "nutrición"],
  "Cancún": ["turista", "tropical", "dermatológicas"],
  "Tijuana": ["fronteriza", "migración", "mental"]
};
```

#### 3. Integration with Existing DoctorMX Features
```typescript
// Marketing hooks for existing features
const featureMarketingHooks = {
  imageAnalysis: {
    trigger: 'image_upload',
    marketingAngle: 'Análisis instantáneo de síntomas visuales',
    followUp: 'dermatology_specialist_recommendation'
  },
  
  medicationRecommendations: {
    trigger: 'medication_suggested',
    marketingAngle: 'Encuentra medicamentos en farmacias cercanas',
    followUp: 'pharmacy_partnership_promotion'
  },
  
  providerSearch: {
    trigger: 'provider_search',
    marketingAngle: 'Conecta con doctores reales en tu área',
    followUp: 'appointment_booking_assistance'
  },
  
  aiAnalysis: {
    trigger: 'consultation_complete',
    marketingAngle: 'Reporte médico personalizado',
    followUp: 'health_monitoring_subscription'
  }
};
```

### Data Collection Points for Personalization

#### 1. User Behavior Tracking
```typescript
// Enhanced user tracking for marketing personalization
interface UserBehaviorData {
  consultation_patterns: {
    preferred_time: string;
    common_symptoms: string[];
    consultation_frequency: number;
    completion_rate: number;
  };
  
  engagement_metrics: {
    feature_usage: Record<string, number>;
    session_duration: number;
    pages_visited: string[];
    bounce_rate: number;
  };
  
  health_interests: {
    conditions_researched: string[];
    specialists_viewed: string[];
    medications_searched: string[];
    content_consumed: string[];
  };
  
  geographic_data: {
    location: { lat: number; lng: number };
    city: string;
    state: string;
    healthcare_providers_nearby: number;
  };
}
```

#### 2. Conversion Events
```typescript
// Critical conversion events for marketing attribution
const conversionEvents = [
  'user_registration',
  'first_consultation_start',
  'first_consultation_complete',
  'image_analysis_used',
  'provider_contacted',
  'appointment_scheduled',
  'subscription_upgraded',
  'referral_generated'
];

// Conversion tracking implementation
const trackConversion = async (event: string, data: any) => {
  // Google Analytics 4
  gtag('event', event, {
    event_category: 'conversion',
    event_label: data.source,
    value: data.value || 0
  });
  
  // Facebook Pixel
  fbq('track', event, data);
  
  // Internal analytics
  await supabase.from('conversions').insert({
    event_type: event,
    user_id: data.user_id,
    data,
    timestamp: new Date()
  });
};
```

## Implementation Priorities

### Phase 1: Core Integration (Week 1)
1. User registration hooks
2. Consultation completion triggers
3. Basic analytics implementation
4. WhatsApp welcome automation

### Phase 2: Advanced Tracking (Week 2)
1. Behavioral scoring system
2. Feature usage analytics
3. Geographic targeting setup
4. Email automation triggers

### Phase 3: Optimization (Week 3-4)
1. A/B testing framework
2. Personalization engine
3. Multi-channel attribution
4. Performance optimization

This analysis provides the foundation for all subsequent marketing automation tasks, ensuring we leverage every user touchpoint and platform feature for maximum acquisition and retention impact. 