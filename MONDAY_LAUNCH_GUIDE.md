# 🚀 MONDAY LAUNCH GUIDE - Doctor.mx

**Target:** 1000+ doctor calls Monday  
**Goal:** 100+ signups in first week  
**Conversion Target:** 10-15%

---

## ✅ PRE-LAUNCH CHECKLIST (DO BEFORE MONDAY)

### 1. Update .env with Stripe Keys (CRITICAL)
```bash
# Add to your .env file:
STRIPE_SECRET_KEY=sk_test_51RyyhoRu6u7WKGc2b2hRBw9gTfTwVFc4Il6YU1r5mKnm8EvYmk4BZINelAi0ZTMgizCOnGU3wiblFpYRqvD0qezI009R3gNVlk
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RyyhoRu6u7WKGc2tQ0JwNcfz3f0JZi2RsQ2rG4SszLoS3EZsjagV2zRJWr5NeCzvkf4f2Frjhi0Mf7eYh4uANso0020pC3hzz
STRIPE_WEBHOOK_SECRET=whsec_991f12afcc2f935020c56e397499848ce1428db4c81ef91b8f6d6c9526e07f53

STRIPE_DOCTOR_MONTHLY_PRICE_ID=price_1RyymmRu6u7WKGc2ucvuuuiU
VITE_STRIPE_DOCTOR_MONTHLY_PRICE_ID=price_1RyymmRu6u7WKGc2ucvuuuiU
STRIPE_DOCTOR_YEARLY_PRICE_ID=price_1Rz0l3Ru6u7WKGc2w1vSiUha
VITE_STRIPE_DOCTOR_YEARLY_PRICE_ID=price_1Rz0l3Ru6u7WKGc2w1vSiUha
```

### 2. Switch to Optimized Landing Page
Update `src/main.jsx`:
```jsx
// Change this line:
import ConnectLanding from './pages/ConnectLanding.jsx';

// To this:
import ConnectLanding from './pages/ConnectLandingOptimized.jsx';
```

### 3. Create Stripe Webhook Endpoint
```bash
# In Stripe Dashboard:
1. Go to Developers > Webhooks
2. Add endpoint: https://doctor.mx/api/webhooks/stripe
3. Select events:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.paid
   - invoice.payment_failed
4. Copy webhook secret to .env
```

### 4. Create Stripe Promotion Code (1 Month Free)
```bash
# In Stripe Dashboard:
1. Go to Products > Coupons
2. Create coupon:
   - Name: "EARLYBIRD100"
   - Duration: Once
   - Amount off: 100%
   - Max redemptions: 100
3. Create promotion code: GRATIS1MES
4. Apply to monthly price
```

### 5. Install Missing Dependencies
```bash
npm install
```

### 6. Test the Flow End-to-End
```bash
# Start dev server
npm run dev

# Test:
1. Visit http://localhost:5174/connect
2. Click "Registrarme GRATIS Ahora"
3. Fill signup form with test data
4. Use test card: 4242 4242 4242 4242
5. Verify subscription created in database
```

---

## 📞 PHONE SCRIPT FOR CALLS

### Opening (15 seconds)
```
"Hola Dr./Dra. [Nombre], soy [Tu Nombre] de Doctor.mx. 

¿Tiene 2 minutos? Le quiero contar cómo puede recibir pacientes 
nuevos cada semana, referidos por inteligencia artificial, sin 
cambiar nada de su consultorio actual."
```

### Value Prop (30 seconds)
```
"Nuestro sistema funciona así:

1. Tenemos un doctor IA que analiza síntomas de pacientes 24/7
2. Cuando detecta que necesitan su especialidad, se los referimos
3. Usted los atiende como siempre (presencial o videollamada)
4. Le pagamos cada semana

Doctores como usted están ganando $15,000 a $30,000 pesos EXTRA 
por mes. La suscripción cuesta $499 al mes, pero los primeros 
100 doctores tienen 1 MES COMPLETAMENTE GRATIS."
```

### Objection Handling

**"No tengo tiempo para más pacientes"**
→ "Perfecto, usted controla cuántos acepta. Puede pausar en cualquier 
momento. Es ingreso EXTRA solo cuando le convenga."

**"¿Cómo sé que funciona?"**
→ "Ya tenemos 47 doctores registrados esta semana. Puedo conectarlo con 
el Dr. [Nombre] de [Ciudad] que ya está recibiendo pacientes. El mes 
gratis no tiene riesgo - si no le funciona, cancela sin costo."

**"¿Es legal?"**
→ "Totalmente. Cumplimos NOM-004 y NOM-024. Verificamos su cédula 
con la SEP. Las recetas son digitales con QR. Todo auditable."

**"Lo voy a pensar"**
→ "Perfecto Dr./Dra., pero le aviso que la oferta del mes gratis 
termina este domingo o cuando lleguemos a 100 doctores. Ya van 47. 
El registro toma 3 minutos. ¿Lo hacemos ahora mientras hablamos?"

### Closing
```
"¿Le parece bien si le envío el link de registro por WhatsApp?

Solo necesita:
- Su cédula profesional (foto)
- 3 minutos para llenar el formulario
- Una tarjeta para validar (no se cobra hasta el mes 2)

Lo verificamos en 24 horas y empieza a recibir pacientes de inmediato.

¿Cuál es su WhatsApp?"
```

---

## 💬 WHATSAPP MESSAGE TEMPLATE

After call, send:
```
Hola Dr./Dra. [Nombre]! 👋

Como platicamos, aquí está el link para registrarse en Doctor.mx:

🔗 https://doctor.mx/connect

✅ Registro: 3 minutos
✅ Verificación: 24 horas  
✅ Primer mes: GRATIS (código: GRATIS1MES)
✅ Cancela cuando quieras

Ya van [X]/100 doctores registrados esta semana.

¿Alguna duda? Respóndeme aquí 📱

[Tu Nombre]
Doctor.mx
```

---

## 📊 TRACKING & METRICS

### KPIs to Track Monday
```
Calls Made: _____ / 1000
Conversations (>1 min): _____ 
Links Sent: _____
Signups Started: _____
Signups Completed: _____
Conversion Rate: _____%

Target: 10-15% conversion = 100-150 signups
```

### Real-Time Dashboard
Check these every hour:
- Supabase: `SELECT COUNT(*) FROM doctors WHERE created_at > NOW() - INTERVAL '1 day'`
- Stripe: Dashboard > Customers (filter by today)
- Analytics: /connect page views

---

## 🎯 CONVERSION OPTIMIZATION

### Why Doctors Will Say Yes

1. **Zero Risk**
   - 1 month free
   - No permanence
   - Cancel anytime
   
2. **Immediate ROI**
   - 2 consultations = subscription paid
   - Average doctor: 20-30 referrals/week
   - Math is obvious
   
3. **Zero Effort**
   - Don't change anything
   - We bring the patients
   - They just consult

4. **Social Proof**
   - "47 doctors already joined"
   - Create FOMO
   - Scarcity (100 spots only)

### A/B Test Ideas
- Headline: "Recibe pacientes referidos por IA" vs "Gana $15-30k extra/mes"
- CTA: "Registrarme gratis" vs "Asegurar mi mes gratis"
- Urgency: "47/100 registrados" vs "Quedan 53 espacios"

---

## 🚨 COMMON ISSUES & FIXES

### Issue: Doctor says registration is too long
**Fix:** "Son solo 5 campos y una foto de su cédula. 3 minutos máximo."

### Issue: Doctor doesn't have cédula photo
**Fix:** "Sin problema, tómele una foto ahora con su celular y la sube."

### Issue: Doctor doesn't trust online payment
**Fix:** "No le cobramos nada el primer mes. La tarjeta es solo para validar. 
Puede usar una de débito. Cancela antes del día 30 si no le convence."

### Issue: Doctor wants to see platform first
**Fix:** "Por supuesto! Le envío un video de 2 minutos que muestra todo. 
Pero le aviso que los espacios con mes gratis se están acabando rápido."

---

## 📧 FOLLOW-UP SEQUENCE

### Same Day (4 hours after call)
```
Subject: Dr. [Nombre] - Su espacio de mes gratis

Hola Dr./Dra. [Nombre],

Gracias por la llamada de hoy. Le recuerdo que su espacio 
para el mes gratis está reservado hasta mañana.

Link de registro: https://doctor.mx/connect
Código: GRATIS1MES

Ya van [X]/100 doctores.

Saludos,
[Tu Nombre]
```

### Next Day (if no signup)
```
Subject: ⚠️ Quedan [Y] espacios - Doctor.mx

Dr./Dra. [Nombre],

Solo quedan [Y] espacios para el mes gratis.

¿Tiene alguna duda que le impide registrarse?
Responda este correo o llámeme: [Teléfono]

Última oportunidad para asegurar su mes sin costo.

[Tu Nombre]
```

### Day 3 (if still no signup)
```
Subject: Oferta terminó - pero tenemos algo para usted

Dr./Dra. [Nombre],

Los 100 espacios se llenaron, pero le podemos ofrecer 
50% de descuento el primer mes ($250 en vez de $499).

¿Le interesa? Solo tiene que responder "SÍ"

[Tu Nombre]
```

---

## 🎬 VIDEO DEMO SCRIPT (2 minutes)

Record screen + voice over:

**0:00-0:15** - Login to doctor dashboard
"Esto es lo que ve cuando se registra..."

**0:15-0:45** - Show patient referrals
"Aquí ve los pacientes que le hemos referido. 
Mire, este ya tiene síntomas analizados por IA..."

**0:45-1:15** - Show earnings
"Y aquí ve sus ingresos. Esta doctora lleva 2 semanas 
y ya ganó $4,200 pesos en consultas referidas..."

**1:15-1:45** - Show patient consultation
"Las consultas son así: paciente envía síntomas, 
IA analiza, si necesita su especialidad, usted lo atiende..."

**1:45-2:00** - CTA
"Regístrese en doctor.mx/connect y empiece hoy mismo. 
Primer mes gratis para los primeros 100 doctores."

---

## 📱 SOCIAL PROOF COLLECTION

### After First 10 Signups
Ask for testimonial:
```
"Dr./Dra. [Nombre], ¿nos puede dar su opinión del proceso 
de registro en 1-2 frases? La usaremos para convencer a 
más colegas."
```

### Use Testimonials Immediately
Add to /connect page:
```jsx
<div className="testimonial">
  <p>"Registro fue súper rápido. Ya recibí mi primer paciente."</p>
  <cite>- Dr. [Nombre], [Especialidad], [Ciudad]</cite>
</div>
```

---

## 🎯 SUCCESS METRICS

### End of Day Monday
- ✅ 1000 calls made
- ✅ 100+ signups started
- ✅ 50+ signups completed (50% completion rate)
- ✅ 30+ verified and paying by end of week

### End of Week 1
- ✅ 100+ verified doctors
- ✅ 80% activated (first patient accepted)
- ✅ Average $3,000 MXN earned per doctor
- ✅ 5+ testimonials collected

---

## 🔥 URGENCY TACTICS

### Real-Time Counter
Update /connect page every hour:
```jsx
<span>Ya van {currentCount}/100 doctores registrados</span>
```

### Screenshots
Post in WhatsApp Status:
- "Acaban de registrarse 3 doctores en la última hora"
- "Dr. [Name] de [City] acaba de unirse"
- "Quedan solo 37 espacios"

### Email Blast (End of Day)
To all who didn't signup:
```
Subject: ⏰ ÚLTIMA LLAMADA - 18 espacios restantes

[Name],

Solo quedan 18 de 100 espacios para el mes gratis.

Termina esta noche a las 11:59pm.

No pierda esta oportunidad.

REGISTRARSE: doctor.mx/connect
```

---

## 📞 TEAM ORGANIZATION

### Caller Team
- Person 1: Medicina General (300 calls)
- Person 2: Especialistas (300 calls)  
- Person 3: Dermatología/Psicología (200 calls)
- Person 4: Follow-up & Support (200 calls)

### Support Team
- 1 person monitoring signups
- 1 person answering WhatsApp
- 1 person handling verification

---

## ✅ FINAL PRE-LAUNCH CHECKLIST

- [ ] .env updated with Stripe keys
- [ ] Webhook configured in Stripe
- [ ] Promotion code created (GRATIS1MES)
- [ ] Landing page switched to optimized version
- [ ] Test registration flow completed
- [ ] Video demo recorded
- [ ] WhatsApp templates saved
- [ ] Call script printed
- [ ] Tracking spreadsheet ready
- [ ] Team briefed
- [ ] Coffee ready ☕

---

## 🚀 LAUNCH DAY TIMELINE

**8:00 AM** - Team meeting, final checks  
**9:00 AM** - Start calling (3 hours)  
**12:00 PM** - Lunch + check metrics  
**1:00 PM** - Continue calling (3 hours)  
**4:00 PM** - Follow-up WhatsApps  
**5:00 PM** - Email blast  
**6:00 PM** - Day wrap-up meeting

---

**Questions?** WhatsApp: [Your Number]  
**Emergencies?** Call: [Your Number]

**LET'S GET 100+ DOCTORS BY FRIDAY! 🚀**
