# DoctorMX Architecture Overview

## Application Entry Points
- **Main Entry**: `/src/index.tsx` - React app initialization with providers
- **HTML Entry**: `/index.html` - Vite entry point
- **API Functions**: `/netlify/functions/*` - Serverless endpoints

## Core Architecture Patterns

### Provider Hierarchy (Top to Bottom)
1. **React.StrictMode** - Development checks
2. **SimpleErrorBoundary** - Global error handling
3. **HelmetProvider** - SEO and meta tags
4. **QueryClientProvider** - React Query for API state
5. **ThemeProvider** - Dark/light mode support
6. **SupabaseProvider** - Database and auth client
7. **AuthProvider** - User authentication state
8. **DoctorAuthProvider** - Doctor-specific auth
9. **BrowserRouter** - Client-side routing
10. **ToastProvider** - Toast notifications
11. **QuestionnaireProvider** - Medical questionnaire state

### Key Architectural Decisions

#### Frontend Architecture
- **SPA with React Router** - Client-side routing
- **Component-based** - Reusable UI components
- **Feature-based organization** - Features contain their own components/services
- **Context for global state** - Avoid prop drilling
- **React Query for server state** - Caching and synchronization

#### Backend Architecture
- **Serverless Functions** - Netlify Functions for API
- **Supabase BaaS** - PostgreSQL, Auth, Storage
- **Direct OpenAI Integration** - AI responses
- **Edge Functions** - For performance-critical operations

#### AI Integration
- **Unified AI Service** - Centralized AI logic
- **Brain Integration** - Medical knowledge base
- **Conversation Intelligence** - Context-aware responses
- **Response Processing** - Formatting and quality control
- **Mexican Context Service** - Cultural adaptation

#### Security Architecture
- **Row Level Security (RLS)** - Database security
- **JWT Authentication** - Supabase Auth
- **Encryption Service** - For sensitive data
- **Environment Variables** - Secret management
- **CORS Configuration** - API security

## Data Flow
1. **User Input** → React Components
2. **Components** → Services/Hooks
3. **Services** → API (Netlify Functions or Supabase)
4. **API** → External Services (OpenAI, Supabase)
5. **Response** → State Management (React Query/Context)
6. **State** → UI Updates

## Key Services
- **AIService** - Handles AI doctor interactions
- **SupabaseClient** - Database operations
- **EncryptionService** - Data encryption
- **TelemedicineService** - Doctor consultations
- **OfflineService** - PWA offline support

## Deployment Architecture
- **Netlify Hosting** - Static site + functions
- **Supabase Cloud** - Managed PostgreSQL
- **CDN Distribution** - Global content delivery
- **Environment-based Config** - Dev/staging/prod