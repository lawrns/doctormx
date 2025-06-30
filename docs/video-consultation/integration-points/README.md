# 🔗 **Integration Points Analysis**

## 📋 **Overview**
This section documents how video consultation features will integrate with the existing DoctorMX React/TypeScript/Supabase architecture.

## 🏗️ **Current Architecture Analysis**

### **Frontend Architecture (React/TypeScript)**
```
src/
├── components/          # Existing UI components
├── pages/              # Current page components  
├── features/           # Feature-based modules
├── services/           # Business logic services
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── styles/             # CSS architecture
└── utils/              # Utility functions
```

### **Backend Architecture (Supabase)**
```
Database Tables:
├── auth.users          # User authentication
├── profiles           # User profiles  
├── conversations      # AI conversation history
├── medical_records    # Medical data
└── [Additional tables needed for video consultation]
```

## 🎯 **Integration Points Identified**

### **1. Authentication & User Management**
**Current System**: Supabase Auth + profiles table  
**Integration Needed**:
- Extend user profiles for doctor/patient roles
- Add doctor verification status
- Implement role-based access control

**Files to Modify**:
- `src/contexts/AuthContext.tsx`
- `src/types/auth.ts`
- `src/services/auth/AuthService.ts`

### **2. Navigation & Routing**
**Current System**: React Router DOM  
**Integration Needed**:
- Add video consultation routes
- Implement protected routes for video calls
- Update navigation components

**Files to Modify**:
- `src/App.tsx`
- `src/components/navigation/`
- `src/pages/` (new video consultation pages)

### **3. UI Component Library**
**Current System**: Custom components + Tailwind CSS  
**Integration Needed**:
- Extend existing design system
- Create video-specific components
- Maintain responsive design patterns

**Files to Modify**:
- `src/components/ui/`
- `src/styles/responsive-fixes.css`
- `src/styles/` (new video consultation styles)

### **4. State Management**
**Current System**: React Context + XState  
**Integration Needed**:
- Video call state machines
- Appointment booking state
- Real-time connection state

**Files to Create**:
- `src/contexts/VideoCallContext.tsx`
- `src/contexts/AppointmentContext.tsx`
- `src/machines/videoCallMachine.ts`

### **5. API Services**
**Current System**: Supabase client + custom services  
**Integration Needed**:
- Video provider API integration
- Payment processing services
- Appointment management services

**Files to Create**:
- `src/services/video/AgoraService.ts`
- `src/services/appointments/AppointmentService.ts`
- `src/services/payments/PaymentService.ts`

## 📊 **Database Schema Extensions**

### **New Tables Required**
```sql
-- Doctor profiles and verification
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  cedula_profesional VARCHAR(20) UNIQUE NOT NULL,
  especialidad VARCHAR(100),
  verificado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Appointment management
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id),
  doctor_id UUID REFERENCES doctors(id),
  fecha_hora TIMESTAMP NOT NULL,
  estado VARCHAR(50) DEFAULT 'programada',
  agora_channel_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment tracking
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  amount DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Existing Tables to Extend**
```sql
-- Extend profiles table
ALTER TABLE profiles ADD COLUMN user_type VARCHAR(20) DEFAULT 'patient';
ALTER TABLE profiles ADD COLUMN doctor_id UUID REFERENCES doctors(id);
```

## 🎨 **UI/UX Integration Points**

### **Homepage Integration**
**File**: `src/pages/AIHomePage.tsx`  
**Integration**: Add new "Video Consultation" section  
**Location**: After "Servicios Especializados" section

### **Navigation Integration**
**Files**: 
- `src/components/navigation/Header.tsx`
- `src/components/navigation/MobileNav.tsx`

**New Menu Items**:
- "Consulta por Video"
- "Mis Citas" 
- "Dashboard Médico" (for doctors)

### **Responsive Design Integration**
**Files**:
- `src/styles/responsive-fixes.css`
- `src/mobile.css`

**New Responsive Classes**:
- `.video-consultation-*`
- `.appointment-booking-*`
- `.doctor-dashboard-*`

## 🔧 **Technical Dependencies**

### **New NPM Packages Required**
```json
{
  "agora-rtc-react": "^2.0.0",
  "agora-rtc-sdk-ng": "^4.19.0",
  "@stripe/stripe-js": "^2.1.0",
  "@stripe/react-stripe-js": "^2.3.0"
}
```

### **Environment Variables**
```env
# Video consultation
VITE_AGORA_APP_ID=your_agora_app_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Server-side (Netlify Functions)
AGORA_APP_CERTIFICATE=your_agora_certificate
STRIPE_SECRET_KEY=your_stripe_secret
```

### **Netlify Functions Required**
```
netlify/functions/
├── generate-agora-token.js
├── create-payment-intent.js
├── verify-doctor.js
└── send-appointment-notifications.js
```

## 🚀 **Implementation Strategy**

### **Phase 1: Foundation**
1. Extend authentication system
2. Create database schema
3. Set up basic routing

### **Phase 2: Core Features**
1. Implement video calling components
2. Create appointment booking system
3. Add payment processing

### **Phase 3: Integration**
1. Update homepage with video consultation section
2. Integrate with existing navigation
3. Apply responsive design patterns

### **Phase 4: Testing & Optimization**
1. Test integration points
2. Optimize performance
3. Validate user experience

## ⚠️ **Potential Integration Challenges**

### **Technical Challenges**
- **State Management Complexity**: Managing video call state alongside existing AI conversation state
- **Real-time Synchronization**: Coordinating video calls with appointment scheduling
- **Mobile Performance**: Ensuring video quality on mobile devices

### **UX Challenges**
- **Design Consistency**: Maintaining visual consistency with existing sophisticated design
- **User Flow Integration**: Seamlessly integrating video consultation into existing user journeys
- **Responsive Behavior**: Ensuring video interface works across all device sizes

### **Data Challenges**
- **Schema Migration**: Safely adding new tables without affecting existing data
- **Data Synchronization**: Keeping appointment data in sync across multiple services
- **Privacy Compliance**: Ensuring video data handling meets Mexican regulations

## 📋 **Integration Checklist**

### **Pre-Integration**
- [ ] Current architecture fully documented
- [ ] Integration points identified and validated
- [ ] Database migration plan created
- [ ] Backup and rollback strategy defined

### **During Integration**
- [ ] Feature flags implemented for gradual rollout
- [ ] Existing functionality preserved and tested
- [ ] New features integrated incrementally
- [ ] Performance monitoring in place

### **Post-Integration**
- [ ] Full regression testing completed
- [ ] User acceptance testing passed
- [ ] Performance benchmarks met
- [ ] Documentation updated

---

**Integration Owner**: Technical Architect  
**Last Updated**: June 30, 2025  
**Next Review**: After requirements analysis completion
