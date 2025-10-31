# Quick Implementation Guide - MVP Audit

**Branch:** `feature/mvp-audit-implementation`  
**Time to Complete:** 1-2 days

---

## ⚡ Immediate Actions (Do These First)

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `multer` - File upload handling
- `sharp` - Image optimization
- `@types/multer` - TypeScript types

**Note:** TypeScript errors in `chatWithImages.ts` will resolve after installation.

### 2. Run Database Migration
```bash
# Connect to your Supabase project
psql <your-supabase-connection-string>

# Run migration
\i database/migrations/027_mvp_audit_improvements.sql
```

**Or via Supabase Dashboard:**
1. Go to SQL Editor
2. Copy/paste contents of `027_mvp_audit_improvements.sql`
3. Run

### 3. Create Supabase Storage Bucket
```bash
# Via Supabase Dashboard:
1. Go to Storage
2. Create new bucket: "consult-images"
3. Set to Private
4. Add RLS policy:
   - Allow authenticated users to upload
   - Allow users to read their own images
```

**Or via SQL:**
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('consult-images', 'consult-images', false);
```

---

## 🔧 Fix TypeScript Errors

Create `server/types/express.d.ts`:
```typescript
import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}
```

---

## 🚀 Implementation Steps

### Step 1: Wire Up Chat API (30 minutes)

Update `server/index.ts`:
```typescript
import { chatWithImages, uploadMiddleware } from './providers/chatWithImages.js';

// Add route
app.post('/api/chat/message', 
  authMiddleware,  // Your existing auth middleware
  uploadMiddleware, 
  chatWithImages
);
```

### Step 2: Test Image Upload (15 minutes)

```bash
# Start server
npm run dev:api

# Test with curl
curl -X POST http://localhost:3000/api/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "message=Tengo dolor de cabeza" \
  -F "severity=5" \
  -F "images=@./test-image.jpg"
```

Expected response:
```json
{
  "consultId": 1,
  "messageId": 1,
  "careLevel": "SELFCARE",
  "redFlags": [],
  "visionFindings": [...],
  "aiReply": "...",
  "imagesProcessed": 1,
  "questionsRemaining": 4
}
```

### Step 3: Create Doctor Subscription Checkout (1 hour)

Create `server/providers/doctorCheckout.ts`:
```typescript
import Stripe from 'stripe';
import { supabaseAdmin } from '../lib/supabase.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createDoctorCheckout(req, res) {
  const doctorId = req.user.doctor_id;
  
  // Get plan
  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('code', 'DOC_DISCOVERY_M')
    .single();
  
  // Create Stripe price if needed
  const price = await stripe.prices.create({
    unit_amount: plan.price_mxn * 100,
    currency: 'mxn',
    recurring: { interval: 'month' },
    product_data: {
      name: plan.title,
      description: plan.description,
    },
  });
  
  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${process.env.BASE_URL}/connect/dashboard?success=true`,
    cancel_url: `${process.env.BASE_URL}/connect/subscription-setup?canceled=true`,
    metadata: { doctor_id: doctorId },
  });
  
  res.json({ url: session.url });
}
```

### Step 4: Handle Stripe Webhooks (30 minutes)

Create `server/providers/stripeWebhook.ts`:
```typescript
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await supabaseAdmin.from('subscriptions').insert({
        doctor_id: session.metadata.doctor_id,
        plan_id: 1, // Discovery plan
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        provider: 'stripe',
        provider_sub_id: session.subscription,
        provider_customer_id: session.customer,
      });
      break;
      
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await supabaseAdmin
        .from('subscriptions')
        .update({ 
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000),
        })
        .eq('provider_sub_id', subscription.id);
      break;
  }
  
  res.json({ received: true });
}
```

### Step 5: Update Doctor Directory Query (15 minutes)

Update `server/providers/doctorReferral.ts` or wherever you query doctors:
```typescript
// Old query
const { data: doctors } = await supabase
  .from('doctors')
  .select('*')
  .eq('license_status', 'verified');

// New query (with subscription filter)
const { data: doctors } = await supabase
  .from('doctors')
  .select(`
    *,
    subscriptions!inner(status, current_period_end)
  `)
  .eq('verified', true)
  .eq('license_status', 'verified')
  .eq('subscriptions.status', 'active')
  .gte('subscriptions.current_period_end', new Date().toISOString());
```

---

## 🎨 Frontend Updates

### 1. Add Image Upload to Chat (1 hour)

Update `src/pages/DoctorAI.jsx` or chat component:
```jsx
const [selectedImages, setSelectedImages] = useState([]);

function handleImageSelect(e) {
  const files = Array.from(e.target.files);
  setSelectedImages(files);
}

async function sendMessage() {
  const formData = new FormData();
  formData.append('message', message);
  formData.append('severity', severity);
  selectedImages.forEach(img => formData.append('images', img));
  
  const response = await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  
  const data = await response.json();
  // Handle response...
}

return (
  <>
    <input 
      type="file"
      accept="image/*"
      multiple
      onChange={handleImageSelect}
    />
    {/* Show image previews */}
    <div className="image-previews">
      {selectedImages.map((img, i) => (
        <img key={i} src={URL.createObjectURL(img)} />
      ))}
    </div>
  </>
);
```

### 2. Add Emergency Alert UI (30 minutes)

```jsx
{data.careLevel === 'ER' && (
  <div className="bg-red-600 text-white p-6 rounded-lg mb-4">
    <div className="flex items-center gap-3 mb-3">
      <AlertTriangle className="w-8 h-8" />
      <h3 className="text-xl font-bold">ATENCIÓN INMEDIATA REQUERIDA</h3>
    </div>
    <p className="mb-4">{data.message}</p>
    <div className="flex gap-3">
      <a href="tel:911" className="btn btn-white">
        Llamar 911
      </a>
      <button onClick={findNearestER}>
        Urgencias Cercanas
      </button>
    </div>
  </div>
)}
```

### 3. Add Doctor Subscription UI (1 hour)

Create `/src/pages/DoctorSubscriptionSetup.jsx`:
```jsx
export default function DoctorSubscriptionSetup() {
  async function handleSubscribe() {
    const response = await fetch('/api/payments/doctor-checkout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const { url } = await response.json();
    window.location.href = url;
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <h1>Suscripción de Doctor</h1>
        <div className="pricing-card">
          <h2>Plan Descubrimiento</h2>
          <p className="price">$499 MXN/mes</p>
          <ul>
            <li>✓ Perfil visible en directorio</li>
            <li>✓ Consultas ilimitadas</li>
            <li>✓ 15% comisión plataforma</li>
            <li>✓ Análisis básico</li>
          </ul>
          <button onClick={handleSubscribe}>
            Suscribirse Ahora
          </button>
        </div>
      </div>
    </Layout>
  );
}
```

---

## ✅ Testing Checklist

### Backend Tests
- [ ] Image upload works (JPEG, PNG, HEIC)
- [ ] Image optimization (file size reduced)
- [ ] Storage bucket upload successful
- [ ] Vision API returns analysis
- [ ] Red flag detection triggers ER response
- [ ] Free questions decrement correctly
- [ ] Payment required when questions = 0
- [ ] Doctor checkout creates Stripe session
- [ ] Webhook updates subscription status
- [ ] Directory only shows subscribed doctors

### Frontend Tests
- [ ] File input accepts images
- [ ] Image preview shows before upload
- [ ] Upload progress indicator
- [ ] Emergency alert displays for red flags
- [ ] Vision findings render correctly
- [ ] Doctor subscription page loads
- [ ] Stripe checkout redirects correctly
- [ ] Success/cancel redirects work

---

## 🌍 Production Deployment

### Environment Variables
Add to `.env.production`:
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# App
BASE_URL=https://doctor.mx
NODE_ENV=production
```

### CORS Configuration
```typescript
app.use(cors({
  origin: ['https://doctor.mx', 'https://www.doctor.mx'],
  credentials: true,
}));
```

### Supabase Redirect URLs
```
https://doctor.mx/auth/callback
https://doctor.mx/connect/verify
https://doctor.mx/connect/dashboard
```

---

## 📊 Success Metrics to Track

After deployment, monitor:
- Image upload success rate (target: > 95%)
- Vision API latency (target: < 5s)
- Red flag detection accuracy (review weekly)
- Doctor subscription conversion (target: 20+ in month 1)
- Patient payment conversion (target: 5% within 3 questions)

---

## 🆘 Troubleshooting

### "Cannot find module 'multer'"
```bash
npm install
```

### "Storage bucket not found"
Create bucket `consult-images` in Supabase Dashboard

### "Stripe webhook signature invalid"
1. Get webhook secret from Stripe Dashboard
2. Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### "Vision API quota exceeded"
1. Check OpenAI usage dashboard
2. Add rate limiting to image uploads

### "RLS policy error"
Check that policies are created:
```sql
SELECT * FROM pg_policies WHERE tablename IN ('consults', 'messages', 'message_images');
```

---

**Next:** Run `npm install` and start implementing! 🚀
