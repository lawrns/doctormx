# 📋 **Plan Paso a Paso: Implementación de Videollamadas Médicas - DoctorMX**

Basado en el análisis del proyecto DoctorMX y las tecnologías actuales, aquí está el plan detallado para implementar consultas médicas por videollamada:

## 🎯 **Fase 1: Planificación y Arquitectura (1-2 semanas)**

### **1.1 Análisis de Requerimientos**
- [ ] Definir tipos de consulta (urgente, programada, seguimiento)
- [ ] Establecer duración de consultas (15, 30, 45 minutos)
- [ ] Definir precios por tipo de consulta
- [ ] Crear flujo de usuario completo (reserva → pago → videollamada → seguimiento)
- [ ] Establecer requisitos de calidad de video/audio

### **1.2 Selección de Tecnología de Videollamada**
**Recomendación: Agora.io** (mejor para México)
- ✅ Excelente calidad en Latinoamérica
- ✅ SDK React nativo
- ✅ Precios competitivos
- ✅ Soporte HIPAA/médico
- ✅ Grabación de sesiones

**Alternativas evaluadas:**
- Twilio Video (más caro)
- WebRTC nativo (complejo de implementar)
- Zoom SDK (menos flexible)

### **1.3 Arquitectura de Base de Datos**
```sql
-- Nuevas tablas necesarias en Supabase
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  cedula_profesional VARCHAR(20) UNIQUE NOT NULL,
  especialidad VARCHAR(100),
  universidad VARCHAR(200),
  anos_experiencia INTEGER,
  tarifa_consulta DECIMAL(10,2),
  disponibilidad JSONB, -- horarios disponibles
  verificado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id),
  doctor_id UUID REFERENCES doctors(id),
  fecha_hora TIMESTAMP NOT NULL,
  duracion_minutos INTEGER DEFAULT 30,
  tipo_consulta VARCHAR(50), -- 'urgente', 'programada', 'seguimiento'
  estado VARCHAR(50) DEFAULT 'programada', -- 'programada', 'en_curso', 'completada', 'cancelada'
  precio DECIMAL(10,2),
  agora_channel_id VARCHAR(100),
  notas_medicas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  amount DECIMAL(10,2),
  stripe_payment_intent_id VARCHAR(200),
  status VARCHAR(50), -- 'pending', 'completed', 'failed', 'refunded'
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🛠️ **Fase 2: Configuración de Infraestructura (1 semana)**

### **2.1 Configuración de Agora.io**
```bash
npm install agora-rtc-react agora-rtc-sdk-ng
```

### **2.2 Variables de Entorno**
```env
# Agregar a .env
VITE_AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

### **2.3 Configuración de Stripe para Pagos**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### **2.4 Funciones Serverless (Netlify Functions)**
```javascript
// netlify/functions/generate-agora-token.js
// netlify/functions/create-payment-intent.js
// netlify/functions/verify-doctor.js
```

## 💻 **Fase 3: Desarrollo de Componentes Core (2-3 semanas)**

### **3.1 Servicios Base**
```typescript
// src/services/video/AgoraService.ts
export class AgoraService {
  private client: IAgoraRTCClient;
  
  async joinChannel(channelId: string, token: string): Promise<void>
  async leaveChannel(): Promise<void>
  async toggleCamera(): Promise<void>
  async toggleMicrophone(): Promise<void>
  async startScreenShare(): Promise<void>
}

// src/services/appointments/AppointmentService.ts
export class AppointmentService {
  async createAppointment(data: CreateAppointmentData): Promise<Appointment>
  async getAvailableSlots(doctorId: string, date: Date): Promise<TimeSlot[]>
  async cancelAppointment(appointmentId: string): Promise<void>
  async rescheduleAppointment(appointmentId: string, newDate: Date): Promise<void>
}

// src/services/payments/PaymentService.ts
export class PaymentService {
  async createPaymentIntent(amount: number, appointmentId: string): Promise<string>
  async confirmPayment(paymentIntentId: string): Promise<PaymentResult>
  async processRefund(appointmentId: string): Promise<RefundResult>
}
```

### **3.2 Componentes de Videollamada**
```typescript
// src/components/video/VideoCallInterface.tsx
interface VideoCallInterfaceProps {
  appointmentId: string;
  isDoctor: boolean;
  onCallEnd: () => void;
}

// src/components/video/VideoControls.tsx
// - Botones mute/unmute
// - Toggle cámara
// - Compartir pantalla
// - Finalizar llamada
// - Chat en tiempo real

// src/components/video/WaitingRoom.tsx
// - Sala de espera antes de la consulta
// - Verificación de audio/video
// - Información del doctor/paciente
```

### **3.3 Sistema de Reservas**
```typescript
// src/components/appointments/DoctorSelection.tsx
// - Lista de doctores disponibles
// - Filtros por especialidad
// - Calificaciones y reseñas
// - Precios y disponibilidad

// src/components/appointments/CalendarBooking.tsx
// - Calendario interactivo
// - Horarios disponibles
// - Selección de tipo de consulta

// src/components/appointments/PaymentFlow.tsx
// - Integración con Stripe
// - Resumen de consulta
// - Confirmación de pago
```

## 🎨 **Fase 4: Integración con UI Existente (1-2 semanas)**

### **4.1 Nuevas Páginas**
```typescript
// src/pages/appointments/BookAppointmentPage.tsx
// src/pages/appointments/MyAppointmentsPage.tsx
// src/pages/video/VideoConsultationPage.tsx
// src/pages/doctors/DoctorProfilePage.tsx
// src/pages/doctors/DoctorDashboardPage.tsx
```

### **4.2 Actualización del AIHomePage**
```typescript
// Agregar nueva sección "Consultas por Video"
const VIDEO_CONSULTATION_FEATURES = [
  {
    icon: Video,
    title: "Consultas por Videollamada",
    description: "Conecta con médicos certificados desde la comodidad de tu hogar",
    highlight: "Disponible 24/7"
  },
  {
    icon: Calendar,
    title: "Agenda tu Cita",
    description: "Reserva consultas programadas o solicita atención urgente",
    highlight: "Desde $299 MXN"
  }
];
```

### **4.3 Navegación Actualizada**
```typescript
// Agregar rutas en App.tsx
<Route path="/book-appointment" element={<BookAppointmentPage />} />
<Route path="/my-appointments" element={<MyAppointmentsPage />} />
<Route path="/video-consultation/:appointmentId" element={<VideoConsultationPage />} />
<Route path="/doctor-profile/:doctorId" element={<DoctorProfilePage />} />
```

## 🔐 **Fase 5: Autenticación y Roles (1 semana)**

### **5.1 Extensión del Sistema de Auth**
```typescript
// src/types/auth.ts
interface UserProfile {
  id: string;
  role: 'patient' | 'doctor' | 'admin';
  profile: PatientProfile | DoctorProfile;
}

interface DoctorProfile {
  cedulaProfesional: string;
  especialidad: string;
  verificado: boolean;
  tarifaConsulta: number;
  disponibilidad: AvailabilitySchedule;
}
```

### **5.2 Protección de Rutas**
```typescript
// src/components/ProtectedVideoRoute.tsx
// - Verificar que el usuario tenga cita activa
// - Validar horario de la consulta
// - Confirmar pago completado
```

## 📱 **Fase 6: Optimización Móvil (1 semana)**

### **6.1 Responsive Video Interface**
```css
/* src/styles/video-consultation.css */
@media (max-width: 768px) {
  .video-container {
    flex-direction: column;
    height: 100vh;
  }
  
  .video-controls {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 1rem;
  }
}
```

### **6.2 Optimizaciones de Rendimiento**
- Lazy loading de componentes de video
- Compresión de video para conexiones lentas
- Fallback a audio-only en conexiones pobres
- Optimización de batería en móviles

## 🧪 **Fase 7: Testing y QA (1-2 semanas)**

### **7.1 Tests E2E con Playwright**
```typescript
// e2e/video-consultation.spec.ts
test('Complete video consultation flow', async ({ page }) => {
  // 1. Login como paciente
  // 2. Seleccionar doctor
  // 3. Agendar cita
  // 4. Realizar pago
  // 5. Unirse a videollamada
  // 6. Finalizar consulta
});
```

### **7.2 Tests de Integración**
- Pruebas de calidad de video en diferentes dispositivos
- Tests de reconexión automática
- Validación de pagos y reembolsos
- Pruebas de notificaciones

## 🚀 **Fase 8: Deployment y Monitoreo (1 semana)**

### **8.1 Configuración de Producción**
```javascript
// netlify.toml - actualizar
[build.environment]
  VITE_AGORA_APP_ID = "production_app_id"
  
[[redirects]]
  from = "/api/video/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### **8.2 Monitoreo y Analytics**
- Métricas de calidad de llamadas
- Tiempo promedio de consultas
- Tasa de finalización exitosa
- Satisfacción del usuario

## 💰 **Estimación de Costos Mensuales**

### **Servicios Externos**
- **Agora.io**: ~$500-1000 USD/mes (1000 horas de video)
- **Stripe**: 3.6% + $3 MXN por transacción
- **Supabase**: Plan Pro $25 USD/mes
- **Netlify**: Plan Pro $19 USD/mes

### **Desarrollo**
- **Tiempo estimado**: 8-12 semanas
- **Desarrolladores**: 2-3 desarrolladores full-stack
- **Costo estimado**: $80,000 - $120,000 MXN

---

**Nota**: Este plan aprovecha las tecnologías existentes del proyecto (React, TypeScript, Supabase, Tailwind) y se integra naturalmente con la arquitectura actual, manteniendo los estándares de calidad y el enfoque cultural mexicano establecidos.

## 🎯 **Funcionalidades Adicionales (Fase 2)**

### **Características Avanzadas**
- [ ] Grabación de consultas (con consentimiento)
- [ ] Recetas médicas digitales
- [ ] Integración con laboratorios
- [ ] Sistema de reseñas y calificaciones
- [ ] Notificaciones push
- [ ] Chat post-consulta
- [ ] Historial médico compartido
- [ ] Integración con calendario del doctor

### **Integraciones Mexicanas**
- [ ] Conexión con COFEPRIS para validación de médicos
- [ ] Integración con farmacias para entrega de medicamentos
- [ ] Soporte para IMSS/ISSSTE
- [ ] Facturación electrónica (CFDI)

## 📋 **Checklist de Implementación**

### **Pre-requisitos**
- [ ] Cuenta Agora.io configurada
- [ ] Cuenta Stripe México configurada
- [ ] Certificados SSL para videollamadas
- [ ] Plan Supabase Pro activado
- [ ] Equipo de desarrollo asignado

### **Fase 1: Planificación**
- [ ] Definición de requerimientos completa
- [ ] Arquitectura de base de datos diseñada
- [ ] Flujos de usuario documentados
- [ ] Wireframes y mockups aprobados
- [ ] Plan de testing definido

### **Fase 2: Infraestructura**
- [ ] Agora.io SDK integrado
- [ ] Stripe configurado
- [ ] Variables de entorno configuradas
- [ ] Funciones serverless creadas
- [ ] Base de datos actualizada

### **Fase 3: Desarrollo Core**
- [ ] Servicios base implementados
- [ ] Componentes de video creados
- [ ] Sistema de reservas desarrollado
- [ ] Integración de pagos completada
- [ ] Tests unitarios escritos

### **Fase 4: UI/UX**
- [ ] Páginas nuevas creadas
- [ ] Homepage actualizada
- [ ] Navegación modificada
- [ ] Diseño responsivo implementado
- [ ] Accesibilidad verificada

### **Fase 5: Seguridad**
- [ ] Autenticación extendida
- [ ] Roles implementados
- [ ] Rutas protegidas
- [ ] Validaciones de seguridad
- [ ] Encriptación de datos

### **Fase 6: Mobile**
- [ ] Interface responsiva
- [ ] Optimizaciones de rendimiento
- [ ] Tests en dispositivos reales
- [ ] Fallbacks implementados
- [ ] PWA actualizada

### **Fase 7: Testing**
- [ ] Tests E2E escritos
- [ ] Tests de integración
- [ ] Tests de carga
- [ ] Tests de seguridad
- [ ] UAT completado

### **Fase 8: Deployment**
- [ ] Configuración de producción
- [ ] Monitoreo configurado
- [ ] Analytics implementado
- [ ] Documentación completada
- [ ] Capacitación del equipo

## 🚨 **Consideraciones Importantes**

### **Regulaciones Médicas**
- Cumplimiento con NOM-024-SSA3-2012 (expediente clínico)
- Protección de datos personales (LFPDPPP)
- Consentimiento informado para videollamadas
- Validación de cédulas profesionales

### **Aspectos Técnicos Críticos**
- Latencia máxima: 150ms para buena experiencia
- Calidad mínima: 720p para diagnósticos visuales
- Backup de conexión para emergencias
- Grabación segura con encriptación

### **Experiencia de Usuario**
- Onboarding simple para usuarios no técnicos
- Soporte técnico durante consultas
- Instrucciones claras de uso
- Fallback a llamada telefónica

---

**Fecha de creación**: 30 de junio, 2025
**Proyecto**: DoctorMX - Plataforma de IA Médica
**Funcionalidad**: Implementación de Videollamadas Médicas
**Versión**: 1.0
**Autor**: Análisis basado en arquitectura actual del proyecto
