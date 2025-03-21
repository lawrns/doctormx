/**
 * Defines the subscription plans available in Doctor.mx
 */

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number | null;
  highlighted?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // In MXN
  billingCycle: 'monthly' | 'yearly';
  features: PlanFeature[];
  popular?: boolean;
  legacy?: boolean;
}

// Features available across different plans
const allFeatures: Record<string, Omit<PlanFeature, 'included' | 'limit'>> = {
  profile: {
    id: 'profile',
    name: 'Perfil médico',
    description: 'Perfil profesional en Doctor.mx',
  },
  appointments: {
    id: 'appointments',
    name: 'Agenda de citas',
    description: 'Sistema de agendamiento de citas',
  },
  patientMessaging: {
    id: 'patientMessaging',
    name: 'Mensajería con pacientes',
    description: 'Comunicación directa y segura con tus pacientes',
  },
  subdomain: {
    id: 'subdomain',
    name: 'Subdominio personalizado',
    description: 'URL personalizada (tunombre.doctor.mx)',
    highlighted: true,
  },
  customDomain: {
    id: 'customDomain',
    name: 'Dominio propio',
    description: 'Usa tu propio dominio (tunombre.com)',
    highlighted: true,
  },
  doctoraliaSync: {
    id: 'doctoraliaSync',
    name: 'Sincronización con Doctoralia',
    description: 'Sincroniza tu agenda con Doctoralia',
    highlighted: true,
  },
  videoConsultation: {
    id: 'videoConsultation',
    name: 'Consultas por video',
    description: 'Plataforma de videoconsultas integrada',
  },
  analytics: {
    id: 'analytics',
    name: 'Analítica básica',
    description: 'Estadísticas de tu perfil y citas',
  },
  advancedAnalytics: {
    id: 'advancedAnalytics',
    name: 'Analítica avanzada',
    description: 'Reportes detallados y tendencias',
    highlighted: true,
  },
  staff: {
    id: 'staff',
    name: 'Cuentas de personal',
    description: 'Cuentas adicionales para tu equipo',
  },
  patientRecords: {
    id: 'patientRecords',
    name: 'Expedientes de pacientes',
    description: 'Gestión básica de expedientes clínicos',
  },
  advancedPatientRecords: {
    id: 'advancedPatientRecords',
    name: 'Expedientes avanzados',
    description: 'Gestión completa de expedientes con plantillas personalizadas',
    highlighted: true,
  },
  insurance: {
    id: 'insurance',
    name: 'Verificación de seguros',
    description: 'Verificación de cobertura de seguros médicos',
    highlighted: true,
  },
  financialDashboard: {
    id: 'financialDashboard',
    name: 'Panel financiero',
    description: 'Gestión de ingresos y reportes financieros',
    highlighted: true,
  },
  multiDoctor: {
    id: 'multiDoctor',
    name: 'Gestión de múltiples médicos',
    description: 'Para clínicas y grupos médicos',
    highlighted: true,
  },
  customBranding: {
    id: 'customBranding',
    name: 'Marca personalizada',
    description: 'Personalización completa de la interfaz',
    highlighted: true,
  },
  api: {
    id: 'api',
    name: 'Acceso a API',
    description: 'Integración con sistemas externos',
    highlighted: true,
  },
  dedicatedManager: {
    id: 'dedicatedManager',
    name: 'Gerente de cuenta dedicado',
    description: 'Soporte personalizado prioritario',
    highlighted: true,
  },
  prioritySupport: {
    id: 'prioritySupport',
    name: 'Soporte prioritario',
    description: 'Asistencia técnica con prioridad',
  },
  emailSupport: {
    id: 'emailSupport',
    name: 'Soporte por email',
    description: 'Asistencia técnica por correo electrónico',
  },
  phoneSupport: {
    id: 'phoneSupport',
    name: 'Soporte telefónico',
    description: 'Asistencia técnica por teléfono',
  },
};

/**
 * Available subscription plans
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // Basic Plan
  {
    id: 'basic',
    name: 'Básico',
    description: 'Para médicos independientes que inician su presencia digital',
    price: 499,
    billingCycle: 'monthly',
    features: [
      { ...allFeatures.profile, included: true },
      { ...allFeatures.appointments, included: true, limit: 50 },
      { ...allFeatures.patientMessaging, included: true },
      { ...allFeatures.subdomain, included: false },
      { ...allFeatures.customDomain, included: false },
      { ...allFeatures.doctoraliaSync, included: false },
      { ...allFeatures.videoConsultation, included: false },
      { ...allFeatures.analytics, included: true },
      { ...allFeatures.advancedAnalytics, included: false },
      { ...allFeatures.staff, included: false },
      { ...allFeatures.patientRecords, included: true },
      { ...allFeatures.advancedPatientRecords, included: false },
      { ...allFeatures.insurance, included: false },
      { ...allFeatures.financialDashboard, included: false },
      { ...allFeatures.multiDoctor, included: false },
      { ...allFeatures.customBranding, included: false },
      { ...allFeatures.api, included: false },
      { ...allFeatures.dedicatedManager, included: false },
      { ...allFeatures.emailSupport, included: true },
      { ...allFeatures.prioritySupport, included: false },
      { ...allFeatures.phoneSupport, included: false },
    ]
  },
  
  // Professional Plan
  {
    id: 'professional',
    name: 'Profesional',
    description: 'Para profesionales que buscan una presencia digital completa',
    price: 999,
    billingCycle: 'monthly',
    popular: true,
    features: [
      { ...allFeatures.profile, included: true },
      { ...allFeatures.appointments, included: true, limit: 150 },
      { ...allFeatures.patientMessaging, included: true },
      { ...allFeatures.subdomain, included: true },
      { ...allFeatures.customDomain, included: false },
      { ...allFeatures.doctoraliaSync, included: true },
      { ...allFeatures.videoConsultation, included: true },
      { ...allFeatures.analytics, included: true },
      { ...allFeatures.advancedAnalytics, included: false },
      { ...allFeatures.staff, included: false },
      { ...allFeatures.patientRecords, included: true },
      { ...allFeatures.advancedPatientRecords, included: false },
      { ...allFeatures.insurance, included: false },
      { ...allFeatures.financialDashboard, included: false },
      { ...allFeatures.multiDoctor, included: false },
      { ...allFeatures.customBranding, included: false },
      { ...allFeatures.api, included: false },
      { ...allFeatures.dedicatedManager, included: false },
      { ...allFeatures.emailSupport, included: true },
      { ...allFeatures.prioritySupport, included: true },
      { ...allFeatures.phoneSupport, included: false },
    ]
  },
  
  // Premium Plan
  {
    id: 'premium',
    name: 'Premium',
    description: 'Solución completa para médicos con prácticas establecidas',
    price: 1799,
    billingCycle: 'monthly',
    features: [
      { ...allFeatures.profile, included: true },
      { ...allFeatures.appointments, included: true, limit: null }, // Unlimited
      { ...allFeatures.patientMessaging, included: true },
      { ...allFeatures.subdomain, included: true },
      { ...allFeatures.customDomain, included: true },
      { ...allFeatures.doctoraliaSync, included: true },
      { ...allFeatures.videoConsultation, included: true },
      { ...allFeatures.analytics, included: true },
      { ...allFeatures.advancedAnalytics, included: true },
      { ...allFeatures.staff, included: true, limit: 2 },
      { ...allFeatures.patientRecords, included: true },
      { ...allFeatures.advancedPatientRecords, included: true },
      { ...allFeatures.insurance, included: true },
      { ...allFeatures.financialDashboard, included: true },
      { ...allFeatures.multiDoctor, included: false },
      { ...allFeatures.customBranding, included: false },
      { ...allFeatures.api, included: false },
      { ...allFeatures.dedicatedManager, included: false },
      { ...allFeatures.emailSupport, included: true },
      { ...allFeatures.prioritySupport, included: true },
      { ...allFeatures.phoneSupport, included: true },
    ]
  },
  
  // Enterprise Plan
  {
    id: 'enterprise',
    name: 'Empresarial',
    description: 'Para grupos médicos y clínicas con múltiples especialistas',
    price: 2999,
    billingCycle: 'monthly',
    features: [
      { ...allFeatures.profile, included: true },
      { ...allFeatures.appointments, included: true, limit: null }, // Unlimited
      { ...allFeatures.patientMessaging, included: true },
      { ...allFeatures.subdomain, included: true },
      { ...allFeatures.customDomain, included: true },
      { ...allFeatures.doctoraliaSync, included: true },
      { ...allFeatures.videoConsultation, included: true },
      { ...allFeatures.analytics, included: true },
      { ...allFeatures.advancedAnalytics, included: true },
      { ...allFeatures.staff, included: true, limit: 5 },
      { ...allFeatures.patientRecords, included: true },
      { ...allFeatures.advancedPatientRecords, included: true },
      { ...allFeatures.insurance, included: true },
      { ...allFeatures.financialDashboard, included: true },
      { ...allFeatures.multiDoctor, included: true },
      { ...allFeatures.customBranding, included: true },
      { ...allFeatures.api, included: true },
      { ...allFeatures.dedicatedManager, included: true },
      { ...allFeatures.emailSupport, included: true },
      { ...allFeatures.prioritySupport, included: true },
      { ...allFeatures.phoneSupport, included: true },
    ]
  }
];

// Add-ons available for purchase
export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  compatiblePlans: string[]; // Plan IDs this add-on is compatible with
}

export const SUBSCRIPTION_ADDONS: AddOn[] = [
  {
    id: 'additional-staff',
    name: 'Usuario de personal adicional',
    description: 'Añade usuarios adicionales para tu personal',
    price: 199,
    billingCycle: 'monthly',
    compatiblePlans: ['premium', 'enterprise']
  },
  {
    id: 'seo-package',
    name: 'Paquete SEO avanzado',
    description: 'Mejora tu posicionamiento en buscadores',
    price: 399,
    billingCycle: 'monthly',
    compatiblePlans: ['professional', 'premium', 'enterprise']
  },
  {
    id: 'patient-acquisition',
    name: 'Paquete de adquisición de pacientes',
    description: 'Promoción especial en el directorio de Doctor.mx',
    price: 599,
    billingCycle: 'monthly',
    compatiblePlans: ['professional', 'premium', 'enterprise']
  },
  {
    id: 'white-label-app',
    name: 'App de paciente white-label',
    description: 'Aplicación para pacientes con tu marca',
    price: 999,
    billingCycle: 'monthly',
    compatiblePlans: ['premium', 'enterprise']
  }
];

export default {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_ADDONS
};