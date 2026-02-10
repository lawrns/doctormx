# Doctor.mx API Documentation

Bienvenido a la documentación de la API de Doctor.mx. Esta documentación describe cómo integrar y utilizar los servicios de la plataforma de telemedicina Doctor.mx.

## Tabla de Contenidos

- [Inicio Rápido](#inicio-rápido)
- [Autenticación](#autenticación)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
- [Modelos de Datos](#modelos-de-datos)
- [Errores](#errores)
- [Webhooks](#webhooks)
- [SDKs y Herramientas](#sdks-y-herramientas)

## Inicio Rápido

### Requisitos Previos

- Node.js 18+ o similar
- Una cuenta de Doctor.mx (contacta a [api@doctormx.com](mailto:api@doctormx.com))
- Token de autenticación de Supabase

### Primera Llamada

```typescript
// Ejemplo usando fetch
const response = await fetch('https://doctormx.com/api/subscriptions/plans', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
console.log(data.plans);
```

### Ejemplo con Autenticación

```typescript
// Primero, autentica al usuario
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@example.com',
  password: 'contraseña',
});

// Luego, usa la sesión para hacer llamadas autenticadas
const response = await fetch('https://doctormx.com/api/patient/profile', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    // La cookie de sesión se incluye automáticamente
  },
});
```

## Autenticación

La API de Doctor.mx utiliza autenticación basada en sesiones de Supabase.

### Flujo de Autenticación

1. **Registro o Login**
   ```typescript
   // Registro
   const { data, error } = await supabase.auth.signUp({
     email: 'usuario@example.com',
     password: 'contraseña_segura',
   });

   // Login
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'usuario@example.com',
     password: 'contraseña_segura',
   });
   ```

2. **Gestión de Sesión**
   - Las cookies de sesión (`sb-access-token`, `sb-refresh-token`) se gestionan automáticamente
   - La sesión se renueva automáticamente usando el refresh token

3. **Roles de Usuario**
   - `patient`: Pacientes que buscan atención médica
   - `doctor`: Médicos que proporcionan consultas
   - `admin`: Administradores del sistema

### Verificación de Permisos

La API verifica automáticamente los roles según la ruta:

```typescript
// Middleware de autenticación (implementación del servidor)
const requiredRole = getRequiredRole(path); // 'patient', 'doctor', o 'admin'
if (requiredRole && user.role !== requiredRole) {
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}
```

## Rate Limiting

La API implementa rate limiting para prevenir abusos y garantizar disponibilidad.

### Límites por Defecto

| Tipo de Endpoint | Requests | Ventana | Descripción |
|------------------|----------|---------|-------------|
| Auth: Login | 5 | 5 minutos | Previene fuerza bruta |
| Auth: Register | 3 | 5 minutos | Previene spam de registros |
| Auth: Reset Password | 3 | 1 hora | Previene abuso |
| AI: Consult | 20 | 1 minuto | Control de costes |
| AI: Vision | 15 | 1 minuto | Procesamiento de imágenes |
| AI: General | 20 | 1 minuto | Endpoints AI generales |
| API: Read | 200 | 1 minuto | Operaciones de lectura |
| API: Write | 50 | 1 minuto | Operaciones de escritura |
| Premium: General | 500 | 1 minuto | Usuarios Premium |

### Límites de Usuarios Premium

Los usuarios con suscripción Premium tienen límites significativamente más altos:

- **AI Endpoints**: 5x más requests
- **General API**: 5x más requests
- **No hay límites estrictos**: Solo límites razonables para prevenir abuse

### Headers de Rate Limit

Cada respuesta incluye headers con información del rate limit:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641234567
```

### Manejo de Rate Limit

Cuando se excede el límite, la API responde con status `429`:

```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

Implementa reintentos con exponential backoff:

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      continue;
    }

    return response;
  }
  throw new Error('Max retries exceeded');
}
```

## Endpoints

### Citas Médicas (Appointments)

#### Crear Cita

```http
POST /api/appointments
Content-Type: application/json

{
  "doctorId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2026-03-15",
  "time": "14:30"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "appointmentId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Cancelar Cita

```http
POST /api/appointments/{id}/cancel
```

#### Obtener Video URL

```http
GET /api/appointments/{id}/video
```

### Consultas AI

#### Consulta Conversacional

```http
POST /api/ai/consult
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Tengo dolor de cabeza desde hace 3 días"
    }
  ]
}
```

**Respuesta:**
```json
{
  "message": "Entiendo que tienes dolor de cabeza...",
  "complete": false,
  "specialists": ["general_practitioner", "neurology"],
  "citations": [
    {
      "title": "Guía de práctica clínica para cefaleas",
      "source": "American Academy of Neurology",
      "year": 2021
    }
  ],
  "meta": {
    "latencyMs": 1523,
    "provider": "openai",
    "model": "gpt-4",
    "costUSD": 0.0023
  }
}
```

#### Consulta SOAP con Streaming

```http
POST /api/soap/stream
Content-Type: application/json

{
  "patientId": "user-uuid",
  "subjective": {
    "chiefComplaint": "Dolor de cabeza",
    "symptomsDescription": "Dolor pulsátil en lado derecho...",
    "symptomDuration": "3 días",
    "symptomSeverity": 7,
    "onsetType": "gradual"
  },
  "objective": {
    "patientAge": 35,
    "patientGender": "female"
  }
}
```

**Respuesta (Server-Sent Events):**
```
event: start
data: {"consultationId": "soap-123", "patientId": "user-uuid", "timestamp": "2026-02-09T..."}

event: specialist_done
data: {"specialist": "general-practitioner", "diagnosis": "Migraña...", "confidence": 0.8}

event: consensus_done
data: {"primaryDiagnosis": "Migraña sin aura", "urgencyLevel": "moderate", "agreementLevel": "strong"}

event: complete
data: {"consultationId": "...", "specialists": [...], "consensus": {...}, "plan": {...}}
```

### Análisis de Imágenes

```http
POST /api/ai/vision/analyze
Content-Type: multipart/form-data

image: [binary]
type: skin
context: Lesión en antebrazo derecho
```

### Cuestionarios Médicos

#### Iniciar Cuestionario

```http
POST /api/questionnaire/start
Content-Type: application/json

{
  "patientId": "user-uuid",
  "specialty": "dermatology"
}
```

**Respuesta:**
```json
{
  "success": true,
  "conversationId": "conv-uuid",
  "firstQuestion": {
    "questionId": "q1",
    "text": "¿Cuál es el motivo principal de tu consulta?",
    "type": "choice",
    "options": ["Dolor", "Erupción", "Otro"]
  }
}
```

#### Enviar Respuesta

```http
POST /api/questionnaire/message
Content-Type: application/json

{
  "conversationId": "conv-uuid",
  "answer": "Erupción en la piel"
}
```

### Perfiles de Médicos

#### Buscar Médicos

```http
GET /api/directory/recommended?specialty=Cardiología&location=Ciudad%20de%20México&limit=10
```

**Respuesta:**
```json
{
  "doctors": [
    {
      "id": "doctor-uuid",
      "fullName": "Dra. María García",
      "specialty": "Cardiología",
      "rating": 4.8,
      "totalReviews": 127,
      "priceCents": 50000,
      "currency": "MXN"
    }
  ]
}
```

#### Obtener Disponibilidad

```http
GET /api/doctors/{id}/available-dates?startDate=2026-03-01&endDate=2026-03-31
```

#### Obtener Horarios

```http
GET /api/doctors/{id}/slots?date=2026-03-15
```

### Pagos y Suscripciones

#### Obtener Planes

```http
GET /api/subscriptions/plans
```

**Respuesta:**
```json
{
  "success": true,
  "plans": [
    {
      "id": "pro",
      "name": "Professional",
      "name_es": "Profesional",
      "price_mxn": 999,
      "price_cents": 99900,
      "currency": "MXN",
      "features": [
        "100 consultas AI al mes",
        "Análisis de imágenes ilimitado",
        "Soporte prioritario"
      ],
      "limits": {
        "whatsapp_patients": 100,
        "ai_copilot": 100,
        "image_analysis": -1
      },
      "highlight": true
    }
  ]
}
```

### Webhooks

#### Stripe Webhook

La API procesa los siguientes eventos de Stripe:

- `payment_intent.succeeded`: Pago exitoso
- `payment_intent.payment_failed`: Pago fallido
- `charge.succeeded`: Pago OXXO exitoso
- `charge.failed`: Pago OXXO fallido
- `customer.subscription.created`: Suscripción creada
- `customer.subscription.updated`: Suscripción actualizada
- `customer.subscription.deleted`: Suscripción cancelada
- `invoice.payment_succeeded`: Renovación exitosa
- `invoice.payment_failed`: Renovación fallida

**Configuración del Webhook:**

1. Ve al dashboard de Stripe
2. Configura el endpoint: `https://doctormx.com/api/webhooks/stripe`
3. Selecciona los eventos a escuchar
4. Copia el webhook secret y configúralo en tu ambiente

## Modelos de Datos

### Appointment (Cita)

```typescript
interface Appointment {
  id: string;                    // UUID
  patientId: string;             // UUID
  doctorId: string;              // UUID
  startTs: string;               // ISO 8601 datetime
  endTs: string;                 // ISO 8601 datetime
  status: 'pending' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  type: 'in_person' | 'video';
  priceCents: number;
  currency: string;              // Default: 'MXN'
  notes?: string;
  createdAt: string;             // ISO 8601 datetime
  updatedAt: string;             // ISO 8601 datetime
}
```

### PatientProfile (Perfil de Paciente)

```typescript
interface PatientProfile {
  id: string;                    // UUID
  userId: string;                // UUID
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;          // ISO 8601 date
  gender?: 'male' | 'female' | 'other';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}
```

### DoctorProfile (Perfil de Médico)

```typescript
interface DoctorProfile {
  id: string;                    // UUID
  userId: string;                // UUID
  fullName: string;
  specialty: string;
  subSpecialties?: string[];
  licenseNumber: string;
  yearsExperience: number;
  bio: string;
  profileImage?: string;         // URI
  rating: number;                // 0-5
  totalReviews: number;
  priceCents: number;
  currency: string;              // Default: 'MXN'
  languages: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  availability?: Array<{
    dayOfWeek: number;           // 0-6 (Sunday-Saturday)
    startTime: string;           // HH:MM
    endTime: string;             // HH:MM
  }>;
}
```

### ConsultationResult (Resultado de Consulta)

```typescript
interface ConsultationResult {
  id: string;
  primaryDiagnosis: string;
  confidence: number;            // 0-1
  specialists: Array<{
    id: string;
    name: string;
    specialty: string;
    primaryDiagnosis: string;
    confidence: number;
    assessment: string;
    differentialDiagnoses: string[];
    recommendations: string[];
    urgency: 'emergency' | 'urgent' | 'moderate' | 'routine' | 'self-care';
  }>;
  differentialDiagnoses: string[];
  urgency: 'emergency' | 'urgent' | 'moderate' | 'routine' | 'self-care';
  recommendations: string[];
  nextSteps: string[];
  consensus: {
    kendallW: number;
    agreementLevel: 'strong' | 'moderate' | 'weak' | 'disagreement';
    primaryDiagnosis: string | null;
    consensusCategory: string;
    urgencyLevel: string;
    combinedRedFlags: string[];
    recommendedSpecialty: string | null;
    recommendedTests: string[];
    supervisorSummary: string;
    confidenceScore: number;
    requiresHumanReview: boolean;
  };
}
```

## Errores

La API utiliza códigos de estado HTTP estándar. Todos los errores siguen este formato:

```json
{
  "error": "Mensaje descriptivo del error",
  "details": {
    // Detalles adicionales (opcional)
  }
}
```

### Códigos de Estado

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| 200 | Success | Operación completada exitosamente |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Validación fallida |
| 401 | Unauthorized | No autenticado o sesión inválida |
| 403 | Forbidden | Sin permisos suficientes |
| 404 | Not Found | Recurso no encontrado |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

### Manejo de Errores

Ejemplo en TypeScript:

```typescript
async function apiCall(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();

      switch (response.status) {
        case 401:
          // Redirigir a login
          window.location.href = '/auth/login';
          throw new Error('No autenticado');
        case 429:
          // Implementar retry con backoff
          throw new Error('Rate limit excedido');
        case 500:
          // Mostrar error genérico
          throw new Error('Error del servidor');
        default:
          throw new Error(error.error || 'Error desconocido');
      }
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

## Webhooks

Los webhooks permiten a tu aplicación recibir eventos en tiempo real.

### Configuración

1. **Stripe Webhook**
   - Endpoint: `https://doctormx.com/api/webhooks/stripe`
   - Eventos: Pagos, suscripciones, facturas
   - Verificación: Firma HMAC del header `stripe-signature`

2. **Twilio Webhook**
   - Endpoint: `https://doctormx.com/api/webhooks/twilio`
   - Eventos: Mensajes SMS/WhatsApp entrantes
   - Verificación: URL de callback firmada

3. **WhatsApp Webhook**
   - Endpoint: `https://doctormx.com/api/webhooks/whatsapp`
   - Eventos: Mensajes de WhatsApp
   - Verificación: Token de verificación

### Implementación de Webhook

```typescript
// Ejemplo de endpoint de webhook
export async function POST(request: Request) {
  // Verificar firma
  const signature = request.headers.get('stripe-signature');
  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Procesar evento
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      // ... más casos
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
```

## SDKs y Herramientas

### JavaScript/TypeScript Client

```typescript
import { DoctorMXClient } from '@doctormx/sdk';

const client = new DoctorMXClient({
  baseUrl: 'https://doctormx.com/api',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

// Ejemplo de uso
const plans = await client.subscriptions.getPlans();
const appointment = await client.appointments.create({
  doctorId: '...',
  date: '2026-03-15',
  time: '14:30',
});
```

### Herramientas Recomendadas

- **Swagger UI**: Visualiza y prueba la API
  ```bash
  npx swagger-ui-server docs/api/openapi.yaml
  ```

- **OpenAPI Generator**: Genera clientes SDK
  ```bash
  openapi-generator-cli generate -i docs/api/openapi.yaml -g typescript-axios -o ./sdk
  ```

- **Postman Collection**: Importa la especificación OpenAPI

## Soporte

- **Email**: api@doctormx.com
- **Documentación**: https://docs.doctormx.com
- **Estado del Sistema**: https://status.doctormx.com

## Changelog

### v1.0.0 (2026-02-09)
- Lanzamiento inicial de la API
- Endpoints de citas, pacientes, médicos
- Consultas AI multi-especialista
- Sistema de cuestionarios adaptativos
- Pagos y suscripciones
- Webhooks de Stripe y Twilio
